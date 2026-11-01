/**
 * /api/ideas — Moment Ideas endpoint providing 3 ideas across tiers.
 * Pure Node.js HTTP handler for Vercel Fluid Functions (Node 26.x).
 */

import type { IncomingMessage, ServerResponse } from 'node:http';
import { handleApiPreflight, sendJson } from './_shared';
import { IdeasRequestSchema } from '../src/schemas/ai';
import { runIdeas } from '../src/ai/client';

export default async function handler(req: IncomingMessage, res: ServerResponse): Promise<void> {
  const body = await handleApiPreflight(req, res, 'POST');
  if (body === null) return;

  try {
    const validated = IdeasRequestSchema.strict().parse(body);
    const result = await runIdeas(validated);
    sendJson(res, 200, result);
  } catch (err) {
    sendJson(res, 400, {
      error: 'Invalid request parameters',
      details: (err as Error).message,
    });
  }
}
