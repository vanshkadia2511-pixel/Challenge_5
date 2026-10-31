# KSHAN — Deployment & Live Production Guide

Instructions for deploying KSHAN on Vercel with serverless API functions and environment variables.

---

## 1. Prerequisites

- Node.js 22+
- Vercel CLI (`npm install -g vercel`) or Vercel Git integration (GitHub/GitLab)
- Google Gemini API Key (`GEMINI_API_KEY`)

---

## 2. Environment Variables

Configure these in the Vercel Project Dashboard (under **Settings > Environment Variables**) or in local `.env`:

| Variable | Required | Description | Example |
|---|---|---|---|
| `GEMINI_API_KEY` | Optional | Google Gemini API key. If absent, fallback rule-based planner runs smoothly with 0 errors. | `AIzaSy...` |
| `GEMINI_MODELS` | Optional | Comma-separated list of Gemini models in failover order. | `gemini-2.5-flash,gemini-1.5-flash` |
| `ALLOWED_ORIGIN` | Optional | Allowed CORS origin. Defaults to `*` in local dev or incoming request origin. | `https://kshan.vercel.app` |

---

## 3. Deployment Commands

### Deploy via Vercel CLI

```bash
# 1. Login to Vercel
vercel login

# 2. Deploy preview build
vercel

# 3. Deploy to production
vercel --prod
```

### Deploy via Git Push
1. Push this repository to GitHub.
2. In the Vercel dashboard, click **Add New Project** and select the repository.
3. Keep the defaults configured in `vercel.json`:
   - Framework Preset: `Other`
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. Add `GEMINI_API_KEY` in Environment Variables.
5. Click **Deploy**.

---

## 4. Post-Deployment Verification Checklist

Verify the live URL:
1. `GET /api/health`: Should return status `200 OK` with JSON confirming models and rate limiter.
2. `POST /api/interview`: Test preflight headers and rate limiting.
3. Security Headers:
   ```bash
   curl -I https://<your-deployment>.vercel.app
   ```
   Confirm presence of:
   - `X-Content-Type-Options: nosniff`
   - `X-Frame-Options: DENY`
   - `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`
   - `Content-Security-Policy`
4. Client Navigation: Verify client-side SPA routes (`/deck`, `/plan`, `/energy`, `/book`, `/after`) refresh properly via `vercel.json` rewrites.
