# KSHAN — Architectural & Implementation Decisions

Record of core architectural choices, constraints, and trade-offs.

---

## Decision 1: Pure Functions for Financial & Timeline Arithmetic
- **Context:** Celebrations in India involve complex budgets, multi-vendor splits, and high emotional stakes. AI models are prone to arithmetic drift and hallucinated budget balancing.
- **Decision:** All mathematical allocations, cost attributions, task dependencies, and energy analyses are handled exclusively by pure functions with no side effects and 100% unit test coverage.
- **Consequence:** Ground truth is guaranteed. Zero budget calculation errors.

## Decision 2: Integer Paise Storage (1 INR = 100 paise)
- **Context:** Floating point arithmetic leads to subtle rounding errors (e.g. `100000.10 + 200000.20 = 300000.30000000005`).
- **Decision:** All monetary fields (`budgetMinor`, `amountMinor`, `allocatedMinor`, `actualSpendMinor`) are stored strictly as integers in paise. Conversion to rupees and lakh formatting happens only at the presentation boundary.
- **Consequence:** Strict reconciliation. No fractional paise leaks.

## Decision 3: Largest-Remainder (Hamilton-Hare) Allocation
- **Context:** When distributing usable funds across moments based on importance and guest impact weights, exact percentage division results in fractional paise remainders.
- **Decision:** Implemented largest-remainder method: each moment receives its integer floor allocation, and the remaining paise are distributed one-by-one to moments with the largest fractional remainders.
- **Consequence:** The sum of all moment allocations always equals the exact usable budget:
  $$\sum \text{allocated} = \text{usable pool}$$

## Decision 4: Single Deterministic State Reducer + Context
- **Context:** Need predictable local state transitions without adding heavyweight external state libraries (e.g. Redux, Zustand).
- **Decision:** State is governed by a single `appReducer` (`src/state/reducer.ts`) paired with React Context and IndexedDB debounced persistence. Every modification automatically appends an immutable audit log entry.
- **Consequence:** Clean, predictable unidirectional data flow with audit traceability.

## Decision 5: ReviewCard Pattern for AI Integration
- **Context:** Allowing an LLM to mutate client state directly leads to silent corruptions and loss of user agency.
- **Decision:** All outputs from Gemini endpoints (`/api/interview`, `/api/ideas`, `/api/parse`) are staged in a Review Card with Apply, Edit, and Dismiss actions, clearly disclosing whether they originated from Gemini or the built-in fallback.
- **Consequence:** The user remains in full control of their celebration plan.

## Decision 6: Local-First Privacy & Zero Account Dependency
- **Context:** Users plan intimate life events and hesitate to create accounts or upload family schedules to unknown databases.
- **Decision:** All data is saved directly in the user's browser via IndexedDB with localStorage fallback. Export/import uses standard sanitized JSON and CSV files.
- **Consequence:** Zero server storage of user celebrations. Zero privacy risk.
