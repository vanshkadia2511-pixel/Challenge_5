/**
 * allocation.ts — Moment Budget allocation using largest-remainder method.
 *
 * RULES (from spec §4.2):
 *  - usable = budget - contingency (contingency % of total budget, protected)
 *  - subtract locked cost lines → remaining pool
 *  - weight per moment = importance × (1 + guestImpact)
 *  - priority moments (importance === 5) get ×1.25 boost
 *  - allocate with largest-remainder so allocations sum EXACTLY to remaining
 *  - if remaining < 0 or impossible, return feasibilityGap (never hide it)
 */

import type { Event } from '../schemas/event';
import type { Moment, CostLine } from '../schemas/moment';

export interface MomentAllocation {
  momentId: string;
  momentName: string;
  allocatedMinor: number;
  weight: number;
  weightShare: number; // 0–1
}

export interface FeasibilityGap {
  shortfallMinor: number;
  explanation: string;
}

export interface AllocationResult {
  usableMinor: number;
  contingencyMinor: number;
  lockedMinor: number;
  remainingMinor: number;
  allocations: MomentAllocation[];
  feasibilityGap?: FeasibilityGap;
}

/**
 * Compute budget allocation across moments.
 * Pure function — no I/O, no mutation of inputs.
 */
export function allocateMomentBudget(
  event: Event,
  moments: readonly Moment[],
  costLines: readonly CostLine[],
): AllocationResult {
  const { budgetMinor, contingencyPct } = event;

  // Contingency is always protected
  const contingencyMinor = Math.round((budgetMinor * contingencyPct) / 100);
  const usableMinor = budgetMinor - contingencyMinor;

  // Sum locked cost lines (locked = must not change)
  const lockedMinor = costLines
    .filter((cl) => cl.locked)
    .reduce((sum, cl) => sum + cl.amountMinor, 0);

  const remainingMinor = usableMinor - lockedMinor;

  // Edge cases: no moments or no budget left
  if (moments.length === 0) {
    return { usableMinor, contingencyMinor, lockedMinor, remainingMinor, allocations: [] };
  }

  if (remainingMinor < 0) {
    return {
      usableMinor,
      contingencyMinor,
      lockedMinor,
      remainingMinor,
      allocations: moments.map((m) => ({
        momentId: m.id,
        momentName: m.name,
        allocatedMinor: 0,
        weight: computeWeight(m),
        weightShare: 0,
      })),
      feasibilityGap: {
        shortfallMinor: -remainingMinor,
        explanation: `Locked cost lines (₹${(lockedMinor / 100).toFixed(2)}) exceed the usable budget (₹${(usableMinor / 100).toFixed(2)}). Remove or unlock some cost lines to free up budget.`,
      },
    };
  }

  // Compute weights
  const weights = moments.map((m) => ({ moment: m, weight: computeWeight(m) }));
  const totalWeight = weights.reduce((s, w) => s + w.weight, 0);

  if (totalWeight === 0) {
    // All moments have zero weight — distribute equally
    const equalShare = Math.floor(remainingMinor / moments.length);
    const remainder = remainingMinor - equalShare * moments.length;
    return {
      usableMinor,
      contingencyMinor,
      lockedMinor,
      remainingMinor,
      allocations: moments.map((m, i) => ({
        momentId: m.id,
        momentName: m.name,
        allocatedMinor: equalShare + (i < remainder ? 1 : 0),
        weight: 0,
        weightShare: 1 / moments.length,
      })),
    };
  }

  // Largest-remainder allocation
  const exactShares = weights.map((w) => ({
    moment: w.moment,
    weight: w.weight,
    weightShare: w.weight / totalWeight,
    exact: (w.weight / totalWeight) * remainingMinor,
  }));

  const floors = exactShares.map((s) => ({
    ...s,
    floor: Math.floor(s.exact),
    remainder: s.exact - Math.floor(s.exact),
  }));

  const totalFloor = floors.reduce((s, f) => s + f.floor, 0);
  let leftover = remainingMinor - totalFloor; // must distribute leftover paise

  // Sort by remainder descending for largest-remainder distribution
  const sorted = [...floors].sort((a, b) => b.remainder - a.remainder);
  const bonusSet = new Set(sorted.slice(0, leftover).map((s) => s.moment.id));
  leftover = 0; // all distributed

  const allocations: MomentAllocation[] = floors.map((f) => ({
    momentId: f.moment.id,
    momentName: f.moment.name,
    allocatedMinor: f.floor + (bonusSet.has(f.moment.id) ? 1 : 0),
    weight: f.weight,
    weightShare: f.weightShare,
  }));

  // Verify exact sum (invariant)
  const allocSum = allocations.reduce((s, a) => s + a.allocatedMinor, 0);
  if (allocSum !== remainingMinor) {
    // Should never happen — defensive assertion
    throw new Error(
      `Allocation invariant violated: sum ${String(allocSum)} ≠ remaining ${String(remainingMinor)}`,
    );
  }

  return { usableMinor, contingencyMinor, lockedMinor, remainingMinor, allocations };
}

/** Weight formula from spec: importance × (1 + guestImpact), ×1.25 for importance === 5. */
function computeWeight(m: Moment): number {
  const base = m.importance * (1 + m.guestImpact);
  return m.importance === 5 ? base * 1.25 : base;
}
