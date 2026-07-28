import { PERSON, crumbs } from '../chrome.mjs';

export const meta = {
  title: 'About',
  description: 'Zenna Lua (Zenna Grundtvig), born 1991 in Greve Strand, based in Copenhagen. Photographic artist, digital creator and psychotherapist.',
  image: 'assets/img/about-portrait.svg',
  graph: [PERSON, crumbs([{ name: 'Home', path: '' }, { name: 'About', path: 'about.html' }])],
};

export const body = `
  <section class="section--tight section shell">
    <div class="split split--portrait">
      <div class="frame frame--tall" data-reveal>
        <img src="assets/img/about-portrait.svg" alt="Placeholder artwork: a figure turned toward light among green leaves" width="1100" height="1400" fetchpriority="high" decoding="async">
      </div>
      <div data-reveal>
        <p class="eyebrow">About</p>
        <h1 class="title-lg">Zenna Lua</h1>
        <p class="lede">Photographic artist, digital creator and psychotherapist. Born 1991 in Greve Strand, working from Copenhagen.</p>
        <p>I grew up beside K&oslash;ge Bugt, which means I grew up beside a horizon. That flat line and the light it does at the end of a day is still the thing I am photographing, whether the subject is water or the inside of a poppy.</p>
        <p>I studied at <strong>Engelsholm Kunsth&oslash;jskole</strong>, and trained as a psychotherapist at <strong>Dansk NLP Center</strong>. Since 2018 I have worked for myself in both: sessions with clients, and pictures. People sometimes ask which one is the real job. They are one job. Both are about staying with something long enough that it opens.</p>
        <p>The pictures are not staged and not heavily worked. I photograph what is already there &mdash; a shadow on a wall, a flower a day past its peak, my own face turned up into the sun &mdash; and then I mostly leave it alone.</p>
      </div>
    </div>
  </section>

  <hr class="rule">

  <section class="section">
    <div class="shell">
      <div data-reveal class="section-intro">
        <p class="eyebrow">The two practices</p>
        <h2>One way of paying attention</h2>
      </div>
      <div class="cards">
        <article class="card" data-reveal>
          <span class="card__index">Camera</span>
          <h3><a href="series.html">Photography</a></h3>
          <p class="quiet">Macro botanicals, shadow studies, coastline. Natural light only. Series built slowly, over seasons rather than sessions.</p>
        </article>
        <article class="card" data-reveal>
          <span class="card__index">Room</span>
          <h3><a href="sessions.html">Therapy</a></h3>
          <p class="quiet">Psychotherapeutic practice since 2018, trained at Dansk NLP Center. Individual sessions, held in Copenhagen and online.</p>
        </article>
        <article class="card" data-reveal>
          <span class="card__index">Circle</span>
          <h3><a href="i-see-you.html">Gatherings</a></h3>
          <p class="quiet">Guided evenings and women&rsquo;s circles combining images, eye gazing, mirror meditation and live music.</p>
        </article>
      </div>
    </div>
  </section>

  <section class="section--tight section">
    <div class="shell shell--narrow" data-reveal>
      <blockquote class="pull-quote">
        There&rsquo;s only one of you &mdash; enjoy it.
        <cite>Zenna Lua</cite>
      </blockquote>
    </div>
  </section>

  <section class="section section--sand">
    <div class="shell">
      <div class="split">
        <div data-reveal>
          <p class="eyebrow">Background</p>
          <h2>Selected<br>timeline</h2>
          <p class="quiet">A short version. The longer version is in the pictures.</p>
        </div>
        <ul class="timeline" data-reveal>
          <li>
            <span class="timeline__when">1991</span>
            <span class="timeline__what"><strong>Born in Greve Strand</strong><span>Grew up beside K&oslash;ge Bugt on the Danish east coast.</span></span>
          </li>
          <li>
            <span class="timeline__when">Education</span>
            <span class="timeline__what"><strong>Engelsholm Kunsth&oslash;jskole</strong><span>Art school &mdash; where the photographic practice started.</span></span>
          </li>
          <li>
            <span class="timeline__when">Education</span>
            <span class="timeline__what"><strong>Dansk NLP Center</strong><span>Psychotherapist training.</span></span>
          </li>
          <li>
            <span class="timeline__when">2018 &ndash; now</span>
            <span class="timeline__what"><strong>Independent practice</strong><span>Psychotherapy and photographic work, self-employed, Copenhagen.</span></span>
          </li>
          <li>
            <!-- Was labelled "Now" for a show that closed on 31 May. A timeline
                 entry is dated by definition, so it gets the year rather than a
                 word that goes out of date on a known day. -->
            <span class="timeline__when">2026</span>
            <span class="timeline__what"><strong>Like a flower you shall bloom</strong><span>Photo exhibition, 23 April &ndash; 31 May.</span></span>
          </li>
        </ul>
      </div>
    </div>
  </section>

  <section class="section shell">
    <div class="split" data-reveal>
      <div class="frame frame--wide">
        <img src="assets/img/work-09-shadowwall.svg" alt="Placeholder artwork: warm ochre wall with drifting leaf shadows" width="1500" height="1000" loading="lazy" decoding="async">
      </div>
      <div>
        <p class="eyebrow">Method</p>
        <h2>How a series gets made</h2>
        <p>I find a place where light does something once a day, and I go back. Same wall, same stretch of beach, same plant in the same pot. Most days nothing happens. Then one afternoon the wind holds still for four seconds and the picture is there.</p>
        <p>Everything is shot on natural light, handheld, close. Colour is corrected but not invented &mdash; if a print looks like burnt orange, the wall was burnt orange.</p>
        <p><a href="series.html">See the series &rarr;</a></p>
      </div>
    </div>
  </section>
`;
