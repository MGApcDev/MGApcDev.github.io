#!/usr/bin/env node
/**
 * Generate one page per work from tools/works-data.mjs.
 *
 *   node tools/build-work-pages.mjs
 *
 * Uses the same shared chrome as the hand-written pages, so the generated
 * twelve can never drift from the rest of the site.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { head, footer, crumbs, SITE } from './chrome.mjs';
import { WORKS, SERIES, workCard } from './works-data.mjs';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const escape = (text) => text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

WORKS.forEach((work, index) => {
  const series = SERIES[work.series];

  // Walk the series, not the whole gallery: stepping from the last Bloom work
  // into a Coast one told the reader nothing. Siblings are the rest of the
  // series, shown below so the sequence is browsable either way.
  const siblings = WORKS.filter((candidate) => candidate.series === work.series);
  const position = siblings.findIndex((candidate) => candidate.slug === work.slug);
  const previous = siblings[(position - 1 + siblings.length) % siblings.length];
  const next = siblings[(position + 1) % siblings.length];
  const others = siblings.filter((candidate) => candidate.slug !== work.slug);
  const lonely = siblings.length === 1;
  // With exactly two in a series, previous and next resolve to the same work —
  // two links to one page, which reads as a mistake. Send the second one out to
  // the gallery instead.
  const pair = siblings.length === 2;
  const file = `work-${work.slug}.html`;
  const [width, height] = work.size.split(' × ');

  const meta = {
    title: work.title,
    description: `${work.title} — ${series.title}. Archival pigment print, ${work.size}, edition of ${work.edition}.`,
    image: work.image,
    type: 'article',
    lightbox: true,
    graph: [
      {
        '@type': 'VisualArtwork',
        '@id': SITE + file + '#work',
        name: work.title,
        url: SITE + file,
        image: SITE + work.image,
        creator: { '@id': SITE + '#zenna' },
        artform: 'Photography',
        artMedium: 'Archival pigment print',
        width: width + ' cm',
        height,
        isPartOf: { '@type': 'CreativeWorkSeries', name: series.title, url: SITE + series.page },
        locationCreated: { '@type': 'Place', name: work.place },
      },
      crumbs([
        { name: 'Home', path: '' },
        { name: 'Works', path: 'works.html' },
        { name: work.title, path: file },
      ]),
    ],
  };

  const body = `
  <section class="section--tight section shell">
    <nav class="crumbs crumbs--dark" aria-label="Breadcrumb" data-reveal>
      <a href="works.html">Works</a> <span aria-hidden="true">/</span> <a href="${series.page}">${escape(series.label)}</a>
    </nav>

    <figure class="work-figure" data-reveal>
      <a class="work-figure__media" href="${work.image}" data-lightbox-open="${work.image}" data-caption="${escape(work.title)} — archival pigment print, ${work.size}">
        <img src="${work.image}" alt="${escape(work.alt)}" width="${work.width}" height="${work.height}" fetchpriority="high" decoding="async">
      </a>
      <figcaption>Click the frame to view it full size.</figcaption>
    </figure>
  </section>

  <section class="section shell section--flush">
    <div class="split split--top">
      <div data-reveal>
        <p class="eyebrow">${escape(series.label)} &middot; ${escape(work.year)}</p>
        <h1 class="title-md">${escape(work.title)}</h1>
        <p class="lede measure-44">${escape(work.note)}</p>
        <p class="quiet">Part of <a href="${series.page}">${escape(series.title)}</a>.</p>
        <div class="button-row space-top-lg">
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

${others.length ? `  <section class="section section--sand">
    <div class="shell">
      <div data-reveal class="section-intro">
        <p class="eyebrow">More from ${escape(series.title)}</p>
        <h2>${others.length} other work${others.length === 1 ? '' : 's'}</h2>
      </div>
      <div class="sequence sequence--wide">
${others.map((sibling) => workCard(sibling)).join('\n')}
      </div>
    </div>
  </section>

` : ''}  <hr class="rule">

  <section class="section shell">
    <div class="series-nav">
      <a class="series-nav__link" href="${lonely ? series.page : 'work-' + previous.slug + '.html'}" data-reveal>
        <span class="series-nav__label">${lonely ? 'Back to' : (pair ? 'Also in ' : 'Previous in ') + escape(series.label)}</span>
        <span class="series-nav__title">${escape(lonely ? series.title : previous.title)}</span>
      </a>
      <a class="series-nav__link series-nav__link--end" href="${lonely || pair ? 'works.html' : 'work-' + next.slug + '.html'}" data-reveal>
        <span class="series-nav__label">${lonely || pair ? 'All works' : 'Next in ' + escape(series.label)}</span>
        <span class="series-nav__title">${escape(lonely || pair ? 'Twelve quiet openings' : next.title)}</span>
      </a>
    </div>
  </section>
`;

  fs.writeFileSync(path.join(root, file), head(meta) + body + footer({ lightbox: true }));
});

console.log(`wrote ${WORKS.length} work pages`);
