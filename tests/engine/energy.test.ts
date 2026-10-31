/// <reference types="vitest/globals" />
import { computeEnergyCurve } from '../../src/engine/energy';
import type { Moment } from '../../src/schemas/moment';

function makeMoment(id: string, start: number, dur: number, energyTarget: number): Moment {
  return { id, name: `M-${id}`, importance: 3, energyTarget, startMinute: start, durationMin: dur, guestImpact: 0.5, locked: false, notes: '' };
}

describe('energy.ts', () => {
  it('returns no flags for a healthy, well-spaced schedule', () => {
    const moments = [
      makeMoment('a', 600, 60, 3),
      makeMoment('b', 720, 60, 3),
      makeMoment('c', 840, 60, 3),
    ];
    const result = computeEnergyCurve(moments);
    // No LULL (gaps are 60 min < 90), no RUSHED, no OVERLONG
    expect(result.flags.filter((f) => f.code === 'LULL')).toHaveLength(0);
    expect(result.flags.filter((f) => f.code === 'RUSHED')).toHaveLength(0);
  });

  it('flags LULL for a gap >= 90 minutes with no moment', () => {
    const moments = [
      makeMoment('a', 600, 30, 2), // ends at 630
      makeMoment('b', 750, 30, 2), // starts at 750 — 120 min gap
    ];
    const result = computeEnergyCurve(moments);
    expect(result.flags.some((f) => f.code === 'LULL')).toBe(true);
  });

  it('does NOT flag LULL for a gap < 90 minutes', () => {
    const moments = [
      makeMoment('a', 600, 30, 2), // ends 630
      makeMoment('b', 680, 30, 2), // 50 min gap
    ];
    const result = computeEnergyCurve(moments);
    expect(result.flags.some((f) => f.code === 'LULL')).toBe(false);
  });

  it('flags RUSHED when transition < 10 min between high-energy moments', () => {
    const moments = [
      makeMoment('a', 600, 60, 4), // ends 660
      makeMoment('b', 665, 60, 5), // 5 min gap — RUSHED
    ];
    const result = computeEnergyCurve(moments);
    expect(result.flags.some((f) => f.code === 'RUSHED')).toBe(true);
  });

  it('does NOT flag RUSHED when transition >= 10 min', () => {
    const moments = [
      makeMoment('a', 600, 60, 4), // ends 660
      makeMoment('b', 675, 60, 5), // 15 min gap — OK
    ];
    const result = computeEnergyCurve(moments);
    expect(result.flags.some((f) => f.code === 'RUSHED')).toBe(false);
  });

  it('flags OVERLONG for a moment > 180 minutes', () => {
    const moments = [makeMoment('a', 600, 200, 2)]; // 200 min
    const result = computeEnergyCurve(moments);
    expect(result.flags.some((f) => f.code === 'OVERLONG')).toBe(true);
  });

  it('does NOT flag OVERLONG for a moment <= 180 minutes', () => {
    const moments = [makeMoment('a', 600, 180, 2)];
    const result = computeEnergyCurve(moments);
    expect(result.flags.some((f) => f.code === 'OVERLONG')).toBe(false);
  });

  it('returns empty results for an empty moments array', () => {
    const result = computeEnergyCurve([]);
    expect(result.segments).toHaveLength(0);
    expect(result.flags).toHaveLength(0);
  });

  it('always produces a non-empty text equivalent', () => {
    const moments = [makeMoment('a', 600, 60, 3)];
    const result = computeEnergyCurve(moments);
    expect(result.textEquivalent.length).toBeGreaterThan(0);
  });

  it('segments cover the full span from first start to last end', () => {
    const moments = [makeMoment('a', 600, 60, 3), makeMoment('b', 780, 60, 4)];
    const result = computeEnergyCurve(moments);
    expect(result.segments[0]!.startMinute).toBe(600);
    expect(result.segments[result.segments.length - 1]!.endMinute).toBe(840);
  });
});
