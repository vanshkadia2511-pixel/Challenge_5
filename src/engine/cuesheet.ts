/**
 * cuesheet.ts — Per-vendor cue sheet generator.
 *
 * RULES (from spec §4.7):
 *  - per vendor: only their moments, exact times, questions, deadline
 */

import type { Moment, Vendor } from '../schemas/moment';

export interface CueSheetMoment {
  momentId: string;
  momentName: string;
  startTime: string; // HH:MM
  endTime: string;   // HH:MM
  durationMin: number;
  energyTarget: number;
  notes: string;
}

export interface CueSheet {
  vendorId: string;
  vendorCategory: string;
  vendorName: string;
  deadline?: string | undefined; // ISO date
  moments: CueSheetMoment[];
  questions: string[];
}

function minutesToTime(m: number): string {
  const h = Math.floor(m / 60).toString().padStart(2, '0');
  const min = (m % 60).toString().padStart(2, '0');
  return `${h}:${min}`;
}

/**
 * Generate a cue sheet for every vendor.
 * Each sheet contains only the moments that vendor serves.
 * Pure function — no I/O.
 */
export function generateCueSheets(
  vendors: readonly Vendor[],
  moments: readonly Moment[],
): CueSheet[] {
  const momentMap = new Map(moments.map((m) => [m.id, m]));

  return vendors.map((vendor) => {
    const vendorMoments: CueSheetMoment[] = vendor.momentIds
      .map((mid) => momentMap.get(mid))
      .filter((m): m is Moment => m !== undefined)
      .sort((a, b) => a.startMinute - b.startMinute)
      .map((m) => ({
        momentId: m.id,
        momentName: m.name,
        startTime: minutesToTime(m.startMinute),
        endTime: minutesToTime(m.startMinute + m.durationMin),
        durationMin: m.durationMin,
        energyTarget: m.energyTarget,
        notes: m.notes,
      }));

    return {
      vendorId: vendor.id,
      vendorCategory: vendor.category,
      vendorName: vendor.name,
      deadline: vendor.deadline,
      moments: vendorMoments,
      questions: [...vendor.questions],
    };
  });
}
