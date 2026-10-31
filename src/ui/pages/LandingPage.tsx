/**
 * LandingPage.tsx — Home page with interactive moment ribbon demo, occasion cards, and trust notes.
 * Combines Indian celebration heritage aesthetics (flowing ribbons, warm ivory) with modern SaaS layout.
 * Matches 01_landing_page.png and 07_original_KSHAN_reference.png.
 */

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAppContext } from '../../state/context';
import { createPlanFromTemplate } from '../../state/storage';
import { MomentRibbon } from '../components/MomentRibbon';
import { AIPlannerModal } from '../components/AIPlannerModal';
import type { EventType } from '../../schemas/event';

export function LandingPage() {
  const navigate = useNavigate();
  const { state, dispatch } = useAppContext();
  const [selectedMomentId, setSelectedMomentId] = useState<string | null>(null);
  const [showAIModal, setShowAIModal] = useState(false);

  const handlePickOccasion = (type: EventType) => {
    const newPlan = createPlanFromTemplate(type);
    dispatch({ type: 'SET_PLAN', plan: newPlan });
    navigate('/deck');
  };

  const activeMoment = state.plan.moments.find((m) => m.id === selectedMomentId);

  return (
    <div className="min-h-screen bg-paper flex flex-col overflow-x-hidden">
      {/* Decorative Heritage Wave Ribbon */}
      <div className="w-full h-8 sm:h-12 overflow-hidden opacity-90 select-none pointer-events-none">
        <img
          src="/images/heritage-ribbon.svg"
          alt=""
          aria-hidden="true"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Hero Section */}
      <section className="pt-8 sm:pt-14 pb-12 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-saffron/20 border border-saffron/40 text-xs font-semibold text-ink shadow-sm">
          <span className="text-saffron">✨</span>
          <span>Every celebration deserves a perfect plan</span>
        </div>

        <div className="space-y-3">
          <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-bold text-ink tracking-tight leading-[1.1]">
            Budget the moments, <br className="hidden sm:inline" />
            <span className="text-teal italic">not the vendors.</span>
          </h1>
          <p className="font-serif text-xl sm:text-2xl text-ink/80 max-w-2xl mx-auto italic font-medium">
            Plan weddings, birthdays and community events with your personal AI planner.
          </p>
        </div>

        <p className="text-sm sm:text-base text-ink/80 max-w-2xl mx-auto font-sans leading-relaxed">
          Most planning tools split your celebration into disconnected vendor spreadsheets. KSHAN builds your whole
          budget, timeline and vendor cue sheets around the <strong>signature moments</strong> guests truly remember.
        </p>

        {/* Hero Actions */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <Link
            to="/deck"
            className="px-7 py-3.5 rounded-xl bg-teal text-white font-semibold shadow-md hover:bg-teal/90 transition-all text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-saffron inline-flex items-center gap-2"
          >
            Start Planning →
          </Link>
          <Link
            to="/plan"
            className="px-6 py-3.5 rounded-xl bg-white border border-mist text-ink font-semibold hover:bg-mist/40 transition-all text-base shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-saffron"
          >
            Explore Features
          </Link>
          <button
            type="button"
            onClick={() => {
              setShowAIModal(true);
            }}
            className="px-5 py-3.5 rounded-xl bg-saffron/20 border border-saffron/50 text-ink font-semibold hover:bg-saffron/30 transition-all text-sm inline-flex items-center gap-2"
          >
            <span className="text-base">🤖</span> Ask AI Planner
          </button>
        </div>

        {/* Hero Visual Banner with Real Celebration Photography */}
        <div className="pt-6 max-w-4xl mx-auto">
          <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white aspect-[16/9] sm:aspect-[21/9]">
            <img
              src="/images/hero-wedding-arch.jpg"
              alt="Indian celebration wedding mandap arch with fresh flowers"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-6 sm:p-8">
              <div className="text-left text-white space-y-1">
                <span className="text-xs uppercase tracking-widest font-semibold text-saffron">
                  Heritage Celebration Excellence
                </span>
                <p className="font-serif text-lg sm:text-2xl font-bold">
                  Designed for Indian weddings, milestones & cultural gatherings.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Three Occasion Cards with Real Photography */}
      <section className="py-16 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-teal">
            Curated Occasions
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-ink">Choose Your Celebration</h2>
          <p className="text-sm text-ink/70 max-w-xl mx-auto">
            Pre-loaded with verified moment sequences, largest-remainder budget allocations, and vendor cue sheets.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Wedding */}
          <div className="bg-white rounded-2xl border border-mist shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow group">
            <div>
              <div className="relative h-44 w-full overflow-hidden bg-mist/30">
                <img
                  src="/images/card-wedding.jpg"
                  alt="Wedding rings on silk"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-sm text-xs font-semibold text-rose">
                  💍 Wedding
                </span>
              </div>
              <div className="p-6 space-y-3">
                <h3 className="font-serif text-2xl font-bold text-ink">Wedding</h3>
                <p className="text-xs font-medium text-teal">Make every moment unforgettable.</p>
                <p className="text-xs text-ink/70">
                  Arrival, Blessing, Ceremony, Portraits, Toasts, Dinner, First Dance, Send-off.
                </p>
                <ul className="text-xs text-ink/80 space-y-1.5 border-t border-mist/60 pt-3">
                  <li>• 8 signature moments</li>
                  <li>• 180-day backwards timeline</li>
                  <li>• Mandap, catering & photography cue sheets</li>
                </ul>
              </div>
            </div>
            <div className="p-6 pt-0">
              <button
                type="button"
                onClick={() => {
                  handlePickOccasion('wedding');
                }}
                className="w-full py-3 px-4 rounded-xl bg-paper border border-mist text-ink font-semibold hover:bg-mist/80 transition-colors text-sm"
              >
                Start Wedding Plan →
              </button>
            </div>
          </div>

          {/* Birthday */}
          <div className="bg-white rounded-2xl border border-mist shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow group">
            <div>
              <div className="relative h-44 w-full overflow-hidden bg-mist/30">
                <img
                  src="/images/card-birthday.jpg"
                  alt="Celebration birthday cake"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-sm text-xs font-semibold text-saffron">
                  🎂 Milestone
                </span>
              </div>
              <div className="p-6 space-y-3">
                <h3 className="font-serif text-2xl font-bold text-ink">Birthday</h3>
                <p className="text-xs font-medium text-teal">Design a celebration worth remembering.</p>
                <p className="text-xs text-ink/70">
                  Surprise Reveal, Games, Cake Moment, Speeches, Dinner, Group Photo, Wind-down.
                </p>
                <ul className="text-xs text-ink/80 space-y-1.5 border-t border-mist/60 pt-3">
                  <li>• 8 high-energy moments</li>
                  <li>• 60-day milestone timeline</li>
                  <li>• Cake, entertainment & photography cue sheets</li>
                </ul>
              </div>
            </div>
            <div className="p-6 pt-0">
              <button
                type="button"
                onClick={() => {
                  handlePickOccasion('birthday');
                }}
                className="w-full py-3 px-4 rounded-xl bg-paper border border-mist text-ink font-semibold hover:bg-mist/80 transition-colors text-sm"
              >
                Start Birthday Plan →
              </button>
            </div>
          </div>

          {/* Community Event */}
          <div className="bg-white rounded-2xl border border-mist shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow group">
            <div>
              <div className="relative h-44 w-full overflow-hidden bg-mist/30">
                <img
                  src="/images/card-community.jpg"
                  alt="Outdoor community celebration"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-sm text-xs font-semibold text-teal">
                  🎪 Community
                </span>
              </div>
              <div className="p-6 space-y-3">
                <h3 className="font-serif text-2xl font-bold text-ink">Community Event</h3>
                <p className="text-xs font-medium text-teal">Bring people together.</p>
                <p className="text-xs text-ink/70">
                  Opening, Performances, Food Stalls, Volunteer Shift, Awards, Clean-up.
                </p>
                <ul className="text-xs text-ink/80 space-y-1.5 border-t border-mist/60 pt-3">
                  <li>• 7 structured moments</li>
                  <li>• Volunteer shifts & municipal permits</li>
                  <li>• Sound, stage & food stalls coordination</li>
                </ul>
              </div>
            </div>
            <div className="p-6 pt-0">
              <button
                type="button"
                onClick={() => {
                  handlePickOccasion('community');
                }}
                className="w-full py-3 px-4 rounded-xl bg-paper border border-mist text-ink font-semibold hover:bg-mist/80 transition-colors text-sm"
              >
                Start Community Plan →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Moment Ribbon Demo */}
      <section className="py-12 bg-white border-y border-mist">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
            <div>
              <span className="text-xs uppercase tracking-wider font-semibold text-teal">
                Interactive Brand Motif
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-ink">The Moment Ribbon</h2>
              <p className="text-xs text-ink/70">
                Click any moment bead to see its importance rating and energy level:
              </p>
            </div>
            {activeMoment && (
              <div className="text-xs bg-mist/80 px-3 py-1.5 rounded-md text-ink font-medium">
                Selected: <strong>{activeMoment.name}</strong> (Importance: {activeMoment.importance}/5, Energy: {activeMoment.energyTarget}/5)
              </div>
            )}
          </div>

          <MomentRibbon
            moments={state.plan.moments}
            activeMomentId={selectedMomentId}
            onSelectMoment={(id) => {
              setSelectedMomentId(id);
            }}
          />
        </div>
      </section>

      {/* AI Planner Spotlight Section */}
      <section className="py-16 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-white via-paper to-mist/40 rounded-3xl border border-mist p-6 sm:p-10 shadow-sm flex flex-col lg:flex-row items-center gap-8">
          <div className="w-32 h-32 sm:w-44 sm:h-44 shrink-0 bg-saffron/20 border-2 border-saffron/40 rounded-full flex items-center justify-center p-4 shadow-inner">
            <img src="/images/robot-avatar.svg" alt="KSHAN AI Mascot" className="w-full h-full object-contain" />
          </div>

          <div className="space-y-4 flex-1 text-center lg:text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal/15 text-xs font-semibold text-teal">
              <span>🤖</span>
              <span>Intelligent Moments Companion</span>
            </div>
            <h2 className="font-serif text-3xl font-bold text-ink">Meet Your AI Celebration Planner</h2>
            <p className="text-sm text-ink/80 leading-relaxed max-w-xl">
              Tell KSHAN your guest count, city and budget. Our conversational planner computes an optimal budget breakdown, suggests signature moments tailored to your culture, and keeps your timeline running like clockwork.
            </p>
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowAIModal(true);
                }}
                className="px-6 py-2.5 rounded-xl bg-teal text-white font-semibold text-sm hover:bg-teal/90 transition-colors shadow-sm"
              >
                Open AI Companion
              </button>
              <Link
                to="/vendors"
                className="px-5 py-2.5 rounded-xl bg-white border border-mist text-ink font-semibold text-sm hover:bg-mist/50 transition-colors"
              >
                Find Curated Vendors
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-mist/20 border-t border-mist">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-teal">
              Systematic Planning
            </span>
            <h2 className="font-serif text-3xl font-bold text-ink">How KSHAN Works</h2>
            <p className="text-sm text-ink/70">Four verified steps from first idea to celebration reality.</p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 text-left">
            <div className="bg-white p-5 rounded-2xl border border-mist space-y-2 shadow-sm">
              <span className="font-serif text-2xl font-bold text-teal">01</span>
              <h3 className="font-semibold text-sm text-ink">Pick 5–9 Moments</h3>
              <p className="text-xs text-ink/70 leading-relaxed">
                Choose the beats that matter. Set importance and target energy for each moment.
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-mist space-y-2 shadow-sm">
              <span className="font-serif text-2xl font-bold text-teal">02</span>
              <h3 className="font-semibold text-sm text-ink">Allocate the Budget</h3>
              <p className="text-xs text-ink/70 leading-relaxed">
                KSHAN mathematically allocates funds based on moment importance and attributes shared costs.
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-mist space-y-2 shadow-sm">
              <span className="font-serif text-2xl font-bold text-teal">03</span>
              <h3 className="font-semibold text-sm text-ink">Simulate Trade-Offs</h3>
              <p className="text-xs text-ink/70 leading-relaxed">
                Wondering what happens if you cut or upgrade a moment? Preview exact financial and task impacts.
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-mist space-y-2 shadow-sm">
              <span className="font-serif text-2xl font-bold text-teal">04</span>
              <h3 className="font-semibold text-sm text-ink">Print Cue Sheets</h3>
              <p className="text-xs text-ink/70 leading-relaxed">
                Vendors receive clean, 1-page briefs with only their moments, timings, and questions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Notes & Principles */}
      <section className="py-12 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-mist shadow-sm space-y-4">
          <h3 className="font-serif text-xl font-bold text-ink">Our Core Principles</h3>
          <div className="grid gap-4 sm:grid-cols-3 text-xs text-ink/80">
            <div className="space-y-1">
              <span className="font-semibold text-ink block">Deterministic Math</span>
              <p>Every rupee and date is calculated by verified pure code. AI never touches your money.</p>
            </div>
            <div className="space-y-1">
              <span className="font-semibold text-ink block">Estimates Are Labelled</span>
              <p>We never invent vendor availability or market quotes. Everything is clearly marked as an estimate.</p>
            </div>
            <div className="space-y-1">
              <span className="font-semibold text-ink block">Works 100% Offline</span>
              <p>Core planning runs entirely in your browser. Generative AI is additive and reviewable.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-mist bg-paper py-8 px-4 text-center text-xs text-ink/80 space-y-2">
        <p>
          <strong>KSHAN</strong> — Budget the moments, not the vendors.
        </p>
        <p>
          PromptWars Virtual, Challenge 5: Celebration & Event Planner. All demo data is fictional.
        </p>
      </footer>

      {/* AI Planner Modal */}
      <AIPlannerModal isOpen={showAIModal} onClose={() => { setShowAIModal(false); }} />
    </div>
  );
}
