#!/usr/bin/env node
/**
 * Reduced-motion, layout-shift, lang and image-dimension audit.
 *
 * Serve the site, then: node tools/audit-motion.mjs http://localhost:8080
 * Under prefers-reduced-motion nothing may animate and no reveal may sit at
 * opacity 0; CLS must be 0; Danish passages must carry lang="da"; every img
 * needs intrinsic width/height.
 */
import { chromium } from '/Users/mga/.npm/_npx/945f35517ce0271a/node_modules/@playwriter/patchright-core/index.mjs';
const exe = process.env.HOME + '/Library/Caches/ms-playwright/chromium-1228/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing';
const base = process.argv[2] || 'http://localhost:8080';
const pages = ['index','da','now','works','series','series-like-a-flower','series-gigantically-subtle','series-hour-of-gold','exhibitions','i-see-you','kvindecirkel','journal','prints','sessions','press','about','contact','search','colophon','404'];
const browser = await chromium.launch({ executablePath: exe, headless: true });
const report = { reducedMotion: {}, cls: {}, langIssues: {}, missingDims: {} };

// --- reduced motion: nothing may animate, and reveals must be visible immediately
const rmContext = await browser.newContext({ reducedMotion: 'reduce' });
const rmPage = await rmContext.newPage();
await rmPage.setViewportSize({ width: 1440, height: 950 });
for (const name of ['index', 'kvindecirkel', 'works']) {
  await rmPage.goto(`${base}/${name}.html`, { waitUntil: 'networkidle' });
  await rmPage.waitForTimeout(400);
  report.reducedMotion[name] = await rmPage.evaluate(() => {
    const longAnimations = Array.from(document.querySelectorAll('*')).filter((element) => {
      const style = getComputedStyle(element);
      const durations = (style.animationDuration + ',' + style.transitionDuration).split(',');
      return durations.some((duration) => parseFloat(duration) > 0.01);
    }).length;
    const hiddenReveals = Array.from(document.querySelectorAll('[data-reveal]')).filter((el) => getComputedStyle(el).opacity === '0').length;
    const smoothScroll = getComputedStyle(document.documentElement).scrollBehavior;
    return { longAnimations, hiddenReveals, smoothScroll };
  });
}
await rmContext.close();

// --- layout shift + lang + image dimension audit
const context = await browser.newContext();
const page = await context.newPage();
await page.setViewportSize({ width: 1440, height: 950 });
for (const name of pages) {
  await page.goto(`${base}/${name}.html`, { waitUntil: 'commit' });
  await page.evaluate(() => {
    window.__cls = 0;
    new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => { if (!entry.hadRecentInput) window.__cls += entry.value; });
    }).observe({ type: 'layout-shift', buffered: true });
  });
  await page.waitForLoadState('networkidle');
  await page.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 800) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 60)); } });
  await page.waitForTimeout(900);
  report.cls[name] = Math.round((await page.evaluate(() => window.__cls)) * 1000) / 1000;

  const audit = await page.evaluate(() => {
    const missingDims = Array.from(document.querySelectorAll('img[src]')).filter((img) => !img.getAttribute('width') || !img.getAttribute('height')).map((img) => img.getAttribute('src'));
    // Danish words that must not be read as English
    const danishMarkers = ['Kvindecirkel', 'Når død', 'Forårsjævndøgn', 'Sommersolhverv', 'Efterårsjævndøgn', 'Vintersolhverv', 'Der er kun én af dig', 'Noget slutter'];
    const untagged = [];
    danishMarkers.forEach((marker) => {
      document.querySelectorAll('h1,h2,h3,p,span,strong,li,dd,blockquote,a').forEach((element) => {
        if (!element.textContent.includes(marker)) return;
        if (element.children.length > 0 && !Array.from(element.childNodes).some((node) => node.nodeType === 3 && node.textContent.includes(marker))) return;
        // Walk to the root inclusive — a page-level lang="da" counts.
        let node = element, tagged = false;
        while (node) {
          if (node.getAttribute && node.getAttribute('lang') === 'da') { tagged = true; break; }
          if (node.getAttribute && node.getAttribute('lang') === 'en') break;
          node = node.parentElement;
        }
        if (!tagged) untagged.push(marker);
      });
    });
    return { missingDims, untagged: Array.from(new Set(untagged)) };
  });
  if (audit.missingDims.length) report.missingDims[name] = audit.missingDims;
  if (audit.untagged.length) report.langIssues[name] = audit.untagged;
}
await browser.close();
console.log(JSON.stringify(report, null, 1));
