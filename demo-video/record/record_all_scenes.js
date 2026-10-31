/**
 * record_all_scenes.js — Automated desktop browser recorder for KSHAN product demo.
 * Records 1920x1080 30fps desktop browser sessions covering 100% of verified features.
 */

import { preview } from 'vite';
import { chromium } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const RAW_DIR = path.resolve('demo-video/record/raw');
if (!fs.existsSync(RAW_DIR)) {
  fs.mkdirSync(RAW_DIR, { recursive: true });
}

// Clean any previous recordings
const oldFiles = fs.readdirSync(RAW_DIR);
for (const file of oldFiles) {
  if (file.endsWith('.webm') || file.endsWith('.mp4')) {
    fs.unlinkSync(path.join(RAW_DIR, file));
  }
}

async function injectCursor(page) {
  await page.evaluate(() => {
    if (document.getElementById('kshan-video-cursor')) return;
    const cursor = document.createElement('div');
    cursor.id = 'kshan-video-cursor';
    cursor.style.position = 'fixed';
    cursor.style.width = '24px';
    cursor.style.height = '24px';
    cursor.style.borderRadius = '50%';
    cursor.style.backgroundColor = 'rgba(181, 118, 42, 0.75)'; // Bronze gold
    cursor.style.border = '2.5px solid #ffffff';
    cursor.style.boxShadow = '0 2px 10px rgba(0,0,0,0.35)';
    cursor.style.pointerEvents = 'none';
    cursor.style.zIndex = '9999999';
    cursor.style.transform = 'translate(-50%, -50%)';
    cursor.style.transition = 'transform 0.08s ease, width 0.15s ease, height 0.15s ease, background-color 0.15s ease';
    document.body.appendChild(cursor);

    window.addEventListener('mousemove', (e) => {
      cursor.style.left = e.clientX + 'px';
      cursor.style.top = e.clientY + 'px';
    });
    window.addEventListener('mousedown', () => {
      cursor.style.width = '34px';
      cursor.style.height = '34px';
      cursor.style.backgroundColor = 'rgba(31, 122, 116, 0.85)'; // Teal click feedback
    });
    window.addEventListener('mouseup', () => {
      cursor.style.width = '24px';
      cursor.style.height = '24px';
      cursor.style.backgroundColor = 'rgba(181, 118, 42, 0.75)';
    });
  });
}

async function smoothScroll(page, targetY, durationMs = 1000) {
  await page.evaluate(async ({ targetY, durationMs }) => {
    const startY = window.scrollY;
    const diff = targetY - startY;
    const startTime = performance.now();

    return new Promise((resolve) => {
      function step(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / durationMs, 1);
        const ease = 0.5 - Math.cos(progress * Math.PI) / 2;
        window.scrollTo(0, startY + diff * ease);

        if (progress < 1) {
          requestAnimationFrame(step);
        } else {
          resolve();
        }
      }
      requestAnimationFrame(step);
    });
  }, { targetY, durationMs });
  await page.waitForTimeout(300);
}

async function moveMouseSmooth(page, targetX, targetY, steps = 25) {
  await page.mouse.move(targetX, targetY, { steps });
  await page.waitForTimeout(150);
}

async function run() {
  console.log('--- Step A: Starting Vite preview server on port 4173 ---');
  const server = await preview({
    preview: { port: 4173 },
  });
  console.log('Preview server ready at http://localhost:4173/');

  console.log('--- Step B: Launching Chromium at 1920x1080 ---');
  const browser = await chromium.launch({
    headless: true,
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 1,
    recordVideo: {
      dir: RAW_DIR,
      size: { width: 1920, height: 1080 },
    },
  });

  const page = await context.newPage();

  console.log('--- Scene 1: Landing Page & Occasion Selection ---');
  await page.goto('http://localhost:4173/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1500);
  await injectCursor(page);

  // Showcase hero title & heritage ribbon
  await moveMouseSmooth(page, 960, 320, 25);
  await page.waitForTimeout(1500);

  // Smooth scroll down to occasion cards
  await smoothScroll(page, 720, 1500);
  await injectCursor(page);
  await page.waitForTimeout(800);

  // Move over Birthday card
  await moveMouseSmooth(page, 960, 520, 20);
  await page.waitForTimeout(800);

  // Move over Community Events card
  await moveMouseSmooth(page, 1350, 520, 20);
  await page.waitForTimeout(800);

  // Move back to Wedding card
  await moveMouseSmooth(page, 570, 520, 25);
  await page.waitForTimeout(800);

  console.log('--- Scene 2: AI Celebration Planner Modal ---');
  // Scroll back to top and click Ask AI Planner
  await smoothScroll(page, 0, 1000);
  await injectCursor(page);
  await moveMouseSmooth(page, 1060, 380, 20);
  await page.waitForTimeout(500);

  const aiPlannerBtn = page.getByRole('button', { name: /Ask AI Planner/i }).first();
  if (await aiPlannerBtn.isVisible()) {
    await aiPlannerBtn.click();
    await page.waitForTimeout(1800);

    // Hover over donut chart and budget breakdown
    await moveMouseSmooth(page, 960, 480, 25);
    await page.waitForTimeout(1500);

    // Click Apply to Budget button inside AI modal
    const applyBudgetBtn = page.getByRole('button', { name: /Apply to Budget/i });
    if (await applyBudgetBtn.isVisible()) {
      await applyBudgetBtn.click();
      await page.waitForTimeout(1200);
    }

    // Close AI modal
    const closeBtn = page.getByLabel(/Close modal/i);
    if (await closeBtn.isVisible()) {
      await closeBtn.click();
      await page.waitForTimeout(800);
    }
  }

  // Navigate to Wedding Plan via card button
  await smoothScroll(page, 720, 1000);
  await injectCursor(page);
  const startWeddingBtn = page.getByRole('button', { name: /Start Wedding Plan/i });
  if (await startWeddingBtn.isVisible()) {
    await startWeddingBtn.click();
  } else {
    await page.click('a[href="/deck"]');
  }
  await page.waitForTimeout(1500);
  await injectCursor(page);

  console.log('--- Scene 3: The Moment Deck & Story Interview ---');
  await moveMouseSmooth(page, 960, 220, 20);
  await page.waitForTimeout(1200);

  // Open Story Interview Modal
  const interviewBtn = page.getByRole('button', { name: /Story Interview/i });
  if (await interviewBtn.isVisible()) {
    await interviewBtn.click();
    await page.waitForTimeout(1500);

    // Fill interview fields with Aarav's wedding scenario
    const guestsInput = page.locator('#interview-guests');
    if (await guestsInput.isVisible()) {
      await guestsInput.fill('250');
      await page.waitForTimeout(400);
    }
    const cityInput = page.locator('#interview-city');
    if (await cityInput.isVisible()) {
      await cityInput.fill('Ahmedabad');
      await page.waitForTimeout(400);
    }
    const budgetInput = page.locator('#interview-budget');
    if (await budgetInput.isVisible()) {
      await budgetInput.fill('800000');
      await page.waitForTimeout(500);
    }

    // Submit story interview
    const generateMomentsBtn = page.locator('button:has-text("Generate Moments from Story")');
    if (await generateMomentsBtn.isVisible()) {
      await generateMomentsBtn.click();
      await page.waitForTimeout(2000);
    }

    // Inspect Review Cards (Human in the loop)
    await smoothScroll(page, 450, 800);
    await injectCursor(page);
    await page.waitForTimeout(1200);

    const applyCardBtn = page.getByRole('button', { name: /Apply/i }).first();
    if (await applyCardBtn.isVisible()) {
      await applyCardBtn.click();
      await page.waitForTimeout(1000);
    }
  }

  console.log('--- Scene 4: Celebration Studio Dashboard & Budget Overview ---');
  await page.goto('http://localhost:4173/plan', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1500);
  await injectCursor(page);

  // Stat tiles overview
  await moveMouseSmooth(page, 380, 520, 20); // Total budget ₹8,00,000
  await page.waitForTimeout(700);
  await moveMouseSmooth(page, 740, 520, 20); // Spent so far ₹3,20,000
  await page.waitForTimeout(700);
  await moveMouseSmooth(page, 1100, 520, 20); // Guests 250
  await page.waitForTimeout(700);
  await moveMouseSmooth(page, 1460, 520, 20); // Tasks complete ring 68%
  await page.waitForTimeout(1000);

  // Check off an upcoming task
  const taskCheckboxes = page.locator('input[type="checkbox"]');
  if (await taskCheckboxes.count() > 0) {
    await taskCheckboxes.first().click();
    await page.waitForTimeout(1000);
  }

  // Open Add Guest Modal
  const addGuestBtn = page.getByRole('button', { name: /Add Guests/i });
  if (await addGuestBtn.isVisible()) {
    await addGuestBtn.click();
    await page.waitForTimeout(800);
    const guestInput = page.locator('input[type="number"]').first();
    if (await guestInput.isVisible()) {
      await guestInput.fill('250');
      await page.waitForTimeout(500);
    }
    const updateBtn = page.getByRole('button', { name: 'Update', exact: true });
    if (await updateBtn.isVisible()) {
      await updateBtn.click();
      await page.waitForTimeout(800);
    }
  }

  // Scroll down to Budget Overview section
  await smoothScroll(page, 650, 1200);
  await injectCursor(page);
  await page.waitForTimeout(1500);

  // Move over Planned vs Actual monthly bars
  await moveMouseSmooth(page, 820, 420, 20);
  await page.waitForTimeout(1200);

  console.log('--- Scene 5: Moment Budget, Shared Costs & Trade-Off Simulator ---');
  await smoothScroll(page, 1300, 1200);
  await injectCursor(page);
  await page.waitForTimeout(1500);

  // Open Trade-off simulation drawer
  const tradeoffButtons = page.getByRole('button', { name: /Trade-off/i });
  if (await tradeoffButtons.count() > 0) {
    await tradeoffButtons.first().click();
    await page.waitForTimeout(1500);

    // Move over simulation preview values
    await moveMouseSmooth(page, 1350, 500, 20);
    await page.waitForTimeout(1200);

    // Apply trade-off cut
    const applyTradeoffBtn = page.getByRole('button', { name: 'Apply Trade-off', exact: true });
    if (await applyTradeoffBtn.isVisible()) {
      await applyTradeoffBtn.click();
      await page.waitForTimeout(1200);
    }
  }

  // Scroll down to Backwards Timeline and Cue Sheets
  await smoothScroll(page, 2000, 1200);
  await injectCursor(page);
  await page.waitForTimeout(1500);

  console.log('--- Scene 6: The Energy Curve ---');
  await page.goto('http://localhost:4173/energy', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1500);
  await injectCursor(page);

  // Hover over energy trajectory
  await moveMouseSmooth(page, 960, 420, 25);
  await page.waitForTimeout(1500);

  // Scroll to Tabular Energy Equivalent for screen readers
  await smoothScroll(page, 700, 1200);
  await injectCursor(page);
  await page.waitForTimeout(1500);

  console.log('--- Scene 7: Find Vendors Marketplace ---');
  await page.goto('http://localhost:4173/vendors', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1500);
  await injectCursor(page);

  // Filter chips: Decorators
  const decoratorFilter = page.getByRole('button', { name: 'Decorators', exact: true });
  if (await decoratorFilter.isVisible()) {
    await decoratorFilter.click();
    await page.waitForTimeout(1000);
  }

  // Filter chips: All
  const allFilter = page.getByRole('button', { name: 'All', exact: true });
  if (await allFilter.isVisible()) {
    await allFilter.click();
    await page.waitForTimeout(800);
  }

  // Toggle favorite on first vendor card
  const favoriteBtns = page.getByLabel(/Favorite /i);
  if (await favoriteBtns.count() > 0) {
    await favoriteBtns.first().click();
    await page.waitForTimeout(800);
  }

  // Click Add to Event on a vendor
  const addVendorBtns = page.getByRole('button', { name: /Add to Event/i });
  if (await addVendorBtns.count() > 0) {
    await addVendorBtns.first().click();
    await page.waitForTimeout(1200);
  }

  console.log('--- Scene 8: The Moment Book & Exports ---');
  await page.goto('http://localhost:4173/book', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1500);
  await injectCursor(page);

  // Move over Export CSV button
  const exportCsvBtn = page.getByRole('button', { name: /Export CSV/i });
  if (await exportCsvBtn.isVisible()) {
    await moveMouseSmooth(page, 1300, 200, 20);
    await page.waitForTimeout(800);
  }

  // Scroll through print booklet
  await smoothScroll(page, 600, 1200);
  await injectCursor(page);
  await page.waitForTimeout(1200);

  console.log('--- Scene 9: After-Event Log & Scorecard ---');
  await page.goto('http://localhost:4173/after', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1500);
  await injectCursor(page);

  // Fill actual spend in first input
  const actualSpendInputs = page.locator('input[type="number"]');
  if (await actualSpendInputs.count() > 0) {
    await actualSpendInputs.first().fill('45000');
    await page.waitForTimeout(800);
  }

  // Rate a moment Keep
  const keepBtns = page.getByRole('button', { name: /Keep/i });
  if (await keepBtns.count() > 0) {
    await keepBtns.first().click();
    await page.waitForTimeout(800);
  }

  // Scroll down to scorecard summary
  await smoothScroll(page, 500, 1000);
  await injectCursor(page);
  await page.waitForTimeout(1500);

  console.log('--- Closing Browser and Saving Recording ---');
  await page.close();
  await context.close();
  await browser.close();
  await server.close();

  console.log('--- Recording Complete! ---');
}

run().catch((err) => {
  console.error('Recording failed:', err);
  process.exit(1);
});
