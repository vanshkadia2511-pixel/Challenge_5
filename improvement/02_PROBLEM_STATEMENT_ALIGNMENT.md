# Problem Statement & Challenge Alignment Analysis

## 1. Challenge 5 Overview
- **Competition**: Hack2Skill / PromptWars Virtual Challenge 5 — Celebration & Event Planner.
- **Tagline**: "Budget the moments, not the vendors."
- **Paradigm**: Moment-First Celebration Planning.

Traditional event management tools treat celebrations like procurement workflows: spreadsheet line items for caterers, decorators, DJs, and venue fees. This often causes hosts to overspend on secondary vendor logistics while diluting the key emotional memories they sought to create.

KSHAN flips this dynamic by establishing **Moments** as the primary primitive:
1. **Discover & Rank Moments**: Prioritizing 5–9 signature moments using paired comparisons and Fibonacci weights.
2. **Moment Budget**: Allocating funds by emotional importance with an automatic 10% unallocated safety contingency.
3. **Trade-Off Simulator**: Visualizing the zero-sum impact when increasing funding for one moment versus others.
4. **Backwards Timeline**: Calculating critical path schedules backwards from the celebration hour.
5. **Energy Curve**: Balancing physical and emotional guest fatigue across the day.
6. **Vendor Cue Sheets**: Translating moments into isolated, moment-specific briefs for photographers, DJs, and caterers.
7. **Moment Book & After-Event Log**: Evaluating how planned moments materialized in reality, preserving photos, audio notes, and retrospective ratings.

## 2. Traceability Matrix

| Challenge Requirement | KSHAN Implementation | Verification Status |
|---|---|---|
| Moment-first budget allocation | `src/engine/allocation.ts` with 10% reserve | Verified (Pure unit tested) |
| Paired comparison / ranking | `src/ui/pages/MomentDeckPage.tsx` | Verified (UI tested) |
| Backwards timeline generation | `src/engine/timeline.ts` | Verified (Topological sort) |
| Energy curve balance | `src/engine/energy.ts` | Verified (Peak-end rule compliance) |
| Vendor coordination briefs | `src/engine/cuesheet.ts` | Verified (Single-page cue sheet generator) |
| Gemini AI integration | `/api/interview.ts`, `/api/assistant.ts` | Hardened & Serverless decoupled |
| Offline resilience | `src/ai/fallback.ts` rule-based engine | Verified (100% offline fallback) |
| Zero-loss local storage | IndexedDB + localStorage fallback | Verified schema validation |

## 3. Innovation & Differentiation
KSHAN avoids the pitfall of generic CRUD vendor directories by offering **Attributed Cost Accounting**. Shared expenses (like venue rental or banquet tables) are algorithmically allocated across the specific moments that utilize them, giving hosts true visibility into the real cost of each celebration highlight.
