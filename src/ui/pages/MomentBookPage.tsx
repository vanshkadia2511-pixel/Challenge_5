/**
 * MomentBookPage.tsx — The complete printable celebration book and export hub.
 *
 * SPEC REQUIREMENT (§5, §8):
 * - Moment Book (print view) and CSV/JSON export.
 * - Print-ready briefs for each vendor.
 * - Pure client-side import with prototype pollution and schema validation.
 */

import React, { useState, useRef } from 'react';
import { useAppContext } from '../../state/context';
import { formatINR } from '../../engine/money';
import { allocateMomentBudget } from '../../engine/allocation';
import { attributeCosts } from '../../engine/attribution';
import { scheduleTasks } from '../../engine/timeline';
import { generateCueSheets } from '../../engine/cuesheet';
import { minuteTo12HourString } from '../../lib/format';
import {
  exportBudgetCsv,
  exportTimelineCsv,
  exportCueSheetsCsv,
  exportPlanJson,
} from '../../lib/export';
import { validatePlanImport } from '../../schemas/plan';
import { announceToScreenReader } from '../../lib/a11y';

export function MomentBookPage(): React.ReactElement {
  const { state, dispatch } = useAppContext();
  const { plan } = state;

  const [importStatus, setImportStatus] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const allocation = allocateMomentBudget(plan.event, plan.moments, plan.costLines);
  const attributed = attributeCosts(plan.moments, plan.costLines, plan.event.guests);
  const timeline = scheduleTasks(plan.tasks, plan.event.date);
  const cueSheets = generateCueSheets(plan.vendors, plan.moments);

  const allocMap = new Map(allocation.allocations.map((a) => [a.momentId, a.allocatedMinor]));
  const attrMap = new Map(attributed.perMoment.map((a) => [a.momentId, a]));

  // Chronologically sorted moments
  const sortedMoments = [...plan.moments].sort((a, b) => a.startMinute - b.startMinute);

  const handlePrint = (): void => {
    window.print();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result;
        if (typeof text !== 'string') {
          throw new Error('Could not read plan file contents');
        }
        const parsed = JSON.parse(text) as unknown;
        const validPlan = validatePlanImport(parsed);
        dispatch({ type: 'SET_PLAN', plan: validPlan });
        setImportStatus({
          type: 'success',
          message: `Plan "${validPlan.event.title}" imported successfully!`,
        });
        announceToScreenReader(`Plan ${validPlan.event.title} loaded successfully.`);
      } catch (err) {
        const errMessage = err instanceof Error ? err.message : 'Invalid JSON file';
        setImportStatus({
          type: 'error',
          message: `Import failed: ${errMessage}`,
        });
        announceToScreenReader('Plan import failed.');
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-sand text-ink pb-20 print:bg-white print:p-0 print:pb-0">
      {/* Action / Export Toolbar (Hidden when printing) */}
      <div className="print:hidden sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-sand-dark px-4 sm:px-8 py-3.5 shadow-sm">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-serif font-bold text-lg text-ink">Moment Book</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-mist text-ink-muted">Print &amp; Export</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              aria-label="Print Moment Book"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-teal text-white text-sm font-medium hover:bg-teal-dark transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-teal/30"
            >
              <svg aria-hidden="true" className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4H7v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Print Moment Book
            </button>

            <button
              type="button"
              onClick={() => { exportPlanJson(plan); }}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white border border-sand-dark text-ink text-sm font-medium hover:bg-sand transition-colors"
            >
              Export JSON
            </button>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white border border-sand-dark text-ink text-sm font-medium hover:bg-sand transition-colors"
            >
              Import JSON
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              className="hidden"
              onChange={handleFileChange}
              aria-label="Upload JSON plan file"
            />

            <div className="flex items-center gap-1 border-l border-sand-dark pl-2 ml-1">
              <button
                type="button"
                onClick={() => { exportBudgetCsv(plan); }}
                className="text-xs px-2.5 py-1.5 rounded bg-sand hover:bg-sand-dark/60 text-ink-muted transition-colors font-medium"
              >
                Budget CSV
              </button>
              <button
                type="button"
                onClick={() => { exportTimelineCsv(plan); }}
                className="text-xs px-2.5 py-1.5 rounded bg-sand hover:bg-sand-dark/60 text-ink-muted transition-colors font-medium"
              >
                Timeline CSV
              </button>
              <button
                type="button"
                onClick={() => { exportCueSheetsCsv(plan); }}
                className="text-xs px-2.5 py-1.5 rounded bg-sand hover:bg-sand-dark/60 text-ink-muted transition-colors font-medium"
              >
                Cue Sheets CSV
              </button>
            </div>
          </div>
        </div>

        {importStatus && (
          <div
            role="alert"
            className={`max-w-6xl mx-auto mt-2 p-3 rounded-lg text-sm flex items-center justify-between ${
              importStatus.type === 'success'
                ? 'bg-teal-50 border border-teal/20 text-teal-900'
                : 'bg-rose-50 border border-rose/20 text-rose-900'
            }`}
          >
            <span>{importStatus.message}</span>
            <button
              type="button"
              onClick={() => { setImportStatus(null); }}
              className="text-xs underline font-medium ml-4 hover:opacity-80"
            >
              Dismiss
            </button>
          </div>
        )}
      </div>

      {/* Main Printable Document */}
      <div className="max-w-5xl mx-auto px-4 sm:px-8 py-8 print:p-0 print:max-w-none">
        {/* Celebration Header */}
        <section aria-labelledby="book-header-heading" className="bg-white rounded-2xl p-6 sm:p-10 border border-sand-dark mb-8 print:border-none print:p-0 print:mb-6 shadow-sm">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 border-b border-sand-dark pb-6 print:pb-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="font-serif font-bold text-xs uppercase tracking-widest text-ink bg-saffron px-2.5 py-0.5 rounded shadow-xs">
                  {plan.event.type.toUpperCase()}
                </span>
                <span className="text-xs text-ink-muted font-medium">Official Celebration Book</span>
              </div>
              <h1 id="book-header-heading" className="font-serif text-3xl sm:text-4xl font-bold text-ink tracking-tight">
                {plan.event.title}
              </h1>
              <p className="text-ink-muted text-sm mt-1">
                {plan.event.city} &bull; {plan.event.date} &bull; {plan.event.guests} Guests
              </p>
            </div>

            <div className="text-left sm:text-right bg-sand/50 sm:bg-transparent p-4 sm:p-0 rounded-xl w-full sm:w-auto">
              <div className="text-xs uppercase tracking-wider text-ink-muted font-medium">Total Budget</div>
              <div className="font-serif text-2xl sm:text-3xl font-bold text-ink">
                {formatINR(plan.event.budgetMinor)}
              </div>
              <div className="text-xs text-ink-muted mt-0.5">
                Protected Contingency: {formatINR(allocation.contingencyMinor)}
              </div>
            </div>
          </div>

          <div className="pt-4 flex flex-wrap items-center justify-between gap-4 text-xs text-ink-muted">
            <div>
              <span className="font-medium text-ink">Tagline:</span> Budget the moments, not the vendors.
            </div>
            <div>
              <span className="font-medium text-ink">Signature Moments:</span>{' '}
              {plan.moments.filter((m) => m.importance >= 4).length} of {plan.moments.length}
            </div>
            <div>
              <span className="font-medium text-ink">Vendors Coordinated:</span> {cueSheets.length}
            </div>
          </div>
        </section>

        {/* Section 1: Chronological Moment Schedule */}
        <section aria-labelledby="schedule-heading" className="bg-white rounded-2xl p-6 sm:p-8 border border-sand-dark mb-8 print:border-none print:p-0 print:mb-6 shadow-sm print:break-after-page">
          <div className="flex items-center justify-between mb-4 border-b border-sand-dark pb-3">
            <h2 id="schedule-heading" className="font-serif text-xl sm:text-2xl font-bold text-ink">
              1. Celebration Moment Schedule
            </h2>
            <span className="text-xs text-ink-muted">{sortedMoments.length} Planned Moments</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse" aria-label="Celebration moments in chronological order">
              <thead>
                <tr className="border-b-2 border-sand-dark text-xs uppercase tracking-wider text-ink-muted bg-sand/30">
                  <th scope="col" className="py-2.5 px-3">Time</th>
                  <th scope="col" className="py-2.5 px-3">Moment</th>
                  <th scope="col" className="py-2.5 px-2 text-center">Duration</th>
                  <th scope="col" className="py-2.5 px-2 text-center">Energy</th>
                  <th scope="col" className="py-2.5 px-2 text-center">Importance</th>
                  <th scope="col" className="py-2.5 px-3 text-right">Budget</th>
                  <th scope="col" className="py-2.5 px-3">Notes &amp; Focus</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sand-dark">
                {sortedMoments.map((m) => {
                  const momentBudget = allocMap.get(m.id) ?? 0;
                  return (
                    <tr key={m.id} className="hover:bg-sand/20 transition-colors">
                      <td className="py-3 px-3 font-mono font-medium text-ink whitespace-nowrap">
                        {minuteTo12HourString(m.startMinute)}
                      </td>
                      <td className="py-3 px-3 font-medium text-ink">
                        <div className="flex items-center gap-1.5">
                          {m.name}
                          {m.locked && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 font-medium">
                              Locked
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-2 text-center text-ink-muted whitespace-nowrap">
                        {m.durationMin} min
                      </td>
                      <td className="py-3 px-2 text-center">
                        <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-mist text-ink">
                          {m.energyTarget}/5
                        </span>
                      </td>
                      <td className="py-3 px-2 text-center">
                        <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-saffron/10 text-saffron-dark">
                          {m.importance}/5
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right font-medium text-ink whitespace-nowrap">
                        {formatINR(momentBudget)}
                      </td>
                      <td className="py-3 px-3 text-xs text-ink-muted max-w-xs">
                        {m.notes || '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        {/* Section 2: Master Budget Breakdown */}
        <section aria-labelledby="budget-breakdown-heading" className="bg-white rounded-2xl p-6 sm:p-8 border border-sand-dark mb-8 print:border-none print:p-0 print:mb-6 shadow-sm print:break-inside-avoid">
          <div className="flex items-center justify-between mb-4 border-b border-sand-dark pb-3">
            <h2 id="budget-breakdown-heading" className="font-serif text-xl sm:text-2xl font-bold text-ink">
              2. Master Moment Budget
            </h2>
            <span className="text-xs text-ink-muted">Largest-Remainder Exact Reconciled</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
            <div className="p-4 rounded-xl bg-sand/40 border border-sand-dark">
              <div className="text-xs text-ink-muted font-medium">Total Cap</div>
              <div className="text-xl font-bold font-serif text-ink mt-0.5">
                {formatINR(plan.event.budgetMinor)}
              </div>
            </div>
            <div className="p-4 rounded-xl bg-sand/40 border border-sand-dark">
              <div className="text-xs text-ink-muted font-medium">Protected Contingency</div>
              <div className="text-xl font-bold font-serif text-teal mt-0.5">
                {formatINR(allocation.contingencyMinor)}
              </div>
            </div>
            <div className="p-4 rounded-xl bg-sand/40 border border-sand-dark">
              <div className="text-xs text-ink-muted font-medium">Usable Allocation Pool</div>
              <div className="text-xl font-bold font-serif text-ink mt-0.5">
                {formatINR(allocation.usableMinor)}
              </div>
            </div>
            <div className="p-4 rounded-xl bg-sand/40 border border-sand-dark">
              <div className="text-xs text-ink-muted font-medium">Feasibility Status</div>
              <div className={`text-base font-bold font-serif mt-1 ${!allocation.feasibilityGap ? 'text-teal' : 'text-rose'}`}>
                {!allocation.feasibilityGap ? 'Feasible & Balanced' : `Gap: ${formatINR(allocation.feasibilityGap.shortfallMinor)}`}
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse" aria-label="Moment Budget Breakdown">
              <thead>
                <tr className="border-b-2 border-sand-dark text-xs uppercase tracking-wider text-ink-muted bg-sand/30">
                  <th scope="col" className="py-2.5 px-3">Moment</th>
                  <th scope="col" className="py-2.5 px-3 text-right">Direct Costs</th>
                  <th scope="col" className="py-2.5 px-3 text-right">Attributed Shared</th>
                  <th scope="col" className="py-2.5 px-3 text-right">Total Allocated</th>
                  <th scope="col" className="py-2.5 px-3 text-right">% of Budget</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sand-dark">
                {sortedMoments.map((m) => {
                  const attr = attrMap.get(m.id);
                  const direct = attr?.directCostMinor ?? 0;
                  const shared = attr?.sharedCostMinor ?? 0;
                  const total = allocMap.get(m.id) ?? (direct + shared);
                  const pct = plan.event.budgetMinor > 0
                    ? ((total / plan.event.budgetMinor) * 100).toFixed(1)
                    : '0.0';

                  return (
                    <tr key={m.id} className="hover:bg-sand/20">
                      <td className="py-2.5 px-3 font-medium text-ink">{m.name}</td>
                      <td className="py-2.5 px-3 text-right text-ink-muted">{formatINR(direct)}</td>
                      <td className="py-2.5 px-3 text-right text-ink-muted">{formatINR(shared)}</td>
                      <td className="py-2.5 px-3 text-right font-medium text-ink">{formatINR(total)}</td>
                      <td className="py-2.5 px-3 text-right text-xs text-ink-muted font-mono">{pct}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        {/* Section 3: Vendor Cue Sheets (Printable briefs) */}
        <section aria-labelledby="cuesheets-heading" className="bg-white rounded-2xl p-6 sm:p-8 border border-sand-dark mb-8 print:border-none print:p-0 print:mb-6 shadow-sm print:break-after-page">
          <div className="flex items-center justify-between mb-4 border-b border-sand-dark pb-3">
            <h2 id="cuesheets-heading" className="font-serif text-xl sm:text-2xl font-bold text-ink">
              3. Vendor Cue Sheets
            </h2>
            <span className="text-xs text-ink-muted">Print-ready briefs for each vendor</span>
          </div>

          <div className="space-y-6">
            {cueSheets.map((sheet) => (
              <div
                key={sheet.vendorId}
                className="border border-sand-dark rounded-xl p-4 sm:p-5 bg-sand/20 print:border print:border-black/20 print:p-4 print:break-inside-avoid"
              >
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-1 border-b border-sand-dark pb-2.5 mb-3">
                  <div>
                    <span className="text-xs uppercase font-semibold tracking-wider text-teal">
                      {sheet.vendorCategory}
                    </span>
                    <h3 className="font-serif text-lg font-bold text-ink">
                      {sheet.vendorName || `${sheet.vendorCategory} Lead`}
                    </h3>
                  </div>
                  {sheet.deadline && (
                    <div className="text-xs text-ink-muted bg-white px-2.5 py-1 rounded border border-sand-dark">
                      Confirm by: {sheet.deadline}
                    </div>
                  )}
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse" aria-label={`Cue sheet for ${sheet.vendorCategory}`}>
                    <thead>
                      <tr className="border-b border-sand-dark text-ink-muted font-semibold bg-white/60">
                        <th scope="col" className="py-2 px-2.5 w-24">Start Time</th>
                        <th scope="col" className="py-2 px-2.5 w-24">End Time</th>
                        <th scope="col" className="py-2 px-2.5 w-36">Moment</th>
                        <th scope="col" className="py-2 px-2.5">Specific Cue Trigger &amp; Focus</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-sand-dark">
                      {sheet.moments.map((cue, idx) => (
                        <tr key={idx} className="hover:bg-white/40">
                          <td className="py-2.5 px-2.5 font-mono font-medium text-ink whitespace-nowrap">
                            {cue.startTime}
                          </td>
                          <td className="py-2.5 px-2.5 font-mono text-ink-muted whitespace-nowrap">
                            {cue.endTime}
                          </td>
                          <td className="py-2.5 px-2.5 font-medium text-ink">{cue.momentName}</td>
                          <td className="py-2.5 px-2.5 text-ink">{cue.notes || 'Standard service'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Section 4: Backwards Timeline Checklist */}
        <section aria-labelledby="timeline-heading" className="bg-white rounded-2xl p-6 sm:p-8 border border-sand-dark print:border-none print:p-0 shadow-sm print:break-inside-avoid">
          <div className="flex items-center justify-between mb-4 border-b border-sand-dark pb-3">
            <h2 id="timeline-heading" className="font-serif text-xl sm:text-2xl font-bold text-ink">
              4. Backwards Timeline Checklist
            </h2>
            <span className="text-xs text-ink-muted">Dependency-Grounded Execution</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse" aria-label="Backwards Timeline Tasks">
              <thead>
                <tr className="border-b-2 border-sand-dark text-xs uppercase tracking-wider text-ink-muted bg-sand/30">
                  <th scope="col" className="py-2.5 px-3">Lead Time</th>
                  <th scope="col" className="py-2.5 px-3">Target Date</th>
                  <th scope="col" className="py-2.5 px-3">Task</th>
                  <th scope="col" className="py-2.5 px-3">Owner</th>
                  <th scope="col" className="py-2.5 px-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sand-dark">
                {timeline.tasks.map((task) => (
                  <tr key={task.id} className="hover:bg-sand/20">
                    <td className="py-2.5 px-3 font-mono text-xs text-ink-muted whitespace-nowrap">
                      T-{task.leadDays}d
                    </td>
                    <td className="py-2.5 px-3 font-mono text-xs text-ink whitespace-nowrap">
                      {task.dueDate}
                    </td>
                    <td className="py-2.5 px-3 font-medium text-ink">
                      <div className="flex items-center gap-1.5">
                        {task.critical && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-rose-100 text-rose-800 font-bold uppercase">
                            Critical
                          </span>
                        )}
                        <span>{task.title}</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-xs text-ink-muted">
                      {task.owner || 'Host'}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium uppercase tracking-wider ${
                        task.status === 'complete'
                          ? 'bg-teal-100 text-teal-800'
                          : task.status === 'overdue'
                          ? 'bg-rose-100 text-rose-800 font-bold'
                          : 'bg-sand text-ink-muted'
                      }`}>
                        {task.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
