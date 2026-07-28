#!/usr/bin/env node
/**
 * Does the site still talk about the exhibition as though it were open?
 *
 *   node tools/audit-dates.mjs
 *
 * This is the mistake that keeps coming back. Three times now, copy written while a
 * show was up has been left in the present tense after it closed: an exhibition
 * listed as current, a "Now" page claiming a sea temperature from another season,
 * and a Visit page offering this week's opening hours for a room that had been
 * empty since May. The last one could have sent somebody across a city to a locked
 * door.
 *
 * It is not a layout fault or a markup fault, so no other audit here can see it.
 * What it is, precisely, is a claim about the present tense that stops being true on
 * a known date — and that is checkable, as long as the date exists somewhere a
 * program can read. tools/shows-data.mjs holds it.
 *
 * The phrase list is deliberately short and literal. The aim is not to parse English;
 * it is to catch the handful of stock phrases that promise an open door, and only
 * while the show they refer to is over. Open a new show, update `end`, and they are
 * allowed again — which is the right time to be reminded that they are claims.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PAGES } from './pages.mjs';
import { CURRENT_SHOW } from './shows-data.mjs';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

/**
 * Phrases that assert an exhibition is open right now. Matched case-insensitively
 * against the rendered text. Each is here because it appeared on this site while
 * being false, or is close enough to one that did.
 */
const PRESENT_TENSE = [
  'what is on',          // was the heading over a closed show on visit.html
  'artist present',      // who is in a room that has nothing in it
  'now showing',
  'currently showing',
  'currently on view',
  'on view now',
  'open today',
  'open now',
  'this week&rsquo;s hours',
  "this week's hours",
];

/**
 * Phrases that are about a *link* to the Now page rather than a claim of their own,
 * and so are exempt. "What is on today →" pointing at now.html is honest: it sends
 * the reader to the page that answers the question.
 */
const LINKED_TO_NOW = /what is on today/i;

const today = new Date().toISOString().slice(0, 10);
const closed = CURRENT_SHOW.end < today;

const findings = [];

for (const name of PAGES) {
  const file = path.join(root, `${name}.html`);
  if (!fs.existsSync(file)) continue;
  const html = fs.readFileSync(file, 'utf8');
  // Body text only: a phrase inside JSON-LD or a meta tag is not what a reader sees.
  const body = html.replace(/<script[\s\S]*?<\/script>/g, '').replace(/<head>[\s\S]*?<\/head>/g, '');
  const text = body.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');

  if (!closed) continue;

  // A label immediately before the closed show's title. "Now" on its own is far too
  // common a word for the phrase list — it is a page, a footer link and a heading —
  // but "Now" used as the label introducing this particular show is exactly the
  // about-page timeline entry that said a show closed in May was the current one.
  const titlePlain = CURRENT_SHOW.title.replace(/&[a-z]+;/g, ' ');
  let from = 0;
  for (;;) {
    const at = text.indexOf(titlePlain, from);
    if (at === -1) break;
    from = at + titlePlain.length;
    const before = text.slice(Math.max(0, at - 60), at);
    if (/\b(now|currently|on until|running)\b\s*$/i.test(before.trim() + ' ')) {
      findings.push(`${name}: "${CURRENT_SHOW.title}" is introduced by "${before.trim().split(/\s+/).pop()}" — it closed ${CURRENT_SHOW.end}`);
    }
  }

  for (const phrase of PRESENT_TENSE) {
    const at = text.toLowerCase().indexOf(phrase.toLowerCase());
    if (at === -1) continue;
    const context = text.slice(Math.max(0, at - 40), at + phrase.length + 40).trim();
    if (LINKED_TO_NOW.test(context)) continue;
    findings.push(`${name}: "${phrase}" — ${CURRENT_SHOW.title} closed ${CURRENT_SHOW.end}\n      …${context}…`);
  }
}

if (!closed) {
  console.log(`"${CURRENT_SHOW.title}" runs to ${CURRENT_SHOW.end} — present-tense exhibition copy is currently true`);
  process.exit(0);
}

if (findings.length) {
  console.log(`FAIL — ${findings.length} present-tense claim(s) about a show that closed ${CURRENT_SHOW.end}\n`);
  findings.forEach((line) => console.log('  ' + line));
  console.log('\nEither the copy needs the past tense, or tools/shows-data.mjs needs the new show.');
  process.exit(1);
}
console.log(`no page claims an open door — "${CURRENT_SHOW.title}" closed ${CURRENT_SHOW.end}, copy reads accordingly`);
