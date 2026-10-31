/// <reference types="vitest/globals" />
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AppProvider } from '../../src/state/context';
import { LandingPage } from '../../src/ui/pages/LandingPage';
import { MomentDeckPage } from '../../src/ui/pages/MomentDeckPage';
import { PlanWorkspacePage } from '../../src/ui/pages/PlanWorkspacePage';
import { EnergyCurvePage } from '../../src/ui/pages/EnergyCurvePage';

function renderWithProviders(ui: React.ReactElement) {
  return render(
    <BrowserRouter>
      <AppProvider>{ui}</AppProvider>
    </BrowserRouter>,
  );
}

describe('UI Pages Rendering', () => {
  it('LandingPage renders hero, tagline and occasion options', () => {
    renderWithProviders(<LandingPage />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/Budget the moments/i);
    expect(screen.getByRole('heading', { name: 'Wedding' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Birthday' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Community Event' })).toBeInTheDocument();
  });

  it('MomentDeckPage renders moment deck list and details form', () => {
    renderWithProviders(<MomentDeckPage />);
    expect(screen.getByRole('heading', { name: /The Moment Deck/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/Event Title/i)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Signature Moments/i })).toBeInTheDocument();
  });

  it('PlanWorkspacePage renders all 4 sections', () => {
    renderWithProviders(<PlanWorkspacePage />);
    expect(screen.getByRole('heading', { name: /Moment Budget/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Backwards Timeline/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Vendor Cue Sheets/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Signature Moment Ideas/i })).toBeInTheDocument();
  });

  it('EnergyCurvePage renders energy arc and accessible table', () => {
    renderWithProviders(<EnergyCurvePage />);
    expect(screen.getByRole('heading', { name: /The Energy Curve/i })).toBeInTheDocument();
    expect(screen.getByText(/Tabular Energy Equivalent/i)).toBeInTheDocument();
  });
});
