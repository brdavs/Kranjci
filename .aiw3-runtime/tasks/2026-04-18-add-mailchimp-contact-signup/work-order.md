# Work Order: Add Mailchimp signup on contact page

- work_order_id: `2026-04-18-add-mailchimp-contact-signup`
- requested_by: human
- date: 2026-04-18
- objective: Add a Mailchimp mailing list signup form to the contact page inside the box under "e-pošta za splošni kontakt", using placeholder Mailchimp env vars and values that the human can replace later.

## Requested outcome
- Add a mailing list signup form to the existing contact information card on `/contact`.
- Place it a line or two below the existing general contact email.
- Collect subscriber name and email.
- Include GDPR consent text and checkbox.
- Implement server-side Mailchimp subscription flow using placeholder env vars so secrets stay out of frontend code.

## Notes
- No Mailchimp integration exists in the repo today.
- Use placeholder env var names and safe placeholder values only; do not hardcode real secrets.
- Follow existing repo coding style and keep the delta narrow.
