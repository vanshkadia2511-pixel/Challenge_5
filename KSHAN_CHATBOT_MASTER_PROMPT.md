
# KSHAN — Master Instruction for the Coding Chatbot

Use this document as the authoritative product specification and execution contract for the KSHAN project.

## Your role
Act as the senior software architect, product engineer, UX implementer, security engineer and test engineer responsible for implementing KSHAN. Your job is to implement the specification below faithfully in the existing workspace/repository.

## Source-of-truth rules — mandatory
1. The project name is **KSHAN**. The exact tagline is **“Budget the moments, not the vendors.”** Do not rename the product, invent a second brand, or replace this identity.
2. The specification in the section **“Original KSHAN implementation specification”** below is the source of truth. Preserve its terminology, event types, domain model, feature names, formulas, constraints, stack and file layout.
3. Do not translate, paraphrase into a different product, reinterpret, silently simplify, or replace requirements with your own ideas.
4. Do not substitute a different stack. Use the specified TypeScript, React 18, Vite, Tailwind CSS, React Router, Vercel serverless functions, Zod, `@google/genai`, IndexedDB/localStorage, Vitest, React Testing Library, Playwright, axe-core, ESLint, Prettier, TypeScript checks and GitHub Actions setup.
5. Do not introduce DAYFABLE, Promise Map, Evidence Desk, FastAPI, Python, PostgreSQL or any feature/name/architecture that is not in the KSHAN specification. Do not import concepts from other projects unless the user explicitly changes the specification.
6. Do not invent product requirements, event rules, pricing, vendor availability, model names, benchmark data, test results, coverage numbers, screenshots, deployment status or external integrations.
7. Where a requirement is ambiguous or contradictory, do not guess. Record the exact ambiguity in `docs/OPEN_QUESTIONS.md`, explain the implementation decision that is blocked, and continue with independent work that is unblocked. Ask the user one focused question when a decision is essential.
8. Inspect the current workspace before editing. If an actual repository already exists, preserve its useful work, inspect its current tree and configuration, and compare it with the specified target tree. Do not delete, overwrite or restructure existing files blindly. Report meaningful differences before destructive changes.
9. Keep all original UI, copy, code and assets. Do not copy the reference projects, their branding, screenshots, README wording or visual identity. Use fictional demo data only.
10. Core planning must work without a Gemini key. AI is additive. Deterministic code owns money, dates, dependencies and validation. AI may propose language or ideas but must never directly mutate application state. Every AI result must be reviewable and must offer Apply / Edit / Dismiss.
11. Never claim that a command, test, coverage check, security check, accessibility check, build, deployment or browser flow passed unless you actually ran it and observed the result. Distinguish mocked tests from live-provider tests. Do not fabricate logs or metrics.
12. Finish the P0 vertical slice before stretch features. Do not add unrequested features merely to make the project look larger.
13. Keep modules single-purpose and files around 200 lines where practical, as specified. If a file must exceed this, explain why and keep responsibilities clear.
14. Follow the milestone reporting format below after every milestone.

## Mandatory first action: inspect, don't code blindly
Before changing code:
- Print and inspect the existing repository tree (including hidden configuration files, excluding `node_modules`, build output and secrets).
- Read `package.json`, lockfile, Vite/TypeScript/Tailwind/ESLint configuration, current source, tests, `.gitignore`, `.env.example` and deployment configuration if present.
- Identify what already exists, what is missing, what conflicts with this specification and what is currently runnable.
- Do not assume the repository is empty. Do not recreate a project that already exists.
- Produce a concise gap report mapping each required section below to `existing`, `missing`, `partial` or `conflicting`.
- Then propose the smallest safe implementation sequence. Do not start broad rewrites.

## Implementation order
Follow the source specification's schedule and priorities:
1. Scaffold, strict tooling, design tokens and CI skeleton.
2. Pure deterministic engine and templates, with tests before UI integration.
3. Moment Deck, Plan workspace, Energy Curve and local persistence.
4. Gemini endpoints, schemas, failover, fallback and review cards.
5. Moment Book, exports, After-Event log, responsive and accessibility work.
6. Playwright user journey, bug fixes and axe remediation.
7. Deployment, live-site verification and fresh-clone install check.
8. Real screenshots, README, documentation, demo video and narrative post.

If time is short, follow the source specification: cut the After-Event log, CSV and extra templates first. Never cut exact budget math, tests, deployment or honest documentation.

## Engineering rules
- Keep business logic in pure functions with no I/O. Test the engine before wiring it into the UI.
- Use integer paise for all money calculations. Never use floating-point money arithmetic.
- Use largest-remainder allocation where specified so totals reconcile exactly.
- Keep locked cost lines unchanged. Return and explain feasibility gaps rather than hiding them.
- Treat timeline dependencies as a directed acyclic graph; detect and reject cycles.
- Never mutate input plans in `cutMoment` or `upgradeMoment`.
- Every status, risk, compression or energy warning must include a human-readable reason, not rely on colour alone.
- Preserve the exact Energy Curve reason codes and thresholds from the specification.
- Share Zod schemas between client/server where specified; reject unknown keys and invalid values.
- Keep Gemini calls on the server only. Model names must come from environment configuration; do not hard-code unverified model names.
- Use bounded timeouts, failover and fallback as specified. Clearly label fallback-generated content in the UI.
- Use fictional demo values; label default prices and percentage splits as editable estimates, never as verified market quotes.
- Validate imported JSON and neutralize CSV formula injection.
- Provide accessible alternatives for visual charts, drag/reorder controls and status indicators.

## Definition of done for each milestone
A milestone is not complete merely because files were created. Verify its acceptance criteria and report:
1. **Files changed:** exact paths and purpose.
2. **Decisions:** only decisions supported by this specification; list unresolved questions separately.
3. **Commands run:** exact commands.
4. **Tests actually run:** test names/counts and observed pass/fail results; label mocks.
5. **Build/type/lint results:** observed outputs, or clearly state not run.
6. **Known limitations:** precise remaining gaps.
7. **Next smallest task:** the next concrete, minimal implementation step.

Do not start the next milestone until the current milestone's deliverables and verification report are complete, unless the user explicitly asks you to proceed in one continuous run.

## Final deliverables
The finished repository must include, as applicable to the specification:
- Working application and Vercel deployment configuration.
- `README.md`, `SECURITY.md`, `LICENSE`, `.env.example`.
- `docs/ARCHITECTURE.md`, `AI_DESIGN.md`, `TESTING.md`, `ACCESSIBILITY.md`, `DECISIONS.md`, `ANTIGRAVITY_BUILD_LOG.md`, `DEMO_SCRIPT.md`, `DEPLOYMENT.md` and real screenshots.
- Tests for the pure engine, APIs, UI and the specified end-to-end journey.
- A real demo video and an honest narrative/build-in-public post.
- No committed secrets; lockfile committed; repository within the stated 10 MB limit.

## Start response format
Your first response must contain only:
1. A confirmation that you understand KSHAN and will follow this specification without changing its identity or stack.
2. The observed repository tree summary.
3. The existing-vs-required gap report.
4. Any exact blocking questions (only if truly necessary).
5. The first milestone plan and the verification commands you intend to run.

Do not generate code until the inspection and gap report are complete.

---

# Original KSHAN implementation specification

The following section is included verbatim from the user's supplied specification. Treat every item in it as authoritative. Do not rewrite or silently modify it.

---

=====================================================================
KSHAN - COMPLETE IMPLEMENTATION STRATEGY
PromptWars Virtual, Challenge 5: Celebration & Event Planner
Tagline: "Budget the moments, not the vendors."
=====================================================================

0. MISSION AND RULES
---------------------------------------------------------------------
Build an original, moments-first celebration planner for weddings, birthdays and
community events. Required deliverables: budgets, timelines, vendor checklists,
personalised ideas, GenAI assistance. Each must be visible within 20 seconds.

Non-negotiable rules:
- Original UI, copy, code and assets. Fictional demo data only.
- Core planning works with NO Gemini key. AI is additive.
- Code owns money, dates, dependencies and validation. AI owns language only.
- AI only proposes. The user previews, edits or dismisses before anything applies.
- Never invent vendor availability, quotes or prices. Label estimates as estimates.
- Never claim a test passed unless it was executed. Never fabricate screenshots,
  coverage or logs.
- Finish the P0 vertical slice before any stretch feature.
- After every milestone report: files changed, decisions, tests actually run,
  results, known limits, next smallest task.

1. STACK
---------------------------------------------------------------------
- TypeScript (strict) everywhere, Node 22.
- Frontend: React 18, Vite, Tailwind CSS (tokens in one file), React Router.
- State: one reducer + context. No second state library.
- API: Vercel serverless functions in /api (one file per route).
- Validation: Zod schemas in /src/schemas, shared by client and server.
- AI: @google/genai, server-side only. Models listed in env GEMINI_MODELS.
- Storage: IndexedDB (fallback localStorage), JSON export and import.
- Tests: Vitest, React Testing Library, Playwright (Chromium), axe-core.
- Quality: ESLint, Prettier, tsc --noEmit, GitHub Actions CI.
- Repo under 10 MB, no secrets, lockfile committed.

2. REPOSITORY STRUCTURE
---------------------------------------------------------------------
kshan/
  README.md SECURITY.md LICENSE .env.example
  api/                 ideas.ts interview.ts parse.ts assistant.ts health.ts _shared.ts
  src/
    engine/            money.ts allocation.ts attribution.ts tradeoff.ts
                       timeline.ts energy.ts cuesheet.ts templates/ index.ts
    schemas/           event.ts moment.ts plan.ts ai.ts
    ai/                client.ts prompts.ts fallback.ts
    state/             reducer.ts storage.ts
    ui/                pages/ components/ charts/ print/
    lib/               format.ts csv.ts a11y.ts
  tests/               engine/ ui/ api/
  e2e/                 main-journey.spec.ts
  docs/                ARCHITECTURE.md AI_DESIGN.md TESTING.md ACCESSIBILITY.md
                       DECISIONS.md ANTIGRAVITY_BUILD_LOG.md DEMO_SCRIPT.md
                       DEPLOYMENT.md screenshots/
Keep every file under about 200 lines and single-purpose.

3. DOMAIN MODEL (Zod-typed)
---------------------------------------------------------------------
Event: id, title, type(wedding|birthday|community), date, city, guests,
       currency(default INR), budgetMinor, contingencyPct, setting
       (indoor|outdoor|hybrid), notes.
Moment: id, name, importance(1-5), energyTarget(1-5), startMinute, durationMin,
        guestImpact(0-1), locked, notes.
CostLine: id, label, kind(direct|shared), amountMinor, locked, status
        (estimate|quoted|confirmed), momentIds, usageWeights{momentId:number}.
Task: id, title, momentId?, leadDays, dueDate, status, owner, dependsOn[],
      critical.
Vendor: id, category, name, momentIds, status(not-contacted|contacted|quoted|
        selected|contracted), questions[], deadline.
Idea: id, momentId, tier(simple|standard|special), text, estimateMinor?,
      source(ai|fallback).
Plan: event, moments, costLines, tasks, vendors, ideas, audit[].
All money is integer paise. Never floats.

4. ENGINE (pure functions, no I/O, test first)
---------------------------------------------------------------------
4.1 money.ts: parse/format INR with lakh grouping; add/sub/safe-divide helpers.
4.2 allocation.ts (Moment Budget):
  - usable = budget - contingency (contingency default 10%, protected).
  - subtract locked lines; remaining = usable - locked.
  - weight per moment = importance * (1 + guestImpact) (priorities boost x1.25).
  - allocate with largest-remainder so allocations sum EXACTLY to remaining.
  - if remaining < 0 or minimum floors exceed budget, return feasibilityGap
    (amount + explanation); never hide it.
  - edge cases: zero budget, zero guests, all locked, huge values, negatives.
4.3 attribution.ts (Shared cost attribution):
  - shared lines (venue, sound, decor, lighting) split across moments in
    proportion to usageWeights; remainder by largest-remainder.
  - output: costPerMoment, costPerGuestPerMoment, share of total.
4.4 tradeoff.ts:
  - cutMoment(plan, id) and upgradeMoment(plan, id, deltaMinor) are PURE: return
    {before, after, freedMinor, tasksRemoved, vendorsAffected, warnings}.
  - never mutate the input plan (test with deep-freeze).
4.5 timeline.ts:
  - tasks generated from templates, due = eventDate - leadDays.
  - dependency DAG; detect cycles and reject; propagate delays downstream.
  - if event is closer than the recommended lead time, compress and EXPLAIN
    ("Compressed from 120 to 45 days: venue and caterer moved first").
  - states: complete, due-soon, overdue, at-risk, impossible, each with a reason.
4.6 energy.ts (Energy Curve):
  - day split into segments from moments + gaps. Planned energy = moment
    energyTarget, 2 for gaps, interpolation for transitions.
  - flags with reason codes: LULL (>= 90 min below 3 with no moment), RUSHED
    (transition < 10 min between high-energy moments), UNSUPPORTED_PEAK (target
    5 with no moment), OVERLONG (any block > 3 hours).
  - always output a text/table equivalent of the chart.
4.7 cuesheet.ts: per vendor, only their moments, exact times, questions, deadline.
4.8 templates/: wedding, birthday, community. Each has 6-9 moments, cost
    categories with default percentage splits, tasks with lead times, vendor
    types with questions. Defaults are editable estimates, not market quotes.

5. TEMPLATE CONTENT (starting points)
---------------------------------------------------------------------
Wedding moments: Arrival & Welcome, Family Blessing, Ceremony, Couple Portraits,
  Toasts, Dinner, First Dance, Send-off.
Birthday moments: Arrival, Surprise Reveal, Games/Activity, Cake Moment, Speeches,
  Dinner/Snacks, Group Photo, Wind-down.
Community moments: Opening Ceremony, Performances, Food Stalls, Volunteer Shift
  Change, Raffle/Awards, Community Photo, Closing & Clean-up.
Vendor types: venue, caterer, decor, sound/AV, photographer, entertainment,
  transport, permits (community).

6. AI LAYER
---------------------------------------------------------------------
Endpoints (all POST, JSON, Zod-validated, rate-limited):
- /api/interview: 5 host answers -> proposed moments (name, importance, why).
- /api/ideas: momentId + context -> 3 ideas (simple/standard/special) with
  optional price BANDS labelled estimates.
- /api/parse: free-text brief -> candidate event fields for the user to edit.
- /api/assistant: question + validated plan snapshot -> grounded answer.
Controls:
- System prompt separate from user text; wrap user text in delimiters and state
  that it is data, not instructions.
- Strict Zod output schema; reject unknown keys and bad enums; cap lengths.
- 8 s timeout per model, ordered failover from GEMINI_MODELS, short cooldown for
  failing models, bounded retries with backoff.
- Fallback: template-based ideas and rule-based interview results. The UI shows
  "Generated by the built-in planner" when fallback is used.
- Send aggregates (counts, moments), not private details. Do not log user content.
- Model names only from env; never hard-code unverified names.
- Every AI result renders as a review card with Apply / Edit / Dismiss.

7. API SECURITY
---------------------------------------------------------------------
Key in env only, sent in a header, never logged or sent to the browser.
Body size cap (64 KB), per-IP rate limit (20 AI requests/min), exact-origin CORS,
CSP + HSTS + nosniff + Referrer-Policy + frame restrictions, consistent
non-sensitive error responses, no raw provider errors shown. Frontend: no
innerHTML, escaped output, schema-validated JSON import (reject __proto__,
constructor, prototype), CSV formula neutralisation (=, +, -, @ prefixes),
size and consistency checks on imports.

8. UI AND VISUAL DIRECTION
---------------------------------------------------------------------
Original identity: warm, editorial, calm. Suggested tokens (verify AA contrast):
ink #1F2A37, paper #FBF7F0, saffron #E8A33D, teal #1F7A74, rose #C4476A,
mist #ECE7DD. Serif for headings, readable sans for data, tabular numerals.
Custom SVG "moment ribbon" (a horizontal timeline of beads, one per moment) as the
brand motif. No stock wedding photos. Original logo mark and wordmark.

Pages:
1. Landing: hero, one interactive moment ribbon demo, three occasion cards,
   "how it works", trust notes (estimates labelled, AI reviewable, works offline
   from AI), footer links.
2. Moment Deck (builder): event details form, template pick, drag/keyboard
   reorder and rate moments, Story Interview panel.
3. Plan workspace (one page, sections not generic tabs): Moment Budget table with
   cost per moment, trade-off preview drawer, Timeline, Vendor Cue Sheets, Ideas.
4. Energy Curve: SVG chart + table equivalent + flag list.
5. Moment Book (print view) and CSV/JSON export.
6. After-Event log: actual spend per moment, keep/skip rating, notes.
A persistent summary bar shows total, allocated, contingency and open warnings.
Responsive from 320 px. Mobile uses stacked cards instead of shrunken tables.

9. ACCESSIBILITY
---------------------------------------------------------------------
Landmarks, heading order, labelled inputs, linked error summary, keyboard-operable
reorder and trade-off controls, visible focus, AA contrast, reduced motion,
status by text + icon + colour, chart with equivalent table, touch targets >= 44px,
no horizontal page scroll at 320 px. Run axe in Playwright on every key page.

10. TEST PLAN
---------------------------------------------------------------------
Engine (Vitest, property-style where useful):
- allocations always sum exactly; shared attribution sums to line amount.
- locked lines unchanged; zero/negative/huge inputs handled.
- feasibility gap reported when impossible.
- cutMoment/upgradeMoment do not mutate input.
- timeline cycle rejected; delay propagation correct; compression explained.
- energy flags fire on constructed cases and stay quiet on a healthy day.
API: schema rejection, unknown keys, oversize body, rate limit, bad origin,
timeout, failover order, fallback used, prompt-injection text treated as data.
UI: builder validation, edit-after-AI, apply/dismiss flow, print view, import
rejection, keyboard reorder.
E2E (Playwright): create wedding -> pick 6 moments -> see cost per moment -> cut one
-> energy flag -> run interview (mocked + fallback) -> open cue sheet -> print book.
Report unit, integration and e2e counts separately; label mocked tests as mocked.

11. SCHEDULE (assume about 40 hours; verify the real deadline first)
---------------------------------------------------------------------
H0-2    Scaffold, lint/type/test commands, design tokens, CI skeleton.
H2-10   Engine + templates + unit tests (money, allocation, attribution,
        tradeoff, timeline, energy, cuesheet).
H10-18  Moment Deck, Plan workspace, Energy Curve, local storage.
H18-24  Gemini endpoints, schemas, failover, fallback, review cards.
H24-30  Moment Book, exports, After-Event log, responsive and a11y pass.
H30-34  Playwright journey, bug fixing, axe fixes.
H34-37  Deploy, verify on the live URL, fresh-clone install check.
H37-40  Real screenshots, README, docs, demo video, LinkedIn/blog post.
If time is short, cut: After-Event log, CSV, extra templates. Never cut: exact
budget math, tests, deployment, honest docs.

12. DEPLOYMENT
---------------------------------------------------------------------
Vercel: frontend + /api functions. Env: GEMINI_API_KEY, GEMINI_MODELS,
AI_TIMEOUT_MS, AI_RATE_LIMIT_MAX. Verify /api/health, the no-key fallback, CSP and
headers on the live site, and that the repo has no secrets.

13. DOCUMENTATION AND SUBMISSION
---------------------------------------------------------------------
README order: identity + links; real screenshots; problem; requirement table;
user journey; architecture; AI vs code; security; tests and coverage from a real
run; accessibility; run locally; known limits; Antigravity build log.
Keep ANTIGRAVITY_BUILD_LOG.md with genuine prompts and iterations.
Demo video (2:30): problem; create event; moments + cost per moment; cut one and
show trade-off; Energy Curve flag; Story Interview; vendor Cue Sheet; print book.
Narrative post: problem, why moments-first, how Antigravity was used, AI vs code
split, a real example, test results and gaps, links. Avoid unproven claims like
"best", "100% secure" or "production-grade".

14. FINAL CHECKLIST
---------------------------------------------------------------------
[ ] All three event types work   [ ] Budget sums exactly   [ ] DAG + cycles tested
[ ] Works with no Gemini key     [ ] AI never mutates state [ ] a11y checks pass
[ ] CI green                     [ ] Live URL works        [ ] No secrets in repo
[ ] README numbers are from real runs  [ ] Demo shows the deployed app
[ ] Submission form fields and deadline rechecked right before submitting
=====================================================================
