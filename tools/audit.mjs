#!/usr/bin/env node
/**
 * One browser, one pass, every check.
 *
 *   node tools/audit.mjs                    # serves the working tree itself
 *   node tools/audit.mjs --only=contrast,meta
 *   node tools/audit.mjs http://localhost:8080
 *
 * One page load feeds every in-page check; extra contexts are opened only for
 * the modes that genuinely need one (dark, no-JS, reduced motion, forced
 * colours, 200% text, 320px). Exit code is 1 if anything failed, so this works
 * as a pre-publish gate.
 *
 * Measured on this machine, parallel lanes were *slower* than one (headless
 * Chromium contends for CPU), so the default is serial; --workers=N is there for
 * a bigger machine.
 */
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PAGES, SAMPLE, launcher } from './pages.mjs';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const only = (args.find((argument) => argument.startsWith('--only=')) || '').replace('--only=', '').split(',').filter(Boolean);
const wants = (name) => !only.length || only.includes(name);
const explicitBase = args.find((argument) => argument.startsWith('http'));
const workers = Number((args.find((argument) => argument.startsWith('--workers=')) || '').replace('--workers=', '')) || 1;
// --engine=webkit runs the same checks in a second engine. Everything this
// design leans on is supported in both, but that is worth re-proving rather than
// assuming after a change.
const engine = (args.find((argument) => argument.startsWith('--engine=')) || '').replace('--engine=', '') || 'chromium';

const MIME = {
  '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml',
  '.xml': 'application/xml', '.txt': 'text/plain', '.json': 'application/json',
};

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
let retries = 0;

/**
 * Navigate with retries. Long runs against this driver occasionally stall a
 * navigation indefinitely — a different page each time, and the same page loads
 * fine alone — so a hung goto is treated as driver flake, not a site fault.
 */
async function visit(holder, url) {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      await holder.page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });
      return holder.page;
    } catch (error) {
      if (!/Timeout|closed/.test(error.message) || attempt === 2) throw error;
      retries++;
      try { await holder.page.close(); } catch {}
      holder.page = await holder.context.newPage();
      await holder.page.setViewportSize(holder.viewport);
      if (holder.wire) holder.wire(holder.page);
    }
  }
  return holder.page;
}

/** Run `worker` over every item, optionally across several pages at once. */
async function sweep(context, items, worker, { viewport = { width: 1440, height: 950 }, wire } = {}) {
  const queue = [...items];
  const lanes = Array.from({ length: Math.min(workers, queue.length) }, async () => {
    const holder = { context, page: await context.newPage(), viewport, wire };
    await holder.page.setViewportSize(viewport);
    if (wire) wire(holder.page);
    while (queue.length) await worker(holder, queue.shift());
    await holder.page.close();
  });
  await Promise.all(lanes);
}

/* ------------------------------------------------------------------ in-page */
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

  const levels = Array.from(document.querySelectorAll('h1,h2,h3,h4')).map((heading) => Number(heading.tagName[1]));
  const headings = [];
  if (levels.filter((level) => level === 1).length !== 1) headings.push(`h1 count ${levels.filter((level) => level === 1).length}`);
  for (let index = 1; index < levels.length; index++) {
    if (levels[index] - levels[index - 1] > 1) headings.push(`h${levels[index - 1]}->h${levels[index]}`);
  }

  const attribute = (selector, key) => { const node = document.querySelector(selector); return node ? node.getAttribute(key) : null; };

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
    contrast, headings,
    meta: {
      title: document.title,
      description: attribute('meta[name="description"]', 'content'),
      ogTitle: attribute('meta[property="og:title"]', 'content'),
      ogImage: attribute('meta[property="og:image"]', 'content'),
      lang: document.documentElement.lang,
      jsonLd: Array.from(document.querySelectorAll('script[type="application/ld+json"]')).map((node) => node.textContent),
    },
    untaggedDanish: [...new Set(untagged)],
    localLinks: Array.from(document.querySelectorAll('a[href]')).map((anchor) => anchor.getAttribute('href')).filter((href) => href && !/^(https?:|mailto:|#)/.test(href)),
    imagesWithoutSize: Array.from(document.querySelectorAll('img[src]')).filter((image) => !image.getAttribute('width') || !image.getAttribute('height')).map((image) => image.getAttribute('src')),
  };
};

/* --------------------------------------------------------------------- run */
const { base, stop } = await serve();
const started = Date.now();
const { browserType, launchOptions } = await launcher(engine);
const browser = await browserType.launch({ ...launchOptions, headless: true });
const titles = new Map();
const descriptions = new Map();

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
  if (wants('images')) {
    result.imagesWithoutSize.forEach((src) => fail('images', `${name} ${src} has no width/height`));
    await page.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 900) { window.scrollTo(0, y); await new Promise((resolve) => setTimeout(resolve, 40)); } });
    await page.waitForTimeout(400);
    const broken = await page.$$eval('img[src]', (nodes) => nodes.filter((image) => image.naturalWidth === 0).map((image) => image.getAttribute('src')));
    broken.forEach((src) => fail('images', `${name} broken image ${src}`));
  }
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
}, { wire: wireConsole });

if (wants('responsive') || wants('targets')) {
  if (wants('responsive')) await sweep(mainContext, PAGES, async (holder, name) => {
    const page = await visit(holder, `${base}/${name}.html`);
    await page.waitForTimeout(100);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    if (overflow > 0) fail('responsive', `${name} overflows ${overflow}px at 320px`);
  }, { viewport: { width: 320, height: 720 } });

  if (wants('targets')) await (async () => {
  // WCAG 2.5.8: a control needs a 24x24 target. Links flowing inside prose are
  // exempt (the success criterion says so), but a link in a table cell, a
  // breadcrumb, or a nav is a standalone control and is not. Both of those were
  // real failures here — 20px catalogue rows and 21px crumbs — and neither is
  // visible in a screenshot, so it is measured on every page.
  await sweep(mainContext, PAGES, async (holder, name) => {
    const page = await visit(holder, `${base}/${name}.html`);
    await page.waitForTimeout(150);
    const small = await page.evaluate(() => {
      const found = [];
      document.querySelectorAll('a, button, input, select, summary, [tabindex="0"]').forEach((control) => {
        const box = control.getBoundingClientRect();
        if (!box.width || !box.height) return; // hidden, or a filtered-out card
        if (control.tagName === 'A' && control.closest('p, li, dd, figcaption, .lede, blockquote')) return;
        if (box.height < 24 || box.width < 24) {
          found.push(`${control.tagName.toLowerCase()}${control.className ? '.' + String(control.className).split(' ')[0] : ''} "${control.textContent.trim().slice(0, 20)}" ${Math.round(box.width)}x${Math.round(box.height)}`);
        }
      });
      return [...new Set(found)];
    });
    small.forEach((issue) => fail('targets', `${name} ${issue} — under 24x24`));
  }, { viewport: { width: 390, height: 844 } });
  })();

  // 200% text. This used to inject `html { font-size: 32px }` with addStyleTag,
  // which the site's own CSP now blocks — style-src is 'self' with no
  // unsafe-inline, so the check was throwing rather than measuring. Chrome's
  // font-size preference is set over CDP instead, which needs no inline style and
  // is closer to what a large-text user actually changes. Chromium only.
  if (wants('responsive') && engine === 'chromium') await sweep(mainContext, SAMPLE, async (holder, name) => {
    const session = await mainContext.newCDPSession(holder.page);
    await session.send('Page.setFontSizes', { fontSizes: { standard: 32, fixed: 26 } });
    const page = await visit(holder, `${base}/${name}.html`);
    await page.waitForTimeout(250);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    if (overflow > 0) fail('responsive', `${name} overflows ${overflow}px at 200% text`);
    await session.detach();
  }, { viewport: { width: 1024, height: 800 } });
  else if (wants('responsive')) console.log('  (200% text: chromium only — skipped)');
}
await mainContext.close();

if (wants('contrast')) {
  const dark = await browser.newContext({ colorScheme: 'dark' });
  await sweep(dark, PAGES, async (holder, name) => {
    const page = await visit(holder, `${base}/${name}.html`);
    await page.waitForTimeout(100);
    const result = await page.evaluate(IN_PAGE);
    result.contrast.forEach((issue) => fail('contrast', `${name} (dark) ${issue}`));
  });
  await dark.close();
}

if (wants('nojs')) {
  const noJs = await browser.newContext({ javaScriptEnabled: false });
  await sweep(noJs, SAMPLE, async (holder, name) => {
    const page = await visit(holder, `${base}/${name}.html`);
    await page.waitForTimeout(150);
    const state = await page.evaluate(() => ({
      invisible: Array.from(document.querySelectorAll('[data-reveal]')).filter((element) => getComputedStyle(element).opacity === '0').length,
      hiddenWorks: Array.from(document.querySelectorAll('.work')).filter((element) => element.offsetParent === null).length,
    }));
    if (state.invisible) fail('nojs', `${name} ${state.invisible} elements stuck at opacity 0`);
    if (state.hiddenWorks) fail('nojs', `${name} ${state.hiddenWorks} works not rendered`);
  });
  await noJs.close();
}

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
    hidden: Array.from(document.querySelectorAll('[data-reveal]')).filter((element) => getComputedStyle(element).opacity === '0').length,
  }));
  if (motion.animated) fail('modes', `${motion.animated} elements still animate under reduced motion`);
  if (motion.hidden) fail('modes', `${motion.hidden} reveals hidden under reduced motion`);
  await reduced.close();

  const forced = await browser.newContext({ forcedColors: 'active' });
  const forcedPage = await forced.newPage();
  await forcedPage.goto(`${base}/index.html`, { waitUntil: 'domcontentloaded' });
  await forcedPage.waitForTimeout(250);
  const plate = await forcedPage.evaluate(() => ({
    background: getComputedStyle(document.querySelector('.hero__body')).backgroundColor,
    veilHidden: getComputedStyle(document.querySelector('.hero__veil')).display === 'none',
  }));
  if (!plate.veilHidden) fail('modes', 'hero scrim still present under forced colours');
  if (plate.background === 'rgba(0, 0, 0, 0)') fail('modes', 'hero text has no plate under forced colours');
  await forced.close();
}

if (wants('keyboard')) {
  const keyboard = await browser.newPage();
  await keyboard.setViewportSize({ width: 1440, height: 950 });
  await keyboard.goto(`${base}/works.html`, { waitUntil: 'domcontentloaded' });
  await keyboard.waitForTimeout(400);
  await keyboard.click('[data-filter="mirror"]');
  await keyboard.waitForTimeout(300);
  const filtered = await keyboard.evaluate(() => {
    const hidden = Array.from(document.querySelectorAll('.work')).filter((work) => work.hidden);
    return { rendered: hidden.filter((work) => getComputedStyle(work).display !== 'none').length, focusable: hidden.filter((work) => work.offsetParent !== null).length };
  });
  if (filtered.rendered || filtered.focusable) fail('keyboard', `filtered works still rendered/focusable (${filtered.rendered}/${filtered.focusable})`);

  await keyboard.goto(`${base}/index.html`, { waitUntil: 'domcontentloaded' });
  await keyboard.waitForTimeout(300);
  if (engine === 'chromium') {
    // Safari excludes links from Tab order unless the user turns on full keyboard
    // access, so "first Tab lands on the skip link" is a Chromium-only assertion.
    // WebKit gets the equivalent check below: focus it and confirm it appears.
    await keyboard.keyboard.press('Tab');
    const first = await keyboard.evaluate(() => document.activeElement.className);
    if (!String(first).includes('skip-link')) fail('keyboard', `first tab stop is "${first}", expected the skip link`);
  }

  const hiddenTop = await keyboard.evaluate(() => {
    const link = document.querySelector('.skip-link');
    if (!link) return null;
    const top = link.getBoundingClientRect().top;
    link.focus();
    return top;
  });
  // The reveal is a 0.25s transition, so measure after it has run.
  await keyboard.waitForTimeout(500);
  const skipLink = hiddenTop === null ? { present: false } : await keyboard.evaluate((previousTop) => {
    const link = document.querySelector('.skip-link');
    return {
      present: true,
      focused: document.activeElement === link,
      revealed: link.getBoundingClientRect().top > previousTop,
      target: link.getAttribute('href'),
    };
  }, hiddenTop);
  if (!skipLink.present) fail('keyboard', 'no skip link');
  else {
    if (!skipLink.focused) fail('keyboard', 'skip link cannot take focus');
    if (!skipLink.revealed) fail('keyboard', 'skip link stays off-screen when focused');
    if (skipLink.target !== '#main') fail('keyboard', `skip link points at ${skipLink.target}, expected #main`);
  }

  await keyboard.goto(`${base}/works.html`, { waitUntil: 'domcontentloaded' });
  await keyboard.waitForTimeout(400);
  await keyboard.focus('.work');
  await keyboard.keyboard.press('Enter');
  await keyboard.waitForTimeout(400);
  if (!await keyboard.evaluate(() => document.querySelector('[data-lightbox]').classList.contains('is-open'))) fail('keyboard', 'Enter on a work did not open the viewer');
  await keyboard.keyboard.press('Tab');
  if (!await keyboard.evaluate(() => document.querySelector('[data-lightbox]').contains(document.activeElement))) fail('keyboard', 'focus escaped the open viewer');
  await keyboard.keyboard.press('Escape');
  await keyboard.waitForTimeout(300);
  if (!await keyboard.evaluate(() => document.activeElement.classList.contains('work'))) fail('keyboard', 'focus not restored after closing the viewer');
  await keyboard.close();
}

await browser.close();
stop();

if (wants('static')) {
  const { execFileSync } = await import('node:child_process');
  for (const tool of ['audit-html.mjs', 'audit-orphans.mjs', 'audit-feed.mjs']) {
    try {
      const output = execFileSync(process.execPath, [path.join(root, 'tools', tool)], { encoding: 'utf8' });
      if (tool === 'audit-html.mjs') {
        const parsed = JSON.parse(output);
        Object.entries(parsed.findings).forEach(([file, list]) => list.forEach((issue) => fail('html', `${file} ${issue}`)));
      }
      if (tool === 'audit-orphans.mjs') {
        const parsed = JSON.parse(output);
        ['unusedImages', 'unlinkedPages', 'unreachableFromHome', 'missingFromSitemap', 'staleInSitemap']
          .forEach((key) => parsed[key].forEach((entry) => fail('orphans', `${key}: ${entry}`)));
      }
    } catch (error) {
      fail('static', `${tool}: ${(error.stdout || error.message).toString().trim().split('\n').slice(0, 4).join(' ')}`);
    }
  }
}

const seconds = ((Date.now() - started) / 1000).toFixed(1);
const retryNote = retries ? `, ${retries} navigation ${retries === 1 ? 'retry' : 'retries'}` : '';

if (failures.length) {
  console.log(`FAIL — ${failures.length} issue(s) in ${seconds}s, ${engine}${retryNote}\n`);
  failures.forEach((line) => console.log('  ' + line));
  process.exit(1);
}
console.log(`PASS — ${PAGES.length} pages, no issues, ${seconds}s, ${engine}${retryNote}`);
