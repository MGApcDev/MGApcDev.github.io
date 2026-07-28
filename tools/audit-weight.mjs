#!/usr/bin/env node
/**
 * Page-weight budget.
 *
 *   node tools/audit-weight.mjs            # report + enforce the budget
 *   node tools/audit-weight.mjs --report   # report only, never fail
 *
 * A photography site gets heavy quietly: one uncompressed hero, one more gallery
 * row, and the page nobody measured is 6 MB. This loads every page, sums what the
 * browser actually transferred, and fails if a page crosses the budget or if any
 * single asset is oversized.
 *
 * The budgets assume placeholder SVGs. Real photographs will change the numbers —
 * raise the budget deliberately at that point rather than deleting the check.
 */
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PAGES, launcher } from './pages.mjs';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const reportOnly = process.argv.includes('--report');

const BUDGET_PER_PAGE = 1_500_000;  // bytes, everything the page pulls in
const BUDGET_PER_ASSET = 400_000;   // no single file should dominate
const BUDGET_REQUESTS = 40;

const MIME = {
  '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml',
  '.xml': 'application/xml', '.txt': 'text/plain', '.json': 'application/json',
  '.jpg': 'image/jpeg', '.png': 'image/png',
};

const server = http.createServer((request, response) => {
  const urlPath = decodeURIComponent(request.url.split('?')[0].split('#')[0]);
  const file = path.join(root, urlPath === '/' ? 'index.html' : urlPath);
  fs.readFile(file, (error, data) => {
    if (error) { response.writeHead(404); response.end('not found'); return; }
    response.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream' });
    response.end(data);
  });
});
await new Promise((resolve) => server.listen(0, resolve));
const base = `http://localhost:${server.address().port}`;

const { browserType, launchOptions } = await launcher('chromium');
const browser = await browserType.launch({ ...launchOptions, headless: true });
const page = await browser.newPage();
await page.setViewportSize({ width: 1440, height: 950 });

const rows = [];
const failures = [];

for (const name of PAGES) {
  const seen = new Map();
  const onResponse = async (response) => {
    const url = response.url();
    if (seen.has(url)) return;
    try {
      const body = await response.body();
      seen.set(url, body.length);
    } catch { /* redirects and aborted requests have no body */ }
  };
  page.on('response', onResponse);
  await page.goto(`${base}/${name}.html`, { waitUntil: 'domcontentloaded' });
  // Scroll the whole page so lazy images actually load into the measurement.
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 900) {
      window.scrollTo(0, y);
      await new Promise((resolve) => setTimeout(resolve, 40));
    }
  });
  await page.waitForTimeout(600);
  page.off('response', onResponse);

  const total = [...seen.values()].reduce((sum, size) => sum + size, 0);
  const heaviest = [...seen.entries()].sort((a, b) => b[1] - a[1])[0] || ['—', 0];
  rows.push({ name, total, requests: seen.size, heaviest: heaviest[0].replace(base + '/', ''), heaviestSize: heaviest[1] });

  if (total > BUDGET_PER_PAGE) failures.push(`${name}: ${Math.round(total / 1024)} kB over the ${Math.round(BUDGET_PER_PAGE / 1024)} kB page budget`);
  if (seen.size > BUDGET_REQUESTS) failures.push(`${name}: ${seen.size} requests over the ${BUDGET_REQUESTS} budget`);
  if (heaviest[1] > BUDGET_PER_ASSET) failures.push(`${name}: ${heaviest[0].replace(base + '/', '')} is ${Math.round(heaviest[1] / 1024)} kB, over the ${Math.round(BUDGET_PER_ASSET / 1024)} kB asset budget`);
}

await browser.close();
server.close();

const kb = (bytes) => String(Math.round(bytes / 1024)).padStart(5) + ' kB';
rows.sort((a, b) => b.total - a.total);
console.log('page'.padEnd(32) + 'weight'.padStart(9) + 'reqs'.padStart(6) + '  heaviest asset');
rows.forEach((row) => {
  console.log(row.name.padEnd(32) + kb(row.total) + String(row.requests).padStart(6) + '  ' + row.heaviest + ' (' + Math.round(row.heaviestSize / 1024) + ' kB)');
});
const totals = rows.reduce((sum, row) => sum + row.total, 0);
console.log(`\n${rows.length} pages, median ${kb(rows[Math.floor(rows.length / 2)].total).trim()}, heaviest ${rows[0].name} at ${kb(rows[0].total).trim()}, whole site ${Math.round(totals / 1024 / 1024 * 10) / 10} MB`);

if (failures.length && !reportOnly) {
  console.log(`\nOVER BUDGET — ${failures.length} issue(s)`);
  failures.forEach((line) => console.log('  ' + line));
  process.exit(1);
}
if (failures.length) console.log(`\n${failures.length} over budget (report mode, not failing)`);
