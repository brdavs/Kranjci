# Work Order: Add unified contact form to index page

- work_order_id: `2026-04-19-add-contact-form-to-index`
- requested_by: human
- date: 2026-04-19
- objective: Add the new unified contact form to the index page below the `KONTAKT IN POVPRAŠEVANJE` block while preserving the existing standalone newsletter signup form behavior on `/contact`.

## Requested outcome
- Reuse the new unified contact-form experience on the index page.
- Place it below the `KONTAKT IN POVPRAŠEVANJE` block on the front page.
- Preserve the submit rules defined for the updated contact form: `name` and `email` always required; `message` required only when newsletter opt-in is not selected.
- Keep newsletter opt-in explicit and optional.
- Preserve partial-success behavior when contact send succeeds but newsletter signup fails.
- Avoid regressions to the existing `/contact` standalone newsletter signup form.

## Notes
- This is a follow-up work order and depends on the unified contact-form behavior being finalized first.
- Scope is the index-page addition only; do not broaden into unrelated homepage redesign.
