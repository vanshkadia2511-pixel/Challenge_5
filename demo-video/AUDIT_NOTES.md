# KSHAN — Pre-Recording Audit Notes

## 1. Environment & Repository Status
- **Current Git Branch:** `main`
- **Current Head Commit:** `05208ab` (`docs: update README with comprehensive architecture and new screenshots`)
- **Remote Repository:** `https://github.com/vanshkadia2511-pixel/Challenge_5.git`
- **Node.js Version:** `v25.9.0` (compatible with `node >= 22`)
- **Vite Version:** `v5.4.21`
- **Application Port / URL:** `http://localhost:5173` (served by Vite)
- **Local Launch Command:** `npm run dev`

---

## 2. Actual Verified Test & Quality Baseline (Executed 31 Oct 2026)

| Check | Tool / Command | Result Observed | Status |
|---|---|---|---|
| **Unit & Integration Tests** | `npm test -- --run` (Vitest v2.1.9) | **16 test files passed, 115 tests passed, 0 failed** in 37.60s | ✅ Verified |
| **Static Typecheck** | `npx tsc --noEmit --project tsconfig.json` | **0 errors** | ✅ Verified |
| **ESLint Quality** | `npx eslint src api --max-warnings 0` | **0 errors, 0 warnings** | ✅ Verified |
| **Accessibility (a11y)** | `axe-core` in Playwright E2E suites | **0 WCAG 2.1 AA violations** on all audited pages | ✅ Verified |
| **Production Build** | `npm run build` | **83 modules bundled in 6.21s** (`dist/index.html` 1.04 kB, CSS 31.64 kB, JS 488.16 kB) | ✅ Verified |

---

## 3. Routes & Screens Audited

| Path | Component | Purpose | Verification Status |
|---|---|---|---|
| `/` | `LandingPage.tsx` | Heritage ribbon, Hero visual, Wedding/Birthday/Community occasion cards, How It Works | ✅ Functional & responsive |
| `/deck` | `MomentDeckPage.tsx` | Celebration header, Story Interview trigger, Moment Cards (importance, energy, guest multiplier, lock), Review Cards | ✅ Fully interactive |
| `/plan` | `PlanWorkspacePage.tsx` | Celebration Studio dashboard, stat tiles, upcoming tasks checklist, quick action modals, Budget Overview donut & bars, Moment Budget table, Backwards Timeline, Cue Sheets | ✅ Fully interactive |
| `/vendors` | `VendorMarketplacePage.tsx` | Category filters (Venues, Decorators, Caterers, Photographers), search input, 6 curated vendor cards, Add to Event dispatches | ✅ Fully interactive |
| `/energy` | `EnergyCurvePage.tsx` | Visual SVG Energy Curve chart, transition alerts, Tabular Energy Equivalent for screen readers | ✅ Fully interactive |
| `/book` | `MomentBookPage.tsx` | Printable celebration booklet (`@media print`), JSON & CSV export buttons | ✅ Fully interactive |
| `/after` | `AfterEventPage.tsx` | Post-celebration scorecard, planned vs actual spend input, net variance, Keep or Skip reflection ratings | ✅ Fully interactive |

---

## 4. API & Fallback Runtime Behavior
- **AI Architecture:** Handled via `src/ai/client.ts` with transparent failover to deterministic rule-based fallback generators (`src/ai/fallback.ts`).
- **No-Key / Offline Resilience:** When `GEMINI_API_KEY` is not provided (or during network isolation), all AI flows (`runInterview`, `runIdeas`, `runParse`, `runAssistant`) seamlessly generate instant, coherent, typed results marked with `source: 'fallback'`.
- **Review Card Human Agency:** Suggestions are never auto-committed; they render as distinct `ReviewCard` components with **Apply**, **Edit**, and **Dismiss** controls.

---

## 5. Confirmed Non-Features & Deliberate Boundaries
As stated in `README.md` ("Known Boundaries"), the following are deliberately omitted:
- No live vendor bidding, real-time availability calendar, or payment gateway.
- No remote cloud database or user authentication accounts (pure local-first privacy via browser IndexedDB).
- No multi-user real-time concurrent editing.
- No live RSVP portal or seat placement engine.
- All vendor rates and category numbers are starter estimates for planning purposes.
