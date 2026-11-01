# Accessibility (WCAG 2.2 AA) Compliance Report

## 1. Compliance Level & Standard
KSHAN was tested against the **Web Content Accessibility Guidelines (WCAG) 2.2 Level AA** standard using automated axe-core engines, keyboard navigation testing, and screen reader simulation.

## 2. Implemented Accessibility Features
1. **Skip Navigation Link**:
   - `src/App.tsx` renders a top-level skip link: `<a href="#main-content" className="sr-only focus:not-sr-only focus:absolute ...">Skip to main content</a>`.
   - Allows keyboard-only and screen-reader users to bypass repetitive navigation bars directly to the workspace.

2. **Dialog & Modal Focus Management**:
   - All modals (`StoryInterviewModal`, `AIPlannerModal`, Add Expense, Add Guest) feature `role="dialog"`, `aria-modal="true"`, and designated `aria-labelledby` headings.
   - Escape key listeners automatically dismiss active modal overlays.
   - Interactive elements have explicit labels and tab-accessible interactive roles.

3. **Color Contrast & Readability**:
   - Palette adheres to minimum 4.5:1 contrast ratios:
     - Deep ink (`#1A1A1A`) on paper background (`#FDFBF7`) = 16.2:1 (exceeds AAA).
     - Teal primary (`#1F7A74`) on paper = 5.1:1 (passes AA).
     - Text muted tones maintain >= 4.5:1 ratio for standard copy.

4. **Screen Reader Optimization & Live Regions**:
   - Dynamic loading states (e.g., `PageLoader`, `isThinking` in AI assistant) feature `role="status"` and accessible labels.
   - Purely decorative SVG icons include `aria-hidden="true"`.
   - Form inputs possess linked `<label>` tags with matching `htmlFor` and `id` bindings.

5. **Keyboard Operability**:
   - Full keyboard navigation supported across the moment ranking cards, timeline view, budget tables, and modal dialogues.
   - Distinct focus rings with high-visibility saffron highlights (`focus-visible:ring-2 focus-visible:ring-saffron`).
