import { crumbs } from '../chrome.mjs';

export const meta = {
  title: 'Contact',
  description: 'Contact Zenna Lua for prints, exhibitions, guided evenings and therapy sessions. Copenhagen, Denmark.',
  image: 'assets/img/work-11-clematis.svg',
  graph: [crumbs([{ name: 'Home', path: '' }, { name: 'Contact', path: 'contact.html' }])],
};

export const body = `
  <section class="section--tight section shell">
    <div data-reveal>
      <p class="eyebrow">Contact</p>
      <h1 class="measure-14">Say hello</h1>
      <p class="lede measure-50">Prints, exhibitions, a guided evening in your space, or a session. Write in Danish or English &mdash; whichever comes easier.</p>
    </div>
  </section>

  <section class="section section--flush">
    <div class="shell">
      <div class="split split--top">

        <div data-reveal>
          <form class="form" data-mailto-form data-mailto="hello@zennalua.dk" action="mailto:hello@zennalua.dk" method="get" enctype="text/plain">
            <div class="field">
              <label for="name">Your name</label>
              <input id="name" name="name" type="text" autocomplete="name" required>
            </div>
            <div class="field">
              <label for="email">Email</label>
              <input id="email" name="email" type="email" autocomplete="email" required>
            </div>
            <div class="field">
              <label for="subject">This is about</label>
              <select id="subject" name="subject">
                <option>A print</option>
                <option>An exhibition</option>
                <option>A guided evening or circle</option>
                <option>A therapy session</option>
                <option>Something else</option>
              </select>
            </div>
            <div class="field">
              <label for="message">Message</label>
              <textarea id="message" name="message" required></textarea>
            </div>
            <div class="button-row">
              <button class="button" type="submit">Send message</button>
            </div>
            <p class="form__status" data-form-status role="status" aria-live="polite"></p>
            <!-- TODO(zenna): swap the mailto composition for a real form endpoint.
                 The note below is for the visitor and explains what pressing Send
                 does; the instruction to replace this was in it by mistake and was
                 being read by anyone on the contact page. -->
            <p class="form__note">Sending opens your own mail app with the message ready to go &mdash; nothing is stored on this site.</p>
          </form>
        </div>

        <div data-reveal>
          <div class="frame frame--tall space-bottom-lg">
            <img src="assets/img/work-11-clematis.svg" alt="Placeholder artwork: deep violet petals with a lit centre" width="1200" height="1200" loading="lazy" decoding="async">
          </div>
          <h2 class="minor-heading">Direct</h2>
          <ul class="plain-list space-bottom-lg">
            <li><a href="mailto:hello@zennalua.dk">hello@zennalua.dk</a></li>
            <li><a href="https://www.facebook.com/ZennaGrundtvig">facebook.com/ZennaGrundtvig</a></li>
            <li class="quiet">Copenhagen, Denmark</li>
          </ul>
          <h2 class="minor-heading">Response time</h2>
          <p class="quiet">Usually within a few days. If it is about a session, say a little about what you are looking for and I will send available times.</p>

          <h2 class="minor-heading space-top-2xl">Before you write</h2>
          <p class="quiet">Most questions are already answered somewhere:</p>
          <ul class="plain-list">
            <li><a href="prints.html">Prints</a> &mdash; sizes, editions, what a print costs</li>
            <li><a href="sessions.html">Sessions</a> &mdash; how the therapy work runs, and what it costs</li>
            <li><a href="visit.html">Visit</a> &mdash; opening hours, access, getting there</li>
            <li><a href="press.html">Press</a> &mdash; bios and images, free to use</li>
          </ul>
        </div>

      </div>
    </div>
  </section>

  <section class="section section--sand">
    <div class="shell shell--narrow centred" data-reveal>
      <p class="eyebrow">Letters</p>
      <h2>A slow newsletter</h2>
      <p class="centred-measure">New series, exhibition dates and the occasional long thought. Sent when there is something to send &mdash; a handful of times a year, never more.</p>
      <form class="form form--centred" data-mailto-form data-mailto="hello@zennalua.dk" data-subject="Newsletter signup" action="mailto:hello@zennalua.dk" method="get" enctype="text/plain">
        <div class="field">
          <label class="visually-hidden" for="newsletter-email">Email address</label>
          <input id="newsletter-email" name="newsletter" type="email" placeholder="you@example.com" required>
        </div>
        <div class="button-row button-row--centred">
          <button class="button" type="submit">Subscribe</button>
        </div>
        <p class="form__status" data-form-status role="status" aria-live="polite"></p>
      </form>
    </div>
  </section>
`;
