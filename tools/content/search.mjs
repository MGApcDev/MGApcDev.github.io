import { SITE, crumbs } from '../chrome.mjs';

export const meta = {
  title: 'Search',
  description: 'Search the whole site: works, series, exhibitions, gatherings, writing and practical information.',
  image: 'assets/img/work-06-sage.svg',
  script: 'assets/js/search.js',
  graph: [
    {
      '@type': 'WebSite',
      '@id': SITE + '#site',
      url: SITE,
      potentialAction: {
        '@type': 'SearchAction',
        target: { '@type': 'EntryPoint', urlTemplate: SITE + 'search.html?q={search_term_string}' },
        'query-input': 'required name=search_term_string',
      },
    },
    crumbs([{ name: 'Home', path: '' }, { name: 'Search', path: 'search.html' }]),
  ],
};

const GROUPS = [
  ['The work', [['works.html', 'All works'], ['series.html', 'Series'], ['series-like-a-flower.html', 'Like a flower you shall bloom'], ['series-gigantically-subtle.html', 'Gigantically Subtle'], ['series-hour-of-gold.html', 'Greve, at the hour of gold']]],
  ['In person', [['exhibitions.html', 'Exhibitions &amp; gatherings'], ['i-see-you.html', 'I See You'], ['kvindecirkel.html', 'Kvindecirkel'], ['sessions.html', 'Sessions'], ['now.html', 'Now']]],
  ['Practical', [['prints.html', 'Prints'], ['press.html', 'Press &amp; curators'], ['colophon.html', 'Colophon'], ['journal.html', 'Words'], ['about.html', 'About'], ['contact.html', 'Contact']]],
];

export const body = `
  <section class="section--tight section shell">
    <div>
      <p class="eyebrow">Search</p>
      <h1 class="measure-12">Find it</h1>

      <form class="search-form" role="search" action="search.html" method="get">
        <label class="visually-hidden" for="query">Search the site</label>
        <input id="query" name="q" type="search" placeholder="poppy, shadow, prints, sessions&hellip;" autocomplete="off" autofocus>
        <button class="button" type="submit">Search</button>
      </form>

      <p class="search-status" data-search-status role="status" aria-live="polite"></p>
    </div>
  </section>

  <section class="section section--flush">
    <div class="shell">
      <h2 class="visually-hidden">Results</h2>
      <ol class="search-results" data-search-results></ol>

      <div class="search-fallback" data-search-fallback>
        <p class="eyebrow">Everything on the site</p>
        <div class="cards">
${GROUPS.map(([heading, links]) => `          <article class="card">
            <h2 class="minor-heading"><span class="visually-hidden">Browse — </span>${heading}</h2>
            <ul class="plain-list">
${links.map(([href, label]) => `              <li><a href="${href}"${href === 'kvindecirkel.html' ? ' lang="da"' : ''}>${label}</a></li>`).join('\n')}
            </ul>
          </article>`).join('\n')}
        </div>
      </div>
    </div>
  </section>
`;
