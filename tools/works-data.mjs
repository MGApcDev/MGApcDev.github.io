/**
 * The twelve works, in gallery order. This is the single source for the gallery
 * on works.html, the generated detail pages, and the search index.
 *
 * Everything except `image` is placeholder copy.
 */
export const SERIES = {
  bloom: { label: 'Bloom', title: 'Like a flower you shall bloom', page: 'series-like-a-flower.html' },
  shadow: { label: 'Shadow', title: 'Gigantically Subtle', page: 'series-gigantically-subtle.html' },
  coast: { label: 'Coast', title: 'Greve, at the hour of gold', page: 'series-hour-of-gold.html' },
  mirror: { label: 'Mirror', title: 'Mirror work', page: 'i-see-you.html' },
};

export const WORKS = [
  {
    slug: 'untitled-poppy-i', title: 'Untitled (Poppy I)', series: 'bloom',
    image: 'assets/img/work-01-poppy.svg', size: '60 × 75 cm', edition: '15 + 2 AP', year: 'June',
    alt: 'Placeholder artwork: red poppy petals against ochre',
    note: 'Second morning after the hail. One petal is torn most of the way through and the flower is holding itself open anyway, which is the only reason I kept the frame.',
    place: 'A field past Greve',
  },
  {
    slug: 'untitled-clematis', title: 'Untitled (Clematis)', series: 'bloom',
    image: 'assets/img/work-02-clematis.svg', size: '60 × 75 cm', edition: '15 + 2 AP', year: 'July',
    alt: 'Placeholder artwork: violet clematis petals radiating from a pale centre',
    note: 'From the fence in Vesterbro that produces a hundred of these every summer and not one of them the same shape.',
    place: 'Vesterbro, Copenhagen',
  },
  {
    slug: 'afternoon-wall', title: 'Afternoon Wall', series: 'shadow',
    image: 'assets/img/work-03-shadow.svg', size: '50 × 62 cm', edition: '8 sets + 1 AP', year: 'August',
    alt: 'Placeholder artwork: soft leaf shadows falling on a sand-coloured wall',
    note: 'The first frame of the afternoon, at half two, when the shadow is still faint enough that most people would walk past it.',
    place: 'The south wall at home',
  },
  {
    slug: 'koge-bugt-2140', title: 'Køge Bugt, 21:40', series: 'coast',
    image: 'assets/img/work-04-horizon.svg', size: '90 × 60 cm', edition: '10 + 2 AP', year: 'June',
    alt: 'Placeholder artwork: low sun over calm water with a long reflection',
    note: 'Four minutes of flat water in the middle of June. I had been down there six evenings running for this.',
    place: 'Greve Strand',
  },
  {
    slug: 'self-facing-up', title: 'Self, Facing Up', series: 'mirror',
    image: 'assets/img/work-05-portrait.svg', size: '60 × 75 cm', edition: '10 + 2 AP', year: 'May',
    alt: 'Placeholder artwork: a figure tilted toward warm light among leaves',
    note: 'Taken after an evening of eye gazing, when it no longer felt strange to be looked at. Made with a timer, not a mirror.',
    place: 'Copenhagen',
  },
  {
    slug: 'green-hour', title: 'Green Hour', series: 'shadow',
    image: 'assets/img/work-06-sage.svg', size: '50 × 50 cm', edition: '8 sets + 1 AP', year: 'August',
    alt: 'Placeholder artwork: sage-green leaf shadows on a pale wall',
    note: 'Light coming through the fig rather than past it, which turns the whole wall the colour of the leaf.',
    place: 'The south wall at home',
  },
  {
    slug: 'dusk-crossing', title: 'Dusk Crossing', series: 'coast',
    image: 'assets/img/work-07-dusk.svg', size: '60 × 75 cm', edition: '10 + 2 AP', year: 'August',
    alt: 'Placeholder artwork: violet and amber dusk over water',
    note: 'The minute the gold goes cold. On the screen it looks corrected; it was not.',
    place: 'Køge Bugt',
  },
  {
    slug: 'seed-head-waiting', title: 'Seed Head, Waiting', series: 'bloom',
    image: 'assets/img/work-08-bloom.svg', size: '50 × 50 cm', edition: '15 + 2 AP', year: 'September',
    alt: 'Placeholder artwork: pale green bloom opening on sage ground',
    note: 'Three weeks after the flower fell off. They do not look like death to me. They look like storage.',
    place: 'A field past Greve',
  },
  {
    slug: 'gigantically-subtle-no-4', title: 'Gigantically Subtle No. 4', series: 'shadow',
    image: 'assets/img/work-09-shadowwall.svg', size: '90 × 60 cm', edition: '8 sets + 1 AP', year: 'August',
    alt: 'Placeholder artwork: warm ochre wall with drifting leaf shadows',
    note: 'The middle of the sequence, at quarter to four, when the shadow is at its sharpest and the wall is at its warmest.',
    place: 'The south wall at home',
  },
  {
    slug: 'greve-strand-facing-south', title: 'Greve Strand, Facing South', series: 'coast',
    image: 'assets/img/work-10-coast.svg', size: '60 × 75 cm', edition: '10 + 2 AP', year: 'July',
    alt: 'Placeholder artwork: golden horizon line over still water',
    note: 'The same stretch of sand my parents took me to. I have photographed it perhaps two hundred times.',
    place: 'Greve Strand',
  },
  {
    slug: 'second-opening', title: 'Second Opening', series: 'bloom',
    image: 'assets/img/work-11-clematis.svg', size: '50 × 50 cm', edition: '15 + 2 AP', year: 'July',
    alt: 'Placeholder artwork: deep violet petals with a lit centre',
    note: 'A clematis that had already been open once, closed in the rain, and opened again a day later slightly wrong.',
    place: 'Vesterbro, Copenhagen',
  },
  {
    slug: 'i-see-you-study', title: 'I See You (Study)', series: 'mirror',
    image: 'assets/img/work-12-portrait.svg', size: '60 × 75 cm', edition: '10 + 2 AP', year: 'March',
    alt: 'Placeholder artwork: a soft figure among green leaves, eyes closed',
    note: 'Made while working out how the mirror part of the evening should be lit. It stayed in as a work in its own right.',
    place: 'Copenhagen',
  },
];
