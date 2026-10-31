/**
 * MomentDeckPage.tsx — Moment Deck builder and event details configuration.
 *
 * SPEC REQUIREMENT (§8):
 * Moment Deck (builder): event details form, template pick, drag/keyboard
 * reorder and rate moments, Story Interview panel.
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../../state/context';
import { createPlanFromTemplate } from '../../state/storage';
import { minuteTo12HourString, timeStringToMinute } from '../../lib/format';
import { StoryInterviewModal } from '../components/StoryInterviewModal';
import { ReviewCard } from '../components/ReviewCard';
import type { Moment } from '../../schemas/moment';
import type { EventType, Setting } from '../../schemas/event';
import type { InterviewResultMoment } from '../../schemas/ai';

export function MomentDeckPage() {
  const { state, dispatch } = useAppContext();
  const { event, moments } = state.plan;

  const [isInterviewOpen, setIsInterviewOpen] = useState(false);
  const [pendingReviews, setPendingReviews] = useState<InterviewResultMoment[]>([]);
  const [reviewSource, setReviewSource] = useState<'ai' | 'fallback'>('fallback');
  const [isAddingMoment, setIsAddingMoment] = useState(false);
  const [newMomentName, setNewMomentName] = useState('');
  const [newMomentImportance, setNewMomentImportance] = useState(3);
  const [newMomentEnergy, setNewMomentEnergy] = useState(3);
  const [newMomentStart, setNewMomentStart] = useState('10:00');
  const [newMomentDuration, setNewMomentDuration] = useState(45);

  // Template switch handler
  const handleSwitchTemplate = (type: EventType) => {
    if (
      window.confirm(
        `Reset current plan with the ${type} template? This will replace existing moments with template defaults.`,
      )
    ) {
      const templatePlan = createPlanFromTemplate(
        type,
        event.title,
        event.city,
        event.date,
        event.guests,
        event.budgetMinor / 100,
      );
      dispatch({ type: 'SET_PLAN', plan: templatePlan });
    }
  };

  // Reorder handlers
  const handleMoveUp = (index: number) => {
    if (index <= 0) return;
    const newIds = moments.map((m) => m.id);
    const cur = newIds[index];
    const prev = newIds[index - 1];
    newIds[index] = prev;
    newIds[index - 1] = cur;
    dispatch({ type: 'REORDER_MOMENTS', momentIds: newIds });
  };

  const handleMoveDown = (index: number) => {
    if (index >= moments.length - 1) return;
    const newIds = moments.map((m) => m.id);
    const cur = newIds[index];
    const next = newIds[index + 1];
    newIds[index] = next;
    newIds[index + 1] = cur;
    dispatch({ type: 'REORDER_MOMENTS', momentIds: newIds });
  };

  const handleAddMoment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMomentName.trim()) return;

    const newMoment: Moment = {
      id: `moment-${String(Date.now())}`,
      name: newMomentName.trim(),
      importance: newMomentImportance,
      energyTarget: newMomentEnergy,
      startMinute: timeStringToMinute(newMomentStart),
      durationMin: newMomentDuration,
      guestImpact: 0.8,
      locked: false,
      notes: '',
    };

    dispatch({ type: 'ADD_MOMENT', moment: newMoment });
    setNewMomentName('');
    setIsAddingMoment(false);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-mist pb-6">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-teal">
            Phase 1 • Step 1
          </span>
          <h1 className="font-serif text-3xl font-bold text-ink">The Moment Deck</h1>
          <p className="text-sm text-ink/70 mt-1">
            Build your celebration around 5 to 9 signature moments. Everything else attaches here.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              setIsInterviewOpen(true);
            }}
            className="px-4 py-2.5 rounded-lg bg-saffron text-ink font-bold text-sm hover:bg-saffron/90 shadow-xs transition-colors flex items-center gap-1.5"
          >
            <span>✨</span>
            <span>Run Story Interview</span>
          </button>
          <Link
            to="/plan"
            className="px-5 py-2.5 rounded-lg bg-teal text-white font-semibold text-sm hover:bg-teal/90 shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-saffron"
          >
            Review Plan Workspace →
          </Link>
        </div>
      </div>

      {/* Suggested Moments for Review */}
      {pendingReviews.length > 0 && (
        <section className="bg-white p-6 rounded-xl border-2 border-teal/40 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-serif text-xl font-bold text-ink">
                Suggested Moments for Review ({String(pendingReviews.length)})
              </h2>
              <p className="text-xs text-ink/80">
                Generated from your story interview. Review, edit, or apply each to your deck.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setPendingReviews([]);
              }}
              className="text-xs text-ink/80 hover:text-ink font-semibold"
            >
              Dismiss All
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingReviews.map((item, idx) => (
              <ReviewCard
                key={idx}
                title={item.name}
                source={reviewSource}
                tier={item.importance >= 4 ? 'special' : item.importance === 3 ? 'standard' : 'simple'}
                initialText={item.why}
                applyLabel="Apply to Deck"
                onApply={(editedText) => {
                  dispatch({
                    type: 'ADD_MOMENT',
                    moment: {
                      id: `moment-${String(Date.now())}-${String(idx)}`,
                      name: item.name,
                      importance: item.importance,
                      energyTarget: item.importance >= 4 ? 4 : 3,
                      startMinute: 540 + moments.length * 60,
                      durationMin: 45,
                      guestImpact: 0.8,
                      locked: false,
                      notes: editedText,
                    },
                  });
                  setPendingReviews((prev) => prev.filter((_, i) => i !== idx));
                }}
                onDismiss={() => {
                  setPendingReviews((prev) => prev.filter((_, i) => i !== idx));
                }}
              />
            ))}
          </div>
        </section>
      )}

      {/* Event Details Form */}
      <section className="bg-white p-6 rounded-xl border border-mist shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-xl font-bold text-ink">Celebration Details</h2>
          <div className="flex items-center gap-1.5 text-xs text-ink/80">
            <label htmlFor="template-select" className="font-semibold text-ink">
              Template:
            </label>
            <select
              id="template-select"
              aria-label="Celebration Template"
              value={event.type}
              onChange={(e) => {
                handleSwitchTemplate(e.target.value as EventType);
              }}
              className="px-2 py-1 border border-mist rounded bg-mist/30 text-ink font-semibold focus-visible:ring-2 focus-visible:ring-saffron"
            >
              <option value="wedding">Wedding</option>
              <option value="birthday">Birthday</option>
              <option value="community">Community</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div>
            <label htmlFor="event-title" className="block font-medium text-ink/80 mb-1">
              Event Title
            </label>
            <input
              id="event-title"
              type="text"
              value={event.title}
              onChange={(e) => {
                dispatch({ type: 'UPDATE_EVENT', event: { title: e.target.value } });
              }}
              className="w-full px-3 py-2 border border-mist rounded-md text-ink text-sm focus-visible:ring-2 focus-visible:ring-saffron"
            />
          </div>

          <div>
            <label htmlFor="event-date" className="block font-medium text-ink/80 mb-1">
              Date (YYYY-MM-DD)
            </label>
            <input
              id="event-date"
              type="date"
              value={event.date}
              onChange={(e) => {
                dispatch({ type: 'UPDATE_EVENT', event: { date: e.target.value } });
              }}
              className="w-full px-3 py-2 border border-mist rounded-md text-ink text-sm focus-visible:ring-2 focus-visible:ring-saffron"
            />
          </div>

          <div>
            <label htmlFor="event-city" className="block font-medium text-ink/80 mb-1">
              City
            </label>
            <input
              id="event-city"
              type="text"
              value={event.city}
              onChange={(e) => {
                dispatch({ type: 'UPDATE_EVENT', event: { city: e.target.value } });
              }}
              className="w-full px-3 py-2 border border-mist rounded-md text-ink text-sm focus-visible:ring-2 focus-visible:ring-saffron"
            />
          </div>

          <div>
            <label htmlFor="event-guests" className="block font-medium text-ink/80 mb-1">
              Guest Count
            </label>
            <input
              id="event-guests"
              type="number"
              min="1"
              value={event.guests}
              onChange={(e) => {
                dispatch({ type: 'UPDATE_EVENT', event: { guests: Number(e.target.value) } });
              }}
              className="w-full px-3 py-2 border border-mist rounded-md text-ink text-sm focus-visible:ring-2 focus-visible:ring-saffron"
            />
          </div>

          <div>
            <label htmlFor="event-budget" className="block font-medium text-ink/80 mb-1">
              Total Budget (₹)
            </label>
            <input
              id="event-budget"
              type="number"
              step="10000"
              min="0"
              value={event.budgetMinor / 100}
              onChange={(e) => {
                dispatch({
                  type: 'UPDATE_EVENT',
                  event: { budgetMinor: Math.round(Number(e.target.value) * 100) },
                });
              }}
              className="w-full px-3 py-2 border border-mist rounded-md text-ink text-sm font-semibold focus-visible:ring-2 focus-visible:ring-saffron"
            />
          </div>

          <div>
            <label htmlFor="event-contingency" className="block font-medium text-ink/80 mb-1">
              Protected Contingency (%)
            </label>
            <input
              id="event-contingency"
              type="number"
              min="0"
              max="50"
              value={event.contingencyPct}
              onChange={(e) => {
                dispatch({
                  type: 'UPDATE_EVENT',
                  event: { contingencyPct: Number(e.target.value) },
                });
              }}
              className="w-full px-3 py-2 border border-mist rounded-md text-ink text-sm focus-visible:ring-2 focus-visible:ring-saffron"
            />
          </div>

          <div>
            <label htmlFor="event-setting" className="block font-medium text-ink/80 mb-1">
              Setting
            </label>
            <select
              id="event-setting"
              value={event.setting}
              onChange={(e) => {
                dispatch({
                  type: 'UPDATE_EVENT',
                  event: { setting: e.target.value as Setting },
                });
              }}
              className="w-full px-3 py-2 border border-mist rounded-md text-ink text-sm bg-white focus-visible:ring-2 focus-visible:ring-saffron"
            >
              <option value="indoor">Indoor</option>
              <option value="outdoor">Outdoor</option>
              <option value="hybrid">Hybrid</option>
            </select>
          </div>
        </div>
      </section>

      {/* Moments Deck List */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-serif text-xl font-bold text-ink">
              Signature Moments ({String(moments.length)})
            </h2>
            <p className="text-xs text-ink/80">
              Use Move Up / Move Down to sequence your celebration. Adjust importance and energy targets.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setIsAddingMoment(!isAddingMoment);
            }}
            className="px-3.5 py-2 bg-saffron text-ink font-semibold rounded-md text-xs hover:bg-saffron/90 transition-colors shadow-xs"
          >
            {isAddingMoment ? 'Cancel' : '+ Add New Moment'}
          </button>
        </div>

        {/* Add Moment Form Drawer/Card */}
        {isAddingMoment && (
          <form
            onSubmit={handleAddMoment}
            className="bg-white p-6 rounded-xl border-2 border-saffron/60 shadow-md space-y-4"
          >
            <h3 className="font-serif text-base font-bold text-ink">New Moment Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label htmlFor="new-moment-name" className="block font-medium text-ink mb-1">
                  Moment Name
                </label>
                <input
                  id="new-moment-name"
                  type="text"
                  required
                  placeholder="e.g. Sangeet Performances"
                  value={newMomentName}
                  onChange={(e) => {
                    setNewMomentName(e.target.value);
                  }}
                  className="w-full px-3 py-2 border border-mist rounded-md text-sm text-ink focus-visible:ring-2 focus-visible:ring-saffron"
                />
              </div>

              <div>
                <label htmlFor="new-moment-importance" className="block font-medium text-ink mb-1">
                  Importance (1 to 5)
                </label>
                <select
                  id="new-moment-importance"
                  value={newMomentImportance}
                  onChange={(e) => {
                    setNewMomentImportance(Number(e.target.value));
                  }}
                  className="w-full px-3 py-2 border border-mist rounded-md text-sm bg-white text-ink focus-visible:ring-2 focus-visible:ring-saffron"
                >
                  <option value={1}>1 - Low / Background</option>
                  <option value={2}>2 - Gentle Beat</option>
                  <option value={3}>3 - Core Moment</option>
                  <option value={4}>4 - High Importance</option>
                  <option value={5}>5 - Signature Moment (Boosted)</option>
                </select>
              </div>

              <div>
                <label htmlFor="new-moment-energy" className="block font-medium text-ink mb-1">
                  Energy Target (1 to 5)
                </label>
                <select
                  id="new-moment-energy"
                  value={newMomentEnergy}
                  onChange={(e) => {
                    setNewMomentEnergy(Number(e.target.value));
                  }}
                  className="w-full px-3 py-2 border border-mist rounded-md text-sm bg-white text-ink focus-visible:ring-2 focus-visible:ring-saffron"
                >
                  <option value={1}>1 - Quiet & Intimate</option>
                  <option value={2}>2 - Warm & Relaxed</option>
                  <option value={3}>3 - Engaging & Lively</option>
                  <option value={4}>4 - High Energy</option>
                  <option value={5}>5 - Peak Excitement</option>
                </select>
              </div>

              <div>
                <label htmlFor="new-moment-start" className="block font-medium text-ink mb-1">
                  Start Time
                </label>
                <input
                  id="new-moment-start"
                  type="time"
                  value={newMomentStart}
                  onChange={(e) => {
                    setNewMomentStart(e.target.value);
                  }}
                  className="w-full px-3 py-2 border border-mist rounded-md text-sm text-ink focus-visible:ring-2 focus-visible:ring-saffron"
                />
              </div>

              <div>
                <label htmlFor="new-moment-duration" className="block font-medium text-ink mb-1">
                  Duration (minutes)
                </label>
                <input
                  id="new-moment-duration"
                  type="number"
                  min="5"
                  max="480"
                  value={newMomentDuration}
                  onChange={(e) => {
                    setNewMomentDuration(Number(e.target.value));
                  }}
                  className="w-full px-3 py-2 border border-mist rounded-md text-sm text-ink focus-visible:ring-2 focus-visible:ring-saffron"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsAddingMoment(false);
                }}
                className="px-4 py-2 text-xs font-semibold text-ink/80 hover:text-ink"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-teal text-white rounded-md text-xs font-semibold hover:bg-teal/90"
              >
                Add to Moment Deck
              </button>
            </div>
          </form>
        )}

        {/* List of Moments */}
        <div className="space-y-3">
          {moments.map((moment, idx) => (
            <div
              key={moment.id}
              className="bg-white p-4 sm:p-5 rounded-xl border border-mist shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-mist/80 transition-colors"
            >
              <div className="flex items-center gap-3">
                {/* Ordering numerals */}
                <span className="w-7 h-7 rounded-full bg-mist/60 text-ink/80 flex items-center justify-center text-xs font-bold font-serif">
                  {idx + 1}
                </span>

                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-serif text-base font-bold text-ink">{moment.name}</h3>
                    {moment.locked && (
                      <span className="px-2 py-0.5 bg-ink text-paper rounded text-[10px] font-semibold tracking-wide">
                        LOCKED
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-ink/80 flex items-center gap-3 mt-0.5">
                    <span>Starts {minuteTo12HourString(moment.startMinute)}</span>
                    <span>•</span>
                    <span>{String(moment.durationMin)} min</span>
                    <span>•</span>
                    <span className="capitalize">Impact: {Math.round(moment.guestImpact * 100)}%</span>
                  </div>
                </div>
              </div>

              {/* Controls */}
              <div className="flex flex-wrap items-center gap-3 self-end sm:self-center">
                {/* Importance Selector */}
                <div className="flex items-center gap-1">
                  <span className="text-xs font-medium text-ink/80 mr-1">Imp:</span>
                  {[1, 2, 3, 4, 5].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => {
                        dispatch({
                          type: 'UPDATE_MOMENT',
                          moment: { ...moment, importance: val },
                        });
                      }}
                      className={`w-6 h-6 rounded text-xs font-bold transition-colors ${
                        moment.importance === val
                          ? 'bg-teal text-white shadow-xs'
                          : 'bg-mist/70 text-ink hover:bg-mist'
                      }`}
                      aria-label={`Set importance ${String(val)} for ${moment.name}`}
                    >
                      {val}
                    </button>
                  ))}
                </div>

                {/* Lock Toggle */}
                <button
                  type="button"
                  onClick={() => {
                    dispatch({ type: 'TOGGLE_LOCK_MOMENT', momentId: moment.id });
                  }}
                  className={`p-1.5 rounded text-xs border ${
                    moment.locked
                      ? 'border-ink bg-ink text-paper font-semibold'
                      : 'border-mist text-ink/80 hover:text-ink'
                  }`}
                  aria-label={moment.locked ? `Unlock allocation for ${moment.name}` : `Lock allocation for ${moment.name}`}
                  title={moment.locked ? 'Unlock moment allocation' : 'Lock moment allocation'}
                >
                  {moment.locked ? '🔒' : '🔓'}
                </button>

                {/* Keyboard Reordering Buttons */}
                <div className="flex items-center gap-1 border-l border-mist pl-2">
                  <button
                    type="button"
                    disabled={idx === 0}
                    onClick={() => {
                      handleMoveUp(idx);
                    }}
                    className="p-1.5 rounded hover:bg-mist/80 disabled:opacity-30 disabled:hover:bg-transparent text-xs"
                    aria-label={`Move ${moment.name} up`}
                  >
                    ▲
                  </button>
                  <button
                    type="button"
                    disabled={idx === moments.length - 1}
                    onClick={() => {
                      handleMoveDown(idx);
                    }}
                    className="p-1.5 rounded hover:bg-mist/80 disabled:opacity-30 disabled:hover:bg-transparent text-xs"
                    aria-label={`Move ${moment.name} down`}
                  >
                    ▼
                  </button>
                </div>

                {/* Delete button */}
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm(`Delete moment "${moment.name}"?`)) {
                      dispatch({ type: 'DELETE_MOMENT', momentId: moment.id });
                    }
                  }}
                  className="p-1.5 text-rose hover:text-rose-700 rounded hover:bg-rose/10 text-xs ml-1 font-bold"
                  aria-label={`Delete ${moment.name}`}
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Story Interview Modal */}
      <StoryInterviewModal
        isOpen={isInterviewOpen}
        onClose={() => {
          setIsInterviewOpen(false);
        }}
        onMomentsGenerated={(newMoments, src) => {
          setPendingReviews(newMoments);
          setReviewSource(src);
        }}
      />
    </div>
  );
}
