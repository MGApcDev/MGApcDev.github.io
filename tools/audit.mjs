#!/usr/bin/env node
/**
 * One browser, one pass, every check.
 *
 *   node tools/audit.mjs [baseUrl]          # serves itself if no URL given
 *   node tools/audit.mjs --only=contrast,meta
 *
 * The per-concern tools (audit-contrast.mjs and friends) each launched their own
 * browser and walked all twenty pages, so a full sweep meant twenty page loads
 * per tool and several minutes per run. This does one load per page in a shared
 * browser, runs every in-page check against that single load, and only spins up
 * extra contexts for the modes that genuinely need one (dark, no-JS, reduced
 * motion, forced colours, 200% text, 320px).
 *
 * Exit code is 1 if anything failed, so it works as a pre-publish gate.
 */
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from '/Users/mga/.npm/_npx/945f35517ce0271a/node_modules/@playwriter/patchright-core/index.mjs';
import { PAGES, SAMPLE, CHROMIUM } from './pages.mjs';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const only = (args.find((arg) => arg.startsWith('--only=')) || '').replace('--only=', '').split(',').filter(Boolean);
const wants = (name) => !only.length || only.includes(name);
const explicitBase = args.find((arg) => arg.startsWith('http'));

const MIME = {
  '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml',
  '.xml': 'application/xml', '.txt': 'text/plain', '.json': 'application/json',
};

/** Serve the working tree unless a URL was supplied. */
async function serve() {
  if (explicitBase) return { base: explicitBase, stop: () => {} };
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
  return { base: `http://localhost:${server.address().port}`, stop: () => server.close() };
}

const failures = [];
const fail = (area, detail) => failures.push(`${area}: ${detail}`);
const notes = [];
let retries = 0;

/**
 * Navigate with a retry. Long runs against this CDP driver occasionally stall a
 * navigation indefinitely — a different page each time, and the same page loads
 * fine on its own — so a hung goto is treated as driver flake, not a site fault.
 * The caller gets a fresh page if the first attempt times out.
 */
/**
 * Run `worker` over every item, optionally across several pages at once.
 *
 * Measured on this machine, four lanes was *slower* than one (1060s vs 943s for
 * the full sweep) — headless Chromium contends for CPU and every lane pays the
 * driver's per-call overhead anyway. So the default is one lane, and the pool
 * stays because `--workers=N` is useful on a bigger machine.
 */
const requestedWorkers = Number((args.find((arg) => arg.startsWith('--workers=')) || '').replace('--workers=', '')) || 1;

async function sweep(context, items, worker, { workers = requestedWorkers, viewport = { width: 1440, height: 950 }, wire } = {}) {
  const queue = [...items];
  const lanes = Array.from({ length: Math.min(workers, queue.length) }, async () => {
    const holder = { context, page: await context.newPage(), viewport, wire };
    await holder.page.setViewportSize(viewport);
    if (wire) wire(holder.page);
    while (queue.length) {
      const item = queue.shift();
      await worker(holder, item);
    }
    await holder.page.close();
  });
  await Promise.all(lanes);
}

async function visit(holder, url, options = {}) {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      await holder.page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000, ...options });
      return holder.page;
    } catch (error) {
      if (!/Timeout|closed/.test(error.message) || attempt === 2) throw error;
      retries++;
      try { await holder.page.close(); } catch {}
      holder.page = await holder.context.newPage();
      if (holder.viewport) await holder.page.setViewportSize(holder.viewport);
      if (holder.wire) holder.wire(holder.page);
    }
  }
  return holder.page;
}

/* ------------------------------------------------------------------ in-page */
// Serialised into the browser once and reused for every page.
const IN_PAGE = () => {
  const parse = (value) => {
    const match = value.match(/rgba?\(([^)]+)\)/);
    if (!match) return null;
    const parts = match[1].split(/[,/]/).map((part) => parseFloat(part));
    return { r: parts[0], g: parts[1], b: parts[2], a: parts[3] === undefined ? 1 : parts[3] };
  };
  const luminance = ({ r, g, b }) => {
    const channel = (value) => { const v = value / 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
    return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
  };
  const over = (fg, bg) => ({ r: fg.r * fg.a + bg.r * (1 - fg.a), g: fg.g * fg.a + bg.g * (1 - fg.a), b: fg.b * fg.a + bg.b * (1 - fg.a), a: 1 });
  const backgroundOf = (element) => {
    let node = element; const stack = [];
    while (node) {
      const colour = parse(getComputedStyle(node).backgroundColor);
      if (colour && colour.a > 0) { stack.push(colour); if (colour.a === 1) break; }
      node = node.parentElement;
    }
    let result = { r: 255, g: 255, b: 255, a: 1 };
    for (let index = stack.length - 1; index >= 0; index--) result = over(stack[index], result);
    return result;
  };
  const ratio = (a, b) => { const la = luminance(a), lb = luminance(b); return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05); };
  const onPhotograph = (element) => {
    let node = element;
    while (node && node !== document.body) {
      if (node.classList && (node.classList.contains('hero') || node.classList.contains('series-hero'))) return true;
      node = node.parentElement;
    }
    return false;
  };

  // contrast
  const contrast = [];
  document.querySelectorAll('p, h1, h2, h3, h4, a, li, dt, dd, td, th, summary, .eyebrow, .work__meta, .work__title, .filter, .button, .form__note, .timeline__when, .series-nav__label, .card__index, .exhibit__status, cite, figcaption').forEach((element) => {
    if (!element.textContent.trim() || onPhotograph(element)) return;
    const rect = element.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const style = getComputedStyle(element);
    if (style.visibility === 'hidden' || style.opacity === '0') return;
    const foreground = parse(style.color);
    if (!foreground) return;
    const background = backgroundOf(element);
    const value = ratio(over(foreground, background), background);
    const size = parseFloat(style.fontSize);
    const large = size >= 24 || (parseInt(style.fontWeight, 10) >= 700 && size >= 18.66);
    const threshold = large ? 3 : 4.5;
    if (value < threshold) contrast.push(`${(element.className || element.tagName).toString().slice(0, 30)} ${value.toFixed(2)}<${threshold}`);
  });

  // headings
  const levels = Array.from(document.querySelectorAll('h1,h2,h3,h4')).map((heading) => Number(heading.tagName[1]));
  const headings = [];
  if (levels.filter((level) => level === 1).length !== 1) headings.push(`h1 count ${levels.filter((l) => l === 1).length}`);
  for (let index = 1; index < levels.length; index++) {
    if (levels[index] - levels[index - 1] > 1) headings.push(`h${levels[index - 1]}->h${levels[index]}`);
  }

  // metadata
  const attribute = (selector, key) => { const node = document.querySelector(selector); return node ? node.getAttribute(key) : null; };
  const meta = {
    title: document.title,
    description: attribute('meta[name="description"]', 'content'),
    ogTitle: attribute('meta[property="og:title"]', 'content'),
    ogImage: attribute('meta[property="og:image"]', 'content'),
    lang: document.documentElement.lang,
    jsonLd: Array.from(document.querySelectorAll('script[type="application/ld+json"]')).map((node) => node.textContent),
  };

  // Danish that is not announced as Danish
  const danish = ['Kvindecirkel', 'Når død', 'Forårsjævndøgn', 'Sommersolhverv', 'Efterårsjævndøgn', 'Vintersolhverv', 'Der er kun én af dig', 'Noget slutter'];
  const untagged = [];
  danish.forEach((marker) => {
    document.querySelectorAll('h1,h2,h3,p,span,strong,li,dd,blockquote,a').forEach((element) => {
      if (!element.textContent.includes(marker)) return;
      if (element.children.length && !Array.from(element.childNodes).some((node) => node.nodeType === 3 && node.textContent.includes(marker))) return;
      let node = element, tagged = false;
      while (node) {
        if (node.getAttribute && node.getAttribute('lang') === 'da') { tagged = true; break; }
        if (node.getAttribute && node.getAttribute('lang') === 'en') break;
        node = node.parentElement;
      }
      if (!tagged) untagged.push(marker);
    });
  });

  return {
    contrast,
    headings,
    meta,
    untaggedDanish: [...new Set(untagged)],
    localLinks: Array.from(document.querySelectorAll('a[href]')).map((a) => a.getAttribute('href')).filter((href) => href && !/^(https?:|mailto:|#)/.test(href)),
    imagesWithoutSize: Array.from(document.querySelectorAll('img[src]')).filter((img) => !img.getAttribute('width') || !img.getAttribute('height')).map((img) => img.getAttribute('src')),
    overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
  };
};

const MEASURE_BROKEN_IMAGES = async (page) => {
  await page.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 900) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 40)); } });
  await page.waitForTimeout(500);
  return page.$$eval('img[src]', (nodes) => nodes.filter((img) => img.naturalWidth === 0).map((img) => img.getAttribute('src')));
};

/* --------------------------------------------------------------------- run */
const { base, stop } = await serve();
const started = Date.now();
const browser = await chromium.launch({ executablePath: CHROMIUM, headless: true });

const titles = new Map();
const descriptions = new Map();

// --- main pass: one load per page, light scheme, desktop
const mainContext = await browser.newContext();
const wireConsole = (target) => {
  target.on('pageerror', (error) => fail('console', error.message));
  target.on('console', (message) => { if (message.type() === 'error') fail('console', message.text()); });
};
await sweep(mainContext, PAGES, async (holder, name) => {
  const page = await visit(holder, `${base}/${name}.html`);
  await page.waitForTimeout(150);
  const result = await page.evaluate(IN_PAGE);

  if (wants('contrast')) result.contrast.forEach((issue) => fail('contrast', `${name} ${issue}`));
  if (wants('headings')) result.headings.forEach((issue) => fail('headings', `${name} ${issue}`));
  if (wants('lang')) result.untaggedDanish.forEach((word) => fail('lang', `${name} "${word}" not marked lang="da"`));
  if (wants('images')) result.imagesWithoutSize.forEach((src) => fail('images', `${name} ${src} has no width/height`));
  if (wants('links')) {
    for (const href of new Set(result.localLinks)) {
      const target = href.split('#')[0];
      if (target && !fs.existsSync(path.join(root, target))) fail('links', `${name} -> ${href}`);
    }
  }
  if (wants('meta')) {
    const { meta } = result;
    if (!meta.title) fail('meta', `${name} no title`);
    if (!meta.lang) fail('meta', `${name} no lang`);
    if (!meta.description) fail('meta', `${name} no description`);
    if (name !== '404' && (!meta.ogTitle || !meta.ogImage)) fail('meta', `${name} incomplete Open Graph`);
    if (titles.has(meta.title)) fail('meta', `${name} duplicate title of ${titles.get(meta.title)}`);
    else titles.set(meta.title, name);
    if (meta.description) {
      if (descriptions.has(meta.description)) fail('meta', `${name} duplicate description of ${descriptions.get(meta.description)}`);
      else descriptions.set(meta.description, name);
    }
    meta.jsonLd.forEach((raw) => {
      try {
        const parsed = JSON.parse(raw);
        (parsed['@graph'] || [parsed]).forEach((entity) => { if (!entity['@type']) fail('meta', `${name} JSON-LD entity without @type`); });
      } catch (error) { fail('meta', `${name} invalid JSON-LD: ${error.message}`); }
    });
  }
  if (wants('images')) {
    const broken = await MEASURE_BROKEN_IMAGES(page);
    broken.forEach((src) => fail('images', `${name} broken image ${src}`));
  }
}, { wire: wireConsole });

// --- narrow viewport, same context
if (wants('responsive')) {
  await sweep(mainContext, PAGES, async (holder, name) => {
    const narrow = await visit(holder, `${base}/${name}.html`);
    await narrow.waitForTimeout(100);
    const overflow = await narrow.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    if (overflow > 0) fail('responsive', `${name} overflows ${overflow}px at 320px`);
  }, { viewport: { width: 320, height: 720 } });

  // 200% text on a sample
  await sweep(mainContext, SAMPLE, async (holder, name) => {
    const zoomed = await visit(holder, `${base}/${name}.html`);
    await zoomed.addStyleTag({ content: 'html { font-size: 32px !important; }' });
    await zoomed.waitForTimeout(250);
    const overflow = await zoomed.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    if (overflow > 0) fail('responsive', `${name} overflows ${overflow}px at 200% text`);
  }, { viewport: { width: 1024, height: 800 } });
}

await mainContext.close();

// --- dark scheme contrast only
if (wants('contrast')) {
  const dark = await browser.newContext({ colorScheme: 'dark' });
  await sweep(dark, PAGES, async (holder, name) => {
    const darkPage = await visit(holder, `${base}/${name}.html`);
    await darkPage.waitForTimeout(100);
    const result = await darkPage.evaluate(IN_PAGE);
    result.contrast.forEach((issue) => fail('contrast', `${name} (dark) ${issue}`));
  });
  await dark.close();
}

// --- no JavaScript
if (wants('nojs')) {
  const noJs = await browser.newContext({ javaScriptEnabled: false });
  const noJsHolder = { context: noJs, page: await noJs.newPage(), viewport: { width: 1440, height: 950 } };
  await noJsHolder.page.setViewportSize(noJsHolder.viewport);
  for (const name of SAMPLE) {
    const noJsPage = await visit(noJsHolder, `${base}/${name}.html`);
    await noJsPage.waitForTimeout(150);
    const state = await noJsPage.evaluate(() => ({
      invisible: Array.from(document.querySelectorAll('[data-reveal]')).filter((el) => getComputedStyle(el).opacity === '0').length,
      hiddenWorks: Array.from(document.querySelectorAll('.work')).filter((el) => el.offsetParent === null).length,
    }));
    if (state.invisible) fail('nojs', `${name} ${state.invisible} elements stuck at opacity 0`);
    if (state.hiddenWorks) fail('nojs', `${name} ${state.hiddenWorks} works not rendered`);
  }
  await noJs.close();
}

// --- reduced motion and forced colours
if (wants('modes')) {
  const reduced = await browser.newContext({ reducedMotion: 'reduce' });
  const reducedPage = await reduced.newPage();
  await reducedPage.goto(`${base}/index.html`, { waitUntil: 'domcontentloaded' });
  await reducedPage.waitForTimeout(250);
  const motion = await reducedPage.evaluate(() => ({
    animated: Array.from(document.querySelectorAll('*')).filter((element) => {
      const style = getComputedStyle(element);
      return (style.animationDuration + ',' + style.transitionDuration).split(',').some((duration) => parseFloat(duration) > 0.01);
    }).length,
    hidden: Array.from(document.querySelectorAll('[data-reveal]')).filter((el) => getComputedStyle(el).opacity === '0').length,
  }));
  if (motion.animated) fail('modes', `${motion.animated} elements still animate under reduced motion`);
  if (motion.hidden) fail('modes', `${motion.hidden} reveals hidden under reduced motion`);
  await reduced.close();

  const forced = await browser.newContext({ forcedColors: 'active' });
  const forcedPage = await forced.newPage();
  await forcedPage.goto(`${base}/index.html`, { waitUntil: 'domcontentloaded' });
  await forcedPage.waitForTimeout(250);
  const plate = await forcedPage.evaluate(() => {
    const body = document.querySelector('.hero__body');
    return { background: getComputedStyle(body).backgroundColor, veilHidden: getComputedStyle(document.querySelector('.hero__veil')).display === 'none' };
  });
  if (!plate.veilHidden) fail('modes', 'hero scrim still present under forced colours');
  if (plate.background === 'rgba(0, 0, 0, 0)') fail('modes', 'hero text has no plate under forced colours');
  await forced.close();
}

// --- keyboard behaviour, on the pages that have the controls
if (wants('keyboard')) {
  const keyboard = await browser.newPage();
  await keyboard.setViewportSize({ width: 1440, height: 950 });
  await keyboard.goto(`${base}/works.html`, { waitUntil: 'domcontentloaded' });
  await keyboard.waitForTimeout(400);
  await keyboard.click('[data-filter="mirror"]');
  await keyboard.waitForTimeout(300);
  const filtered = await keyboard.evaluate(() => {
    const hidden = Array.from(document.querySelectorAll('.work')).filter((work) => work.hidden);
    return { rendered: hidden.filter((w) => getComputedStyle(w).display !== 'none').length, focusable: hidden.filter((w) => w.offsetParent !== null).length };
  });
  if (filtered.rendered || filtered.focusable) fail('keyboard', `filtered works still rendered/focusable (${filtered.rendered}/${filtered.focusable})`);

  await keyboard.goto(`${base}/index.html`, { waitUntil: 'domcontentloaded' });
  await keyboard.waitForTimeout(300);
  await keyboard.keyboard.press('Tab');
  const first = await keyboard.evaluate(() => document.activeElement.className);
  if (!String(first).includes('skip-link')) fail('keyboard', `first tab stop is "${first}", expected the skip link`);

  await keyboard.goto(`${base}/works.html`, { waitUntil: 'domcontentloaded' });
  await keyboard.waitForTimeout(400);
  await keyboard.focus('.work');
  await keyboard.keyboard.press('Enter');
  await keyboard.waitForTimeout(400);
  const opened = await keyboard.evaluate(() => document.querySelector('[data-lightbox]').classList.contains('is-open'));
  if (!opened) fail('keyboard', 'Enter on a work did not open the viewer');
  await keyboard.keyboard.press('Tab');
  const inside = await keyboard.evaluate(() => document.querySelector('[data-lightbox]').contains(document.activeElement));
  if (!inside) fail('keyboard', 'focus escaped the open viewer');
  await keyboard.keyboard.press('Escape');
  await keyboard.waitForTimeout(300);
  const restored = await keyboard.evaluate(() => document.activeElement.classList.contains('work'));
  if (!restored) fail('keyboard', 'focus not restored after closing the viewer');
  await keyboard.close();
}

await browser.close();
stop();

/* --------------------------------------------------------- static checks */
if (wants('static')) {
  const { execFileSync } = await import('node:child_process');
  for (const tool of ['audit-html.mjs', 'audit-orphans.mjs']) {
    const output = execFileSync(process.execPath, [path.join(root, 'tools', tool)], { encoding: 'utf8' });
    const parsed = JSON.parse(output);
    if (tool === 'audit-html.mjs' && parsed.issues) {
      Object.entries(parsed.findings).forEach(([file, list]) => list.forEach((issue) => fail('html', `${file} ${issue}`)));
    }
    if (tool === 'audit-orphans.mjs') {
      ['unusedImages', 'unlinkedPages', 'unreachableFromHome', 'missingFromSitemap', 'staleInSitemap'].forEach((key) => {
        parsed[key].forEach((entry) => fail('orphans', `${key}: ${entry}`));
      });
      notes.push(`${parsed.totals.pages} pages, ${parsed.totals.images} images`);
    }
  }
}

const seconds = ((Date.now() - started) / 1000).toFixed(1);
// Retries are reported, never swallowed: a run that needed several is telling
// you something even when every check passed.
const retryNote = retries ? `, ${retries} navigation ${retries === 1 ? 'retry' : 'retries'}` : '';
const scopeNote = notes.length ? ` (${notes.join('; ')})` : '';

if (failures.length) {
  console.log(`FAIL — ${failures.length} issue(s) in ${seconds}s${retryNote}\n`);
  failures.forEach((line) => console.log('  ' + line));
  process.exit(1);
}
console.log(`PASS — ${PAGES.length} pages, no issues, ${seconds}s${scopeNote}${retryNote}`);
