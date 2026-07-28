#!/usr/bin/env node
/**
 * Feed sanity: anchors resolve, XML is escaped, channel is complete, and the
 * item count still matches the notes on journal.html.
 *
 *   node tools/audit-feed.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..') + '/';
const feed = fs.readFileSync(root + 'feed.xml', 'utf8');
const journal = fs.readFileSync(root + 'journal.html', 'utf8');

const problems = [];
// well-formedness: every anchor the feed points at must exist on the page
const anchors = [...feed.matchAll(/<link>[^<]*#([^<]+)<\/link>/g)].map((match) => match[1]);
anchors.forEach((anchor) => {
  if (!journal.includes(`id="${anchor}"`)) problems.push(`feed links to missing anchor #${anchor}`);
});
// unescaped ampersands would break every reader
const bare = [...feed.matchAll(/&(?!amp;|lt;|gt;|quot;|apos;|#)/g)];
if (bare.length) problems.push(`${bare.length} unescaped ampersand(s)`);
// required channel elements
['<title>', '<link>', '<description>', 'atom:link'].forEach((tag) => {
  if (!feed.includes(tag)) problems.push(`channel missing ${tag}`);
});
// item count matches the notes on the page
const noteCount = (journal.match(/<article class="note"/g) || []).length;
const itemCount = (feed.match(/<item>/g) || []).length;
if (noteCount !== itemCount) problems.push(`${noteCount} notes on the page but ${itemCount} items in the feed`);

if (problems.length) {
  console.log('FEED ISSUES:\n' + problems.map((problem) => '  ' + problem).join('\n'));
  process.exit(1);
}
console.log(`feed clean — ${itemCount} items, ${anchors.length} anchors all resolve`);
