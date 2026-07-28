import { crumbs } from '../chrome.mjs';

export const meta = {
  title: 'Exhibitions & Gatherings',
  description: 'Exhibitions and guided gatherings by Zenna Lua — Like a flower you shall bloom, Gigantically Subtle, I See You, Kvindecirkel.',
  image: 'assets/img/exhibitions-hero.svg',
  graph: [crumbs([{ name: 'Home', path: '' }, { name: 'Exhibitions', path: 'exhibitions.html' }])],
};

const ENTRIES = [
  {
    image: ['assets/img/exhibition-bloom.svg', 1400, 900, 'red bloom on warm ochre, exhibition key image'],
    status: ['Most recent show', true],
    title: '<a href="series-like-a-flower.html">Like a flower you shall bloom</a>',
    body: ['A photo exhibition of macro botanicals made over three summers &mdash; poppy, clematis, hollyhock, and the seed heads that come after. Printed large, hung low, lit warm.',
           '<em>&ldquo;No flower denies its own blossoming.&rdquo;</em>'],
    facts: [['Dates', '23 April &ndash; 31 May'], ['Where', 'Copenhagen'], ['Works', '18 archival pigment prints'], ['Entry', 'Free'], ['Now', '<a href="now.html">What is on today &rarr;</a>'], ['Visiting', '<a href="visit.html">Hours, access, getting there &rarr;</a>']],
  },
  {
    image: ['assets/img/exhibition-subtle.svg', 1400, 900, 'leaf shadows on a sand-coloured wall'],
    status: ['Series &middot; ongoing', true],
    title: '<a href="series-gigantically-subtle.html">Gigantically Subtle</a>',
    body: ['An ongoing study of shadow: leaves thrown onto a plastered wall by afternoon sun, photographed at intervals until the light leaves. Shown as a sequence rather than as single images.'],
    facts: [['Format', 'Sequence of 9, hung as one line'], ['Where', 'Available for exhibition'], ['Status', 'In progress']],
  },
  {
    image: ['assets/img/exhibition-iseeyou.svg', 1400, 900, 'two soft figures in violet light'],
    status: ['Upcoming', false],
    title: '<a href="i-see-you.html">I See You</a>',
    body: ['Eye gazing, mirror meditation and live music &mdash; a deeply reflective journey. Held in a small group, guided by Zenna Grundtvig, with live musicians holding the room.',
           '<span class="quiet">Bring nothing. You are not here to be understood.</span>'],
    facts: [['Format', 'Guided evening, 3 hours'], ['Where', 'Copenhagen'], ['Group', 'Max 20 people'], ['Booking', '<a href="contact.html">By message</a>'], ['Details', '<a href="i-see-you.html">The full evening &rarr;</a>']],
  },
  {
    image: ['assets/img/circle-hero.svg', 1800, 1000, 'a red bloom opening in warm light'],
    status: ['Recurring', true],
    title: '<a href="kvindecirkel.html" lang="da">Kvindecirkel</a>',
    body: ['A women&rsquo;s circle held on the turning points of the year. Photographs from the seasonal series are printed and passed around the circle rather than hung &mdash; images meant to be held.'],
    facts: [['Rhythm', 'Seasonal'], ['Where', 'Copenhagen'], ['Language', 'Danish'], ['Details', '<a href="kvindecirkel.html">The circle &rarr;</a>']],
  },
];

const entries = ENTRIES.map((entry) => `
      <article class="exhibit" data-reveal>
        <div class="frame frame--wide exhibit__media">
          <img src="${entry.image[0]}" alt="Placeholder artwork: ${entry.image[3]}" width="${entry.image[1]}" height="${entry.image[2]}" loading="lazy" decoding="async">
        </div>
        <div>
          <p class="exhibit__status${entry.status[1] ? ' exhibit__status--past' : ''}">${entry.status[0]}</p>
          <h2>${entry.title}</h2>
${entry.body.map((paragraph) => `          <p>${paragraph}</p>`).join('\n')}
          <dl class="exhibit__facts">
${entry.facts.map(([term, value]) => `            <div><dt>${term}</dt><dd>${value}</dd></div>`).join('\n')}
          </dl>
        </div>
      </article>`).join('\n');

export const body = `
  <section class="series-hero series-hero--short">
    <div class="series-hero__media">
      <img src="assets/img/exhibitions-hero.svg" alt="Placeholder artwork: a bloom opening in violet and warm dusk light" width="1800" height="950" fetchpriority="high" decoding="async">
    </div>
    <div class="shell series-hero__body">
      <p class="eyebrow">Exhibitions &amp; gatherings</p>
      <h1 class="measure-16">Where the work<br>meets people</h1>
      <p class="lede measure-46">Some of it hangs on a wall. Some of it happens in a room with music, a mirror and a circle of chairs. Both are the same practice.</p>
    </div>
  </section>

  <section class="section">
    <div class="shell">
${entries}
    </div>
  </section>

  <section class="section section--sand">
    <div class="shell">
      <div data-reveal class="section-intro">
        <p class="eyebrow" aria-hidden="true">Archive</p>
        <h2><span class="visually-hidden">Archive — </span>Previously</h2>
      </div>
      <ul class="timeline" data-reveal>
        <li>
          <span class="timeline__when">Spring</span>
          <span class="timeline__what"><strong lang="da">N&aring;r d&oslash;d ligner f&oslash;dsel</strong><span>Evening of images and text on endings that look like beginnings. Copenhagen.</span></span>
        </li>
        <li>
          <span class="timeline__when">Autumn</span>
          <span class="timeline__what"><strong>Hello Creator</strong><span>Workshop for people making things again after a long pause. Copenhagen.</span></span>
        </li>
        <li>
          <span class="timeline__when">November</span>
          <span class="timeline__what"><strong>With Ro &amp; Zenna</strong><span>Two-voice evening: sound, stillness and projected work.</span></span>
        </li>
        <li>
          <span class="timeline__when">Summer</span>
          <span class="timeline__what"><strong>Coast studies, open studio</strong><span>Prints from Greve Strand shown in the studio for one weekend.</span></span>
        </li>
      </ul>
    </div>
  </section>

  <section class="section--tight section">
    <div class="shell shell--narrow centred" data-reveal>
      <p class="eyebrow">Invitations</p>
      <h2>Curating something?</h2>
      <p class="centred-measure">Both series travel, and the guided evenings can be held in your space. Write and tell me about the room.</p>
      <div class="button-row button-row--centred space-top-lg">
        <a class="button" href="contact.html">Get in touch</a>
        <a class="button" href="press.html">Press material</a>
      </div>
    </div>
  </section>
`;
