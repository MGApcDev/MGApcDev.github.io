#!/usr/bin/env node
/**
 * Build the client-side search index.
 *
 *   node tools/build-search-index.mjs
 *
 * Walks every page, strips markup, and writes assets/search-index.json — one
 * record per page plus one per work card, so a search for "poppy" finds the
 * frame as well as the page it sits on. Deterministic: same input, same file.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { WORKS } from './works-data.mjs';

// Works that have their own page are indexed as that page; indexing their
// gallery cards too would put the same frame in the results three times.
const WORKS_WITH_PAGES = new Set(WORKS.map((work) => work.title));

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const skip = new Set(['404.html', 'search.html']);

const decode = (text) => text
  .replace(/&mdash;/g, '—').replace(/&ndash;/g, '–').replace(/&middot;/g, '·')
  .replace(/&rsquo;/g, '’').replace(/&lsquo;/g, '‘').replace(/&ldquo;/g, '“').replace(/&rdquo;/g, '”')
  .replace(/&oslash;/g, 'ø').replace(/&aring;/g, 'å').replace(/&aelig;/g, 'æ')
  .replace(/&Oslash;/g, 'Ø').replace(/&Aring;/g, 'Å').replace(/&AElig;/g, 'Æ')
  .replace(/&eacute;/g, 'é').replace(/&times;/g, '×').replace(/&copy;/g, '©')
  .replace(/&rarr;/g, '→').replace(/&larr;/g, '←').replace(/&nbsp;/g, ' ')
  .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
  .replace(/&[a-z]+;/gi, ' ');

const stripped = (html) => decode(
  html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<header[\s\S]*?<\/header>/gi, ' ')
    .replace(/<footer[\s\S]*?<\/footer>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
).replace(/\s+/g, ' ').trim();

const records = [];
for (const file of fs.readdirSync(root).filter((name) => name.endsWith('.html')).sort()) {
  if (skip.has(file)) continue;
  const markup = fs.readFileSync(path.join(root, file), 'utf8');
  const title = decode((markup.match(/<title>([^<]*)<\/title>/) || [, file])[1]).replace(/ — Zenna Lua$/, '');
  const description = decode((markup.match(/<meta name="description" content="([^"]*)"/) || [, ''])[1]);
  const headings = [...markup.matchAll(/<h[1-3][^>]*>([\s\S]*?)<\/h[1-3]>/g)].map((match) => stripped(match[1])).filter(Boolean);
  const body = stripped((markup.match(/<main[\s\S]*?<\/main>/) || [, ''])[1] || '');

  records.push({
    type: 'page',
    url: file,
    title,
    summary: description,
    headings: headings.slice(0, 12),
    text: body.slice(0, 2600),
  });

  [...markup.matchAll(/<a class="work"[^>]*data-caption="([^"]*)"[^>]*>([\s\S]*?)<\/a>/g)].forEach((match) => {
    const caption = decode(match[1]);
    const inner = match[2];
    // The card's own title span, not the whole caption row — otherwise the
    // series tag ("Bloom") gets glued onto the work's name in results.
    const titleSpan = inner.match(/<span class="work__title">([\s\S]*?)<\/span>/);
    const series = (inner.match(/<span class="work__meta">([\s\S]*?)<\/span>/) || [, ''])[1];
    const name = stripped(titleSpan ? titleSpan[1] : caption);
    if (WORKS_WITH_PAGES.has(name)) return;
    const alt = (inner.match(/alt="([^"]*)"/) || [, ''])[1];
    records.push({
      type: 'work',
      url: file,
      title: name,
      summary: caption,
      headings: [stripped(series)].filter(Boolean),
      text: [caption, decode(alt)].join(' — '),
    });
  });
}

const output = { built: 'static', count: records.length, records };
fs.writeFileSync(path.join(root, 'assets', 'search-index.json'), JSON.stringify(output, null, 1) + '\n');
console.log(`wrote assets/search-index.json — ${records.length} records (${records.filter((r) => r.type === 'page').length} pages, ${records.filter((r) => r.type === 'work').length} works)`);
