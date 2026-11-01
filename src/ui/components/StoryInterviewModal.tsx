/**
 * StoryInterviewModal.tsx — 5-question host interview flow proposing signature moments.
 *
 * SPEC REQUIREMENT (§6, §8):
 * Story Interview with Gemini: five questions about the host's story produce
 * moments and ideas at three budget tiers. Gemini proposes; the user reviews and applies.
 */

import { useState } from 'react';
import { useAppContext } from '../../state/context';
import { generateFallbackInterview } from '../../ai/fallback';
import type { InterviewResultMoment, InterviewResult } from '../../schemas/ai';

interface StoryInterviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onMomentsGenerated: (moments: InterviewResultMoment[], source: 'ai' | 'fallback') => void;
}

const QUESTIONS = [
  'What is the emotional heart or primary purpose of this celebration?',
  'Who are the most important people, families, or groups gathering?',
  'What is one personal memory, tradition, or shared inside joke you want to honor?',
  'What vibe or emotional trajectory should guests experience (e.g. relaxed, joyful, energetic)?',
  'What is one generic cliché or annoyance you definitely want to avoid?',
];

export function StoryInterviewModal({
  isOpen,
  onClose,
  onMomentsGenerated,
}: StoryInterviewModalProps) {
  const { state, dispatch } = useAppContext();
  const [guests, setGuests] = useState<number>(state.plan.event.guests);
  const [city, setCity] = useState<string>(state.plan.event.city);
  const [budget, setBudget] = useState<number>(state.plan.event.budgetMinor / 100);
  const [answers, setAnswers] = useState<string[]>([
    'Celebrating our journey with close friends and honoring family blessings.',
    'Our parents, siblings, and childhood college friends.',
    'Late-night acoustic jam sessions and cutting the cake together.',
    'Warm, intimate afternoon transitioning into high-energy dance party.',
    'Endless formal speeches and rushed photo lines.',
  ]);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleRunInterview = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventType: state.plan.event.type, answers }),
      });
      if (!response.ok) {
        throw new Error(`HTTP ${String(response.status)}`);
      }
      const res = (await response.json()) as InterviewResult;
      onMomentsGenerated(res.moments, res.source);
      onClose();
    } catch {
      // Offline / server unavailable — use deterministic rule-based fallback
      const fb = generateFallbackInterview({ eventType: state.plan.event.type, answers });
      onMomentsGenerated(fb.moments, 'fallback');
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-ink/60 backdrop-blur-xs flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="interview-title"
    >
      <div className="bg-paper max-w-2xl w-full rounded-2xl shadow-2xl border border-mist overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 bg-mist/30 border-b border-mist flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-teal">
              AI Story Interview
            </span>
            <h2 id="interview-title" className="font-serif text-2xl font-bold text-ink">
              Story Interview: Discover Signature Moments
            </h2>
            <p className="text-xs text-ink/80 mt-0.5">
              Refine your celebration context and answer 5 questions about your story to generate moments.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-ink/80 hover:text-ink p-2 rounded-full hover:bg-mist text-lg font-bold"
            aria-label="Close interview dialog"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1 text-xs">
          {/* Context Fields (Guest Count, City, Budget) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-mist/30 rounded-lg border border-mist">
            <div>
              <label htmlFor="interview-guests" className="block font-semibold text-ink mb-1">
                Guest Count
              </label>
              <input
                id="interview-guests"
                type="number"
                min="1"
                value={guests}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setGuests(val);
                  dispatch({ type: 'UPDATE_EVENT', event: { guests: val } });
                }}
                className="w-full px-2.5 py-1.5 border border-mist rounded bg-white text-ink text-xs focus-visible:ring-2 focus-visible:ring-saffron"
              />
            </div>
            <div>
              <label htmlFor="interview-city" className="block font-semibold text-ink mb-1">
                City
              </label>
              <input
                id="interview-city"
                type="text"
                value={city}
                onChange={(e) => {
                  const val = e.target.value;
                  setCity(val);
                  dispatch({ type: 'UPDATE_EVENT', event: { city: val } });
                }}
                className="w-full px-2.5 py-1.5 border border-mist rounded bg-white text-ink text-xs focus-visible:ring-2 focus-visible:ring-saffron"
              />
            </div>
            <div>
              <label htmlFor="interview-budget" className="block font-semibold text-ink mb-1">
                Budget (₹)
              </label>
              <input
                id="interview-budget"
                type="number"
                min="0"
                step="10000"
                value={budget}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setBudget(val);
                  dispatch({
                    type: 'UPDATE_EVENT',
                    event: { budgetMinor: Math.round(val * 100) },
                  });
                }}
                className="w-full px-2.5 py-1.5 border border-mist rounded bg-white text-ink text-xs focus-visible:ring-2 focus-visible:ring-saffron"
              />
            </div>
          </div>

          {/* 5 Questions */}
          <div className="space-y-4">
            {QUESTIONS.map((q, idx) => (
              <div key={idx} className="space-y-1">
                <label htmlFor={`question-${String(idx)}`} className="block font-semibold text-ink">
                  {idx + 1}. {q}
                </label>
                <textarea
                  id={`question-${String(idx)}`}
                  rows={2}
                  value={answers[idx]}
                  onChange={(e) => {
                    const updated = [...answers];
                    updated[idx] = e.target.value;
                    setAnswers(updated);
                  }}
                  className="w-full p-2.5 border border-mist rounded-md text-ink text-xs focus-visible:ring-2 focus-visible:ring-saffron"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-mist bg-mist/20 flex items-center justify-between text-xs">
          <span className="text-ink/80 italic font-medium">Works 100% offline without Gemini key</span>
          <button
            type="button"
            disabled={loading}
            onClick={() => {
              void handleRunInterview();
            }}
            className="px-5 py-2.5 rounded-lg bg-teal text-white font-semibold hover:bg-teal/90 disabled:opacity-50 shadow-xs"
          >
            {loading ? 'Synthesizing Moments…' : 'Generate Moments from Story'}
          </button>
        </div>
      </div>
    </div>
  );
}
