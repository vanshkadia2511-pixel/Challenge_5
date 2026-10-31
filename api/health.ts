/**
 * /api/health — System and AI layer health check.
 *
 * SPEC REQUIREMENT (§12):
 * Verify /api/health, the no-key fallback, CSP and headers on the live site,
 * and that the repo has no secrets.
 */

import type { VercelRequest, VercelResponse } from './_shared';
import { applySecurityHeaders } from './_shared';

export default function handler(req: VercelRequest, res: VercelResponse): void {
  applySecurityHeaders(res);

  if (req.method !== 'GET' && req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const hasApiKey = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim().length > 0);
  const models = process.env.GEMINI_MODELS
    ? process.env.GEMINI_MODELS.split(',').map((m) => m.trim())
    : ['gemini-1.5-flash', 'gemini-1.5-flash-8b'];

  res.status(200).json({
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
  });
}
