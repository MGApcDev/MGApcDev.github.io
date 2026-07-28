import { SITE, crumbs } from '../chrome.mjs';
import { SERIES_PAGES } from '../series-data.mjs';

export const meta = {
  title: 'Press & curators',
  description: 'Press material for Zenna Lua: short and long bio, exhibition facts, what travels, technical details and contact for curators and journalists.',
  image: 'assets/img/about-portrait.svg',
  lightbox: true,
  graph: [
    { '@type': 'AboutPage', '@id': SITE + 'press.html#press', name: 'Press & curators', about: { '@id': SITE + '#zenna' }, url: SITE + 'press.html' },
    crumbs([{ name: 'Home', path: '' }, { name: 'Press & curators', path: 'press.html' }]),
  ],
};

const BIOS = [
  ['One line &middot; 96 characters', ['Zenna Lua is a Copenhagen-based photographic artist and psychotherapist working with light and botany.']],
  ['Short &middot; 60 words', ['Zenna Lua (b. 1991, Greve Strand) is a photographic artist and psychotherapist based in Copenhagen. Trained at Engelsholm Kunsth&oslash;jskole and Dansk NLP Center, she has worked independently in both practices since 2018. Her work follows one subject at a time &mdash; a flower at full opening, a wall through an afternoon, a horizon at last light &mdash; in natural light only.']],
  ['Long &middot; 140 words', [
    'Zenna Lua (b. 1991, Greve Strand) is a photographic artist and psychotherapist based in Copenhagen. She studied at Engelsholm Kunsth&oslash;jskole and trained as a psychotherapist at Dansk NLP Center, and has run both practices independently since 2018.',
    'Her photographs are made in natural light, handheld or on a tripod, and are not staged. Each series follows a single subject until it yields: <em>Like a flower you shall bloom</em> photographs macro botanicals a day past their best hour; <em>Gigantically Subtle</em> records leaf shadows crossing one plastered wall across a single August afternoon; <em>Greve, at the hour of gold</em> returns to the same stretch of Danish coast for the last twenty minutes of light.',
    'Alongside the photographic work she holds guided evenings and seasonal circles in Copenhagen, where the images are printed and handled rather than hung.',
  ]],
];

const TRAVELS = [
  ['series-like-a-flower', '18', '60 &times; 75 and 90 &times; 120 cm', 'Framed, oiled oak', 'From 14 running metres'],
  ['series-gigantically-subtle', '9, as one sequence', '50 &times; 62 cm each', 'One line, eye height', '6 running metres, unbroken'],
  ['series-hour-of-gold', '6, ongoing', '90 &times; 60 cm', 'Framed or mounted', 'From 7 running metres'],
];

/**
 * The three landscape key images sit in one row; the portrait is 4:5 and gets its
 * own block. In a single grid row the portrait was more than twice the height of
 * the landscapes, so it set the row height and left a void under the other three.
 */
const IMAGES = [
  ['bloom-hero', 1800, 1000, 'Bloom, key image', 'Series 01', 'a red bloom fully open across warm ochre light'],
  ['subtle-hero', 1800, 1000, 'Subtle, key image', 'Series 02', 'leaf shadows drifting across a sunlit plaster wall'],
  ['coast-hero', 1800, 1000, 'Coast, key image', 'Series 03', 'low sun over still water with a long reflection'],
  ['about-portrait', 1100, 1400, 'Artist portrait', 'Credit &copy; Zenna Lua', 'a figure turned toward light among green leaves'],
];

export const body = `
  <section class="section--tight section shell">
    <div data-reveal>
      <p class="eyebrow">Press &amp; curators</p>
      <h1 class="measure-13">Everything you need to write it up</h1>
      <p class="lede measure-52">Bios at three lengths, the facts, what travels and what it needs. Copy any of it without asking.</p>
      <p class="quiet">Anything missing, or need files at print resolution? <a href="contact.html">Write to me</a> and say the deadline.</p>
    </div>
  </section>

  <hr class="rule">

  <section class="section shell">
    <div data-reveal class="section-intro">
      <p class="eyebrow" aria-hidden="true">Biography</p>
      <h2><span class="visually-hidden">Biography — </span>Three lengths</h2>
    </div>
${BIOS.map(([label, paragraphs]) => `    <div class="press-block" data-reveal>
      <p class="press-block__label">${label}</p>
      <blockquote class="press-block__text">
${paragraphs.map((paragraph) => `        <p>${paragraph}</p>`).join('\n')}
      </blockquote>
    </div>`).join('\n\n')}
  </section>

  <section class="section section--sand">
    <div class="shell">
      <div class="split split--top">
        <div data-reveal>
          <p class="eyebrow">Facts</p>
          <h2>At a glance</h2>
          <p class="quiet">Please spell the name <strong>Zenna Lua</strong> in exhibition contexts and <strong>Zenna Grundtvig</strong> where a legal name is required. Both are correct.</p>
        </div>
        <dl class="spec" data-reveal>
          <div><dt>Born</dt><dd>1991, Greve Strand, Denmark</dd></div>
          <div><dt>Based</dt><dd>Copenhagen</dd></div>
          <div><dt>Education</dt><dd>Engelsholm Kunsth&oslash;jskole; Dansk NLP Center</dd></div>
          <div><dt>Practising</dt><dd>Independently since 2018</dd></div>
          <div><dt>Medium</dt><dd>Photography, natural light</dd></div>
          <div><dt>Series</dt><dd><a href="series.html">Three, plus mirror work</a></dd></div>
          <div><dt>Languages</dt><dd>Danish, English</dd></div>
        </dl>
      </div>
    </div>
  </section>

  <section class="section shell">
    <div data-reveal class="section-intro">
      <p class="eyebrow">For curators</p>
      <h2>What travels</h2>
    </div>
    <div class="table-scroll" data-reveal>
      <table class="price-table">
        <caption class="visually-hidden">Series available for exhibition, with frame counts, sizes and hanging requirements</caption>
        <thead>
          <tr>
            <th scope="col">Series</th>
            <th scope="col">Frames</th>
            <th scope="col">Size</th>
            <th scope="col">Hanging</th>
            <th scope="col">Wall needed</th>
          </tr>
        </thead>
        <tbody>
${TRAVELS.map(([slug, frames, size, hanging, wall]) => {
  const series = SERIES_PAGES.find((entry) => entry.slug === slug);
  return `          <tr>
            <th scope="row"><a href="${slug}.html">${series.plainTitle}</a></th>
            <td>${frames}</td>
            <td>${size}</td>
            <td>${hanging}</td>
            <td>${wall}</td>
          </tr>`;
}).join('\n')}
        </tbody>
      </table>
    </div>
    <p class="form__note space-top">All figures are placeholders. Crates, insurance values and condition reports available on request.</p>
  </section>

  <section class="section section--sand">
    <div class="shell">
      <div data-reveal class="section-intro">
        <p class="eyebrow">Images</p>
        <h2>Press images</h2>
        <p class="quiet">Free to reproduce in connection with coverage of the work. Credit: <strong>&copy; Zenna Lua</strong>. Please do not crop or apply filters.</p>
      </div>
      <div class="sequence sequence--wide">
${IMAGES.filter(([, , height]) => height < 1200).map(([slug, width, height, title, meta, alt]) => `        <a class="work" href="assets/img/${slug}.svg" data-lightbox-open="assets/img/${slug}.svg" data-caption="${title.replace(/&copy; /, '')} — press image" data-reveal>
          <span class="work__media"><img src="assets/img/${slug}.svg" alt="Placeholder artwork: ${alt}" width="${width}" height="${height}" loading="lazy" decoding="async"></span>
          <span class="work__caption"><span class="work__title">${title}</span><span class="work__meta">${meta}</span></span>
        </a>`).join('\n')}
      </div>

      <div class="press-portrait space-top-3xl">
${IMAGES.filter(([, , height]) => height >= 1200).map(([slug, width, height, title, meta, alt]) => `        <a class="work" href="assets/img/${slug}.svg" data-lightbox-open="assets/img/${slug}.svg" data-caption="${title.replace(/&copy; /, '')} — press image" data-reveal>
          <span class="work__media"><img src="assets/img/${slug}.svg" alt="Placeholder artwork: ${alt}" width="${width}" height="${height}" loading="lazy" decoding="async"></span>
          <span class="work__caption"><span class="work__title">${title}</span><span class="work__meta">${meta}</span></span>
        </a>`).join('\n')}
      </div>
    </div>
  </section>

  <section class="section--tight section shell">
    <div class="shell shell--narrow centred" data-reveal>
      <h2>Press contact</h2>
      <p class="centred-measure">Direct, no agency in between. Interviews in Danish or English.</p>
      <p class="centred-measure"><a href="mailto:hello@zennalua.dk">hello@zennalua.dk</a></p>
      <div class="button-row button-row--centred space-top-lg">
        <a class="button" href="contact.html">Get in touch</a>
        <a class="button" href="series.html">See the series</a>
      </div>
    </div>
  </section>
`;
