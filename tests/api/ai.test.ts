/// <reference types="vitest/globals" />
import {
  generateFallbackInterview,
  generateFallbackIdeas,
  generateFallbackParse,
  generateFallbackAssistant,
} from '../../src/ai/fallback';
import { runInterview, runIdeas, runParse, runAssistant } from '../../src/ai/client';

describe('AI Layer & Fallback Services', () => {
  it('generateFallbackInterview generates 5 to 8 moments from answers', () => {
    const res = generateFallbackInterview({
      eventType: 'wedding',
      answers: [
        'Close family and friends',
        'Traditional rituals with modern party',
        'Dancing all night',
        'Warm and welcoming',
        'Long boring speeches',
      ],
    });

    expect(res.source).toBe('fallback');
    expect(res.moments.length).toBeGreaterThanOrEqual(5);
    expect(res.moments.length).toBeLessThanOrEqual(8);
    for (const m of res.moments) {
      expect(m.importance).toBeGreaterThanOrEqual(1);
      expect(m.importance).toBeLessThanOrEqual(5);
      expect(m.why.length).toBeGreaterThan(0);
    }
  });

  it('generateFallbackIdeas generates 3 tiered ideas with estimates', () => {
    const res = generateFallbackIdeas({
      momentId: 'm1',
      momentName: 'First Dance',
      eventType: 'wedding',
      guests: 150,
      momentBudgetMinor: 5_000_000,
    });

    expect(res.source).toBe('fallback');
    expect(res.ideas).toHaveLength(3);
    const tiers = res.ideas.map((i) => i.tier);
    expect(tiers).toEqual(['simple', 'standard', 'special']);

    for (const idea of res.ideas) {
      expect(Number.isInteger(idea.estimateMinor)).toBe(true);
      expect(idea.text).toContain('First Dance');
    }
  });

  it('generateFallbackParse extracts candidate fields from brief text', () => {
    const brief = 'Planning a 30th birthday celebration in Bengaluru for 80 guests with 4 lakhs budget.';
    const res = generateFallbackParse({ brief });

    expect(res.source).toBe('fallback');
    expect(res.fields.type).toBe('birthday');
    expect(res.fields.city).toBe('Bengaluru');
    expect(res.fields.guests).toBe(80);
    expect(res.fields.budgetMinor).toBe(40_000_000); // 4 lakhs in paise
  });

  it('generateFallbackAssistant grounds answer in plan summary', () => {
    const res = generateFallbackAssistant({
      question: 'How is our budget looking?',
      planSummary: {
        eventType: 'wedding',
        momentCount: 8,
        momentNames: ['Blessing', 'Ceremony', 'Dinner'],
        totalBudgetMinor: 50_000_000,
        guests: 100,
      },
    });

    expect(res.source).toBe('fallback');
    expect(res.answer).toContain('wedding');
    expect(res.answer).toContain('5,00,000');
  });

  it('runInterview falls back gracefully when GEMINI_API_KEY is unset (mocked offline)', async () => {
    const origKey = process.env.GEMINI_API_KEY;
    delete process.env.GEMINI_API_KEY;

    const res = await runInterview({
      eventType: 'birthday',
      answers: ['Fun', 'Friends', 'Games', 'Cake', 'No formality'],
    });

    expect(res.source).toBe('fallback');
    expect(res.moments.length).toBeGreaterThan(0);

    if (origKey !== undefined) {
      process.env.GEMINI_API_KEY = origKey;
    }
  });

  it('runIdeas falls back gracefully when GEMINI_API_KEY is unset', async () => {
    const origKey = process.env.GEMINI_API_KEY;
    delete process.env.GEMINI_API_KEY;

    const res = await runIdeas({
      momentId: 'm-cake',
      momentName: 'Cake Cutting',
      eventType: 'birthday',
      guests: 50,
      momentBudgetMinor: 1_000_000,
    });

    expect(res.source).toBe('fallback');
    expect(res.ideas).toHaveLength(3);

    if (origKey !== undefined) {
      process.env.GEMINI_API_KEY = origKey;
    }
  });

  it('runParse falls back gracefully when GEMINI_API_KEY is unset', async () => {
    const origKey = process.env.GEMINI_API_KEY;
    delete process.env.GEMINI_API_KEY;

    const res = await runParse({ brief: 'Community festival in Delhi with 500 attendees' });

    expect(res.source).toBe('fallback');
    expect(res.fields.type).toBe('community');

    if (origKey !== undefined) {
      process.env.GEMINI_API_KEY = origKey;
    }
  });

  it('runAssistant falls back gracefully when GEMINI_API_KEY is unset', async () => {
    const origKey = process.env.GEMINI_API_KEY;
    delete process.env.GEMINI_API_KEY;

    const res = await runAssistant({
      question: 'What moments do we have?',
      planSummary: {
        eventType: 'community',
        momentCount: 5,
        momentNames: ['Opening', 'Food Stalls', 'Awards'],
        totalBudgetMinor: 10_000_000,
        guests: 200,
      },
    });

    expect(res.source).toBe('fallback');
    expect(res.answer.length).toBeGreaterThan(0);

    if (origKey !== undefined) {
      process.env.GEMINI_API_KEY = origKey;
    }
  });
});
