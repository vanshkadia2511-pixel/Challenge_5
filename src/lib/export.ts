/**
 * export.ts — Structured CSV and JSON exports for KSHAN celebrations.
 *
 * SPEC REQUIREMENT (§7, §8):
 * - CSV exports neutralise formula injection; JSON imports are schema-validated.
 * - Moment Book, exports, After-Event log.
 */

import type { Plan } from '../schemas/plan';
import { formatINR } from '../engine/money';
import { allocateMomentBudget } from '../engine/allocation';
import { attributeCosts } from '../engine/attribution';
import { scheduleTasks } from '../engine/timeline';
import { generateCueSheets } from '../engine/cuesheet';
import { minuteTo12HourString } from './format';
import { generateCsv, downloadCsv } from './csv';

/** Sanitize event title for filenames */
function getFileSlug(title: string): string {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'celebration';
}

/** Export Moment Budget to CSV */
export function exportBudgetCsv(plan: Plan): void {
  const allocation = allocateMomentBudget(plan.event, plan.moments, plan.costLines);
  const attributed = attributeCosts(plan.moments, plan.costLines, plan.event.guests);

  const allocMap = new Map(allocation.allocations.map((a) => [a.momentId, a.allocatedMinor]));
  const attrMap = new Map(attributed.perMoment.map((a) => [a.momentId, a]));

  const headers = [
    'Moment',
    'Importance (1-5)',
    'Energy Target (1-5)',
    'Start Time',
    'Duration (min)',
    'Direct Cost (INR)',
    'Attributed Shared (INR)',
    'Total Allocated (INR)',
    'Locked',
  ];

  const rows: (string | number | boolean)[][] = [headers];

  for (const m of plan.moments) {
    const attr = attrMap.get(m.id);
    const directPaise = attr?.directCostMinor ?? 0;
    const sharedPaise = attr?.sharedCostMinor ?? 0;
    const totalPaise = allocMap.get(m.id) ?? (directPaise + sharedPaise);

    rows.push([
      m.name,
      m.importance,
      m.energyTarget,
      minuteTo12HourString(m.startMinute),
      m.durationMin,
      formatINR(directPaise),
      formatINR(sharedPaise),
      formatINR(totalPaise),
      m.locked ? 'YES' : 'NO',
    ]);
  }

  // Summary row
  rows.push([
    'TOTAL BUDGET',
    '',
    '',
    '',
    '',
    '',
    'CONTINGENCY: ' + formatINR(allocation.contingencyMinor),
    'USABLE POOL: ' + formatINR(allocation.usableMinor),
    '',
  ]);

  const csv = generateCsv(rows);
  downloadCsv(`kshan-${getFileSlug(plan.event.title)}-budget.csv`, csv);
}

/** Export Backwards Timeline to CSV */
export function exportTimelineCsv(plan: Plan): void {
  const timeline = scheduleTasks(plan.tasks, plan.event.date);
  const momentMap = new Map(plan.moments.map((m) => [m.id, m.name]));

  const headers = [
    'Task',
    'Moment',
    'Lead Days',
    'Due Date',
    'Status',
    'Owner',
    'Critical',
    'Dependencies',
  ];

  const rows: (string | number | boolean)[][] = [headers];

  for (const t of timeline.tasks) {
    rows.push([
      t.title,
      t.momentId ? (momentMap.get(t.momentId) ?? 'Unknown') : 'Event-level',
      t.leadDays,
      t.dueDate,
      t.status,
      t.owner || 'Unassigned',
      t.critical ? 'CRITICAL' : 'Standard',
      t.dependsOn.join('; ') || 'None',
    ]);
  }

  const csv = generateCsv(rows);
  downloadCsv(`kshan-${getFileSlug(plan.event.title)}-timeline.csv`, csv);
}

/** Export Vendor Cue Sheets to CSV */
export function exportCueSheetsCsv(plan: Plan): void {
  const cueSheets = generateCueSheets(plan.vendors, plan.moments);

  const headers = [
    'Vendor Name',
    'Category',
    'Start Time',
    'End Time',
    'Moment',
    'Energy Target',
    'Requirements & Notes',
    'Key Questions',
  ];

  const rows: (string | number | boolean)[][] = [headers];

  for (const sheet of cueSheets) {
    const questionsStr = sheet.questions.join(' | ') || 'None';
    for (const m of sheet.moments) {
      rows.push([
        sheet.vendorName || `${sheet.vendorCategory} Lead`,
        sheet.vendorCategory,
        m.startTime,
        m.endTime,
        m.momentName,
        `${String(m.energyTarget)}/5`,
        m.notes || 'Standard service',
        questionsStr,
      ]);
    }
  }

  const csv = generateCsv(rows);
  downloadCsv(`kshan-${getFileSlug(plan.event.title)}-cuesheets.csv`, csv);
}

/** Export After-Event Log to CSV */
export function exportAfterEventCsv(plan: Plan): void {
  const allocation = allocateMomentBudget(plan.event, plan.moments, plan.costLines);
  const allocMap = new Map(allocation.allocations.map((a) => [a.momentId, a.allocatedMinor]));
  const logMap = new Map((plan.afterEvent?.moments ?? []).map((l) => [l.momentId, l]));

  const headers = [
    'Moment',
    'Planned Spend (INR)',
    'Actual Spend (INR)',
    'Variance (INR)',
    'Verdict (Keep / Skip)',
    'Reflective Notes',
  ];

  const rows: (string | number | boolean)[][] = [headers];

  for (const m of plan.moments) {
    const plannedPaise = allocMap.get(m.id) ?? 0;
    const log = logMap.get(m.id);
    const actualPaise = log?.actualSpendMinor ?? 0;
    const variancePaise = actualPaise - plannedPaise;

    rows.push([
      m.name,
      formatINR(plannedPaise),
      formatINR(actualPaise),
      (variancePaise >= 0 ? '+' : '-') + formatINR(Math.abs(variancePaise)),
      log?.rating === 'skip' ? 'SKIP NEXT TIME' : 'KEEP / WORTH IT',
      log?.notes || '',
    ]);
  }

  const csv = generateCsv(rows);
  downloadCsv(`kshan-${getFileSlug(plan.event.title)}-after-event.csv`, csv);
}

/** Export Full Plan as JSON file */
export function exportPlanJson(plan: Plan): void {
  const jsonStr = JSON.stringify(plan, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `kshan-${getFileSlug(plan.event.title)}-plan.json`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
