/**
 * attribution.ts — Shared cost attribution across moments.
 *
 * RULES (from spec §4.3):
 *  - shared lines (venue, sound, decor, lighting) split across moments in
 *    proportion to usageWeights; remainder by largest-remainder method.
 *  - output: costPerMoment, costPerGuestPerMoment, share of total.
 */

import type { Moment, CostLine } from '../schemas/moment';

export interface MomentCostAttribution {
  momentId: string;
  momentName: string;
  /** Total shared cost attributed to this moment (paise). */
  sharedCostMinor: number;
  /** Direct cost lines explicitly assigned to this moment (paise). */
  directCostMinor: number;
  /** Total = shared + direct (paise). */
  totalCostMinor: number;
  /** Cost per guest for this moment (paise). */
  costPerGuestMinor: number;
  /** This moment's share of the total attributed cost (0–1). */
  shareOfTotal: number;
}

export interface AttributionResult {
  perMoment: MomentCostAttribution[];
  /** Sum of all sharedCostMinor — should equal sum of shared CostLine amounts. */
  totalSharedMinor: number;
  /** Sum of all directCostMinor. */
  totalDirectMinor: number;
}

/**
 * Attribute shared and direct cost lines to moments.
 * Pure function — no I/O, no mutation.
 */
export function attributeCosts(
  moments: readonly Moment[],
  costLines: readonly CostLine[],
  guests: number,
): AttributionResult {
  const sharedLines = costLines.filter((cl) => cl.kind === 'shared');
  const directLines = costLines.filter((cl) => cl.kind === 'direct');

  // Direct cost per moment: sum all direct lines assigned to each moment
  const directPerMoment = new Map<string, number>();
  for (const m of moments) directPerMoment.set(m.id, 0);
  for (const cl of directLines) {
    for (const mid of cl.momentIds) {
      directPerMoment.set(mid, (directPerMoment.get(mid) ?? 0) + cl.amountMinor);
    }
  }

  // Shared cost attribution per moment (largest-remainder)
  const sharedPerMoment = new Map<string, number>();
  for (const m of moments) sharedPerMoment.set(m.id, 0);

  for (const cl of sharedLines) {
    const attributed = attributeSharedLine(cl, moments);
    for (const [mid, amount] of attributed) {
      sharedPerMoment.set(mid, (sharedPerMoment.get(mid) ?? 0) + amount);
    }
  }

  const totalSharedMinor = sharedLines.reduce((s, cl) => s + cl.amountMinor, 0);
  const totalDirectMinor = directLines.reduce((s, cl) => s + cl.amountMinor, 0);
  const grandTotal = totalSharedMinor + totalDirectMinor;

  const perMoment: MomentCostAttribution[] = moments.map((m) => {
    const sharedCostMinor = sharedPerMoment.get(m.id) ?? 0;
    const directCostMinor = directPerMoment.get(m.id) ?? 0;
    const totalCostMinor = sharedCostMinor + directCostMinor;
    const safeGuests = Math.max(1, guests);
    return {
      momentId: m.id,
      momentName: m.name,
      sharedCostMinor,
      directCostMinor,
      totalCostMinor,
      costPerGuestMinor: Math.floor(totalCostMinor / safeGuests),
      shareOfTotal: grandTotal > 0 ? totalCostMinor / grandTotal : 0,
    };
  });

  return { perMoment, totalSharedMinor, totalDirectMinor };
}

/**
 * Distribute one shared CostLine across moments using usageWeights.
 * Returns a map of momentId → paise (using largest-remainder).
 */
function attributeSharedLine(
  cl: CostLine,
  moments: readonly Moment[],
): Map<string, number> {
  const result = new Map<string, number>();
  const total = cl.amountMinor;

  // Build raw weights: only moments listed in usageWeights (or all if empty)
  const hasWeights = Object.keys(cl.usageWeights).length > 0;
  const eligible = moments.filter(
    (m) => !hasWeights || m.id in cl.usageWeights,
  );

  if (eligible.length === 0) return result;

  const rawWeights = eligible.map((m) => ({
    id: m.id,
    weight: m.id in cl.usageWeights ? cl.usageWeights[m.id] : 1,
  }));

  const totalWeight = rawWeights.reduce((s, w) => s + w.weight, 0);
  if (totalWeight === 0) return result;

  // Exact shares
  const exactShares = rawWeights.map((w) => ({
    id: w.id,
    exact: (w.weight / totalWeight) * total,
  }));

  // Floor + largest-remainder
  const floors = exactShares.map((s) => ({
    id: s.id,
    floor: Math.floor(s.exact),
    remainder: s.exact - Math.floor(s.exact),
  }));

  const floorSum = floors.reduce((s, f) => s + f.floor, 0);
  let leftover = total - floorSum;

  const sorted = [...floors].sort((a, b) => b.remainder - a.remainder);
  const bonusSet = new Set(sorted.slice(0, leftover).map((f) => f.id));
  leftover = 0;

  for (const f of floors) {
    result.set(f.id, f.floor + (bonusSet.has(f.id) ? 1 : 0));
  }

  return result;
}
