import { SITE, crumbs } from '../chrome.mjs';

export const meta = {
  title: 'Visit',
  description: 'How to see the work in person: exhibition opening hours, getting there, access, and visiting the studio in Copenhagen.',
  image: 'assets/img/exhibition-bloom.svg',
  graph: [
    {
      '@type': 'VisualArtsEvent',
      '@id': SITE + 'visit.html#exhibition',
      name: 'Like a flower you shall bloom',
      description: 'A photo exhibition of macro botanicals, free entry.',
      image: SITE + 'assets/img/exhibition-bloom.svg',
      url: SITE + 'visit.html',
      organizer: { '@id': SITE + '#zenna' },
      eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
      isAccessibleForFree: true,
      location: {
        '@type': 'Place',
        name: 'Exhibition space, Copenhagen',
        address: { '@type': 'PostalAddress', streetAddress: 'Address to be confirmed', addressLocality: 'Copenhagen', postalCode: '1000', addressCountry: 'DK' },
        publicAccess: true,
      },
    },
    crumbs([{ name: 'Home', path: '' }, { name: 'Exhibitions', path: 'exhibitions.html' }, { name: 'Visit', path: 'visit.html' }]),
  ],
};

const HOURS = [
  ['Monday', 'Closed'],
  ['Tuesday &ndash; Thursday', '12:00 &ndash; 18:00'],
  ['Friday', '12:00 &ndash; 20:00'],
  ['Saturday', '11:00 &ndash; 17:00'],
  ['Sunday', '11:00 &ndash; 16:00'],
];

const ACCESS = [
  ['Step-free', 'The room is at street level with no step at the door. The doorway is 90 cm wide.'],
  ['Seating', 'Two benches in the middle of the room, and a folding chair anyone can move to where they want it.'],
  ['Light and sound', 'Daylight plus warm spots, no flashing or strobing, no soundtrack. It is a quiet room.'],
  ['Toilet', 'Accessible toilet in the building, through the door at the back on the left.'],
  ['Assistance dogs', 'Welcome, and there is water for them by the desk.'],
  ['Quiet hour', 'Sunday 11:00 &ndash; 12:00 is kept deliberately low-traffic. Say so and I will keep it that way.'],
];

const GETTING_THERE = [
  ['Metro', 'Nearest station is a few minutes away on foot; the walk is flat and paved.'],
  ['Bicycle', 'Racks directly outside. This is Copenhagen &mdash; most people arrive this way.'],
  ['Bus', 'Two routes stop within a hundred metres.'],
  ['Car', 'Paid street parking, which is a poor idea on a Saturday.'],
];

export const body = `
  <section class="series-hero series-hero--short">
    <div class="series-hero__media">
      <img src="assets/img/exhibition-bloom.svg" alt="Placeholder artwork: red bloom on warm ochre, exhibition key image" width="1400" height="900" fetchpriority="high" decoding="async">
    </div>
    <div class="shell series-hero__body">
      <nav class="crumbs" aria-label="Breadcrumb">
        <a href="exhibitions.html">Exhibitions</a> <span aria-hidden="true">/</span> <span>Visit</span>
      </nav>
      <p class="eyebrow">Free entry &middot; Copenhagen</p>
      <h1>Come and see it</h1>
      <p class="lede measure-44">Everything on this site is a photograph of a photograph. The prints are the actual work, and they are worth standing in front of.</p>
    </div>
  </section>

  <section class="section shell">
    <div class="split split--top">
      <div data-reveal>
        <p class="eyebrow">Most recent show</p>
        <h2><a href="series-like-a-flower.html">Like a flower you shall bloom</a></h2>
        <p class="lede">This show has closed. Between shows there is nothing hanging, so a
        studio visit is the way to see prints in person &mdash; by arrangement, one at a
        time. <a href="now.html">Now</a> says what is currently on.</p>
        <p>While it was up: eighteen archival pigment prints, hung low and lit warm, in one room. It took about twenty minutes to see properly and rather longer if you sat down, which is what the benches are for.</p>
        <p class="quiet">Bring children to the next one. They are better at this than adults are.</p>
      </div>
      <dl class="spec" data-reveal>
        <div><dt>Ran</dt><dd>23 April &ndash; 31 May</dd></div>
        <div><dt>Entry</dt><dd>Free, no booking</dd></div>
        <div><dt>Works</dt><dd>18 prints</dd></div>
        <div><dt>Where</dt><dd>Copenhagen &mdash; address to be confirmed</dd></div>
        <div><dt>Next show</dt><dd>Not yet announced</dd></div>
        <div><dt>Meanwhile</dt><dd><a href="contact.html">Ask about a studio visit</a></dd></div>
      </dl>
    </div>
  </section>

  <hr class="rule">

  <section class="section shell">
    <div data-reveal class="section-intro">
      <p class="eyebrow">Opening hours</p>
      <h2>When the door is open, while a show is up</h2>
      <p class="quiet measure-52">These are the exhibition hours, not this week&rsquo;s. With nothing
      hanging the room is not open to drop in on &mdash; a studio visit is arranged by
      message instead.</p>
    </div>
    <div class="table-scroll" data-reveal>
      <table class="price-table price-table--narrow">
        <caption class="visually-hidden">Opening hours by day</caption>
        <thead>
          <tr>
            <th scope="col">Day</th>
            <th scope="col">Hours</th>
          </tr>
        </thead>
        <tbody>
${HOURS.map(([day, hours]) => `          <tr>
            <th scope="row">${day}</th>
            <td>${hours}</td>
          </tr>`).join('\n')}
        </tbody>
      </table>
    </div>
    <p class="form__note space-top">Hours and address are placeholders until the venue is confirmed. Write if you are travelling for it and I will tell you exactly.</p>
  </section>

  <section class="section section--sand">
    <div class="shell">
      <div data-reveal class="section-intro">
        <p class="eyebrow">Access</p>
        <h2>What the room is like</h2>
        <p class="quiet">Written out properly, because &ldquo;accessible&rdquo; on its own tells you nothing.</p>
      </div>
      <ul class="decision-list measure-none" data-reveal>
${ACCESS.map(([lead, rest]) => `        <li><strong>${lead}.</strong> ${rest}</li>`).join('\n')}
      </ul>
    </div>
  </section>

  <section class="section shell">
    <div class="split split--top">
      <div data-reveal>
        <p class="eyebrow">Getting there</p>
        <h2>However you travel</h2>
        <ul class="decision-list">
${GETTING_THERE.map(([lead, rest]) => `          <li><strong>${lead}.</strong> ${rest}</li>`).join('\n')}
        </ul>
      </div>
      <div data-reveal>
        <p class="eyebrow">The studio</p>
        <h2 class="minor-heading">Outside the exhibition</h2>
        <p>When nothing is hanging, prints can still be seen in the studio by arrangement &mdash; useful if you are choosing something for a particular wall and want to hold the paper first.</p>
        <p>Studio visits are one at a time, usually mid-week, and take about an hour.</p>
        <div class="button-row space-top-lg">
          <a class="button" href="contact.html">Arrange a visit</a>
          <a class="button" href="prints.html">See print sizes</a>
        </div>
      </div>
    </div>
  </section>

  <hr class="rule">

  <section class="section shell">
    <div class="series-nav">
      <a class="series-nav__link" href="exhibitions.html" data-reveal>
        <span class="series-nav__label">Back to</span>
        <span class="series-nav__title">Exhibitions &amp; gatherings</span>
      </a>
      <a class="series-nav__link series-nav__link--end" href="series-like-a-flower.html" data-reveal>
        <span class="series-nav__label">See it here first</span>
        <span class="series-nav__title">Like a flower you shall bloom</span>
      </a>
    </div>
  </section>
`;
