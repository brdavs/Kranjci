# Handoff

## Task
Add the new unified contact form to the index page below the `KONTAKT IN POVPRAŠEVANJE` block.

## Context
- This work order is a follow-up to the planned contact-form change on `/contact`.
- Reuse the same unified form behavior rather than creating a separate homepage-only variant.
- The existing standalone newsletter form on `/contact` must stay as-is.

## Required behavior
1. `name` and `email` are always required.
2. If newsletter opt-in is selected, `message` may be empty.
3. If newsletter opt-in is not selected, `message` is required.
4. Newsletter opt-in must remain explicit and optional.
5. If contact send succeeds but newsletter signup fails, surface partial success clearly.

## Placement
- Render the unified form below the `KONTAKT IN POVPRAŠEVANJE` block on the front page.
- Keep the homepage layout aligned with the current design language; do not broaden into homepage redesign.

## Constraints
- Keep the delta narrow and maintainable.
- Prefer shared/reusable form code if the `/contact` and index implementations would otherwise diverge.
- Do not modify the standalone `/contact` newsletter signup form.
- Do not add dependencies or change infrastructure.

## Deliverable
- Index page includes the unified contact form in the requested location with the same validation, submit, and feedback behavior as the updated `/contact` contact form.
