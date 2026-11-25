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
| Edge-to-edge carousel of screenshot tiles | Three projects as cards and the rest as rows, inside the text column. The order is shuffled on every visit, and a button shuffles it again | Rahmat asked for a layout less like the reference, and for every project to get a turn at the top; a grid and a one-at-a-time showcase were tried and dropped |
| Speaking photos and list | "What I do" rows | Rahmat's six service areas, including digital marketing (Meta Ads) |
| Testimonials | "What I believe" (his own two statements) | No real testimonials; none invented |
| YouTube grid | Left out | No such content |
| Contribution graph in orange | Same idea in blue, drawn from a saved snapshot | See "Activity on GitHub" below |
| "Available for new work" | "Leading engineering at Afila" | Availability was never stated |
| Contact form | `mailto:` button | No backend |

## Files

- `index.html`: all content. Interface icons are an inline SVG sprite (Lucide).
- `assets/work/`: fifteen project images at 960 × 533 WebP. Eleven are screenshots supplied by Rahmat, cropped and resized (the paragraph of ad figures in `faradiba-agent.webp` is blurred on purpose); `indesain.webp`, `faradiba.webp` and `tendamks.webp` are fresh captures of the live home pages. `dzkrr.webp` is composed from his two phone screenshots, set side by side on the app's green.
- `assets/work/thumb/`: the same fifteen at 192px wide, for the rows. The browser picks between the two through `srcset`.
- `assets/avatar.webp`: Rahmat's portrait, cropped square from the photo he supplied (264 × 264).
- `favicon.ico`, `assets/favicon.png`, `assets/apple-touch-icon.png`: the same portrait as the site icon (16–48px, 192px with rounded corners, and 180px square for iOS).
- `assets/tools/`: eighteen tool logos from the Iconify "logos" set (CC0), saved locally.
- `css/tokens.css`: colours, type sizes, shadows, easings, for light and dark.
- `css/base.css`: reset, focus ring, rise-in and scroll-reveal motion.
- `css/sections.css`: page grid, hero, selected work, rows, statements, tools, footer.
- `css/contact.css`: the contact dock.
- `js/contributions.js`, `quotes.js`, `email-copy.js`, `contact.js`, `reveal.js`, `theme.js`: one
  small module per behaviour, started from `js/main.js`.
- The shuffle for Selected work is a short inline script in `index.html`, right after the list, so the
  order is set before the first paint. Without JavaScript the projects keep the order in the markup.

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

## Search, sharing and AI assistants

- Title (60 characters) and description (147) name what Rahmat does and where: software, AI agents,
  marketing, Makassar.
- `assets/og.png` (1200 × 630) is the image shown when the link is shared. Its source is
  `scripts/og-image.html`; change the text there and run `npm run og` (needs Google Chrome).
- Open Graph and Twitter card tags point at that image.
- Structured data is one JSON-LD graph in `index.html`: WebSite, ProfilePage, Person, the two
  organisations and the list of selected work. Keep `dateModified`, the footer's "Updated" date and
  `sitemap.xml` in step when the content changes.
- "About Rahmat Hidayat" is a third-person bio that can be quoted on its own, with a short list of facts.
- Project names and service names are real `h3` headings.
- `robots.txt` allows every crawler, AI assistants included. `llms.txt` is a plain summary for AI
  tools; Google says it ignores the file, so it is there as a courtesy, not a ranking lever.

## Analytics

Google Tag Manager container `GTM-5C7HK23W` is loaded from the `<head>` of `index.html`, using the
snippet Rahmat supplied. Tags, triggers and any analytics are configured inside GTM, not in this
repository. There is no consent banner; add one before firing tags that need consent for visitors
from places that require it.

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
