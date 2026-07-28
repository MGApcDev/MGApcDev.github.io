import { SITE, crumbs } from '../chrome.mjs';

export const meta = {
  title: 'Sessions',
  description: 'Psychotherapeutic sessions with Zenna Grundtvig — individual work in Copenhagen and online, trained at Dansk NLP Center, practising since 2018.',
  image: 'assets/img/sessions-hero.svg',
  graph: [
    {
      '@type': 'Service',
      '@id': SITE + 'sessions.html#service',
      name: 'Psychotherapy sessions',
      serviceType: 'Psychotherapy',
      provider: { '@id': SITE + '#zenna' },
      areaServed: { '@type': 'Place', name: 'Copenhagen and online' },
      availableLanguage: ['da', 'en'],
      url: SITE + 'sessions.html',
      offers: { '@type': 'Offer', price: '850', priceCurrency: 'DKK', description: '60-minute individual session' },
    },
    crumbs([{ name: 'Home', path: '' }, { name: 'About', path: 'about.html' }, { name: 'Sessions', path: 'sessions.html' }]),
  ],
};

const BRING = [
  ['01', 'Something ended', 'A relationship, a job, a version of yourself. The practical part is handled and the rest of it has nowhere to go.'],
  ['02', 'Stuck creatively', 'You used to make things. You still could. Something reliably stops you at the same point and you would like to know what.'],
  ['03', 'Running on effort', 'Everything works because you are holding it up. You are tired in a way that sleep does not touch.'],
  ['04', 'Wanting more contact', 'With yourself, with a partner, with your own body. Not a problem to solve &mdash; a direction to move in.'],
];

const FAQ = [
  ['How do we start?', 'A free fifteen-minute call, so you can hear my voice and I can hear what you are looking for. No obligation on either side afterwards.'],
  ['How many sessions will I need?', 'Unknowable at the start, and anyone who gives you a number is guessing. We review after four and decide together.'],
  ['Do you work online?', 'Yes, and it works better than people expect. Roughly half my clients are online, including several outside Denmark.'],
  ['Is it covered by insurance?', 'Some Danish health insurance covers psychotherapy with a registered practitioner. Check your own policy &mdash; I can supply receipts with the necessary details.'],
  ['What if I need to cancel?', 'More than 24 hours ahead, no charge. Inside 24 hours, the session is charged, except when something genuinely unavoidable happens.'],
  ['Is this the same as the gatherings?', 'No. <a href="i-see-you.html">I See You</a> and the circles are group evenings, not therapy. They share a way of paying attention; they are not a substitute for individual work.'],
];

export const body = `
  <section class="series-hero series-hero--short">
    <div class="series-hero__media">
      <img src="assets/img/sessions-hero.svg" alt="Placeholder artwork: soft green leaf shadows across a quiet wall" width="1800" height="1000" fetchpriority="high" decoding="async">
    </div>
    <div class="shell series-hero__body">
      <nav class="crumbs" aria-label="Breadcrumb">
        <a href="about.html">About</a> <span aria-hidden="true">/</span> <span>Practice</span>
      </nav>
      <p class="eyebrow">Psychotherapy &middot; Copenhagen &amp; online</p>
      <h1>Sessions</h1>
      <p class="lede measure-44">Individual work, one hour at a time, in a room where nothing has to be performed.</p>
    </div>
  </section>

  <section class="section shell">
    <div class="split split--top">
      <div data-reveal>
        <p class="eyebrow">The work</p>
        <h2>Staying with it long enough that it opens</h2>
        <p>I trained as a psychotherapist at <strong>Dansk NLP Center</strong> and have worked for myself since 2018. Most of the people who come to me are not in crisis. They are functioning, often very well, and something underneath has gone quiet or stuck.</p>
        <p>I do not give advice and I do not have a method I apply to everyone. What I do is keep the room steady enough that you can stop bracing &mdash; and then follow whatever surfaces once you have. Sometimes that is words. Often it is the body noticing something before the sentence arrives.</p>
        <p>Some people come for a handful of sessions around one specific thing. Others come every second week for a year. Both are normal; we decide as we go rather than at the start.</p>
      </div>
      <dl class="spec" data-reveal>
        <div><dt>Length</dt><dd>60 minutes</dd></div>
        <div><dt>Where</dt><dd>Copenhagen, or online</dd></div>
        <div><dt>Language</dt><dd>Danish or English</dd></div>
        <div><dt>Rhythm</dt><dd>Weekly, fortnightly, or as needed</dd></div>
        <div><dt>Price</dt><dd>850 kr. per session</dd></div>
        <div><dt>Reduced</dt><dd>Students &amp; low income: ask</dd></div>
        <div><dt>First step</dt><dd><a href="contact.html">A short call, free</a></dd></div>
      </dl>
    </div>
  </section>

  <hr class="rule">

  <section class="section">
    <div class="shell">
      <div data-reveal class="section-intro">
        <p class="eyebrow" aria-hidden="true">What people bring</p>
        <h2><span class="visually-hidden">What people bring — </span>Common ground</h2>
      </div>
      <div class="cards">
${BRING.map(([index, title, text]) => `        <article class="card" data-reveal>
          <span class="card__index">${index}</span>
          <h3>${title}</h3>
          <p class="quiet">${text}</p>
        </article>`).join('\n')}
      </div>
    </div>
  </section>

  <section class="section section--sand">
    <div class="shell">
      <div class="split">
        <div class="frame frame--wide" data-reveal>
          <img src="assets/img/sessions-room.svg" alt="Placeholder artwork: warm quiet wall with soft leaf shadows" width="1300" height="950" loading="lazy" decoding="async">
        </div>
        <div data-reveal>
          <p class="eyebrow">The room</p>
          <h2>What actually happens</h2>
          <p>We sit. You say where you are, or you do not and we start with that instead. There is no intake form and no diagnosis at the end.</p>
          <p>I will sometimes ask you to slow down mid-sentence, or to notice what your hands are doing. Not as a technique &mdash; because that is usually where the thing you came for is hiding.</p>
          <p>Everything said stays in the room. If I ever think another kind of help would serve you better, I will say so directly.</p>
        </div>
      </div>
    </div>
  </section>

  <section class="section shell">
    <div data-reveal class="section-intro">
      <p class="eyebrow">Practical</p>
      <h2>Before you write</h2>
    </div>
    <div class="faq" data-reveal>
${FAQ.map(([question, answer]) => `      <details>
        <summary>${question}</summary>
        <p>${answer}</p>
      </details>`).join('\n')}
    </div>
  </section>

  <section class="section--tight section section--sand">
    <div class="shell shell--narrow centred" data-reveal>
      <h2>If you are considering it</h2>
      <p class="centred-measure">Write a few lines about what is going on. You do not need to have it formulated &mdash; that is often the work itself.</p>
      <div class="button-row button-row--centred space-top-lg">
        <a class="button" href="contact.html">Book a first call</a>
      </div>
      <p class="form__note space-top-2xl">In an acute crisis, contact Livslinien on 70 201 201 or call 112. This page is not emergency support.</p>
    </div>
  </section>
`;
