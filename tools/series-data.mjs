import { WORKS, workCard } from './works-data.mjs';

/**
 * The three photographic series. Each series page is rendered from this by
 * tools/content/series-*.mjs, so their structure cannot drift apart.
 */
export const SERIES_PAGES = [
  {
    slug: 'series-like-a-flower',
    key: 'bloom',
    number: '01',
    status: 'Exhibition',
    title: 'Like a flower<br>you shall bloom',
    plainTitle: 'Like a flower you shall bloom',
    hero: { image: 'assets/img/bloom-hero.svg', width: 1800, height: 1000, alt: 'Placeholder artwork: a red bloom fully open across warm ochre light' },
    lede: 'Macro botanicals photographed at the moment of full opening &mdash; poppy, clematis, hollyhock, and the seed heads that come after.',
    heading: 'Photographed a day too late, on purpose',
    paragraphs: [
      'Flowers are usually photographed at their best hour. I keep going back a day later, when a petal has curled, an edge has browned, the hail in May has left a tear. That is when they look most like the people I sit with.',
      'Three summers of it: a fence of clematis in Vesterbro, hollyhocks against a yellow wall, a field of poppies out past Greve. Everything shot in whatever light the day offered, close enough that the frame loses its sense of scale.',
      'The colour is corrected but not invented. If the red looks impossible, the flower was impossible.',
    ],
    spec: [
      ['Years', 'Three summers'], ['Frames', '18 in the exhibition'], ['Method', 'Natural light, handheld, macro'],
      ['Print', 'Archival pigment on cotton rag'], ['Sizes', '60 &times; 75 cm and 90 &times; 120 cm'],
      ['Edition', '15 + 2 AP'], ['Shown', '23 April &ndash; 31 May, Copenhagen'],
    ],
    sequenceTitle: 'Six from eighteen',
    sequenceEyebrow: 'Selection',
    sequenceNote: 'Click any frame to view it large.',
    wide: true,
    frames: [
      ['bloom-01', 'Poppy, second day', '90 × 120', 'red poppy petals filling the frame'],
      ['bloom-02', 'Clematis, torn edge', '60 × 75', 'violet clematis with a lit centre'],
      ['bloom-03', 'After the flower', '60 × 75', 'pale seed head on sage ground'],
      ['bloom-04', 'Hollyhock at dusk', '60 × 75', 'warm pink bloom against dusk violet'],
      ['bloom-05', 'Full open, no apology', '90 × 120', 'fully open red bloom on ochre'],
      ['bloom-06', 'Second opening', '60 × 75', 'deep violet petals radiating from a pale centre'],
    ],
    frameSize: [1000, 1250],
    quote: 'No flower denies its own blossoming.',
    quoteCite: 'Wall text',
    previous: ['exhibitions.html', 'See it hung', 'Exhibitions &amp; gatherings'],
    next: ['series-gigantically-subtle.html', 'Next series', 'Gigantically Subtle'],
  },
  {
    slug: 'series-gigantically-subtle',
    key: 'shadow',
    number: '02',
    status: 'Ongoing',
    title: 'Gigantically<br>Subtle',
    plainTitle: 'Gigantically Subtle',
    hero: { image: 'assets/img/subtle-hero.svg', width: 1800, height: 1000, alt: 'Placeholder artwork: leaf shadows drifting across a sunlit plaster wall' },
    lede: 'Nine photographs of one wall, one afternoon, one plant &mdash; hung as a single line so the light moves left to right across the room.',
    heading: 'The subject is the passing',
    paragraphs: [
      'There is a plastered wall on the south side of the building where I live. From about half two until the sun drops behind the roof opposite, the fig in the pot below throws its shadow onto it. This happens every clear day and almost nobody in the building has noticed.',
      'I photographed it at roughly twenty-five-minute intervals across one afternoon in August, always from the same spot, always at the same focal length. Nine frames survived. Nothing was moved, added or waited for beyond the light itself.',
      'Hung as a line at eye height, the sequence reads the way the afternoon read: slow, then suddenly over.',
    ],
    spec: [
      ['Year', 'Ongoing'], ['Frames', '9, shown as one sequence'], ['Method', 'Natural light, handheld, no filters'],
      ['Print', 'Archival pigment on cotton rag'], ['Size', '50 &times; 62 cm each'],
      ['Edition', '8 sets + 1 AP'], ['Status', 'Available to exhibit'],
    ],
    sequenceTitle: '14:30 &rarr; 17:40',
    sequenceEyebrow: 'The sequence',
    sequenceNote: 'Click any frame to view it large, then use the arrow keys to walk the afternoon.',
    wide: false,
    frames: [
      ['subtle-01', 'No. 1', '14:30', 'faint leaf shadow, high afternoon light'],
      ['subtle-02', 'No. 2', '14:55', 'leaf shadow lengthening on a warm wall'],
      ['subtle-03', 'No. 3', '15:20', 'green-cast shadow across pale plaster'],
      ['subtle-04', 'No. 4', '15:45', 'shadow leaves overlapping mid-afternoon'],
      ['subtle-05', 'No. 5', '16:10', 'warm ochre wall, shadow at its sharpest'],
      ['subtle-06', 'No. 6', '16:35', 'sage-cast leaf shadow drifting right'],
      ['subtle-07', 'No. 7', '17:00', 'shadow softening as the sun drops'],
      ['subtle-08', 'No. 8', '17:20', 'cool violet cast entering the wall'],
      ['subtle-09', 'No. 9', '17:40', 'the shadow nearly gone, wall in dusk violet'],
    ],
    frameSize: [1000, 1250],
    quote: 'They are of an ordinary Tuesday, photographed slowly enough that it stops being ordinary.',
    quoteCite: 'From <a href="journal.html">Words</a>',
    previous: ['series-like-a-flower.html', 'Previous series', 'Like a flower you shall bloom'],
    next: ['series-hour-of-gold.html', 'Next series', 'Greve, at the hour of gold'],
  },
  {
    slug: 'series-hour-of-gold',
    key: 'coast',
    number: '03',
    status: 'Ongoing',
    title: 'Greve, at the<br>hour of gold',
    plainTitle: 'Greve, at the hour of gold',
    hero: { image: 'assets/img/coast-hero.svg', width: 1800, height: 1000, alt: 'Placeholder artwork: low sun over still water, long reflection running to the shore' },
    lede: 'The last twenty minutes of light over K&oslash;ge Bugt, photographed from the same stretch of beach I grew up on.',
    heading: 'Be standing there',
    paragraphs: [
      'The sun sets behind me at Greve Strand, so what I am photographing is not the sunset. It is the light the sunset throws onto the water in the other direction &mdash; a flat, slow gold that lasts a few minutes and then goes cold.',
      'There is no technique in it worth explaining. I check the forecast, I cycle down, and I stand on the same stretch of sand my parents took me to. Most evenings the sea is grey and I go home. Perhaps one in six gives something.',
      'The frames are wide because the subject is horizontal: a flat line with weather on top of it.',
    ],
    spec: [
      ['Place', 'Greve Strand, K&oslash;ge Bugt'], ['Frames', '6 shown, ongoing'], ['Method', 'Natural light, tripod, long exposure'],
      ['Print', 'Archival pigment on cotton rag'], ['Size', '90 &times; 60 cm, panoramic on request'],
      ['Edition', '10 + 2 AP'], ['Status', 'Available as prints'],
    ],
    sequenceTitle: '21:12 &rarr; 21:53',
    sequenceEyebrow: 'Six evenings',
    sequenceNote: 'Click any frame to view it large.',
    wide: true,
    frames: [
      ['coast-01', 'Køge Bugt, 21:12', 'June', 'gold light lying flat on calm water'],
      ['coast-02', 'The cold coming in', 'August', 'violet dusk settling over the bay'],
      ['coast-03', 'Flat sea, no wind', 'July', 'unbroken horizon with a low sun'],
      ['coast-04', 'Four minutes of it', 'June', 'burning orange light across the bay'],
      ['coast-05', 'After the swimmers left', 'September', 'violet water under a dimming sky'],
      ['coast-06', 'Last of the light', 'September', 'pale violet horizon, sun almost gone'],
    ],
    frameSize: [1250, 1000],
    quote: 'That is most of what I know about making pictures: be standing there.',
    quoteCite: 'From <a href="journal.html">Words</a>',
    previous: ['series-gigantically-subtle.html', 'Previous series', 'Gigantically Subtle'],
    next: ['prints.html', 'Take one home', 'Prints &amp; sizes'],
  },
];

/** Render a whole series page body. */
export function seriesBody(series) {
  const [width, height] = series.frameSize;
  const owned = WORKS.filter((work) => work.series === series.key);
  // The catalogued works in this series each have their own page; the sequence
  // above is the series as it hangs. Without this, a reader could not get from a
  // series to the works listed under it in the gallery.
  const catalogue = owned.length ? `
  <section class="section shell">
    <div data-reveal class="section-intro">
      <p class="eyebrow">In the catalogue</p>
      <h2>${owned.length} work${owned.length === 1 ? '' : 's'} from this series</h2>
      <p class="quiet">Each has its own page, with the note behind it and the print details.</p>
    </div>
    <div class="sequence sequence--wide">
${owned.map((work) => workCard(work)).join('\n')}
    </div>
  </section>
` : '';

  const frames = series.frames.map(([slug, title, meta, alt]) =>
`        <a class="work" href="assets/img/${slug}.svg" data-reveal data-lightbox-open="assets/img/${slug}.svg" data-caption="${title} — ${meta}">
          <span class="work__media"><img src="assets/img/${slug}.svg" alt="Placeholder artwork: ${alt}" width="${width}" height="${height}" loading="lazy" decoding="async"></span>
          <span class="work__caption"><span class="work__title">${title}</span><span class="work__meta">${meta}</span></span>
        </a>`).join('\n');

  return `
  <section class="series-hero">
    <div class="series-hero__media">
      <img src="${series.hero.image}" alt="${series.hero.alt}" width="${series.hero.width}" height="${series.hero.height}" fetchpriority="high" decoding="async">
    </div>
    <div class="shell series-hero__body">
      <nav class="crumbs" aria-label="Breadcrumb">
        <a href="works.html">Works</a> <span aria-hidden="true">/</span> <a href="series.html">Series</a>
      </nav>
      <p class="eyebrow">Series ${series.number} &middot; ${series.status}</p>
      <h1>${series.title}</h1>
      <p class="lede measure-44">${series.lede}</p>
    </div>
  </section>

  <section class="section shell">
    <div class="split split--top">
      <div data-reveal>
        <p class="eyebrow">About the series</p>
        <h2>${series.heading}</h2>
${series.paragraphs.map((paragraph) => `        <p>${paragraph}</p>`).join('\n')}
      </div>
      <dl class="spec" data-reveal>
${series.spec.map(([term, value]) => `        <div><dt>${term}</dt><dd>${value}</dd></div>`).join('\n')}
      </dl>
    </div>
  </section>

  <section class="section section--sand">
    <div class="shell">
      <div data-reveal class="section-intro">
        <p class="eyebrow">${series.sequenceEyebrow}</p>
        <h2><span class="visually-hidden">${series.sequenceEyebrow} — </span>${series.sequenceTitle}</h2>
        <p class="quiet">${series.sequenceNote}</p>
      </div>

      <div class="sequence${series.wide ? ' sequence--wide' : ''}">
${frames}
      </div>
    </div>
  </section>

${catalogue}
  <section class="section--tight section">
    <div class="shell shell--narrow" data-reveal>
      <blockquote class="pull-quote">
        ${series.quote}
        <cite>${series.quoteCite}</cite>
      </blockquote>
    </div>
  </section>

  <hr class="rule">

  <section class="section shell">
    <div class="series-nav">
      <a class="series-nav__link" href="${series.previous[0]}" data-reveal>
        <span class="series-nav__label">${series.previous[1]}</span>
        <span class="series-nav__title">${series.previous[2]}</span>
      </a>
      <a class="series-nav__link series-nav__link--end" href="${series.next[0]}" data-reveal>
        <span class="series-nav__label">${series.next[1]}</span>
        <span class="series-nav__title">${series.next[2]}</span>
      </a>
    </div>
  </section>
`;
}
