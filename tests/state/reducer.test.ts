/// <reference types="vitest/globals" />
import { appReducer, type AppState } from '../../src/state/reducer';
import { createPlanFromTemplate } from '../../src/state/storage';

function getInitialState(): AppState {
  return {
    plan: createPlanFromTemplate('wedding'),
    loading: false,
    activeMomentId: null,
    tradeoffTargetMomentId: null,
    errorMessage: null,
  };
}

describe('reducer.ts', () => {
  it('UPDATE_EVENT updates event title and appends audit log', () => {
    const state = getInitialState();
    const next = appReducer(state, {
      type: 'UPDATE_EVENT',
      event: { title: 'New Wedding Title' },
    });
    expect(next.plan.event.title).toBe('New Wedding Title');
    expect(next.plan.audit.length).toBeGreaterThan(state.plan.audit.length);
  });

  it('ADD_MOMENT appends a new moment', () => {
    const state = getInitialState();
    const count = state.plan.moments.length;
    const next = appReducer(state, {
      type: 'ADD_MOMENT',
      moment: {
        id: 'new-m',
        name: 'Late Night Chai',
        importance: 4,
        energyTarget: 3,
        startMinute: 1140,
        durationMin: 30,
        guestImpact: 0.9,
        locked: false,
        notes: '',
      },
    });
    expect(next.plan.moments.length).toBe(count + 1);
    expect(next.plan.moments[count]?.name).toBe('Late Night Chai');
  });

  it('DELETE_MOMENT removes moment and its exclusive tasks/costs', () => {
    const state = getInitialState();
    const momentId = state.plan.moments[0]?.id;
    if (!momentId) throw new Error('No moments');
    const next = appReducer(state, {
      type: 'DELETE_MOMENT',
      momentId,
    });
    expect(next.plan.moments.some((m) => m.id === momentId)).toBe(false);
  });

  it('TOGGLE_LOCK_MOMENT toggles the locked boolean', () => {
    const state = getInitialState();
    const momentId = state.plan.moments[0]?.id;
    if (!momentId) throw new Error('No moments');
    const wasLocked = state.plan.moments[0]?.locked;
    const next = appReducer(state, {
      type: 'TOGGLE_LOCK_MOMENT',
      momentId,
    });
    expect(next.plan.moments[0]?.locked).toBe(!wasLocked);
  });

  it('APPLY_CUT_MOMENT removes target moment and records audit', () => {
    const state = getInitialState();
    const momentId = state.plan.moments[1]?.id;
    if (!momentId) throw new Error('No moments');
    const next = appReducer(state, {
      type: 'APPLY_CUT_MOMENT',
      momentId,
    });
    expect(next.plan.moments.some((m) => m.id === momentId)).toBe(false);
    expect(next.plan.audit[next.plan.audit.length - 1]?.action).toBe('APPLY_CUT_MOMENT');
  });

  it('APPLY_UPGRADE_MOMENT adds a locked direct cost line', () => {
    const state = getInitialState();
    const momentId = state.plan.moments[0]?.id;
    if (!momentId) throw new Error('No moments');
    const costCount = state.plan.costLines.length;
    const next = appReducer(state, {
      type: 'APPLY_UPGRADE_MOMENT',
      momentId,
      deltaMinor: 500000,
    });
    expect(next.plan.costLines.length).toBe(costCount + 1);
    const addedLine = next.plan.costLines[costCount];
    expect(addedLine?.amountMinor).toBe(500000);
    expect(addedLine?.locked).toBe(true);
  });
});
