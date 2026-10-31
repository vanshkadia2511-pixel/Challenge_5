/**
 * templates/index.ts — Starter templates for wedding, birthday and community events.
 *
 * ASSUMPTION: All prices are fictional editable estimates, clearly labelled as such.
 * Lead times and percentage splits are defaults; the user can change everything.
 */

import type { EventType } from '../../schemas/event';
import type { Moment, CostLine, Task, Vendor } from '../../schemas/moment';

export interface EventTemplate {
  moments: Omit<Moment, 'id'>[];
  costLines: Omit<CostLine, 'id'>[];
  tasks: Omit<Task, 'id' | 'dueDate'>[];
  vendors: Omit<Vendor, 'id'>[];
}

// ─── Helper ──────────────────────────────────────────────────────────────────

/** Fictional default budget split in paise for a ₹5 lakh (50,000,000 paise) event. */
function pct(totalPaise: number, percent: number): number {
  return Math.round((totalPaise * percent) / 100);
}

const DEFAULT_BUDGET = 50_000_000; // ₹5,00,000 — fictional editable estimate

// ─── Wedding template ─────────────────────────────────────────────────────────

const WEDDING: EventTemplate = {
  moments: [
    { name: 'Arrival & Welcome', importance: 3, energyTarget: 3, startMinute: 540, durationMin: 30, guestImpact: 1, locked: false, notes: '' },
    { name: 'Family Blessing', importance: 5, energyTarget: 4, startMinute: 570, durationMin: 45, guestImpact: 0.8, locked: false, notes: '' },
    { name: 'Ceremony', importance: 5, energyTarget: 5, startMinute: 630, durationMin: 60, guestImpact: 1, locked: false, notes: '' },
    { name: 'Couple Portraits', importance: 4, energyTarget: 2, startMinute: 720, durationMin: 45, guestImpact: 0.1, locked: false, notes: '' },
    { name: 'Toasts', importance: 4, energyTarget: 4, startMinute: 810, durationMin: 30, guestImpact: 0.9, locked: false, notes: '' },
    { name: 'Dinner', importance: 3, energyTarget: 2, startMinute: 840, durationMin: 90, guestImpact: 1, locked: false, notes: '' },
    { name: 'First Dance', importance: 5, energyTarget: 5, startMinute: 960, durationMin: 20, guestImpact: 1, locked: false, notes: '' },
    { name: 'Send-off', importance: 4, energyTarget: 4, startMinute: 1080, durationMin: 20, guestImpact: 1, locked: false, notes: '' },
  ],
  costLines: [
    { label: 'Venue (estimate)', kind: 'shared', amountMinor: pct(DEFAULT_BUDGET, 30), locked: false, status: 'estimate', momentIds: [], usageWeights: {} },
    { label: 'Catering (estimate)', kind: 'shared', amountMinor: pct(DEFAULT_BUDGET, 30), locked: false, status: 'estimate', momentIds: [], usageWeights: {} },
    { label: 'Decor (estimate)', kind: 'shared', amountMinor: pct(DEFAULT_BUDGET, 10), locked: false, status: 'estimate', momentIds: [], usageWeights: {} },
    { label: 'Photography (estimate)', kind: 'direct', amountMinor: pct(DEFAULT_BUDGET, 12), locked: false, status: 'estimate', momentIds: [], usageWeights: {} },
    { label: 'Sound / AV (estimate)', kind: 'shared', amountMinor: pct(DEFAULT_BUDGET, 5), locked: false, status: 'estimate', momentIds: [], usageWeights: {} },
    { label: 'Flowers (estimate)', kind: 'shared', amountMinor: pct(DEFAULT_BUDGET, 5), locked: false, status: 'estimate', momentIds: [], usageWeights: {} },
    { label: 'Transport (estimate)', kind: 'direct', amountMinor: pct(DEFAULT_BUDGET, 4), locked: false, status: 'estimate', momentIds: [], usageWeights: {} },
    { label: 'Contingency buffer', kind: 'direct', amountMinor: pct(DEFAULT_BUDGET, 4), locked: false, status: 'estimate', momentIds: [], usageWeights: {} },
  ],
  tasks: [
    { title: 'Book venue', momentId: null, leadDays: 180, status: 'pending', owner: '', dependsOn: [], critical: true },
    { title: 'Hire caterer', momentId: null, leadDays: 120, status: 'pending', owner: '', dependsOn: [], critical: true },
    { title: 'Book photographer', momentId: null, leadDays: 120, status: 'pending', owner: '', dependsOn: [], critical: false },
    { title: 'Book officiant', momentId: null, leadDays: 90, status: 'pending', owner: '', dependsOn: [], critical: true },
    { title: 'Send invitations', momentId: null, leadDays: 60, status: 'pending', owner: '', dependsOn: [], critical: false },
    { title: 'Confirm guest count with caterer', momentId: null, leadDays: 30, status: 'pending', owner: '', dependsOn: [], critical: true },
    { title: 'Finalise ceremony order', momentId: null, leadDays: 21, status: 'pending', owner: '', dependsOn: [], critical: false },
    { title: 'Rehearsal', momentId: null, leadDays: 1, status: 'pending', owner: '', dependsOn: [], critical: false },
  ],
  vendors: [
    { category: 'Venue', name: '', momentIds: [], status: 'not-contacted', questions: ['What is included in the hire fee?', 'Can we bring our own caterer?', 'What is the rain-day policy?'], deadline: undefined },
    { category: 'Caterer', name: '', momentIds: [], status: 'not-contacted', questions: ['Do you offer tastings?', 'What is the per-head cost range?', 'Can you cater dietary restrictions?'], deadline: undefined },
    { category: 'Photographer', name: '', momentIds: [], status: 'not-contacted', questions: ['Do you provide a second shooter?', 'When will we receive the gallery?', 'What is your backup plan?'], deadline: undefined },
    { category: 'Sound / AV', name: '', momentIds: [], status: 'not-contacted', questions: ['What PA system do you use?', 'Do you provide a microphone for toasts?', 'Can you manage background music?'], deadline: undefined },
    { category: 'Decor', name: '', momentIds: [], status: 'not-contacted', questions: ['Do you handle setup and teardown?', 'Can we see a portfolio?', 'What is your minimum order?'], deadline: undefined },
  ],
};

// ─── Birthday template ────────────────────────────────────────────────────────

const BIRTHDAY: EventTemplate = {
  moments: [
    { name: 'Arrival', importance: 2, energyTarget: 2, startMinute: 600, durationMin: 20, guestImpact: 1, locked: false, notes: '' },
    { name: 'Surprise Reveal', importance: 5, energyTarget: 5, startMinute: 630, durationMin: 15, guestImpact: 1, locked: false, notes: '' },
    { name: 'Games / Activity', importance: 3, energyTarget: 4, startMinute: 660, durationMin: 60, guestImpact: 0.9, locked: false, notes: '' },
    { name: 'Cake Moment', importance: 5, energyTarget: 5, startMinute: 750, durationMin: 20, guestImpact: 1, locked: false, notes: '' },
    { name: 'Speeches', importance: 4, energyTarget: 3, startMinute: 780, durationMin: 20, guestImpact: 0.9, locked: false, notes: '' },
    { name: 'Dinner / Snacks', importance: 3, energyTarget: 2, startMinute: 810, durationMin: 60, guestImpact: 1, locked: false, notes: '' },
    { name: 'Group Photo', importance: 4, energyTarget: 3, startMinute: 870, durationMin: 15, guestImpact: 1, locked: false, notes: '' },
    { name: 'Wind-down', importance: 2, energyTarget: 1, startMinute: 900, durationMin: 60, guestImpact: 0.7, locked: false, notes: '' },
  ],
  costLines: [
    { label: 'Venue / space hire (estimate)', kind: 'shared', amountMinor: pct(DEFAULT_BUDGET, 25), locked: false, status: 'estimate', momentIds: [], usageWeights: {} },
    { label: 'Catering / cake (estimate)', kind: 'shared', amountMinor: pct(DEFAULT_BUDGET, 30), locked: false, status: 'estimate', momentIds: [], usageWeights: {} },
    { label: 'Entertainment (estimate)', kind: 'direct', amountMinor: pct(DEFAULT_BUDGET, 15), locked: false, status: 'estimate', momentIds: [], usageWeights: {} },
    { label: 'Decor & balloons (estimate)', kind: 'shared', amountMinor: pct(DEFAULT_BUDGET, 10), locked: false, status: 'estimate', momentIds: [], usageWeights: {} },
    { label: 'Photography (estimate)', kind: 'direct', amountMinor: pct(DEFAULT_BUDGET, 10), locked: false, status: 'estimate', momentIds: [], usageWeights: {} },
    { label: 'Invitations & stationery (estimate)', kind: 'direct', amountMinor: pct(DEFAULT_BUDGET, 5), locked: false, status: 'estimate', momentIds: [], usageWeights: {} },
    { label: 'Miscellaneous (estimate)', kind: 'direct', amountMinor: pct(DEFAULT_BUDGET, 5), locked: false, status: 'estimate', momentIds: [], usageWeights: {} },
  ],
  tasks: [
    { title: 'Book venue', momentId: null, leadDays: 60, status: 'pending', owner: '', dependsOn: [], critical: true },
    { title: 'Send invitations', momentId: null, leadDays: 30, status: 'pending', owner: '', dependsOn: [], critical: false },
    { title: 'Order cake', momentId: null, leadDays: 14, status: 'pending', owner: '', dependsOn: [], critical: true },
    { title: 'Confirm RSVPs', momentId: null, leadDays: 7, status: 'pending', owner: '', dependsOn: [], critical: false },
    { title: 'Arrange decorations', momentId: null, leadDays: 3, status: 'pending', owner: '', dependsOn: [], critical: false },
    { title: 'Prepare playlist / entertainment', momentId: null, leadDays: 2, status: 'pending', owner: '', dependsOn: [], critical: false },
  ],
  vendors: [
    { category: 'Venue', name: '', momentIds: [], status: 'not-contacted', questions: ['What is the capacity?', 'Is a sound system included?', 'What are the parking arrangements?'], deadline: undefined },
    { category: 'Caterer', name: '', momentIds: [], status: 'not-contacted', questions: ['Can you provide a themed cake?', 'Do you offer buffet or plated service?', 'What is the per-head cost estimate?'], deadline: undefined },
    { category: 'Entertainment', name: '', momentIds: [], status: 'not-contacted', questions: ['What activities do you offer?', 'What age groups do you cater to?', 'What is your cancellation policy?'], deadline: undefined },
  ],
};

// ─── Community template ────────────────────────────────────────────────────────

const COMMUNITY: EventTemplate = {
  moments: [
    { name: 'Opening Ceremony', importance: 4, energyTarget: 4, startMinute: 540, durationMin: 30, guestImpact: 1, locked: false, notes: '' },
    { name: 'Performances', importance: 4, energyTarget: 4, startMinute: 600, durationMin: 90, guestImpact: 0.8, locked: false, notes: '' },
    { name: 'Food Stalls', importance: 3, energyTarget: 2, startMinute: 720, durationMin: 60, guestImpact: 1, locked: false, notes: '' },
    { name: 'Volunteer Shift Change', importance: 2, energyTarget: 2, startMinute: 780, durationMin: 15, guestImpact: 0.2, locked: false, notes: '' },
    { name: 'Raffle / Awards', importance: 5, energyTarget: 4, startMinute: 840, durationMin: 30, guestImpact: 1, locked: false, notes: '' },
    { name: 'Community Photo', importance: 4, energyTarget: 3, startMinute: 900, durationMin: 20, guestImpact: 1, locked: false, notes: '' },
    { name: 'Closing & Clean-up', importance: 2, energyTarget: 1, startMinute: 930, durationMin: 60, guestImpact: 0.4, locked: false, notes: '' },
  ],
  costLines: [
    { label: 'Venue / park permit (estimate)', kind: 'shared', amountMinor: pct(DEFAULT_BUDGET, 20), locked: false, status: 'estimate', momentIds: [], usageWeights: {} },
    { label: 'Stage & sound (estimate)', kind: 'shared', amountMinor: pct(DEFAULT_BUDGET, 20), locked: false, status: 'estimate', momentIds: [], usageWeights: {} },
    { label: 'Food stall subsidy (estimate)', kind: 'direct', amountMinor: pct(DEFAULT_BUDGET, 15), locked: false, status: 'estimate', momentIds: [], usageWeights: {} },
    { label: 'Performers / entertainment (estimate)', kind: 'direct', amountMinor: pct(DEFAULT_BUDGET, 20), locked: false, status: 'estimate', momentIds: [], usageWeights: {} },
    { label: 'Signage & printing (estimate)', kind: 'shared', amountMinor: pct(DEFAULT_BUDGET, 5), locked: false, status: 'estimate', momentIds: [], usageWeights: {} },
    { label: 'Insurance (estimate)', kind: 'direct', amountMinor: pct(DEFAULT_BUDGET, 5), locked: false, status: 'estimate', momentIds: [], usageWeights: {} },
    { label: 'Volunteer coordination (estimate)', kind: 'direct', amountMinor: pct(DEFAULT_BUDGET, 5), locked: false, status: 'estimate', momentIds: [], usageWeights: {} },
    { label: 'Miscellaneous (estimate)', kind: 'direct', amountMinor: pct(DEFAULT_BUDGET, 10), locked: false, status: 'estimate', momentIds: [], usageWeights: {} },
  ],
  tasks: [
    { title: 'Apply for venue / park permit', momentId: null, leadDays: 90, status: 'pending', owner: '', dependsOn: [], critical: true },
    { title: 'Confirm performers', momentId: null, leadDays: 60, status: 'pending', owner: '', dependsOn: [], critical: true },
    { title: 'Recruit volunteers', momentId: null, leadDays: 45, status: 'pending', owner: '', dependsOn: [], critical: false },
    { title: 'Book food stall vendors', momentId: null, leadDays: 30, status: 'pending', owner: '', dependsOn: [], critical: false },
    { title: 'Order signage & printing', momentId: null, leadDays: 21, status: 'pending', owner: '', dependsOn: [], critical: false },
    { title: 'Brief volunteers', momentId: null, leadDays: 7, status: 'pending', owner: '', dependsOn: [], critical: false },
    { title: 'Set up venue / equipment check', momentId: null, leadDays: 1, status: 'pending', owner: '', dependsOn: [], critical: true },
  ],
  vendors: [
    { category: 'Venue / Permits', name: '', momentIds: [], status: 'not-contacted', questions: ['What permits are required?', 'Are there noise restrictions?', 'What are the cleanup requirements?'], deadline: undefined },
    { category: 'Sound / AV', name: '', momentIds: [], status: 'not-contacted', questions: ['Can you provide a full PA system?', 'Do you include a sound engineer?', 'What is your setup time?'], deadline: undefined },
    { category: 'Performers', name: '', momentIds: [], status: 'not-contacted', questions: ['What is your set length?', 'Do you have public liability insurance?', 'What are your tech rider requirements?'], deadline: undefined },
    { category: 'Food Stalls', name: '', momentIds: [], status: 'not-contacted', questions: ['Do you have food safety certification?', 'What power do you need?', 'What percentage of revenue do you share?'], deadline: undefined },
  ],
};

// ─── Public API ───────────────────────────────────────────────────────────────

const TEMPLATES: Record<EventType, EventTemplate> = {
  wedding: WEDDING,
  birthday: BIRTHDAY,
  community: COMMUNITY,
};

export function getTemplate(eventType: EventType): EventTemplate {
  return TEMPLATES[eventType];
}

export { TEMPLATES };
