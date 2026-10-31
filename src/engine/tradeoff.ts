/**
 * tradeoff.ts — Pure trade-off preview for cutting or upgrading a moment.
 *
 * RULES (from spec §4.4):
 *  - cutMoment and upgradeMoment are PURE: return {before, after, ...}
 *  - never mutate the input plan (tested with deep-freeze in tests)
 *  - return freedMinor, tasksRemoved, vendorsAffected, warnings
 */

import type { Plan } from '../schemas/plan';
import type { AllocationResult } from './allocation';
import { allocateMomentBudget } from './allocation';

export interface TradeoffResult {
  before: AllocationResult;
  after: AllocationResult;
  /** Paise freed (positive) or additional cost (negative) after the change. */
  freedMinor: number;
  /** Task titles that would be removed. */
  tasksRemoved: string[];
  /** Vendor categories affected (status will downgrade). */
  vendorsAffected: string[];
  /** Human-readable warnings about the change. */
  warnings: string[];
}

/**
 * Preview the effect of removing a moment entirely.
 * Does NOT mutate the plan.
 */
export function cutMoment(plan: Plan, momentId: string): TradeoffResult {
  const moment = plan.moments.find((m) => m.id === momentId);
  if (!moment) throw new Error(`Moment ${momentId} not found in plan`);

  const before = allocateMomentBudget(plan.event, plan.moments, plan.costLines);

  // Build the "after" plan without this moment
  const afterMoments = plan.moments.filter((m) => m.id !== momentId);
  // Remove cost lines that exclusively serve this moment
  const afterCostLines = plan.costLines.filter(
    (cl) => !(cl.momentIds.length === 1 && cl.momentIds[0] === momentId),
  );

  const after = allocateMomentBudget(plan.event, afterMoments, afterCostLines);

  const tasksRemoved = plan.tasks
    .filter((t) => t.momentId === momentId)
    .map((t) => t.title);

  const vendorsAffected = plan.vendors
    .filter((v) => v.momentIds.includes(momentId) && v.momentIds.length === 1)
    .map((v) => v.category);

  const warnings: string[] = [];
  if (moment.importance === 5) {
    warnings.push(`"${moment.name}" is a signature moment (importance 5). Removing it will significantly affect the event's character.`);
  }
  if (moment.locked) {
    warnings.push(`"${moment.name}" is locked. Cutting it will override the lock.`);
  }
  if (tasksRemoved.length > 0) {
    warnings.push(`${String(tasksRemoved.length)} task(s) will be removed: ${tasksRemoved.join(', ')}.`);
  }
  if (vendorsAffected.length > 0) {
    warnings.push(`${String(vendorsAffected.length)} vendor(s) serve only this moment and will be affected: ${vendorsAffected.join(', ')}.`);
  }

  const beforeAlloc = before.allocations.find((a) => a.momentId === momentId);
  const freedMinor = beforeAlloc?.allocatedMinor ?? 0;

  return { before, after, freedMinor, tasksRemoved, vendorsAffected, warnings };
}

/**
 * Preview the effect of increasing a moment's budget by deltaMinor paise.
 * Does NOT mutate the plan.
 */
export function upgradeMoment(
  plan: Plan,
  momentId: string,
  deltaMinor: number,
): TradeoffResult {
  if (!Number.isInteger(deltaMinor) || deltaMinor <= 0) {
    throw new Error('deltaMinor must be a positive integer paise amount');
  }

  const moment = plan.moments.find((m) => m.id === momentId);
  if (!moment) throw new Error(`Moment ${momentId} not found in plan`);

  const before = allocateMomentBudget(plan.event, plan.moments, plan.costLines);

  // Add a new locked direct cost line for the upgrade delta
  const upgradeLine = {
    id: `upgrade-preview-${momentId}`,
    label: `Upgrade: ${moment.name}`,
    kind: 'direct' as const,
    amountMinor: deltaMinor,
    locked: true,
    status: 'estimate' as const,
    momentIds: [momentId],
    usageWeights: {},
  };

  const afterCostLines = [...plan.costLines, upgradeLine];
  const after = allocateMomentBudget(plan.event, plan.moments, afterCostLines);

  const warnings: string[] = [];
  if (after.feasibilityGap) {
    warnings.push(
      `Upgrade creates a budget shortfall of ₹${(after.feasibilityGap.shortfallMinor / 100).toFixed(2)}. ${after.feasibilityGap.explanation}`,
    );
  }

  return {
    before,
    after,
    freedMinor: -deltaMinor, // negative = additional cost
    tasksRemoved: [],
    vendorsAffected: [],
    warnings,
  };
}
