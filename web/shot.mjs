// Captures web UI screenshots with the installed Chrome (no download).
// Run: node web/shot.mjs /path/to/repo   (serve must run on :18083)
import { chromium } from 'playwright-core';

const REPO = process.argv[2];
const BASE = 'http://127.0.0.1:18083';
const OUT = new URL('../screenshots/', import.meta.url).pathname;

if (!REPO) {
  console.error('usage: node web/shot.mjs /path/to/repo');
  process.exit(2);
}

const browser = await chromium.launch({
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  args: ['--no-sandbox'],
});
const page = await browser.newPage({
  viewport: { width: 1280, height: 860 },
  colorScheme: 'dark',
});

await page.goto(BASE + '/', { waitUntil: 'networkidle' });
await page.waitForTimeout(2500);
await page.screenshot({ path: OUT + 'web-landing.png' });
console.log('wrote web-landing.png');

await page.goto(BASE + '/?repo=' + encodeURIComponent(REPO), { waitUntil: 'networkidle' });
await page.waitForSelector('table.data tbody tr');
await page.screenshot({ path: OUT + 'web-table.png' });
console.log('wrote web-table.png');

await page.click('button[data-view="tree"]');
await page.waitForSelector('.tree-row', { timeout: 240000 });
await page.locator('details.tree-dir > summary').first().click();
await page.waitForTimeout(200);
await page.screenshot({ path: OUT + 'web-tree.png' });
console.log('wrote web-tree.png');

await page.click('button[data-view="hist"]');
await page.waitForSelector('.hist-row');
await page.screenshot({ path: OUT + 'web-hist.png' });
console.log('wrote web-hist.png');

await browser.close();
