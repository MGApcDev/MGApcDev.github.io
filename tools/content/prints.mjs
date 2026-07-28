import { SITE, crumbs } from '../chrome.mjs';
import { WORKS, SERIES } from '../works-data.mjs';

export const meta = {
  title: 'Prints',
  description: 'Archival pigment prints by Zenna Lua — sizes, editions, framing and how to order.',
  image: 'assets/img/work-01-poppy.svg',
  graph: [
    {
      '@type': 'ItemList',
      '@id': SITE + 'prints.html#sizes',
      name: 'Print sizes',
      itemListElement: [['30 × 40 cm', '1400'], ['50 × 62 cm', '2600'], ['60 × 75 cm', '3800'], ['90 × 120 cm', '6900']]
        .map(([size, price], index) => ({
          '@type': 'ListItem',
          position: index + 1,
          item: { '@type': 'Product', name: 'Archival pigment print, ' + size, offers: { '@type': 'Offer', price, priceCurrency: 'DKK', availability: 'https://schema.org/InStock' } },
        })),
    },
    crumbs([{ name: 'Home', path: '' }, { name: 'Prints', path: 'prints.html' }]),
  ],
};

/**
 * Size, paper and price. Deliberately no edition column: an edition belongs to the
 * work, not to a paper size, and pretending otherwise put this page in direct
 * contradiction with the catalogue — it claimed 50x62 was an edition of 15 where the
 * catalogue has Afternoon Wall at that size in 8 sets, and 60x75 as 10 where the
 * catalogue has the Bloom frames at 15. The note under the table derives the real
 * figures from works-data, so the two pages cannot drift apart again.
 */
const SIZES = [
  ['30 &times; 40 cm', '1.400 kr.', '2.300 kr.'],
  ['50 &times; 62 cm', '2.600 kr.', '3.900 kr.'],
  ['60 &times; 75 cm', '3.800 kr.', '5.400 kr.'],
  ['90 &times; 60 cm', '6.900 kr.', '9.200 kr.'],
];

/** "Bloom is 15 + 2 AP, Coast and Mirror 10 + 2 AP…" straight from the work data. */
const editionsByRun = (() => {
  const runs = new Map();
  WORKS.forEach((work) => {
    if (!runs.has(work.edition)) runs.set(work.edition, []);
    const labels = runs.get(work.edition);
    if (!labels.includes(SERIES[work.series].label)) labels.push(SERIES[work.series].label);
  });
  const phrase = (labels) => labels.length === 1
    ? labels[0]
    : labels.slice(0, -1).join(', ') + ' and ' + labels[labels.length - 1];
  return [...runs.entries()].map(([edition, labels]) => `${phrase(labels)} ${edition}`).join('; ');
})();

const STEPS = [
  ['01', 'Write', 'Tell me the title, the size and whether you want it framed. A photo of the wall helps more than you would think.'],
  ['02', 'Proof', 'You get a mock-up at scale and a confirmation of the edition number still available.'],
  ['03', 'Print', 'Printed and signed within two weeks. Framing adds about one week.'],
  ['04', 'Send', 'Tracked shipping, or collect it in Copenhagen and have a coffee while you are here.'],
];

const FAQ = [
  ['Can I get a size that is not on the list?', 'Sometimes. The negatives allow a bit of latitude, but the crop is part of the work, so I will not cut a picture to fit a frame you already own. Ask and I will tell you what is possible.'],
  ['Will the colour match what I see on screen?', 'Close, but warmer. Screens light the image from behind; paper does not. The prints are soft-proofed for the exact paper and tend to read a little deeper in the reds.'],
  ['Do you sell the shadow series as a set?', 'Yes &mdash; <em>Gigantically Subtle</em> is intended as a sequence of nine, hung in one line. Sets are priced as eight prints; the ninth comes with it.'],
  ['Can I license an image for a book or a wall?', 'Usually yes, including for clinics and treatment rooms. Write with the context and the size and I will send terms.'],
  ['How should I hang them?', 'Lower than you think, out of direct sun, and with room around them. These are quiet pictures; they do badly in a crowded gallery wall.'],
];

export const body = `
  <section class="section--tight section shell">
    <div class="split split--top">
      <div data-reveal>
        <p class="eyebrow">Prints</p>
        <h1 class="measure-12">Made to live on a wall</h1>
        <p class="lede measure-48">Archival pigment prints on matte cotton rag, printed in Copenhagen, in small numbered editions, signed on the reverse.</p>
        <p>Every frame in <a href="works.html">Works</a> is available. If you want something you saw on Facebook that is not on this site, write and ask &mdash; most of it exists as a file.</p>
      </div>
      <div class="frame frame--tall" data-reveal>
        <img src="assets/img/work-01-poppy.svg" alt="Placeholder artwork: red poppy petals against ochre" width="1200" height="1500" fetchpriority="high" decoding="async">
      </div>
    </div>
  </section>

  <hr class="rule">

  <section class="section shell">
    <div data-reveal class="section-intro">
      <p class="eyebrow" aria-hidden="true">Sizes &amp; editions</p>
      <h2><span class="visually-hidden">Sizes &amp; editions — </span>Four sizes</h2>
    </div>
    <div class="table-scroll" data-reveal>
      <table class="price-table">
        <caption class="visually-hidden">Print sizes, paper and prices in Danish kroner</caption>
        <thead>
          <tr>
            <th scope="col">Size</th>
            <th scope="col">Paper</th>
            <th scope="col">Unframed</th>
            <th scope="col">Framed, oiled oak</th>
          </tr>
        </thead>
        <tbody>
${SIZES.map(([size, unframed, framed]) => `          <tr>
            <th scope="row">${size}</th>
            <td>Cotton rag 310 g</td>
            <td>${unframed}</td>
            <td>${framed}</td>
          </tr>`).join('\n')}
        </tbody>
      </table>
    </div>
    <p class="quiet measure-52 space-top">Edition size belongs to the work rather than to the paper size: ${editionsByRun}. The <a href="catalogue.html">catalogue</a> lists every frame with its own edition.</p>
    <p class="form__note">Prices are placeholders. Shipping within Denmark 250 kr., rest of EU 550 kr. Rolled in a tube unless framed.</p>
  </section>

  <section class="section section--sand">
    <div class="shell">
      <div data-reveal class="section-intro">
        <p class="eyebrow" aria-hidden="true">Ordering</p>
        <h2><span class="visually-hidden">Ordering — </span>Four steps, no cart</h2>
      </div>
      <div class="cards">
${STEPS.map(([index, title, text]) => `        <article class="card" data-reveal>
          <span class="card__index">${index}</span>
          <h3>${title}</h3>
          <p class="quiet">${text}</p>
        </article>`).join('\n')}
      </div>
    </div>
  </section>

  <section class="section shell">
    <div data-reveal class="section-intro">
      <p class="eyebrow" aria-hidden="true">Good to know</p>
      <h2><span class="visually-hidden">Good to know — </span>Questions I get</h2>
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
      <h2>Ready when you are</h2>
      <p class="centred-measure">Tell me which one, and which wall.</p>
      <div class="button-row button-row--centred space-top-lg">
        <a class="button" href="contact.html">Enquire about a print</a>
        <a class="button" href="works.html">Back to works</a>
      </div>
    </div>
  </section>
`;
