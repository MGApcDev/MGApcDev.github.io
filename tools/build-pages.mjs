#!/usr/bin/env node
/**
 * Assemble the hand-written pages from shared chrome plus their own body.
 *
 *   node tools/build-pages.mjs
 *
 * Bodies live in tools/content/<name>.mjs and export `meta` and `body`. Output
 * is committed HTML — this runs when content changes, not at deploy time.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { head, footer } from './chrome.mjs';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const contentDirectory = path.join(root, 'tools', 'content');

const files = fs.readdirSync(contentDirectory).filter((name) => name.endsWith('.mjs')).sort();
let written = 0;

for (const file of files) {
  const module = await import(path.join(contentDirectory, file));
  const name = file.replace(/\.mjs$/, '');
  const target = `${name}.html`;
  const meta = { current: target, ...module.meta };
  fs.writeFileSync(path.join(root, target), head(meta) + module.body + footer({ lightbox: Boolean(meta.lightbox), script: meta.script }));
  written++;
}

console.log(`wrote ${written} pages`);
