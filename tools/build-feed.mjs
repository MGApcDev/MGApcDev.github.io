#!/usr/bin/env node
/**
 * Build feed.xml from the notes in tools/content/journal.mjs.
 *
 *   node tools/build-feed.mjs [--date=2026-07-28]
 *
 * The notes are data now, so the feed reads the same source the page is built
 * from rather than scraping the rendered HTML. Entries carry no dates yet, so
 * items keep page order and the channel gets one build date — supplied by
 * --date, or the newest source mtime so reruns are stable.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { NOTES } from './content/journal.mjs';
import { SITE } from './chrome.mjs';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const dateArgument = (process.argv.find((argument) => argument.startsWith('--date=')) || '').replace('--date=', '');

const decode = (text) => text
  .replace(/&mdash;/g, '—').replace(/&ndash;/g, '–').replace(/&middot;/g, '·')
  .replace(/&rsquo;/g, '’').replace(/&lsquo;/g, '‘').replace(/&ldquo;/g, '“').replace(/&rdquo;/g, '”')
  .replace(/&oslash;/g, 'ø').replace(/&aring;/g, 'å').replace(/&aelig;/g, 'æ')
  .replace(/&Oslash;/g, 'Ø').replace(/&Aring;/g, 'Å').replace(/&AElig;/g, 'Æ')
  .replace(/&eacute;/g, 'é').replace(/&amp;/g, '&').replace(/<[^>]+>/g, '');

const escapeXml = (text) => text
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&apos;');

const newest = ['tools/content/journal.mjs', 'tools/build-feed.mjs']
  .map((file) => fs.statSync(path.join(root, file)).mtime)
  .sort((a, b) => b - a)[0];
const buildDate = (dateArgument ? new Date(dateArgument) : newest).toUTCString();

const items = NOTES.map((note) => `    <item>
      <title>${escapeXml(decode(note.title))}</title>
      <link>${SITE}journal.html#${note.slug}</link>
      <guid isPermaLink="false">${SITE}journal.html#${note.slug}</guid>
      <category>${escapeXml(decode(note.meta))}</category>
      <description>${escapeXml(note.paragraphs.map(decode).join('\n\n'))}</description>
    </item>`).join('\n');

fs.writeFileSync(path.join(root, 'feed.xml'), `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Zenna Lua — Words</title>
    <link>${SITE}journal.html</link>
    <atom:link href="${SITE}feed.xml" rel="self" type="application/rss+xml"/>
    <description>Short writing beside the photographs, in Danish and English.</description>
    <language>en</language>
    <lastBuildDate>${buildDate}</lastBuildDate>
${items}
  </channel>
</rss>
`);

console.log(`wrote feed.xml — ${NOTES.length} entries (${NOTES.filter((note) => note.lang === 'da').length} Danish)`);
