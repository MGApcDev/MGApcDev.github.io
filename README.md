# Zenna Lua — portfolio site

Static portfolio site for **Zenna Lua / Zenna Grundtvig** — photographic artist,
digital creator and psychotherapist, Copenhagen. Plain HTML, one stylesheet, two
small JS files. No framework, no dependencies, no network calls, nothing to
deploy but the files.

## Shape of it

Pages are **assembled from shared chrome**, not hand-written one by one. Head,
header, footer and lightbox markup live in `tools/chrome.mjs`; each page's body
lives in `tools/content/<name>.mjs`; `tools/build-pages.mjs` writes the HTML. The
twelve work pages come from `tools/works-data.mjs` the same way. The generated
HTML is committed — a deploy is still "copy these files onto a server".

```
index.html          Home — hero, statement, three series, selected works
da.html             Dansk — a Danish-language summary of the whole site
now.html            Now — what is on in the studio at the moment
works.html          Full gallery, filterable by series (deep-linkable #bloom …)
series.html         Series index — the three bodies of work
catalogue.html      Every work as a printable list: sizes, editions, places
series-*.html       One page per series: statement, spec, frames
exhibitions.html    Current / ongoing / upcoming shows + archive
visit.html          Visiting — hours, access written out properly, getting there
i-see-you.html      Gathering — the guided evening
kvindecirkel.html   Gathering — the seasonal women's circle
journal.html        Words — short writing, Danish and English
prints.html         Print sizes, editions, ordering, FAQ
sessions.html       The psychotherapy practice
press.html          Press & curators — bios, facts, what travels
about.html          Bio, the two practices, timeline, method
contact.html        Contact form, direct details, newsletter
colophon.html       Palette, type, and the decisions behind the build
404.html            Not-found page, with a way back in
work-<slug>.html    Twelve generated work pages — one per frame
```

## Building

```bash
node tools/build.mjs           # everything, in dependency order
node tools/build.mjs --check   # build, then fail if any tracked file moved
```

Order matters — placeholders before pages, pages before the feed, everything
before the sitemap — so it is one command rather than five to remember.
`--check` is the guard against committing a content edit without rebuilding: a
dirty tree after a build means the committed output no longer matches its source.

The individual steps still exist (`build-pages`, `build-work-pages`,
`build-feed`, `build-sitemap`, `generate-placeholders`). Social cards are separate because they need a browser
and only change when the artwork does:

```bash
node tools/build-social-images.mjs  # raster og:image cards + favicons
```

One wrinkle worth knowing: sitemap `lastmod` comes from git, so a page generated
before its source is committed ships without a date. Rerun the build after
committing — `--check` catches it.

## Checking what is deployed

```bash
node tools/audit-live.mjs                    # against mgapcdev.github.io
node tools/audit.mjs https://mgapcdev.github.io --only=contrast,meta
```

Local checks cannot see deploy-specific breakage. GitHub Pages is case-sensitive
where macOS is not, so a link to `Works.html` passes locally and 404s in
production; and the host, not the repo, decides status codes, content types and
compression. `audit-live.mjs` walks every internal reference on the real host,
confirms a missing page returns a styled 404 rather than 200, that text arrives
compressed, that `og:image` is absolute and resolves, and that the CSP is present
in the document.

Current: 93 references resolve, 404 works, text is gzipped, og:image resolves,
CSP present.

## Verifying

```bash
node tools/verify.mjs           # the gate: freshness, audits, weight
node tools/verify.mjs --quick   # skip the slow sweep — what the git hook runs
node tools/verify.mjs --engine=webkit
```

Each stage prints one line; the whole thing exits non-zero if any fails. A
pre-commit hook in `.githooks/` runs the quick set, so generated output cannot
drift from its source unnoticed. Enable it once per clone:

```bash
git config core.hooksPath .githooks
```

## Auditing

```bash
node tools/audit.mjs                        # whole suite, serves itself
node tools/audit.mjs --only=keyboard,modes  # a subset, seconds not minutes
node tools/audit.mjs http://localhost:8080  # against a running server
node tools/audit.mjs --engine=webkit         # the same checks in WebKit
node tools/audit-weight.mjs                 # page-weight budget
```

Checks links, broken images, console errors, contrast in both colour schemes,
heading outline, metadata and JSON-LD, Danish language tagging, image dimensions,
responsive overflow at 320px and 200% text, keyboard and focus behaviour, tap
target sizes at 390px, landmarks, plus the static audits (`audit-html`,
`audit-orphans`, `audit-feed`). Exit code 1 on any failure. A full sweep takes minutes; `--only` takes seconds.

Both engines are checked: WebKit supports every feature this design leans on —
`color-mix`, `backdrop-filter`, `svh`, `aspect-ratio`, `text-wrap: balance`,
`hyphens`, `overflow-wrap: anywhere` — with no prefixes or fallbacks needed. The
skip-link assertion differs by engine: Safari keeps links out of Tab order unless
the user enables full keyboard access, so the Tab check is Chromium-only and both
engines instead verify the link focuses, reveals and points at `#main`.

Navigation occasionally stalls in this driver — a different page each time, and
the page always loads fine alone. The runner retries on a fresh page and reports
the retry count rather than hiding it.

## Dates that cannot rot

The Now page tells the reader it is only ever true today, and carried an
`updated July 2026` stamp that was typed in by hand — so it would have gone on
claiming July for as long as nobody looked. The stamp now comes from the last
commit that touched `tools/content/now.mjs` (`tools/source-date.mjs`), as a
`<time datetime>`, which means editing the content is what moves the date. If git
cannot say, the page claims nothing rather than guessing.

`audit.mjs --only=freshness` asserts the rendered stamp still matches git, so
re-hardcoding it fails the build. Same wrinkle as sitemap `lastmod`: the commit
that edits the source is the one that moves the date, so `now.html` is rebuilt on
the following build — `--check` catches it.

## Forms

```bash
node tools/audit-forms.mjs
```

The contact form is the only way anyone reaches Zenna from this site, and the
piece most able to break without a trace: a form posting to `mailto:` is dropped
by Chrome silently, so the message is composed in JavaScript instead. If that
composition breaks, every page still renders and every other audit still passes.
This one submits both forms for real and asserts on the visible fallback link —
the script builds the same URL for it and for the navigation — checking that an
empty submit composes nothing, that a filled one carries the message, name and
reply address under a non-empty subject, and that the newsletter form uses its own
subject and address field.

Submitting ends in `window.location.href = 'mailto:…'`, and the operating system
takes that seriously: the first version of this tool opened a real mail client on
the machine running it, once per submit, per engine, per run. The page is driven
inside a `sandbox="allow-scripts allow-same-origin allow-forms"` iframe instead —
a sandboxed context may not navigate to a non-fetch scheme, so the URL is composed
and the navigation goes nowhere. `allow-forms` is required or Chromium blocks the
submit outright and the handler never runs. Verified both ways: sandboxed, Chromium
logs *"Navigation to external protocol blocked by sandbox"*; unsandboxed, it logs
*"Launched external handler for 'mailto:…'"*. That second line is now a hard
failure, so if the sandbox ever stops holding the audit says so instead of quietly
opening mail windows on someone's desktop.

## Visual regression

```bash
node tools/audit-visual.mjs           # diff 14 views against tests/baseline/
node tools/audit-visual.mjs --update  # accept the current rendering
```

Structural audits cannot see a layout regression: markup can be perfectly valid
and still move on the page. Twenty-four views are rendered
with reduced motion (so no reveal is caught half-played) and compared pixel by
pixel against `tests/baseline/`, with a 0.2% tolerance: fourteen light-desktop
views covering every distinct layout, five in dark mode where the whole palette
swaps, and five at 390px where the header stacks and the grids collapse. A failing view
writes `<label>.actual.png` next to its baseline so the two can be opened side
by side. Diffing runs on a canvas in the browser, so there is no image library to
install.

One limitation worth knowing: the tolerance is a share of *all* pixels, so a
view dominated by photography is less sensitive than a text-heavy one. Breaking
a dark-mode text token on purpose moved the catalogue by 1.29% and the hero by
only 0.14% — under the threshold. Text-heavy views carry the signal.

The baselines are ~9 MB of PNG. That is a real cost in a git repository and it
compounds: every `--update` adds another copy to history. Update deliberately,
when a change is intended, rather than to silence a red result.

## Weight

`tools/audit-weight.mjs` loads every page, scrolls it so lazy images actually
load, and sums what the browser transferred. It fails the build if a page exceeds
1.5 MB, a single asset exceeds 400 kB, or a page makes more than 40 requests.

Current: **33 pages, median 79 kB, heaviest 146 kB, 2.8 MB for the whole site.**
The stylesheet is the largest asset on every page (36 kB raw, 8 kB gzipped,
7 kB brotli) — worth serving compressed, not worth minifying by hand.

Those budgets assume the placeholder SVGs. Real photographs will change the
numbers; raise the budget deliberately at that point rather than deleting the
check.

## Deploying

The site deploys to **GitHub Pages** at `mgapcdev.github.io` — `main` is served
as-is, which is why the generated HTML is committed. `.nojekyll` stops Pages from
running the files through Jekyll.

GitHub Pages cannot send custom headers, so the Content-Security-Policy travels
as a `<meta http-equiv>` in every document instead. `frame-ancestors` and
`X-Content-Type-Options` cannot be set that way and are simply absent there.

`_headers` and `_redirects` are Netlify / Cloudflare Pages rules, ignored by
GitHub Pages, kept for a future move: security
headers, cache lifetimes (immutable for artwork and social cards, revalidate for
HTML), and the styled 404. Adapt them if you host elsewhere.

The Content-Security-Policy is strict — `default-src 'self'`, no third-party
anything, `style-src 'self'` with no inline styles at all, and the single inline
bootstrap script allowed by SHA-256 hash rather than `'unsafe-inline'`.

Both halves of that are easy to break silently, so they are tested:
`tools/audit-csp.mjs` serves the site with the exact policy from `_headers` and
drives the lightbox and the gallery filters under it. **If you change the inline bootstrap
script by one character, the hash no longer matches and every page loses its
JavaScript** — the audit catches that, and it runs as part of `verify`.

## Theme — "Blomstring"

Drawn from the visual language of the Facebook profile: macro botanicals on warm
ochre, leaf shadows on plaster, golden-hour Danish coast, poetic serif over
sand-coloured grounds.

| Token | Value | Use |
| --- | --- | --- |
| `--sand` | `#F6EFE4` | page ground |
| `--sand-deep` | `#ECE0CF` | alternating sections |
| `--paper` | `#FFFAF3` | cards, inputs |
| `--ink` | `#2A2622` | body text |
| `--ink-faint` | `#695E50` | labels, meta |
| `--poppy` | `#B33A2B` | the single accent |
| `--ochre` | `#C9873A` | warm secondary |
| `--sage` | `#7C8B6F` | botanical secondary |
| `--dusk` | `#5B3F7A` | cool secondary |

Display type is an Iowan Old Style / Palatino / Georgia stack; body is Avenir
Next / system sans at 1.75 line-height on a 62-character measure. Nothing is
fetched, so text paints immediately and no webfont shifts the layout.

## Behaviour worth knowing

- **Gallery order**: the wall is a row-major CSS grid with JS-assigned row spans,
  not CSS multi-column. Multi-column fills column-by-column, which once put ten
  of twelve works in a visual position that did not match tab order. Without JS
  it degrades to ragged rows — still correctly ordered.
- **Work cards are links** to the work's own page, so a click without scripting
  lands somewhere useful, and cmd-click opens a new tab. The lightbox intercepts
  plain clicks only.
- **Shareable frames**: opening a work writes `#view=<image-slug>`; that link
  opens straight into the viewer, and closing restores the previous hash. If a
  filter is hiding that frame, the filter clears rather than the link doing nothing.
- **Lightbox**: arrow keys, on-screen arrows or swipe; `Esc` or backdrop to
  close; a counter; focus trapped while open and restored on close.
- **Mail forms actually send.** A form posting to `mailto:` is silently dropped
  by Chrome, so the contact and newsletter forms compose the mail URL themselves
  and always leave a visible fallback link.
- **Everything degrades**: reveal animations are gated behind a `.js` class set
  by a one-line inline script, so with JS off nothing is stuck at `opacity: 0`.
- **The viewer isolates the page.** Trapping Tab is not the same as isolating a
  modal: with the lightbox open, 47 page links were still exposed to a screen
  reader’s virtual cursor. The background now goes `inert` and `aria-hidden` while
  it is open, and is restored on every close path — Escape, backdrop click, close
  button.
- **Scrollable tables are keyboard-operable.** At phone widths the catalogue,
  prints and press tables hide about 290px of content behind a horizontal scroll.
  A scroll container that cannot take focus is unreachable without a pointer
  (WCAG 2.1.1), so JS adds `tabindex="0"`, `role="region"` and a label from the
  table caption — but only while the region actually overflows, so desktop does
  not collect a dead tab stop.
- **Link text names its destination.** Screen readers list every link out of
  context, so the same words must not lead to two places. Three did: "write to me"
  went to both contact and sessions, "Works" sometimes landed on a filtered view,
  and "See the series" pointed at two different pages. `tools/audit-links-text.mjs`
  keeps the 162 distinct link texts mapping one-to-one.
- **Headings carry their own context.** Several read as bare counts — "Four sizes",
  "Three things", "Questions" — which tells a screen-reader user navigating by
  heading nothing at all. The eyebrow above each one holds the context, so it is
  folded into the accessible name as a visually-hidden prefix ("Sizes & editions —
  Four sizes") and marked `aria-hidden` where it now duplicates. Nothing changes
  visually.
- **Never colour alone**: exhibition status uses dot fill and border style as
  well as hue, so it survives greyscale (WCAG 1.4.1).
- **Text zoom**: the header wraps on content rather than at a viewport
  breakpoint, grid children carry `min-width: 0`, and rem widths are clamped with
  `min(…, 100%)` — 200% text, 200% browser zoom and 320px are all clean. The check
  appends its override to the stylesheet response rather than injecting an inline
  style, which the site's own `style-src 'self'` would block.
- **Tap targets**: every control is at least 24×24 at 390px (WCAG 2.5.8). Links
  inside running prose are exempt from that criterion and are skipped; a link in a
  table cell or a breadcrumb is a standalone control and is not. Both were real
  failures — 20px catalogue rows, 21px breadcrumbs — fixed with padding plus a
  matching negative margin, so the hit area grows without moving the layout.
  `node tools/audit.mjs --only=targets`.
- **Forced colours**: hero copy gets a solid `Canvas` plate because the gradient
  scrim disappears under Windows High Contrast.
- **Print**: a `@media print` block drops the chrome, caps body imagery at 7cm so
  a photograph never claims a page, and appends `href`s after external links.
- **Social cards are raster.** `og:image` used to point at an SVG, which Facebook,
  LinkedIn and iMessage all refuse — a shared link showed no picture at all. Cards
  are rendered to 1200×630 JPEG in `assets/social/` (JPEG, not PNG: the grain is
  noise, and the same cards were 700 kB each as PNG against ~40 kB as JPEG).
  PNG favicons at 192/512 and an apple-touch-icon come from the same pass.
- **Structured data**: JSON-LD everywhere — `Person` + `WebSite`,
  `CreativeWorkSeries` per series, `VisualArtwork` per work, `Event` for the
  gatherings, `Service` for sessions, `ItemList` of print offers, `Blog` for
  Words, `BreadcrumbList` throughout.

## Placeholder images

Every image is a generated SVG in the theme palette — four kinds: `bloom` (macro
flower), `shadow` (leaf shadows on a wall), `horizon` (golden-hour water),
`portrait` (defocused figure). Deterministic: rerunning produces identical files.

Swap in real photographs by replacing the files in `assets/img/` (keep the
filenames, or update `works-data.mjs` and rebuild).

## What is real vs. placeholder

**From the public Facebook profile** (facebook.com/ZennaGrundtvig): the name
Zenna Lua / Zenna Grundtvig, Copenhagen, from Greve Strand, born 1991, "Digital
kreatør", psychotherapist and self-employed since 2018, Engelsholm Kunsthøjskole,
Dansk NLP Center, the bio line *"There's only one of you — enjoy it"*, the
exhibition *"Like a flower you shall bloom"* (23 April – 31 May) with the line
*"No flower denies its own blossoming"*, the series *"Gigantically Subtle"*, and
the gatherings *I See You*, *Kvindecirkel*, *Når død ligner fødsel*,
*Hello Creator*, *With Ro & Zenna*.

**Everything else is placeholder copy** — artwork titles, print sizes, editions
and prices, venue names, years, group sizes, shipping rates, the email
`hello@zennalua.dk`, every entry on Words and Now, and every body paragraph. The
statements are written in her voice but are not her words.

## Before going live

- Replace the placeholder SVGs with real photographs and write real `alt` text.
- Point the two forms at a real endpoint — they currently compose `mailto:`.
- Set the real email address and any social links.
- Add real dates and years to the exhibitions.
- `SITE` in `tools/chrome.mjs` is `https://mgapcdev.github.io/`. Change it and
  rebuild if the site moves to a custom domain — Open Graph, JSON-LD, the sitemap
  and the feed all derive their absolute URLs from it.
- Optional: a favicon PNG for clients that ignore SVG icons.

## History

This tree was emptied on 28 July 2026 with no backup and no version control, and
rebuilt from scratch the same day. Two things changed in the rebuild: the page
chrome became shared code instead of markup copy-pasted into thirty-two files,
and the repository is now under git with a commit after every step.
