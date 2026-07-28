#!/usr/bin/env node
/**
 * Keyboard, focus and heading-outline audit.
 *
 * Serve the site, then: node tools/audit-keyboard.mjs http://localhost:8080
 * Checks filtered works leave the tab order, the skip link is the first stop,
 * the lightbox traps and restores focus, FAQ summaries open on Enter, and no
 * page skips a heading level.
 */
import { chromium } from '/Users/mga/.npm/_npx/945f35517ce0271a/node_modules/@playwriter/patchright-core/index.mjs';
const exe = process.env.HOME + '/Library/Caches/ms-playwright/chromium-1228/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing';
const base = process.argv[2] || 'http://localhost:8080';
const browser = await chromium.launch({ executablePath: exe, headless: true });
const page = await browser.newPage();
await page.setViewportSize({ width: 1440, height: 950 });
const report = {};

// 1. filtered-out works must not render and must not be tabbable
await page.goto(`${base}/works.html`, { waitUntil: 'networkidle' });
await page.waitForTimeout(600);
await page.click('[data-filter="mirror"]');
await page.waitForTimeout(500);
report.filtered = await page.evaluate(() => {
  const works = Array.from(document.querySelectorAll('.work'));
  const hidden = works.filter((work) => work.hidden);
  return {
    totalWorks: works.length,
    hiddenAttr: hidden.length,
    stillRendered: hidden.filter((work) => getComputedStyle(work).display !== 'none').length,
    stillFocusable: hidden.filter((work) => work.offsetParent !== null).length,
  };
});

// tab from the last filter button — next stop must be a visible work
await page.focus('[data-filter="mirror"]');
const tabStops = [];
for (let index = 0; index < 4; index++) {
  await page.keyboard.press('Tab');
  tabStops.push(await page.evaluate(() => {
    const el = document.activeElement;
    return { tag: el.tagName.toLowerCase(), cls: (el.className || '').toString().slice(0, 30), hidden: !!el.hidden, text: (el.textContent || '').trim().slice(0, 28) };
  }));
}
report.tabAfterFilter = tabStops;

// 2. skip link reachable as the first tab stop from the top of the document
await page.goto(`${base}/index.html`, { waitUntil: 'networkidle' });
await page.waitForTimeout(500);
await page.keyboard.press('Tab');
report.firstTabStop = await page.evaluate(() => ({ cls: document.activeElement.className, text: document.activeElement.textContent.trim() }));
await page.keyboard.press('Enter');
await page.waitForTimeout(400);
report.skipTarget = await page.evaluate(() => location.hash);

// 3. lightbox opens by keyboard and traps focus, restores on close
await page.goto(`${base}/works.html`, { waitUntil: 'networkidle' });
await page.waitForTimeout(600);
await page.focus('.work');
await page.keyboard.press('Enter');
await page.waitForTimeout(700);
const trap = [];
for (let index = 0; index < 5; index++) {
  await page.keyboard.press('Tab');
  trap.push(await page.evaluate(() => {
    const el = document.activeElement;
    const inside = document.querySelector('[data-lightbox]').contains(el);
    return { inside, label: el.getAttribute('aria-label') || el.tagName };
  }));
}
report.focusTrap = { allInside: trap.every((stop) => stop.inside), stops: trap.map((stop) => stop.label) };
await page.keyboard.press('Escape');
await page.waitForTimeout(500);
report.focusRestored = await page.evaluate(() => document.activeElement.classList.contains('work'));
report.lightboxHiddenFromAT = await page.evaluate(() => document.querySelector('[data-lightbox]').getAttribute('aria-hidden'));

// 4. FAQ summaries operable by keyboard
await page.goto(`${base}/prints.html`, { waitUntil: 'networkidle' });
await page.waitForTimeout(500);
await page.focus('.faq summary');
await page.keyboard.press('Enter');
await page.waitForTimeout(300);
report.faqKeyboard = await page.$eval('.faq details', (node) => node.open);

// 5. heading order per page
const pages = ['index','da','now','works','series','series-like-a-flower','series-gigantically-subtle','series-hour-of-gold','exhibitions','i-see-you','kvindecirkel','journal','prints','sessions','press','about','contact','search','colophon','404'];
const headingIssues = {};
for (const name of pages) {
  await page.goto(`${base}/${name}.html`, { waitUntil: 'networkidle' });
  const issues = await page.evaluate(() => {
    const levels = Array.from(document.querySelectorAll('h1,h2,h3,h4')).map((h) => Number(h.tagName[1]));
    const problems = [];
    if (levels.filter((level) => level === 1).length !== 1) problems.push(`h1 count = ${levels.filter((l) => l === 1).length}`);
    for (let index = 1; index < levels.length; index++) {
      if (levels[index] - levels[index - 1] > 1) problems.push(`h${levels[index - 1]} -> h${levels[index]}`);
    }
    return problems;
  });
  if (issues.length) headingIssues[name] = issues;
}
report.headingIssues = headingIssues;

console.log(JSON.stringify(report, null, 1));
await browser.close();
