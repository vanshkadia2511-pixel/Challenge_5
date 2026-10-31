/**
 * EnergyCurveChart.tsx — SVG Energy Curve chart with accessible table equivalent and flag cards.
 *
 * SPEC REQUIREMENT (§4.6, §8):
 * Energy Curve: SVG chart + table equivalent + flag list.
 * Always output a text/table equivalent of the chart.
 */

import { useMemo } from 'react';
import type { Moment } from '../../schemas/moment';
import { computeEnergyCurve } from '../../engine/energy';
import { minuteTo12HourString } from '../../lib/format';

interface EnergyCurveChartProps {
  moments: readonly Moment[];
}

export function EnergyCurveChart({ moments }: EnergyCurveChartProps) {
  const result = useMemo(() => {
    return computeEnergyCurve(moments);
  }, [moments]);

  const { segments, flags, textEquivalent } = result;

  if (segments.length === 0) {
    return (
      <div className="p-8 text-center bg-white rounded-lg border border-mist text-ink/80 font-medium">
        No moments scheduled yet. Add moments to visualize the energy curve.
      </div>
    );
  }

  // Chart coordinate math
  const chartWidth = 800;
  const chartHeight = 260;
  const paddingLeft = 50;
  const paddingRight = 40;
  const paddingTop = 30;
  const paddingBottom = 40;

  const minMin = segments[0]?.startMinute ?? 540;
  const maxMin = segments[segments.length - 1]?.endMinute ?? 1100;
  const totalDuration = Math.max(1, maxMin - minMin);

  const getX = (minute: number) => {
    const ratio = (minute - minMin) / totalDuration;
    return paddingLeft + ratio * (chartWidth - paddingLeft - paddingRight);
  };

  const getY = (energy: number) => {
    // energy 1 to 5
    const ratio = (energy - 1) / 4;
    return chartHeight - paddingBottom - ratio * (chartHeight - paddingTop - paddingBottom);
  };

  // Build SVG path
  let pathD = '';
  let areaD = '';
  const first = segments[0];
  const last = segments[segments.length - 1];

  const startX = getX(first.startMinute);
  const startY = getY(first.energyLevel);
  pathD = `M ${String(startX)} ${String(startY)}`;
  areaD = `M ${String(startX)} ${String(chartHeight - paddingBottom)} L ${String(startX)} ${String(startY)}`;

  for (const seg of segments) {
    const segStartX = getX(seg.startMinute);
    const segEndX = getX(seg.endMinute);
    const segY = getY(seg.energyLevel);

    pathD += ` L ${String(segStartX)} ${String(segY)} L ${String(segEndX)} ${String(segY)}`;
    areaD += ` L ${String(segStartX)} ${String(segY)} L ${String(segEndX)} ${String(segY)}`;
  }

  const lastX = getX(last.endMinute);
  areaD += ` L ${String(lastX)} ${String(chartHeight - paddingBottom)} Z`;

  return (
    <div className="space-y-6">
      {/* Visual Chart Card */}
      <div className="bg-white p-6 rounded-xl border border-mist shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-serif text-lg font-bold text-ink">Planned Energy Arc</h3>
            <p className="text-xs text-ink/80 font-medium">
              Energy level from 1 (Reflective & Calm) to 5 (Signature Peak) across the celebration.
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 bg-mist/60 text-ink rounded-full">
            {minuteTo12HourString(minMin)} – {minuteTo12HourString(maxMin)}
          </span>
        </div>

        {/* SVG Container */}
        <div className="w-full overflow-x-auto">
          <svg
            viewBox={`0 0 ${String(chartWidth)} ${String(chartHeight)}`}
            className="w-full h-auto min-w-[650px] overflow-visible"
            role="img"
            aria-label="Energy level line chart across the celebration day"
          >
            <defs>
              <linearGradient id="energyGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#C4476A" stopOpacity="0.45" />
                <stop offset="50%" stopColor="#E8A33D" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#1F7A74" stopOpacity="0.05" />
              </linearGradient>
            </defs>

            {/* Horizontal Grid lines (Energy 1 to 5) */}
            {[1, 2, 3, 4, 5].map((lvl) => {
              const y = getY(lvl);
              return (
                <g key={lvl}>
                  <line
                    x1={paddingLeft}
                    y1={y}
                    x2={chartWidth - paddingRight}
                    y2={y}
                    stroke="#ECE7DD"
                    strokeDasharray="4 4"
                    strokeWidth="1"
                  />
                  <text
                    x={paddingLeft - 10}
                    y={y + 4}
                    textAnchor="end"
                    fill="#1F2A37"
                    fontSize="11"
                    fontWeight="500"
                    className="font-sans tabular-nums"
                  >
                    {lvl}
                  </text>
                </g>
              );
            })}

            {/* Shaded Area */}
            <path d={areaD} fill="url(#energyGradient)" />

            {/* Line Arc */}
            <path
              d={pathD}
              fill="none"
              stroke="#C4476A"
              strokeWidth="3.5"
              strokeLinejoin="round"
              strokeLinecap="round"
            />

            {/* Segment Points & Labels */}
            {segments.map((seg, idx) => {
              const cx = (getX(seg.startMinute) + getX(seg.endMinute)) / 2;
              const cy = getY(seg.energyLevel);

              return (
                <g key={idx} className="group">
                  <circle
                    cx={cx}
                    cy={cy}
                    r={seg.kind === 'moment' ? 5 : 3}
                    fill={seg.kind === 'moment' ? '#1F7A74' : '#8A99A8'}
                    stroke="#FBF7F0"
                    strokeWidth="2"
                  />
                  {seg.kind === 'moment' && (
                    <text
                      x={cx}
                      y={cy - 10}
                      textAnchor="middle"
                      fill="#1F2A37"
                      fontSize="10"
                      fontWeight="600"
                      className="font-serif select-none"
                    >
                      {seg.label.length > 14 ? `${seg.label.slice(0, 12)}…` : seg.label}
                    </text>
                  )}
                </g>
              );
            })}

            {/* X-axis base line */}
            <line
              x1={paddingLeft}
              y1={chartHeight - paddingBottom}
              x2={chartWidth - paddingRight}
              y2={chartHeight - paddingBottom}
              stroke="#1F2A37"
              strokeWidth="1.5"
            />

            {/* X-axis time marks */}
            {segments.map((seg, idx) => {
              const x = getX(seg.startMinute);
              return (
                <g key={`time-${String(idx)}`}>
                  <line
                    x1={x}
                    y1={chartHeight - paddingBottom}
                    x2={x}
                    y2={chartHeight - paddingBottom + 5}
                    stroke="#1F2A37"
                    strokeWidth="1"
                  />
                  <text
                    x={x}
                    y={chartHeight - paddingBottom + 18}
                    textAnchor="middle"
                    fill="#1F2A37"
                    fontSize="10"
                    className="font-sans tabular-nums text-ink/70"
                  >
                    {minuteTo12HourString(seg.startMinute)}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* Energy Flags List */}
      <div className="bg-white p-6 rounded-xl border border-mist shadow-sm space-y-4">
        <h3 className="font-serif text-lg font-bold text-ink flex items-center gap-2">
          <span>Pacing & Energy Diagnostics</span>
          {flags.length > 0 ? (
            <span className="text-xs bg-saffron text-ink font-semibold px-2.5 py-0.5 rounded-full">
              {flags.length} warning{flags.length > 1 ? 's' : ''}
            </span>
          ) : (
            <span className="text-xs bg-[#114B47] text-white font-semibold px-2.5 py-0.5 rounded-full">
              Smooth rhythm
            </span>
          )}
        </h3>

        {flags.length === 0 ? (
          <p className="text-sm text-ink font-medium flex items-center gap-1.5">
            <span className="text-teal font-bold">✓</span> No pacing issues detected. Transitions are balanced and energy flows naturally.
          </p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {flags.map((flag, idx) => (
              <div
                key={idx}
                className="p-4 rounded-lg border border-saffron/40 bg-saffron/5 space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 text-xs font-bold rounded bg-saffron text-ink uppercase tracking-wider">
                    {flag.code}
                  </span>
                  <span className="text-xs text-ink/80 tabular-nums font-semibold">
                    {minuteTo12HourString(flag.startMinute)} – {minuteTo12HourString(flag.endMinute)}
                  </span>
                </div>
                <p className="text-xs text-ink/90 leading-relaxed">{flag.reason}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Accessible Table Equivalent */}
      <div className="bg-white p-6 rounded-xl border border-mist shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-serif text-base font-bold text-ink">
            Tabular Energy Equivalent (Screen-Reader Friendly)
          </h3>
          <span className="text-xs text-ink/80 font-medium">Accessible view of chart data</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-mist bg-mist/30 text-ink/80">
                <th scope="col" className="py-2 px-3 font-semibold">Time Window</th>
                <th scope="col" className="py-2 px-3 font-semibold">Segment Name</th>
                <th scope="col" className="py-2 px-3 font-semibold">Kind</th>
                <th scope="col" className="py-2 px-3 font-semibold text-center">Energy Target</th>
                <th scope="col" className="py-2 px-3 font-semibold text-right">Duration</th>
              </tr>
            </thead>
            <tbody>
              {segments.map((seg, idx) => (
                <tr
                  key={idx}
                  className="border-b border-mist/40 hover:bg-mist/10 transition-colors"
                >
                  <td className="py-2.5 px-3 tabular-nums font-medium text-ink">
                    {minuteTo12HourString(seg.startMinute)} – {minuteTo12HourString(seg.endMinute)}
                  </td>
                  <td className="py-2.5 px-3 font-semibold text-ink">
                    {seg.label}
                  </td>
                  <td className="py-2.5 px-3 capitalize text-ink/80 font-medium">
                    {seg.kind}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-xs font-bold ${
                        seg.energyLevel >= 4
                          ? 'bg-rose text-white'
                          : seg.energyLevel === 3
                            ? 'bg-[#114B47] text-white'
                            : 'bg-mist text-ink'
                      }`}
                    >
                      {seg.energyLevel} / 5
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right tabular-nums text-ink/80 font-medium">
                    {String(seg.durationMin)} min
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Hidden screen-reader preformatted block */}
        <div className="sr-only" aria-live="polite">
          <pre>{textEquivalent}</pre>
        </div>
      </div>
    </div>
  );
}
