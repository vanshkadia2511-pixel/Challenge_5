/**
 * Navbar.tsx — Accessible top navigation header with KSHAN branding.
 */

import { NavLink, Link } from 'react-router-dom';
import { useAppContext } from '../../state/context';

export function Navbar() {
  const { state } = useAppContext();
  const eventTitle = state.plan.event.title;
  const eventType = state.plan.event.type;

  const navItems = [
    { to: '/deck', shortLabel: 'Deck', label: 'Moment Deck' },
    { to: '/plan', shortLabel: 'Plan', label: 'Plan Workspace' },
    { to: '/vendors', shortLabel: 'Vendors', label: 'Vendors' },
    { to: '/energy', shortLabel: 'Energy', label: 'Energy Curve' },
    { to: '/book', shortLabel: 'Book', label: 'Moment Book' },
    { to: '/after', shortLabel: 'After', label: 'After-Event' },
  ];

  return (
    <header className="bg-paper border-b border-mist shadow-sm sticky top-0 z-30 overflow-x-hidden">
      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-2">
          {/* Brand logo & tagline */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <Link
              to="/"
              className="flex items-center gap-2 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-saffron rounded-md p-1"
            >
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-saffron flex items-center justify-center text-ink font-serif font-bold text-lg sm:text-xl shadow-inner group-hover:scale-105 transition-transform">
                K
              </div>
              <div className="flex flex-col">
                <span className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-ink">
                  KSHAN
                </span>
                <span className="hidden md:inline text-xs text-ink/70 font-sans tracking-wide">
                  Budget the moments, not the vendors.
                </span>
              </div>
            </Link>

            {/* Event pill tag */}
            <span className="hidden lg:inline-flex items-center gap-1.5 ml-2 px-2.5 py-1 rounded-full text-xs font-medium bg-mist text-ink border border-mist/80">
              <span className="w-1.5 h-1.5 rounded-full bg-teal" aria-hidden="true" />
              <span className="capitalize">{eventType}</span>: {eventTitle}
            </span>
          </div>

          {/* Nav links */}
          <nav className="flex items-center gap-1 overflow-x-auto py-1" aria-label="Main Navigation">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `px-2 sm:px-3 py-1.5 sm:py-2 rounded-md text-xs sm:text-sm font-semibold whitespace-nowrap ${
                    isActive
                      ? 'bg-[#114B47] text-white shadow-sm'
                      : 'text-ink hover:text-ink hover:bg-mist/80'
                  }`
                }
              >
                <span className="sm:hidden">{item.shortLabel}</span>
                <span className="hidden sm:inline">{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}
