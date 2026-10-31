/**
 * /api/assistant — Grounded plan assistant Q&A endpoint.
 *
 * SPEC REQUIREMENT (§6):
 * - /api/assistant: question + validated plan snapshot -> grounded answer.
 */

import type { VercelRequest, VercelResponse } from './_shared';
import { handleApiPreflight } from './_shared';
import { AssistantRequestSchema } from '../src/schemas/ai';
import { runAssistant } from '../src/ai/client';

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  const body = await handleApiPreflight(req, res, 'POST');
  if (body === null) return;

  try {
    const validated = AssistantRequestSchema.strict().parse(body);
    const result = await runAssistant(validated);
    res.status(200).json(result);
  } catch (err) {
    res.status(400).json({
      error: 'Invalid request parameters',
      details: (err as Error).message,
    });
  }
}
