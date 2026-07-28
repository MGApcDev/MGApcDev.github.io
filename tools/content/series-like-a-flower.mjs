import { SITE, crumbs } from '../chrome.mjs';
import { SERIES_PAGES, seriesBody } from '../series-data.mjs';

const series = SERIES_PAGES.find((entry) => entry.slug === 'series-like-a-flower');

export const meta = {
  title: series.plainTitle,
  description: series.lede.replace(/&mdash;/g, '—').replace(/&oslash;/g, 'ø').replace(/<[^>]+>/g, ''),
  image: series.hero.image,
  type: 'article',
  lightbox: true,
  graph: [
    {
      '@type': 'CreativeWorkSeries',
      '@id': SITE + series.slug + '.html#series',
      name: series.plainTitle,
      url: SITE + series.slug + '.html',
      image: SITE + series.hero.image,
      creator: { '@id': SITE + '#zenna' },
      genre: 'Fine art photography',
    },
    crumbs([{ name: 'Home', path: '' }, { name: 'Series', path: 'series.html' }, { name: series.plainTitle, path: series.slug + '.html' }]),
  ],
};

export const body = seriesBody(series);
