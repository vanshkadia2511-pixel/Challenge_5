# Code Quality & Architectural Improvements

## 1. Architectural Boundary Restoration (ARCH-01)
Previously, `StoryInterviewModal.tsx` imported directly from `src/ai/client.ts`. Because `src/ai/client.ts` uses `@google/genai` (a server-side library intended for Node.js environments), the Vite bundler packaged the entire SDK into the client bundle.

### Implementation:
- Refactored `StoryInterviewModal.tsx` to communicate via standard `fetch('/api/interview', { method: 'POST', ... })`.
- Added strict type handling using `InterviewResult` from `src/schemas/ai.ts`.
- Integrated resilient local fallback: If the network request fails or the user is offline, `generateFallbackInterview` is invoked seamlessly without throwing runtime errors or unhandled promise rejections.

```typescript
// Refactored handleRunInterview in StoryInterviewModal.tsx
const handleRunInterview = async () => {
  setLoading(true);
  try {
    const response = await fetch('/api/interview', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ eventType: state.plan.event.type, answers }),
    });
    if (!response.ok) throw new Error(`HTTP ${String(response.status)}`);
    const res = (await response.json()) as InterviewResult;
    onMomentsGenerated(res.moments, res.source);
    onClose();
  } catch {
    const fb = generateFallbackInterview({ eventType: state.plan.event.type, answers });
    onMomentsGenerated(fb.moments, 'fallback');
    onClose();
  } finally {
    setLoading(false);
  }
};
```

## 2. Dynamic Moment Attribution for Manual Expenses (LINE-06)
In `PlanWorkspacePage.tsx`, the Add Expense modal previously forced manual entries into static single-moment mappings (`moments.slice(0, 1)`).

### Implementation:
- Added `newExpenseMomentId` state hook.
- Added a dedicated Moment Assignment dropdown to the modal interface.
- If selected, the cost line is attributed directly to that specific moment (`kind: 'direct'`).
- If unassigned, the cost line defaults to `kind: 'shared'` with global attribution across all celebration moments.

## 3. Real-Time Conversational AI Assistant (FUNC-01)
Replaced the mock response in `AIPlannerModal.tsx` with live HTTP communication targeting `/api/assistant`.
- Serializes sanitized plan snapshot metadata (event type, guest count, total budget, moment names).
- Includes an active `isThinking` loading state that disables the send button and provides visual feedback.
- Falls back to `generateFallbackAssistant()` if network or server errors occur.

## 4. Linting & Type System Cleanliness
- Strictest TypeScript configuration: `tsc --noEmit` exits with 0 errors across all 80+ source files.
- Modern ESLint flat config (`eslint.config.js`) updated with `.trunk/**`, `audit/**`, and `demo-video/**` ignores.
- `npx eslint src api tests --max-warnings 0` passes cleanly with 0 errors and 0 warnings.
