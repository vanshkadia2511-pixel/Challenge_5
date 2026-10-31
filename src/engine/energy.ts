/**
 * energy.ts — Energy Curve engine.
 *
 * RULES (from spec §4.6):
 *  - day split into segments from moments + gaps
 *  - planned energy = moment energyTarget, 2 for gaps
 *  - flags with reason codes:
 *      LULL           — ≥ 90 min below 3 with no moment
 *      RUSHED         — transition < 10 min between high-energy moments
 *      UNSUPPORTED_PEAK — target 5 with no moment
 *      OVERLONG       — any block > 3 hours (180 min)
 *  - always output a text/table equivalent of the chart
 */

import type { Moment } from '../schemas/moment';

export type EnergyFlagCode = 'LULL' | 'RUSHED' | 'UNSUPPORTED_PEAK' | 'OVERLONG';

export interface EnergyFlag {
  code: EnergyFlagCode;
  /** Human-readable reason. */
  reason: string;
  /** Start minute of the flagged segment. */
  startMinute: number;
  /** End minute of the flagged segment. */
  endMinute: number;
}

export interface EnergySegment {
  startMinute: number;
  endMinute: number;
  durationMin: number;
  energyLevel: number;
  label: string;
  /** 'moment' | 'gap' | 'transition' */
  kind: 'moment' | 'gap' | 'transition';
  momentId?: string;
}

export interface EnergyCurveResult {
  segments: EnergySegment[];
  flags: EnergyFlag[];
  /** Text/table equivalent of the chart for screen readers. */
  textEquivalent: string;
}

const GAP_ENERGY = 2;
const LULL_THRESHOLD_ENERGY = 3;
const LULL_THRESHOLD_MINUTES = 90;
const TRANSITION_MIN = 10;
const OVERLONG_THRESHOLD = 180;
const HIGH_ENERGY_THRESHOLD = 4;

/**
 * Compute the Energy Curve for a day given its moments.
 * Moments must have valid startMinute and durationMin.
 * Pure function — no I/O.
 */
export function computeEnergyCurve(moments: readonly Moment[]): EnergyCurveResult {
  // Sort moments by startMinute
  const sorted = [...moments].sort((a, b) => a.startMinute - b.startMinute);

  const segments: EnergySegment[] = [];
  const flags: EnergyFlag[] = [];

  if (sorted.length === 0) {
    return { segments: [], flags: [], textEquivalent: 'No moments scheduled.' };
  }

  // Build segments: moments and gaps between them
  for (let i = 0; i < sorted.length; i++) {
    const m = sorted[i];
    const endMinute = m.startMinute + m.durationMin;

    // Moment segment
    segments.push({
      startMinute: m.startMinute,
      endMinute,
      durationMin: m.durationMin,
      energyLevel: m.energyTarget,
      label: m.name,
      kind: 'moment',
      momentId: m.id,
    });

    // Gap between this moment and the next
    if (i + 1 < sorted.length) {
      const next = sorted[i + 1];
      if (next.startMinute > endMinute) {
        segments.push(makeGap(endMinute, next.startMinute));
      }
    }
  }

  // ─── Flag: LULL — ≥ 90 min gap with energy < 3 ────────────────────────────
  for (const seg of segments) {
    if (seg.kind === 'gap' && seg.energyLevel < LULL_THRESHOLD_ENERGY && seg.durationMin >= LULL_THRESHOLD_MINUTES) {
      flags.push({
        code: 'LULL',
        reason: `${String(seg.durationMin)}-minute gap with no moment (energy ${String(seg.energyLevel)}). Consider adding a moment or activity to sustain guest engagement.`,
        startMinute: seg.startMinute,
        endMinute: seg.endMinute,
      });
    }
  }

  // ─── Flag: RUSHED — transition < 10 min between high-energy moments ────────
  for (let i = 0; i < sorted.length - 1; i++) {
    const cur = sorted[i];
    const nxt = sorted[i + 1];
    const gap = nxt.startMinute - (cur.startMinute + cur.durationMin);
    if (
      cur.energyTarget >= HIGH_ENERGY_THRESHOLD &&
      nxt.energyTarget >= HIGH_ENERGY_THRESHOLD &&
      gap >= 0 && gap < TRANSITION_MIN
    ) {
      flags.push({
        code: 'RUSHED',
        reason: `Only ${String(gap)} minutes between "${cur.name}" (energy ${String(cur.energyTarget)}) and "${nxt.name}" (energy ${String(nxt.energyTarget)}). Allow at least ${String(TRANSITION_MIN)} minutes for transitions.`,
        startMinute: cur.startMinute + cur.durationMin,
        endMinute: nxt.startMinute,
      });
    }
  }

  // ─── Flag: UNSUPPORTED_PEAK — energy-5 gap segment ───────────────────────
  // (Gap segments always have energy 2; a peak without a moment would require
  //  a moment with energyTarget 5. This flag fires when no moment has target 5
  //  but the host may expect a peak — detected via empty slots at key times.)
  // Per spec: "target 5 with no moment". We flag gap segments adjacent to
  // moments that have energyTarget 5 but the gap itself is unsupported.
  for (const seg of segments) {
    if (seg.kind === 'gap') {
      // If a gap is sandwiched between two energy-5 moments, it's an unsupported peak
      const before = sorted.find((m) => m.startMinute + m.durationMin === seg.startMinute);
      const after = sorted.find((m) => m.startMinute === seg.endMinute);
      if (before?.energyTarget === 5 && after?.energyTarget === 5) {
        flags.push({
          code: 'UNSUPPORTED_PEAK',
          reason: `Gap between "${before.name}" and "${after.name}" has no moment to sustain the peak energy. Consider adding a filler moment or reducing the gap.`,
          startMinute: seg.startMinute,
          endMinute: seg.endMinute,
        });
      }
    }
  }

  // ─── Flag: OVERLONG — any single block > 3 hours ─────────────────────────
  for (const seg of segments) {
    if (seg.durationMin > OVERLONG_THRESHOLD) {
      flags.push({
        code: 'OVERLONG',
        reason: `"${seg.label}" runs for ${String(seg.durationMin)} minutes (${(seg.durationMin / 60).toFixed(1)} hours). Blocks longer than 3 hours may exhaust guests. Consider breaking it up.`,
        startMinute: seg.startMinute,
        endMinute: seg.endMinute,
      });
    }
  }

  const textEquivalent = buildTextEquivalent(segments, flags);
  return { segments, flags, textEquivalent };
}

function makeGap(start: number, end: number): EnergySegment {
  return {
    startMinute: start,
    endMinute: end,
    durationMin: end - start,
    energyLevel: GAP_ENERGY,
    label: 'Gap',
    kind: 'gap',
  };
}

function minutesToTime(m: number): string {
  const h = Math.floor(m / 60).toString().padStart(2, '0');
  const min = (m % 60).toString().padStart(2, '0');
  return `${h}:${min}`;
}

function buildTextEquivalent(segments: EnergySegment[], flags: EnergyFlag[]): string {
  const rows = segments.map(
    (s) =>
      `${minutesToTime(s.startMinute)}–${minutesToTime(s.endMinute)} | ${s.label.padEnd(30)} | Energy: ${String(s.energyLevel)} | ${String(s.durationMin)} min`,
  );
  const header = 'Time          | Segment                        | Energy | Duration';
  const separator = '-'.repeat(header.length);
  const table = [header, separator, ...rows].join('\n');

  const flagLines =
    flags.length === 0
      ? 'No flags.'
      : flags.map((f) => `[${f.code}] ${f.reason}`).join('\n');

  return `Energy Curve\n${table}\n\nFlags:\n${flagLines}`;
}
