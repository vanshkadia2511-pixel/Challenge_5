# Security Policy

## Supported Versions

| Version | Supported |
|---------|-----------|
| 0.x     | ✅        |

## Reporting a Vulnerability

Please **do not** report security vulnerabilities in GitHub Issues.

Email a description of the vulnerability, the steps to reproduce it and the potential impact to the project maintainers. You should receive an acknowledgement within 48 hours and a status update within 7 days.

## Security Model

- **Gemini API key** is stored only in server-side environment variables and is never exposed to the browser.
- **No user accounts or server-side storage** — your plan stays in your browser.
- **Input validation** — all API endpoints validate inputs with Zod schemas. Unknown keys are rejected. Body size is capped at 64 KB.
- **Rate limiting** — 20 AI requests per minute per IP.
- **Security headers** — CSP, HSTS, X-Content-Type-Options, X-Frame-Options and Referrer-Policy are set on every response.
- **No unsafe HTML rendering** — `innerHTML` is not used. All output is escaped by React.
- **JSON imports** are schema-validated; `__proto__`, `constructor` and `prototype` keys are rejected.
- **CSV exports** neutralise formula injection (`=`, `+`, `-`, `@` prefixes are escaped).
- **Demo data is fictional** — no real vendor prices, availability or quotes are used or implied.

