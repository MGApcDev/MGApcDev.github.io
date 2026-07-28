#!/usr/bin/env node
/**
 * Drive the forms the way a visitor would and check what they actually produce.
 *
 *   node tools/audit-forms.mjs
 *   node tools/audit-forms.mjs --engine=webkit
 *
 * The contact form is the only way anyone reaches Zenna from this site, and it is
 * the piece most likely to break silently: a form posting to `mailto:` is dropped
 * by Chrome without a word, so the message is composed in JavaScript instead. If
 * that composition breaks, every page still renders, every other audit still
 * passes, and enquiries simply stop arriving. Nothing structural can see it —
 * only submitting the form can.
 *
 * The assertions are on the visible fallback link rather than on the navigation:
 * the script builds the same URL for both, and the link is what a visitor uses
 * when the mail app does not open, so checking it covers the more important half.
 */
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { launcher } from './pages.mjs';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const engine = (process.argv.find((argument) => argument.startsWith('--engine=')) || '').replace('--engine=', '') || 'chromium';

const MIME = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.json': 'application/json' };
const server = http.createServer((request, response) => {
  const urlPath = decodeURIComponent(request.url.split('?')[0].split('#')[0]);
  const file = path.join(root, urlPath === '/' ? 'index.html' : urlPath);
  fs.readFile(file, (error, data) => {
    if (error) { response.writeHead(404); response.end(); return; }
    response.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'text/plain' });
    response.end(data);
  });
});
await new Promise((resolve) => server.listen(0, resolve));
const base = `http://localhost:${server.address().port}`;

const failures = [];
const fail = (detail) => failures.push(detail);

const { browserType, launchOptions } = await launcher(engine);
const browser = await browserType.launch({ ...launchOptions, headless: true });
const page = await browser.newPage();
page.on('pageerror', (error) => fail(`page error: ${error.message}`));

/** The composed mail URL and the status text, read off the fallback link. */
const outcome = (selector) => page.evaluate((formSelector) => {
  const status = document.querySelector(`${formSelector} [data-form-status]`);
  const link = status && status.querySelector('a');
  return {
    text: status ? status.textContent.trim() : '',
    href: link ? decodeURIComponent(link.getAttribute('href')) : null,
    live: status ? status.getAttribute('aria-live') : null,
  };
}, selector);

// The contact form is the one without its own fixed subject.
const CONTACT = 'form[data-mailto-form]:not([data-subject])';
const NEWSLETTER = 'form[data-mailto-form][data-subject]';

await page.goto(`${base}/contact.html`, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(500);

// An empty submit must be stopped by validation, and must not compose anything.
await page.click(`${CONTACT} button[type="submit"]`);
await page.waitForTimeout(250);
const blocked = await outcome(CONTACT);
if (blocked.href) fail(`empty contact submit still composed a message: ${blocked.href.slice(0, 60)}`);
const required = await page.evaluate((selector) => document.querySelectorAll(`${selector} :invalid`).length, CONTACT);
if (required === 0) fail('contact form has no required fields — an empty message would send');

// A filled submit must compose a mail the recipient can act on.
await page.fill('#name', 'Test Person');
await page.fill('#email', 'test@example.com');
await page.selectOption('#subject', { index: 2 });
await page.fill('#message', 'Is Untitled (Poppy I) still available?');
await page.click(`${CONTACT} button[type="submit"]`);
await page.waitForTimeout(400);
const sent = await outcome(CONTACT);

if (!sent.href) fail('filled contact submit composed nothing — the form is dead');
else {
  if (!sent.href.startsWith('mailto:')) fail(`contact link is not a mailto: ${sent.href.slice(0, 50)}`);
  if (!/mailto:[^?]+@[^?]+\?/.test(sent.href)) fail(`contact mail has no recipient: ${sent.href.slice(0, 50)}`);
  // Everything the visitor typed has to survive into the message, or the mail
  // arrives without the thing it is about.
  for (const [label, value] of [['message', 'still available'], ['name', 'Test Person'], ['reply address', 'test@example.com']]) {
    if (!sent.href.includes(value)) fail(`contact mail drops the ${label}`);
  }
  if (!/subject=[^&]+/.test(sent.href)) fail('contact mail has an empty subject');
}
if (!sent.text) fail('contact form gives no feedback after submitting');
if (sent.live !== 'polite') fail(`contact status is aria-live="${sent.live}", expected polite`);

// The newsletter form carries its own subject and takes the address from its own
// field, which is a different path through the same handler.
await page.goto(`${base}/contact.html`, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(400);
await page.fill('#newsletter-email', 'reader@example.com');
await page.click(`${NEWSLETTER} button[type="submit"]`);
await page.waitForTimeout(400);
const signup = await outcome(NEWSLETTER);
if (!signup.href) fail('newsletter submit composed nothing');
else {
  if (!signup.href.includes('reader@example.com')) fail('newsletter mail drops the subscriber address');
  if (!/subject=Newsletter/i.test(signup.href)) fail(`newsletter mail has the wrong subject: ${signup.href.slice(0, 70)}`);
}

await browser.close();
server.close();

if (failures.length) {
  console.log(`FAIL — ${failures.length} issue(s), ${engine}\n`);
  failures.forEach((line) => console.log('  ' + line));
  process.exit(1);
}
console.log(`forms work — contact composes a full mail, newsletter its own, empty submit blocked (${engine})`);
