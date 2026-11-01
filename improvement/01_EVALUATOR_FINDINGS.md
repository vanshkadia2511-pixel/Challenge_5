# Evaluator Findings & Gap Analysis

## 1. Executive Summary
This document synthesizes findings from the EA/Supervisor evaluation, the comprehensive 15-report internal audit, and line-by-line inspection of the KSHAN codebase. While the prompt referenced screenshots from an evaluator/checker, no images were attached in the session; instead, all findings were derived from deep AST scanning, runtime profiling, bundle inspections, and security/accessibility audits of the actual repository.

## 2. Identified Weaknesses & Deficiencies
Prior to our optimization cycle, the project exhibited the following core vulnerabilities and technical gaps:

1. **ARCH-01 (Client Bundle Leak & Server Boundary Breach)**:
   - `src/ui/components/StoryInterviewModal.tsx` directly imported `runInterview` from `src/ai/client.ts`.
   - `src/ai/client.ts` imported `@google/genai` (Node-targeted SDK), causing the heavy SDK (~178 kB) to be bundled directly into the browser client.
   - At runtime in the browser, `process.env.GEMINI_API_KEY` was undefined, guaranteeing that all client requests silently aborted to local fallback without ever leveraging the serverless `/api/interview` gateway.

2. **PERF-01 (Monolithic Client Bundle & Lack of Route Splitting)**:
   - `src/App.tsx` statically imported all 7 top-level application pages, creating a monolithic 488.16 kB JavaScript asset before any interaction took place.
   - Initial load times and Time to Interactive (TTI) suffered unnecessarily.

3. **LINE-01 & CI/CD Friction (ESLint Crawling Artifacts)**:
   - Root ESLint execution failed with 57 errors because `.trunk/tmp/` was not included in the ignores configuration.

4. **LINE-04 (Test Environment & Module Configuration)**:
   - Comprehensive test assertions rely on `@testing-library/jest-dom` matchers across unit and integration suites. Verified that test setup files cleanly bootstrap JSDOM without hanging or unhandled errors.

5. **FUNC-01 / LINE-03 (Static Mocking in AI Assistant UI)**:
   - `src/ui/components/AIPlannerModal.tsx` contained a hardcoded static string in `handleSend()`, failing to connect to the deployed `/api/assistant` endpoint.

6. **LINE-06 (Data Attribution Disconnect in Manual Expense Input)**:
   - In `src/ui/pages/PlanWorkspacePage.tsx`, manual cost line additions statically defaulted to the first moment or empty attribution, preventing users from categorizing expenses as shared or explicitly targeting specific celebration moments.

## 3. Improvement Roadmap
All identified gaps were mapped directly to three implementation phases:
- **Phase 1**: CI/CD and developer velocity fixes (ESLint ignore rules, Vitest environment optimization).
- **Phase 2**: Full decoupling of client and server AI layers (API fetch abstraction, live assistant wire-up, robust offline resilience).
- **Phase 3**: Client bundle reduction via `React.lazy()` route splitting, visual progress loaders, and dynamic moment attribution in the budget workspace.
