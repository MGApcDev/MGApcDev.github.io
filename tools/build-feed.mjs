#!/usr/bin/env node
/**
 * Build feed.xml from the notes on journal.html.
 *
 *   node tools/build-feed.mjs
 *
 * journal.html stays the source of truth — this reads the rendered notes rather
 * than introducing a second copy of the writing that could drift from it.
 * Entries carry no dates yet (the page has none), so items are ordered as they
 * appear and the channel gets a single build date supplied by --date=…, falling
 * back to the newest file mtime so reruns are stable.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const SITE = 'https://example.com/';
const dateArgument = (process.argv.find((argument) => argument.startsWith('--date=')) || '').replace('--date=', '');

const decode = (text) => text
  .replace(/&mdash;/g, '—').replace(/&ndash;/g, '–').replace(/&middot;/g, '·')
  .replace(/&rsquo;/g, '’').replace(/&lsquo;/g, '‘').replace(/&ldquo;/g, '“').replace(/&rdquo;/g, '”')
  .replace(/&oslash;/g, 'ø').replace(/&aring;/g, 'å').replace(/&aelig;/g, 'æ')
  .replace(/&Oslash;/g, 'Ø').replace(/&Aring;/g, 'Å').replace(/&AElig;/g, 'Æ')
  .replace(/&eacute;/g, 'é').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
  .replace(/&[a-z]+;/gi, ' ');

const escapeXml = (text) => text
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&apos;');

const journal = fs.readFileSync(path.join(root, 'journal.html'), 'utf8');
const notes = [...journal.matchAll(/<article class="note"[^>]*>([\s\S]*?)<\/article>/g)].map((match) => {
  const block = match[1];
  const meta = decode((block.match(/<p class="note__meta"[^>]*>([\s\S]*?)<\/p>/) || [, ''])[1].replace(/<[^>]+>/g, '')).trim();
  const title = decode((block.match(/<h2 class="note__title">([\s\S]*?)<\/h2>/) || [, ''])[1].replace(/<[^>]+>/g, '')).trim();
  const paragraphs = [...block.matchAll(/<p>([\s\S]*?)<\/p>/g)].map((paragraph) => decode(paragraph[1].replace(/<[^>]+>/g, '')).replace(/\s+/g, ' ').trim());
  const language = /Dansk/.test(meta) ? 'da' : 'en';
  return { title, meta, paragraphs, language };
}).filter((note) => note.title);

if (!notes.length) {
  console.error('No notes found in journal.html — feed not written.');
  process.exit(1);
}

const slug = (title) => title.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
  .replace(/ø/g, 'o').replace(/æ/g, 'ae').replace(/å/g, 'a')
  .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const newestSource = ['journal.html', 'tools/build-feed.mjs']
  .map((file) => fs.statSync(path.join(root, file)).mtime)
  .sort((a, b) => b - a)[0];
const buildDate = (dateArgument ? new Date(dateArgument) : newestSource).toUTCString();

const items = notes.map((note) => `    <item>
      <title>${escapeXml(note.title)}</title>
      <link>${SITE}journal.html#${slug(note.title)}</link>
      <guid isPermaLink="false">${SITE}journal.html#${slug(note.title)}</guid>
      <category>${escapeXml(note.meta)}</category>
      <description>${escapeXml(note.paragraphs.join('\n\n'))}</description>
    </item>`).join('\n');

const feed = `<?xml version="1.0" encoding="UTF-8"?>
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
`;

fs.writeFileSync(path.join(root, 'feed.xml'), feed);
console.log(`wrote feed.xml — ${notes.length} entries (${notes.filter((note) => note.language === 'da').length} Danish)`);
