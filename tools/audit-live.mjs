#!/usr/bin/env node
/**
 * Check the deployed site, not the working tree.
 *
 *   node tools/audit-live.mjs                       # https://mgapcdev.github.io
 *   node tools/audit-live.mjs https://example.test  # somewhere else
 *
 * Local checks cannot see deploy-specific breakage. Two classes matter here:
 * GitHub Pages is case-sensitive where macOS is not, so a link to Works.html
 * works locally and 404s in production; and the host, not the repo, decides
 * status codes, content types and compression.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const base = (process.argv.find((argument) => argument.startsWith('http')) || 'https://mgapcdev.github.io').replace(/\/$/, '') + '/';
const problems = [];

// Everything the deployed pages reference internally.
const targets = new Set();
for (const page of fs.readdirSync(root).filter((name) => name.endsWith('.html'))) {
  const markup = fs.readFileSync(path.join(root, page), 'utf8');
  [...markup.matchAll(/(?:href|src)="([^"]+)"/g)]
    .map((match) => match[1])
    .filter((value) => !/^(https?:|mailto:|#|data:)/.test(value))
    .forEach((value) => { const clean = value.split('#')[0]; if (clean) targets.add(clean); });
}

for (const target of [...targets].sort()) {
  const response = await fetch(base + target, { method: 'HEAD' });
  if (response.status !== 200) problems.push(`${response.status} ${target}`);
}

// A missing page must return 404, not 200 with the home page.
const missing = await fetch(base + 'this-page-does-not-exist.html');
if (missing.status !== 404) problems.push(`a missing page returns ${missing.status}, expected 404`);
const missingBody = await missing.text();
if (!missingBody.includes('assets/css/style.css')) problems.push('the 404 response is not the styled 404 page');

// Text should arrive compressed; the stylesheet is the heaviest asset on the site.
const stylesheet = await fetch(base + 'assets/css/style.css');
if (!/gzip|br|deflate/.test(stylesheet.headers.get('content-encoding') || '')) {
  problems.push('assets/css/style.css is served uncompressed');
}

// Absolute Open Graph images, and they must actually exist on the host.
const home = await (await fetch(base)).text();
const card = (home.match(/og:image" content="([^"]+)"/) || [])[1] || '';
if (!card.startsWith('http')) problems.push(`og:image is relative (${card}) — unfurlers need an absolute URL`);
else if ((await fetch(card, { method: 'HEAD' })).status !== 200) problems.push(`og:image does not resolve: ${card}`);

// GitHub Pages cannot send the CSP, so it has to be in the document.
if (!home.includes('http-equiv="Content-Security-Policy"')) problems.push('no in-document Content-Security-Policy');

if (problems.length) {
  console.log(`${problems.length} issue(s) on ${base}`);
  problems.forEach((line) => console.log('  ' + line));
  process.exit(1);
}
console.log(`${base} — ${targets.size} references resolve, 404 works, text compressed, og:image absolute, CSP present`);
