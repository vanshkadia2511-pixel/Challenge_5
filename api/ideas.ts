/**
 * /api/ideas — Moment Ideas endpoint providing 3 ideas across tiers.
 *
 * SPEC REQUIREMENT (§6):
 * - /api/ideas: momentId + context -> 3 ideas (simple/standard/special)
 *   with optional price BANDS labelled estimates.
 */

import type { VercelRequest, VercelResponse } from './_shared';
import { handleApiPreflight } from './_shared';
import { IdeasRequestSchema } from '../src/schemas/ai';
import { runIdeas } from '../src/ai/client';

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  const body = await handleApiPreflight(req, res, 'POST');
  if (body === null) return;

  try {
    const validated = IdeasRequestSchema.strict().parse(body);
    const result = await runIdeas(validated);
    res.status(200).json(result);
  } catch (err) {
    res.status(400).json({
      error: 'Invalid request parameters',
      details: (err as Error).message,
    });
  }
}
