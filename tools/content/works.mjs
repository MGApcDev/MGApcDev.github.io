import { SITE, crumbs } from '../chrome.mjs';
import { WORKS, workCard } from '../works-data.mjs';

export const meta = {
  title: 'Works',
  description: 'Photographic works by Zenna Lua: macro botanicals, leaf shadows, Danish coastline and mirror portraits.',
  image: 'assets/img/work-01-poppy.svg',
  lightbox: true,
  graph: [crumbs([{ name: 'Home', path: '' }, { name: 'Works', path: 'works.html' }])],
};

const FILTERS = [['all', 'All'], ['bloom', 'Bloom'], ['shadow', 'Shadow'], ['coast', 'Coast'], ['mirror', 'Mirror']];

export const body = `
  <section class="section--tight section shell">
    <div data-reveal>
      <p class="eyebrow">Works &middot; 2018 &ndash; now</p>
      <h1 class="measure-14">Twelve quiet openings</h1>
      <p class="lede measure-52">Four series, all photographed in and around Copenhagen and the coast at Greve Strand. Select a series, or open any frame to view it large.</p>
      <p class="series-links">Series in depth: <a href="series-like-a-flower.html">Like a flower you shall bloom</a> &middot; <a href="series-gigantically-subtle.html">Gigantically Subtle</a> &middot; <a href="series-hour-of-gold.html">Greve, at the hour of gold</a> &middot; <a href="series.html">All three &rarr;</a><br>Prefer a list? <a href="catalogue.html">The catalogue</a> has every work with sizes and editions.</p>
    </div>
  </section>

  <section class="section section--flush">
    <div class="shell">
      <div class="filters" role="group" aria-label="Filter works by series">
${FILTERS.map(([value, label]) => `        <button class="filter" type="button" data-filter="${value}" aria-pressed="${value === 'all'}">${label}</button>`).join('\n')}
      </div>

      <p class="filter-status" data-filter-status role="status" aria-live="polite"></p>

      <div class="gallery">
${WORKS.map((work) => workCard(work)).join('\n')}
      </div>
    </div>
  </section>

  <section class="section section--sand">
    <div class="shell shell--narrow" data-reveal>
      <p class="eyebrow">Prints</p>
      <h2>Every frame is available as a print</h2>
      <p>Archival pigment prints on matte cotton rag, editions of 15, signed on the reverse. Sizes from 30 &times; 40 cm to 90 &times; 120 cm. Framing in oiled oak on request.</p>
      <div class="button-row space-top-lg">
        <a class="button" href="prints.html">Prices and sizes</a>
      </div>
    </div>
  </section>
`;
