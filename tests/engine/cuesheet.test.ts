/// <reference types="vitest/globals" />
import { generateCueSheets } from '../../src/engine/cuesheet';
import type { Moment, Vendor } from '../../src/schemas/moment';

function makeMoment(id: string, start: number, dur: number): Moment {
  return { id, name: `Moment ${id}`, importance: 3, energyTarget: 3, startMinute: start, durationMin: dur, guestImpact: 0.5, locked: false, notes: 'Some notes' };
}
function makeVendor(id: string, momentIds: string[], questions: string[]): Vendor {
  return { id, category: `Cat-${id}`, name: `Vendor ${id}`, momentIds, status: 'not-contacted', questions, deadline: '2025-11-01' };
}

describe('cuesheet.ts', () => {
  it('generates one cue sheet per vendor', () => {
    const vendors = [makeVendor('v1', ['m1'], []), makeVendor('v2', ['m2'], [])];
    const moments = [makeMoment('m1', 600, 60), makeMoment('m2', 720, 45)];
    const sheets = generateCueSheets(vendors, moments);
    expect(sheets).toHaveLength(2);
  });

  it('each cue sheet contains only the moments that vendor serves', () => {
    const vendors = [makeVendor('v1', ['m1'], [])];
    const moments = [makeMoment('m1', 600, 60), makeMoment('m2', 720, 45)];
    const sheets = generateCueSheets(vendors, moments);
    expect(sheets[0]!.moments).toHaveLength(1);
    expect(sheets[0]!.moments[0]!.momentId).toBe('m1');
  });

  it('moments in cue sheet are sorted by startMinute', () => {
    const vendors = [makeVendor('v1', ['m2', 'm1'], [])];
    const moments = [makeMoment('m1', 600, 60), makeMoment('m2', 480, 30)];
    const sheets = generateCueSheets(vendors, moments);
    const times = sheets[0]!.moments.map((m) => m.startTime);
    expect(times[0]).toBe('08:00'); // 480 min
    expect(times[1]).toBe('10:00'); // 600 min
  });

  it('startTime and endTime are correctly formatted HH:MM', () => {
    const vendors = [makeVendor('v1', ['m1'], [])];
    const moments = [makeMoment('m1', 630, 90)]; // 10:30 to 12:00
    const sheets = generateCueSheets(vendors, moments);
    expect(sheets[0]!.moments[0]!.startTime).toBe('10:30');
    expect(sheets[0]!.moments[0]!.endTime).toBe('12:00');
  });

  it('questions are included in the cue sheet', () => {
    const vendors = [makeVendor('v1', ['m1'], ['Do you have parking?', 'What is your setup time?'])];
    const moments = [makeMoment('m1', 600, 60)];
    const sheets = generateCueSheets(vendors, moments);
    expect(sheets[0]!.questions).toHaveLength(2);
    expect(sheets[0]!.questions[0]).toBe('Do you have parking?');
  });

  it('returns an empty sheet when vendor has no moment IDs', () => {
    const vendors = [makeVendor('v1', [], [])];
    const moments = [makeMoment('m1', 600, 60)];
    const sheets = generateCueSheets(vendors, moments);
    expect(sheets[0]!.moments).toHaveLength(0);
  });

  it('does not mutate input arrays', () => {
    const vendors = [makeVendor('v1', ['m1'], [])];
    const moments = [makeMoment('m1', 600, 60)];
    const vs = JSON.stringify(vendors);
    const ms = JSON.stringify(moments);
    generateCueSheets(vendors, moments);
    expect(JSON.stringify(vendors)).toBe(vs);
    expect(JSON.stringify(moments)).toBe(ms);
  });
});
