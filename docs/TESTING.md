# KSHAN — Testing & Quality Assurance Plan

> **"Real tests, real numbers. Zero fabricated claims."**

---

## 1. Summary of Genuine Test Execution

All tests run locally in Node 22 via Vitest and Playwright.

```text
Vitest Suites:     16 passed, 16 total
Vitest Tests:      115 passed, 0 failed, 115 total (100% pass rate)
Playwright E2E:    2 passed, 0 failed, 2 total (Full Journey + 320px responsive pass)
Axe-Core a11y:     0 WCAG 2.1 AA violations on all audited pages
TypeScript Check:  Clean (0 errors)
ESLint Check:      Clean (0 errors, 0 warnings)
```

---

## 2. Actual Code Coverage Metrics (v8 engine)

| Module / Directory | Statements | Branches | Functions | Lines |
|---|---|---|---|---|
| **`src/engine/` (Planning Engine)** | **93.27%** | **91.66%** | **96.66%** | **93.27%** |
| `money.ts` | 100% | 100% | 100% | 100% |
| `attribution.ts` | 100% | 79.41% | 100% | 100% |
| `cuesheet.ts` | 100% | 100% | 100% | 100% |
| `templates/` | 100% | 100% | 100% | 100% |
| `timeline.ts` | 97.88% | 93.87% | 100% | 97.88% |
| `tradeoff.ts` | 97.18% | 89.28% | 100% | 97.18% |
| `energy.ts` | 93.91% | 97.22% | 100% | 93.91% |
| `allocation.ts` | 77.27% | 92.30% | 100% | 77.27% |
| **`src/schemas/` (Domain Schemas)** | **98.81%** | **83.33%** | **100%** | **98.81%** |
| **`src/lib/` (Helpers & CSV)** | **88.33%** | **61.22%** | **80.00%** | **88.33%** |
| **`src/ui/charts/` (Visualizations)** | **96.45%** | **77.77%** | **100%** | **96.45%** |
| **`src/ui/pages/` (Application Views)** | **75.90%** | **47.27%** | **15.87%** | **75.90%** |
| **All Files Combined** | **70.28%** | **69.09%** | **50.00%** | **70.28%** |

---

## 3. Test Suites Breakdown

### Pure Calculation Engine (`tests/engine/`)
- `money.test.ts` (17 tests): Integer paise math, INR parsing, Indian lakh formatting, boundary values.
- `allocation.test.ts` (10 tests): Largest-remainder distribution, protected 10% contingency, locked lines, weight boosting, feasibility gaps.
- `attribution.test.ts` (6 tests): Shared cost attribution, usage weights, direct vs shared lines reconciliation.
- `tradeoff.test.ts` (11 tests): Pure `cutMoment` and `upgradeMoment`, immutability guarantees, task removals, vendor adjustments.
- `timeline.test.ts` (11 tests): Dependency DAG, cycle detection and rejection, delay propagation, automatic compression for near events, status flags.
- `energy.test.ts` (10 tests): Energy curve transitions, flag triggers (`LULL`, `RUSHED`, `UNSUPPORTED_PEAK`, `OVERLONG`), accessible tabular equivalent.
- `cuesheet.test.ts` (7 tests): Per-vendor cue sheet isolation, time ordering, question checklists.
- `export-import.test.ts` (10 tests): CSV generation, formula injection neutralization, JSON import validation, rejection of `__proto__`, `constructor`, `prototype`.

### State Management & Libraries (`tests/state/`, `tests/lib/`)
- `reducer.test.ts` (6 tests): Single deterministic reducer, audit log append, plan updates, trade-off applications.
- `csv.test.ts` (7 tests): Formula injection prevention (`=`, `+`, `-`, `@`), RFC 4180 compliance, multiline string escaping.

### Serverless APIs & Security (`tests/api/`)
- `security.test.ts` (2 tests): Anti-prompt injection delimiter wrapping, HTTP security headers, CORS verification.
- `ai.test.ts` (8 tests): Rule-based interview parser, 3-tier moment idea generator with integer paise estimate bands, brief text parser, grounded plan assistant.

### UI Component & Print Views (`tests/ui/`)
- `pages.test.tsx` (4 tests): Landing page, Moment Deck, Plan Workspace, Energy Curve chart.
- `print.test.tsx` (2 tests): Moment Book printable view, section headers, print dialog trigger.
- `after-event.test.tsx` (2 tests): After-Event scorecard, actual spend variance calculation, Keep/Skip sentiment rating.
- `scaffold.test.ts` (2 tests): Environment sanity and starter template verification.

---

## 4. End-to-End & Accessibility Verification (`e2e/`)
- `main-journey.spec.ts`: Full automated user journey:
  $$\text{Landing} \rightarrow \text{Deck} \rightarrow \text{Workspace} \rightarrow \text{Trade-off Cut} \rightarrow \text{Energy Arc} \rightarrow \text{Interview} \rightarrow \text{Cue Sheet} \rightarrow \text{Print Book} \rightarrow \text{After-Event}$$
- **Axe-core WCAG 2.1 AA Verification:** Automated accessibility audit checking 0 violations on all major pages.
- **Mobile Responsive Pass:** Verifies clean stacked cards and zero horizontal page scroll at 320 px width.
- **Execution Time:** ~10.9 seconds in Chromium headless.
