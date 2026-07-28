import { SITE, crumbs } from '../chrome.mjs';

export const meta = {
  title: 'Kvindecirkel',
  description: "Kvindecirkel — a seasonal women's circle in Copenhagen, held on the turning points of the year. Held in Danish.",
  image: 'assets/img/circle-hero.svg',
  type: 'article',
  lightbox: true,
  graph: [
    {
      '@type': 'Event',
      '@id': SITE + 'kvindecirkel.html#event',
      name: 'Kvindecirkel',
      description: "A seasonal women's circle held on the turning points of the year.",
      image: SITE + 'assets/img/circle-hero.svg',
      url: SITE + 'kvindecirkel.html',
      organizer: { '@id': SITE + '#zenna' },
      performer: { '@id': SITE + '#zenna' },
      eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
      location: { '@type': 'Place', name: 'Copenhagen', address: { '@type': 'PostalAddress', addressLocality: 'Copenhagen', addressCountry: 'DK' } },
      maximumAttendeeCapacity: 14,
      inLanguage: 'da',
      eventSchedule: { '@type': 'Schedule', repeatFrequency: 'P3M', description: 'Equinox and solstice' },
    },
    crumbs([{ name: 'Home', path: '' }, { name: 'Exhibitions', path: 'exhibitions.html' }, { name: 'Kvindecirkel', path: 'kvindecirkel.html' }]),
  ],
};

const TURNINGS = [
  ['March', 'For&aring;rsj&aelig;vnd&oslash;gn', 'Spring equinox. The first circle after winter, and always the loudest &mdash; everyone has something stored up.'],
  ['June', 'Sommersolhverv', 'Midsummer, held late and outdoors when the weather allows. The light does not really leave, so neither do we.'],
  ['September', 'Efter&aring;rsj&aelig;vnd&oslash;gn', 'Autumn equinox. The seed-head photographs come out. This one is usually about what is ending.'],
  ['December', 'Vintersolhverv', 'Winter solstice, candles only. The quietest of the four and the one people travel back for.'],
];

const PRINTS = [
  ['circle-01', 'Spring print', 'March', 'pale bloom on sage ground'],
  ['circle-02', 'Midsummer print', 'June', 'warm bloom against dusk violet'],
  ['circle-03', 'Autumn print', 'September', 'low sun over water in warm ochre'],
  ['circle-04', 'Solstice print', 'December', 'violet shadows across a pale wall'],
];

const FAQ = [
  ['Do I have to speak?', 'No. Passing is always an option and several people do it every time. Being in the room counts.'],
  ['My Danish is not good. Can I still come?', 'Yes. The circle runs in Danish but people switch to English without ceremony when someone needs it. Say so beforehand and I will make sure it happens.'],
  ['Is it religious or spiritual?', 'Neither, in any organised sense. We use the solstices and equinoxes because they are the honest markers of a Danish year, not because anything is being worshipped.'],
  ['Do I need to come to all four?', 'No. Some come once a year, some to every one. There is no membership and no ladder.'],
  ['What does it cost?', 'A contribution towards the room and the printing, usually around 150 kr. Nobody is turned away for that reason &mdash; say so and it is waived.'],
];

export const body = `
  <section class="series-hero">
    <div class="series-hero__media">
      <img src="assets/img/circle-hero.svg" alt="Placeholder artwork: a red bloom opening in warm light" width="1800" height="1000" fetchpriority="high" decoding="async">
    </div>
    <div class="shell series-hero__body">
      <nav class="crumbs" aria-label="Breadcrumb">
        <a href="exhibitions.html">Exhibitions</a> <span aria-hidden="true">/</span> <span>Gathering</span>
      </nav>
      <p class="eyebrow">Seasonal circle &middot; Copenhagen &middot; <span lang="da">Dansk</span></p>
      <h1 lang="da">Kvindecirkel</h1>
      <p class="lede measure-44">Four evenings a year, on the turning points &mdash; a circle of chairs, printed photographs passed hand to hand, and no agenda beyond being in the room.</p>
    </div>
  </section>

  <section class="section shell">
    <div class="split split--top">
      <div data-reveal>
        <p class="eyebrow">The circle</p>
        <h2>Images meant to be held, not hung</h2>
        <p>Everything else I make ends up on a wall at a fixed height. The circle is the opposite: I print a handful of frames from the seasonal work, and they go around the room, so people are looking down at something in their hands rather than up at something on display.</p>
        <p>We meet at equinox and solstice &mdash; four times a year, roughly. Ten to fourteen women, the same core group with room for new people each time. It runs in Danish, though nobody minds switching if someone needs it.</p>
        <p>There is tea, there is a long silence somewhere in the middle that nobody rushes, and everyone speaks who wants to. That is the whole structure.</p>
      </div>
      <dl class="spec" data-reveal>
        <div><dt>Rhythm</dt><dd>Four times a year</dd></div>
        <div><dt>When</dt><dd>Equinox and solstice</dd></div>
        <div><dt>Length</dt><dd>An evening, about 3 hours</dd></div>
        <div><dt>Group</dt><dd>10&ndash;14 women</dd></div>
        <div><dt>Where</dt><dd>Copenhagen</dd></div>
        <div><dt>Language</dt><dd><span lang="da">Dansk</span>, English if needed</dd></div>
        <div><dt>Joining</dt><dd><a href="contact.html">Ask for the next date</a></dd></div>
      </dl>
    </div>
  </section>

  <hr class="rule">

  <section class="section">
    <div class="shell">
      <div data-reveal class="section-intro">
        <p class="eyebrow" aria-hidden="true">The year</p>
        <h2><span class="visually-hidden">The year — </span>Four turnings</h2>
      </div>
      <div class="cards">
${TURNINGS.map(([month, name, text]) => `        <article class="card" data-reveal>
          <span class="card__index">${month}</span>
          <h3><span lang="da">${name}</span></h3>
          <p class="quiet">${text}</p>
        </article>`).join('\n')}
      </div>
    </div>
  </section>

  <section class="section section--sand">
    <div class="shell">
      <div class="sequence" data-reveal>
${PRINTS.map(([slug, title, meta, alt]) => `        <a class="work" href="assets/img/${slug}.svg" data-lightbox-open="assets/img/${slug}.svg" data-caption="${title} — passed around the circle">
          <span class="work__media"><img src="assets/img/${slug}.svg" alt="Placeholder artwork: ${alt}" width="1100" height="1100" loading="lazy" decoding="async"></span>
          <span class="work__caption"><span class="work__title">${title}</span><span class="work__meta">${meta}</span></span>
        </a>`).join('\n')}
      </div>
    </div>
  </section>

  <section class="section--tight section">
    <div class="shell shell--narrow" data-reveal>
      <blockquote class="pull-quote" lang="da">
        Der er kun &eacute;n af dig &mdash; nyd det.
        <cite lang="en">Zenna Lua</cite>
      </blockquote>
    </div>
  </section>

  <section class="section shell">
    <div data-reveal class="section-intro">
      <p class="eyebrow" aria-hidden="true">Before you join</p>
      <h2><span class="visually-hidden">Before you join — </span>Questions</h2>
    </div>
    <div class="faq" data-reveal>
${FAQ.map(([question, answer]) => `      <details>
        <summary>${question}</summary>
        <p>${answer}</p>
      </details>`).join('\n')}
    </div>
  </section>

  <hr class="rule">

  <section class="section shell">
    <div class="series-nav">
      <a class="series-nav__link" href="i-see-you.html" data-reveal>
        <span class="series-nav__label">Other gathering</span>
        <span class="series-nav__title">I See You</span>
      </a>
      <a class="series-nav__link series-nav__link--end" href="contact.html" data-reveal>
        <span class="series-nav__label">Next circle</span>
        <span class="series-nav__title">Ask for the date</span>
      </a>
    </div>
  </section>
`;
