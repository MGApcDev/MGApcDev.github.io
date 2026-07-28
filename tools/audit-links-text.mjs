#!/usr/bin/env node
/**
 * Link-text audit.
 *
 *   node tools/audit-links-text.mjs
 *
 * Screen readers offer a list of every link on a page, read out of context, so
 * the words have to carry the destination on their own. Two failures matter:
 * text that says nothing ("here", "more"), and the same words pointing at
 * different places — which is worse, because it is invisible in review. This site
 * had three: "write to me" led to both contact and sessions, "Works" sometimes
 * landed on a filtered view, and "See the series" went to two different pages.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const WEAK = /^(here|more|read more|link|click here|this|see|all|learn more|→|click)$/;

const byText = new Map();
for (const page of fs.readdirSync(root).filter((name) => name.endsWith('.html'))) {
  const main = (fs.readFileSync(path.join(root, page), 'utf8').match(/<main[\s\S]*?<\/main>/) || [''])[0];
  [...main.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/g)].forEach((match) => {
    if (/aria-hidden="true"/.test(match[1])) return;
    const href = (match[1].match(/href="([^"]*)"/) || [, ''])[1];
    const text = match[2].replace(/<[^>]+>/g, '').replace(/&[a-z]+;/gi, ' ').replace(/\s+/g, ' ').trim().toLowerCase();
    if (!text) return;
    if (!byText.has(text)) byText.set(text, new Map());
    byText.get(text).set(href, (byText.get(text).get(href) || 0) + 1);
  });
}

const problems = [];
[...byText.entries()].forEach(([text, targets]) => {
  if (WEAK.test(text)) problems.push(`weak link text: "${text}"`);
  if (targets.size > 1) problems.push(`"${text}" points at ${[...targets.keys()].join(' and ')}`);
});

if (problems.length) {
  console.log(`${problems.length} issue(s):`);
  problems.forEach((line) => console.log('  ' + line));
  process.exit(1);
}
console.log(`${byText.size} distinct link texts, each mapping to one destination`);
