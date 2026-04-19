# Event Log

- 2026-04-19T00:00:00Z planner: created work order, plan, and handoff for updating the `/contact` `PIŠITE NAM` form with optional newsletter opt-in.
- 2026-04-19T00:00:01Z planner: human confirmed constraints: newsletter optional, partial success allowed, standalone `/contact` newsletter form unchanged, and message required only when newsletter opt-in is not selected.
- 2026-04-19T00:00:02Z planner: human approved execution; task is ready for dispatch to `developer-standard`.
- 2026-04-19T00:30:00Z planner: follow-up approved to add nearby GDPR/privacy wording for newsletter opt-in and improve checkbox styling in the shared unified contact form.
- 2026-04-19T13:00:00Z developer-standard: implemented contact-page opt-in flow in `Pišite nam` form (message optional only with newsletter opt-in), added partial-success handling, and updated `/api/contact` validation for optional message when `newsletterOptIn` is true.
