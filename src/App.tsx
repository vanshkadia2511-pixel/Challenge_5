import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './state/context';
import { SummaryBar } from './ui/components/SummaryBar';
import { Navbar } from './ui/components/Navbar';
import { MobileBottomNav } from './ui/components/MobileBottomNav';

const LandingPage = lazy(() => import('./ui/pages/LandingPage').then((m) => ({ default: m.LandingPage })));
const MomentDeckPage = lazy(() => import('./ui/pages/MomentDeckPage').then((m) => ({ default: m.MomentDeckPage })));
const PlanWorkspacePage = lazy(() => import('./ui/pages/PlanWorkspacePage').then((m) => ({ default: m.PlanWorkspacePage })));
const EnergyCurvePage = lazy(() => import('./ui/pages/EnergyCurvePage').then((m) => ({ default: m.EnergyCurvePage })));
const MomentBookPage = lazy(() => import('./ui/pages/MomentBookPage').then((m) => ({ default: m.MomentBookPage })));
const AfterEventPage = lazy(() => import('./ui/pages/AfterEventPage').then((m) => ({ default: m.AfterEventPage })));
const VendorMarketplacePage = lazy(() => import('./ui/pages/VendorMarketplacePage').then((m) => ({ default: m.VendorMarketplacePage })));

function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]" role="status" aria-label="Loading page">
      <div className="flex flex-col items-center gap-3 text-ink/60">
        <div className="w-8 h-8 border-2 border-saffron border-t-transparent rounded-full animate-spin" aria-hidden="true" />
        <span className="text-sm font-medium">Loading…</span>
      </div>
    </div>
  );
}

export function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:p-2 focus:bg-saffron focus:text-ink">
          Skip to main content
        </a>
        <Navbar />
        <SummaryBar />
        <main id="main-content" className="overflow-x-hidden pb-16 sm:pb-0">
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/deck" element={<MomentDeckPage />} />
              <Route path="/plan" element={<PlanWorkspacePage />} />
              <Route path="/vendors" element={<VendorMarketplacePage />} />
              <Route path="/energy" element={<EnergyCurvePage />} />
              <Route path="/book" element={<MomentBookPage />} />
              <Route path="/after" element={<AfterEventPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </main>
        <MobileBottomNav />
      </AppProvider>
    </BrowserRouter>
  );
}

