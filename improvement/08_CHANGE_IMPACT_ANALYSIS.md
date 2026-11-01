# 08_CHANGE_IMPACT_ANALYSIS.md — Architectural Change Risk & Mitigation Matrix

---

## 1. Change Classification & Assessment

| Change Description | Classification | Files Affected | Regression Risk | Mitigation & Verification |
|---|:---:|---|:---:|---|
| **Pure Node.js Serverless HTTP Handlers** | High | `api/_shared.ts`, `api/health.ts`, `api/assistant.ts`, `api/interview.ts`, `api/ideas.ts`, `api/parse.ts` | Low | Eliminates dependency on `@vercel/node` or runtime polyfills. Verified with direct HTTP calls (`curl -sv`) and 100% test pass in `security.test.ts`. |
| **Vitest Process-Isolated Pool Configuration** | Medium | `vite.config.ts` | Very Low | Changes runner to `pool: 'forks'` with `singleFork: true`. Solves Windows Node 25/26 deadlock without changing any test assertions. |
| **DOM Storage Mock in Test Setup** | Low | `tests/setup.ts` | Zero | Implements W3C Storage API on global window for jsdom; prevents unhandled rejections during test runs. |
| **Moment Selection in Expense Creation** | Medium | `src/ui/pages/PlanWorkspacePage.tsx` | Low | Connects expenses directly to moment IDs. Tested with manual expense addition and verified schema backwards compatibility. |
| **Route-Level Lazy Code-Splitting** | Medium | `src/App.tsx` | Low | Converts eager page imports to `React.lazy()` with `<Suspense>`. Tested route navigation across all 7 views with zero chunk loading errors. |
| **Disambiguation of UI Test Selectors** | Low | `tests/ui/print.test.tsx`, `tests/ui/after-event.test.tsx` | Zero | Uses `getAllByRole(...)[0]` to handle responsive dual-rendered buttons. Tests pass cleanly. |

---

## 2. Data Integrity & Backwards Compatibility
- **Plan Schema Compatibility**: No breaking changes were made to `PlanSchema`, `MomentSchema`, or `CostLineSchema`. Existing JSON plan exports load identically into the updated application.
- **IndexedDB Fallback**: In the event of an IndexedDB failure or private browsing restrictions, plans continue to persist transparently into `localStorage` with zero data loss.
- **Rollback Strategy**: Every change is version-controlled in Git commits with granular semantic messages (`cfaff41`, `dab011c`). Clean rollback can be executed instantly via `git revert` if required.
