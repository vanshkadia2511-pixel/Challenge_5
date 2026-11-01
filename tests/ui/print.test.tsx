/// <reference types="vitest/globals" />
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AppProvider } from '../../src/state/context';
import { MomentBookPage } from '../../src/ui/pages/MomentBookPage';

function renderWithProviders(ui: React.ReactElement) {
  return render(
    <BrowserRouter>
      <AppProvider>{ui}</AppProvider>
    </BrowserRouter>,
  );
}

describe('MomentBookPage (Print View & Exports)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders celebration header, sections, and export buttons', () => {
    renderWithProviders(<MomentBookPage />);

    // Header & title
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /Print Moment Book/i })[0]).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Export JSON/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Import JSON/i })).toBeInTheDocument();

    // The 4 main printable sections
    expect(
      screen.getByRole('heading', { name: /1\. Celebration Moment Schedule/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: /2\. Master Moment Budget/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: /3\. Vendor Cue Sheets/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: /4\. Backwards Timeline Checklist/i }),
    ).toBeInTheDocument();
  });

  it('triggers window.print when Print button is clicked', () => {
    const printSpy = vi.spyOn(window, 'print').mockImplementation(() => {});
    renderWithProviders(<MomentBookPage />);

    const printBtn = screen.getAllByRole('button', { name: /Print Moment Book/i })[0];
    fireEvent.click(printBtn);

    expect(printSpy).toHaveBeenCalledTimes(1);
  });
});
