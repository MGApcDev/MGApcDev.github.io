#!/usr/bin/env node
/**
 * Serve the site with the exact Content-Security-Policy from _headers and drive
 * the interactive parts under it.
 *
 *   node tools/audit-csp.mjs
 *
 * The policy is only worth writing if it is tested: style-src 'self' blocks
 * style="…" attributes outright, and the script hash breaks the moment the inline
 * bootstrap changes by one character. Both failures are silent in production —
 * the page just stops working for everyone.
 */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { launcher } from './pages.mjs';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const MIME = { '.html':'text/html','.css':'text/css','.js':'text/javascript','.svg':'image/svg+xml','.json':'application/json','.jpg':'image/jpeg','.png':'image/png' };
// Serve with the exact CSP from _headers, so the policy is tested rather than assumed.
const CSP = fs.readFileSync(path.join(root, '_headers'), 'utf8')
  .split('\n').find((line) => line.trim().startsWith('Content-Security-Policy:'))
  .replace('Content-Security-Policy:', '').trim();

const server = http.createServer((req, res) => {
  const p = decodeURIComponent(req.url.split('?')[0].split('#')[0]);
  const file = path.join(root, p === '/' ? 'index.html' : p);
  fs.readFile(file, (e, d) => {
    if (e) { res.writeHead(404); res.end(); return; }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'text/plain', 'Content-Security-Policy': CSP });
    res.end(d);
  });
});
await new Promise((r) => server.listen(0, r));
const base = `http://localhost:${server.address().port}`;

const { browserType, launchOptions } = await launcher('chromium');
const browser = await browserType.launch({ ...launchOptions, headless: true });
const page = await browser.newPage();
const violations = [];
page.on('console', (m) => { if (/Content Security Policy|Refused to/.test(m.text())) violations.push(m.text().slice(0, 140)); });
page.on('pageerror', (e) => violations.push('pageerror: ' + e.message.slice(0, 140)));

for (const name of ['index', 'works', 'search', 'contact', 'work-untitled-poppy-i', 'catalogue']) {
  await page.goto(`${base}/${name}.html`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(600);
}
// exercise the interactive bits under CSP
await page.goto(`${base}/works.html`, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(700);
await page.click('[data-filter="coast"]');
await page.waitForTimeout(300);
await page.click('.work:not([hidden])');
await page.waitForTimeout(500);
const lightbox = await page.evaluate(() => document.querySelector('[data-lightbox]').classList.contains('is-open'));
await page.goto(`${base}/search.html?q=poppy`, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(900);
const results = await page.evaluate(() => document.querySelectorAll('.search-result').length);

console.log('policy:', CSP.slice(0, 90) + '…');
console.log('lightbox under CSP:', lightbox, '| search results:', results);
if (violations.length) {
  console.log('CSP VIOLATIONS:');
  [...new Set(violations)].forEach((line) => console.log('  ' + line));
  process.exit(1);
}
console.log('no CSP violations');
await browser.close();
server.close();
