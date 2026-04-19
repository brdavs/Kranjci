# Work Order: Replace hCaptcha with frictionless ALTCHA

- work_order_id: `2026-04-18-replace-hcaptcha-with-altcha`
- requested_by: human
- date: 2026-04-18
- objective: Replace the current contact-form hCaptcha integration with a frictionless ALTCHA-based anti-spam flow while preserving the existing contact submission behavior.

## Requested outcome
- Remove the current hCaptcha-specific client integration from the contact page.
- Implement a frictionless ALTCHA flow for the contact form.
- Update the contact API to validate the ALTCHA payload instead of the hCaptcha token.
- Keep the existing honeypot, SMTP email delivery, and user-visible success/error states intact.
- Update env var expectations from hCaptcha to ALTCHA-specific configuration as needed.
- Keep the old hCaptcha implementation commented out in an easy-to-restore location instead of fully deleting it.

## Notes
- Scope is the existing captcha-protected contact flow only; newsletter signup is out of scope unless the current implementation requires a tiny shared refactor.
- Prefer a maintainable, minimal-delta integration over a broader form rewrite.
- The old hCaptcha code should remain clearly labeled and localized so it can be restored quickly if ALTCHA needs rollback.
