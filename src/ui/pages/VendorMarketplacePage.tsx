/**
 * VendorMarketplacePage.tsx — Curated vendor directory & marketplace.
 * Matches reference 05_vendor_marketplace.png.
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../../state/context';
import type { Vendor } from '../../schemas/moment';

interface VendorListing {
  id: string;
  name: string;
  category: string;
  categoryKey: 'Venues' | 'Decorators' | 'Caterers' | 'Photographers' | 'Entertainment' | 'Invitations';
  location: string;
  startingPrice: string;
  rating: number;
  image: string;
  badge?: string;
  questions: string[];
}

const CATALOG_VENDORS: VendorListing[] = [
  {
    id: 'v-royal-orchid',
    name: 'Royal Orchid Banquets',
    category: 'Venue',
    categoryKey: 'Venues',
    location: 'Ahmedabad',
    startingPrice: '₹50,000+',
    rating: 4.9,
    image: '/images/vendor-venue.jpg',
    badge: 'Heritage Haveli',
    questions: ['What is the sound curfew for open-air sangeet?', 'Is in-house catering mandatory or can outside caterers be brought in?'],
  },
  {
    id: 'v-dream-decor',
    name: 'Dream Decor Co.',
    category: 'Decorator',
    categoryKey: 'Decorators',
    location: 'Ahmedabad',
    startingPrice: '₹30,000+',
    rating: 4.8,
    image: '/images/vendor-decor.jpg',
    badge: 'Floral Specialists',
    questions: ['Can fresh marigold & tuberose garlands be prepped on-site?', 'What is setup time for the mandap arch?'],
  },
  {
    id: 'v-spice-villa',
    name: 'Spice Villa Catering',
    category: 'Caterer',
    categoryKey: 'Caterers',
    location: 'Ahmedabad',
    startingPrice: '₹40,000+',
    rating: 4.9,
    image: '/images/vendor-caterer.jpg',
    badge: 'Authentic Gujarati & Pan-Asian',
    questions: ['Do you provide live chaat counters and traditional dessert stations?', 'What is the server to guest ratio?'],
  },
  {
    id: 'v-pixel-perfect',
    name: 'Pixel Perfect Studios',
    category: 'Photographer',
    categoryKey: 'Photographers',
    location: 'Ahmedabad',
    startingPrice: '₹25,000+',
    rating: 4.9,
    image: '/images/vendor-photographer.jpg',
    badge: 'Cinematography & Drone',
    questions: ['How many candid photographers will be present during the blessing?', 'What is the delivery turnaround for the same-day teaser?'],
  },
  {
    id: 'v-sangeet-symphony',
    name: 'Sangeet Symphony',
    category: 'Entertainment',
    categoryKey: 'Entertainment',
    location: 'Ahmedabad',
    startingPrice: '₹35,000+',
    rating: 4.7,
    image: '/images/vendor-entertainment.jpg',
    badge: 'Live Acoustic & Dhol',
    questions: ['Do you bring your own wireless microphones and PA setup?', 'Can you coordinate entry tunes with the master of ceremonies?'],
  },
  {
    id: 'v-royal-heritage',
    name: 'Royal Heritage Cards',
    category: 'Invitations',
    categoryKey: 'Invitations',
    location: 'Ahmedabad',
    startingPrice: '₹15,000+',
    rating: 4.8,
    image: '/images/vendor-invitations.jpg',
    badge: 'Foil & Wax Seals',
    questions: ['What is the turnaround time for proof review and delivery?', 'Do you provide matching digital WhatsApp invitations?'],
  },
];

export function VendorMarketplacePage() {
  const { state, dispatch } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});
  const [addedIds, setAddedIds] = useState<Record<string, boolean>>({});

  const categories = ['All', 'Venues', 'Decorators', 'Caterers', 'Photographers', 'Entertainment'];

  const filteredVendors = CATALOG_VENDORS.filter((v) => {
    const matchesCategory = selectedCategory === 'All' || v.categoryKey === selectedCategory;
    const matchesSearch =
      v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.location.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const toggleFavorite = (id: string) => {
    setFavorites((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleAddToEvent = (vendor: VendorListing) => {
    // Check if vendor already exists in plan
    const alreadyExists = state.plan.vendors.some((v) => v.name === vendor.name);
    if (!alreadyExists) {
      const newVendor: Vendor = {
        id: `v-${String(Date.now())}`,
        name: vendor.name,
        category: vendor.category,
        momentIds: state.plan.moments.slice(0, 2).map((m) => m.id),
        status: 'contacted',
        questions: vendor.questions,
      };
      dispatch({ type: 'ADD_VENDOR', vendor: newVendor });
    }
    setAddedIds((prev) => ({ ...prev, [vendor.id]: true }));
  };

  return (
    <div className="min-h-screen bg-paper pb-20 sm:pb-12">
      {/* Top Banner */}
      <div className="bg-white border-b border-mist px-4 sm:px-6 lg:px-8 py-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <Link
              to="/plan"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal hover:underline mb-1"
            >
              ← Back to Plan Workspace
            </Link>
            <h1 className="font-serif text-3xl font-bold text-ink flex items-center gap-2">
              Find Vendors <span className="text-saffron text-xl">✨</span>
            </h1>
            <p className="text-xs text-ink/70">
              Browse top-rated celebration partners in {state.plan.event.city || 'Ahmedabad'}, curated for your signature moments.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-3 py-1.5 rounded-full bg-mist/60 text-xs font-medium text-ink">
              {state.plan.vendors.length} vendors in your event
            </div>
            <Link
              to="/plan#cuesheets"
              className="px-4 py-2 rounded-lg bg-teal text-white text-xs font-semibold hover:bg-teal/90 transition-colors shadow-sm"
            >
              View Cue Sheets →
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Search Bar & Sorter */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:max-w-md">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
              }}
              placeholder="Search vendors by name, category or city..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-mist bg-white text-sm text-ink placeholder:text-ink/60 focus:outline-none focus:ring-2 focus:ring-saffron"
            />
            <span className="absolute left-3.5 top-3 text-ink/60 text-sm">🔍</span>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => {
                  setSelectedCategory(cat);
                }}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                  selectedCategory === cat
                    ? 'bg-saffron text-ink shadow-sm'
                    : 'bg-white border border-mist text-ink/70 hover:bg-mist/50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Vendors Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredVendors.map((vendor) => {
            const isAdded = addedIds[vendor.id] || state.plan.vendors.some((v) => v.name === vendor.name);
            const isFav = favorites[vendor.id];

            return (
              <div
                key={vendor.id}
                className="bg-white rounded-2xl border border-mist overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div>
                  {/* Photo Container */}
                  <div className="relative h-48 w-full overflow-hidden bg-mist/40">
                    <img
                      src={vendor.image}
                      alt={vendor.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {vendor.badge && (
                      <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-sm text-[11px] font-semibold text-ink shadow-sm">
                        {vendor.badge}
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        toggleFavorite(vendor.id);
                      }}
                      aria-label={`Favorite ${vendor.name}`}
                      className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-rose text-sm shadow-sm hover:scale-110 transition-transform"
                    >
                      {isFav ? '❤️' : '🤍'}
                    </button>
                  </div>

                  {/* Card Content */}
                  <div className="p-5 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-teal uppercase tracking-wider">
                        {vendor.category} • {vendor.location}
                      </span>
                      <span className="flex items-center gap-1 text-xs font-bold text-ink">
                        ⭐ {String(vendor.rating)}
                      </span>
                    </div>

                    <h2 className="font-serif text-lg font-bold text-ink">{vendor.name}</h2>
                    <p className="text-xs font-semibold text-saffron">{vendor.startingPrice}</p>

                    <div className="pt-2 border-t border-mist/60 space-y-1">
                      <span className="text-[11px] font-semibold text-ink/70 block">
                        Prepared Moments Question:
                      </span>
                      <p className="text-[11px] text-ink/80 italic leading-snug">
                        &ldquo;{vendor.questions[0]}&rdquo;
                      </p>
                    </div>
                  </div>
                </div>

                {/* Footer Action */}
                <div className="p-5 pt-0">
                  <button
                    type="button"
                    onClick={() => {
                      handleAddToEvent(vendor);
                    }}
                    disabled={isAdded}
                    className={`w-full py-2.5 px-4 rounded-xl text-xs font-semibold transition-all ${
                      isAdded
                        ? 'bg-mist text-ink/70 cursor-default'
                        : 'bg-teal text-white hover:bg-teal/90 shadow-sm'
                    }`}
                  >
                    {isAdded ? '✓ Added to Event Cue Sheets' : 'Add to Event +'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Demo Content Disclaimer per Spec */}
        <div className="p-4 rounded-xl bg-white border border-mist text-xs text-ink/70 flex items-start gap-2">
          <span>ℹ️</span>
          <span>
            <strong>Editorial Note:</strong> Vendor entries shown above are curated sample suppliers with realistic price estimates and moment interview questions. Pricing and availability should be verified directly with suppliers.
          </span>
        </div>
      </div>
    </div>
  );
}
