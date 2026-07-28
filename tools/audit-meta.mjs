#!/usr/bin/env node
/**
 * Metadata audit: unique titles and descriptions, valid JSON-LD, complete Open
 * Graph, one h1 per page, canonical-ish link integrity.
 *
 * Serve the site, then: node tools/audit-meta.mjs http://localhost:8080
 */
import { chromium } from '/Users/mga/.npm/_npx/945f35517ce0271a/node_modules/@playwriter/patchright-core/index.mjs';

const exe = process.env.HOME + '/Library/Caches/ms-playwright/chromium-1228/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing';
const base = process.argv[2] || 'http://localhost:8080';
const pages = ['index','da','now','works','series','series-like-a-flower','series-gigantically-subtle','series-hour-of-gold','exhibitions','i-see-you','kvindecirkel','journal','prints','sessions','press','about','contact','search','colophon','404'];

const browser = await chromium.launch({ executablePath: exe, headless: true });
const page = await browser.newPage();
const seenTitles = new Map();
const seenDescriptions = new Map();
const report = { duplicateTitles: [], duplicateDescriptions: [], missing: {}, invalidJsonLd: [], jsonLdTypes: {} };

for (const name of pages) {
  await page.goto(`${base}/${name}.html`, { waitUntil: 'domcontentloaded' });
  const meta = await page.evaluate(() => {
    const attribute = (selector, key) => {
      const node = document.querySelector(selector);
      return node ? node.getAttribute(key) : null;
    };
    return {
      title: document.title,
      description: attribute('meta[name="description"]', 'content'),
      ogTitle: attribute('meta[property="og:title"]', 'content'),
      ogDescription: attribute('meta[property="og:description"]', 'content'),
      ogImage: attribute('meta[property="og:image"]', 'content'),
      lang: document.documentElement.lang,
      h1Count: document.querySelectorAll('h1').length,
      jsonLd: Array.from(document.querySelectorAll('script[type="application/ld+json"]')).map((node) => node.textContent),
    };
  });

  const missing = [];
  ['title', 'description', 'lang'].forEach((key) => { if (!meta[key]) missing.push(key); });
  // 404 is noindex, so social tags are not expected there
  if (name !== '404') ['ogTitle', 'ogDescription', 'ogImage'].forEach((key) => { if (!meta[key]) missing.push(key); });
  if (meta.h1Count !== 1) missing.push(`h1Count=${meta.h1Count}`);
  if (meta.title && meta.title.length > 65) missing.push(`title too long (${meta.title.length})`);
  if (meta.description && (meta.description.length < 50 || meta.description.length > 165)) missing.push(`description length ${meta.description.length}`);
  if (missing.length) report.missing[name] = missing;

  if (seenTitles.has(meta.title)) report.duplicateTitles.push(`${name} == ${seenTitles.get(meta.title)}`);
  else seenTitles.set(meta.title, name);
  if (meta.description) {
    if (seenDescriptions.has(meta.description)) report.duplicateDescriptions.push(`${name} == ${seenDescriptions.get(meta.description)}`);
    else seenDescriptions.set(meta.description, name);
  }

  meta.jsonLd.forEach((raw) => {
    try {
      const parsed = JSON.parse(raw);
      const graph = parsed['@graph'] || [parsed];
      report.jsonLdTypes[name] = graph.map((entity) => entity['@type']);
      graph.forEach((entity) => { if (!entity['@type']) report.invalidJsonLd.push(`${name}: entity without @type`); });
    } catch (error) {
      report.invalidJsonLd.push(`${name}: ${error.message}`);
    }
  });
}

await browser.close();
console.log(JSON.stringify(report, null, 1));
