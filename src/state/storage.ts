/**
 * storage.ts — IndexedDB persistence with localStorage fallback.
 *
 * SPEC REQUIREMENT (§1):
 * Storage: IndexedDB (fallback localStorage), JSON export and import.
 */

import type { Plan } from '../schemas/plan';
import { PlanSchema, validatePlanImport } from '../schemas/plan';
import { getTemplate } from '../engine/templates';

const DB_NAME = 'kshan_db';
const DB_VERSION = 1;
const STORE_NAME = 'plans';
const LOCAL_STORAGE_KEY_PREFIX = 'kshan_plan_';
const ACTIVE_PLAN_KEY = 'kshan_active_plan_id';

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!('indexedDB' in window)) {
      reject(new Error('IndexedDB not supported in this environment'));
      return;
    }
    const request = window.indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => {
      reject(request.error ?? new Error('IndexedDB open error'));
    };
    request.onsuccess = () => {
      resolve(request.result);
    };
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'event.id' });
      }
    };
  });
}

/** Save a plan to IndexedDB (or localStorage on fallback) */
export async function savePlan(plan: Plan): Promise<void> {
  const validated = PlanSchema.parse(plan);
  try {
    const db = await openDatabase();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(validated);
      req.onsuccess = () => {
        resolve();
      };
      req.onerror = () => {
        reject(req.error ?? new Error('IndexedDB put error'));
      };
    });
  } catch {
    // Fallback to localStorage
    localStorage.setItem(
      `${LOCAL_STORAGE_KEY_PREFIX}${validated.event.id}`,
      JSON.stringify(validated),
    );
  }

  // Record active plan ID
  localStorage.setItem(ACTIVE_PLAN_KEY, validated.event.id);
}

/** Load a plan by event ID from IndexedDB (or localStorage on fallback) */
export async function loadPlan(id: string): Promise<Plan | null> {
  try {
    const db = await openDatabase();
    const plan = await new Promise<Plan | undefined>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(id);
      req.onsuccess = () => {
        resolve(req.result as Plan | undefined);
      };
      req.onerror = () => {
        reject(req.error ?? new Error('IndexedDB get error'));
      };
    });

    if (plan) {
      return PlanSchema.parse(plan);
    }
  } catch {
    // Fallback to localStorage
  }

  const raw = localStorage.getItem(`${LOCAL_STORAGE_KEY_PREFIX}${id}`);
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as unknown;
      return validatePlanImport(parsed);
    } catch {
      return null;
    }
  }

  return null;
}

/** Get the last active plan ID */
export function getActivePlanId(): string | null {
  return localStorage.getItem(ACTIVE_PLAN_KEY);
}

/** Create a fresh initial plan from a template */
export function createPlanFromTemplate(
  type: 'wedding' | 'birthday' | 'community',
  title = '',
  city = 'Mumbai',
  date = '2025-11-15',
  guests = 150,
  budgetRupees = 500_000,
): Plan {
  const template = getTemplate(type);
  const eventId = `event-${String(Date.now())}`;
  const defaultTitle =
    title.trim() ||
    (type === 'wedding'
      ? 'Aarav & Ananya’s Wedding'
      : type === 'birthday'
        ? 'Rohan’s 30th Birthday Celebration'
        : 'Community Cultural Festival');

  const moments = template.moments.map((m, idx) => ({
    ...m,
    id: `moment-${String(idx + 1)}`,
  }));

  const costLines = template.costLines.map((cl, idx) => ({
    ...cl,
    id: `cost-${String(idx + 1)}`,
  }));

  const tasks = template.tasks.map((t, idx) => ({
    ...t,
    id: `task-${String(idx + 1)}`,
  }));

  const vendors = template.vendors.map((v, idx) => ({
    ...v,
    id: `vendor-${String(idx + 1)}`,
  }));

  return {
    event: {
      id: eventId,
      title: defaultTitle,
      type,
      date,
      city,
      guests,
      currency: 'INR',
      budgetMinor: budgetRupees * 100, // into paise
      contingencyPct: 10,
      setting: 'indoor',
      notes: 'Initial plan created from template. Budget the moments, not the vendors.',
    },
    moments,
    costLines,
    tasks,
    vendors,
    ideas: [],
    audit: [
      {
        ts: Date.now(),
        action: 'CREATED_PLAN',
        detail: `Created ${type} event "${defaultTitle}"`,
      },
    ],
  };
}
