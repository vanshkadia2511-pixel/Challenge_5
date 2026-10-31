import { z } from 'zod';

export const EventTypeSchema = z.enum(['wedding', 'birthday', 'community']);
export type EventType = z.infer<typeof EventTypeSchema>;

export const SettingSchema = z.enum(['indoor', 'outdoor', 'hybrid']);
export type Setting = z.infer<typeof SettingSchema>;

export const CurrencySchema = z.enum(['INR']);
export type Currency = z.infer<typeof CurrencySchema>;

/**
 * Event — the top-level entity describing the celebration.
 * All money is stored as integer paise (never floats).
 */
export const EventSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1).max(200),
  type: EventTypeSchema,
  /** ISO 8601 date string e.g. "2025-03-15" */
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD'),
  city: z.string().min(1).max(200),
  guests: z.number().int().min(1).max(100_000),
  currency: CurrencySchema.default('INR'),
  /** Total budget in paise (integer). Never floats. */
  budgetMinor: z.number().int().min(0),
  /** Contingency as a percentage (0–100). Default 10. */
  contingencyPct: z.number().min(0).max(100).default(10),
  setting: SettingSchema,
  notes: z.string().max(2000).default(''),
});

export type Event = z.infer<typeof EventSchema>;
