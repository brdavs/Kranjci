# Architecture

## Stack and runtime shape
- Frontend: Preact + Vite + TypeScript
- Routing: `wouter-preact`
- Deployment target: Vercel static site + Node serverless functions
- Local container workflow: Docker Compose (`app` service runs `npm run dev`)
- Content/rendering helpers: `marked` + `dompurify`
- Email delivery: `nodemailer`

## Repo areas that matter most
- `src/`: SPA entrypoint, routes, generated data adapters, loaders, utilities
- `content/members/`: member profile Markdown files loaded eagerly at build time
- `scripts/`: content sync and feed generation scripts
- `api/`: Vercel serverless endpoints for contact and fetch orchestration
- `public/`: static assets (logos, images, styles, etc.)
- `.aiw3-runtime/docs/`: operational runtime documentation

## Frontend composition
- `src/main.tsx` / `src/app.tsx` boot the SPA and define the route table.
- Primary routes currently present in code:
  - `/`
  - `/news`
  - `/news/:slug`
  - `/shows`
  - `/music`
  - `/history`
  - `/clients`
  - `/members`
  - `/member/:slug`
  - `/contact`
- SEO metadata is set client-side through `src/hooks/useMetaTags.ts`.

## Content and data model
### Shows
- Source of truth is Google Calendar ICS configured via `CALENDAR_URL`.
- `scripts/fetch-shows.mjs` filters `[E]` events, keeps a rolling window of one month back to three months ahead, and writes `src/data/shows.json`.
- `api/shows` returns the latest shows payload, preferring blob output from `scripts` writes and falling back to bundled `src/data/shows.json`.
- `src/data/shows.ts` imports that JSON and sanitizes Markdown snippets for rendering as fallback content.

### News
- `scripts/fetch-news.mjs` currently enables calendar news ingestion and merges new items with existing `src/data/news.json` by `uid`.
- Calendar news come from `[N]` events parsed into Markdown-backed entries.
- `api/news` returns the latest news payload, preferring blob output from `scripts` writes and falling back to bundled `src/data/news.json`.
- `src/news/loader.ts` continues to support static import shapes for fallback paths, while route pages now hydrate from API endpoints.
- README still describes Meta Graph ingestion as available, but the Facebook/Instagram fetch calls are commented out in `scripts/fetch-news.mjs`.

### Members
- Member pages are loaded from `content/members/*.md` through `import.meta.glob(..., eager: true)` in `src/members/loader.ts`.
- Frontmatter is parsed by a small local parser; body Markdown is rendered and sanitized before display.
- Member detail pages use `src/members/images.ts` to resolve responsive image sources.

## Operational flows
### Contact form
- Browser submits JSON to `/api/contact`.
- Honeypot field short-circuits spam.
- ALTCHA validation is optional and only enforced when `ALTCHA_HMAC_SIGNATURE_SECRET` is configured server-side and `VITE_ALTCHA_CHALLENGE_URL` is present client-side.
- `nodemailer` sends the message using SMTP env vars.

### Content sync
- `scripts/fetch-all.mjs` runs `fetch-shows` then `fetch-news`.
- `/api/fetch-all` spawns that script on Vercel.
- `vercel.json` schedules `/api/fetch-all` daily at `0 6 * * *`.
- `scripts` also attempt blob upload so runtime routes can consume updated content via API.

### Post-build artifacts
- `npm run build` triggers `vite build`.
- `postbuild` runs `scripts/generate-feeds.mjs`.
- That script generates `dist/news.xml`, `dist/sitemap.xml`, and `dist/robots.txt` from `src/data/news.json` and member Markdown slugs.

## Deployment model
- SPA requests are rewritten to `/index.html` by `vercel.json`.
- The site appears designed to deploy a static bundle plus serverless APIs.
- Data freshness now uses serverless endpoints `/api/news` and `/api/shows`; when blob sync is configured, updated script output is visible without requiring rebuilds.
