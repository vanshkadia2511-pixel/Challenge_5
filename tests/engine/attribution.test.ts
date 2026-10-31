/// <reference types="vitest/globals" />
import { attributeCosts } from '../../src/engine/attribution';
import type { Moment, CostLine } from '../../src/schemas/moment';

function makeMoment(id: string): Moment {
  return { id, name: `M-${id}`, importance: 3, energyTarget: 3, startMinute: 600, durationMin: 60, guestImpact: 0.5, locked: false, notes: '' };
}
function makeShared(id: string, amount: number, weights: Record<string, number> = {}): CostLine {
  return { id, label: id, kind: 'shared', amountMinor: amount, locked: false, status: 'estimate', momentIds: Object.keys(weights), usageWeights: weights };
}
function makeDirect(id: string, amount: number, momentId: string): CostLine {
  return { id, label: id, kind: 'direct', amountMinor: amount, locked: false, status: 'estimate', momentIds: [momentId], usageWeights: {} };
}

describe('attribution.ts', () => {
  it('shared attribution sums EXACTLY to the cost line amount', () => {
    const moments = [makeMoment('a'), makeMoment('b'), makeMoment('c')];
    const cl = makeShared('venue', 999_999, { a: 2, b: 3, c: 1 });
    const result = attributeCosts(moments, [cl], 100);
    const sharedSum = result.perMoment.reduce((s, m) => s + m.sharedCostMinor, 0);
    expect(sharedSum).toBe(999_999);
  });

  it('equal weights produce equal attribution (±1 paise for largest-remainder)', () => {
    const moments = [makeMoment('x'), makeMoment('y')];
    const cl = makeShared('decor', 1_000_000, { x: 1, y: 1 });
    const result = attributeCosts(moments, [cl], 100);
    const [mx, my] = result.perMoment;
    expect(Math.abs(mx!.sharedCostMinor - my!.sharedCostMinor)).toBeLessThanOrEqual(1);
    expect(mx!.sharedCostMinor + my!.sharedCostMinor).toBe(1_000_000);
  });

  it('direct cost is assigned to the correct moment', () => {
    const moments = [makeMoment('p'), makeMoment('q')];
    const cl = makeDirect('photo', 500_000, 'p');
    const result = attributeCosts(moments, [cl], 50);
    const mp = result.perMoment.find((m) => m.momentId === 'p')!;
    const mq = result.perMoment.find((m) => m.momentId === 'q')!;
    expect(mp.directCostMinor).toBe(500_000);
    expect(mq.directCostMinor).toBe(0);
  });

  it('totalSharedMinor equals sum of shared line amounts', () => {
    const moments = [makeMoment('a'), makeMoment('b')];
    const lines = [makeShared('venue', 300_000), makeShared('sound', 100_000)];
    const result = attributeCosts(moments, lines, 50);
    expect(result.totalSharedMinor).toBe(400_000);
  });

  it('handles zero guests without division-by-zero', () => {
    const moments = [makeMoment('m1')];
    const cl = makeShared('venue', 100_000, { m1: 1 });
    expect(() => attributeCosts(moments, [cl], 0)).not.toThrow();
  });

  it('does not mutate input arrays', () => {
    const moments = [makeMoment('a')];
    const costLines = [makeShared('venue', 100_000, { a: 1 })];
    const ms = JSON.stringify(moments);
    const cs = JSON.stringify(costLines);
    attributeCosts(moments, costLines, 100);
    expect(JSON.stringify(moments)).toBe(ms);
    expect(JSON.stringify(costLines)).toBe(cs);
  });
});
