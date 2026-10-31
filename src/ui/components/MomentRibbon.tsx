/**
 * MomentRibbon.tsx — Signature custom SVG horizontal timeline motif.
 *
 * SPEC REQUIREMENT (§8):
 * Custom SVG "moment ribbon" (a horizontal timeline of beads, one per moment) as the
 * brand motif. No stock wedding photos. Original logo mark and wordmark.
 */

import type { Moment } from '../../schemas/moment';
import { minuteTo12HourString } from '../../lib/format';

interface MomentRibbonProps {
  moments: readonly Moment[];
  activeMomentId?: string | null;
  onSelectMoment?: (momentId: string) => void;
}

export function MomentRibbon({
  moments,
  activeMomentId,
  onSelectMoment,
}: MomentRibbonProps) {
  if (moments.length === 0) {
    return (
      <div className="py-6 text-center text-sm text-ink/60 italic">
        No moments in the ribbon yet. Pick a template or add a moment.
      </div>
    );
  }

  const sorted = [...moments].sort((a, b) => a.startMinute - b.startMinute);

  const width = Math.max(700, sorted.length * 120);
  const height = 140;
  const paddingX = 60;
  const centerY = 60;

  // Compute bead coordinates
  const step = (width - 2 * paddingX) / Math.max(1, sorted.length - 1);
  const points = sorted.map((m, idx) => ({
    moment: m,
    x: paddingX + idx * step,
    // Subtle sine wave displacement for an editorial, organic ribbon feel
    y: centerY + (idx % 2 === 0 ? -10 : 10),
    radius: 12 + (m.importance - 1) * 3, // radius 12px (importance 1) to 24px (importance 5)
  }));

  // Build SVG path connecting the beads
  let ribbonPath = '';
  if (points.length > 0) {
    ribbonPath = `M ${String(points[0]?.x ?? 0)} ${String(points[0]?.y ?? 0)}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p1 = points[i];
      const p2 = points[i + 1];
      const midX = (p1.x + p2.x) / 2;
      ribbonPath += ` Q ${String(midX)} ${String(p1.y)}, ${String(p2.x)} ${String(p2.y)}`;
    }
  }

  // Energy color map
  const getBeadColor = (energy: number) => {
    switch (energy) {
      case 5:
        return '#C4476A'; // Rose (peak)
      case 4:
        return '#E8A33D'; // Saffron (vibrant)
      case 3:
        return '#1F7A74'; // Teal (steady)
      case 2:
        return '#8A99A8'; // Muted slate (gentle)
      default:
        return '#D4CEBF'; // Mist/calm
    }
  };

  return (
    <div
      className="w-full overflow-x-auto pb-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-saffron rounded-lg"
      tabIndex={0}
      role="region"
      aria-label="Moment Ribbon Timeline"
    >
      <div style={{ minWidth: `${String(width)}px` }} className="relative px-2">
        <svg
          viewBox={`0 0 ${String(width)} ${String(height)}`}
          width={width}
          height={height}
          className="overflow-visible"
        >
          <desc>
            {sorted.map((m) => `${m.name} at ${minuteTo12HourString(m.startMinute)}`).join(', ')}
          </desc>

          {/* Background decorative glow path */}
          <path
            d={ribbonPath}
            fill="none"
            stroke="#ECE7DD"
            strokeWidth="10"
            strokeLinecap="round"
          />

          {/* Foreground ribbon path */}
          <path
            d={ribbonPath}
            fill="none"
            stroke="#1F7A74"
            strokeWidth="3.5"
            strokeDasharray="6 4"
            strokeLinecap="round"
            opacity="0.85"
          />

          {/* Beads */}
          {points.map((pt) => {
            const isSelected = activeMomentId === pt.moment.id;
            const beadFill = getBeadColor(pt.moment.energyTarget);

            return (
              <g key={pt.moment.id}>
                {/* Active selection ring */}
                {isSelected && (
                  <circle
                    aria-hidden="true"
                    cx={pt.x}
                    cy={pt.y}
                    r={pt.radius + 7}
                    fill="none"
                    stroke="#E8A33D"
                    strokeWidth="3.5"
                    className="pointer-events-none animate-pulse"
                  />
                )}

                {/* Outer bead circle (Interactive button) */}
                <circle
                  tabIndex={0}
                  role="button"
                  aria-pressed={isSelected}
                  aria-label={`${pt.moment.name}, importance ${String(pt.moment.importance)} of 5, starts ${minuteTo12HourString(pt.moment.startMinute)}`}
                  onClick={() => {
                    if (onSelectMoment) onSelectMoment(pt.moment.id);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      if (onSelectMoment) onSelectMoment(pt.moment.id);
                    }
                  }}
                  cx={pt.x}
                  cy={pt.y}
                  r={pt.radius}
                  fill={beadFill}
                  stroke="#1F2A37"
                  strokeWidth="2"
                  className="cursor-pointer hover:scale-110 focus:scale-110 transition-transform origin-center shadow-md focus-visible:outline-none"
                />

                {/* Inner importance numeral */}
                <text
                  aria-hidden="true"
                  x={pt.x}
                  y={pt.y + 4}
                  textAnchor="middle"
                  fill="#FBF7F0"
                  fontSize="12"
                  fontWeight="bold"
                  className="select-none pointer-events-none"
                >
                  {pt.moment.importance}
                </text>

                {/* Time badge */}
                <text
                  aria-hidden="true"
                  x={pt.x}
                  y={pt.y - pt.radius - 8}
                  textAnchor="middle"
                  fill="#1F2A37"
                  fontSize="11"
                  fontWeight="600"
                  className="select-none pointer-events-none font-sans"
                >
                  {minuteTo12HourString(pt.moment.startMinute)}
                </text>

                {/* Moment name */}
                <text
                  aria-hidden="true"
                  x={pt.x}
                  y={pt.y + pt.radius + 16}
                  textAnchor="middle"
                  fill="#1F2A37"
                  fontSize="12"
                  fontWeight="600"
                  className="select-none pointer-events-none font-serif max-w-[100px]"
                >
                  {pt.moment.name.length > 16
                    ? `${pt.moment.name.slice(0, 14)}…`
                    : pt.moment.name}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
