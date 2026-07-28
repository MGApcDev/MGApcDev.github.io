import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { SITE, crumbs } from '../chrome.mjs';

/**
 * A page describing the build should not be able to describe it wrongly. This said
 * "two small files" until search was removed and there was one — counted, not typed,
 * so deleting or adding a script updates the sentence.
 */
const COUNT_WORDS = ['no', 'one', 'two', 'three', 'four', 'five'];
const scriptCount = (() => {
  const directory = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..', 'assets', 'js');
  const files = fs.readdirSync(directory).filter((name) => name.endsWith('.js'));
  const word = COUNT_WORDS[files.length] || String(files.length);
  return `${word} small file${files.length === 1 ? '' : 's'}`;
})();

const styleCount = (() => {
  const directory = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..', 'assets', 'css');
  const files = fs.readdirSync(directory).filter((name) => name.endsWith('.css'));
  const word = COUNT_WORDS[files.length] || String(files.length);
  return `${word} stylesheet${files.length === 1 ? '' : 's'}`;
})();

export const meta = {
  title: 'Colophon',
  description: 'How this site is built: the Blomstring palette, the type, the motion rules, and the accessibility decisions behind it.',
  image: 'assets/img/work-06-sage.svg',
  graph: [
    { '@type': 'WebPage', '@id': SITE + 'colophon.html#page', name: 'Colophon', about: { '@id': SITE + '#zenna' }, url: SITE + 'colophon.html' },
    crumbs([{ name: 'Home', path: '' }, { name: 'Colophon', path: 'colophon.html' }]),
  ],
};

const SWATCHES = [
  ['#f6efe4', 'Sand', 'Page ground'],
  ['#ece0cf', 'Sand deep', 'Alternating sections'],
  ['#fffaf3', 'Paper', 'Cards, inputs'],
  ['#2a2622', 'Ink', 'Body text'],
  ['#695e50', 'Ink faint', 'Labels, meta'],
  ['#b33a2b', 'Poppy', 'The single accent'],
  ['#c9873a', 'Ochre', 'Warm secondary'],
  ['#7c8b6f', 'Sage', 'Botanical secondary'],
  ['#5b3f7a', 'Dusk', 'Cool secondary'],
];

const DECISIONS = [
  ['Motion is optional.', 'Under <code>prefers-reduced-motion</code> nothing animates, and no element sits at zero opacity waiting for a scroll listener.'],
  ['Reveals are gated on JavaScript.', 'A one-line inline script adds a <code>.js</code> class, so with scripting off the page is simply visible instead of blank.'],
  ['The gallery is a grid, not columns.', 'CSS multi-column filled column-by-column, which put ten of twelve works in a reading position that did not match tab order.'],
  ['Work cards are links.', 'Each points at the work&rsquo;s own page, so a click still does something useful without scripting, and cmd-click opens a new tab.'],
  ['Status is never colour alone.', 'Live and past states differ by border style and dot fill as well as hue.'],
  ['Images declare their size.', 'Every <code>img</code> carries intrinsic dimensions, so measured layout shift is zero on every page.'],
  ['The chrome is shared code.', 'Head, header and footer come from one module, so the nav on page thirty cannot drift from the nav on page one.'],
];

export const body = `
  <section class="section--tight section shell">
    <div data-reveal>
      <p class="eyebrow">Colophon</p>
      <h1 class="measure-13">How the site is put together</h1>
      <p class="lede measure-52">A theme called <em>Blomstring</em> &mdash; Danish for blossoming &mdash; drawn from the work itself: warm sand grounds, one poppy red, and a lot of air.</p>
    </div>
  </section>

  <hr class="rule">

  <section class="section shell">
    <div data-reveal class="section-intro">
      <p class="eyebrow" aria-hidden="true">Colour</p>
      <h2><span class="visually-hidden">Colour — </span>Nine tokens</h2>
      <p class="quiet">Every colour on the site is one of these. Each pairing was measured against WCAG AA in both light and dark, so nothing here is decided by eye alone.</p>
    </div>
    <ul class="swatches" data-reveal>
${SWATCHES.map(([hex, name, use]) => `      <li class="swatch"><span class="swatch__chip swatch__chip--${name.toLowerCase().replace(/ /g, '-')}"></span><span class="swatch__name">${name}</span><span class="swatch__value">${hex.toUpperCase()}</span><span class="swatch__use">${use}</span></li>`).join('\n')}
    </ul>
  </section>

  <section class="section section--sand">
    <div class="shell">
      <div data-reveal class="section-intro">
        <p class="eyebrow">Type</p>
        <h2>Two faces, no downloads</h2>
        <p class="quiet">Both stacks are fonts you already have. Nothing is fetched, so text paints immediately and there is no layout shift when a webfont lands.</p>
      </div>
      <div class="cards">
        <article class="card" data-reveal>
          <span class="card__index">Display</span>
          <h3>Iowan Old Style</h3>
          <p class="quiet">Falling back through Palatino, Book Antiqua and Georgia. High contrast, tight leading, only ever used large.</p>
          <p class="specimen">Blomstring</p>
        </article>
        <article class="card" data-reveal>
          <span class="card__index">Body</span>
          <h3>Avenir Next</h3>
          <p class="quiet">Falling back to the system sans. Set at 1.75 line-height with a 62-character measure.</p>
          <p class="flush">There&rsquo;s only one of you &mdash; enjoy it.</p>
        </article>
        <article class="card" data-reveal>
          <span class="card__index">Labels</span>
          <h3>Uppercase, 0.22em</h3>
          <p class="quiet">Eyebrows, buttons and meta share one treatment so small text always reads as navigation rather than content.</p>
          <p class="eyebrow flush">Photographic artist</p>
        </article>
      </div>
    </div>
  </section>

  <section class="section shell">
    <div class="split split--top">
      <div data-reveal>
        <p class="eyebrow">Decisions</p>
        <h2>Things that were fixed, not assumed</h2>
        <p>Most of the work on a site like this is invisible. These are the choices that were measured rather than guessed:</p>
        <ul class="decision-list">
${DECISIONS.map(([lead, rest]) => `          <li><strong>${lead}</strong> ${rest}</li>`).join('\n')}
        </ul>
      </div>
      <dl class="spec" data-reveal>
        <div><dt>Pages</dt><dd>Static HTML, assembled from shared chrome</dd></div>
        <div><dt>CSS</dt><dd>${styleCount.charAt(0).toUpperCase() + styleCount.slice(1)}, no framework</dd></div>
        <div><dt>JavaScript</dt><dd>${scriptCount.charAt(0).toUpperCase() + scriptCount.slice(1)}, no dependencies</dd></div>
        <div><dt>Build</dt><dd>Node scripts, output committed</dd></div>
        <div><dt>Requests</dt><dd>No third-party, no fonts, no trackers</dd></div>
        <div><dt>Images</dt><dd>Generated SVG placeholders</dd></div>
        <div><dt>Audits</dt><dd>Run headless before publishing</dd></div>
      </dl>
    </div>
  </section>

  <section class="section section--sand">
    <div class="shell shell--narrow" data-reveal>
      <p class="eyebrow">Credit where due</p>
      <h2>Photographs</h2>
      <p>Every image currently on this site is a generated placeholder, drawn in the theme palette so the layout can be judged before the real photographs are in. They are not artworks and should not be reproduced as such.</p>
      <p class="quiet">Text and photographs &copy; Zenna Lua. Site built to be handed over: no build step to deploy, no accounts, nothing to renew.</p>
      <div class="button-row space-top-lg">
        <a class="button" href="press.html">Press material</a>
        <a class="button" href="contact.html">Contact</a>
      </div>
    </div>
  </section>
`;
