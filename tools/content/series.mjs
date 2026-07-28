import { crumbs } from '../chrome.mjs';
import { SERIES_PAGES } from '../series-data.mjs';

export const meta = {
  title: 'Series',
  description: 'The three photographic series by Zenna Lua: Like a flower you shall bloom, Gigantically Subtle, and Greve, at the hour of gold.',
  image: 'assets/img/bloom-hero.svg',
  graph: [crumbs([{ name: 'Home', path: '' }, { name: 'Series', path: 'series.html' }])],
};

const SUMMARY = {
  'series-like-a-flower': ['Macro botanicals photographed a day past their best hour &mdash; poppy, clematis, hollyhock, and the seed heads that come after. Eighteen frames, shown 23 April &ndash; 31 May.', '18 frames &middot; Exhibition &middot; 60 &times; 75 and 90 &times; 120 cm'],
  'series-gigantically-subtle': ['One plastered wall, one fig in a pot, one August afternoon, photographed at twenty-minute intervals until the sun dropped behind the roof opposite. Hung as a single line, 14:30 to 17:40.', '9 frames &middot; Ongoing &middot; 50 &times; 62 cm each'],
  'series-hour-of-gold': ['The last light over K&oslash;ge Bugt, shot from the beach I grew up on. Most evenings the sea is grey and I go home; roughly one in six gives something.', '6 shown &middot; Ongoing &middot; 90 &times; 60 cm'],
};

const cards = SERIES_PAGES.map((series) => {
  const [description, meta] = SUMMARY[series.slug];
  return `        <li class="series-card" data-reveal>
          <a class="series-card__media" href="${series.slug}.html" tabindex="-1" aria-hidden="true">
            <img src="${series.hero.image}" alt="" width="${series.hero.width}" height="${series.hero.height}" loading="lazy" decoding="async">
          </a>
          <div class="series-card__body">
            <p class="series-card__index">Series ${series.number}</p>
            <h2><a href="${series.slug}.html">${series.plainTitle}</a></h2>
            <p>${description}</p>
            <p class="series-card__meta">${meta}</p>
          </div>
        </li>`;
}).join('\n\n');

export const body = `
  <section class="section--tight section shell">
    <div data-reveal>
      <p class="eyebrow">Series</p>
      <h1 class="measure-13">Three bodies of work</h1>
      <p class="lede measure-52">Each one is a single subject followed until it gave something up: a flower at full opening, a wall through one afternoon, a horizon in the last twenty minutes of light.</p>
      <p class="quiet">Prefer everything in one grid? <a href="works.html">All works &rarr;</a></p>
    </div>
  </section>

  <section class="section section--flush">
    <div class="shell">
      <ol class="series-index">

${cards}

      </ol>
    </div>
  </section>

  <section class="section--tight section section--sand">
    <div class="shell shell--narrow centred" data-reveal>
      <p class="eyebrow">Also</p>
      <h2>Mirror work</h2>
      <p class="centred-measure">The self-portraits sit outside the three series &mdash; they belong to the gatherings rather than to a body of work. They are under <a href="works.html#mirror">Mirror in the gallery</a>, and the evening they come from is <a href="i-see-you.html">I See You</a>.</p>
    </div>
  </section>
`;
