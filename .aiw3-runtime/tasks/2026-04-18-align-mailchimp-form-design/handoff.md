# Handoff

Owner: `developer-fast`

## Execute now
1. Inspect the current newsletter signup markup and CSS on the contact page.
2. Split the current combined contact-info/newsletter card into two separate `ContactCard`s: one for `Mobilni telefon in e-pošta` and one for `Prijava na e-novice`.
3. Keep the title `Prijava na e-novice` as the card title or otherwise present it cleanly inside the new card without duplication.
4. Refactor the newsletter section to follow the same design system/patterns as the existing contact form on that page.
5. Reuse `.contact-form` and existing input/label styles where practical.
6. Remove any now-unneeded spacing hacks or card-internal spacing workarounds.
7. Verify no regressions in UI feedback, validation, layout, or build/typecheck.

## Boundaries
- Do not redesign the entire contact page.
- Do not change package dependencies.
- Do not alter OS or system configuration.
- Do not commit.

## Expected report back
- Files changed
- What CSS/markup was simplified or reused
- Confirmation the Mailchimp flow still works the same
- Verification performed
- Confirmation no commit was made
