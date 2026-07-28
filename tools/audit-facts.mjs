#!/usr/bin/env node
/**
 * Do the numbers on one page agree with the numbers on another?
 *
 *   node tools/audit-facts.mjs
 *
 * tools/works-data.mjs is the source for the gallery, the catalogue and the twelve
 * work pages, so those three cannot disagree. Prose written by hand can, and did:
 * the Prints page carried an edition column keyed to paper size, claiming 50x62 was
 * an edition of 15 where the catalogue has Afternoon Wall at that size in 8 sets,
 * 60x75 as 10 where the catalogue has the Bloom frames at 15, and a 90x120 size that
 * no work is printed at. It also offered "5 + 1 AP", an edition run that exists
 * nowhere in the work data at all.
 *
 * That last kind is what this catches: an edition figure stated in the rendered HTML
 * that the work data has never heard of. It is narrow on purpose. Whether a valid
 * figure is attached to the *right* work is not decidable from the text, which is
 * why the edition column came out of that table rather than being corrected — a
 * number that cannot be checked is better not restated.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PAGES } from './pages.mjs';
import { WORKS } from './works-data.mjs';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

/** Every edition run the work data knows about, e.g. "15 + 2 AP", "8 sets + 1 AP". */
const known = new Set(WORKS.map((work) => work.edition));

/** Matches an edition run as it is written throughout the site. */
const EDITION = /\b\d+(?:\s+sets)?\s*\+\s*\d+\s*AP\b/g;

const findings = [];

for (const name of PAGES) {
  const file = path.join(root, `${name}.html`);
  if (!fs.existsSync(file)) continue;
  const html = fs.readFileSync(file, 'utf8');
  const text = html
    .replace(/<script[\s\S]*?<\/script>/g, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&times;/g, 'x')
    .replace(/\s+/g, ' ');

  for (const match of new Set(text.match(EDITION) || [])) {
    const normalised = match.replace(/\s+/g, ' ').trim();
    if (!known.has(normalised)) {
      findings.push(`${name}: "${normalised}" is not an edition in works-data.mjs`);
    }
  }
}

if (findings.length) {
  console.log(`FAIL — ${findings.length} edition figure(s) that no work has\n`);
  findings.forEach((line) => console.log('  ' + line));
  console.log(`\nKnown runs: ${[...known].join(' | ')}`);
  console.log('Either the copy is wrong, or works-data.mjs is missing the work it describes.');
  process.exit(1);
}
console.log(`edition figures agree with works-data (${[...known].length} distinct runs across ${PAGES.length} pages)`);
