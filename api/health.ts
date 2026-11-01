/**
 * /api/health — System and AI layer health check.
 * Pure Node.js HTTP handler compatible with Vercel Fluid Functions (Node 26.x).
 */

import type { IncomingMessage, ServerResponse } from 'node:http';

export default function handler(req: IncomingMessage, res: ServerResponse): void {
  // Set CORS and security headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  if (req.method === 'OPTIONS') {
    res.statusCode = 200;
    res.end('OK');
    return;
  }

  if (req.method !== 'GET' && req.method !== 'POST') {
    res.statusCode = 405;
    res.end(JSON.stringify({ error: 'Method not allowed' }));
    return;
  }

  const hasApiKey = Boolean(
    process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim().length > 0,
  );

  const models = process.env.GEMINI_MODELS
    ? process.env.GEMINI_MODELS.split(',').map((m) => m.trim())
    : ['gemini-1.5-flash', 'gemini-1.5-flash-8b'];

  res.statusCode = 200;
  res.end(
    JSON.stringify({
      status: 'ok',
      app: 'KSHAN',
      tagline: 'Budget the moments, not the vendors.',
      ai: {
        hasKey: hasApiKey,
        models,
        fallbackReady: true,
        mode: hasApiKey ? 'live_provider' : 'built_in_fallback',
      },
      timestamp: Date.now(),
    }),
  );
}
