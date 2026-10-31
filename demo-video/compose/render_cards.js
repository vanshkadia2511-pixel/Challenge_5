import { chromium } from '@playwright/test';
import path from 'path';

async function generateCards() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });

  const introPath = 'file://' + path.resolve('demo-video/compose/title-cards/intro.html').replace(/\\/g, '/');
  await page.goto(introPath, { waitUntil: 'load' });
  await page.screenshot({ path: 'demo-video/compose/title-cards/01-intro.png' });
  await page.screenshot({ path: 'demo-video/final/thumbnail.png' });
  console.log('Intro and thumbnail generated!');

  const outroPath = 'file://' + path.resolve('demo-video/compose/title-cards/outro.html').replace(/\\/g, '/');
  await page.goto(outroPath, { waitUntil: 'load' });
  await page.screenshot({ path: 'demo-video/compose/title-cards/02-outro.png' });
  console.log('Outro card generated!');

  await browser.close();
}

generateCards().catch(console.error);
