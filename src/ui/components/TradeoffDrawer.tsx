/**
 * TradeoffDrawer.tsx — Interactive trade-off preview drawer.
 *
 * SPEC REQUIREMENT (§4.4, §8):
 * Trade-off preview drawer: cut or upgrade a moment and see the effect on
 * budget, tasks and warnings before anything changes.
 */

import { useState, useMemo } from 'react';
import { useAppContext } from '../../state/context';
import { cutMoment, upgradeMoment } from '../../engine/tradeoff';
import { formatINR } from '../../engine/money';

interface TradeoffDrawerProps {
  momentId: string | null;
  onClose: () => void;
}

export function TradeoffDrawer({ momentId, onClose }: TradeoffDrawerProps) {
  const { state, dispatch } = useAppContext();
  const [mode, setMode] = useState<'cut' | 'upgrade'>('cut');
  const [upgradeRupees, setUpgradeRupees] = useState(25000); // ₹25,000 default

  const moment = useMemo(() => {
    if (!momentId) return null;
    return state.plan.moments.find((m) => m.id === momentId) ?? null;
  }, [state.plan.moments, momentId]);

  // Compute trade-off simulation purely using engine functions
  const simulation = useMemo(() => {
    if (!momentId || !moment) return null;
    try {
      if (mode === 'cut') {
        return cutMoment(state.plan, momentId);
      } else {
        const deltaPaise = Math.round(upgradeRupees * 100);
        return upgradeMoment(state.plan, momentId, deltaPaise);
      }
    } catch {
      return null;
    }
  }, [state.plan, momentId, moment, mode, upgradeRupees]);

  if (!momentId || !moment) return null;

  const handleApply = () => {
    if (mode === 'cut') {
      dispatch({ type: 'APPLY_CUT_MOMENT', momentId });
    } else {
      const deltaPaise = Math.round(upgradeRupees * 100);
      dispatch({ type: 'APPLY_UPGRADE_MOMENT', momentId, deltaMinor: deltaPaise });
    }
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden bg-ink/50 backdrop-blur-sm flex justify-end transition-opacity"
      role="dialog"
      aria-modal="true"
      aria-labelledby="tradeoff-title"
    >
      <div className="w-full max-w-xl bg-paper h-full shadow-2xl flex flex-col border-l border-mist overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-mist bg-mist/30 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold tracking-wider text-teal uppercase">
              Trade-Off Simulator
            </span>
            <h2 id="tradeoff-title" className="font-serif text-2xl font-bold text-ink">
              Simulate Trade-off: {moment.name}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-ink/80 hover:text-ink p-2 rounded-full hover:bg-mist/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-saffron font-bold text-lg"
            aria-label="Close trade-off simulator"
          >
            ✕
          </button>
        </div>

        {/* Content body */}
        <div className="p-6 space-y-6 flex-1">
          {/* Mode Switcher */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-mist/60 rounded-lg">
            <button
              type="button"
              onClick={() => {
                setMode('cut');
              }}
              className={`py-2 text-sm font-semibold rounded-md transition-colors ${
                mode === 'cut'
                  ? 'bg-rose text-white shadow-sm'
                  : 'text-ink/70 hover:text-ink'
              }`}
            >
              Simulate Cut (Free Budget)
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('upgrade');
              }}
              className={`py-2 text-sm font-semibold rounded-md transition-colors ${
                mode === 'upgrade'
                  ? 'bg-teal text-white shadow-sm'
                  : 'text-ink/70 hover:text-ink'
              }`}
            >
              Simulate Upgrade (Boost Moment)
            </button>
          </div>

          {/* Upgrade Delta Input */}
          {mode === 'upgrade' && (
            <div className="bg-white p-4 rounded-lg border border-mist shadow-sm space-y-2">
              <label htmlFor="upgrade-amount" className="block text-sm font-medium text-ink">
                Upgrade Amount (₹)
              </label>
              <div className="flex items-center gap-3">
                <input
                  id="upgrade-amount"
                  type="number"
                  min="1000"
                  step="5000"
                  value={upgradeRupees}
                  onChange={(e) => {
                    setUpgradeRupees(Math.max(1000, Number(e.target.value)));
                  }}
                  className="w-full px-3 py-2 border border-mist rounded-md text-ink font-semibold focus-visible:ring-2 focus-visible:ring-saffron"
                />
                <span className="text-xs text-ink/60 tabular-nums">
                  {formatINR(upgradeRupees * 100)}
                </span>
              </div>
            </div>
          )}

          {/* Simulation Output */}
          {simulation && (
            <div className="space-y-4">
              {/* Financial delta banner */}
              <div
                className={`p-4 rounded-lg border flex items-center justify-between ${
                  mode === 'cut'
                    ? 'bg-teal/10 border-teal/30 text-teal'
                    : 'bg-saffron/10 border-saffron/40 text-ink'
                }`}
              >
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wide">
                    {mode === 'cut' ? 'Funds to be Freed' : 'Additional Direct Cost'}
                  </div>
                  <div className="text-2xl font-bold font-serif tabular-nums">
                    {formatINR(Math.abs(simulation.freedMinor))}
                  </div>
                </div>
                <div className="text-right text-xs text-ink/70">
                  <div>Previous usable: {formatINR(simulation.before.usableMinor)}</div>
                  <div>New usable: {formatINR(simulation.after.usableMinor)}</div>
                </div>
              </div>

              {/* Warnings */}
              {simulation.warnings.length > 0 && (
                <div className="bg-rose/10 border border-rose/30 rounded-lg p-4 space-y-2">
                  <div className="text-xs font-bold text-rose uppercase tracking-wide flex items-center gap-1">
                    <span>⚠️</span> Attention Required
                  </div>
                  <ul className="text-xs text-rose space-y-1 pl-4 list-disc">
                    {simulation.warnings.map((w, i) => (
                      <li key={i}>{w}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Tasks Removed */}
              {simulation.tasksRemoved.length > 0 && (
                <div className="bg-white p-4 rounded-lg border border-mist space-y-2">
                  <div className="text-xs font-semibold text-ink/80 uppercase">
                    Tasks To Be Removed ({String(simulation.tasksRemoved.length)})
                  </div>
                  <ul className="text-xs text-ink/70 space-y-1 pl-4 list-disc">
                    {simulation.tasksRemoved.map((t, i) => (
                      <li key={i}>{t}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Vendors Affected */}
              {simulation.vendorsAffected.length > 0 && (
                <div className="bg-white p-4 rounded-lg border border-mist space-y-2">
                  <div className="text-xs font-semibold text-ink/80 uppercase">
                    Vendors Exclusively Affected ({String(simulation.vendorsAffected.length)})
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {simulation.vendorsAffected.map((v, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 bg-mist/60 text-ink rounded-full text-xs font-medium"
                      >
                        {v}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Budget redistribution breakdown */}
              <div className="bg-white p-4 rounded-lg border border-mist space-y-3">
                <div className="text-xs font-semibold text-ink/80 uppercase">
                  Redistributed Allocations
                </div>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {simulation.after.allocations.map((alloc) => (
                    <div
                      key={alloc.momentId}
                      className="flex items-center justify-between text-xs py-1 border-b border-mist/40 last:border-none"
                    >
                      <span className="font-medium text-ink truncate max-w-[200px]">
                        {alloc.momentName}
                      </span>
                      <span className="font-semibold tabular-nums text-teal">
                        {formatINR(alloc.allocatedMinor)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="p-6 border-t border-mist bg-mist/20 flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-md text-sm font-semibold text-ink/80 hover:text-ink hover:bg-mist"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleApply}
            className={`px-5 py-2.5 rounded-md text-sm font-bold text-white shadow-sm transition-all ${
              mode === 'cut' ? 'bg-rose hover:bg-rose/90' : 'bg-teal hover:bg-teal/90'
            }`}
          >
            {mode === 'cut' ? 'Apply Trade-off (Cut & Redistribute)' : 'Apply Trade-off (Upgrade)'}
          </button>
        </div>
      </div>
    </div>
  );
}
