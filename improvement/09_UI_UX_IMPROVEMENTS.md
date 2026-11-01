# UI / UX Polish & Design System Alignment

## 1. Design System & Aesthetic Language
KSHAN is built around a distinct, human-centric design system:
- **Palette**:
  - `paper`: Warm ivory background (`#FDFBF7`) providing organic warmth over sterile white.
  - `ink`: High-contrast charcoal text (`#1A1A1A`) for effortless legibility.
  - `teal`: Primary grounding accent (`#1F7A74`) representing clarity, calm, and celebration structure.
  - `saffron`: Celebratory Indian gold (`#E8A33D`) celebrating joy, focal points, and active moments.
  - `berry`: Accent rose (`#C4476A`) for high-importance highlights and alert badges.
- **Typography**:
  - Serif headings (`Playfair Display` / serif fallbacks) conveying emotional celebration gravity.
  - Sans body (`Inter` / system sans) for dense tabular and logistical budget readability.

## 2. Interaction Improvements
1. **Route Code Splitting with Suspense**:
   - Added seamless page-level transition loader (`PageLoader`) in `App.tsx` displaying an animated saffron spinner and subtle feedback, preventing layout shifts during route transitions.

2. **AI Companion Interaction**:
   - Upgraded `AIPlannerModal.tsx` with dynamic visual states:
     - Clear robot avatar branding.
     - Interactive budget donut chart with color-coded categories.
     - Single-click "Apply to Budget" action directly committing AI-suggested categories into the plan's cost lines.
     - Real-time `isThinking` loading indicator disabling duplicate submissions.

3. **Expense Moment Selector**:
   - Upgraded the Add Expense dialogue in `PlanWorkspacePage.tsx` with an explicit moment selection dropdown, enabling users to clearly see which moment incurs what cost.

4. **Print Optimization**:
   - Vendor Cue Sheets feature dedicated CSS print rules (`@media print`) rendering clean, distraction-free single-page briefs with vendor contact details, moment cues, and interview prompts.
