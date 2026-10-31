import { z } from 'zod';
import { EventSchema } from './event';
import { MomentSchema, CostLineSchema, TaskSchema, VendorSchema, IdeaSchema } from './moment';

/**
 * AuditEntry — an immutable log of every change made to a plan.
 */
export const AuditEntrySchema = z.object({
  ts: z.number(), // Unix timestamp ms
  action: z.string().min(1).max(200),
  detail: z.string().max(1000).default(''),
});

export type AuditEntry = z.infer<typeof AuditEntrySchema>;

/**
 * AfterEventMomentLog — actuals and host reflection per moment.
 */
export const AfterEventMomentLogSchema = z.object({
  momentId: z.string(),
  actualSpendMinor: z.number().int().min(0).default(0),
  rating: z.enum(['keep', 'skip']).default('keep'),
  notes: z.string().max(2000).default(''),
});

export type AfterEventMomentLog = z.infer<typeof AfterEventMomentLogSchema>;

/**
 * AfterEventLog — complete post-celebration review.
 */
export const AfterEventLogSchema = z.object({
  completedAt: z.string().optional(),
  hostNotes: z.string().max(4000).default(''),
  moments: z.array(AfterEventMomentLogSchema).default([]),
});

export type AfterEventLog = z.infer<typeof AfterEventLogSchema>;

/**
 * Plan — the complete saved state for one event.
 * Stored in IndexedDB / localStorage as JSON.
 */
export const PlanSchema = z.object({
  event: EventSchema,
  moments: z.array(MomentSchema),
  costLines: z.array(CostLineSchema),
  tasks: z.array(TaskSchema),
  vendors: z.array(VendorSchema),
  ideas: z.array(IdeaSchema),
  audit: z.array(AuditEntrySchema),
  afterEvent: AfterEventLogSchema.optional(),
});

export type Plan = z.infer<typeof PlanSchema>;

/**
 * Validate a parsed JSON import.
 * Rejects __proto__, constructor and prototype keys before parsing.
 */
export function validatePlanImport(raw: unknown): Plan {
  const str = JSON.stringify(raw);
  if (!str) {
    throw new Error('Import rejected: invalid JSON input');
  }
  if (
    str.includes('__proto__') ||
    str.includes('"constructor"') ||
    str.includes('"prototype"')
  ) {
    throw new Error('Import rejected: forbidden key detected');
  }
  return PlanSchema.strict().parse(raw);
}
