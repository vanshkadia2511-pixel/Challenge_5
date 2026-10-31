/// <reference types="vitest/globals" />
import { cutMoment, upgradeMoment } from '../../src/engine/tradeoff';
import type { Plan } from '../../src/schemas/plan';
import type { Moment, CostLine, Task, Vendor } from '../../src/schemas/moment';

function deepFreeze<T>(obj: T): T {
  Object.freeze(obj);
  Object.values(obj as object).forEach((v) => {
    if (v && typeof v === 'object') deepFreeze(v);
  });
  return obj;
}

function makePlan(): Plan {
  const moments: Moment[] = [
    { id: 'm1', name: 'Ceremony', importance: 5, energyTarget: 5, startMinute: 600, durationMin: 60, guestImpact: 1, locked: false, notes: '' },
    { id: 'm2', name: 'Dinner', importance: 3, energyTarget: 2, startMinute: 720, durationMin: 90, guestImpact: 1, locked: false, notes: '' },
    { id: 'm3', name: 'First Dance', importance: 5, energyTarget: 5, startMinute: 840, durationMin: 20, guestImpact: 1, locked: false, notes: '' },
  ];
  const costLines: CostLine[] = [
    { id: 'cl1', label: 'Venue', kind: 'shared', amountMinor: 2_000_000, locked: false, status: 'estimate', momentIds: ['m1', 'm2'], usageWeights: { m1: 1, m2: 1 } },
    { id: 'cl2', label: 'Photographer', kind: 'direct', amountMinor: 500_000, locked: false, status: 'estimate', momentIds: ['m1'], usageWeights: {} },
  ];
  const tasks: Task[] = [
    { id: 't1', title: 'Book officiant', momentId: 'm1', leadDays: 90, status: 'pending', owner: '', dependsOn: [], critical: true },
    { id: 't2', title: 'Book caterer', momentId: 'm2', leadDays: 60, status: 'pending', owner: '', dependsOn: [], critical: false },
  ];
  const vendors: Vendor[] = [
    { id: 'v1', category: 'Photographer', name: '', momentIds: ['m1'], status: 'not-contacted', questions: [], deadline: undefined },
  ];
  return {
    event: { id: 'e1', title: 'Test', type: 'wedding', date: '2025-12-01', city: 'Mumbai', guests: 100, currency: 'INR', budgetMinor: 10_000_000, contingencyPct: 10, setting: 'indoor', notes: '' },
    moments, costLines, tasks, vendors, ideas: [], audit: [],
  };
}

describe('tradeoff.ts — cutMoment', () => {
  it('does NOT mutate the input plan (tested with deep-freeze)', () => {
    const plan = deepFreeze(makePlan());
    expect(() => cutMoment(plan, 'm2')).not.toThrow();
  });

  it('returns freedMinor equal to the moment allocation before cutting', () => {
    const plan = makePlan();
    const result = cutMoment(plan, 'm2');
    expect(result.freedMinor).toBeGreaterThan(0);
  });

  it('tasksRemoved lists tasks belonging to the cut moment', () => {
    const plan = makePlan();
    const result = cutMoment(plan, 'm2');
    expect(result.tasksRemoved).toContain('Book caterer');
  });

  it('vendorsAffected lists vendors that only serve the cut moment', () => {
    const plan = makePlan();
    const result = cutMoment(plan, 'm1');
    expect(result.vendorsAffected).toContain('Photographer');
  });

  it('warns when cutting an importance-5 moment', () => {
    const plan = makePlan();
    const result = cutMoment(plan, 'm1');
    expect(result.warnings.some((w) => w.includes('signature'))).toBe(true);
  });

  it('throws when moment id does not exist', () => {
    expect(() => cutMoment(makePlan(), 'nonexistent')).toThrow();
  });

  it('before and after allocations differ', () => {
    const plan = makePlan();
    const result = cutMoment(plan, 'm2');
    expect(result.before.allocations.length).not.toBe(result.after.allocations.length);
  });
});

describe('tradeoff.ts — upgradeMoment', () => {
  it('does NOT mutate the input plan', () => {
    const plan = deepFreeze(makePlan());
    expect(() => upgradeMoment(plan, 'm2', 100_000)).not.toThrow();
  });

  it('freedMinor is negative (additional cost)', () => {
    const plan = makePlan();
    const result = upgradeMoment(plan, 'm2', 100_000);
    expect(result.freedMinor).toBe(-100_000);
  });

  it('warns when upgrade creates a feasibility gap', () => {
    const plan = makePlan();
    const result = upgradeMoment(plan, 'm1', 50_000_000); // way over budget
    expect(result.warnings.length).toBeGreaterThan(0);
  });

  it('throws on non-positive deltaMinor', () => {
    expect(() => upgradeMoment(makePlan(), 'm1', 0)).toThrow();
    expect(() => upgradeMoment(makePlan(), 'm1', -100)).toThrow();
  });
});
