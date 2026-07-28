import { SITE, crumbs } from '../chrome.mjs';
import { sourceDate, monthYear } from '../source-date.mjs';

// This page promises the reader it is current, so the stamp comes from the last
// commit that touched this file rather than from a typed-in month. If git cannot
// say, the page claims nothing instead of guessing.
const updatedIso = sourceDate('tools/content/now.mjs');
const updated = updatedIso
  ? ` &middot; updated <time datetime="${updatedIso}">${monthYear(updatedIso)}</time>`
  : '';

export const meta = {
  title: 'Now',
  description: 'What Zenna Lua is photographing, showing and holding at the moment — updated when something changes.',
  image: 'assets/img/work-08-bloom.svg',
  graph: [
    { '@type': 'WebPage', '@id': SITE + 'now.html#page', name: 'Now', about: { '@id': SITE + '#zenna' }, url: SITE + 'now.html', description: 'Current studio activity.' },
    crumbs([{ name: 'Home', path: '' }, { name: 'Now', path: 'now.html' }]),
  ],
};

const ON = [
  ['Most recent show', 'series-like-a-flower.html', 'Like a flower you shall bloom', 'Eighteen prints hung in Copenhagen from 23 April to 31 May. The work is still here, and still for sale as <a href="prints.html">prints</a>.'],
  ['Holding', 'i-see-you.html', 'I See You', 'Next evening is filling up. Twenty places, live music, three hours. Write if you want one.'],
  ['Open', 'sessions.html', 'A few session hours', 'Two slots free in the week, one online. A first call costs nothing and commits you to nothing.'],
];

const FEEDING = [
  ['Rereading letters.', 'Rilke, slowly, a page at a time before sessions.'],
  ['Learning the frame drum properly.', 'Badly, loudly, most mornings.'],
  ['Swimming at Amager until it gets stupid.', 'It has not got stupid yet. It will.'],
  ['Printing smaller.', 'Testing 30 &times; 40 as the default size rather than the exception.'],
];

export const body = `
  <section class="section--tight section shell">
    <div data-reveal>
      <p class="eyebrow">Now${updated}</p>
      <h1 class="measure-12">What I am doing at the moment</h1>
      <p class="lede measure-50">A page that is only ever true today. If it looks stale, it probably is &mdash; write and ask.</p>
    </div>
  </section>

  <hr class="rule">

  <section class="section shell">
    <div class="split split--top">
      <div data-reveal>
        <p class="eyebrow">Photographing</p>
        <h2>Seed heads, second summer</h2>
        <p>The poppies out past Greve went over three weeks ago, which is when they get interesting. I am back at the same field every few days photographing what is left: the capsules, the stems bent by rain, the one flower in every hundred that opened late and is still going.</p>
        <p>If it holds together it becomes a fourth series. If it does not, it becomes six good frames inside <a href="series-like-a-flower.html">the bloom work</a>, which is also fine.</p>
      </div>
      <div class="frame frame--tall" data-reveal>
        <img src="assets/img/work-08-bloom.svg" alt="Placeholder artwork: pale seed head opening on sage ground" width="1200" height="1200" loading="lazy" decoding="async">
      </div>
    </div>
  </section>

  <section class="section section--sand">
    <div class="shell">
      <div data-reveal class="section-intro">
        <p class="eyebrow" aria-hidden="true">On at the moment</p>
        <h2><span class="visually-hidden">On at the moment — </span>Three things</h2>
      </div>
      <div class="cards">
${ON.map(([index, href, title, text]) => `        <article class="card" data-reveal>
          <span class="card__index">${index}</span>
          <h3><a href="${href}">${title}</a></h3>
          <p class="quiet">${text}</p>
        </article>`).join('\n')}
      </div>
    </div>
  </section>

  <section class="section shell">
    <div class="split split--top">
      <div data-reveal>
        <p class="eyebrow">Reading and listening</p>
        <h2>Feeding the work</h2>
        <ul class="decision-list">
${FEEDING.map(([lead, rest]) => `          <li><strong>${lead}</strong> ${rest}</li>`).join('\n')}
        </ul>
      </div>
      <dl class="spec" data-reveal>
        <div><dt>In the studio</dt><dd>Seed-head work, fourth series maybe</dd></div>
        <div><dt>Next circle</dt><dd><span lang="da">Efter&aring;rsj&aelig;vnd&oslash;gn</span>, September</dd></div>
        <div><dt>Print queue</dt><dd>About two weeks</dd></div>
        <div><dt>Session slots</dt><dd>Two free this week</dd></div>
        <div><dt>Travelling</dt><dd>Nothing booked</dd></div>
        <div><dt>Nothing hanging</dt><dd>Until the next show is booked</dd></div>
        <div><dt>Open to</dt><dd>Exhibiting the shadow sequence</dd></div>
      </dl>
    </div>
  </section>

  <section class="section--tight section section--sand">
    <div class="shell shell--narrow centred" data-reveal>
      <h2>If any of that is for you</h2>
      <p class="centred-measure">A place at an evening, a session, a print, a wall to hang nine shadows on.</p>
      <div class="button-row button-row--centred space-top-lg">
        <a class="button" href="contact.html">Write to me</a>
      </div>
      <p class="form__note space-top-2xl">This page is placeholder copy, like the rest of the site.</p>
    </div>
  </section>
`;
