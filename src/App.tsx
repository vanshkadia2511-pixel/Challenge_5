import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './state/context';
import { LandingPage } from './ui/pages/LandingPage';
import { MomentDeckPage } from './ui/pages/MomentDeckPage';
import { PlanWorkspacePage } from './ui/pages/PlanWorkspacePage';
import { EnergyCurvePage } from './ui/pages/EnergyCurvePage';
import { MomentBookPage } from './ui/pages/MomentBookPage';
import { AfterEventPage } from './ui/pages/AfterEventPage';
import { VendorMarketplacePage } from './ui/pages/VendorMarketplacePage';
import { SummaryBar } from './ui/components/SummaryBar';
import { Navbar } from './ui/components/Navbar';
import { MobileBottomNav } from './ui/components/MobileBottomNav';

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
        </main>
        <MobileBottomNav />
      </AppProvider>
    </BrowserRouter>
  );
}

