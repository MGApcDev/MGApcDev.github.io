#!/usr/bin/env node
/**
 * Rasterise the social-card and favicon images.
 *
 *   node tools/build-social-images.mjs
 *
 * Every og:image on the site pointed at an SVG. Facebook, LinkedIn, iMessage and
 * most other unfurlers refuse SVG outright, so a shared link showed no picture at
 * all — on a photographer's site. This renders each card image to PNG at
 * 1200×630 (the size unfurlers crop to) plus the icon sizes, using the headless
 * browser that is already here for the audits.
 *
 * Cards are JPEG (unfurlers accept it, and the grain makes PNG enormous); the
 * icons stay PNG. Output goes to assets/social/ and is committed like any other
 * asset.
 */
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { launcher } from './pages.mjs';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const outputDirectory = path.join(root, 'assets', 'social');

/** Every image used as an og:image, plus the icon source. */
const CARDS = [
  'hero-bloom', 'bloom-hero', 'subtle-hero', 'coast-hero', 'exhibitions-hero',
  'iseeyou-hero', 'circle-hero', 'sessions-hero', 'about-portrait',
  'exhibition-bloom', 'work-01-poppy', 'work-03-shadow', 'work-06-sage',
  'work-08-bloom', 'work-11-clematis',
  ...fs.readFileSync(path.join(root, 'tools', 'works-data.mjs'), 'utf8')
    .match(/assets\/img\/([a-z0-9-]+)\.svg/g).map((match) => match.replace('assets/img/', '').replace('.svg', '')),
];

const ICONS = [['icon-512.png', 512], ['icon-192.png', 192], ['apple-touch-icon.png', 180]];

const server = http.createServer((request, response) => {
  const file = path.join(root, decodeURIComponent(request.url.split('?')[0]));
  fs.readFile(file, (error, data) => {
    if (error) { response.writeHead(404); response.end(); return; }
    response.writeHead(200, { 'Content-Type': file.endsWith('.svg') ? 'image/svg+xml' : 'text/html' });
    response.end(data);
  });
});
await new Promise((resolve) => server.listen(0, resolve));
const base = `http://localhost:${server.address().port}`;

fs.mkdirSync(outputDirectory, { recursive: true });
const { browserType, launchOptions } = await launcher('chromium');
const browser = await browserType.launch({ ...launchOptions, headless: true });
const page = await browser.newPage();

/** Fill the frame with the artwork, cropped like an unfurler would crop it. */
const shoot = async (slug, width, height, file, quality) => {
  await page.setViewportSize({ width, height });
  await page.setContent(
    `<style>html,body{margin:0;height:100%;background:#F6EFE4}
     img{width:100%;height:100%;object-fit:cover;display:block}</style>
     <img src="${base}/assets/img/${slug}.svg">`,
    { waitUntil: 'load' }
  );
  await page.waitForTimeout(120);
  await page.screenshot({
    path: path.join(outputDirectory, file),
    ...(quality ? { type: 'jpeg', quality } : {}),
  });
};

const unique = [...new Set(CARDS)];
// JPEG, not PNG: the grain in these images is noise, and PNG stores noise
// faithfully — the same cards were 700 kB each as PNG and are ~40 kB as JPEG.
for (const slug of unique) await shoot(slug, 1200, 630, `${slug}.jpg`, 82);
for (const [file, size] of ICONS) await shoot('work-01-poppy', size, size, file);

await browser.close();
server.close();

const total = fs.readdirSync(outputDirectory).reduce((sum, file) => sum + fs.statSync(path.join(outputDirectory, file)).size, 0);
console.log(`wrote ${unique.length} social cards + ${ICONS.length} icons to assets/social/ (${Math.round(total / 1024)} kB)`);
