/**
 * timeline.ts — Task timeline engine.
 *
 * RULES (from spec §4.5):
 *  - tasks generated from templates, due = eventDate - leadDays
 *  - dependency DAG; detect cycles and reject; propagate delays downstream
 *  - if event is closer than recommended lead time, compress and EXPLAIN
 *  - states: complete, due-soon, overdue, at-risk, impossible — each with reason
 */

import type { Task } from '../schemas/moment';

export interface ScheduledTask extends Task {
  dueDate: string; // ISO YYYY-MM-DD (always present after scheduling)
  status: Task['status'];
  /** Human-readable reason for the current status. */
  statusReason: string;
  /** True when this task's lead time was compressed. */
  compressed: boolean;
  /** Compression explanation if compressed. */
  compressionNote?: string | undefined;
}

export interface TimelineResult {
  tasks: ScheduledTask[];
  /** Total days until the event. */
  daysUntilEvent: number;
  /** Whether any tasks were compressed. */
  anyCompressed: boolean;
  /** Overall compression summary (empty when no compression). */
  compressionSummary: string;
  /** Task IDs that are impossible to complete in time. */
  impossibleTaskIds: string[];
}

/** Detect a cycle in the task dependency graph. Returns cycle path or null. */
export function detectCycle(tasks: readonly Task[]): string[] | null {
  const taskMap = new Map(tasks.map((t) => [t.id, t]));
  const visited = new Set<string>();
  const stack = new Set<string>();

  function dfs(id: string, path: string[]): string[] | null {
    if (stack.has(id)) return [...path, id]; // cycle found
    if (visited.has(id)) return null;
    visited.add(id);
    stack.add(id);
    const task = taskMap.get(id);
    if (task) {
      for (const dep of task.dependsOn) {
        const cycle = dfs(dep, [...path, id]);
        if (cycle) return cycle;
      }
    }
    stack.delete(id);
    return null;
  }

  for (const task of tasks) {
    const cycle = dfs(task.id, []);
    if (cycle) return cycle;
  }
  return null;
}

/**
 * Schedule tasks relative to the event date.
 * Throws if a dependency cycle is detected.
 * Compresses lead times when the event is closer than required.
 */
export function scheduleTasks(
  tasks: readonly Task[],
  eventDateStr: string,
  today: Date = new Date(),
): TimelineResult {
  // Reject cycles
  const cycle = detectCycle(tasks);
  if (cycle) {
    throw new Error(
      `Dependency cycle detected in tasks: ${cycle.join(' → ')}`,
    );
  }

  const eventDate = parseDate(eventDateStr);
  const daysUntilEvent = Math.ceil(
    (eventDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
  );

  // Topological sort (dependencies first)
  const sorted = topologicalSort(tasks);

  // Compute effective lead days after compression
  const scheduledMap = new Map<string, ScheduledTask>();
  const compressedIds = new Set<string>();

  for (const task of sorted) {
    let effectiveLeadDays = task.leadDays;
    let compressed = false;
    let compressionNote: string | undefined;

    if (task.leadDays > daysUntilEvent && daysUntilEvent >= 0) {
      if (task.leadDays <= 365) {
        // Compress: keep as many lead days as possible, but cap at daysUntilEvent
        const originalLeadDays = task.leadDays;
        effectiveLeadDays = Math.max(0, daysUntilEvent - 1);
        compressed = true;
        compressionNote = `Compressed from ${String(originalLeadDays)} to ${String(effectiveLeadDays)} days: event is closer than recommended lead time.`;
        compressedIds.add(task.id);
      }
    }

    const dueDate = addDays(eventDate, -effectiveLeadDays);
    const dueDateStr = formatDate(dueDate);
    const daysToDue = Math.ceil(
      (dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
    );

    // Determine status
    let status: Task['status'] = task.status;
    let statusReason = '';

    if (task.status === 'complete') {
      statusReason = 'Marked complete.';
    } else if (daysUntilEvent < 0 || (effectiveLeadDays <= daysUntilEvent && daysToDue < 0)) {
      status = 'overdue';
      statusReason = `Due date ${dueDateStr} has passed.`;
    } else if (effectiveLeadDays > daysUntilEvent) {
      status = 'impossible';
      statusReason = `Requires ${String(task.leadDays)} days lead time but only ${String(daysUntilEvent)} days remain.`;
    } else if (daysToDue <= 7) {
      status = 'due-soon';
      statusReason = `Due in ${String(daysToDue)} day(s).`;
    } else if (task.critical && daysToDue <= 14) {
      status = 'at-risk';
      statusReason = `Critical task due in ${String(daysToDue)} days.`;
    } else {
      status = 'pending';
      statusReason = `Due on ${dueDateStr} (${String(daysToDue)} days away).`;
    }

    scheduledMap.set(task.id, {
      ...task,
      dueDate: dueDateStr,
      status,
      statusReason,
      compressed,
      compressionNote,
    });
  }

  const scheduledTasks = sorted
    .map((t) => scheduledMap.get(t.id))
    .filter((t): t is ScheduledTask => t !== undefined);
  const impossibleTaskIds = scheduledTasks
    .filter((t) => t.status === 'impossible')
    .map((t) => t.id);

  const anyCompressed = compressedIds.size > 0;
  const compressionSummary = anyCompressed
    ? `${String(compressedIds.size)} task(s) had their lead times compressed because the event is ${String(daysUntilEvent)} days away.`
    : '';

  return {
    tasks: scheduledTasks,
    daysUntilEvent,
    anyCompressed,
    compressionSummary,
    impossibleTaskIds,
  };
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function parseDate(dateStr: string): Date {
  const parts = dateStr.split('-');
  const y = Number(parts[0]);
  const m = Number(parts[1]);
  const d = Number(parts[2]);
  return new Date(y, m - 1, d);
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${String(y)}-${m}-${d}`;
}

function topologicalSort(tasks: readonly Task[]): Task[] {
  const taskMap = new Map(tasks.map((t) => [t.id, t]));
  const visited = new Set<string>();
  const result: Task[] = [];

  function visit(id: string): void {
    if (visited.has(id)) return;
    visited.add(id);
    const task = taskMap.get(id);
    if (task) {
      for (const dep of task.dependsOn) visit(dep);
      result.push(task);
    }
  }

  for (const task of tasks) visit(task.id);
  return result;
}
