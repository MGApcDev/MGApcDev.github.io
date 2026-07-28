#!/usr/bin/env node
/**
 * Write sitemap.xml and robots.txt from the page list, so they cannot fall
 * behind the site the way a hand-edited sitemap does.
 *
 *   node tools/build-sitemap.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PAGES } from './pages.mjs';
import { SITE } from './chrome.mjs';
import { sourceDate } from './source-date.mjs';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const indexable = PAGES.filter((name) => name !== '404');

/**
 * Last-modified per page, from git — see tools/source-date.mjs for why git and
 * not the filesystem. A generated page's real edit date is the date of the source
 * it came from, so ask about the content module (or the generator) rather than the
 * committed HTML, whose mtime changes on every rebuild. A source that is not yet
 * committed has no date, so a page added and generated in the same breath ships
 * without lastmod — rerun the build after committing; `build.mjs --check` catches
 * it.
 */
const lastModified = (name) => {
  const candidates = [
    `tools/content/${name}.mjs`,
    name.startsWith('work-') ? 'tools/works-data.mjs' : null,
    `${name}.html`,
  ].filter(Boolean);
  for (const candidate of candidates) {
    if (!fs.existsSync(path.join(root, candidate))) continue;
    const stamp = sourceDate(candidate);
    if (stamp) return stamp;
  }
  return null;
};

fs.writeFileSync(path.join(root, 'sitemap.xml'),
  '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
  indexable.map((name) => {
    const stamp = lastModified(name);
    return `  <url><loc>${SITE}${name === 'index' ? '' : name + '.html'}</loc>${stamp ? `<lastmod>${stamp}</lastmod>` : ''}</url>`;
  }).join('\n') +
  '\n</urlset>\n');

fs.writeFileSync(path.join(root, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${SITE}sitemap.xml\n`);

console.log(`wrote sitemap.xml (${indexable.length} urls) and robots.txt`);
