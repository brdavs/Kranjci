# Handoff

## Task
Add `.aiw3-runtime/` to `.gitignore`.

## Constraints
- Keep this as a one-file, minimal-delta change.
- Do not add hooks, CI checks, or extra policy files.
- Do not modify application code.

## Verification
- After the change, normal `git status` should no longer list `.aiw3-runtime/**` untracked files.

## Deliverable
- Updated `.gitignore` with `.aiw3-runtime/` ignored.
