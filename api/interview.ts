/**
 * /api/interview — Story Interview endpoint proposing moments from 5 host answers.
 *
 * SPEC REQUIREMENT (§6):
 * - /api/interview: 5 host answers -> proposed moments (name, importance, why).
 */

import type { VercelRequest, VercelResponse } from './_shared';
import { handleApiPreflight } from './_shared';
import { InterviewAnswersSchema } from '../src/schemas/ai';
import { runInterview } from '../src/ai/client';

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  const body = await handleApiPreflight(req, res, 'POST');
  if (body === null) return; // Response handled by preflight check

  try {
    const validated = InterviewAnswersSchema.strict().parse(body);
    const result = await runInterview(validated);
    res.status(200).json(result);
  } catch (err) {
    res.status(400).json({
      error: 'Invalid request parameters',
      details: (err as Error).message,
    });
  }
}
