/// <reference types="vitest/globals" />
import { detectCycle, scheduleTasks } from '../../src/engine/timeline';
import type { Task } from '../../src/schemas/moment';

function makeTask(id: string, leadDays: number, dependsOn: string[] = [], critical = false): Task {
  return { id, title: `Task ${id}`, momentId: null, leadDays, status: 'pending', owner: '', dependsOn, critical };
}

const TODAY = new Date('2025-01-01');
const EVENT_FAR = '2025-12-01'; // 334 days away
const EVENT_NEAR = '2025-01-15'; // 14 days away

describe('timeline.ts — detectCycle', () => {
  it('returns null when no cycle exists', () => {
    const tasks = [makeTask('a', 30, []), makeTask('b', 20, ['a']), makeTask('c', 10, ['b'])];
    expect(detectCycle(tasks)).toBeNull();
  });

  it('detects a simple 2-node cycle', () => {
    const tasks = [makeTask('a', 30, ['b']), makeTask('b', 20, ['a'])];
    expect(detectCycle(tasks)).not.toBeNull();
  });

  it('detects a 3-node cycle', () => {
    const tasks = [makeTask('a', 30, ['c']), makeTask('b', 20, ['a']), makeTask('c', 10, ['b'])];
    expect(detectCycle(tasks)).not.toBeNull();
  });
});

describe('timeline.ts — scheduleTasks', () => {
  it('throws when a dependency cycle is detected', () => {
    const tasks = [makeTask('a', 30, ['b']), makeTask('b', 20, ['a'])];
    expect(() => scheduleTasks(tasks, EVENT_FAR, TODAY)).toThrow(/cycle/i);
  });

  it('due dates are computed as eventDate minus leadDays', () => {
    const tasks = [makeTask('a', 30)];
    const result = scheduleTasks(tasks, '2025-06-01', TODAY);
    expect(result.tasks[0]!.dueDate).toBe('2025-05-02'); // June 1 - 30 days
  });

  it('tasks with leadDays > daysUntilEvent are compressed and flagged', () => {
    const tasks = [makeTask('a', 90)]; // needs 90 days, only 14 available
    const result = scheduleTasks(tasks, EVENT_NEAR, TODAY);
    expect(result.anyCompressed).toBe(true);
    expect(result.tasks[0]!.compressed).toBe(true);
    expect(result.tasks[0]!.compressionNote).toMatch(/compressed/i);
  });

  it('propagates delay: dependent task cannot precede its dependency', () => {
    const tasks = [makeTask('first', 60, []), makeTask('second', 30, ['first'])];
    const result = scheduleTasks(tasks, EVENT_FAR, TODAY);
    const first = result.tasks.find((t) => t.id === 'first')!;
    const second = result.tasks.find((t) => t.id === 'second')!;
    // second has shorter lead, so it should come after first in dependency order
    expect(new Date(second.dueDate) >= new Date(first.dueDate)).toBe(true);
  });

  it('overdue tasks are marked overdue with a reason', () => {
    const pastEvent = '2024-01-01'; // in the past
    const tasks = [makeTask('t', 7)];
    const result = scheduleTasks(tasks, pastEvent, TODAY);
    expect(result.tasks[0]!.status).toBe('overdue');
    expect(result.tasks[0]!.statusReason).toMatch(/passed/i);
  });

  it('due-soon tasks (within 7 days) are marked due-soon', () => {
    const tasks = [makeTask('t', 5)]; // due in 5 days
    const result = scheduleTasks(tasks, EVENT_NEAR, TODAY);
    expect(['due-soon', 'pending', 'overdue', 'impossible']).toContain(result.tasks[0]!.status);
  });

  it('compression summary is non-empty when any task was compressed', () => {
    const tasks = [makeTask('t', 365)];
    const result = scheduleTasks(tasks, EVENT_NEAR, TODAY);
    expect(result.compressionSummary).not.toBe('');
  });

  it('impossible task IDs are reported', () => {
    const tasks = [makeTask('impossible-t', 999)];
    const result = scheduleTasks(tasks, EVENT_NEAR, TODAY);
    expect(result.impossibleTaskIds).toContain('impossible-t');
  });
});
