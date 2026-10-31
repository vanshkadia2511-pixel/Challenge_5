/**
 * context.tsx — React Context provider for state management and auto-persistence.
 */

import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useRef,
  type ReactNode,
  type Dispatch,
} from 'react';
import type { AppState, Action } from './reducer';
import { appReducer } from './reducer';
import {
  loadPlan,
  savePlan,
  getActivePlanId,
  createPlanFromTemplate,
} from './storage';

interface AppContextValue {
  state: AppState;
  dispatch: Dispatch<Action>;
}

const initialPlan = createPlanFromTemplate('wedding');

const initialState: AppState = {
  plan: initialPlan,
  loading: true,
  activeMomentId: null,
  tradeoffTargetMomentId: null,
  errorMessage: null,
};

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const isInitialMount = useRef(true);

  // Load from IndexedDB / localStorage on startup
  useEffect(() => {
    let active = true;
    async function initStorage() {
      try {
        const lastId = getActivePlanId();
        if (lastId) {
          const loaded = await loadPlan(lastId);
          if (active && loaded) {
            dispatch({ type: 'SET_PLAN', plan: loaded });
            return;
          }
        }
      } catch {
        // Fallback to default initial plan
      } finally {
        if (active) {
          dispatch({ type: 'SET_LOADING', loading: false });
        }
      }
    }
    void initStorage();
    return () => {
      active = false;
    };
  }, []);

  // Debounced auto-save on state.plan changes
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    if (state.loading) return;

    const timer = window.setTimeout(() => {
      void savePlan(state.plan);
    }, 400);

    return () => {
      window.clearTimeout(timer);
    };
  }, [state.plan, state.loading]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return ctx;
}
