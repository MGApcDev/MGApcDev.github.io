#!/usr/bin/env node
/**
 * WCAG AA contrast audit for the whole site.
 *
 * Serve the site, then: node tools/audit-contrast.mjs http://localhost:8080
 * Reports every text node whose computed colour fails 4.5:1 (3:1 for large
 * text) against its effective background, in both light and dark schemes.
 * Text sitting on photography is skipped — the scrim decides that, not a token.
 */
import { chromium } from '/Users/mga/.npm/_npx/945f35517ce0271a/node_modules/@playwriter/patchright-core/index.mjs';
const exe = process.env.HOME + '/Library/Caches/ms-playwright/chromium-1228/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing';
const base = process.argv[2] || 'http://localhost:8080';
const pages = ['index','da','now','works','series','series-like-a-flower','series-gigantically-subtle','series-hour-of-gold','exhibitions','i-see-you','journal','prints','about','contact','404'];
const browser = await chromium.launch({ executablePath: exe, headless: true });

const AUDIT = () => {
  const parse = (value) => {
    const match = value.match(/rgba?\(([^)]+)\)/);
    if (!match) return null;
    const parts = match[1].split(/[,/]/).map((p) => parseFloat(p));
    return { r: parts[0], g: parts[1], b: parts[2], a: parts[3] === undefined ? 1 : parts[3] };
  };
  const luminance = ({ r, g, b }) => {
    const channel = (value) => { const v = value / 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
    return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
  };
  const over = (fg, bg) => ({ r: fg.r * fg.a + bg.r * (1 - fg.a), g: fg.g * fg.a + bg.g * (1 - fg.a), b: fg.b * fg.a + bg.b * (1 - fg.a), a: 1 });
  const effectiveBackground = (element) => {
    let node = element, stack = [];
    while (node && node !== document.documentElement.parentNode) {
      const color = parse(getComputedStyle(node).backgroundColor);
      if (color && color.a > 0) { stack.push(color); if (color.a === 1) break; }
      node = node.parentElement;
    }
    let result = { r: 255, g: 255, b: 255, a: 1 };
    for (let index = stack.length - 1; index >= 0; index--) result = over(stack[index], result);
    return result;
  };
  const ratio = (a, b) => { const la = luminance(a), lb = luminance(b); return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05); };
  const results = [];
  const selectors = 'p, h1, h2, h3, h4, a, li, dt, dd, td, th, summary, .eyebrow, .work__meta, .work__title, .filter, .button, .form__note, .timeline__when, .series-nav__label, .card__index, .exhibit__status, cite, figcaption';
  document.querySelectorAll(selectors).forEach((element) => {
    if (!element.textContent.trim()) return;
    const rect = element.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;
    const style = getComputedStyle(element);
    if (style.visibility === 'hidden' || style.opacity === '0') return;
    // Skip anything sitting on top of a photograph — the scrim, not a token, decides.
    let node = element, onImage = false;
    while (node && node !== document.body) {
      if (node.classList && (node.classList.contains('hero') || node.classList.contains('series-hero'))) { onImage = true; break; }
      node = node.parentElement;
    }
    if (onImage) return;
    const foreground = parse(style.color);
    if (!foreground) return;
    const background = effectiveBackground(element);
    const blended = over(foreground, background);
    const contrast = ratio(blended, background);
    const sizePx = parseFloat(style.fontSize);
    const bold = parseInt(style.fontWeight, 10) >= 700;
    const large = sizePx >= 24 || (bold && sizePx >= 18.66);
    const threshold = large ? 3 : 4.5;
    if (contrast < threshold) {
      results.push({
        selector: element.className || element.tagName.toLowerCase(),
        text: element.textContent.trim().slice(0, 40),
        color: style.color,
        contrast: Math.round(contrast * 100) / 100,
        threshold,
        sizePx,
      });
    }
  });
  return results;
};

const findings = {};
for (const scheme of ['light', 'dark']) {
  const context = await browser.newContext({ colorScheme: scheme });
  const page = await context.newPage();
  const bucket = [];
  for (const name of pages) {
    await page.goto(`${base}/${name}.html`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
    const issues = await page.evaluate(AUDIT);
    issues.forEach((issue) => bucket.push({ page: name, ...issue }));
  }
  // dedupe by selector+color+contrast
  const seen = new Set();
  findings[scheme] = bucket.filter((issue) => {
    const key = `${issue.selector}|${issue.color}|${issue.contrast}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  await context.close();
}
await browser.close();
console.log(JSON.stringify(findings, null, 1));
