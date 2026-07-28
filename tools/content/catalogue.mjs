import { SITE, crumbs } from '../chrome.mjs';
import { WORKS, SERIES } from '../works-data.mjs';

export const meta = {
  title: 'Catalogue',
  description: 'Every work as a list: title, series, year, place, print size and edition. Printable, and easier to scan than the gallery.',
  image: 'assets/img/work-03-shadow.svg',
  graph: [
    {
      '@type': 'ItemList',
      '@id': SITE + 'catalogue.html#works',
      name: 'Catalogue of works',
      numberOfItems: WORKS.length,
      itemListElement: WORKS.map((work, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        url: SITE + `work-${work.slug}.html`,
        item: { '@type': 'VisualArtwork', name: work.title, artMedium: 'Archival pigment print' },
      })),
    },
    crumbs([{ name: 'Home', path: '' }, { name: 'Works', path: 'works.html' }, { name: 'Catalogue', path: 'catalogue.html' }]),
  ],
};

const rows = WORKS.map((work, index) => {
  const series = SERIES[work.series];
  return `          <tr>
            <td class="catalogue__number">${String(index + 1).padStart(2, '0')}</td>
            <th scope="row"><a href="work-${work.slug}.html">${work.title}</a></th>
            <td><a href="${series.page}">${series.label}</a></td>
            <td>${work.year}</td>
            <td>${work.place}</td>
            <td>${work.size}</td>
            <td>${work.edition}</td>
          </tr>`;
}).join('\n');

const counts = Object.entries(
  WORKS.reduce((tally, work) => ({ ...tally, [work.series]: (tally[work.series] || 0) + 1 }), {})
).map(([key, count]) => `        <div><dt>${SERIES[key].label}</dt><dd>${count} work${count === 1 ? '' : 's'}</dd></div>`).join('\n');

export const body = `
  <section class="section--tight section shell">
    <div data-reveal>
      <p class="eyebrow">Catalogue</p>
      <h1 class="measure-14">Every work, as a list</h1>
      <p class="lede measure-52">The same twelve frames as the <a href="works.html">gallery</a>, without the pictures &mdash; titles, sizes, editions and where each one was made. Prints on two sheets.</p>
    </div>
  </section>

  <section class="section section--flush">
    <div class="shell">
      <div class="table-scroll" data-reveal>
        <table class="price-table catalogue">
          <caption class="visually-hidden">All works with series, year, place, print size and edition</caption>
          <thead>
            <tr>
              <th scope="col"><span class="visually-hidden">Number</span></th>
              <th scope="col">Title</th>
              <th scope="col">Series</th>
              <th scope="col">Made</th>
              <th scope="col">Where</th>
              <th scope="col">Print size</th>
              <th scope="col">Edition</th>
            </tr>
          </thead>
          <tbody>
${rows}
          </tbody>
        </table>
      </div>
      <p class="form__note space-top">All prints are archival pigment on matte cotton rag, signed and numbered on the reverse. Titles, sizes and editions are placeholders.</p>
    </div>
  </section>

  <section class="section section--sand">
    <div class="shell">
      <div class="split split--top">
        <div data-reveal>
          <p class="eyebrow">Summary</p>
          <h2>What is in the catalogue</h2>
          <p>Twelve works across three series plus the mirror pieces. The series pages carry the sequences as they hang, which is a different thing &mdash; those frames are not editioned individually.</p>
          <p><a href="press.html">Press and curators</a> has hanging requirements and running metres; <a href="prints.html">Prints</a> has prices.</p>
        </div>
        <dl class="spec" data-reveal>
${counts}
          <div><dt>Total</dt><dd>${WORKS.length} works</dd></div>
          <div><dt>Medium</dt><dd>Archival pigment print</dd></div>
        </dl>
      </div>
    </div>
  </section>
`;
