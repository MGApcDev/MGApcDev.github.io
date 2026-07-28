import { SITE, crumbs } from '../chrome.mjs';

export const meta = {
  title: 'Zenna Lua — fotografisk kunstner og psykoterapeut i K&oslash;benhavn',
  description: 'Zenna Lua er fotografisk kunstner og psykoterapeut i K&oslash;benhavn. Udstillinger, tryk, sessioner og kvindecirkel — kort fortalt p&aring; dansk.',
  image: 'assets/img/hero-bloom.svg',
  lang: 'da',
  graph: [
    { '@type': 'WebPage', '@id': SITE + 'da.html#page', name: 'Zenna Lua — på dansk', inLanguage: 'da', about: { '@id': SITE + '#zenna' }, url: SITE + 'da.html' },
    crumbs([{ name: 'Home', path: '' }, { name: 'Dansk', path: 'da.html' }]),
  ],
};

const FOUR = [
  ['01', 'series.html', 'Fotografier', 'Tre serier: blomster t&aelig;t p&aring;, skygger p&aring; en mur gennem en eftermiddag, og lyset over K&oslash;ge Bugt.', 'en'],
  ['02', 'sessions.html', 'Sessioner', 'Individuel psykoterapi, 60 minutter, i K&oslash;benhavn eller online. F&oslash;rste samtale er gratis og forpligter ikke.', 'en'],
  ['03', 'kvindecirkel.html', 'Kvindecirkel', 'Fire aftener om &aring;ret, ved j&aelig;vnd&oslash;gn og solhverv. Foreg&aring;r p&aring; dansk. 10&ndash;14 kvinder.', null],
  ['04', 'prints.html', 'Tryk', 'Arkivtryk p&aring; bomuldspapir, signeret og nummereret. Fire st&oslash;rrelser, fra 1.400 kr.', 'en'],
];

export const body = `
  <section class="series-hero series-hero--short">
    <div class="series-hero__media">
      <img src="assets/img/hero-bloom.svg" alt="Pladsholder: en r&oslash;d blomst der &aring;bner sig i varmt lys" width="1600" height="1100" fetchpriority="high" decoding="async">
    </div>
    <div class="shell series-hero__body">
      <p class="eyebrow">P&aring; dansk</p>
      <h1>Zenna Lua</h1>
      <p class="lede measure-44">Fotografisk kunstner og psykoterapeut i K&oslash;benhavn. Resten af siden er p&aring; engelsk &mdash; her er det vigtigste p&aring; dansk.</p>
    </div>
  </section>

  <section class="section shell">
    <div class="split split--top">
      <div data-reveal>
        <p class="eyebrow">Kort fortalt</p>
        <h2>To praksisser, samme opm&aelig;rksomhed</h2>
        <p>Jeg er f&oslash;dt i 1991 i Greve Strand og bor i K&oslash;benhavn. Jeg har g&aring;et p&aring; <strong>Engelsholm Kunsth&oslash;jskole</strong> og er uddannet psykoterapeut fra <strong>Dansk NLP Center</strong>. Siden 2018 har jeg arbejdet selvst&aelig;ndigt med begge dele.</p>
        <p>Billederne er ikke arrangerede. Jeg fotograferer det, der allerede er der &mdash; en skygge p&aring; en mur, en blomst en dag over sit h&oslash;jdepunkt, mit eget ansigt vendt op mod solen &mdash; i dagslys, og lader det ellers v&aelig;re.</p>
        <p>I terapirummet g&oslash;r jeg det samme: holder rummet roligt nok til, at du kan holde op med at sp&aelig;nde. Det meste &aring;bner sig selv derfra.</p>
      </div>
      <dl class="spec" data-reveal>
        <div><dt>Bor i</dt><dd>K&oslash;benhavn</dd></div>
        <div><dt>Fra</dt><dd>Greve Strand</dd></div>
        <div><dt>Uddannet</dt><dd>Engelsholm Kunsth&oslash;jskole, Dansk NLP Center</dd></div>
        <div><dt>Selvst&aelig;ndig</dt><dd>Siden 2018</dd></div>
        <div><dt>Sprog</dt><dd>Dansk og engelsk</dd></div>
        <div><dt>Skriv til</dt><dd><a href="mailto:hello@zennalua.dk">hello@zennalua.dk</a></dd></div>
      </dl>
    </div>
  </section>

  <hr class="rule">

  <section class="section">
    <div class="shell">
      <div data-reveal class="section-intro">
        <p class="eyebrow">Hvad jeg laver</p>
        <h2>Fire ting</h2>
      </div>
      <div class="cards">
${FOUR.map(([index, href, title, text, hreflang]) => `        <article class="card" data-reveal>
          <span class="card__index">${index}</span>
          <h3><a href="${href}"${hreflang ? ` hreflang="${hreflang}"` : ''}>${title}</a></h3>
          <p class="quiet">${text}</p>
        </article>`).join('\n')}
      </div>
    </div>
  </section>

  <section class="section--tight section">
    <div class="shell shell--narrow" data-reveal>
      <blockquote class="pull-quote">
        Der er kun &eacute;n af dig &mdash; nyd det.
        <cite>Zenna Lua</cite>
      </blockquote>
    </div>
  </section>

  <section class="section section--sand">
    <div class="shell shell--narrow centred" data-reveal>
      <p class="eyebrow">Skriv endelig</p>
      <h2>Det beh&oslash;ver ikke v&aelig;re formuleret</h2>
      <p class="centred-measure">Skriv et par linjer om hvad der er p&aring; spil, eller sp&oslash;rg til et tryk, en plads i en cirkel eller en udstilling. Jeg svarer p&aring; dansk.</p>
      <div class="button-row button-row--centred space-top-lg">
        <a class="button" href="contact.html" hreflang="en">Kontakt</a>
        <a class="button" href="index.html" hreflang="en">In English</a>
      </div>
      <p class="form__note space-top-2xl">Alt indhold p&aring; siden er pladsholdertekst indtil videre.</p>
    </div>
  </section>
`;
