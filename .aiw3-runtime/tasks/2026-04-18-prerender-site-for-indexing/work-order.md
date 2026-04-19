# Work Order: Prerender site for indexability

- work_order_id: `2026-04-18-prerender-site-for-indexing`
- requested_by: human
- date: 2026-04-18
- objective: Implement build-time prerendering for the public site so deployed routes return meaningful HTML and route-specific SEO metadata without relying on client-only rendering.

## Requested outcome
- Add a maintainable Preact prerender pipeline that emits HTML for the site's public routes at build time.
- Prerender all current public static routes and known dynamic member/news routes.
- Ensure route-specific title, description, and canonical data are present in generated HTML.
- Preserve current client-side navigation and hydration behavior after load.
- Keep the deployment model on Vercel static output + serverless APIs.

## Notes
- Primary motivation is Google indexability for the public marketing/content site.
- Prefer a clean SSR/prerender implementation over a brittle browser-snapshot approach.
- Keep the change focused on indexability/prerendering; avoid unrelated redesign or data-model rewrites.
