/**
 * Shared page chrome — head, header, footer, lightbox markup.
 *
 * Every page is assembled from these, so the header on page thirty cannot drift
 * from the header on page one. Hand-written pages call `page()` from
 * tools/build-pages.mjs; the generated work pages use the same helpers.
 */

// The GitHub Pages user site serves at the domain root.
export const SITE = 'https://mgapcdev.github.io/';

/**
 * There is no nav in the header — it is the wordmark alone. Every page is
 * reached from the footer, from the home page, or from links in the running copy,
 * which makes the footer list below the site's only standing navigation: a page
 * missing from it is a page nobody can find. tools/audit-orphans.mjs enforces
 * that, and it is the check to watch when adding a page.
 *
 * `da.html` sits here because it used to be the header's "Dansk" link and had no
 * other route in.
 */
const FOOTER_PAGES = [
  ['now.html', 'Now'],
  ['works.html', 'Works'],
  ['series.html', 'Series'],
  ['catalogue.html', 'Catalogue'],
  ['exhibitions.html', 'Exhibitions'],
  ['visit.html', 'Visit'],
  ['journal.html', 'Words'],
  ['prints.html', 'Prints'],
  ['sessions.html', 'Sessions'],
  ['kvindecirkel.html', 'Kvindecirkel', 'da'],
  ['about.html', 'About'],
  ['contact.html', 'Contact'],
  ['da.html', 'Dansk', 'da'],
];

const FOOTER_ELSEWHERE = [
  ['https://www.facebook.com/ZennaGrundtvig', 'Facebook'],
  ['contact.html', 'Newsletter'],
  ['prints.html', 'Print enquiries'],
  ['press.html', 'Press &amp; curators'],
  ['colophon.html', 'Colophon'],
  ['feed.xml', 'RSS'],
];

const link = ([href, label, lang]) =>
  `<a href="${href}"${lang ? ` lang="${lang}"` : ''}>${label}</a>`;

/**
 * @param {object} options
 * @param {string} options.title      full <title>, without the site suffix
 * @param {string} options.description meta description
 * @param {string} options.image      og:image path
 * @param {string} [options.current]  filename of this page, for aria-current
 * @param {string} [options.lang]     document language, default "en"
 * @param {object[]} [options.graph]  JSON-LD entities
 * @param {string} [options.type]     og:type, default "website"
 * @param {boolean} [options.noindex]
 */
/** assets/img/x.svg -> assets/social/x.jpg, the rasterised card. */
const socialCard = (image) => image.replace('assets/img/', 'assets/social/').replace(/\.svg$/, '.jpg');

export function head({ title, description, image, current, lang = 'en', graph, type = 'website', noindex = false }) {
  const jsonLd = graph
    ? `<script type="application/ld+json">\n${JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }, null, 1)}\n</script>\n`
    : '';
  const skip = lang === 'da' ? 'Spring til indhold' : 'Skip to content';

  return `<!DOCTYPE html>
<html lang="${lang}">
<head>
<meta charset="utf-8">
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; img-src 'self' data:; style-src 'self'; script-src 'self' 'sha256-/x7W7R75k8Roq0WaVRQX9blP4OufE5xbAdzklGxsgpw='; form-action 'self' mailto:; base-uri 'none'">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title} — Zenna Lua</title>
<meta name="description" content="${description}">
${noindex ? '<meta name="robots" content="noindex">\n' : ''}<meta property="og:type" content="${type}">
<meta property="og:site_name" content="Zenna Lua">
<meta property="og:title" content="${title} — Zenna Lua">
<meta property="og:description" content="${description}">
<meta property="og:url" content="${SITE}${current === 'index.html' ? '' : current || ''}">
<meta property="og:image" content="${SITE}${socialCard(image)}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#F6EFE4" media="(prefers-color-scheme: light)">
<meta name="theme-color" content="#17141A" media="(prefers-color-scheme: dark)">
<link rel="icon" href="assets/img/work-01-poppy.svg" type="image/svg+xml">
<link rel="icon" href="assets/social/icon-192.png" sizes="192x192">
<link rel="icon" href="assets/social/icon-512.png" sizes="512x512">
<link rel="apple-touch-icon" href="assets/social/apple-touch-icon.png">
<link rel="alternate" type="application/rss+xml" title="Zenna Lua — Words" href="feed.xml">
<link rel="alternate" hreflang="${lang === 'da' ? 'en' : 'da'}" href="${lang === 'da' ? 'index.html' : 'da.html'}">
<script>document.documentElement.classList.add('js');</script>
<link rel="stylesheet" href="assets/css/style.css">
${jsonLd}</head>
<body>

<a class="skip-link" href="#main">${skip}</a>

<header class="site-header">
  <div class="shell site-header__inner">
    <a class="wordmark" href="index.html"${current === 'index.html' ? ' aria-current="page"' : ''}>Zenna <span>Lua</span></a>
  </div>
</header>

<main id="main">
`;
}

export function footer({ lightbox = false, script } = {}) {
  const viewer = lightbox ? `
<div class="lightbox" data-lightbox aria-hidden="true" role="dialog" aria-modal="true" aria-label="Artwork viewer">
  <button class="lightbox__close" type="button" data-lightbox-close aria-label="Close viewer">&times;</button>
  <div class="lightbox__nav">
    <button type="button" data-lightbox-prev aria-label="Previous work">&larr;</button>
    <button type="button" data-lightbox-next aria-label="Next work">&rarr;</button>
  </div>
  <figure class="lightbox__figure">
    <img data-lightbox-image alt="">
    <figcaption class="lightbox__caption" data-lightbox-caption></figcaption>
    <p class="lightbox__counter" data-lightbox-counter></p>
  </figure>
</div>
` : '';

  return `</main>

<footer class="site-footer">
  <div class="shell">
    <div class="site-footer__grid">
      <div>
        <a class="wordmark" href="index.html">Zenna <span>Lua</span></a>
        <p class="quiet site-footer__blurb">Photographic artist and psychotherapist. Copenhagen, Denmark.</p>
      </div>
      <div>
        <h2>Pages</h2>
        <ul>
${FOOTER_PAGES.map((entry) => `          <li>${link(entry)}</li>`).join('\n')}
        </ul>
      </div>
      <div>
        <h2>Elsewhere</h2>
        <ul>
${FOOTER_ELSEWHERE.map((entry) => `          <li>${link(entry)}</li>`).join('\n')}
        </ul>
      </div>
      <div>
        <h2>Studio</h2>
        <ul>
          <li>Copenhagen, DK</li>
          <li><a href="mailto:hello@zennalua.dk">hello@zennalua.dk</a></li>
        </ul>
      </div>
    </div>
    <div class="site-footer__base">
      <span>&copy; Zenna Lua</span>
      <span>Images shown are placeholders</span>
    </div>
  </div>
</footer>
${viewer}
<script src="assets/js/site.js"></script>${script ? '\n<script src="' + script + '"></script>' : ''}
</body>
</html>
`;
}

/** Breadcrumb JSON-LD for a page one level below the home page. */
export const crumbs = (trail) => ({
  '@type': 'BreadcrumbList',
  itemListElement: trail.map((item, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: item.name,
    item: SITE + item.path,
  })),
});

export const PERSON = {
  '@type': 'Person',
  '@id': SITE + '#zenna',
  name: 'Zenna Lua',
  alternateName: 'Zenna Grundtvig',
  jobTitle: ['Photographic artist', 'Psychotherapist'],
  description: 'Photographic artist, digital creator and psychotherapist based in Copenhagen.',
  birthPlace: { '@type': 'Place', name: 'Greve Strand, Denmark' },
  address: { '@type': 'PostalAddress', addressLocality: 'Copenhagen', addressCountry: 'DK' },
  email: 'mailto:hello@zennalua.dk',
  url: SITE,
  sameAs: ['https://www.facebook.com/ZennaGrundtvig'],
  alumniOf: [
    { '@type': 'EducationalOrganization', name: 'Engelsholm Kunsthøjskole' },
    { '@type': 'EducationalOrganization', name: 'Dansk NLP Center' },
  ],
};
