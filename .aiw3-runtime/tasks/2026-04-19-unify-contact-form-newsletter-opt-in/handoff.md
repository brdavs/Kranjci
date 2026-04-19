# Handoff

## Task
Update the `/contact` page `PIŠITE NAM` form so it can optionally sign the sender up for the newsletter, without changing the existing standalone newsletter form on that page.

## Required behavior
1. `name` and `email` are always required.
2. Submit remains disabled until `name` and `email` are filled.
3. If newsletter opt-in is selected, `message` may be empty.
4. If newsletter opt-in is not selected, `message` is required before submit can enable.
5. Newsletter opt-in must remain explicit and optional.
6. Contact submission must still work without newsletter signup.
7. If contact send succeeds but newsletter signup fails, surface partial success clearly.
8. Add concise GDPR/privacy wording near the newsletter opt-in checkbox so the legal context is visible before the secondary consent checkbox appears.
9. Improve the checkbox visual treatment so it fits the existing site/form design better.

## Scope boundaries
- Change only the `/contact` `PIŠITE NAM` form and any minimally required shared submit logic.
- Do not modify the standalone `/contact` newsletter signup form.
- Do not add the unified form to the homepage in this task; that is tracked in a separate work order.
- Do not broaden into unrelated layout cleanup or redesign.

## Implementation guidance
- Prefer a maintainable shape that can later be reused on the homepage.
- Preserve existing visual language and feedback patterns where practical.
- Keep contact delivery as the primary flow; newsletter signup is optional add-on behavior.
- Preserve explicit consent/GDPR clarity for newsletter opt-in.
- Keep the delta localized to the shared unified form component and relevant CSS.

## Deliverable
- `/contact` has an updated contact form matching the required validation and submission behavior, while the standalone newsletter form remains unchanged.
