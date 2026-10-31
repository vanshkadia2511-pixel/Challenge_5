/**
 * EnergyCurvePage.tsx — Dedicated Energy Curve diagnostics page.
 *
 * SPEC REQUIREMENT (§4.6, §8):
 * Energy Curve: SVG chart + table equivalent + flag list.
 */

import { Link } from 'react-router-dom';
import { useAppContext } from '../../state/context';
import { EnergyCurveChart } from '../charts/EnergyCurveChart';

export function EnergyCurvePage() {
  const { state } = useAppContext();
  const { moments } = state.plan;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-mist pb-6">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-teal">
            Pacing & Rhythm Diagnostics
          </span>
          <h1 className="font-serif text-3xl font-bold text-ink">The Energy Curve</h1>
          <p className="text-sm text-ink/80 mt-1">
            Ensure your celebration flows naturally. We flag awkward lulls, rushed peaks, and exhausting blocks.
          </p>
        </div>

        <Link
          to="/deck"
          className="px-4 py-2 bg-mist/60 hover:bg-mist text-ink text-xs font-semibold rounded-lg transition-colors self-start sm:self-auto"
        >
          ← Adjust Moment Timings in Deck
        </Link>
      </div>

      {/* Flag code guide */}
      <div className="grid gap-3 sm:grid-cols-4 text-xs">
        <div className="p-3 bg-white border border-mist rounded-lg">
          <span className="font-bold text-[#b45309] block mb-1">LULL</span>
          <p className="text-ink/80">≥ 90 min with no moment and energy &lt; 3. Guests may get restless.</p>
        </div>
        <div className="p-3 bg-white border border-mist rounded-lg">
          <span className="font-bold text-rose block mb-1">RUSHED</span>
          <p className="text-ink/80">&lt; 10 min transition between high-energy moments (energy ≥ 4).</p>
        </div>
        <div className="p-3 bg-white border border-mist rounded-lg">
          <span className="font-bold text-teal block mb-1">UNSUPPORTED PEAK</span>
          <p className="text-ink/80">Energy 5 target gap with no moment behind it to support the peak.</p>
        </div>
        <div className="p-3 bg-white border border-mist rounded-lg">
          <span className="font-bold text-ink block mb-1">OVERLONG</span>
          <p className="text-ink/80">Any single block &gt; 3 hours (180 min). May lead to fatigue.</p>
        </div>
      </div>

      {/* Energy Curve SVG Chart + Table + Diagnostics */}
      <EnergyCurveChart moments={moments} />
    </div>
  );
}
