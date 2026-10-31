/**
 * reducer.ts — Single deterministic application reducer for KSHAN.
 *
 * SPEC REQUIREMENT (§1):
 * State: one reducer + context. No second state library.
 */

import type { Plan, AuditEntry, AfterEventLog } from '../schemas/plan';
import type { Event } from '../schemas/event';
import type { Moment, CostLine, Task, Vendor, Idea } from '../schemas/moment';

export interface AppState {
  plan: Plan;
  loading: boolean;
  activeMomentId: string | null;
  tradeoffTargetMomentId: string | null;
  errorMessage: string | null;
}

export type Action =
  | { type: 'SET_PLAN'; plan: Plan }
  | { type: 'SET_LOADING'; loading: boolean }
  | { type: 'SET_ERROR'; message: string | null }
  | { type: 'SET_ACTIVE_MOMENT'; momentId: string | null }
  | { type: 'SET_TRADEOFF_TARGET'; momentId: string | null }
  | { type: 'UPDATE_EVENT'; event: Partial<Event> }
  | { type: 'ADD_MOMENT'; moment: Moment }
  | { type: 'UPDATE_MOMENT'; moment: Moment }
  | { type: 'DELETE_MOMENT'; momentId: string }
  | { type: 'REORDER_MOMENTS'; momentIds: string[] }
  | { type: 'TOGGLE_LOCK_MOMENT'; momentId: string }
  | { type: 'ADD_COST_LINE'; costLine: CostLine }
  | { type: 'UPDATE_COST_LINE'; costLine: CostLine }
  | { type: 'DELETE_COST_LINE'; costLineId: string }
  | { type: 'ADD_TASK'; task: Task }
  | { type: 'UPDATE_TASK'; task: Task }
  | { type: 'DELETE_TASK'; taskId: string }
  | { type: 'ADD_VENDOR'; vendor: Vendor }
  | { type: 'UPDATE_VENDOR'; vendor: Vendor }
  | { type: 'DELETE_VENDOR'; vendorId: string }
  | { type: 'ADD_IDEA'; idea: Idea }
  | { type: 'DISMISS_IDEA'; ideaId: string }
  | { type: 'APPLY_CUT_MOMENT'; momentId: string }
  | { type: 'APPLY_UPGRADE_MOMENT'; momentId: string; deltaMinor: number }
  | { type: 'UPDATE_AFTER_EVENT'; afterEvent: AfterEventLog };

function createAudit(action: string, detail: string): AuditEntry {
  return {
    ts: Date.now(),
    action,
    detail,
  };
}

export function appReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_PLAN':
      return {
        ...state,
        plan: action.plan,
        loading: false,
        errorMessage: null,
      };

    case 'SET_LOADING':
      return { ...state, loading: action.loading };

    case 'SET_ERROR':
      return { ...state, errorMessage: action.message };

    case 'SET_ACTIVE_MOMENT':
      return { ...state, activeMomentId: action.momentId };

    case 'SET_TRADEOFF_TARGET':
      return { ...state, tradeoffTargetMomentId: action.momentId };

    case 'UPDATE_EVENT': {
      const updatedEvent: Event = { ...state.plan.event, ...action.event };
      const audit = [
        ...state.plan.audit,
        createAudit('UPDATE_EVENT', `Updated event details for ${updatedEvent.title}`),
      ];
      return {
        ...state,
        plan: { ...state.plan, event: updatedEvent, audit },
      };
    }

    case 'ADD_MOMENT': {
      const moments = [...state.plan.moments, action.moment];
      const audit = [
        ...state.plan.audit,
        createAudit('ADD_MOMENT', `Added moment "${action.moment.name}"`),
      ];
      return {
        ...state,
        plan: { ...state.plan, moments, audit },
      };
    }

    case 'UPDATE_MOMENT': {
      const moments = state.plan.moments.map((m) =>
        m.id === action.moment.id ? action.moment : m,
      );
      const audit = [
        ...state.plan.audit,
        createAudit('UPDATE_MOMENT', `Updated moment "${action.moment.name}"`),
      ];
      return {
        ...state,
        plan: { ...state.plan, moments, audit },
      };
    }

    case 'DELETE_MOMENT': {
      const moment = state.plan.moments.find((m) => m.id === action.momentId);
      const moments = state.plan.moments.filter((m) => m.id !== action.momentId);
      const tasks = state.plan.tasks.filter((t) => t.momentId !== action.momentId);
      const costLines = state.plan.costLines.filter(
        (cl) => !(cl.momentIds.length === 1 && cl.momentIds[0] === action.momentId),
      );
      const audit = [
        ...state.plan.audit,
        createAudit(
          'DELETE_MOMENT',
          `Deleted moment "${moment?.name ?? action.momentId}"`,
        ),
      ];
      return {
        ...state,
        plan: { ...state.plan, moments, tasks, costLines, audit },
      };
    }

    case 'REORDER_MOMENTS': {
      const momentMap = new Map(state.plan.moments.map((m) => [m.id, m]));
      const moments: Moment[] = [];
      for (const id of action.momentIds) {
        const m = momentMap.get(id);
        if (m) moments.push(m);
      }
      // Re-assign start times smoothly based on ordering
      let currentMinute = moments[0]?.startMinute ?? 540;
      const resequencedMoments = moments.map((m) => {
        const res = { ...m, startMinute: currentMinute };
        currentMinute += m.durationMin + 15; // default 15m transition
        return res;
      });

      const audit = [
        ...state.plan.audit,
        createAudit('REORDER_MOMENTS', 'Reordered moments in deck'),
      ];
      return {
        ...state,
        plan: { ...state.plan, moments: resequencedMoments, audit },
      };
    }

    case 'TOGGLE_LOCK_MOMENT': {
      const moments = state.plan.moments.map((m) =>
        m.id === action.momentId ? { ...m, locked: !m.locked } : m,
      );
      const audit = [
        ...state.plan.audit,
        createAudit('TOGGLE_LOCK_MOMENT', `Toggled lock for moment ${action.momentId}`),
      ];
      return {
        ...state,
        plan: { ...state.plan, moments, audit },
      };
    }

    case 'APPLY_CUT_MOMENT': {
      const target = state.plan.moments.find((m) => m.id === action.momentId);
      const moments = state.plan.moments.filter((m) => m.id !== action.momentId);
      const tasks = state.plan.tasks.filter((t) => t.momentId !== action.momentId);
      const costLines = state.plan.costLines.filter(
        (cl) => !(cl.momentIds.length === 1 && cl.momentIds[0] === action.momentId),
      );
      const audit = [
        ...state.plan.audit,
        createAudit(
          'APPLY_CUT_MOMENT',
          `Executed trade-off: cut moment "${target?.name ?? action.momentId}"`,
        ),
      ];
      return {
        ...state,
        tradeoffTargetMomentId: null,
        plan: { ...state.plan, moments, tasks, costLines, audit },
      };
    }

    case 'APPLY_UPGRADE_MOMENT': {
      const target = state.plan.moments.find((m) => m.id === action.momentId);
      const upgradeLine: CostLine = {
        id: `cost-upgrade-${String(Date.now())}`,
        label: `Upgrade: ${target?.name ?? 'Moment'}`,
        kind: 'direct',
        amountMinor: action.deltaMinor,
        locked: true,
        status: 'estimate',
        momentIds: [action.momentId],
        usageWeights: {},
      };
      const costLines = [...state.plan.costLines, upgradeLine];
      const audit = [
        ...state.plan.audit,
        createAudit(
          'APPLY_UPGRADE_MOMENT',
          `Executed trade-off: upgraded moment "${target?.name ?? action.momentId}" by ₹${(action.deltaMinor / 100).toFixed(2)}`,
        ),
      ];
      return {
        ...state,
        tradeoffTargetMomentId: null,
        plan: { ...state.plan, costLines, audit },
      };
    }

    case 'ADD_COST_LINE': {
      const costLines = [...state.plan.costLines, action.costLine];
      const audit = [
        ...state.plan.audit,
        createAudit('ADD_COST_LINE', `Added cost line "${action.costLine.label}"`),
      ];
      return {
        ...state,
        plan: { ...state.plan, costLines, audit },
      };
    }

    case 'UPDATE_COST_LINE': {
      const costLines = state.plan.costLines.map((cl) =>
        cl.id === action.costLine.id ? action.costLine : cl,
      );
      return {
        ...state,
        plan: { ...state.plan, costLines },
      };
    }

    case 'DELETE_COST_LINE': {
      const costLines = state.plan.costLines.filter((cl) => cl.id !== action.costLineId);
      return {
        ...state,
        plan: { ...state.plan, costLines },
      };
    }

    case 'ADD_TASK': {
      const tasks = [...state.plan.tasks, action.task];
      return {
        ...state,
        plan: { ...state.plan, tasks },
      };
    }

    case 'UPDATE_TASK': {
      const tasks = state.plan.tasks.map((t) =>
        t.id === action.task.id ? action.task : t,
      );
      return {
        ...state,
        plan: { ...state.plan, tasks },
      };
    }

    case 'DELETE_TASK': {
      const tasks = state.plan.tasks.filter((t) => t.id !== action.taskId);
      return {
        ...state,
        plan: { ...state.plan, tasks },
      };
    }

    case 'ADD_VENDOR': {
      const vendors = [...state.plan.vendors, action.vendor];
      return {
        ...state,
        plan: { ...state.plan, vendors },
      };
    }

    case 'UPDATE_VENDOR': {
      const vendors = state.plan.vendors.map((v) =>
        v.id === action.vendor.id ? action.vendor : v,
      );
      return {
        ...state,
        plan: { ...state.plan, vendors },
      };
    }

    case 'DELETE_VENDOR': {
      const vendors = state.plan.vendors.filter((v) => v.id !== action.vendorId);
      return {
        ...state,
        plan: { ...state.plan, vendors },
      };
    }

    case 'ADD_IDEA': {
      const ideas = [...state.plan.ideas, action.idea];
      return {
        ...state,
        plan: { ...state.plan, ideas },
      };
    }

    case 'DISMISS_IDEA': {
      const ideas = state.plan.ideas.filter((i) => i.id !== action.ideaId);
      return {
        ...state,
        plan: { ...state.plan, ideas },
      };
    }

    case 'UPDATE_AFTER_EVENT': {
      const audit = [
        ...state.plan.audit,
        createAudit('UPDATE_AFTER_EVENT', 'Updated after-event actual spend and moment ratings'),
      ];
      return {
        ...state,
        plan: {
          ...state.plan,
          afterEvent: action.afterEvent,
          audit,
        },
      };
    }

    default:
      return state;
  }
}
