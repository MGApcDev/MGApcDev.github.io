#!/usr/bin/env node
/**
 * Static HTML sanity audit — no browser, no network.
 *
 *   node tools/audit-html.mjs
 *
 * Catches the mistakes a static site accumulates by hand-editing: duplicate ids,
 * broken id references (for, aria attributes, in-page links), missing alt, empty or
 * unlabelled links and buttons, tag-balance drift, and stray inline handlers.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const files = fs.readdirSync(root).filter((name) => name.endsWith('.html')).sort();
const VOID_TAGS = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr']);
const findings = {};

const add = (file, message) => {
  findings[file] = findings[file] || [];
  findings[file].push(message);
};

for (const file of files) {
  const markup = fs.readFileSync(path.join(root, file), 'utf8');
  const body = markup.replace(/<script[\s\S]*?<\/script>/g, '').replace(/<!--[\s\S]*?-->/g, '');

  // duplicate ids
  const ids = [...body.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1]);
  const seen = new Set();
  ids.forEach((id) => {
    if (seen.has(id)) add(file, `duplicate id "${id}"`);
    seen.add(id);
  });

  // references that must resolve to an id on the same page
  [...body.matchAll(/\s(?:for|aria-labelledby|aria-describedby|aria-controls)="([^"]+)"/g)].forEach((match) => {
    match[1].split(/\s+/).forEach((reference) => {
      if (reference && !seen.has(reference)) add(file, `dangling reference to #${reference}`);
    });
  });
  [...body.matchAll(/href="#([^"]+)"/g)].forEach((match) => {
    if (!seen.has(match[1])) add(file, `in-page link to missing #${match[1]}`);
  });

  // images need alt (empty alt is fine and means decorative)
  [...body.matchAll(/<img\b[^>]*>/g)].forEach((tag) => {
    if (!/\salt=/.test(tag[0])) add(file, `img without alt: ${tag[0].slice(0, 70)}`);
  });

  // links and buttons need an accessible name
  [...body.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/g)].forEach((match) => {
    const text = match[2].replace(/<[^>]+>/g, '').replace(/&[a-z]+;/gi, 'x').trim();
    const labelled = /aria-label=|aria-labelledby=|aria-hidden="true"/.test(match[1]);
    const hasImage = /<img\b/.test(match[2]);
    if (!text && !labelled && !hasImage) add(file, `link with no accessible name: ${match[0].slice(0, 70)}`);
    if (!/href=/.test(match[1])) add(file, `anchor without href: ${match[0].slice(0, 70)}`);
  });
  [...body.matchAll(/<button\b([^>]*)>([\s\S]*?)<\/button>/g)].forEach((match) => {
    const text = match[2].replace(/<[^>]+>/g, '').replace(/&[a-z#0-9]+;/gi, 'x').trim();
    if (!text && !/aria-label=/.test(match[1])) add(file, `button with no accessible name: ${match[0].slice(0, 70)}`);
  });

  // inline event handlers should not exist in this codebase
  [...body.matchAll(/\son[a-z]+="/g)].forEach((match) => add(file, `inline handler ${match[0].trim()}`));

  // tag balance for the containers most likely to drift
  ['div', 'section', 'ul', 'ol', 'li', 'a', 'button', 'main', 'figure', 'dl', 'table'].forEach((tag) => {
    const open = (body.match(new RegExp(`<${tag}\\b`, 'g')) || []).length;
    const close = (body.match(new RegExp(`</${tag}>`, 'g')) || []).length;
    if (open !== close && !VOID_TAGS.has(tag)) add(file, `unbalanced <${tag}>: ${open} open, ${close} close`);
  });

  // one main landmark, one h1
  const mains = (body.match(/<main\b/g) || []).length;
  if (mains !== 1) add(file, `expected 1 <main>, found ${mains}`);
  const h1s = (body.match(/<h1\b/g) || []).length;
  if (h1s !== 1) add(file, `expected 1 <h1>, found ${h1s}`);
}

const total = Object.values(findings).reduce((sum, list) => sum + list.length, 0);
console.log(JSON.stringify({ files: files.length, issues: total, findings }, null, 1));
