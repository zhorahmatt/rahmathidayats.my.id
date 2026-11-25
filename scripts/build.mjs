// Builds the site into dist/.
//
// The home page, styles, scripts and images are copied as they are. Every
// Markdown file in content/blog/ and content/story/ becomes a page, each
// collection gets a list page, and the newest posts are added to the home page.
//
//   npm run build
//
// Vercel runs this on every push, so adding a post is: write the .md, push.

import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { marked } from "marked";
import { SITE, homeSection, listPage, postPage } from "./templates.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "dist");

// Copied to dist/ unchanged.
const STATIC = ["css", "js", "assets", "favicon.ico", "robots.txt", "llms.txt"];

// Where the generated Blog and Stories sections go on the home page.
const HOME_MARKER = "<!-- build:writing -->";

const COLLECTIONS = [
  {
    key: "blog",
    title: "Blog",
    description: "Notes on building software, AI agents and marketing.",
    allLabel: "All posts",
    backLabel: "All posts",
  },
  {
    key: "story",
    title: "Stories",
    description: "Stories behind the work.",
    allLabel: "All stories",
    backLabel: "All stories",
  },
];

const WORDS_PER_MINUTE = 200;

function fail(message) {
  console.error(`build: ${message}`);
  process.exit(1);
}

// Reads the details block at the top of a Markdown file:
//   ---
//   title: My post
//   date: 2026-12-01
//   ---
function parsePost(file, source) {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) fail(`${file} must start with a details block between two "---" lines`);

  const details = {};
  for (const line of match[1].split(/\r?\n/)) {
    if (!line.trim() || line.trim().startsWith("#")) continue;
    const colon = line.indexOf(":");
    if (colon === -1) fail(`${file}: cannot read the line "${line}" (expected "name: value")`);
    const key = line.slice(0, colon).trim();
    let value = line.slice(colon + 1).trim();
    const quoted = value.match(/^(["'])([\s\S]*)\1$/);
    if (quoted) value = quoted[2];
    details[key] = value;
  }

  for (const required of ["title", "date", "description"]) {
    if (!details[required]) fail(`${file} is missing "${required}" in its details block`);
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(details.date) || Number.isNaN(Date.parse(details.date))) {
    fail(`${file}: date must look like 2026-12-01, got "${details.date}"`);
  }
  if (details.updated && !/^\d{4}-\d{2}-\d{2}$/.test(details.updated)) {
    fail(`${file}: updated must look like 2026-12-01, got "${details.updated}"`);
  }

  const body = match[2];
  const words = body.split(/\s+/).filter(Boolean).length;
  return {
    title: details.title,
    date: details.date,
    updated: details.updated || "",
    description: details.description,
    lang: details.lang || "en",
    noindex: details.noindex === "true",
    minutes: Math.max(1, Math.round(words / WORDS_PER_MINUTE)),
    html: marked.parse(body).trim(),
  };
}

function readCollection(collection) {
  const folder = join(ROOT, "content", collection.key);
  if (!existsSync(folder)) return [];
  return readdirSync(folder)
    .filter((name) => name.endsWith(".md"))
    .map((name) => {
      const slug = name.slice(0, -3);
      if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) {
        fail(`content/${collection.key}/${name}: use lowercase letters, numbers and dashes in the file name`);
      }
      const file = `content/${collection.key}/${name}`;
      return { slug, ...parsePost(file, readFileSync(join(folder, name), "utf8")) };
    })
    .sort((a, b) => b.date.localeCompare(a.date) || a.slug.localeCompare(b.slug));
}

function write(relativePath, contents) {
  const target = join(OUT, relativePath);
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, contents);
}

// The pieces of index.html that every generated page reuses, so the theme
// script, the tag manager snippet and the icons are only written once.
function sharedFromHome(home) {
  const boot = home.match(/<meta name="viewport"[^>]*>\n([\s\S]*?)\n\s*<title>/);
  if (!boot) fail("index.html: could not find the scripts between the viewport tag and <title>");
  const icons = ["i-sun", "i-moon", "i-arrow-left", "i-arrow-right"].map((id) => {
    const symbol = home.match(new RegExp(`<symbol id="${id}"[\\s\\S]*?</symbol>`));
    if (!symbol) fail(`index.html: icon ${id} is missing`);
    return symbol[0];
  });
  return { boot: boot[1], icons: icons.join("\n      ") };
}

function sitemap(entries) {
  const urls = entries
    .map(({ path, lastmod }) => `  <url>\n    <loc>${SITE}${path}</loc>\n    <lastmod>${lastmod}</lastmod>\n  </url>`)
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

// ---- Build ----

rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });
for (const item of STATIC) cpSync(join(ROOT, item), join(OUT, item), { recursive: true });

let home = readFileSync(join(ROOT, "index.html"), "utf8");
if (!home.includes(HOME_MARKER)) fail(`index.html: the ${HOME_MARKER} marker is missing`);
const shared = sharedFromHome(home);

const homeUpdated = home.match(/Updated <time datetime="(\d{4}-\d{2}-\d{2})"/);
if (!homeUpdated) fail('index.html: could not find the "Updated" date in the footer');
const sitemapEntries = [{ path: "/", lastmod: homeUpdated[1] }];

let homeSections = "";
let postCount = 0;
for (const collection of COLLECTIONS) {
  const posts = readCollection(collection);
  if (posts.length === 0) continue;

  for (const post of posts) {
    write(`${collection.key}/${post.slug}/index.html`, postPage({ shared, collection, post }));
    if (!post.noindex) {
      sitemapEntries.push({ path: `/${collection.key}/${post.slug}/`, lastmod: post.updated || post.date });
    }
  }
  write(`${collection.key}/index.html`, listPage({ shared, collection, posts }));
  if (posts.some((post) => !post.noindex)) {
    sitemapEntries.push({ path: `/${collection.key}/`, lastmod: posts[0].updated || posts[0].date });
  }

  homeSections += `\n${homeSection({ collection, posts })}`;
  postCount += posts.length;
}

home = home.replace(HOME_MARKER, homeSections.trim());
write("index.html", home);
write("sitemap.xml", sitemap(sitemapEntries));

console.log(`build: wrote dist/ with ${postCount} post${postCount === 1 ? "" : "s"}`);
