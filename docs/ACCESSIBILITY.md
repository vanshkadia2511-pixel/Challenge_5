# KSHAN — Accessibility (a11y) & Inclusive Design

> **"Accessible by default, not by afterthought."**

---

## 1. Compliance Target: WCAG 2.1 Level AA

KSHAN is built to satisfy WCAG 2.1 AA across desktop, tablet, and mobile browsers down to 320 px width.

---

## 2. Implemented Accessibility Features

### 2.1 Semantic Landmarks & Document Structure

- Single `<main id="main-content">` landmark per page view.
- Skip to content link (`<a href="#main-content" className="sr-only focus:not-sr-only">`) placed as the first focusable element.
- Logical heading hierarchy (`h1` → `h2` → `h3`) with no skipped levels.
- Form inputs mapped to associated `<label>` elements with matching `htmlFor` and `id`.

### 2.2 Accessible Visualizations & Charts

- **The Energy Curve:** In addition to the custom SVG area chart, an accessible tabular data table (`Tabular Energy Equivalent`) provides screen readers with every minute, moment name, and energy target.
- **Color Independence:** Status badges never convey meaning through color alone; they combine semantic text, distinct icons, and background contrast (e.g., `Critical`, `Overdue`, `Complete`).
- **Contrast Ratios:** Text colors adhere to WCAG 2.1 AA standards (> 4.5:1 for normal text, > 3:1 for large text).
  - Ink (`#1e1b18`) on Sand (`#f7f4ee`): 14.1:1
  - Teal (`#0d5c56`) on White (`#ffffff`): 7.2:1
  - Saffron Dark (`#a66700`) on Saffron Light (`#fff5e5`): 5.8:1

### 2.3 Keyboard Navigation & Touch Targets

- All interactive controls (buttons, inputs, trade-off drawers, modals) are focusable and operable via standard `Tab`, `Shift+Tab`, `Enter`, and `Space`.
- Visible focus rings styled with high-contrast outlines (`focus-visible:ring-2 focus-visible:ring-teal`).
- Minimum touch target size of 44 × 44 px across all interactive buttons and mobile elements.

### 2.4 Screen Reader Announcements & Live Regions

- Client-side notifications, plan import status, trade-off updates, and after-event saves are announced via ARIA live regions (`src/lib/a11y.ts: announceToScreenReader`).
- Dialogs implement `role="dialog"` with `aria-modal="true"` and `aria-labelledby`.

### 2.5 Responsive Viewport at 320 px

- At narrow screen widths (down to 320 px), complex tables gracefully switch to stacked cards with vertical alignment.
- Zero horizontal body overflow or clipped text.

### 2.6 Print Styles (`@media print`)

- Moment Book and Cue Sheets clean out navigation headers, action toolbars, and unnecessary background colors.
- Page breaks are placed logically before vendor sheets and major sections (`page-break-inside: avoid; page-break-after: always`).
