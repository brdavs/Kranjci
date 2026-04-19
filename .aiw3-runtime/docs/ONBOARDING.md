# Onboarding

## Project snapshot
- Project: `zasedba-kranjci`
- Root: `/home/toni.linux/C/zasedba-kranjci`
- App type: brochure/marketing SPA with generated event/news content and Vercel APIs

## Start here
1. Read `README.md` for the intended operator workflow.
2. Read active runtime task docs first: `.aiw3-runtime/tasks/<task-id>/work-order.md`, `plan.md`, `handoff.md`, `event-log.md`.
3. Check runtime docs under `.aiw3-runtime/docs/` for current architecture, workflow, decisions, and open items.
4. Use these code locations as the quickest architectural map:
    - `src/app.tsx`
    - `src/routes/`
    - `src/news/loader.ts`
    - `src/members/loader.ts`
    - `scripts/fetch-*.mjs`
    - `api/contact.ts`
    - `api/fetch-all.ts`

5. Before making any edits, align docs with code:
   - Verify the current behavior directly from code paths above.
   - Check for discrepancies (especially between README and implementation).
   - Update all impacted runtime docs as a single pass.

## Important commands from `package.json`
- `npm run dev`: local Vite dev server
- `npm run build`: production build
- `npm run preview`: preview built app
- `npm run fetch-shows`: refresh generated shows JSON
- `npm run fetch-news`: refresh generated news JSON
- `npm run fetch-all`: run both sync scripts

## Environment variables referenced by code
Do not document raw values; these are names only.

- Site/build:
  - `SITE_URL`
  - `CALENDAR_URL`
- Contact/email:
  - `SMTP_HOST`
  - `SMTP_PORT`
  - `SMTP_USER`
  - `SMTP_PASS`
  - `MAIL_TO`
  - `MAIL_FROM`
  - `MAILCHIMP_API_KEY`
  - `MAILCHIMP_AUDIENCE_ID`
  - `MAILCHIMP_SERVER_PREFIX`
  - `VITE_ALTCHA_CHALLENGE_URL`
  - `ALTCHA_HMAC_SIGNATURE_SECRET`
  - `ALTCHA_HMAC_KEY_SIGNATURE_SECRET`
- Optional/partially implemented content sync:
  - `META_GRAPH_TOKEN`
  - `META_FACEBOOK_PAGES`
  - `META_INSTAGRAM_USERS`
  - `META_NEWS_LIMIT`
- Optional blob persistence:
  - `BLOB_READ_WRITE_TOKEN`

## Content rules discoverable from code
- `src/data/news.json` and `src/data/shows.json` are generated artifacts.
- `content/members/*.md` is author-edited source content.
- Member Markdown supports simple frontmatter fields and Markdown body text.
- News/show rendering sanitizes Markdown-derived HTML before injecting it.
- `src/data/*.json` updates from scripts can be reflected at runtime via blob-backed `/api/news` and `/api/shows` endpoints when configured; with no blob token configured, fallback remains build-time data (`src/data/*.json`) and redeploy is required for changes to be reflected.

## First things to verify on future tasks
- Whether requested behavior is build-time, runtime, or both.
- Whether README still matches actual script behavior.
- Whether a change touches static bundle data, Vercel functions, or both.

## Common maintainer checkpoints
- If touching contact flow: verify `api/contact.ts`, SMTP envs, and honeypot (`website`) behavior.
- If touching content sync flow: verify `scripts/fetch-all.mjs`, `scripts/fetch-news.mjs`, `scripts/fetch-shows.mjs`, and cron in `vercel.json`.
- If touching onboarding/docs: update `CURRENT_STATE.md`, `events.jsonl`, and task `event-log.md` together so handoff context stays coherent.
