# rahmathidayats.my.id — how this site is built

Static one-page portfolio. No build step: plain HTML, CSS and native ES modules.
Run it with `npm run dev` (Python `http.server` on port 4173).

## Where the design comes from (2026-11-24)

The layout follows https://faizintifada.com/, which Rahmat picked as the look he
likes. That site was inspected with REA (`capture_browser_scenario`, Chromium
158) plus a read of its public HTML and CSS. What was taken is the design
system, rewritten by hand here; none of its code, images, text or fonts files
were copied.

Observed on the reference:

- One 600px text column on a white page, with full-width rows for the carousel.
- Geist typeface. Body 16px/1.6, section labels 14px, meta 13px.
- Near-black text `#0a0a0a`; secondary text is the same colour at 65% opacity.
- Hero pieces rise in one after another (opacity, 2px blur, 8px shift, 90ms apart).
- Work carousel: 560px cards with a 1120/746 ratio, scroll-snap, arrow buttons.
- List rows with a title, a muted subtitle and right-aligned meta.
- A quote switcher with a "1 / 4" counter.
- Inline tools list with small icons and dot separators.
- A contact avatar pinned bottom-left that peeks a link bar on hover and grows
  into a card on click (clip-path reveal with a separate shadow plate).

## What differs from the reference, and why

| Reference | Here | Reason |
| --- | --- | --- |
| Edge-to-edge carousel of screenshot tiles | One project at a time inside the text column, with a strip of ten thumbnails to pick from | Rahmat asked for a layout less like the reference; a grid was tried and dropped |
| Speaking photos and list | "What I do" rows | Rahmat's six service areas, including digital marketing (Meta Ads) |
| Testimonials | "What I believe" (his own two statements) | No real testimonials; none invented |
| YouTube grid | Left out | No such content |
| Contribution graph in orange | Same idea in blue, drawn from a saved snapshot | See "Activity on GitHub" below |
| "Available for new work" | "Currently at Thuuba Digital" | Availability was never stated |
| Contact form | `mailto:` button | No backend |

## Files

- `index.html`: all content. Interface icons are an inline SVG sprite (Lucide).
- `assets/work/`: ten project screenshots supplied by Rahmat, cropped and resized to 960 × 533 WebP.
- `assets/avatar.webp`: Rahmat's portrait, cropped square from the photo he supplied (264 × 264).
- `assets/tools/`: fifteen tool logos from the Iconify "logos" set (CC0), saved locally.
- `css/tokens.css`: colours, type sizes, shadows, easings, for light and dark.
- `css/base.css`: reset, focus ring, rise-in and scroll-reveal motion.
- `css/sections.css`: page grid, hero, work showcase, rows, statements, tools, footer.
- `css/contact.css`: the contact dock.
- `js/showcase.js`, `contributions.js`, `quotes.js`, `email-copy.js`, `contact.js`, `reveal.js`, `theme.js`: one
  small module per behaviour, started from `js/main.js`.

The page is complete without JavaScript: both statements list out and "email"
is a normal mail link. `prefers-reduced-motion`
turns the motion off.

## Dark mode

Not on the reference; added on request. A small script in `<head>` sets
`<html data-theme>` before first paint from the saved choice (`localStorage`
key `theme`), or from the system setting when nothing is saved. The button in
the header flips and saves it. Without JavaScript the page still follows the
system setting through a media query.

## Activity on GitHub

`scripts/update-contributions.py` reads the public contribution calendar from
`github.com/users/zhorahmatt/contributions` and saves it to
`assets/data/contributions.json`. `js/contributions.js` draws the latest 40
weeks from that file. It is a snapshot, so the page says "as of" the last day
in it; run `npm run contributions` and commit the file to refresh it.

## Deploying (Vercel)

The site is plain static files, so Vercel serves the repository root as it is:
`vercel.json` switches off the install and build steps, adds a few security
headers and lets screenshots and logos be cached for a day. `.vercelignore`
keeps this file, `scripts/` and `package.json` out of the published site.
`robots.txt` and `sitemap.xml` point at https://rahmathidayats.my.id/, the
address the canonical link also uses.

The contribution graph is a committed snapshot, so it only changes when
`npm run contributions` is run and the result is pushed.

## Earlier versions

Three earlier attempts are kept in a local `archive/` folder that is not part
of this repository: a replica of marinarachello.com, an original redesign that
was rejected, and the replica refilled with Rahmat's content and three colour
palettes.
