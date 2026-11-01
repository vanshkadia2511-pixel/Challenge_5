/**
 * PlanWorkspacePage.tsx — Complete event plan workspace and authenticated dashboard.
 * Matches references 02_event_dashboard.png and 04_budget_analytics.png.
 *
 * SPEC REQUIREMENT (§8):
 * Plan workspace (one page, sections not generic tabs): Moment Budget table with
 * cost per moment, trade-off preview drawer, Timeline, Vendor Cue Sheets, Ideas.
 */

import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../../state/context';
import { allocateMomentBudget } from '../../engine/allocation';
import { attributeCosts } from '../../engine/attribution';
import { scheduleTasks } from '../../engine/timeline';
import { generateCueSheets } from '../../engine/cuesheet';
import { formatINR } from '../../engine/money';
import { formatDateReadable } from '../../lib/format';
import { TradeoffDrawer } from '../components/TradeoffDrawer';
import { AIPlannerModal } from '../components/AIPlannerModal';

export function PlanWorkspacePage() {
  const { state, dispatch } = useAppContext();
  const { event, moments, costLines, tasks, vendors, ideas } = state.plan;

  const [tradeoffMomentId, setTradeoffMomentId] = useState<string | null>(null);
  const [showAIModal, setShowAIModal] = useState(false);
  const [showAddGuestModal, setShowAddGuestModal] = useState(false);
  const [newGuestCount, setNewGuestCount] = useState(String(event.guests));
  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);
  const [newExpenseLabel, setNewExpenseLabel] = useState('');
  const [newExpenseAmount, setNewExpenseAmount] = useState('');
  const [newExpenseMomentId, setNewExpenseMomentId] = useState('');

  // 1. Moment Budget allocation
  const allocation = useMemo(() => {
    return allocateMomentBudget(event, moments, costLines);
  }, [event, moments, costLines]);

  // 2. Cost attribution per moment
  const attribution = useMemo(() => {
    return attributeCosts(moments, costLines, event.guests);
  }, [moments, costLines, event.guests]);

  // 3. Backwards timeline
  const timeline = useMemo(() => {
    try {
      return scheduleTasks(tasks, event.date);
    } catch (err) {
      return {
        tasks: [],
        daysUntilEvent: 0,
        anyCompressed: false,
        compressionSummary: (err as Error).message,
        impossibleTaskIds: [],
      };
    }
  }, [tasks, event.date]);

  // 4. Vendor cue sheets
  const cueSheets = useMemo(() => {
    return generateCueSheets(vendors, moments);
  }, [vendors, moments]);

  // Metrics calculations
  const totalSpentMinor = useMemo(() => {
    return costLines.reduce((acc, c) => acc + c.amountMinor, 0);
  }, [costLines]);

  const completedTasksCount = useMemo(() => {
    return tasks.filter((t) => t.status === 'complete').length;
  }, [tasks]);

  const taskCompletionPct = tasks.length > 0
    ? Math.round((completedTasksCount / tasks.length) * 100)
    : 0;

  const remainingBudgetMinor = Math.max(0, event.budgetMinor - totalSpentMinor);
  const budgetSpentPct = event.budgetMinor > 0
    ? Math.min(100, Math.round((totalSpentMinor / event.budgetMinor) * 100))
    : 0;

  const handleUpdateGuests = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseInt(newGuestCount, 10);
    if (!isNaN(parsed) && parsed > 0) {
      dispatch({ type: 'UPDATE_EVENT', event: { guests: parsed } });
      setShowAddGuestModal(false);
    }
  };

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(newExpenseAmount);
    if (newExpenseLabel.trim() && !isNaN(amountNum) && amountNum > 0) {
      dispatch({
        type: 'ADD_COST_LINE',
        costLine: {
          id: `manual-cost-${String(Date.now())}`,
          label: newExpenseLabel.trim(),
          kind: newExpenseMomentId ? 'direct' : 'shared',
          amountMinor: Math.round(amountNum * 100),
          locked: false,
          status: 'estimate',
          momentIds: newExpenseMomentId ? [newExpenseMomentId] : [],
          usageWeights: {},
        },
      });
      setNewExpenseLabel('');
      setNewExpenseAmount('');
      setNewExpenseMomentId('');
      setShowAddExpenseModal(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* SECTION 0: DASHBOARD HERO BANNER (Reference 02) */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-mist/80 pb-4">
          <div>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-ink flex items-center gap-2">
              Good morning, Vansh! <span className="text-saffron">✨</span>
            </h1>
            <p className="text-sm text-ink/70">Let&apos;s make your celebration extraordinary.</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setShowAIModal(true);
              }}
              className="px-4 py-2 rounded-xl bg-saffron text-ink font-semibold text-xs shadow-sm hover:bg-saffron/90 transition-all inline-flex items-center gap-1.5"
            >
              <span>🤖</span> Ask AI Planner
            </button>
            <Link
              to="/vendors"
              className="px-4 py-2 rounded-xl bg-white border border-mist text-ink font-semibold text-xs hover:bg-mist/40 transition-colors shadow-sm"
            >
              Find Vendors →
            </Link>
          </div>
        </div>

        {/* Active Celebration Hero Card */}
        <div className="relative rounded-3xl overflow-hidden bg-white border border-mist shadow-sm flex flex-col md:flex-row items-stretch">
          <div className="md:w-5/12 relative min-h-[180px] bg-mist/40">
            <img
              src="/images/dashboard-banner.jpg"
              alt="Grand celebration mandap pavilion"
              className="w-full h-full object-cover"
            />
            <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-white/90 backdrop-blur-sm text-xs font-bold text-teal capitalize">
              {event.type}
            </span>
          </div>

          <div className="p-6 md:w-7/12 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center gap-2 text-xs text-ink/70 font-medium">
                <span>📅 {formatDateReadable(event.date)}</span>
                <span>•</span>
                <span>📍 {event.city || 'Ahmedabad'}</span>
              </div>
              <h2 className="font-serif text-2xl font-bold text-ink mt-1">
                {event.title}
              </h2>
              <div className="inline-flex items-center gap-1.5 mt-2 px-3 py-1 rounded-full bg-teal/10 text-teal text-xs font-semibold">
                <span>⏳</span>
                <span>{timeline.daysUntilEvent} days remaining</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-mist/60">
              <Link
                to="/deck"
                className="px-4 py-2 rounded-xl bg-teal text-white text-xs font-semibold hover:bg-teal/90 transition-colors shadow-sm"
              >
                View Moments Deck →
              </Link>
              <Link
                to="/energy"
                className="px-4 py-2 rounded-xl bg-mist/60 text-ink text-xs font-semibold hover:bg-mist transition-colors"
              >
                Energy Curve
              </Link>
              <Link
                to="/book"
                className="px-4 py-2 rounded-xl bg-paper border border-mist text-ink text-xs font-semibold hover:bg-mist/40 transition-colors"
              >
                Print Book
              </Link>
            </div>
          </div>
        </div>

        {/* 4 Quick Stat Tiles (Reference 02) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Budget */}
          <div className="bg-white p-5 rounded-2xl border border-mist shadow-sm space-y-1">
            <div className="flex items-center justify-between text-xs text-ink/70">
              <span className="font-medium">Total Budget</span>
              <span className="p-1 rounded-lg bg-teal/10 text-teal">💰</span>
            </div>
            <div className="font-serif text-xl sm:text-2xl font-bold text-ink tabular-nums">
              {formatINR(event.budgetMinor)}
            </div>
            <div className="text-[11px] text-ink/70">Allocated to {moments.length} moments</div>
          </div>

          {/* Spent So Far */}
          <div className="bg-white p-5 rounded-2xl border border-mist shadow-sm space-y-1">
            <div className="flex items-center justify-between text-xs text-ink/70">
              <span className="font-medium">Spent / Committed</span>
              <span className="p-1 rounded-lg bg-saffron/20 text-ink">📊</span>
            </div>
            <div className="font-serif text-xl sm:text-2xl font-bold text-ink tabular-nums">
              {formatINR(totalSpentMinor)}
            </div>
            <div className="text-[11px] text-teal font-medium">
              {formatINR(remainingBudgetMinor)} remaining
            </div>
          </div>

          {/* Guest Count */}
          <div className="bg-white p-5 rounded-2xl border border-mist shadow-sm space-y-1">
            <div className="flex items-center justify-between text-xs text-ink/70">
              <span className="font-medium">Guest Count</span>
              <span className="p-1 rounded-lg bg-rose/10 text-rose">👥</span>
            </div>
            <div className="font-serif text-xl sm:text-2xl font-bold text-ink tabular-nums">
              {event.guests}
            </div>
            <button
              type="button"
              onClick={() => {
                setShowAddGuestModal(true);
              }}
              className="text-[11px] text-teal hover:underline font-medium block"
            >
              Update guest estimate ✎
            </button>
          </div>

          {/* Tasks Complete with Radial Ring */}
          <div className="bg-white p-5 rounded-2xl border border-mist shadow-sm flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs text-ink/70 font-medium block">Tasks Complete</span>
              <div className="font-serif text-2xl font-bold text-ink tabular-nums">
                {taskCompletionPct}%
              </div>
              <div className="text-[11px] text-ink/70">
                {completedTasksCount} of {tasks.length} done
              </div>
            </div>
            {/* SVG Progress Ring */}
            <div className="relative w-12 h-12 flex items-center justify-center">
              <svg className="w-12 h-12 transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-mist"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-teal"
                  strokeDasharray={`${String(taskCompletionPct)}, 100`}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Quick Actions & Tasks Bar (Reference 02) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Upcoming Tasks Checklist */}
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-mist shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-serif text-lg font-bold text-ink">Your Upcoming Tasks</h3>
                <p className="text-xs text-ink/70">Click checkboxes to mark progress</p>
              </div>
              <a href="#timeline" className="text-xs font-semibold text-teal hover:underline">
                View Full Timeline ({tasks.length}) →
              </a>
            </div>

            <div className="space-y-2.5 divide-y divide-mist/40">
              {tasks.slice(0, 4).map((task) => {
                const isCompleted = task.status === 'complete';
                return (
                  <div key={task.id} className="pt-2.5 first:pt-0 flex items-center justify-between gap-3">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isCompleted}
                        onChange={() => {
                          dispatch({
                            type: 'UPDATE_TASK',
                            task: { ...task, status: isCompleted ? 'pending' : 'complete' },
                          });
                        }}
                        className="h-4 w-4 rounded border-mist text-teal focus:ring-saffron"
                      />
                      <span className={`text-xs font-semibold text-ink ${isCompleted ? 'line-through text-ink/50' : ''}`}>
                        {task.title}
                      </span>
                    </label>

                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        isCompleted
                          ? 'bg-[#114B47] text-white'
                          : task.critical
                            ? 'bg-rose text-white'
                            : 'bg-saffron/30 text-ink'
                      }`}
                    >
                      {isCompleted ? 'Completed' : task.critical ? 'Critical' : `${String(task.leadDays)}d lead`}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Actions Grid */}
          <div className="bg-white p-6 rounded-2xl border border-mist shadow-sm space-y-3">
            <h3 className="font-serif text-lg font-bold text-ink">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setShowAddGuestModal(true);
                }}
                className="p-3 rounded-xl bg-paper hover:bg-mist/50 border border-mist text-left space-y-1 transition-colors"
              >
                <span className="text-lg block">👥</span>
                <span className="text-xs font-semibold text-ink block">Add Guests</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowAddExpenseModal(true);
                }}
                className="p-3 rounded-xl bg-paper hover:bg-mist/50 border border-mist text-left space-y-1 transition-colors"
              >
                <span className="text-lg block">💵</span>
                <span className="text-xs font-semibold text-ink block">Add Expense</span>
              </button>

              <Link
                to="/vendors"
                className="p-3 rounded-xl bg-paper hover:bg-mist/50 border border-mist text-left space-y-1 transition-colors"
              >
                <span className="text-lg block">🏪</span>
                <span className="text-xs font-semibold text-ink block">Vendors</span>
              </Link>

              <button
                type="button"
                onClick={() => {
                  setShowAIModal(true);
                }}
                className="p-3 rounded-xl bg-paper hover:bg-mist/50 border border-mist text-left space-y-1 transition-colors"
              >
                <span className="text-lg block">💡</span>
                <span className="text-xs font-semibold text-ink block">Get AI Ideas</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION: BUDGET ANALYTICS & BREAKDOWN (Reference 04) */}
      <section className="bg-white rounded-3xl border border-mist p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-mist/80 pb-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-teal">
              Financial Intelligence
            </span>
            <h2 className="font-serif text-2xl font-bold text-ink">Budget Overview & Analytics</h2>
            <p className="text-xs text-ink/70">
              Track planned moments vs actual committed spend in real-time.
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-teal" />
              <span>Spent ({budgetSpentPct}%)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-saffron" />
              <span>Remaining ({100 - budgetSpentPct}%)</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          {/* Donut Chart & Percentages */}
          <div className="flex flex-col items-center justify-center p-4 bg-paper rounded-2xl border border-mist/60 text-center space-y-2">
            <div className="relative w-36 h-36 flex items-center justify-center">
              <svg className="w-36 h-36 transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-saffron/30"
                  strokeWidth="4"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-teal"
                  strokeDasharray={`${String(budgetSpentPct)}, 100`}
                  strokeWidth="4"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="font-serif text-2xl font-bold text-ink">{budgetSpentPct}%</span>
                <span className="text-[10px] text-ink/70 uppercase">Committed</span>
              </div>
            </div>
            <div className="text-xs space-y-0.5 pt-1">
              <div className="font-bold text-ink">{formatINR(event.budgetMinor)}</div>
              <div className="text-ink/70">Remaining: {formatINR(remainingBudgetMinor)}</div>
            </div>
          </div>

          {/* Category Breakdown */}
          <div className="md:col-span-2 space-y-3">
            <h3 className="font-serif text-base font-bold text-ink">Estimated Category Breakdown</h3>
            <div className="space-y-2 text-xs">
              <div className="space-y-1">
                <div className="flex justify-between font-medium">
                  <span>Venue & Catering</span>
                  <span>40% ({formatINR(Math.round(event.budgetMinor * 0.4))})</span>
                </div>
                <div className="w-full h-2 rounded-full bg-mist overflow-hidden">
                  <div className="h-full bg-teal" style={{ width: '40%' }} />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between font-medium">
                  <span>Decoration & Mandap</span>
                  <span>25% ({formatINR(Math.round(event.budgetMinor * 0.25))})</span>
                </div>
                <div className="w-full h-2 rounded-full bg-mist overflow-hidden">
                  <div className="h-full bg-saffron" style={{ width: '25%' }} />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between font-medium">
                  <span>Photography & Video</span>
                  <span>15% ({formatINR(Math.round(event.budgetMinor * 0.15))})</span>
                </div>
                <div className="w-full h-2 rounded-full bg-mist overflow-hidden">
                  <div className="h-full bg-rose" style={{ width: '15%' }} />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between font-medium">
                  <span>Music & Other Moments</span>
                  <span>20% ({formatINR(Math.round(event.budgetMinor * 0.2))})</span>
                </div>
                <div className="w-full h-2 rounded-full bg-mist overflow-hidden">
                  <div className="h-full bg-ink/70" style={{ width: '20%' }} />
                </div>
              </div>
            </div>

            {/* AI Suggestion Box */}
            <div className="p-3.5 rounded-xl bg-saffron/15 border border-saffron/30 text-xs text-ink flex items-center justify-between gap-3 mt-4">
              <div className="flex items-center gap-2">
                <span>💡</span>
                <span><strong>AI Suggestion:</strong> You can save ~10% on your celebration by booking local heritage venues during non-peak weekend slots.</span>
              </div>
              <Link
                to="/vendors"
                className="shrink-0 px-3 py-1.5 rounded-lg bg-white border border-saffron/40 font-semibold text-ink hover:bg-paper transition-colors"
              >
                View Options
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 1: MOMENT BUDGET & COST PER MOMENT */}
      <section id="moment-budget" className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="font-serif text-2xl font-bold text-ink">Moment Budget</h2>
            <p className="text-xs text-ink/70">
              Money is allocated strictly by moment importance and attributed shared venue/caterer usage.
            </p>
          </div>
          <span className="text-xs font-bold px-3 py-1 bg-[#114B47] text-white rounded-full">
            Total Usable: {formatINR(allocation.usableMinor)}
          </span>
        </div>

        {allocation.feasibilityGap && (
          <div className="p-4 bg-rose/10 border border-rose/30 rounded-xl text-xs text-rose flex items-start gap-2.5">
            <span className="text-base" aria-hidden="true">⚠️</span>
            <div>
              <strong>Feasibility Gap Detected:</strong> {allocation.feasibilityGap.explanation}
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl border border-mist shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-mist bg-mist/30 text-ink/80">
                  <th scope="col" className="py-3 px-4 font-semibold">Moment</th>
                  <th scope="col" className="py-3 px-4 font-semibold text-center">Importance</th>
                  <th scope="col" className="py-3 px-4 font-semibold text-right">Allocated Budget</th>
                  <th scope="col" className="py-3 px-4 font-semibold text-right">Attributed Total</th>
                  <th scope="col" className="py-3 px-4 font-semibold text-right">Cost / Guest</th>
                  <th scope="col" className="py-3 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {allocation.allocations.map((alloc) => {
                  const moment = moments.find((m) => m.id === alloc.momentId);
                  const attr = attribution.perMoment.find((a) => a.momentId === alloc.momentId);

                  return (
                    <tr
                      key={alloc.momentId}
                      className="border-b border-mist/40 hover:bg-mist/10 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <div className="font-semibold text-ink text-sm">
                          {alloc.momentName}
                          {moment?.locked && (
                            <span className="ml-2 text-[10px] px-1.5 py-0.5 bg-ink text-paper rounded font-sans">
                              LOCKED
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-ink/80 font-medium">
                          Weight share: {(alloc.weightShare * 100).toFixed(1)}%
                        </div>
                      </td>

                      <td className="py-3 px-4 text-center">
                        <span className="inline-block px-2 py-0.5 bg-mist text-ink font-bold rounded">
                          {alloc.weight > 0 ? (alloc.weight / 1.25).toFixed(1) : '—'} / 5
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right tabular-nums font-bold text-teal text-sm">
                        {formatINR(alloc.allocatedMinor)}
                      </td>

                      <td className="py-3 px-4 text-right tabular-nums text-ink font-semibold">
                        {formatINR(attr?.totalCostMinor ?? 0)}
                      </td>

                      <td className="py-3 px-4 text-right tabular-nums text-ink/80 font-medium">
                        {formatINR(attr?.costPerGuestMinor ?? 0)}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => {
                            setTradeoffMomentId(alloc.momentId);
                          }}
                          className="px-3 py-1.5 rounded bg-mist/60 hover:bg-saffron text-ink font-semibold transition-colors text-xs"
                        >
                          Simulate Trade-Off
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* SECTION 2: BACKWARDS TIMELINE */}
      <section id="timeline" className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-serif text-2xl font-bold text-ink">Backwards Timeline</h2>
            <p className="text-xs text-ink/70">
              Tasks counted backward from celebration date ({formatDateReadable(event.date)}).
            </p>
          </div>
          <span className="text-xs font-semibold px-3 py-1 bg-mist/80 text-ink rounded-full">
            {timeline.daysUntilEvent} days until event
          </span>
        </div>

        {timeline.anyCompressed && (
          <div className="p-4 bg-saffron/15 border border-saffron/40 rounded-xl text-xs text-ink flex items-start gap-2.5">
            <span className="text-base" aria-hidden="true">⏱️</span>
            <div>
              <strong>Timeline Compressed:</strong> {timeline.compressionSummary}
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl border border-mist shadow-sm divide-y divide-mist/40">
          {timeline.tasks.map((task) => {
            const isCompleted = task.status === 'complete';

            return (
              <div
                key={task.id}
                className={`p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  isCompleted ? 'bg-mist/10' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={isCompleted}
                    onChange={() => {
                      dispatch({
                        type: 'UPDATE_TASK',
                        task: {
                          ...task,
                          status: isCompleted ? 'pending' : 'complete',
                        },
                      });
                    }}
                    className="mt-1 h-4 w-4 rounded border-mist text-teal focus:ring-saffron"
                    aria-label={`Mark "${task.title}" complete`}
                  />

                  <div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-sm font-semibold text-ink ${
                          isCompleted ? 'line-through text-ink/70' : ''
                        }`}
                      >
                        {task.title}
                      </span>
                      {task.critical && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 bg-rose text-white rounded">
                          CRITICAL
                        </span>
                      )}
                      {task.compressed && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 bg-saffron text-ink rounded">
                          COMPRESSED
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-ink/80 mt-0.5 flex items-center gap-2">
                      <span>Due: <strong>{formatDateReadable(task.dueDate)}</strong></span>
                      <span>({task.leadDays} days lead time)</span>
                      {task.statusReason && <span>• {task.statusReason}</span>}
                    </div>
                  </div>
                </div>

                <div className="self-end sm:self-center">
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                      task.status === 'complete'
                        ? 'bg-[#114B47] text-white'
                        : task.status === 'overdue' || task.status === 'impossible'
                          ? 'bg-rose text-white'
                          : task.status === 'due-soon' || task.status === 'at-risk'
                            ? 'bg-saffron text-ink'
                            : 'bg-mist text-ink font-medium'
                    }`}
                  >
                    {task.status}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* SECTION 3: VENDOR CUE SHEETS */}
      <section id="cuesheets" className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-serif text-2xl font-bold text-ink">Vendor Cue Sheets</h2>
            <p className="text-xs text-ink/80">
              One-page printable briefs showing only the moments each vendor serves, plus interview questions.
            </p>
          </div>
          <span className="text-xs text-ink/80 font-semibold">{cueSheets.length} Vendors Registered</span>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {cueSheets.map((sheet) => (
            <div
              key={sheet.vendorId}
              className="bg-white p-5 rounded-xl border border-mist shadow-sm flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-teal">
                    {sheet.vendorCategory}
                  </span>
                  <span className="text-xs text-ink/80 font-semibold">
                    {sheet.moments.length} moment{sheet.moments.length !== 1 ? 's' : ''}
                  </span>
                </div>

                <h3 className="font-serif text-lg font-bold text-ink">
                  {sheet.vendorName || `${sheet.vendorCategory} Brief`}
                </h3>

                {/* Moments handled */}
                <div className="text-xs text-ink/80 space-y-1 border-t border-mist/40 pt-2">
                  <span className="font-semibold text-ink block">Serves Moments:</span>
                  {sheet.moments.length > 0 ? (
                    <ul className="space-y-1">
                      {sheet.moments.map((m) => (
                        <li key={m.momentId} className="flex justify-between">
                          <span>• {m.momentName}</span>
                          <span className="tabular-nums font-semibold text-ink/80">
                            {m.startTime} – {m.endTime}
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <span className="italic text-ink/80">Serves entire event background</span>
                  )}
                </div>

                {/* Questions */}
                {sheet.questions.length > 0 && (
                  <div className="text-xs text-ink/80 space-y-1 border-t border-mist/40 pt-2">
                    <span className="font-semibold text-ink block">Questions to Ask:</span>
                    <ul className="space-y-1 text-ink/80 italic">
                      {sheet.questions.map((q, i) => (
                        <li key={i}>&ldquo;{q}&rdquo;</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="border-t border-mist/40 pt-3 flex justify-end">
                <Link
                  to="/book"
                  className="text-xs font-semibold text-teal hover:underline"
                >
                  View Print Brief →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 4: MOMENT IDEAS */}
      <section id="ideas" className="space-y-4">
        <div>
          <h2 className="font-serif text-2xl font-bold text-ink">Signature Moment Ideas</h2>
          <p className="text-xs text-ink/80">
            Personalised ideas tailored to each moment across simple, standard, and special tiers.
          </p>
        </div>

        {ideas.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-xl border border-mist space-y-3">
            <p className="text-sm text-ink/80 font-medium">
              No ideas generated yet. In Milestone 4, the GenAI layer will suggest 3 tier-ranked ideas per moment.
            </p>
            <p className="text-xs text-ink/80 italic">
              All ideas include honest estimate bands and require your explicit review before applying.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-3">
            {ideas.map((idea) => (
              <div key={idea.id} className="bg-white p-4 rounded-xl border border-mist space-y-2">
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-saffron text-ink">
                  {idea.tier}
                </span>
                <p className="text-xs text-ink/90">{idea.text}</p>
                {idea.estimateMinor !== undefined && (
                  <div className="text-xs font-semibold text-teal tabular-nums">
                    Est. {formatINR(idea.estimateMinor)}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Modals */}
      <TradeoffDrawer
        momentId={tradeoffMomentId}
        onClose={() => {
          setTradeoffMomentId(null);
        }}
      />

      <AIPlannerModal
        isOpen={showAIModal}
        onClose={() => {
          setShowAIModal(false);
        }}
      />

      {/* Add Guest Modal */}
      {showAddGuestModal && (
        <div role="dialog" aria-modal="true" aria-labelledby="modal-update-guests" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full border border-mist shadow-xl space-y-4">
            <h3 id="modal-update-guests" className="font-serif text-lg font-bold text-ink">Update Guest Count</h3>
            <form onSubmit={handleUpdateGuests} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-ink block mb-1">Estimated Guests</label>
                <input
                  type="number"
                  value={newGuestCount}
                  onChange={(e) => { setNewGuestCount(e.target.value); }}
                  min="1"
                  className="w-full px-3 py-2 border border-mist rounded-lg text-sm text-ink focus:ring-2 focus:ring-saffron focus:outline-none"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => { setShowAddGuestModal(false); }}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-ink bg-mist/60 hover:bg-mist"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg text-xs font-semibold text-white bg-teal hover:bg-teal/90"
                >
                  Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Expense Modal */}
      {showAddExpenseModal && (
        <div role="dialog" aria-modal="true" aria-labelledby="modal-add-expense" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full border border-mist shadow-xl space-y-4">
            <h3 id="modal-add-expense" className="font-serif text-lg font-bold text-ink">Add Celebration Expense</h3>
            <form onSubmit={handleAddExpense} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-ink block mb-1">Description</label>
                <input
                  type="text"
                  placeholder="e.g. Additional floral welcome gate"
                  value={newExpenseLabel}
                  onChange={(e) => { setNewExpenseLabel(e.target.value); }}
                  className="w-full px-3 py-2 border border-mist rounded-lg text-sm text-ink focus:ring-2 focus:ring-saffron focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-ink block mb-1">Amount (₹)</label>
                <input
                  type="number"
                  placeholder="25000"
                  value={newExpenseAmount}
                  onChange={(e) => { setNewExpenseAmount(e.target.value); }}
                  min="1"
                  className="w-full px-3 py-2 border border-mist rounded-lg text-sm text-ink focus:ring-2 focus:ring-saffron focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-ink block mb-1">Assign to Moment <span className="text-ink/50 font-normal">(optional)</span></label>
                <select
                  value={newExpenseMomentId}
                  onChange={(e) => { setNewExpenseMomentId(e.target.value); }}
                  className="w-full px-3 py-2 border border-mist rounded-lg text-sm text-ink focus:ring-2 focus:ring-saffron focus:outline-none"
                >
                  <option value="">General (shared across all moments)</option>
                  {moments.map((m) => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => { setShowAddExpenseModal(false); }}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-ink bg-mist/60 hover:bg-mist"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg text-xs font-semibold text-white bg-teal hover:bg-teal/90"
                >
                  Add Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
