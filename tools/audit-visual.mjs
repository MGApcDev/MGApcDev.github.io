#!/usr/bin/env node
/**
 * Pixel-diff the rendered pages against committed baselines.
 *
 *   node tools/audit-visual.mjs            # compare against tests/baseline/
 *   node tools/audit-visual.mjs --update   # accept what renders now as the baseline
 *
 * Structural audits cannot see a layout regression. Replacing 213 inline styles
 * with utility classes, for example, passes every other check in this repo while
 * potentially moving things on the page — this is the check that would notice.
 *
 * Diffing happens in the browser: both images go onto a canvas and the pixels are
 * compared, so there is no image dependency to install.
 */
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { launcher } from './pages.mjs';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const baselineDirectory = path.join(root, 'tests', 'baseline');
const update = process.argv.includes('--update');

/**
 * Three matrices, deliberately uneven. Light desktop covers every distinct
 * layout; dark and mobile cover the places where those modes actually differ. A
 * full cross-product would triple a baseline set that already costs megabytes in
 * git, for little extra signal.
 */

/** page, scroll offset, label — one per distinct layout. */
const VIEWS = [
  ['index', 0, 'home-hero'],
  ['index', 1200, 'home-statement'],
  ['works', 700, 'works-gallery'],
  ['series', 350, 'series-index'],
  ['series-like-a-flower', 0, 'series-hero'],
  ['exhibitions', 850, 'exhibitions-entry'],
  ['catalogue', 260, 'catalogue-table'],
  ['visit', 1450, 'visit-hours'],
  ['prints', 1000, 'prints-table'],
  ['colophon', 620, 'colophon-swatches'],
  ['contact', 200, 'contact-form'],
  ['journal', 632, 'journal-notes'],
  ['series-like-a-flower', 3018, 'series-works-row'],
  ['kvindecirkel', 2277, 'kvindecirkel-prints'],
  ['press', 3928, 'press-images'],
  ['da', 0, 'danish-hero'],
  ['work-untitled-poppy-i', 0, 'work-page'],
  ['404', 0, 'not-found'],
];

/** Re-shot in dark mode, where the whole palette swaps. */
const DARK_VIEWS = [
  ['index', 0, 'dark-home-hero'],
  ['works', 700, 'dark-works-gallery'],
  ['catalogue', 260, 'dark-catalogue-table'],
  ['contact', 200, 'dark-contact-form'],
  ['colophon', 620, 'dark-colophon-swatches'],
];

/** Re-shot narrow, where the header stacks and every grid collapses. */
const MOBILE_VIEWS = [
  ['index', 0, 'mobile-home-hero'],
  ['works', 500, 'mobile-works-gallery'],
  ['catalogue', 200, 'mobile-catalogue-table'],
  ['visit', 900, 'mobile-visit-hours'],
  ['series', 300, 'mobile-series-index'],
];

const TOLERANCE = 0.2; // percent of pixels allowed to differ

const MIME = { '.html':'text/html','.css':'text/css','.js':'text/javascript','.svg':'image/svg+xml','.json':'application/json','.jpg':'image/jpeg','.png':'image/png' };
const server = http.createServer((request, response) => {
  const urlPath = decodeURIComponent(request.url.split('?')[0].split('#')[0]);
  const file = path.join(root, urlPath === '/' ? 'index.html' : urlPath);
  fs.readFile(file, (error, data) => {
    if (error) { response.writeHead(404); response.end(); return; }
    response.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'text/plain' });
    response.end(data);
  });
});
await new Promise((resolve) => server.listen(0, resolve));
const base = `http://localhost:${server.address().port}`;

fs.mkdirSync(baselineDirectory, { recursive: true });
const { browserType, launchOptions } = await launcher('chromium');
const browser = await browserType.launch({ ...launchOptions, headless: true });
const page = await browser.newPage();
await page.emulateMedia({ colorScheme: 'light', reducedMotion: 'reduce' }); // no half-played reveals
await page.setViewportSize({ width: 1440, height: 950 });

const results = [];

/** Capture and compare one matrix of views under the current page settings. */
async function capture(views) {
  for (const [name, offset, label] of views) {
    await page.goto(`${base}/${name}.html`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(500);
    await page.evaluate((top) => window.scrollTo(0, top), offset);
    await page.waitForTimeout(400);
    const shot = await page.screenshot();
    const baselineFile = path.join(baselineDirectory, `${label}.png`);

    if (update || !fs.existsSync(baselineFile)) {
    fs.writeFileSync(baselineFile, shot);
    results.push({ label, status: fs.existsSync(baselineFile) && !update ? 'created' : 'updated', difference: 0 });
    continue;
    }

    const difference = await page.evaluate(async ([current, baseline]) => {
    const load = (data) => new Promise((resolve) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.src = 'data:image/png;base64,' + data;
    });
    const [a, b] = await Promise.all([load(current), load(baseline)]);
    if (a.width !== b.width || a.height !== b.height) return -1;
    const canvas = new OffscreenCanvas(a.width, a.height);
    const context = canvas.getContext('2d', { willReadFrequently: true });
    context.drawImage(a, 0, 0);
    const first = context.getImageData(0, 0, a.width, a.height).data;
    context.clearRect(0, 0, a.width, a.height);
    context.drawImage(b, 0, 0);
    const second = context.getImageData(0, 0, a.width, a.height).data;
    let differing = 0;
    for (let index = 0; index < first.length; index += 4) {
      if (Math.abs(first[index] - second[index]) > 8
        || Math.abs(first[index + 1] - second[index + 1]) > 8
        || Math.abs(first[index + 2] - second[index + 2]) > 8) differing++;
    }
    return (differing / (first.length / 4)) * 100;
    }, [shot.toString('base64'), fs.readFileSync(baselineFile).toString('base64')]);

    results.push({ label, status: difference < 0 ? 'size changed' : difference > TOLERANCE ? 'CHANGED' : 'ok', difference });
    if (difference > TOLERANCE || difference < 0) fs.writeFileSync(path.join(baselineDirectory, `${label}.actual.png`), shot);
  }
}

await capture(VIEWS);

// Dark mode swaps every token, so it gets its own baselines.
await page.emulateMedia({ colorScheme: 'dark', reducedMotion: 'reduce' });
await capture(DARK_VIEWS);

// Narrow: the header stacks, the gallery drops to one column, tables scroll.
await page.emulateMedia({ colorScheme: 'light', reducedMotion: 'reduce' });
await page.setViewportSize({ width: 390, height: 844 });
await capture(MOBILE_VIEWS);

await browser.close();
server.close();

results.forEach((result) => {
  const amount = result.difference > 0 ? `${result.difference.toFixed(2)}%` : '';
  console.log(`${result.status.padEnd(12)} ${result.label.padEnd(22)} ${amount}`);
});

const failed = results.filter((result) => result.status === 'CHANGED' || result.status === 'size changed');
if (failed.length) {
  console.log(`\n${failed.length} view(s) changed — compare tests/baseline/<label>.png with <label>.actual.png`);
  console.log('If the change is intended: node tools/audit-visual.mjs --update');
  process.exit(1);
}
console.log(`\n${results.length} views match`);
