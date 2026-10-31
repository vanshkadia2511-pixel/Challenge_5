/// <reference types="vitest/globals" />
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AppProvider } from '../../src/state/context';
import { AfterEventPage } from '../../src/ui/pages/AfterEventPage';

function renderWithProviders(ui: React.ReactElement) {
  return render(
    <BrowserRouter>
      <AppProvider>{ui}</AppProvider>
    </BrowserRouter>,
  );
}

describe('AfterEventPage (Post-Celebration Log)', () => {
  it('renders scorecard, moment spend breakdown, and reflection fields', () => {
    renderWithProviders(<AfterEventPage />);

    expect(screen.getByRole('heading', { name: /After-Event Debrief & Log/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Celebration Reality Scorecard/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/Overall Host Reflection & Takeaways/i)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Moment Breakdown: Spend & Sentiment/i })).toBeInTheDocument();
  });

  it('updates rating to Skip and saves log with success feedback', () => {
    renderWithProviders(<AfterEventPage />);

    // Find all "Skip" buttons
    const skipButtons = screen.getAllByRole('button', { name: /Skip/i });
    expect(skipButtons.length).toBeGreaterThan(0);

    // Toggle first moment to Skip
    fireEvent.click(skipButtons[0]);

    // Save log
    const saveBtn = screen.getByRole('button', { name: /Save Log/i });
    fireEvent.click(saveBtn);

    // Expect status message to appear
    expect(screen.getByText(/After-Event Log saved to browser storage!/i)).toBeInTheDocument();
  });
});
