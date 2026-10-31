/**
 * AfterEventPage.tsx — The post-celebration debrief and reflection log.
 *
 * SPEC REQUIREMENT (§5, §8):
 * - After-Event log: actual spend per moment, keep/skip rating, notes.
 * - Compare actuals to planned budget and record retrospective takeaways.
 */

import React, { useState } from 'react';
import { useAppContext } from '../../state/context';
import { formatINR, parseINR } from '../../engine/money';
import { allocateMomentBudget } from '../../engine/allocation';
import { exportAfterEventCsv } from '../../lib/export';
import { announceToScreenReader } from '../../lib/a11y';
import type { AfterEventLog, AfterEventMomentLog } from '../../schemas/plan';

export function AfterEventPage(): React.ReactElement {
  const { state, dispatch } = useAppContext();
  const { plan } = state;

  const allocation = allocateMomentBudget(plan.event, plan.moments, plan.costLines);
  const allocMap = new Map(allocation.allocations.map((a) => [a.momentId, a.allocatedMinor]));

  // Initialize local form state from plan.afterEvent or defaults
  const existingLog = plan.afterEvent;

  const [hostNotes, setHostNotes] = useState<string>(existingLog?.hostNotes ?? '');

  const [momentLogs, setMomentLogs] = useState<Record<string, {
    actualRupees: string;
    rating: 'keep' | 'skip';
    notes: string;
  }>>(() => {
    const initial: Record<string, { actualRupees: string; rating: 'keep' | 'skip'; notes: string }> = {};
    const existingMap = new Map((existingLog?.moments ?? []).map((m) => [m.momentId, m]));

    for (const m of plan.moments) {
      const existing = existingMap.get(m.id);
      const plannedPaise = allocMap.get(m.id) ?? 0;
      initial[m.id] = {
        actualRupees: existing ? (existing.actualSpendMinor / 100).toString() : (plannedPaise / 100).toString(),
        rating: existing?.rating ?? 'keep',
        notes: existing?.notes ?? '',
      };
    }
    return initial;
  });

  const [savedNotification, setSavedNotification] = useState<boolean>(false);

  // Compute live scorecard
  let totalActualPaise = 0;
  let keepCount = 0;
  let skipCount = 0;

  for (const m of plan.moments) {
    const entry = momentLogs[m.id] ?? { actualRupees: '0', rating: 'keep' as const, notes: '' };
    let actualPaise = 0;
    try {
      actualPaise = parseINR(entry.actualRupees || '0');
    } catch {
      actualPaise = 0;
    }
    totalActualPaise += actualPaise;
    if (entry.rating === 'skip') {
      skipCount += 1;
    } else {
      keepCount += 1;
    }
  }

  const plannedTotalPaise = plan.event.budgetMinor;
  const netVariancePaise = totalActualPaise - plannedTotalPaise;

  const handleActualChange = (momentId: string, val: string): void => {
    setMomentLogs((prev) => {
      const current = prev[momentId] ?? { actualRupees: '0', rating: 'keep' as const, notes: '' };
      return {
        ...prev,
        [momentId]: { ...current, actualRupees: val },
      };
    });
  };

  const handleRatingChange = (momentId: string, rating: 'keep' | 'skip'): void => {
    setMomentLogs((prev) => {
      const current = prev[momentId] ?? { actualRupees: '0', rating: 'keep' as const, notes: '' };
      return {
        ...prev,
        [momentId]: { ...current, rating },
      };
    });
  };

  const handleNotesChange = (momentId: string, notes: string): void => {
    setMomentLogs((prev) => {
      const current = prev[momentId] ?? { actualRupees: '0', rating: 'keep' as const, notes: '' };
      return {
        ...prev,
        [momentId]: { ...current, notes },
      };
    });
  };

  const handleSave = (e: React.FormEvent): void => {
    e.preventDefault();

    const moments: AfterEventMomentLog[] = plan.moments.map((m) => {
      const entry = momentLogs[m.id] ?? { actualRupees: '0', rating: 'keep' as const, notes: '' };
      let actualSpendMinor = 0;
      try {
        actualSpendMinor = parseINR(entry.actualRupees || '0');
      } catch {
        actualSpendMinor = 0;
      }
      return {
        momentId: m.id,
        actualSpendMinor,
        rating: entry.rating,
        notes: entry.notes,
      };
    });

    const updatedLog: AfterEventLog = {
      completedAt: new Date().toISOString().split('T')[0],
      hostNotes,
      moments,
    };

    dispatch({ type: 'UPDATE_AFTER_EVENT', afterEvent: updatedLog });
    setSavedNotification(true);
    announceToScreenReader('After-Event log saved successfully.');
    setTimeout(() => { setSavedNotification(false); }, 4000);
  };

  return (
    <div className="min-h-screen bg-sand text-ink pb-20 print:bg-white print:p-0">
      {/* Top Banner / Breadcrumb */}
      <div className="bg-white border-b border-sand-dark px-4 sm:px-8 py-4 print:hidden">
        <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-serif text-2xl font-bold text-ink">After-Event Debrief &amp; Log</h1>
            <p className="text-xs text-ink-muted mt-0.5">
              Record actuals, rate moments keep or skip, and preserve what you learned for your next celebration.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => { exportAfterEventCsv(plan); }}
              className="px-3.5 py-2 text-xs font-medium rounded-lg bg-white border border-sand-dark hover:bg-sand transition-colors"
            >
              Export CSV
            </button>
            <button
              type="button"
              onClick={() => { window.print(); }}
              className="px-3.5 py-2 text-xs font-medium rounded-lg bg-teal text-white hover:bg-teal-dark transition-colors"
            >
              Print Reflection
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-8 py-8">
        <form onSubmit={handleSave}>
          {/* Post-Celebration Scorecard */}
          <section aria-labelledby="scorecard-heading" className="bg-white rounded-2xl p-6 sm:p-8 border border-sand-dark shadow-sm mb-8 print:border-none print:p-0">
            <h2 id="scorecard-heading" className="font-serif text-xl font-bold text-ink mb-4 border-b border-sand-dark pb-3">
              Celebration Reality Scorecard
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-sand/30 border border-sand-dark">
                <div className="text-xs text-ink-muted uppercase tracking-wider font-medium">Planned Budget</div>
                <div className="font-serif text-2xl font-bold text-ink mt-1">
                  {formatINR(plannedTotalPaise)}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-sand/30 border border-sand-dark">
                <div className="text-xs text-ink-muted uppercase tracking-wider font-medium">Actual Total Spend</div>
                <div className="font-serif text-2xl font-bold text-ink mt-1">
                  {formatINR(totalActualPaise)}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-sand/30 border border-sand-dark">
                <div className="text-xs text-ink-muted uppercase tracking-wider font-medium">Net Variance</div>
                <div className={`font-serif text-2xl font-bold mt-1 ${netVariancePaise > 0 ? 'text-rose' : 'text-teal'}`}>
                  {netVariancePaise === 0
                    ? '₹0.00 Exact'
                    : netVariancePaise > 0
                    ? `+${formatINR(netVariancePaise)} Over`
                    : `-${formatINR(Math.abs(netVariancePaise))} Under`}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-sand/30 border border-sand-dark">
                <div className="text-xs text-ink-muted uppercase tracking-wider font-medium">Keep vs Skip</div>
                <div className="font-serif text-2xl font-bold text-ink mt-1">
                  <span className="text-teal">{keepCount} Keep</span>
                  <span className="text-ink-muted text-base font-normal"> / </span>
                  <span className="text-rose">{skipCount} Skip</span>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <label htmlFor="host-overall-reflection" className="block text-xs font-semibold text-ink uppercase tracking-wider mb-2">
                Overall Host Reflection &amp; Takeaways
              </label>
              <textarea
                id="host-overall-reflection"
                value={hostNotes}
                onChange={(e) => { setHostNotes(e.target.value); }}
                placeholder="What felt truly memorable? What would you do differently next time? What surprised you?"
                rows={3}
                className="w-full text-sm rounded-xl border border-sand-dark p-3.5 focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal bg-sand/10 placeholder:text-ink-muted/50"
              />
            </div>
          </section>

          {/* Moment-by-Moment Spend & Verdict */}
          <section aria-labelledby="moment-log-heading" className="bg-white rounded-2xl p-6 sm:p-8 border border-sand-dark shadow-sm mb-8 print:border-none print:p-0">
            <div className="flex items-center justify-between mb-4 border-b border-sand-dark pb-3">
              <h2 id="moment-log-heading" className="font-serif text-xl font-bold text-ink">
                Moment Breakdown: Spend &amp; Sentiment
              </h2>
              <span className="text-xs text-ink-muted">{plan.moments.length} Moments Reviewed</span>
            </div>

            <div className="space-y-6">
              {plan.moments.map((m) => {
                const plannedPaise = allocMap.get(m.id) ?? 0;
                const entry = momentLogs[m.id] ?? { actualRupees: '0', rating: 'keep' as const, notes: '' };
                let actualPaise = 0;
                try {
                  actualPaise = parseINR(entry.actualRupees || '0');
                } catch {
                  actualPaise = 0;
                }
                const variance = actualPaise - plannedPaise;

                return (
                  <div
                    key={m.id}
                    className="p-5 rounded-xl border border-sand-dark bg-sand/10 hover:bg-sand/20 transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b border-sand-dark/60 pb-3 mb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-serif font-bold text-lg text-ink">{m.name}</span>
                          <span className="text-xs px-2 py-0.5 rounded bg-saffron/10 text-saffron-dark font-medium">
                            Priority {m.importance}/5
                          </span>
                        </div>
                        <p className="text-xs text-ink-muted mt-0.5">
                          Planned Allocation: <strong className="text-ink">{formatINR(plannedPaise)}</strong>
                        </p>
                      </div>

                      {/* Verdict Toggle: Keep or Skip */}
                      <div className="flex items-center gap-1 bg-sand/60 p-1 rounded-lg border border-sand-dark">
                        <button
                          type="button"
                          onClick={() => { handleRatingChange(m.id, 'keep'); }}
                          className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                            entry.rating === 'keep'
                              ? 'bg-teal text-white shadow-xs'
                              : 'text-ink-muted hover:text-ink'
                          }`}
                        >
                          &check; Worth It (Keep)
                        </button>
                        <button
                          type="button"
                          onClick={() => { handleRatingChange(m.id, 'skip'); }}
                          className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                            entry.rating === 'skip'
                              ? 'bg-rose text-white shadow-xs'
                              : 'text-ink-muted hover:text-ink'
                          }`}
                        >
                          &times; Skip Next Time
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label htmlFor={`actual-spend-${m.id}`} className="block text-xs font-semibold text-ink-muted uppercase tracking-wider mb-1">
                          Actual Spend (₹)
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-2.5 text-ink-muted text-sm font-serif">₹</span>
                          <input
                            id={`actual-spend-${m.id}`}
                            type="number"
                            min="0"
                            step="any"
                            value={entry.actualRupees}
                            onChange={(e) => { handleActualChange(m.id, e.target.value); }}
                            className="w-full text-sm pl-7 pr-3 py-2 rounded-lg border border-sand-dark bg-white focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal"
                          />
                        </div>
                      </div>

                      <div>
                        <span className="block text-xs font-semibold text-ink-muted uppercase tracking-wider mb-1">
                          Variance vs Plan
                        </span>
                        <div className={`text-sm font-semibold py-2 px-3 rounded-lg border ${
                          variance === 0
                            ? 'bg-white border-sand-dark text-ink'
                            : variance > 0
                            ? 'bg-rose-50 border-rose/30 text-rose-900'
                            : 'bg-teal-50 border-teal/30 text-teal-900'
                        }`}>
                          {variance === 0
                            ? '₹0.00 (On target)'
                            : variance > 0
                            ? `+${formatINR(variance)} (Over)`
                            : `-${formatINR(Math.abs(variance))} (Saved)`}
                        </div>
                      </div>

                      <div>
                        <label htmlFor={`moment-notes-${m.id}`} className="block text-xs font-semibold text-ink-muted uppercase tracking-wider mb-1">
                          Notes / Memory
                        </label>
                        <input
                          id={`moment-notes-${m.id}`}
                          type="text"
                          value={entry.notes}
                          onChange={(e) => { handleNotesChange(m.id, e.target.value); }}
                          placeholder="e.g. Highlight of the night"
                          className="w-full text-sm px-3 py-2 rounded-lg border border-sand-dark bg-white focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal placeholder:text-ink-muted/50"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Sticky Submit Bar */}
          <div className="sticky bottom-0 z-10 bg-white/95 backdrop-blur-md border-t border-sand-dark p-4 rounded-2xl shadow-lg flex items-center justify-between gap-4 print:hidden">
            <div>
              {savedNotification ? (
                <span className="text-sm font-medium text-teal flex items-center gap-1.5" role="status">
                  <svg aria-hidden="true" className="w-4 h-4 text-teal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  After-Event Log saved to browser storage!
                </span>
              ) : (
                <span className="text-xs text-ink-muted">
                  Auto-saved changes are preserved locally in IndexedDB.
                </span>
              )}
            </div>

            <div className="flex items-center gap-3">
              <button
                type="submit"
                className="px-6 py-2.5 rounded-lg bg-teal text-white font-medium text-sm hover:bg-teal-dark transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-teal/40"
              >
                Save Log
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
