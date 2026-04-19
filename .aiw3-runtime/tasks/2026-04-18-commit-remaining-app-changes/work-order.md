# Work Order: Commit remaining app changes

- work_order_id: `2026-04-18-commit-remaining-app-changes`
- requested_by: human
- date: 2026-04-18
- objective: Review the remaining uncommitted application-facing changes, group them into meaningful commits, and create those commits without including runtime artifact files or other unrelated files.

## Requested outcome
- Include the remaining app/code/config files in one or more focused commits.
- Keep unrelated runtime/docs/process artifacts out of the commits.
- Include the `Home_VIDEO` change in an appropriate commit.
- Leave `.env` and `.aiw3-runtime/**` uncommitted.

## Notes
- Previous commits already covered Mailchimp signup and ALTCHA migration.
- Remaining files appear to fall into remote-content freshness, shared navigation refactor, script cleanup, and tooling/config buckets.
