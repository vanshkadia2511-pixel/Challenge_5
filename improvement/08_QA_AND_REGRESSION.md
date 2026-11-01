# Functional QA & Regression Verification

## 1. Test Coverage Overview
KSHAN maintains a comprehensive unit, integration, and UI testing suite covering 115+ automated test cases.

### Test Categories:
1. **Mathematical Calculation Engines** (`tests/engine/`):
   - `money.test.ts`: Currency conversion, paise precision, formatting, rounding invariants.
   - `allocation.test.ts`: Moment budget distribution, Fibonacci weight calculation, 10% reserve guarantee.
   - `tradeoff.test.ts`: Zero-sum reallocation simulator, locked moment preservation.
   - `timeline.test.ts`: Backwards scheduling, dependency DAG cycle prevention, lead-time compression.
   - `energy.test.ts`: Emotional arc and guest fatigue curve simulation.
   - `cuesheet.test.ts`: Vendor-specific briefing generation.
   - `attribution.test.ts`: Direct vs shared cost attribution logic.

2. **Schema & Contract Validation** (`tests/schemas/`):
   - Zod runtime type-checking for event models, moment configurations, and AI payloads.

3. **Storage & State Transitions** (`tests/state/`):
   - Dispatcher actions, immutable state updates, audit log persistence.

4. **UI & Component Rendering** (`tests/ui/`):
   - `pages.test.tsx`: Route navigation, heading accessibility, empty state assertions.
   - `after-event.test.tsx`: Photo upload, post-event satisfaction scoring, retrospective notes.
   - `print.test.tsx`: Print-friendly CSS media queries, cue sheet single-page layout.

## 2. Regression Gate Status
- **TypeScript**: 0 errors (`npx tsc --noEmit`).
- **ESLint**: 0 errors, 0 warnings (`npx eslint src api tests --max-warnings 0`).
- **Build Output**: Clean Vite compilation producing isolated chunks.
- **Critical Features Verified**:
  - Moment ranking and pairwise comparison.
  - 10% contingency buffer integrity.
  - Single-click cue sheet print views.
  - Offline fallback activation when network is severed.
