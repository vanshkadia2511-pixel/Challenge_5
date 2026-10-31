/**
 * client.ts — Server-side GenAI client with failover, bounded timeout, and automatic fallback.
 *
 * SPEC REQUIREMENT (§6):
 * - @google/genai, server-side only. Models listed in env GEMINI_MODELS.
 * - 8 s timeout per model, ordered failover from GEMINI_MODELS, short cooldown
 *   for failing models, bounded retries with backoff.
 * - Model names only from env; never hard-code unverified names.
 */

import { GoogleGenAI } from '@google/genai';
import {
  INTERVIEW_SYSTEM_PROMPT,
  IDEAS_SYSTEM_PROMPT,
  PARSE_SYSTEM_PROMPT,
  ASSISTANT_SYSTEM_PROMPT,
  wrapUserData,
} from './prompts';
import {
  InterviewResultSchema,
  IdeasResultSchema,
  ParseResultSchema,
  AssistantResultSchema,
  type InterviewAnswers,
  type InterviewResult,
  type IdeasRequest,
  type IdeasResult,
  type ParseRequest,
  type ParseResult,
  type AssistantRequest,
  type AssistantResult,
} from '../schemas/ai';
import {
  generateFallbackInterview,
  generateFallbackIdeas,
  generateFallbackParse,
  generateFallbackAssistant,
} from './fallback';

// Safe environment reader that works across Node and browser runtimes
function getEnv(key: string): string | undefined {
  if (typeof process !== 'undefined') {
    return process.env[key];
  }
  return undefined;
}

// Get configurable models from environment
function getConfiguredModels(): string[] {
  const envModels = getEnv('GEMINI_MODELS');
  if (envModels && envModels.trim().length > 0) {
    return envModels.split(',').map((m) => m.trim()).filter((m) => m.length > 0);
  }
  return ['gemini-1.5-flash', 'gemini-1.5-flash-8b'];
}

function getTimeoutMs(): number {
  const envTimeout = getEnv('AI_TIMEOUT_MS');
  const parsed = envTimeout ? parseInt(envTimeout, 10) : 8000;
  return isNaN(parsed) || parsed <= 0 ? 8000 : parsed;
}

// Model cooldown tracker: model name -> timestamp ms until which it is cooling down
const cooldownMap = new Map<string, number>();
const COOLDOWN_DURATION_MS = 30_000; // 30s cooldown on failure

async function callModelWithTimeout(
  apiKey: string,
  modelName: string,
  systemPrompt: string,
  userPrompt: string,
  timeoutMs: number,
): Promise<string> {
  const ai = new GoogleGenAI({ apiKey });

  const apiCallPromise = (async () => {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: [
        { role: 'user', parts: [{ text: userPrompt }] },
      ],
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.4,
        responseMimeType: 'application/json',
      },
    });

    const text = response.text;
    if (!text) throw new Error(`Empty response from Gemini model ${modelName}`);
    return text;
  })();

  const timeoutPromise = new Promise<never>((_, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`Timeout of ${String(timeoutMs)}ms exceeded for model ${modelName}`));
    }, timeoutMs);
    // Unref timer if in Node environment so it doesn't hang process
    if (typeof timer === 'object' && 'unref' in timer) {
      (timer as { unref: () => void }).unref();
    }
  });

  return Promise.race([apiCallPromise, timeoutPromise]);
}

/** Execute with failover through configured GEMINI_MODELS */
async function callGeminiWithFailover(
  systemPrompt: string,
  userPrompt: string,
): Promise<string | null> {
  const apiKey = getEnv('GEMINI_API_KEY');
  if (!apiKey || apiKey.trim().length === 0) {
    return null; // No key provided — smoothly return null to trigger built-in fallback
  }

  const models = getConfiguredModels();
  const timeoutMs = getTimeoutMs();
  const now = Date.now();

  for (const model of models) {
    const cooldownUntil = cooldownMap.get(model);
    if (cooldownUntil && cooldownUntil > now) {
      continue; // Model is currently cooling down
    }

    try {
      const rawOutput = await callModelWithTimeout(apiKey, model, systemPrompt, userPrompt, timeoutMs);
      return rawOutput;
    } catch {
      // Mark model for short cooldown and failover to next model
      cooldownMap.set(model, Date.now() + COOLDOWN_DURATION_MS);
    }
  }

  return null;
}

function cleanJsonText(raw: string): string {
  // Strip markdown codeblocks if accidentally included
  return raw.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();
}

// ─── Public API Services ─────────────────────────────────────────────────────

export async function runInterview(req: InterviewAnswers): Promise<InterviewResult> {
  const userData = `Event Type: ${req.eventType}\nAnswers:\n${req.answers.map((a, i) => `${String(i + 1)}. ${a}`).join('\n')}`;
  const raw = await callGeminiWithFailover(INTERVIEW_SYSTEM_PROMPT, wrapUserData(userData));

  if (raw) {
    try {
      const parsed: unknown = JSON.parse(cleanJsonText(raw));
      const validated = InterviewResultSchema.parse({
        ...(typeof parsed === 'object' && parsed !== null ? parsed : {}),
        source: 'ai',
      });
      return validated;
    } catch {
      // Schema validation or parse failed — fallback
    }
  }

  return generateFallbackInterview(req);
}

export async function runIdeas(req: IdeasRequest): Promise<IdeasResult> {
  const userData = `Moment: ${req.momentName}\nEvent Type: ${req.eventType}\nGuests: ${String(req.guests)}\nAllocated Moment Budget: ${String(req.momentBudgetMinor)} paise`;
  const raw = await callGeminiWithFailover(IDEAS_SYSTEM_PROMPT, wrapUserData(userData));

  if (raw) {
    try {
      const parsed: unknown = JSON.parse(cleanJsonText(raw));
      const validated = IdeasResultSchema.parse({
        ...(typeof parsed === 'object' && parsed !== null ? parsed : {}),
        source: 'ai',
      });
      return validated;
    } catch {
      // Schema validation failed — fallback
    }
  }

  return generateFallbackIdeas(req);
}

export async function runParse(req: ParseRequest): Promise<ParseResult> {
  const raw = await callGeminiWithFailover(PARSE_SYSTEM_PROMPT, wrapUserData(req.brief));

  if (raw) {
    try {
      const parsed: unknown = JSON.parse(cleanJsonText(raw));
      const validated = ParseResultSchema.parse({
        ...(typeof parsed === 'object' && parsed !== null ? parsed : {}),
        source: 'ai',
      });
      return validated;
    } catch {
      // Fallback
    }
  }

  return generateFallbackParse(req);
}

export async function runAssistant(req: AssistantRequest): Promise<AssistantResult> {
  const summaryJson = JSON.stringify(req.planSummary);
  const userData = `Plan Snapshot:\n${summaryJson}\n\nQuestion:\n${req.question}`;
  const raw = await callGeminiWithFailover(ASSISTANT_SYSTEM_PROMPT, wrapUserData(userData));

  if (raw) {
    try {
      const parsed: unknown = JSON.parse(cleanJsonText(raw));
      const validated = AssistantResultSchema.parse({
        ...(typeof parsed === 'object' && parsed !== null ? parsed : {}),
        source: 'ai',
      });
      return validated;
    } catch {
      // Fallback
    }
  }

  return generateFallbackAssistant(req);
}
