# Handoff

Owner: `developer-fast`

## Execute now
1. Review the remaining uncommitted files and group them into meaningful commits.
2. Include all remaining app/code/config files the human referenced, including `src/routes/Home_VIDEO.tsx`.
3. Exclude `.env`, `.aiw3-runtime/**`, and unrelated docs/process files from the commits.
4. Create the commits and verify the resulting status.

## Expected grouping guidance
- A remote news/shows freshness commit for `api/news.ts`, `api/shows.ts`, `src/hooks/useRemoteNews.ts`, `src/hooks/useRemoteShows.ts`, `src/routes/News.tsx`, `src/routes/NewsPost.tsx`, `src/routes/Shows.tsx`, and the related `src/routes/Home_VIDEO.tsx` display update.
- A shared site navigation extraction/refactor commit for `src/app.tsx`, `src/components/SiteHeader.tsx`, `src/components/SiteFooter.tsx`, `src/constants/siteNavigation.ts`, `src/hooks/useSiteNavigation.ts`.
- A news ingest cleanup commit for `scripts/fetch-news.mjs`.
- A tooling config commit for `tsconfig.json` and `vite.config.ts` if those changes remain intentional after review.

## Boundaries
- Do not commit runtime task files, `.env`, `docs/`, `openspec`, or `OLD_AGENTS.md`.
- Do not push.

## Expected report back
- Commit SHAs and messages
- Exact files included per commit
- Confirmation that excluded files remain uncommitted
