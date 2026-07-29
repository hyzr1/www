# Hyzr — front page

**The hyzr.ai landing page.** A static, dependency-free site: one HTML file, one stylesheet, one script.

## Product accuracy

Anything on this page that visualizes a Hyzr product is reproduced from that product's source code, not re-imagined:

- The hero composer, suggestion chips, greeting, sidebar, task cards, and demo frame use the exact markup, tokens, and light-theme palette from [`chat`](https://github.com/hyzr1/chat) (`app/globals.css`, `app/page.tsx`, `app/hyzr-logo.tsx`, `app/icons.tsx`).
- The lecture stage, paper ground, ochre accent, mono labels, and scene rail use the tokens from [`code`](https://github.com/hyzr1/code) (`src/styles.css`, `src/components/Brand.tsx`).
- The footer's dark ground uses the Hyzr Chat dark-theme tokens.

If the products change, update the replicas from source.

## Structure

```
index.html   — the page
styles.css   — product tokens + page system
main.js      — composer behavior, demo replay, lecture stage
favicon.svg  — boxed italic H mark
```

The hero composer is functional: submitting sends the prompt to `chat.hyzr.ai/?q=…`.

## Run locally

Any static server works:

```bash
npx http-server . -p 4173
```

## Deploy

Static hosting (GitHub Pages, Cloudflare Pages, Vercel, Netlify). Point the apex domain `hyzr.ai` at the deployment; product apps live at `chat.hyzr.ai` and `code.hyzr.ai`.

## Product family

| Product | Address |
| --- | --- |
| Hyzr | `hyzr.ai` |
| Hyzr Chat | `chat.hyzr.ai` |
| Hyzr Code | `code.hyzr.ai` |
