/**
 * /api/parse — Free-text event brief parser endpoint.
 *
 * SPEC REQUIREMENT (§6):
 * - /api/parse: free-text brief -> candidate event fields for the user to edit.
 */

import type { VercelRequest, VercelResponse } from './_shared';
import { handleApiPreflight } from './_shared';
import { ParseRequestSchema } from '../src/schemas/ai';
import { runParse } from '../src/ai/client';

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  const body = await handleApiPreflight(req, res, 'POST');
  if (body === null) return;

  try {
    const validated = ParseRequestSchema.strict().parse(body);
    const result = await runParse(validated);
    res.status(200).json(result);
  } catch (err) {
    res.status(400).json({
      error: 'Invalid request parameters',
      details: (err as Error).message,
    });
  }
}
