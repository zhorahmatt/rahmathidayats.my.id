// HTML for the pages the build writes: one page per post, one list page per
// collection, and the Blog / Stories sections on the home page.

export const SITE = "https://rahmathidayats.my.id";
const AUTHOR = "Rahmat Hidayat";
const SHARE_IMAGE = `${SITE}/assets/og.png`;

export function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

const dateFormat = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

export function formatDate(isoDate) {
  return dateFormat.format(new Date(`${isoDate}T00:00:00Z`));
}

function jsonLd(data) {
  // "<" is escaped so a title can never close the script tag early.
  return `<script type="application/ld+json">${JSON.stringify(data).replaceAll("<", "\\u003c")}</script>`;
}

// The shell shared by every generated page. `shared` holds the pieces taken
// from index.html (theme script, tag manager, icons) so they exist in one place.
function page({ shared, lang = "en", title, description, path, noindex, ogType, structuredData, crumb, body }) {
  const url = `${SITE}${path}`;
  const fullTitle = `${title} — ${AUTHOR}`;
  const robots = noindex ? "noindex, follow" : "index, follow, max-image-preview:large, max-snippet:-1";

  return `<!DOCTYPE html>
<html lang="${escapeHtml(lang)}">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
${shared.boot}
    <title>${escapeHtml(fullTitle)}</title>
    <meta name="description" content="${escapeHtml(description)}" />
    <meta name="author" content="${AUTHOR}" />
    <meta name="robots" content="${robots}" />
    <link rel="canonical" href="${url}" />
    <meta name="theme-color" content="#ffffff" />
    <meta property="og:type" content="${ogType}" />
    <meta property="og:site_name" content="${AUTHOR}" />
    <meta property="og:title" content="${escapeHtml(title)}" />
    <meta property="og:description" content="${escapeHtml(description)}" />
    <meta property="og:url" content="${url}" />
    <meta property="og:image" content="${SHARE_IMAGE}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeHtml(title)}" />
    <meta name="twitter:description" content="${escapeHtml(description)}" />
    <meta name="twitter:image" content="${SHARE_IMAGE}" />
    <link rel="icon" href="/favicon.ico" sizes="48x48" />
    <link rel="icon" href="/assets/favicon.png" type="image/png" sizes="192x192" />
    <link rel="apple-touch-icon" href="/assets/apple-touch-icon.png" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600&display=swap" rel="stylesheet" />
    <link rel="stylesheet" href="/css/tokens.css" />
    <link rel="stylesheet" href="/css/base.css" />
    <link rel="stylesheet" href="/css/sections.css" />
    <link rel="stylesheet" href="/css/writing.css" />
    ${structuredData ? jsonLd(structuredData) : ""}
  </head>
  <body>
    <a class="skip-link" href="#main">Skip to content</a>
    <svg width="0" height="0" style="position: absolute" aria-hidden="true" focusable="false">
      ${shared.icons}
    </svg>

    <main id="main" class="page">
      <header class="hero">
        <a class="hero__home" href="/" aria-label="${AUTHOR}, home"><span class="avatar avatar--hero" aria-hidden="true"></span></a>
        <div class="hero__text">
          <p class="hero__name"><a href="/">${AUTHOR}</a></p>
          <p class="hero__role">${crumb}</p>
        </div>
        <button type="button" class="nav-button theme-toggle" aria-label="Switch to dark mode" title="Switch to dark mode" data-theme-toggle>
          <span class="theme-toggle__icon theme-toggle__icon--moon"><svg class="icon"><use href="#i-moon" /></svg></span>
          <span class="theme-toggle__icon theme-toggle__icon--sun"><svg class="icon"><use href="#i-sun" /></svg></span>
        </button>
      </header>

${body}

      <footer class="footer">
        © ${new Date().getUTCFullYear()} ${AUTHOR} ·
        <a href="/">Home</a> · <a href="/blog/">Blog</a> · <a href="/story/">Stories</a>
      </footer>
    </main>

    <script type="module">
      import { initTheme } from "/js/theme.js";
      initTheme();
    </script>
  </body>
</html>
`;
}

// One row in a list of posts. `level` is the heading level that fits the page.
function postRow(collection, post, level) {
  return `          <li class="post-row">
            <a class="post-row__link" href="/${collection.key}/${post.slug}/">
              <div class="post-row__main">
                <h${level} class="post-row__title">${escapeHtml(post.title)}</h${level}>
                <p class="post-row__desc">${escapeHtml(post.description)}</p>
              </div>
              <time class="post-row__date" datetime="${post.date}">${formatDate(post.date)}</time>
            </a>
          </li>`;
}

export function postPage({ shared, collection, post }) {
  const path = `/${collection.key}/${post.slug}/`;
  return page({
    shared,
    lang: post.lang,
    title: post.title,
    description: post.description,
    path,
    noindex: post.noindex,
    ogType: "article",
    crumb: `<a href="/${collection.key}/">${collection.title}</a>`,
    structuredData: {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: post.title,
      description: post.description,
      datePublished: post.date,
      dateModified: post.updated || post.date,
      inLanguage: post.lang,
      url: `${SITE}${path}`,
      mainEntityOfPage: `${SITE}${path}`,
      image: SHARE_IMAGE,
      author: { "@type": "Person", "@id": `${SITE}/#person`, name: AUTHOR, url: `${SITE}/` },
    },
    body: `      <article class="post">
        <header class="post__head">
          <p class="post__meta">
            <time datetime="${post.date}">${formatDate(post.date)}</time>
            <span aria-hidden="true"> · </span>${post.minutes} min read
          </p>
          <h1 class="post__title">${escapeHtml(post.title)}</h1>
          <p class="post__lead">${escapeHtml(post.description)}</p>
        </header>
        <div class="prose">
${post.html}
        </div>
      </article>

      <p class="post__back">
        <a href="/${collection.key}/"><svg class="icon" aria-hidden="true"><use href="#i-arrow-left" /></svg>${collection.backLabel}</a>
      </p>`,
  });
}

export function listPage({ shared, collection, posts }) {
  const rows = posts.map((post) => postRow(collection, post, 2)).join("\n");
  return page({
    shared,
    title: collection.title,
    description: collection.description,
    path: `/${collection.key}/`,
    // A list of nothing but placeholders should not be indexed either.
    noindex: posts.every((post) => post.noindex),
    ogType: "website",
    crumb: `<a href="/">Home</a>`,
    body: `      <section class="listing">
        <h1 class="listing__title">${collection.title}</h1>
        <p class="listing__lead">${escapeHtml(collection.description)}</p>
        <ul class="posts">
${rows}
        </ul>
      </section>`,
  });
}

// The section shown on the home page: the newest few posts and a link to the rest.
export function homeSection({ collection, posts, limit = 3 }) {
  const rows = posts
    .slice(0, limit)
    .map((post) => postRow(collection, post, 3))
    .join("\n");
  return `      <section id="${collection.key}" class="section" aria-labelledby="${collection.key}-title" data-reveal>
        <div class="section__head">
          <h2 id="${collection.key}-title" class="section__title">${collection.title}</h2>
          <a class="section__meta section__link" href="/${collection.key}/">${collection.allLabel}<svg class="icon" aria-hidden="true"><use href="#i-arrow-right" /></svg></a>
        </div>
        <ul class="posts">
${rows}
        </ul>
      </section>
`;
}
