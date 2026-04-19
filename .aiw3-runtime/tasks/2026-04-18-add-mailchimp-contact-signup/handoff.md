# Handoff

Owner: `developer-fast`

## Execute now
1. Add a mailing list signup UI to `src/routes/Contact.tsx` in the existing "Mobilni telefon in e-pošta" card.
2. Position it below the current general contact email with a small visual gap, not replacing existing content.
3. Collect subscriber name and email.
4. Add GDPR consent copy plus a required checkbox.
5. Implement secure server-side Mailchimp subscription handling using placeholder env vars only.
6. Keep the implementation narrow and consistent with current code patterns.

## Boundaries
- Do not expose Mailchimp secrets in frontend code.
- Do not require real keys or IDs in committed code.
- Do not break or redesign the existing contact form.
- Do not commit unless the human explicitly asks later.

## Suggested placeholder env vars
- `MAILCHIMP_API_KEY`
- `MAILCHIMP_AUDIENCE_ID`
- `MAILCHIMP_SERVER_PREFIX`

## Expected report back
- Files changed
- Placeholder env vars introduced or documented
- How GDPR consent is enforced in the UI/request path
- How Mailchimp errors and success are handled
- Any setup steps the human must complete with real values
- Confirmation no commit was made
