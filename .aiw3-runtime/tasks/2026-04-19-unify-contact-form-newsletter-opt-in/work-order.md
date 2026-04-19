# Work Order: Unify contact form with optional newsletter opt-in

- work_order_id: `2026-04-19-unify-contact-form-newsletter-opt-in`
- requested_by: human
- date: 2026-04-19
- objective: Update the `/contact` page `PIŠITE NAM` form so it can optionally sign the sender up for e-novice while leaving the existing standalone newsletter form unchanged.

## Requested outcome
- Change only the `/contact` page contact form.
- Keep the standalone `/contact` mailing-list form as-is.
- Require `name` and `email` for all submissions.
- Make `message` required only when newsletter opt-in is not selected.
- Keep newsletter opt-in explicit and optional.
- Allow partial success when contact send succeeds but newsletter signup fails.
- Avoid regressions in contact delivery, validation, and feedback states.

## Notes
- This task does not yet add the unified form to the homepage; that follow-up is tracked separately.
- Keep the delta narrow and do not broaden into unrelated contact-page redesign.
- Follow-up refinement: add concise GDPR/privacy wording near the newsletter opt-in in the unified form and improve checkbox presentation to better match the site design.
