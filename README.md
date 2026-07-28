# Zenna Lua — portfolio site

Static portfolio site for **Zenna Lua / Zenna Grundtvig** — photographic artist,
digital creator and psychotherapist, Copenhagen. Plain HTML, one stylesheet, one
small JS file. No build step, no dependencies, no network calls.

```
da.html             Dansk — a Danish-language summary of the whole site
now.html            Now — what is on in the studio at the moment
index.html          Home — hero, statement, three series, selected works, lightbox
series.html         Series index — the three bodies of work
works.html          Full gallery, filterable by series (deep-linkable #bloom …), lightbox
series-like-a-flower.html        Series page — statement, spec table, six frames
series-gigantically-subtle.html  Series page — the sequence of nine, 14:30 → 17:40
series-hour-of-gold.html         Series page — six evenings on the coast
exhibitions.html    Current / ongoing / upcoming shows + archive timeline
i-see-you.html      Gathering page — the guided evening, three movements, FAQ
kvindecirkel.html   Gathering page — the seasonal women's circle, four turnings
journal.html        Words — short writing, Danish and English
prints.html         Print sizes, editions, ordering steps, FAQ
press.html          Press & curators — three bios, facts, what travels, press images
sessions.html       Psychotherapy practice — the work, what people bring, practical FAQ
about.html          Bio, the two practices, timeline, method
contact.html        Contact form (mailto), direct details, newsletter
search.html         Client-side search over every page and work
colophon.html       Colophon — palette, type, and the decisions behind the build
work-<slug>.html    Twelve generated work pages — one per frame
404.html            Not-found page
robots.txt sitemap.xml
assets/css/style.css
assets/js/site.js
assets/img/*.svg    Generated placeholder artwork
tools/generate-placeholders.mjs
tools/audit-pages.mjs      links, images, console, mobile overflow, no-JS
tools/audit-contrast.mjs   WCAG AA in both colour schemes
tools/audit-keyboard.mjs   tab order, focus trap, heading outline
tools/audit-motion.mjs     reduced motion, CLS, lang tagging, image dimensions
tools/audit-meta.mjs       unique titles/descriptions, Open Graph, JSON-LD validity
tools/audit-orphans.mjs    unused images, unlinked/unreachable pages, sitemap drift
tools/audit-html.mjs       duplicate ids, dangling references, unnamed controls, tag balance
tools/build-search-index.mjs  regenerates assets/search-index.json
tools/build-work-pages.mjs    regenerates the twelve work pages from works-data.mjs
tools/works-data.mjs          the works themselves — titles, sizes, notes, series
tools/pages.mjs               the page list every audit walks
```

## Behaviour

- **Filtering** (`works.html`): the series buttons write a hash (`works.html#coast`),
  and a hash on load selects that series. An `aria-live` line reports the count.
- **Gallery order**: the wall is a row-major CSS grid with JS-assigned row spans,
  not CSS multi-column. Multi-column fills column-by-column, which put ten of
  twelve works in a visual position that did not match DOM (and tab) order.
  Without JS it degrades to plain ragged rows — still correctly ordered.
- **Search**: `search.html` fetches `assets/search-index.json` (65 records: 15
  pages + 50 works), scores title/summary/heading/body matches, supports
  `?q=…` deep links, and folds ø/æ/å so "kvindecirkel" matches. With JS off the
  page lists every destination by hand. Results are ranked by title/summary/
  heading weight, then by term density, then by title length.
- **Long titles are safe**: captions wrap with `overflow-wrap: anywhere` — an
  unbroken 57-character title used to push the card past its column and throw
  the whole page into horizontal scroll on mobile.
- **Work cards are links**, not buttons: each points at the full-size image, so
  with JS off a click opens the picture, and cmd/ctrl-click still opens a new tab.
  The lightbox intercepts plain clicks only.
- **Every work has a page.** `work-<slug>.html` carries the frame full size, its
  note, series, size and edition, prev/next navigation and `VisualArtwork`
  JSON-LD. Gallery cards point at these pages, so a no-JS click now lands on a
  real page instead of a bare SVG — with JS the lightbox still intercepts.
  Regenerate with `node tools/build-work-pages.mjs` after editing `works-data.mjs`.
- **Shareable frames**: opening a work writes `#view=<image-slug>`, so a viewer
  can send the exact frame they are looking at. That link opens straight into
  the viewer; closing it restores the previous hash; unknown slugs are ignored.
- **Lightbox**: click any work; arrow keys / on-screen arrows / swipe to move,
  `Esc` or backdrop-click to close, `1 / 12` counter, focus trapped while open,
  neighbouring images preloaded.
- **Everything degrades**: reveal animations are gated behind a `.js` class set by
  a one-line inline script in each `<head>`, so with JS off nothing is stuck at
  `opacity: 0` — all works stay visible and every image is a normal `<img>`; only
  the lightbox and filters go away.
- **Keyboard**: filtered-out works leave the tab order entirely (`.work[hidden]`
  must beat `.work { display: block }`), the lightbox opens on Enter, traps Tab
  across its three controls, and returns focus to the work that opened it.
- **Accessibility**: a skip link on every page, `main#main` landmark, focus-visible
  rings, `aria-current` on the active nav item, and every text/background pair in
  both colour schemes meets WCAG AA (audited with `tools/audit-contrast.mjs`),
  and heading levels never skip on any page.
- **Loading**: every `<img>` carries intrinsic `width`/`height` and `decoding="async"`;
  heroes get `fetchpriority="high"`, everything else `loading="lazy"`. Measured CLS
  is 0 on all 14 pages.
- **Language**: the page is `lang="en"`, and Danish passages (Kvindecirkel, the
  seasonal names, the Danish note on Words) carry `lang="da"` so screen readers
  switch voice.
- **Structured data**: JSON-LD on every page — `Person` + `WebSite` on the home
  page, `CreativeWorkSeries` per series, `Event` for the two gatherings,
  `Service` for sessions, `ItemList` of print offers, `Blog` for Words, and a
  `BreadcrumbList` everywhere else.
- **Never colour alone**: exhibition status uses a filled dot in a solid pill for
  live states and a hollow dot in a dashed pill for quiet ones, so it survives
  greyscale (WCAG 1.4.1).
- **Mail forms actually send.** A form posting to `mailto:` is silently dropped by
  Chrome, so the contact and newsletter forms compose the mail URL themselves
  (subject, body, name, address) and always leave a visible fallback link. Native
  validation still blocks an empty submit.
- **Text zoom**: at a 200% text size the header nav (seven items) used to run
  406px off a 1024px window on every page, and grid tracks blew out on three
  more. The header now wraps on content rather than at a viewport breakpoint,
  grid children carry `min-width: 0`, and rem max-widths are clamped with
  `min(…, 100%)`. 200% text, 200% browser zoom and 320px are all clean.
- **Forced colours**: under Windows High Contrast the hero scrim disappears and
  white heading text would sit on bare photography, so hero copy gets a solid
  `Canvas` plate, and buttons, filters, cards and thumbnails re-state their
  borders with system colours.
- **Increased contrast**: `prefers-contrast: more` darkens secondary text, firms up
  rules, and draws borders on cards, inputs and thumbnails. All pairs clear AAA
  (6.9–14.2:1) in both schemes.
- **Print**: a `@media print` block drops the header, footer, filters, forms and
  series navigation, flattens the heroes, forces reveals visible, prints the
  gallery two-up and appends `href`s after external links. Body imagery is capped
  at 7cm so a photograph never claims a page to itself; verified by rendering
  each page to PDF (press: 4 pages, prints: 3, works: 3).

## Audits

One command runs everything, serving the working tree itself and exiting non-zero
if anything fails:

```bash
node tools/audit.mjs                      # whole suite
node tools/audit.mjs --only=contrast,meta # a subset
node tools/audit.mjs http://localhost:8080  # against a running server
```

It shares one browser across all pages and only opens extra contexts for the
modes that need one (dark, no-JS, reduced motion, forced colours, 200% text,
320px). Checks: links, broken images, console errors, contrast in both schemes,
heading outline, metadata and JSON-LD, Danish language tagging, image dimensions,
responsive overflow, keyboard and focus behaviour, plus the two static audits.

Timings on this machine: the full sweep is about 16 minutes, and `--only` is what
you actually want day to day — `--only=keyboard,modes,nojs` finishes in under ten
seconds. Parallel lanes are available via `--workers=N` but measured *slower*
here (four lanes: 1060s against 943s serial), so the default is one.

Navigation occasionally stalls in this driver — a different page each time, and
the page always loads fine on its own. The runner retries such a navigation on a
fresh page and reports the retry count in its summary rather than hiding it.

The single-concern tools below still exist and print JSON, which is handy when
you want detail on one area:

```bash
node tools/audit-pages.mjs    http://localhost:8080
node tools/audit-contrast.mjs http://localhost:8080
node tools/audit-keyboard.mjs http://localhost:8080
node tools/audit-motion.mjs   http://localhost:8080
node tools/audit-meta.mjs     http://localhost:8080
node tools/audit-orphans.mjs                              # no server needed
node tools/audit-html.mjs                                 # no server needed
```

They drive a headless Chromium from the local Playwright cache; empty arrays and
zeroes mean clean.

## Run it

Any static server, or just open `index.html`:

```bash
python3 -m http.server 8080      # or
npx serve .
open http://localhost:8080
```

## Theme — "Blomstring"

Derived from the visual language of the Facebook profile: macro botanicals on
warm ochre, leaf shadows on plaster, golden-hour Danish coast, poetic serif text
over sand-coloured grounds.

| Token | Value | Use |
| --- | --- | --- |
| `--sand` | `#F6EFE4` | page ground |
| `--sand-deep` | `#ECE0CF` | alternating sections |
| `--paper` | `#FFFAF3` | cards, inputs |
| `--ink` | `#2A2622` | body text |
| `--poppy` | `#B33A2B` | primary accent, links on hover |
| `--ochre` | `#C9873A` | warm secondary |
| `--sage` | `#7C8B6F` | botanical secondary |
| `--dusk` | `#5B3F7A` | cool secondary |

- **Display type**: Iowan Old Style / Palatino / Georgia stack — high-contrast
  serif, tight leading, used large and sparingly.
- **Body type**: Avenir Next / system sans, 1.75 line-height, `62ch` measure.
- **Eyebrows and buttons**: 0.22em uppercase tracking.
- **Motion**: everything eases on `cubic-bezier(.22,.61,.36,1)` over ~1s; hero
  drifts in; sections reveal on scroll. All of it collapses under
  `prefers-reduced-motion`.
- **Dark mode**: full `prefers-color-scheme: dark` palette (dusk-violet ground,
  warm sand ink).

## Search index

`assets/search-index.json` is generated. Rebuild it whenever page copy changes:

```bash
node tools/build-search-index.mjs
```

## Placeholder images

Every image is a generated SVG in the theme palette — four kinds: `bloom`
(macro flower), `shadow` (leaf shadows on a wall), `horizon` (golden-hour water),
`portrait` (soft figure). Regenerate deterministically:

```bash
node tools/generate-placeholders.mjs
```

Swap in real photographs by replacing the files in `assets/img/` (keep the
filenames, or update the `src`/`data-lightbox-open` pairs in the HTML). Aspect
ratios in use: 4:5 portrait, 3:2 landscape, 1:1 square.

## What is real vs. placeholder

**Taken from the public Facebook profile** (facebook.com/ZennaGrundtvig):
name Zenna Lua / Zenna Grundtvig, Copenhagen, from Greve Strand, born 1991,
"Digital kreatør", psychotherapist and self-employed since 2018, Engelsholm
Kunsthøjskole, Dansk NLP Center, bio line *"There's only one of you — enjoy it"*,
exhibition title *"Like a flower you shall bloom"* (23 April – 31 May) with the
line *"No flower denies its own blossoming"*, series title *"Gigantically Subtle"*,
and the gatherings *I See You* (eye gazing, mirror meditation & live music),
*Kvindecirkel*, *Når død ligner fødsel*, *Hello Creator*, *With Ro & Zenna*.

**Written as placeholder copy** — replace before publishing: all artwork titles,
print sizes, editions and prices, venue names, years, group sizes, shipping
rates, the email `hello@zennalua.dk`, the newsletter cadence, every entry on the
Words page, and every body paragraph. The statement, notes and method texts are
written in her voice but are not her words.

## Before going live

- Replace placeholder SVGs with real photographs (and write real `alt` text).
- Point the two forms at a real endpoint (Formspree, Netlify Forms, etc.) —
  they currently use `mailto:`.
- Set the real email address and any social links.
- Add real dates/years to exhibitions.
- Swap the `example.com` URLs in `robots.txt`, `sitemap.xml` and the `og:image`
  tags for the real domain (Open Graph wants absolute URLs).
- Optional: add a favicon PNG for clients that ignore SVG icons.
