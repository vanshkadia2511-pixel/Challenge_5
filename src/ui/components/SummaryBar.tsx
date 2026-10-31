/**
 * SummaryBar.tsx — Persistent summary bar showing budget health and warnings.
 *
 * SPEC REQUIREMENT (§8):
 * A persistent summary bar shows total, allocated, contingency and open warnings.
 */

import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../../state/context';
import { allocateMomentBudget } from '../../engine/allocation';
import { computeEnergyCurve } from '../../engine/energy';
import { scheduleTasks } from '../../engine/timeline';
import { formatINR } from '../../engine/money';

export function SummaryBar() {
  const { state } = useAppContext();
  const { event, moments, costLines, tasks } = state.plan;

  // Compute budget allocation
  const allocation = useMemo(() => {
    return allocateMomentBudget(event, moments, costLines);
  }, [event, moments, costLines]);

  // Compute energy curve flags
  const energy = useMemo(() => {
    return computeEnergyCurve(moments);
  }, [moments]);

  // Compute timeline status
  const timeline = useMemo(() => {
    try {
      return scheduleTasks(tasks, event.date);
    } catch {
      return null;
    }
  }, [tasks, event.date]);

  const allocatedTotal = useMemo(() => {
    return allocation.allocations.reduce((sum, a) => sum + a.allocatedMinor, 0);
  }, [allocation]);

  const overdueCount = useMemo(() => {
    if (!timeline) return 0;
    return timeline.tasks.filter((t) => t.status === 'overdue' || t.status === 'impossible').length;
  }, [timeline]);

  return (
    <aside
      className="bg-ink text-paper border-b border-mist/20 py-2.5 px-4 text-xs sm:text-sm sticky top-16 z-20 shadow-md"
      aria-label="Event Budget & Health Summary"
    >
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Metric tiles */}
        <div className="flex flex-wrap items-center gap-4 sm:gap-6">
          <div className="flex items-center gap-1.5">
            <span className="text-mist">Total:</span>
            <span className="font-semibold tabular-nums text-paper">
              {formatINR(event.budgetMinor)}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-mist">Allocated:</span>
            <span className="font-semibold tabular-nums text-saffron">
              {formatINR(allocatedTotal)}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-mist">Contingency ({String(event.contingencyPct)}%):</span>
            <span className="font-semibold tabular-nums text-teal-300">
              {formatINR(allocation.contingencyMinor)}
            </span>
          </div>

          {allocation.lockedMinor > 0 && (
            <div className="flex items-center gap-1.5">
              <span className="text-mist">Locked:</span>
              <span className="font-semibold tabular-nums text-mist">
                {formatINR(allocation.lockedMinor)}
              </span>
            </div>
          )}
        </div>

        {/* Warnings / Alerts */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          {allocation.feasibilityGap && (
            <Link
              to="/plan"
              className="inline-flex items-center gap-1 bg-rose text-white px-2.5 py-1 rounded-full text-xs font-semibold hover:bg-rose/90 transition-colors"
              title={allocation.feasibilityGap.explanation}
            >
              <span aria-hidden="true">⚠️</span>
              <span>Gap: {formatINR(allocation.feasibilityGap.shortfallMinor)}</span>
            </Link>
          )}

          {energy.flags.length > 0 && (
            <Link
              to="/energy"
              className="inline-flex items-center gap-1 bg-saffron text-ink px-2.5 py-1 rounded-full text-xs font-semibold hover:bg-saffron/90 transition-colors"
              title={`${String(energy.flags.length)} Energy Curve warning(s)`}
            >
              <span aria-hidden="true">⚡</span>
              <span>{String(energy.flags.length)} Energy flag{energy.flags.length > 1 ? 's' : ''}</span>
            </Link>
          )}

          {overdueCount > 0 && (
            <Link
              to="/plan"
              className="inline-flex items-center gap-1 bg-rose text-white px-2.5 py-1 rounded-full text-xs font-semibold hover:bg-rose/90 transition-colors"
            >
              <span aria-hidden="true">⏱️</span>
              <span>{String(overdueCount)} Overdue task{overdueCount > 1 ? 's' : ''}</span>
            </Link>
          )}

          {!allocation.feasibilityGap && energy.flags.length === 0 && overdueCount === 0 && (
            <span className="inline-flex items-center gap-1 text-teal-300 text-xs font-medium">
              <span aria-hidden="true">✓</span>
              <span>Plan healthy</span>
            </span>
          )}
        </div>
      </div>
    </aside>
  );
}
