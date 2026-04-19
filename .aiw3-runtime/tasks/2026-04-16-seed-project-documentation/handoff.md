# Handoff

Owner: `developer-standard`

## Execute now
1. Rebuild or comprehensively refresh `.aiw3-runtime/docs/` to the current planner runtime-documentation standard.
2. Treat `.aiw3-runtime/docs/` as runtime operational documentation, not as OpenSpec/proposal documentation.
3. Use current repository files as primary evidence: `README.md`, `package.json`, `src/`, `api/`, `scripts/`, `docker-compose.yml`, `vercel.json`, relevant content loaders, and existing runtime docs where still accurate.
4. Ensure the resulting docs clearly cover: architecture, onboarding, workflow, current state, decisions, open items, and practical operational history/handoff as useful.
5. Remove, replace, or explicitly flag outdated legacy assumptions tied to OpenSpec or missing repo-level AGENTS files.
6. Capture the real run/deploy path actually used by this repo, and note any important discrepancies between code and older docs.

## Boundaries
- Do not edit repo source files for this task.
- Do not run build, tests, git, or commit actions.
- Do not copy raw secrets from `.env` into docs.
- Keep the delta maintainable; prefer updating the existing runtime doc set rather than creating unnecessary new files.

## Expected report back
- What docs were recreated or updated
- What standard was applied to the runtime docs
- Any uncertainty, legacy assumptions removed, or gaps in source-of-truth
- Key discrepancies documented
