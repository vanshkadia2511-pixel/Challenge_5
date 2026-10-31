# KSHAN — Verified Feature Matrix

This matrix documents every user-facing feature audited in the running KSHAN application prior to recording the desktop product demonstration video for PromptWars Virtual Challenge 5.

| # | Feature | Where in the UI | What the user does | Challenge requirement it satisfies | Verified in current app? | Included in video (timestamp) |
|---|---|---|---|---|---|---|
| 1 | **Landing Page & Heritage Branding** | Route `/` | Explores value proposition, flowing heritage ribbon, editorial warm aesthetic, and overview | Event Types / Brand Identity | Yes | 0:08 |
| 2 | **Occasion Templates (Wedding, Birthday, Community)** | Route `/` (Occasion Cards) | Selects curated celebration template (Wedding, Birthday, or Community Events) with preloaded moments | Event Types (all 3 supported) | Yes | 0:17 |
| 3 | **AI Celebration Planner Modal** | Global trigger / Modal | Opens AI companion with 3D robot mascot, receives 4-tier budget split donut and action chips | GenAI Assistant / Budgets | Yes | 0:26 |
| 4 | **Celebration Studio Dashboard** | Route `/plan` | Reviews high-level celebration KPIs: countdown, budget spent/remaining, guest count, and task progress ring | Budgets / Timelines | Yes | 0:38 |
| 5 | **Upcoming Tasks Checklist** | Route `/plan` (Task Panel) | Checks off milestone tasks interactively, updating completion metrics in real time | Timelines / Checklists | Yes | 0:48 |
| 6 | **Quick Action Modals (Add Guests / Add Expense)** | Route `/plan` (Quick Actions) | Updates guest headcount and logs manual celebration expenses through dedicated accessible modals | Budgets / Event Setup | Yes | 0:56 |
| 7 | **The Moment Deck** | Route `/deck` | Tunes signature moments: adjusts host importance (1–5), target energy (1–5), guest impact multipliers, and locks must-haves | Budgets / Personalised Moments | Yes | 1:06 |
| 8 | **Story Interview (5 Questions)** | Route `/deck` (Modal) | Answers 5-question host narrative interview; parses story into structured moments and review cards | GenAI Assistant / Ideas | Yes | 1:18 |
| 9 | **Review Card Pattern (Apply/Edit/Dismiss)** | Route `/deck` (Suggestions) | Reviews AI-suggested moments; host maintains agency by choosing Apply, Edit, or Dismiss | GenAI Assistant / Human-in-the-Loop | Yes | 1:30 |
| 10 | **Budget Overview & Analytics** | Route `/plan` (Budget Section) | Inspects circular 60% budget allocation, monthly planned vs actual bar chart, and AI savings tip | Budgets | Yes | 1:40 |
| 11 | **Moment Budget & Shared Cost Attribution** | Route `/plan` (Moment Budget) | Views integer-paise allocation, protected 10% contingency, and shared costs (venue, decor, sound) attributed across moments | Budgets | Yes | 1:50 |
| 12 | **Trade-Off Simulator Drawer** | Route `/plan` (Trade-off Drawer) | Simulates cutting or upgrading a moment; previews freed funds, redistributed budget, and removed tasks before committing | Budgets / Trade-offs | Yes | 2:02 |
| 13 | **Backwards Timeline Engine** | Route `/plan#timeline` | Inspects milestone tasks counted backwards from event date with dependency ordering and compression warnings | Timelines | Yes | 2:14 |
| 14 | **The Energy Curve** | Route `/energy` | Visualizes emotional arc of the day, detects awkward lulls or rushed transitions, and inspects accessible tabular equivalent | Timelines / Energy Balancer | Yes | 2:24 |
| 15 | **Find Vendors Marketplace** | Route `/vendors` | Searches and filters curated vendors by category (Venues, Decorators, Caterers, Photographers), views cue sheet questions, and adds vendors to event | Vendor Checklists | Yes | 2:36 |
| 16 | **Vendor Cue Sheets** | Route `/plan#cuesheets` | Generates 1-page per-vendor execution briefs showing only their moments, 24h/12h start/end times, and cue triggers | Vendor Checklists | Yes | 2:48 |
| 17 | **The Moment Book (Print View)** | Route `/book` | Opens printable celebration master guide formatted for `@media print` with clean unstyled layout | Vendor Checklists / Timelines | Yes | 2:56 |
| 18 | **Data Export (JSON & CSV)** | Route `/book` (Export toolbar) | Exports full celebration plan in structured JSON and sanitized formula-injection-safe CSV | Data Portability / Local-First | Yes | 3:04 |
| 19 | **After-Event Log & Scorecard** | Route `/after` | Enters actual spend, calculates net variance against planned budget, and logs Keep/Skip reflections for future events | Budgets / Event Lifecycle | Yes | 3:12 |
| 20 | **Engineering Quality & Test Proof** | Terminal / Architecture | Runs 115 passing Vitest tests, 0 ESLint warnings, 0 TypeScript errors, 0 axe WCAG 2.1 AA violations | Code Quality & Reliability | Yes | 3:20 |

---

### Non-Implemented / Out-of-Scope Capabilities (Confirmed Absent from Codebase)
As documented in `README.md` ("Known Boundaries"), the following capabilities are deliberately **not** part of KSHAN:
* ❌ Real-time live vendor bidding or payment processing (prices are starter estimates).
* ❌ Remote cloud database or user registration accounts (pure local-first IndexedDB).
* ❌ Multi-user real-time concurrent editing.
* ❌ Live RSVP tracking or interactive seating charts.
