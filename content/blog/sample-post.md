---
title: "Sample post: how writing works here"
date: 2026-11-25
description: A placeholder post that shows what Markdown turns into on this site. Replace it with a real one.
noindex: true
---

This is a placeholder. It is here so the Blog section has something to show, and so you can see how each piece of Markdown looks once it is published. Delete this file when the first real post is ready.

## Adding a post

Create a Markdown file in `content/blog/`, commit it and push. The file name becomes the address, so `content/blog/my-first-post.md` is published at `/blog/my-first-post/`.

Every file starts with a few lines of details between two `---` lines:

```md
---
title: My first post
date: 2026-12-01
description: One sentence that appears in lists, search results and link previews.
---

The post itself starts here.
```

## What you can use

Paragraphs are separated by an empty line. Text can be **bold**, *italic* or `inline code`, and links look like [this one to the home page](/).

- Lists use a dash at the start of each line
- They can hold as many items as you need
- Numbered lists work too

1. Write the file
2. Push it
3. Read it on the site

> Quotes start with a "greater than" sign. They are good for a line you want to stand apart.

### Smaller headings

Use `##` for sections and `###` for parts inside a section. The title at the top of the page comes from the details block, so the text never needs its own `#` heading.

Images go in `assets/` and are written like this: `![What the image shows](/assets/blog/example.webp)`.
