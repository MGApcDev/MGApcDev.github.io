#!/usr/bin/env node
/**
 * Generate one page per work from tools/works-data.mjs.
 *
 *   node tools/build-work-pages.mjs
 *
 * The generated files are committed like any other page — this runs when the
 * work list changes, not at deploy time. Shared chrome (head, header, footer) is
 * lifted from an existing page so the twenty hand-written pages and the twelve
 * generated ones can never drift apart.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { WORKS, SERIES } from './works-data.mjs';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const SITE = 'https://example.com/';
const template = fs.readFileSync(path.join(root, 'colophon.html'), 'utf8');
const head = template.slice(0, template.indexOf('<main id="main">'));
const tail = template.slice(template.indexOf('</main>'));

const escape = (text) => text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

WORKS.forEach((work, index) => {
  const series = SERIES[work.series];
  const previous = WORKS[(index - 1 + WORKS.length) % WORKS.length];
  const next = WORKS[(index + 1) % WORKS.length];
  const file = `work-${work.slug}.html`;
  const description = `${work.title} — ${series.title}. Archival pigment print, ${work.size}, edition of ${work.edition}.`;

  const graph = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'VisualArtwork',
        '@id': SITE + file + '#work',
        name: work.title,
        url: SITE + file,
        image: SITE + work.image,
        creator: { '@id': SITE + '#zenna' },
        artform: 'Photography',
        artMedium: 'Archival pigment print',
        width: work.size.split(' × ')[0] + ' cm',
        height: work.size.split(' × ')[1],
        isPartOf: { '@type': 'CreativeWorkSeries', name: series.title, url: SITE + series.page },
        locationCreated: { '@type': 'Place', name: work.place },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: SITE },
          { '@type': 'ListItem', position: 2, name: 'Works', item: SITE + 'works.html' },
          { '@type': 'ListItem', position: 3, name: work.title, item: SITE + file },
        ],
      },
    ],
  };

  const pageHead = head
    .replace('<title>Colophon — Zenna Lua</title>', `<title>${escape(work.title)} — Zenna Lua</title>`)
    .replace(/<meta name="description"[^>]*>/, `<meta name="description" content="${escape(description)}">`)
    .replace('<meta property="og:title" content="Colophon — Zenna Lua">', `<meta property="og:title" content="${escape(work.title)} — Zenna Lua">`)
    .replace('<meta property="og:description" content="The palette, type and decisions behind this site.">', `<meta property="og:description" content="${escape(series.title)}. ${work.size}.">`)
    .replace('<meta property="og:image" content="assets/img/work-06-sage.svg">', `<meta property="og:image" content="${work.image}">`)
    .replace('<meta property="og:type" content="website">', '<meta property="og:type" content="article">')
    .replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/, `<script type="application/ld+json">\n${JSON.stringify(graph, null, 1)}\n</script>`);

  const main = `<main id="main">

  <section class="section--tight section shell">
    <nav class="crumbs crumbs--dark" aria-label="Breadcrumb" data-reveal>
      <a href="works.html">Works</a> <span aria-hidden="true">/</span> <a href="${series.page}">${escape(series.label)}</a>
    </nav>

    <figure class="work-figure" data-reveal>
      <a class="work-figure__media" href="${work.image}" data-lightbox-open="${work.image}" data-caption="${escape(work.title)} — archival pigment print, ${work.size}">
        <img src="${work.image}" alt="${escape(work.alt)}" width="1200" height="1500" fetchpriority="high" decoding="async">
      </a>
      <figcaption>Click the frame to view it full size.</figcaption>
    </figure>
  </section>

  <section class="section shell" style="padding-top:0;">
    <div class="split split--top">
      <div data-reveal>
        <p class="eyebrow">${escape(series.label)} &middot; ${escape(work.year)}</p>
        <h1 style="font-size:clamp(2rem,1.4rem+2.6vw,3.5rem);">${escape(work.title)}</h1>
        <p class="lede" style="max-width:44ch;">${escape(work.note)}</p>
        <p class="quiet">Part of <a href="${series.page}">${escape(series.title)}</a>.</p>
        <div class="button-row" style="margin-top:1.5rem;">
          <a class="button" href="prints.html">Order a print</a>
          <a class="button" href="works.html">All works</a>
        </div>
      </div>
      <dl class="spec" data-reveal>
        <div><dt>Series</dt><dd><a href="${series.page}">${escape(series.title)}</a></dd></div>
        <div><dt>Made</dt><dd>${escape(work.year)}</dd></div>
        <div><dt>Where</dt><dd>${escape(work.place)}</dd></div>
        <div><dt>Print</dt><dd>Archival pigment on cotton rag</dd></div>
        <div><dt>Size</dt><dd>${work.size}</dd></div>
        <div><dt>Edition</dt><dd>${escape(work.edition)}</dd></div>
        <div><dt>Enquire</dt><dd><a href="contact.html">About this frame</a></dd></div>
      </dl>
    </div>
  </section>

  <hr class="rule">

  <section class="section shell">
    <div class="series-nav">
      <a class="series-nav__link" href="work-${previous.slug}.html" data-reveal>
        <span class="series-nav__label">Previous work</span>
        <span class="series-nav__title">${escape(previous.title)}</span>
      </a>
      <a class="series-nav__link series-nav__link--end" href="work-${next.slug}.html" data-reveal>
        <span class="series-nav__label">Next work</span>
        <span class="series-nav__title">${escape(next.title)}</span>
      </a>
    </div>
  </section>

`;

  const lightbox = `
<div class="lightbox" data-lightbox aria-hidden="true" role="dialog" aria-modal="true" aria-label="Artwork viewer">
  <button class="lightbox__close" type="button" data-lightbox-close aria-label="Close viewer">&times;</button>
  <div class="lightbox__nav">
    <button type="button" data-lightbox-prev aria-label="Previous work">&larr;</button>
    <button type="button" data-lightbox-next aria-label="Next work">&rarr;</button>
  </div>
  <figure class="lightbox__figure">
    <img data-lightbox-image alt="">
    <figcaption class="lightbox__caption" data-lightbox-caption></figcaption>
    <p class="lightbox__counter" data-lightbox-counter></p>
  </figure>
</div>
`;

  const pageTail = tail.replace('<script src="assets/js/site.js"></script>', lightbox + '\n<script src="assets/js/site.js"></script>');
  fs.writeFileSync(path.join(root, file), pageHead + main + pageTail);
});

console.log(`wrote ${WORKS.length} work pages`);
