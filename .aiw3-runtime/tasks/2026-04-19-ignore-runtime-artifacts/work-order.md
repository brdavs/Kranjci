# Work Order: Ignore runtime artifacts in git

- work_order_id: `2026-04-19-ignore-runtime-artifacts`
- requested_by: human
- date: 2026-04-19
- objective: Add a gitignore rule so `.aiw3-runtime` stays local for convenience and does not appear in normal git status output.

## Requested outcome
- Update `.gitignore` to ignore `.aiw3-runtime/`.
- Keep the change narrow and do not add broader workflow enforcement.

## Notes
- Human explicitly prefers convenience over stricter safeguards.
