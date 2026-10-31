# ANTIGRAVITY Build Log

Real prompts, AI responses, decisions and iterations — kept honest per the spec.

---

## Milestone 1 — Scaffold (2026-10-30)

**Prompt sent to Antigravity:**
> Read the KSHAN_CHATBOT_MASTER_PROMPT.md completely. Inspect the existing repository and report the gap analysis. Then implement milestone by milestone.

**What happened:**
- Repository was empty (only `.vscode/settings.json`).
- Antigravity read both spec files, produced a gap analysis covering ~50 missing components.
- Gap analysis approved by user.
- Antigravity implemented Milestone 1 scaffold: package.json, tsconfig, Vite, Tailwind (design tokens), ESLint, Prettier, .env.example, .gitignore, vercel.json, index.html, src/index.css, src/main.tsx, App.tsx, page stubs, SummaryBar stub, AppProvider stub, CI workflow, LICENSE, SECURITY.md, README.md skeleton.

**Decisions made:**
- `eslint-plugin-react-refresh` skipped — not in the spec stack; `react-hooks` plugin used instead.
- Page stubs created so App.tsx compiles; they will be replaced in Milestone 3.
- AppProvider is a stub context returning `{ ready: false }`; full reducer wired in Milestone 3.

**AI vs code split:**
- Antigravity wrote all scaffold files from the specification.
- No AI-generated content was inserted into application business logic.
- No test results were fabricated.

---

## Milestone 2 — Pure Engine & Unit Tests (2026-10-30)

**What happened:**
- Implemented Zod schemas in `src/schemas/`: `event.ts`, `moment.ts`, `plan.ts`, `ai.ts`.
- Implemented pure calculation engine in `src/engine/`:
  - `money.ts`: Integer paise arithmetic, INR parse & lakh formatting.
  - `allocation.ts`: Moment Budget allocation with protected contingency, locked lines, weight boosting, and largest-remainder method guaranteeing exact sums and reporting feasibilityGap.
  - `attribution.ts`: Shared cost attribution per moment with usageWeights and largest-remainder distribution.
  - `tradeoff.ts`: Pure `cutMoment` and `upgradeMoment` trade-off calculations with deep-freeze immutability check.
  - `timeline.ts`: Dependency DAG, cycle detection and rejection, delay propagation, automatic compression and status determination.
  - `energy.ts`: Energy curve computation, segment generation, and flag triggers (LULL, RUSHED, UNSUPPORTED_PEAK, OVERLONG) with accessible text/table fallback.
  - `cuesheet.ts`: Per-vendor cue sheet generation.
  - `templates/index.ts`: 3 complete templates (Wedding, Birthday, Community).
  - `index.ts`: Unified barrel exports.
- Implemented complete unit test suite in `tests/engine/`:
  - `money.test.ts` (17 tests)
  - `allocation.test.ts` (10 tests)
  - `attribution.test.ts` (6 tests)
  - `tradeoff.test.ts` (11 tests)
  - `timeline.test.ts` (11 tests)
  - `energy.test.ts` (10 tests)
  - `cuesheet.test.ts` (7 tests)
  - `scaffold.test.ts` (2 tests)

**Decisions made:**
- In `timeline.ts`, tasks requiring > 365 days of lead time when the event is near cannot be compressed down and are categorized as `impossible`, whereas closer compressible tasks have their lead time compressed with human-readable explanation.
- In `energy.ts`, the energy curve spans from the first moment to the last moment of the celebration day; gaps are strictly between moments rather than spanning from midnight.

**Observed test and verification results:**
- `npm run typecheck`: PASS (0 errors)
- `npm run lint`: PASS (0 errors, 0 warnings)
- `npm test -- --run`: PASS (8 test files, 74 passed, 0 failed)
- `npm run build`: PASS (bundle 163.42 kB JS, 7.33 kB CSS)

---

## Milestone 3 — Moment Deck, Plan Workspace, Energy Curve, Local Storage (2026-10-30)

**What happened:**
- Implemented state management & persistence:
  - `src/state/storage.ts`: Full IndexedDB storage with localStorage fallback, plan serialization, prototype pollution check via `validatePlanImport`, and template initializers.
  - `src/state/reducer.ts`: Single deterministic application reducer managing plan, active moment, trade-offs, and appending immutable audit records to `plan.audit`.
  - `src/state/context.tsx`: Context provider with debounced auto-save.
- Implemented core libraries:
  - `src/lib/format.ts`: Lakh grouping, readable dates, minute-of-day converters.
  - `src/lib/csv.ts`: Formula injection neutralization (`=`, `+`, `-`, `@`) and RFC 4180 CSV generator.
  - `src/lib/a11y.ts`: Screen-reader live-region announcements and reduced motion detection.
- Implemented rich visual & interactive UI components:
  - `src/ui/components/Navbar.tsx`: Accessible header with active link highlights, brand wordmark, and celebration pill.
  - `src/ui/components/SummaryBar.tsx`: Persistent summary bar displaying total budget, allocated amount, protected contingency, locked funds, and real-time badges for feasibility gaps, energy flags, and overdue tasks.
  - `src/ui/components/MomentRibbon.tsx`: Custom SVG timeline of beads connected by an organic path, styled with KSHAN design tokens (saffron, teal, rose, mist, ink), interactive hover/selection.
  - `src/ui/components/TradeoffDrawer.tsx`: Modal drawer for simulating moment cut or upgrade, showing freed funds, task removals, vendor impacts, and redistributed budgets before applying.
  - `src/ui/charts/EnergyCurveChart.tsx`: SVG area/line chart rendering the energy arc, flag diagnostic cards with reason codes, and an accessible table equivalent for screen readers.
- Implemented complete pages:
  - `src/ui/pages/LandingPage.tsx`: Hero, interactive Moment Ribbon demo, 3 occasion cards (Wedding, Birthday, Community), 4-step "How it works", trust notes.
  - `src/ui/pages/MomentDeckPage.tsx`: Celebration details form, template picker, drag/keyboard reordering, moment importance (1-5), energy target (1-5), lock toggling, add/delete moment.
  - `src/ui/pages/PlanWorkspacePage.tsx`: 4 unified sections (Moment Budget table with cost per moment, Backwards Timeline with task completion toggles, Vendor Cue Sheets with printable links, Moment Ideas).
  - `src/ui/pages/EnergyCurvePage.tsx`: Dedicated energy diagnostics page with flag guide and SVG chart.
- Implemented unit and component tests:
  - `tests/lib/csv.test.ts` (7 tests)
  - `tests/state/reducer.test.ts` (6 tests)
  - `tests/ui/pages.test.tsx` (4 tests)

**Decisions made:**
- In `csv.ts`, cells with `,` or quotes are wrapped in quotes, and dangerous leading formula characters (`=`, `+`, `-`, `@`) are prepended with `'` to neutralize formula injection.
- In `PlanWorkspacePage.tsx`, sections are laid out continuously on one page with clear section landmarks rather than generic hidden tabs, matching the spec requirement.

**Observed test and verification results:**
- `npm run typecheck`: PASS (0 errors)
- `npm run lint`: PASS (0 errors, 0 warnings)
- `npm test -- --run`: PASS (11 test files, 91 passed, 0 failed)
- `npm run build`: PASS (bundle 369.31 kB JS, 20.91 kB CSS)

---

## Milestone 4 — Gemini Serverless API, Failover, Fallback & Review Cards (2026-10-30)

**What happened:**
- Implemented `src/ai/fallback.ts`: Rule-based interview parser, 3-tier moment idea generator (modest, balanced, lavish) with deterministic integer paise bands, brief text parser, and grounded plan assistant.
- Implemented `src/ai/prompts.ts`: Delimited user inputs (`<USER_PROVIDED_DATA>`) to prevent prompt injection; strict system prompts demanding structured JSON.
- Implemented `src/ai/client.ts`: GoogleGenAI client with ordered model failover (`gemini-2.5-flash` -> `gemini-1.5-flash`), 8s timeout with `Promise.race`, cooldown tracker, and graceful fallback when `GEMINI_API_KEY` is not configured.
- Implemented `api/_shared.ts`: Preflight handler, exact-origin CORS, 64 KB body size limit, per-IP sliding rate limiter (20 req/min), security headers (CSP, HSTS, nosniff, DENY frame options).
- Implemented serverless API endpoints:
  - `api/health.ts`: Diagnostic route exposing rate limiter, models, and fallback readiness.
  - `api/interview.ts`: 5-question host interview parser returning structured occasion, guest count, vibe, priority moments, and budget.
  - `api/ideas.ts`: 3-tier moment idea generator with estimate bands.
  - `api/parse.ts`: Natural language celebration brief parser.
  - `api/assistant.ts`: Grounded plan assistant responding only to verified plan data.
- Implemented UI review workflow:
  - `src/ui/components/ReviewCard.tsx`: Apply / Edit / Dismiss review card with honest disclosure badge (`"Suggested by Gemini"` vs `"Generated by the built-in planner"`).
  - `src/ui/components/StoryInterviewModal.tsx`: Accessible modal conducting the 5-question interview and streaming parsed moments directly to the Moment Deck via Review Cards.
- Implemented test suites:
  - `tests/api/security.test.ts` (2 tests)
  - `tests/api/ai.test.ts` (8 tests)

**Decisions made:**
- Exact-origin CORS and security headers are handled by a shared utility (`api/_shared.ts`) across all API routes.
- The AI never modifies plan money or schedule directly; all suggestions must be staged through `ReviewCard` where the user explicitly chooses Apply, Edit, or Dismiss.
- Offline and unconfigured states fallback to rule-based generation with zero runtime errors.

**Observed test and verification results:**
- `npm run typecheck`: PASS (0 errors)
- `npm run lint`: PASS (0 errors, 0 warnings)
- `npm test -- --run`: PASS (13 test files, 101 passed, 0 failed)
- `npm run build`: PASS (bundle 414.61 kB JS, 22.76 kB CSS in 4.77s)

---

## Milestone 5 — Moment Book, Exports, After-Event Log & Responsive Pass (2026-10-30)

**What happened:**
- Implemented `src/lib/export.ts`:
  - `exportBudgetCsv`: Moment budget export with direct, attributed shared, total allocations, and contingency summary row.
  - `exportTimelineCsv`: Backwards timeline tasks export with deadlines, lead times, critical flags, and dependencies.
  - `exportCueSheetsCsv`: Vendor cue sheets export with exact times, moment names, cue triggers, and questions.
  - `exportAfterEventCsv`: Post-celebration debrief CSV export with planned vs actual spend, net variance, and keep/skip ratings.
  - `exportPlanJson`: Complete schema-conforming plan JSON downloader.
- Implemented `src/ui/pages/MomentBookPage.tsx`:
  - Clean printable layout with `@media print` rules, print button calling `window.print()`.
  - Event metadata header (occasion, title, city, date, guests, total budget).
  - 1. Celebration Moment Schedule (chronologically ordered, duration, energy, importance, budget, notes).
  - 2. Master Moment Budget (cap, protected contingency, usable allocation pool, feasibility status, table breakdown).
  - 3. Vendor Cue Sheets (per-vendor printable cards with time, moment, cue triggers, requirements).
  - 4. Backwards Timeline Checklist (lead days, target date, task name, critical badge, owner, status).
  - JSON & CSV export toolbar with client-side JSON file import and prototype pollution validation.
- Implemented `src/ui/pages/AfterEventPage.tsx`:
  - Post-Celebration Scorecard (planned budget, actual total spend, net variance with under/over badges, keep vs skip tally, host reflection textarea).
  - Moment Breakdown (planned allocation, actual spend rupee input, variance calculation, Keep / Skip toggle buttons, retrospective notes).
  - Auto-saved state dispatched via `UPDATE_AFTER_EVENT` action into IndexedDB/localStorage.
- Schema & State updates:
  - Added `AfterEventLogSchema` and `AfterEventMomentLogSchema` in `src/schemas/plan.ts`.
  - Added `UPDATE_AFTER_EVENT` action in `src/state/reducer.ts` recording immutable audit entries.
  - Extended `validatePlanImport` to safely handle undefined inputs and reject `__proto__`, `constructor`, `prototype`.
- Implemented tests:
  - `tests/ui/print.test.tsx` (2 tests)
  - `tests/ui/after-event.test.tsx` (2 tests)
  - `tests/engine/export-import.test.ts` (10 tests)

**Decisions made:**
- In `AfterEventPage.tsx`, variance is computed dynamically as `actual - planned` without persisting intermediate calculated values.
- In `export.ts`, formula injection neutralization from `src/lib/csv.ts` is strictly enforced on all exported text fields.
- JSDOM print and anchor element clicks are isolated in tests to avoid unhandled browser navigation warnings.

**Observed test and verification results:**
- `npm run typecheck`: PASS (0 errors)
- `npm run lint`: PASS (0 errors, 0 warnings)
- `npm test -- --run`: PASS (16 test files, 115 passed, 0 failed)
- `npm run build`: PASS (bundle 445.62 kB JS, 26.08 kB CSS in 19.97s)

---

## 2026-10-31 — Milestone 6: E2E Playwright Journey, Axe-Core Remediation & Story Interview Integration

**Antigravity prompt / task summary:**
- Execute Milestone 6 & 8: Implement automated Playwright end-to-end journey in `e2e/main-journey.spec.ts` visiting all 6 views with zero WCAG 2.1 AA violations.
- Integrate Story Interview flow on Moment Deck with Review Cards (Apply/Edit/Dismiss).
- Resolve all automated axe-core violations across Landing Page, Moment Deck, Plan Workspace, Energy Curve, Moment Book, and After-Event Log.

**Files changed / created:**
- `e2e/main-journey.spec.ts`: Added full 8-step journey test with automated axe audits and 320px mobile viewport test.
- `src/ui/components/StoryInterviewModal.tsx`: Connected 5-question host interview flow with guest/city/budget context fields.
- `src/ui/components/ReviewCard.tsx`: Connected 3-tier review cards with Apply to Deck, Edit, and Dismiss actions.
- `src/ui/pages/MomentDeckPage.tsx`: Added Suggested Moments for Review section, high-contrast labels, and accessible form controls.
- `src/ui/pages/PlanWorkspacePage.tsx`: Remediated color contrast on badges, weight shares, and status chips.
- `src/ui/charts/EnergyCurveChart.tsx`: Fixed color contrast on energy arc notes and table equivalents.
- `src/ui/pages/MomentBookPage.tsx`: Fixed WCAG 2.5.3 label-content mismatches and saffron badge contrast.
- `src/ui/pages/AfterEventPage.tsx`: Fixed button accessible names for Keep/Skip toggles and Save Log.
- `src/ai/client.ts`: Added browser-safe environment variable reader (`getEnv`) to prevent runtime ReferenceError in Vite.

**Decisions made:**
- In `assertNoA11yViolations`, added a 350ms settling timeout before evaluating axe to allow CSS color transitions to settle cleanly.
- Buttons with existing visible text have redundant conflicting `aria-label`s removed to guarantee 100% WCAG 2.5.3 (Label in Name) compliance.

**Observed test and verification results:**
- `npx playwright test`: PASS (2 passed in 10.9s).
  - Test 1 (Full 8-step journey + 6 page axe checks): PASSED (7.3s).
  - Test 2 (Responsive 320px layout with no horizontal scroll): PASSED (1.7s).
- Generated 6 real screenshots in `docs/screenshots/`:
  - `01-landing-page.png` (213 KB)
  - `02-moment-deck.png` (127 KB)
  - `03-plan-workspace.png` (267 KB)
  - `04-energy-curve.png` (156 KB)
  - `05-moment-book.png` (243 KB)
  - `06-after-event.png` (225 KB)

---

## 2026-10-31 — Milestone 7 & 8: Security Verification, Vercel Config & Production Build

**Antigravity prompt / task summary:**
- Verify production readiness: `npm run build`, Vercel serverless function configuration (`vercel.json`), security headers, and secret isolation.

**Files changed / created:**
- `vercel.json`: Validated security headers (CSP, nosniff, frame-ancestors, Referrer-Policy), serverless function build config, rewrites.
- `SECURITY.md`: Security disclosure policy, 64 KB payload limits, sliding-window rate limits, CSV sanitization.
- `docs/BUILD_STATUS.md`: Created centralized milestone tracker.

**Observed test and verification results:**
- `npm run build`: PASS (bundle: JS 450.45 kB, CSS 26.18 kB in 7.01s).
- Bundle size within limits.

---

## 2026-10-31 — Milestone 9: Final Comprehensive Project Audit

**Antigravity prompt / task summary:**
- Perform whole-project final audit across TypeScript, ESLint, Vitest, v8 coverage, Playwright E2E, axe-core, and production builds.

**Audit findings and resolutions:**
1. **ESLint `@typescript-eslint/no-confusing-void-expression` in `e2e/main-journey.spec.ts`:**
   - *Fix:* Added block body `{ console.log(...); }` to arrow functions.
2. **ESLint `@typescript-eslint/no-unnecessary-condition` in `src/ai/client.ts`:**
   - *Fix:* Simplified `typeof process !== 'undefined'` guard.
3. **Vitest button name mismatch in `tests/ui/print.test.tsx` and `tests/ui/after-event.test.tsx`:**
   - *Fix:* Aligned regex button queries with updated WCAG 2.5.3 compliant button labels (`/Export JSON/i`, `/Save Log/i`).

**Final Comprehensive Audit Results:**
- `npm run typecheck`: PASS (0 errors).
- `npm run lint`: PASS (0 errors, 0 warnings across all code and tests).
- `npm test -- --coverage`: PASS (16 test files, 115 tests passed, 100% pass rate).
  - Overall Statement Coverage: 70.28%
  - Planning Engine Statement Coverage: 93.27% (Branch: 91.66%, Funcs: 96.66%)
  - Schemas Coverage: 98.81%
  - Core Libs Coverage: 88.33%
- `npx playwright test`: PASS (2/2 tests passed, 0 axe WCAG 2.1 AA violations).
- `npm run build`: PASS (clean production build in 7.01s).


