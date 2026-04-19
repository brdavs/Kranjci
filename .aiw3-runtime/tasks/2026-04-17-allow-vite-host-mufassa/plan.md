# Plan

- mode: execute_after_approval
- scope: Update `vite.config.ts` to explicitly allow the hostname `mufassa` and verify the dev server still runs.
- constraints:
  - planner writes only runtime artifacts
  - make the smallest possible config change
  - do not allow all hosts
  - do not change unrelated Vite behavior
- acceptance_criteria:
  - `vite.config.ts` includes `server.allowedHosts` with `mufassa`
  - Vite config remains valid
  - dev server can start successfully after the change
- executor_role: developer-fast
- qa_required: no
- commit_required: no
- do_not_change:
  - application code
  - unrelated Vite settings
  - deployment configuration
