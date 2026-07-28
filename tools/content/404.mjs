export const meta = {
  title: 'Not found',
  description: 'That page is not here. Find the works, the series, the exhibitions or a way to get in touch instead.',
  image: 'assets/img/work-08-bloom.svg',
  noindex: true,
};

export const body = `
  <section class="section shell">
    <div class="split split--top">
      <div>
        <p class="eyebrow">404</p>
        <h1 class="measure-12">This one isn&rsquo;t here</h1>
        <p class="lede">The page has moved, or never existed. Both happen.</p>

        <form class="search-form space-top-xl" role="search" action="search.html" method="get">
          <label class="visually-hidden" for="query">Search the site</label>
          <input id="query" name="q" type="search" placeholder="Try a title, a series, a word&hellip;" autocomplete="off">
          <button class="button" type="submit">Search</button>
        </form>

        <h2 class="minor-heading space-top-3xl">Or start somewhere</h2>
        <ul class="plain-list">
          <li><a href="works.html">All works</a> &mdash; twelve frames, filterable by series</li>
          <li><a href="series.html">The three series</a> &mdash; bloom, shadow, coast</li>
          <li><a href="exhibitions.html">Exhibitions &amp; gatherings</a> &mdash; what is on</li>
          <li><a href="prints.html">Prints</a> &mdash; sizes, editions, ordering</li>
          <li><a href="contact.html">Contact</a> &mdash; if you were looking for me</li>
        </ul>
      </div>
      <div class="frame frame--tall">
        <img src="assets/img/work-08-bloom.svg" alt="Placeholder artwork: pale bloom opening on sage ground" width="1200" height="1200" loading="lazy" decoding="async">
      </div>
    </div>
  </section>
`;
