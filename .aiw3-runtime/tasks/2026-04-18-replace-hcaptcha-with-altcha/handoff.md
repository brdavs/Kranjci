# Handoff

Owner: `developer-standard`

## Execute now
1. Inspect the current contact-page hCaptcha integration in `src/routes/Contact.tsx`, `src/routes/contact/hCaptcha.ts`, and `api/contact.ts`.
2. Replace that flow with a frictionless ALTCHA implementation appropriate for this Preact + Vite + Vercel serverless setup.
3. Keep the contact form's existing fields, honeypot, SMTP send path, and visible success/error messaging behavior intact.
4. Update env/config references and example docs only as needed for the new ALTCHA contract.
5. Restore the old hCaptcha implementation as clearly labeled commented fallback code in an easy-to-restore location instead of fully deleting it.
6. Keep ALTCHA as the only active runtime path; the hCaptcha fallback must remain inert/commented.
7. Verify the final result with the project's relevant checks and report what was changed.

## Boundaries
- Do not change the newsletter signup flow.
- Do not redesign the contact page beyond the captcha swap.
- Do not commit.
- Do not modify `.env` values directly; update examples/docs only if needed.
- Do not create a second active captcha path; hCaptcha should remain commented fallback only.

## Expected report back
- Files changed
- Chosen ALTCHA implementation shape and why it fits this repo
- Where the commented hCaptcha fallback now lives
- Any dependency/env contract changes
- Verification performed
- Confirmation no commit was made
