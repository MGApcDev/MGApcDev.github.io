#!/usr/bin/env node
/**
 * Orphan audit — pure filesystem, no browser needed.
 *
 *   node tools/audit-orphans.mjs
 *
 * Reports generated images that no page references, pages nothing links to,
 * pages unreachable from the home page, and sitemap drift.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const htmlFiles = fs.readdirSync(root).filter((name) => name.endsWith('.html'));
const imageFiles = fs.readdirSync(path.join(root, 'assets', 'img'));

const sources = new Map(htmlFiles.map((name) => [name, fs.readFileSync(path.join(root, name), 'utf8')]));
const everything = [...sources.values()].join('\n');

const unusedImages = imageFiles.filter((image) => !everything.includes('assets/img/' + image));

const linkedFrom = new Map(htmlFiles.map((name) => [name, []]));
sources.forEach((markup, from) => {
  const hrefs = [...markup.matchAll(/href="([^"#?]+\.html)/g)].map((match) => match[1]);
  new Set(hrefs).forEach((target) => {
    if (linkedFrom.has(target) && target !== from) linkedFrom.get(target).push(from);
  });
});
// index.html is the root and 404.html is deliberately unlinked.
const expectedUnlinked = new Set(['index.html', '404.html']);
const unlinkedPages = [...linkedFrom.entries()]
  .filter(([name, from]) => from.length === 0 && !expectedUnlinked.has(name))
  .map(([name]) => name);

const reached = new Set(['index.html']);
const queue = ['index.html'];
while (queue.length) {
  const markup = sources.get(queue.shift()) || '';
  [...markup.matchAll(/href="([^"#?]+\.html)/g)].forEach((match) => {
    if (sources.has(match[1]) && !reached.has(match[1])) { reached.add(match[1]); queue.push(match[1]); }
  });
}
const unreachable = htmlFiles.filter((name) => !reached.has(name) && name !== '404.html');

const sitemapPath = path.join(root, 'sitemap.xml');
const sitemap = fs.existsSync(sitemapPath) ? fs.readFileSync(sitemapPath, 'utf8') : '';
const sitemapPages = [...sitemap.matchAll(/<loc>[^<]*?\/([^/<]*)<\/loc>/g)].map((match) => match[1] || 'index.html');
const indexable = htmlFiles.filter((name) => name !== '404.html' && !sources.get(name).includes('content="noindex"'));

console.log(JSON.stringify({
  totals: { pages: htmlFiles.length, images: imageFiles.length },
  unusedImages,
  unlinkedPages,
  unreachableFromHome: unreachable,
  missingFromSitemap: indexable.filter((name) => !sitemapPages.includes(name)),
  staleInSitemap: sitemapPages.filter((name) => !htmlFiles.includes(name)),
}, null, 1));
