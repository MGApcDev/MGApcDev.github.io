import { SITE, crumbs } from '../chrome.mjs';

export const meta = {
  title: 'Words',
  description: 'Short writing by Zenna Lua — notes on blooming, shadow, endings that look like beginnings, and the light on the Danish coast.',
  image: 'assets/img/work-06-sage.svg',
  graph: [
    { '@type': 'Blog', '@id': SITE + 'journal.html#blog', name: 'Words', author: { '@id': SITE + '#zenna' }, url: SITE + 'journal.html', inLanguage: ['en', 'da'] },
    crumbs([{ name: 'Home', path: '' }, { name: 'Words', path: 'journal.html' }]),
  ],
};

/** The notes. `lang` marks a Danish entry so the article carries lang="da". */
export const NOTES = [
  {
    slug: 'no-flower-denies-its-own-blossoming',
    meta: 'Bloom &middot; English',
    title: 'No flower denies its own blossoming',
    paragraphs: [
      'A poppy does not wait to be told the light is good enough. It opens on the day it opens, in whatever weather is available, and it is not embarrassed about the mess of it &mdash; the crumpled first hour, the petals still folded from the bud.',
      'I have never once looked at a flower halfway open and thought: you should have waited.',
    ],
  },
  {
    slug: 'gigantically-subtle',
    meta: 'Shadow &middot; English',
    title: 'Gigantically subtle',
    paragraphs: [
      'The wall is the same wall every afternoon. What changes is a few degrees of sun and whether the wind is doing anything. That is the whole subject.',
      'People ask what the shadow pictures are of. They are of an ordinary Tuesday, photographed slowly enough that it stops being ordinary.',
    ],
  },
  {
    slug: 'nar-dod-ligner-fodsel',
    meta: 'Practice &middot; Dansk',
    title: 'N&aring;r d&oslash;d ligner f&oslash;dsel',
    lang: 'da',
    paragraphs: [
      'Noget slutter, og kroppen kender det f&oslash;r hovedet g&oslash;r. Det er den samme sammentr&aelig;kning som ved en begyndelse &mdash; samme &aring;ndedr&aelig;t, samme uro, samme lys der pludselig st&aring;r skarpt.',
      'Jeg fotograferer ofte fr&oslash;kapsler efter blomsten er faldet af. De ligner ikke d&oslash;d. De ligner opbevaring.',
    ],
  },
  {
    slug: 'twenty-one-forty',
    meta: 'Coast &middot; English',
    title: 'Twenty-one forty',
    paragraphs: [
      'In June the sun goes down over K&oslash;ge Bugt at around half nine and the water goes completely flat for about four minutes. If you are not already standing there you will miss it.',
      'That is most of what I know about making pictures: be standing there.',
    ],
  },
  {
    slug: 'holding-the-room',
    meta: 'Practice &middot; English',
    title: 'Holding the room',
    paragraphs: [
      'In a session I am not fixing anyone. I am keeping the room steady enough that the person in it can stop bracing. Almost everything opens on its own once the bracing stops.',
      'A camera asks for the same thing from me. Stop pushing. Stay. Let it come up to the surface by itself.',
    ],
  },
  {
    slug: 'there-s-only-one-of-you',
    meta: 'Bloom &middot; English',
    title: 'There&rsquo;s only one of you',
    paragraphs: [
      'Every clematis on that fence came off the same plant and not one of them is the same shape. Six petals, seven, one with a torn edge from the hail in May.',
      'Enjoy it. That is the whole instruction.',
    ],
  },
];

const notes = NOTES.map((note) => `        <article class="note" id="${note.slug}" data-reveal${note.lang ? ` lang="${note.lang}"` : ''}>
          <p class="note__meta"${note.lang ? ' lang="en"' : ''}>${note.meta}</p>
          <h2 class="note__title">${note.title}</h2>
${note.paragraphs.map((paragraph) => `          <p>${paragraph}</p>`).join('\n')}
        </article>`).join('\n\n');

export const body = `
  <section class="section--tight section shell">
    <div data-reveal>
      <p class="eyebrow">Words</p>
      <h1 class="measure-13">Notes beside the pictures</h1>
      <p class="lede measure-52">Short pieces written in the same practice as the photographs &mdash; usually after, sometimes instead. Danish and English, as they arrive.</p>
      <p class="quiet">Follow along <a href="feed.xml">by RSS</a>, or <a href="contact.html">by letter</a>.</p>
    </div>
  </section>

  <section class="section section--flush">
    <div class="shell">
      <div class="notes">

${notes}

      </div>
    </div>
  </section>

  <section class="section shell">
    <div class="centred-measure measure-52" data-reveal>
      <p class="quiet">These sit beside the pictures rather than explaining them. The work itself is
      in <a href="series-like-a-flower.html">Like a flower you shall bloom</a>,
      <a href="series-gigantically-subtle.html">Gigantically Subtle</a> and
      <a href="series-hour-of-gold.html">Greve, at the hour of gold</a>.</p>
    </div>
  </section>

  <section class="section section--sand">
    <div class="shell shell--narrow centred" data-reveal>
      <p class="eyebrow">Letters</p>
      <h2>Sent a few times a year</h2>
      <p class="centred-measure">New writing and new work, at the pace it actually gets made.</p>
      <div class="button-row button-row--centred space-top-lg">
        <a class="button" href="contact.html">Join the list</a>
      </div>
    </div>
  </section>
`;
