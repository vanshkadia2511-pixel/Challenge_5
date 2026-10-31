# KSHAN — Desktop Product Demo Video Deliverables

This directory contains the complete desktop demonstration video production pipeline and final deliverables for **PromptWars Virtual · Challenge 5: Celebration & Event Planner**.

---

## 📹 Video Deliverables Summary

| Asset | Path | Resolution | Frame Rate | Duration | File Size | Format |
|---|---|:---:|:---:|:---:|:---:|:---:|
| **Full Product Demo** | `demo-video/final/demo-full.mp4` | 1920×1080 (16:9) | 30 fps | **01:38** (98.43s) | 13.48 MB | H.264 / AAC `yuv420p` +faststart |
| **30-Second Teaser** | `demo-video/final/demo-teaser-30s.mp4` | 1920×1080 (16:9) | 30 fps | **00:30** (30.00s) | 2.74 MB | H.264 / AAC `yuv420p` +faststart |
| **Video Thumbnail** | `demo-video/final/thumbnail.png` | 1920×1080 (16:9) | — | — | 626 KB | PNG |
| **Subtitles / Captions** | `demo-video/final/captions.srt` | Text (SRT) | — | 27 cues | 1.8 KB | UTF-8 SubRip |
| **Video Chapters** | `demo-video/final/chapters.txt` | Text | — | 13 markers | 850 B | Plain text |
| **FFprobe Audit** | `demo-video/final/ffprobe-report.txt` | Stream log | — | — | 5.2 KB | Raw technical dump |

---

## 💼 LinkedIn Post Copy (Under 150 Words)

Most event tools treat celebrations like accounts-payable ledgers: endless invoice rows and disconnected task checklists. When money or time runs short, they can’t answer the only question that matters: *"What do our guests actually lose if we cut this?"*

Meet **KSHAN** — our submission for PromptWars Virtual Challenge 5.

KSHAN flips celebration planning on its head: you plan and budget the 5 to 9 signature moments that define your day. Every cost, task, and vendor cue attaches directly to those moments.

✨ **Highlights shown in the demo:**
• Real-time integer paise budget allocation + 10% protected contingency
• AI Celebration Planner & 5-question host Story Interview (Review Card pattern)
• Trade-off simulator to test cuts and upgrades before committing
• Emotional energy curve balancing & backwards milestone DAG
• 1-page printable vendor cue sheets & Moment Book

Watch the full walkthrough: [VIDEO LINK]

#PromptWars #CelebrationPlanner #BuildWithGemini #React #EventTech

---

## 🏆 Three-Line Competition Submission Description

1. **What KSHAN is:** KSHAN is a moments-first celebration planner for weddings, milestone birthdays, and community events that helps hosts budget and sequence the 5 to 9 signature moments defining their gathering.
2. **How it solves Challenge 5:** It delivers an integer-paise allocation engine with a protected 10% contingency, a backwards milestone timeline, one-page printable vendor cue sheets, a 5-question host story interview, and an AI celebration companion.
3. **The KSHAN differentiator:** By combining deterministic calculations with human-reviewed AI Review Cards (Apply/Edit/Dismiss) and zero-storage local-first privacy, KSHAN ensures transparent trade-offs without compromising host agency.

---

## ⏱️ Video Chapters & Feature Mapping

| Timestamp | Chapter Title | Verified Features Demonstrated |
|---|---|---|
| `00:00` | Introduction & Philosophy | Value proposition, flowing heritage ribbon, editorial warm theme |
| `00:12` | Curated Occasion Presets | Wedding, Milestone Birthday, and Community Events occasion cards |
| `00:20` | AI Celebration Planner Modal | 3D robot mascot, conversational chat, 4-tier budget split donut chart |
| `00:36` | Celebration Studio Dashboard | Banner countdown, 4 KPI stat tiles, interactive upcoming tasks checklist |
| `00:58` | The Moment Deck & Story Interview | Importance (1–5), energy, lock toggles, 5-question host interview |
| `01:24` | Human-in-the-Loop Review Cards | Safe AI suggestion staging with Apply, Edit, and Dismiss controls |
| `01:36` | Budget Overview & Allocation | 60% circular progress gauge, monthly spend bars, integer-paise math |
| `01:58` | Trade-Off Simulator | Simulating moment cuts, previewing freed funds, redistributing budget |
| `02:16` | Backwards Timeline & Energy Curve | Milestone task DAG, emotional arc analysis, screen-reader tabular equivalent |
| `02:34` | Find Vendors Marketplace | Category filters, curated vendor cards, moment questions, favorites |
| `02:48` | Vendor Cue Sheets & Moment Book | One-page printable briefs per vendor and `@media print` celebration book |
| `02:56` | Safe CSV/JSON Exports & After-Event | Formula-safe CSV export, post-event reality scorecard, Keep/Skip ratings |
| `03:10` | Engineering Quality Proof | 115 passing Vitest tests, 0 ESLint warnings, 0 TS errors, 0 a11y violations |

---

## 🛠️ Rebuild Command

To re-record and re-compose the video pipeline from scratch, run:

```bash
# On Linux/macOS
bash demo-video/build.sh

# On Windows PowerShell
node demo-video/compose/render_cards.js
node demo-video/record/record_all_scenes.js
node demo-video/compose/generate_ffprobe_report.js
```
