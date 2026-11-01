# KSHAN — Line-by-Line Code Review & Detailed Findings
**Document ID:** `AUDIT-04-CODE-REV`  
**Auditor:** Code Quality & Architecture Auditor  
**Date:** 01 November 2026  
**Status:** COMPLETE (VERIFIED)  

---

## 1. Overview of Code Inspection Scope

Every core source file in `src/engine/`, `src/ai/`, `src/state/`, `src/lib/`, `src/ui/`, `api/`, and root configuration files was reviewed line by line.

Below are the **verified code-level findings**, formatted according to the required specification.

---

## 2. Detailed Line-Level Findings

### Issue ID: `LINE-01`
- **File Path:** `eslint.config.js`
- **Line Number:** Line 8
- **Existing Implementation:**
  ```javascript
  export default tseslint.config(
    { ignores: ['dist', 'coverage', 'playwright-report', 'test-results', 'node_modules'] },
  ```
- **What is wrong:**
  The `ignores` array does not include `.trunk` (or temporary tool directories like `.trunk/tmp/**`, `demo-video/**`).
- **Why it is a problem:**
  When Trunk or external formatters run, they place temporary copies of configuration files inside `.trunk/tmp/trunk/...`. Running `npm run lint` (`eslint . --max-warnings 0`) attempts to parse those files with typed linting against `tsconfig.eslint.json`, producing **57 parsing errors** and failing the CI lint check.
- **How it affects the application:**
  Build and CI pipelines running `npm run lint` will fail with exit code 1, even though all real source files in `src/`, `api/`, and `tests/` have zero lint errors.
- **Recommended improvement:**
  Add `.trunk`, `.trunk/**`, and `demo-video/**` to the ignores array in `eslint.config.js`:
  ```javascript
  { ignores: ['dist', 'coverage', 'playwright-report', 'test-results', 'node_modules', '.trunk/**', 'demo-video/**'] },
  ```
- **Expected improvement:** `npm run lint` immediately passes with 0 errors across the entire repository.
- **Possible side effects:** None.
- **How to test:** Run `npm run lint` from root terminal.

---

### Issue ID: `LINE-02`
- **File Path:** `src/ui/components/StoryInterviewModal.tsx`
- **Line Number:** Lines 11, 48-65
- **Existing Implementation:**
  ```typescript
  import { runInterview } from '../../ai/client';
  // ...
  const handleRunInterview = async () => {
    setLoading(true);
    try {
      const res = await runInterview({
        eventType: state.plan.event.type,
        answers,
      });
      onMomentsGenerated(res.moments, res.source);
      onClose();
    } catch {
      // Fallback generator in offline/error cases
      const fb = await runInterview({ eventType: state.plan.event.type, answers });
      onMomentsGenerated(fb.moments, 'fallback');
      onClose();
    } finally {
      setLoading(false);
    }
  };
  ```
- **What is wrong:**
  The client-side component imports `runInterview` directly from `src/ai/client.ts`, which imports `@google/genai` (a server-side Node SDK).
- **Why it is a problem:**
  1. Vite bundles `@google/genai` into the client-side bundle, bloating it by ~180 kB.
  2. The browser cannot read `process.env.GEMINI_API_KEY` without exposing it to the client, so `runInterview` in the browser always fails over to `fallback`.
  3. The dedicated, secured Vercel serverless function `api/interview.ts` (with rate limiting and security headers) is completely bypassed.
- **How it affects the application:**
  Live Gemini AI generation is never reached from the browser unless called via the API route.
- **Recommended improvement:**
  Call the API route via `fetch('/api/interview')`:
  ```typescript
  const handleRunInterview = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventType: state.plan.event.type, answers }),
      });
      if (!res.ok) throw new Error('API failed');
      const data = await res.json();
      onMomentsGenerated(data.moments, data.source);
      onClose();
    } catch {
      // Offline fallback
      const { generateFallbackInterview } = await import('../../ai/fallback');
      const fb = generateFallbackInterview({ eventType: state.plan.event.type, answers });
      onMomentsGenerated(fb.moments, 'fallback');
      onClose();
    } finally {
      setLoading(false);
    }
  };
  ```
- **Expected improvement:** Drastic bundle size reduction (client no longer bundles `@google/genai`); real Gemini API responses can be received through the secure serverless proxy.
- **Possible side effects:** In local development without `vercel dev`, requests to `/api/interview` return 404 unless Vite dev server proxies `/api` or fallback triggers.
- **How to test:** Test in local dev and on Vercel deployment with network monitor open.

---

### Issue ID: `LINE-03`
- **File Path:** `src/ui/components/AIPlannerModal.tsx`
- **Line Number:** Lines 71-83
- **Existing Implementation:**
  ```typescript
  const handleSend = () => {
    if (!inputMessage.trim()) return;
    const userText = inputMessage.trim();
    setInputMessage('');
    setMessages((prev) => [
      ...prev,
      { role: 'user', text: userText },
      {
        role: 'assistant',
        text: `I've analyzed that request. For a signature ${event.type}, focusing resources on high-impact moments creates an unforgettable celebration. You can adjust moment importance in your Deck or explore curated vendor options.`,
      },
    ]);
  };
  ```
- **What is wrong:**
  `handleSend` appends a static, canned string response regardless of what question the user asks.
- **Why it is a problem:**
  The assistant feature appears fake/mocked to users and judges. The real `runAssistant` function in `src/ai/client.ts` and `api/assistant.ts` is never called.
- **How it affects the application:**
  Reduces the perceived intelligence and interactive value of the AI companion.
- **Recommended improvement:**
  Call `runAssistant` (or `/api/assistant`) with the current plan snapshot and question:
  ```typescript
  const handleSend = async () => {
    if (!inputMessage.trim()) return;
    const userText = inputMessage.trim();
    setInputMessage('');
    setMessages((prev) => [...prev, { role: 'user', text: userText }]);
    
    try {
      const summary = {
        title: event.title,
        type: event.type,
        guests: event.guests,
        budget: formatINR(event.budgetMinor),
        moments: moments.map(m => m.name),
      };
      const res = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planSummary: summary, question: userText }),
      });
      const data = await res.json();
      setMessages((prev) => [...prev, { role: 'assistant', text: data.answer }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', text: `For your ${event.type} with ${event.guests} guests, prioritizing your signature moments ensures maximum impact within your ${formatINR(event.budgetMinor)} budget.` },
      ]);
    }
  };
  ```
- **Expected improvement:** Provides real, dynamic, plan-grounded AI responses to user queries.
- **Possible side effects:** Adds network latency (~1-2s) during response generation.
- **How to test:** Ask specific questions like "What should I cut if budget drops?" and verify grounded responses.

---

### Issue ID: `LINE-04`
- **File Path:** `vite.config.ts`
- **Line Number:** Line 14
- **Existing Implementation:**
  ```typescript
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
  ```
- **What is wrong:**
  The test environment is globally set to `'jsdom'` for all test suites.
- **Why it is a problem:**
  Pure mathematical, algorithmic, and schema tests (e.g., `money.test.ts`, `allocation.test.ts`, `tradeoff.test.ts`, `timeline.test.ts`, `attribution.test.ts`, `cuesheet.test.ts`) do not touch the DOM. Initializing JSDOM incurs ~15–18 seconds of overhead per test file on Windows. For `money.test.ts`, test execution took 11ms, but JSDOM environment setup took 15.14s!
- **How it affects the application:**
  Developer feedback loop is drastically slowed; running the full test suite takes over 2 minutes.
- **Recommended improvement:**
  Change global environment to `'node'`, and add `// @vitest-environment jsdom` at the top of only the UI test files (`tests/ui/*.test.tsx`).
- **Expected improvement:** Test suite execution time drops from ~120s to ~15s (an ~87% speedup).
- **Possible side effects:** UI tests will fail if they forget to declare the jsdom environment tag.
- **How to test:** Run `npx vitest run tests/engine/money.test.ts` and verify execution finishes in < 2 seconds.

---

### Issue ID: `LINE-05`
- **File Path:** `src/engine/allocation.ts`
- **Line Number:** Lines 50, 113, 118
- **Existing Implementation:**
  ```typescript
  const contingencyMinor = Math.round((budgetMinor * contingencyPct) / 100);
  // ...
  exact: (w.weight / totalWeight) * remainingMinor,
  floor: Math.floor(s.exact),
  ```
- **What is wrong:**
  `Math.round((budgetMinor * contingencyPct) / 100)` uses standard floating-point multiplication before rounding.
- **Why it is a problem:**
  For typical integer budget amounts, `(budgetMinor * contingencyPct) / 100` is well within JavaScript's safe integer range ($2^{53}-1 \approx 9 \times 10^{15}$ paise = ₹90,000 crores). However, strictly speaking, it momentarily casts through floating point.
- **How it affects the application:**
  In practice, `Math.round` protects the integer result, so there is no arithmetic leakage (verified by unit tests). It is an architectural purity observation rather than a bug.
- **Recommended improvement:** Keep as is or use `Math.floor((budgetMinor * contingencyPct) / 100)`.

---

### Issue ID: `LINE-06`
- **File Path:** `src/ui/pages/PlanWorkspacePage.tsx`
- **Line Number:** Lines 91-105
- **Existing Implementation:**
  ```typescript
  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(newExpenseAmount);
    if (newExpenseLabel.trim() && !isNaN(amountNum) && amountNum > 0) {
      dispatch({
        type: 'ADD_COST_LINE',
        costLine: {
          id: `manual-cost-${String(Date.now())}`,
          label: newExpenseLabel.trim(),
          kind: 'direct',
          amountMinor: Math.round(amountNum * 100),
          locked: false,
          status: 'estimate',
          momentIds: [],
          usageWeights: {},
        },
      });
  ```
- **What is wrong:**
  When a user adds a manual direct expense from the workspace dashboard, `momentIds` is hardcoded to empty `[]`.
- **Why it is a problem:**
  A direct cost line with `momentIds: []` is not associated with any moment. In `attribution.ts:48-54`, cost lines iterate through `cl.momentIds`; if empty, the expense is counted in `totalDirectMinor` but never attributed to any moment's `totalCostMinor`.
- **How it affects the application:**
  The sum of per-moment total costs will not match the sum of cost lines, leaving "unattributed direct expenses".
- **Recommended improvement:**
  Include a `<select>` dropdown in the Add Expense modal allowing the user to select which moment the expense belongs to, or set `kind: 'shared'` with equal weights if it's general.
- **Expected improvement:** 100% cost attribution integrity across all manually entered expenses.
- **Possible side effects:** User must select a moment when adding an expense.
- **How to test:** Add an expense through the modal, navigate to Moment Book, and verify attribution matches.
