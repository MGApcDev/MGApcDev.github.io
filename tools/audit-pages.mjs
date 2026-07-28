#!/usr/bin/env node
/**
 * Whole-site smoke test: links, images, console errors, mobile overflow, no-JS.
 *
 * Serve the site, then: node tools/audit-pages.mjs http://localhost:8080
 */
import { chromium } from '/Users/mga/.npm/_npx/945f35517ce0271a/node_modules/@playwriter/patchright-core/index.mjs';
import fs from 'node:fs';
const outDir = '/private/tmp/claude-345061440/-Users-mga-projects-zenna/2b07b412-bafb-4e7c-8370-8a4f1ff1f1bb/scratchpad';
const root = '/Users/mga/projects/zenna/';
const base = process.argv[2] || 'http://localhost:8080';
const exe = process.env.HOME + '/Library/Caches/ms-playwright/chromium-1228/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing';
const pages = ['index','da','now','works','series','series-like-a-flower','series-gigantically-subtle','series-hour-of-gold','exhibitions','i-see-you','kvindecirkel','journal','prints','sessions','press','about','contact','search','colophon','404'];

const browser = await chromium.launch({ executablePath: exe, headless: true });
const page = await browser.newPage();
const problems = [], brokenLinks = [], brokenImages = {}, overflow = {};
page.on('console', (m) => { if (m.type() === 'error') problems.push('console: ' + m.text()); });
page.on('pageerror', (e) => problems.push('pageerror: ' + e.message));

await page.setViewportSize({ width: 1440, height: 950 });
for (const name of pages) {
  await page.goto(`${base}/${name}.html`, { waitUntil: 'networkidle', timeout: 30000 });
  const links = await page.$$eval('a[href]', (n) => n.map((a) => a.getAttribute('href')).filter((h) => h && !/^(https?:|mailto:|#)/.test(h)));
  for (const href of new Set(links)) {
    const target = href.split('#')[0];
    if (target && !fs.existsSync(root + target)) brokenLinks.push(`${name} -> ${href}`);
  }
  await page.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 700) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 45)); } });
  await page.waitForTimeout(800);
  const broken = await page.$$eval('img[src]', (n) => n.filter((i) => i.naturalWidth === 0).map((i) => i.getAttribute('src')));
  if (broken.length) brokenImages[name] = broken;
}

await page.setViewportSize({ width: 390, height: 844 });
for (const name of pages) {
  await page.goto(`${base}/${name}.html`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(450);
  overflow[name] = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
}
await browser.close();

// --- no-JS pass: every work must remain visible and reachable
const noJsBrowser = await chromium.launch({ executablePath: exe, headless: true });
const noJsContext = await noJsBrowser.newContext({ javaScriptEnabled: false });
const noJsPage = await noJsContext.newPage();
const noJs = {};
for (const name of ['index','da','now','works','series-hour-of-gold','i-see-you','journal','prints']) {
  await noJsPage.goto(`${base}/${name}.html`, { waitUntil: 'load' });
  await noJsPage.waitForTimeout(400);
  noJs[name] = await noJsPage.evaluate(() => {
    const reveals = Array.from(document.querySelectorAll('[data-reveal]'));
    const invisible = reveals.filter((el) => getComputedStyle(el).opacity === '0').length;
    const works = Array.from(document.querySelectorAll('.work'));
    const hiddenWorks = works.filter((el) => el.hidden || el.offsetParent === null).length;
    return { reveals: reveals.length, invisible, works: works.length, hiddenWorks };
  });
}
await noJsBrowser.close();

// screenshots
const shotBrowser = await chromium.launch({ executablePath: exe, headless: true });
const shotPage = await shotBrowser.newPage();
await shotPage.emulateMedia({ colorScheme: 'light' });
await shotPage.setViewportSize({ width: 1440, height: 950 });
for (const [name, offset, label] of [['i-see-you', 0, 'iseeyou-top'], ['i-see-you', 1700, 'iseeyou-cards']]) {
  await shotPage.goto(`${base}/${name}.html`, { waitUntil: 'networkidle' });
  await shotPage.waitForTimeout(700);
  await shotPage.evaluate((y) => window.scrollTo(0, y), offset);
  await shotPage.waitForTimeout(1300);
  await shotPage.screenshot({ path: `${outDir}/v8-${label}.png` });
}
await shotBrowser.close();

console.log(JSON.stringify({ brokenLinks, brokenImages, problems, overflow, noJs }, null, 1));
