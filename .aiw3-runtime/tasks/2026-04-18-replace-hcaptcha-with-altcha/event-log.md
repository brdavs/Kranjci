# Event Log

- `2026-04-18T01:00:00Z` `task_created` by `planner`: Created approved task artifacts to replace contact-form hCaptcha with frictionless ALTCHA and assigned `developer-standard`.
- `2026-04-18T01:35:00Z` `completed` by `developer-standard`: Replaced contact form hCaptcha client/server flow with ALTCHA flow, preserved honeypot + SMTP path and success/error UX, and updated env naming in `.env.example` and runtime docs.
- `2026-04-18T01:45:00Z` `decision` by `planner`: Updated the task in place to require preserving the old hCaptcha implementation as clearly labeled commented fallback code that is easy to restore.
- `2026-04-18T02:00:00Z` `completed` by `developer-standard`: Restored old hCaptcha code as clearly labeled, localized commented fallback in `src/routes/Contact.tsx` and `api/contact.ts` while keeping ALTCHA as the active runtime path.
