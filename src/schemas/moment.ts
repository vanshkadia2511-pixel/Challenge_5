import { z } from 'zod';

/**
 * Moment — a named, ordered beat in the celebration.
 * Everything else (budget, tasks, vendors, ideas) attaches to moments.
 */
export const MomentSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(200),
  /** Host-assigned importance 1 (minor) – 5 (signature). */
  importance: z.number().int().min(1).max(5),
  /** Desired energy level 1 (calm) – 5 (peak). */
  energyTarget: z.number().int().min(1).max(5),
  /** Start time in minutes from midnight (0–1439). */
  startMinute: z.number().int().min(0).max(1439),
  /** Duration in minutes (1–720). */
  durationMin: z.number().int().min(1).max(720),
  /**
   * Guest-impact multiplier: proportion of guests who are actively involved
   * (0 = none, 1 = all). Used in budget-weight formula.
   */
  guestImpact: z.number().min(0).max(1),
  /** When true, this moment's allocation cannot be reduced by the engine. */
  locked: z.boolean().default(false),
  notes: z.string().max(2000).default(''),
});

export type Moment = z.infer<typeof MomentSchema>;

/**
 * CostLine — a single budget item, either direct (belongs to one moment)
 * or shared (attributed across multiple moments by usageWeights).
 */
export const CostLineSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1).max(200),
  kind: z.enum(['direct', 'shared']),
  /** Amount in paise (integer). Never floats. */
  amountMinor: z.number().int().min(0),
  locked: z.boolean().default(false),
  status: z.enum(['estimate', 'quoted', 'confirmed']).default('estimate'),
  /** Moment IDs this cost line serves. */
  momentIds: z.array(z.string()).default([]),
  /**
   * For shared lines: proportion each moment uses.
   * Keys are momentIds; values are positive numbers (need not sum to 1 —
   * the engine normalises them).
   */
  usageWeights: z.record(z.string(), z.number().positive()).default({}),
});

export type CostLine = z.infer<typeof CostLineSchema>;

/**
 * Task — a to-do item tied to a moment (or the event as a whole).
 */
export const TaskSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1).max(200),
  /** Moment this task belongs to. Null = event-level task. */
  momentId: z.string().nullable().default(null),
  /** How many days before the event this task is due. */
  leadDays: z.number().int().min(0),
  /** Computed ISO date string. Set by timeline engine. */
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  status: z.enum(['complete', 'due-soon', 'overdue', 'at-risk', 'impossible', 'pending']).default('pending'),
  owner: z.string().max(200).default(''),
  /** IDs of tasks that must complete before this one. */
  dependsOn: z.array(z.string()).default([]),
  critical: z.boolean().default(false),
});

export type Task = z.infer<typeof TaskSchema>;

/**
 * Vendor — an external supplier tied to one or more moments.
 */
export const VendorSchema = z.object({
  id: z.string().min(1),
  category: z.string().min(1).max(100),
  name: z.string().max(200).default(''),
  momentIds: z.array(z.string()).default([]),
  status: z.enum(['not-contacted', 'contacted', 'quoted', 'selected', 'contracted']).default('not-contacted'),
  questions: z.array(z.string().max(500)).default([]),
  /** ISO date string for when to have this vendor confirmed. */
  deadline: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

export type Vendor = z.infer<typeof VendorSchema>;

/**
 * Idea — a suggestion (from AI or the built-in fallback) for a moment.
 */
export const IdeaSchema = z.object({
  id: z.string().min(1),
  momentId: z.string().min(1),
  tier: z.enum(['simple', 'standard', 'special']),
  text: z.string().min(1).max(2000),
  /** Price estimate in paise. Absent = no estimate provided. */
  estimateMinor: z.number().int().min(0).optional(),
  source: z.enum(['ai', 'fallback']),
});

export type Idea = z.infer<typeof IdeaSchema>;
