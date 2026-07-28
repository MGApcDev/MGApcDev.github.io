import { SITE, crumbs } from '../chrome.mjs';

export const meta = {
  title: 'I See You',
  description: 'I See You — an evening of eye gazing, mirror meditation and live music in Copenhagen, guided by Zenna Grundtvig.',
  image: 'assets/img/iseeyou-hero.svg',
  type: 'article',
  lightbox: true,
  graph: [
    {
      '@type': 'Event',
      '@id': SITE + 'i-see-you.html#event',
      name: 'I See You',
      description: 'Eye gazing, mirror meditation and live music — a deeply reflective journey.',
      image: SITE + 'assets/img/iseeyou-hero.svg',
      url: SITE + 'i-see-you.html',
      organizer: { '@id': SITE + '#zenna' },
      performer: { '@id': SITE + '#zenna' },
      eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
      location: { '@type': 'Place', name: 'Copenhagen', address: { '@type': 'PostalAddress', addressLocality: 'Copenhagen', addressCountry: 'DK' } },
      maximumAttendeeCapacity: 20,
      inLanguage: ['en', 'da'],
    },
    crumbs([{ name: 'Home', path: '' }, { name: 'Exhibitions', path: 'exhibitions.html' }, { name: 'I See You', path: 'i-see-you.html' }]),
  ],
};

const MOVEMENTS = [
  ['01 &mdash; Mirror', 'Meeting yourself', 'Twenty minutes with a hand mirror and no instruction beyond staying. Most people meet a stranger for the first ten and someone familiar for the last ten.'],
  ['02 &mdash; Eyes', 'Meeting one other', 'Paired, seated close, no talking. You will want to laugh at the start and you should &mdash; it passes. What comes after the laughing is the point.'],
  ['03 &mdash; Rest', 'Meeting nothing', 'Eyes closed, lying down, music only. Nothing is asked of you. This is where most of the evening actually lands.'],
];

const FRAMES = [
  ['iseeyou-01', 'From the room', 'Mirror', 'a soft figure in violet light, eyes lowered'],
  ['iseeyou-02', 'Held by sound', 'Rest', 'a figure turned toward warm dusk light'],
  ['iseeyou-03', 'Afterwards', 'Eyes', 'violet bloom opening from a lit centre'],
];

const FAQ = [
  ['Do I need experience with meditation?', 'No. Several people each time have never done anything like it. Experience mostly makes people expect a particular thing to happen, which is not an advantage.'],
  ['Can I come alone?', 'Most people do. You will be paired for the eye gazing, and pairs are drawn rather than chosen, so nobody has to find someone.'],
  ['What should I bring?', 'Warm socks and something soft to lie on if you have it. Everything else is in the room.'],
  ['Is this therapy?', 'No. I am a trained psychotherapist and that shapes how I hold the room, but the evening is not a session and is not a substitute for one. If you want to work individually, that is <a href="sessions.html">a session</a> instead.'],
  ['What if I need to stop?', 'You leave the exercise, sit at the side, and nobody comments. That happens most evenings and is completely fine.'],
];

export const body = `
  <section class="series-hero">
    <div class="series-hero__media">
      <img src="assets/img/iseeyou-hero.svg" alt="Placeholder artwork: two soft figures in warm violet light" width="1800" height="1000" fetchpriority="high" decoding="async">
    </div>
    <div class="shell series-hero__body">
      <nav class="crumbs" aria-label="Breadcrumb">
        <a href="exhibitions.html">Exhibitions</a> <span aria-hidden="true">/</span> <span>Gathering</span>
      </nav>
      <p class="eyebrow">Guided evening &middot; Copenhagen</p>
      <h1>I See You</h1>
      <p class="lede measure-44">Eye gazing, mirror meditation and live music &mdash; a deeply reflective journey, held in a small group.</p>
    </div>
  </section>

  <section class="section shell">
    <div class="split split--top">
      <div data-reveal>
        <p class="eyebrow">The evening</p>
        <h2>Three hours, no performance</h2>
        <p>We start seated, with music already playing, so nobody has to arrive into silence. Then three movements: looking at yourself in a mirror for longer than is comfortable, looking at one other person for longer than is comfortable, and then not looking at anything at all.</p>
        <p>Nothing is shared aloud unless you want to. There is no circle-of-introductions and no exercise you can do wrong. Musicians hold the room the whole way through, which is what makes the long looking bearable &mdash; sound gives you something to lean on when the eyes get heavy.</p>
        <p>People usually leave quieter than they came. That is the entire intention.</p>
      </div>
      <dl class="spec" data-reveal>
        <div><dt>Format</dt><dd>Guided evening, 3 hours</dd></div>
        <div><dt>Guided by</dt><dd>Zenna Grundtvig</dd></div>
        <div><dt>Music</dt><dd>Live, throughout</dd></div>
        <div><dt>Group</dt><dd>Maximum 20 people</dd></div>
        <div><dt>Where</dt><dd>Copenhagen</dd></div>
        <div><dt>Language</dt><dd>Danish and English</dd></div>
        <div><dt>Booking</dt><dd><a href="contact.html">By message</a></dd></div>
      </dl>
    </div>
  </section>

  <hr class="rule">

  <section class="section">
    <div class="shell">
      <div data-reveal class="section-intro">
        <p class="eyebrow" aria-hidden="true">How it runs</p>
        <h2><span class="visually-hidden">How it runs — </span>Three movements</h2>
      </div>
      <div class="cards">
${MOVEMENTS.map(([index, title, text]) => `        <article class="card" data-reveal>
          <span class="card__index">${index}</span>
          <h3>${title}</h3>
          <p class="quiet">${text}</p>
        </article>`).join('\n')}
      </div>
    </div>
  </section>

  <section class="section section--sand">
    <div class="shell">
      <div class="gallery" data-reveal>
${FRAMES.map(([slug, title, meta, alt]) => `        <a class="work" href="assets/img/${slug}.svg" data-lightbox-open="assets/img/${slug}.svg" data-caption="${title} — I See You">
          <span class="work__media"><img src="assets/img/${slug}.svg" alt="Placeholder artwork: ${alt}" width="1100" height="1400" loading="lazy" decoding="async"></span>
          <span class="work__caption"><span class="work__title">${title}</span><span class="work__meta">${meta}</span></span>
        </a>`).join('\n')}
      </div>
    </div>
  </section>

  <section class="section--tight section">
    <div class="shell shell--narrow" data-reveal>
      <blockquote class="pull-quote">
        You are not here to be understood.
        <cite>From the invitation</cite>
      </blockquote>
    </div>
  </section>

  <section class="section shell">
    <div data-reveal class="section-intro">
      <p class="eyebrow" aria-hidden="true">Before you come</p>
      <h2><span class="visually-hidden">Before you come — </span>Practical</h2>
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
      <a class="series-nav__link" href="exhibitions.html" data-reveal>
        <span class="series-nav__label">Back to</span>
        <span class="series-nav__title">Exhibitions &amp; gatherings</span>
      </a>
      <a class="series-nav__link series-nav__link--end" href="contact.html" data-reveal>
        <span class="series-nav__label">Next date</span>
        <span class="series-nav__title">Ask for a place</span>
      </a>
    </div>
  </section>
`;
