# Plan

- mode: execute_after_approval
- scope: Add a narrow `.gitignore` rule for `.aiw3-runtime/` only.
- constraints:
  - planner writes only runtime artifacts
  - no broader git workflow changes
  - no hooks, CI, or policy-file expansion
  - keep existing code and runtime files untouched except `.gitignore`
- acceptance_criteria:
  - `.gitignore` contains a rule that ignores `.aiw3-runtime/`
  - normal `git status` no longer shows untracked `.aiw3-runtime/**` files
  - no unrelated ignore rules are changed
- executor_role: developer-fast
- qa_required: no
- commit_required: no
- do_not_change:
  - application code
  - docs/ or other ignore patterns unless strictly needed
  - git hooks, CI, or branch settings
