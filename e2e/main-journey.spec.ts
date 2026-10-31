import { test, expect, type Page } from '@playwright/test';
import axe from 'axe-core';

/** Helper to run axe-core on current page and assert zero WCAG 2.1 AA violations */
async function assertNoA11yViolations(page: Page, pageName: string): Promise<void> {
  // Wait for any CSS transitions, paints, or DOM updates to settle
  await page.waitForTimeout(350);
  await page.evaluate(axe.source);
  const results = (await page.evaluate(async () => {
    return await (window as any).axe.run({
      runOnly: {
        type: 'tag',
        values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'],
      },
    });
  })) as { violations: unknown[] };

  if (results.violations.length > 0) {
    console.error(`Accessibility violations on ${pageName}:`, JSON.stringify(results.violations, null, 2));
  }
  expect(results.violations).toEqual([]);
}

test.describe('KSHAN Celebration Planner End-to-End User Journey', () => {
  test('Complete journey: Create wedding -> Moment Deck -> Plan Workspace -> Trade-off cut -> Energy Curve -> Story Interview -> Cue Sheets -> Print Book -> After-Event Log', async ({ page }) => {
    page.on('console', (msg) => {
      console.log('PAGE LOG:', msg.text());
    });
    page.on('pageerror', (err) => {
      console.error('PAGE ERROR:', err);
    });

    // 1. Landing Page
    await page.goto('/');
    await expect(page.getByRole('heading', { name: /Budget the moments/i })).toBeVisible();
    await assertNoA11yViolations(page, 'Landing Page');
    await page.screenshot({ path: 'docs/screenshots/01-landing-page.png', fullPage: true });

    // 2. Select Wedding Celebration & Enter Moment Deck
    const weddingCard = page.getByRole('heading', { name: 'Wedding' });
    await expect(weddingCard).toBeVisible();
    await page.click('a[href="/deck"]');

    // Verify on Moment Deck
    await expect(page).toHaveURL(/\/deck/);
    await expect(page.getByRole('heading', { name: /The Moment Deck/i })).toBeVisible();
    await expect(page.getByLabel(/Event Title/i)).toBeVisible();
    await assertNoA11yViolations(page, 'Moment Deck Page');
    await page.screenshot({ path: 'docs/screenshots/02-moment-deck.png', fullPage: true });

    // 3. Inspect Plan Workspace & Cost per Moment
    await page.click('a[href="/plan"]');
    await expect(page).toHaveURL(/\/plan/);
    await expect(page.getByRole('heading', { name: /Moment Budget/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /Backwards Timeline/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /Vendor Cue Sheets/i })).toBeVisible();
    await assertNoA11yViolations(page, 'Plan Workspace Page');
    await page.screenshot({ path: 'docs/screenshots/03-plan-workspace.png', fullPage: true });

    // 4. Test Trade-off Simulation & Cut Moment
    // Open trade-off drawer on a moment
    const tradeoffButtons = page.getByRole('button', { name: /Trade-off/i });
    if (await tradeoffButtons.count() > 0) {
      await tradeoffButtons.first().click();
      await expect(page.getByRole('heading', { name: /Simulate Trade-off/i })).toBeVisible();
      // Click Apply Trade-off
      const applyBtn = page.getByRole('button', { name: /Apply Trade-off/i });
      if (await applyBtn.isVisible()) {
        await applyBtn.click();
      }
    }

    // 5. Check Energy Curve
    await page.click('a[href="/energy"]');
    await expect(page).toHaveURL(/\/energy/);
    await expect(page.getByRole('heading', { name: /The Energy Curve/i })).toBeVisible();
    await expect(page.getByText(/Tabular Energy Equivalent/i)).toBeVisible();
    await assertNoA11yViolations(page, 'Energy Curve Page');
    await page.screenshot({ path: 'docs/screenshots/04-energy-curve.png', fullPage: true });

    // 6. Run Story Interview
    await page.click('a[href="/deck"]');
    await expect(page).toHaveURL(/\/deck/);

    const interviewBtn = page.getByRole('button', { name: /Story Interview/i });
    await expect(interviewBtn).toBeVisible();
    await interviewBtn.click();

    // Verify modal appears
    await expect(page.getByRole('heading', { name: /Story Interview/i })).toBeVisible();
    await page.fill('#interview-guests', '120');
    await page.fill('#interview-city', 'Jaipur');
    await page.fill('#interview-budget', '600000');

    // Submit interview to generate suggestions (fallback generator handles offline)
    await page.click('button:has-text("Generate Moments from Story")');

    // Modal closes and Review Cards appear on Moment Deck
    await expect(page.getByRole('heading', { name: /Suggested Moments for Review/i })).toBeVisible({ timeout: 10000 });

    // Review card has Apply button
    const applyReviewBtn = page.getByRole('button', { name: /Apply to Deck/i });
    if (await applyReviewBtn.count() > 0) {
      await applyReviewBtn.first().click();
    }

    // 7. Moment Book (Print View) & Exports
    await page.click('a[href="/book"]');
    await expect(page).toHaveURL(/\/book/);
    await expect(page.getByRole('heading', { name: /1\. Celebration Moment Schedule/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /2\. Master Moment Budget/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /3\. Vendor Cue Sheets/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /4\. Backwards Timeline Checklist/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Print Moment Book/i })).toBeVisible();
    await assertNoA11yViolations(page, 'Moment Book Page');
    await page.screenshot({ path: 'docs/screenshots/05-moment-book.png', fullPage: true });

    // 8. After-Event Log
    await page.click('a[href="/after"]');
    await expect(page).toHaveURL(/\/after/);
    await expect(page.getByRole('heading', { name: /Celebration Reality Scorecard/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /Moment Breakdown: Spend & Sentiment/i })).toBeVisible();

    // Save log
    await page.click('button:has-text("Save Log")');
    await expect(page.getByText(/After-Event Log saved to browser storage!/i)).toBeVisible();
    await assertNoA11yViolations(page, 'After-Event Page');
    await page.screenshot({ path: 'docs/screenshots/06-after-event.png', fullPage: true });
  });

  test('Responsive viewport test: Stacked layout and no horizontal scroll at 320px', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 640 });
    await page.goto('/');

    // Check no horizontal scrollbar on body
    const scrollWidth = await page.evaluate(() => document.body.scrollWidth);
    const clientWidth = await page.evaluate(() => document.body.clientWidth);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1); // allow 1px rounding tolerance

    // Check Moment Deck at 320px
    await page.goto('/deck');
    const deckScrollWidth = await page.evaluate(() => document.body.scrollWidth);
    const deckClientWidth = await page.evaluate(() => document.body.clientWidth);
    expect(deckScrollWidth).toBeLessThanOrEqual(deckClientWidth + 1);
  });
});
