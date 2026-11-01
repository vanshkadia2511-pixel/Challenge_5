# Security & Privacy Hardening Report

## 1. Secrets Management & API Protection
- **No Client-Side Leaks**: With the decoupling of `StoryInterviewModal.tsx`, no client bundle contains references to `GoogleGenAI` initialization or browser-accessible API keys.
- **Serverless Boundary**: All calls to the Gemini API are mediated by Vercel serverless routes (`api/interview.ts`, `api/assistant.ts`, `api/ideas.ts`, `api/parse.ts`).
- **Local Environment Isolation**: `GEMINI_API_KEY` is loaded exclusively from `.env` on Node runtimes and ignored by `.gitignore`. No keys are checked into source control.

## 2. Serverless API Defenses (`api/_shared.ts`)
The serverless gateway implements rigorous enterprise defenses:
- **Rate Limiting**: Sliding window rate-limiting per client IP address.
- **Strict Method Enforcing**: Endpoints reject unsupported HTTP verbs immediately.
- **Payload Size Caps**: Strict 64 KB JSON body limit preventing memory exhaustion or DOS attacks.
- **CORS Hardening**: Strict headers preventing cross-site request abuse.
- **Input Validation**: Schema validation using Zod (`.strict()`) for all incoming request bodies, stripping unexpected fields and rejecting prototype pollution vectors.

## 3. Data Privacy & Storage Security
- **Local-First Architecture**: Plan data is persisted inside the user's browser using IndexedDB (with `localStorage` fallback).
- **Minimal PII Exposure**: When querying the AI assistant, only sanitized aggregated metadata is sent (event type, guest count, total budget, moment names). No personal names, notes, addresses, or private phone numbers are ever transmitted to external model endpoints.

## 4. HTTP Headers & Deployment Security (`vercel.json`)
The application defines defense-in-depth HTTP security headers:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`
- `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`
- Content Security Policy (CSP) blocking external unauthorized script evaluation and frame embedding.
