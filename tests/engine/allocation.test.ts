/// <reference types="vitest/globals" />
import { allocateMomentBudget } from '../../src/engine/allocation';
import type { Event } from '../../src/schemas/event';
import type { Moment, CostLine } from '../../src/schemas/moment';

function makeEvent(overrides: Partial<Event> = {}): Event {
  return {
    id: 'e1', title: 'Test', type: 'wedding', date: '2025-12-01',
    city: 'Mumbai', guests: 100, currency: 'INR',
    budgetMinor: 10_000_000, contingencyPct: 10, setting: 'indoor', notes: '',
    ...overrides,
  };
}
function makeMoment(id: string, importance: number, guestImpact = 0.5): Moment {
  return { id, name: `Moment ${id}`, importance, energyTarget: 3, startMinute: 600, durationMin: 60, guestImpact, locked: false, notes: '' };
}
function makeCostLine(id: string, amountMinor: number, locked = false): CostLine {
  return { id, label: `Cost ${id}`, kind: 'direct', amountMinor, locked, status: 'estimate', momentIds: [], usageWeights: {} };
}

describe('allocation.ts', () => {
  it('allocations sum EXACTLY to remaining budget', () => {
    const event = makeEvent();
    const moments = [makeMoment('m1', 5), makeMoment('m2', 3), makeMoment('m3', 2), makeMoment('m4', 4)];
    const result = allocateMomentBudget(event, moments, []);
    const allocSum = result.allocations.reduce((s, a) => s + a.allocatedMinor, 0);
    expect(allocSum).toBe(result.remainingMinor);
  });

  it('contingency is deducted from usable pool', () => {
    const event = makeEvent({ budgetMinor: 1_000_000, contingencyPct: 10 });
    const result = allocateMomentBudget(event, [makeMoment('m1', 3)], []);
    expect(result.contingencyMinor).toBe(100_000);
    expect(result.usableMinor).toBe(900_000);
  });

  it('locked cost lines are deducted before allocation', () => {
    const event = makeEvent({ budgetMinor: 1_000_000, contingencyPct: 0 });
    const result = allocateMomentBudget(event, [makeMoment('m1', 3)], [makeCostLine('lk', 200_000, true)]);
    expect(result.lockedMinor).toBe(200_000);
    expect(result.remainingMinor).toBe(800_000);
  });

  it('returns feasibilityGap when locked lines exceed usable budget', () => {
    const event = makeEvent({ budgetMinor: 1_000_000, contingencyPct: 0 });
    const result = allocateMomentBudget(event, [makeMoment('m1', 3)], [makeCostLine('ov', 2_000_000, true)]);
    expect(result.feasibilityGap).toBeDefined();
    expect(result.feasibilityGap!.shortfallMinor).toBe(1_000_000);
  });

  it('returns empty allocations when no moments', () => {
    expect(allocateMomentBudget(makeEvent(), [], []).allocations).toHaveLength(0);
  });

  it('handles zero budget', () => {
    const result = allocateMomentBudget(makeEvent({ budgetMinor: 0 }), [makeMoment('m1', 3)], []);
    expect(result.allocations.reduce((s, a) => s + a.allocatedMinor, 0)).toBe(0);
  });

  it('importance-5 gets 1.25x weight boost vs importance-4', () => {
    const event = makeEvent({ budgetMinor: 1_000_000, contingencyPct: 0 });
    const result = allocateMomentBudget(event, [makeMoment('pri', 5, 0), makeMoment('nrm', 4, 0)], []);
    const pri = result.allocations.find((a) => a.momentId === 'pri')!;
    const nrm = result.allocations.find((a) => a.momentId === 'nrm')!;
    expect(pri.allocatedMinor).toBeGreaterThan(nrm.allocatedMinor);
  });

  it('single moment gets all remaining budget', () => {
    const event = makeEvent({ budgetMinor: 1_000_000, contingencyPct: 10 });
    const result = allocateMomentBudget(event, [makeMoment('m1', 3)], []);
    expect(result.allocations[0]!.allocatedMinor).toBe(result.remainingMinor);
  });

  it('handles 9 moments with large budget without overflow', () => {
    const event = makeEvent({ budgetMinor: 1_000_000_000_000, contingencyPct: 10 });
    const moments = Array.from({ length: 9 }, (_, i) => makeMoment(`m${String(i)}`, 3));
    const result = allocateMomentBudget(event, moments, []);
    const allocSum = result.allocations.reduce((s, a) => s + a.allocatedMinor, 0);
    expect(allocSum).toBe(result.remainingMinor);
  });

  it('does not mutate input moments', () => {
    const moments = [makeMoment('m1', 3)];
    const snapshot = JSON.stringify(moments);
    allocateMomentBudget(makeEvent(), moments, []);
    expect(JSON.stringify(moments)).toBe(snapshot);
  });
});
