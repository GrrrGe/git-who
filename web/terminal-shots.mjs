// Render the real CLI captures from screenshots/gen.go for GitHub's README.
// Run from the repo root: node web/terminal-shots.mjs
import { chromium } from 'playwright-core';
import { readFile } from 'node:fs/promises';

const browser = await chromium.launch({
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
});
try {
  const page = await browser.newPage({ deviceScaleFactor: 2 });
  for (const name of ['table', 'table-lines', 'tree', 'hist']) {
    const source = new URL(`../screenshots/${name}.svg`, import.meta.url);
    const svg = await readFile(source, 'utf8');
    const [, width, height] = svg.match(/width="(\d+)" height="(\d+)"/);
    await page.setViewportSize({ width: Number(width), height: Number(height) });
    await page.goto(source.href);
    await page.evaluate(() => document.fonts.ready);
    const fits = await page.evaluate(() => {
      const width = document.documentElement.viewBox.baseVal.width;
      return [...document.querySelectorAll('text')].every((text) => {
        const box = text.getBBox();
        return box.x + box.width <= width;
      });
    });
    if (!fits) throw new Error(`${name}: text exceeds the image width`);
    await page.screenshot({ path: new URL(`../screenshots/${name}.png`, import.meta.url).pathname });
    console.log(`wrote ${name}.png`);
  }
} finally {
  await browser.close();
}
