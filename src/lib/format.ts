/**
 * format.ts — Formatting helpers for currency, dates, and times.
 */

import { formatINR } from '../engine/money';

export { formatINR };

/** Formats ISO date 'YYYY-MM-DD' into a friendly readable string e.g. "15 Dec 2025" */
export function formatDateReadable(isoDate: string): string {
  if (!isoDate || !isoDate.includes('-')) return isoDate;
  const parts = isoDate.split('-');
  const y = Number(parts[0]);
  const m = Number(parts[1]);
  const d = Number(parts[2]);
  if (isNaN(y) || isNaN(m) || isNaN(d)) return isoDate;
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/** Converts minute of day (0–1439) to HH:MM format (24h) */
export function minuteToTimeString(minute: number): string {
  const safeMinute = Math.max(0, Math.min(1439, minute));
  const h = Math.floor(safeMinute / 60)
    .toString()
    .padStart(2, '0');
  const m = (safeMinute % 60).toString().padStart(2, '0');
  return `${h}:${m}`;
}

/** Converts minute of day (0–1439) to 12h format with am/pm e.g. "10:30 am" */
export function minuteTo12HourString(minute: number): string {
  const safeMinute = Math.max(0, Math.min(1439, minute));
  let h = Math.floor(safeMinute / 60);
  const m = (safeMinute % 60).toString().padStart(2, '0');
  const period = h >= 12 ? 'pm' : 'am';
  h = h % 12;
  if (h === 0) h = 12;
  return `${String(h)}:${m} ${period}`;
}

/** Parses "HH:MM" (24h) string into minute of day */
export function timeStringToMinute(timeStr: string): number {
  const [hStr, mStr] = timeStr.split(':');
  const h = Number(hStr);
  const m = Number(mStr);
  if (isNaN(h) || isNaN(m)) return 0;
  return Math.max(0, Math.min(1439, h * 60 + m));
}
