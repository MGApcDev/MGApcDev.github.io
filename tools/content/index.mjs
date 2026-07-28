import { PERSON, SITE } from '../chrome.mjs';
import { WORKS, workCard } from '../works-data.mjs';

export const meta = {
  title: 'Zenna Lua — Photographic Artist, Copenhagen',
  description: 'Zenna Lua (Zenna Grundtvig) — photographic artist and psychotherapist based in Copenhagen. Macro botanicals, light, shadow and the Danish coast.',
  image: 'assets/img/hero-bloom.svg',
  lightbox: true,
  graph: [PERSON, { '@type': 'WebSite', '@id': SITE + '#site', name: 'Zenna Lua', url: SITE, inLanguage: 'en', publisher: { '@id': SITE + '#zenna' } }],
};

const featured = ['untitled-poppy-i', 'afternoon-wall', 'koge-bugt-2140', 'untitled-clematis', 'self-facing-up', 'green-hour']
  .map((slug) => workCard(WORKS.find((work) => work.slug === slug)))
  .join('\n');

export const body = `
  <section class="hero">
    <div class="hero__media">
      <img src="assets/img/hero-bloom.svg" alt="Placeholder artwork: a red bloom opening across warm ochre light" width="1600" height="1100" fetchpriority="high" decoding="async">
      <div class="hero__veil"></div>
    </div>
    <div class="shell hero__body">
      <p class="eyebrow">Photographic artist &middot; Copenhagen</p>
      <h1>Like a flower<br>you shall bloom</h1>
      <p class="hero__tagline">&ldquo;There&rsquo;s only one of you &mdash; enjoy it.&rdquo;</p>
      <div class="button-row">
        <a class="button button--light" href="works.html">See the work</a>
        <a class="button button--light" href="exhibitions.html">Exhibitions</a>
      </div>
    </div>
  </section>

  <section class="section shell">
    <div class="split split--portrait">
      <div class="frame frame--tall" data-reveal>
        <img src="assets/img/about-portrait.svg" alt="Placeholder artwork: a figure turned toward light, leaves crossing the frame" width="1100" height="1400" loading="lazy" decoding="async">
      </div>
      <div data-reveal>
        <p class="eyebrow">Statement</p>
        <h2>Photographs made<br>at the pace of<br>a slow breath.</h2>
        <p class="lede">I photograph the smallest openings &mdash; a petal unfolding, a shadow crossing a wall, the last light lying flat on the water at Greve Strand.</p>
        <p>The work sits between two practices that are really one. I trained as an artist at Engelsholm Kunsth&oslash;jskole and as a psychotherapist at Dansk NLP Center, and I have worked with both since 2018. In the therapy room I hold space for what wants to open. With a camera I do the same thing, only quieter.</p>
        <p>Nothing in these frames is arranged. I wait, and the light arrives, and the flower does not deny its own blossoming.</p>
        <p><a href="about.html">More about the practice &rarr;</a></p>
      </div>
    </div>
  </section>

  <hr class="rule">

  <section class="section">
    <div class="shell">
      <div class="section-head" data-reveal>
        <div>
          <p class="eyebrow">Selected works</p>
          <h2><a href="series.html">Three series</a></h2>
        </div>
        <a class="button" href="works.html">All works</a>
      </div>

      <div class="cards">
        <article class="card" data-reveal>
          <span class="card__index">01 &mdash; Bloom</span>
          <h3><a href="series-like-a-flower.html">Like a flower you shall bloom</a></h3>
          <p class="quiet">Macro studies of poppies, clematis and hollyhock, photographed at the moment of full opening. Colour left exactly as the sun made it.</p>
        </article>
        <article class="card" data-reveal>
          <span class="card__index">02 &mdash; Shadow</span>
          <h3><a href="series-gigantically-subtle.html">Gigantically Subtle</a></h3>
          <p class="quiet">Leaf shadows moving across a sunlit wall over the course of an afternoon. The subject is not the plant; it is the passing.</p>
        </article>
        <article class="card" data-reveal>
          <span class="card__index">03 &mdash; Coast</span>
          <h3><a href="series-hour-of-gold.html">Greve, at the hour of gold</a></h3>
          <p class="quiet">Water, horizon and low sun along the Danish coast &mdash; the landscape I grew up beside and keep returning to.</p>
        </article>
      </div>
    </div>
  </section>

  <section class="section section--sand">
    <div class="shell">
      <div class="gallery">
${featured}
      </div>
    </div>
  </section>

  <section class="section--tight section">
    <div class="shell shell--narrow" data-reveal>
      <blockquote class="pull-quote">
        No flower denies its own blossoming.
        <cite>Wall text, &ldquo;Like a flower you shall bloom&rdquo;</cite>
      </blockquote>
    </div>
  </section>

  <hr class="rule">

  <section class="section shell">
    <div class="split">
      <div class="frame frame--wide" data-reveal>
        <img src="assets/img/exhibition-iseeyou.svg" alt="Placeholder artwork: two soft figures in violet light" width="1400" height="900" loading="lazy" decoding="async">
      </div>
      <div data-reveal>
        <p class="eyebrow">Also on</p>
        <h2>I See You</h2>
        <p class="lede">Eye gazing, mirror meditation and live music &mdash; a deeply reflective journey.</p>
        <p>An evening built with musicians and held as carefully as a photograph is held: slow, unforced, in the light of what you already carry. Guided by Zenna Grundtvig, with live music.</p>
        <p><a href="i-see-you.html">Dates and details &rarr;</a></p>
      </div>
    </div>
  </section>
`;
