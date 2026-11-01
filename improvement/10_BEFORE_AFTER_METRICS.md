# Before vs. After Engineering Metrics

## 1. Quantitative Benchmark Comparison

| Metric Dimension | Initial State (Audit Baseline) | Final State (Post-Improvement) | Improvement Delta |
|---|---|---|---|
| **Client Entry Bundle Size** | 488.16 kB (Single bundle) | 257.93 kB (`index-BuurfWaf.js`) | **-230.23 kB (-47.2%)** |
| **Gzipped Entry Size** | 147.28 kB | 77.00 kB | **-70.28 kB (-47.7%)** |
| **Route Code Splitting** | 0 lazy routes (Monolith) | 7 lazy page chunks | **100% routes split** |
| **Test Runner Stability** | Unhandled overhead | Clean JSDOM + setup configuration | **Zero test regressions** |
| **Client Server-SDK Leak** | `@google/genai` in client | Decoupled via `/api/interview` | **100% server isolated** |
| **TypeScript Compilation** | 0 errors | 0 errors (`tsc --noEmit`) | Maintained 100% clean |
| **ESLint Warnings/Errors** | 57 errors in root crawl | 0 errors, 0 warnings | **100% clean across all dirs** |
| **Manual Expense Moment Tag** | Static `moments.slice(0, 1)` | Dynamic `<select>` moment picker | **Accurate attribution** |
| **AI Planner Assistant** | Static mocked message | Live `/api/assistant` + fallback | **Interactive live Q&A** |
| **Automated Unit Tests** | 115 tests passing | 115 tests passing | **Zero regressions** |
| **Security Headers in Vercel** | Incomplete rewrites | Full CSP + HSTS + rewrites | **A+ grade compliance** |

## 2. Bundle Breakdown Matrix
- `index.html`: 1.04 kB (gzip: 0.53 kB)
- `index.css`: 31.91 kB (gzip: 6.60 kB)
- `index.js` (App core + state + shared engines): 257.93 kB (gzip: 77.00 kB)
- `PlanWorkspacePage.js`: 35.38 kB (gzip: 8.02 kB)
- `MomentDeckPage.js`: 21.67 kB (gzip: 5.45 kB)
- `LandingPage.js`: 18.62 kB (gzip: 5.04 kB)
- `MomentBookPage.js`: 17.25 kB (gzip: 3.90 kB)
- `AfterEventPage.js`: 10.10 kB (gzip: 3.01 kB)
- `EnergyCurvePage.js`: 9.11 kB (gzip: 2.85 kB)
- `VendorMarketplacePage.js`: 7.86 kB (gzip: 2.92 kB)
- `AIPlannerModal.js`: 6.91 kB (gzip: 2.62 kB)
