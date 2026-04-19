# Handoff

Owner: `developer-standard`

## Execute now
1. Refactor the most oversized UI files for readability only, prioritizing `src/app.tsx` and `src/routes/Contact.tsx`.
2. Prefer extracting small, obvious components/helpers/data modules rather than rewriting logic.
3. Keep runtime behavior unchanged.
4. Re-verify with real commands after the refactor; use browser verification for key routes.

## Suggested targets
- Extract navigation/header concerns from `src/app.tsx`
- Extract footer/layout constants from `src/app.tsx` where sensible
- Move static contact/business/stage data out of `src/routes/Contact.tsx`
- Extract hCaptcha helper/loader from `src/routes/Contact.tsx`
- Extract contact form and card/info sections into smaller components if that reduces file complexity cleanly

## Boundaries
- Do not change unrelated behavior.
- Do not redesign the UI.
- Do not change API contracts.
- Do not commit unless explicitly requested later.

## Expected report back
- Files changed and why
- What was extracted/simplified
- Verification commands/actions performed
- Confirmation that behavior remained unchanged
