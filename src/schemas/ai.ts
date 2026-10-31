import { z } from 'zod';

// ─── /api/interview ──────────────────────────────────────────────────────────

export const InterviewAnswersSchema = z.object({
  answers: z
    .array(z.string().max(1000))
    .length(5, 'Exactly 5 answers required'),
  eventType: z.enum(['wedding', 'birthday', 'community']),
});
export type InterviewAnswers = z.infer<typeof InterviewAnswersSchema>;

export const InterviewResultMomentSchema = z.object({
  name: z.string().min(1).max(200),
  importance: z.number().int().min(1).max(5),
  why: z.string().max(500),
});
export type InterviewResultMoment = z.infer<typeof InterviewResultMomentSchema>;

export const InterviewResultSchema = z.object({
  moments: z.array(InterviewResultMomentSchema).min(1).max(9),
  source: z.enum(['ai', 'fallback']),
});
export type InterviewResult = z.infer<typeof InterviewResultSchema>;

// ─── /api/ideas ──────────────────────────────────────────────────────────────

export const IdeasRequestSchema = z.object({
  momentId: z.string().min(1).max(100),
  momentName: z.string().min(1).max(200),
  eventType: z.enum(['wedding', 'birthday', 'community']),
  /** Guest count for context (not logged). */
  guests: z.number().int().min(1).max(100_000),
  /** Budget per moment in paise for context. */
  momentBudgetMinor: z.number().int().min(0),
});
export type IdeasRequest = z.infer<typeof IdeasRequestSchema>;

export const IdeaResultSchema = z.object({
  tier: z.enum(['simple', 'standard', 'special']),
  text: z.string().min(1).max(2000),
  /** Optional price band in paise. Always labelled an estimate. */
  estimateMinor: z.number().int().min(0).optional(),
});
export type IdeaResult = z.infer<typeof IdeaResultSchema>;

export const IdeasResultSchema = z.object({
  ideas: z.array(IdeaResultSchema).length(3),
  source: z.enum(['ai', 'fallback']),
});
export type IdeasResult = z.infer<typeof IdeasResultSchema>;

// ─── /api/parse ──────────────────────────────────────────────────────────────

export const ParseRequestSchema = z.object({
  brief: z.string().min(1).max(2000),
});
export type ParseRequest = z.infer<typeof ParseRequestSchema>;

export const ParseResultSchema = z.object({
  fields: z.object({
    title: z.string().max(200).optional(),
    type: z.enum(['wedding', 'birthday', 'community']).optional(),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    city: z.string().max(200).optional(),
    guests: z.number().int().min(1).optional(),
    budgetMinor: z.number().int().min(0).optional(),
    notes: z.string().max(2000).optional(),
  }),
  source: z.enum(['ai', 'fallback']),
});
export type ParseResult = z.infer<typeof ParseResultSchema>;

// ─── /api/assistant ──────────────────────────────────────────────────────────

export const AssistantRequestSchema = z.object({
  question: z.string().min(1).max(1000),
  /** Aggregated plan snapshot — counts and moment names only, not private details. */
  planSummary: z.object({
    eventType: z.enum(['wedding', 'birthday', 'community']),
    momentCount: z.number().int().min(0),
    momentNames: z.array(z.string().max(200)),
    totalBudgetMinor: z.number().int().min(0),
    guests: z.number().int().min(1),
  }),
});
export type AssistantRequest = z.infer<typeof AssistantRequestSchema>;

export const AssistantResultSchema = z.object({
  answer: z.string().min(1).max(3000),
  source: z.enum(['ai', 'fallback']),
});
export type AssistantResult = z.infer<typeof AssistantResultSchema>;
