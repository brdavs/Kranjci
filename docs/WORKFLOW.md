# Workflow

The active AIW3 workflow is:
- `planner` is the only human-facing role
- `planner` picks one developer
- `qa-verifier` is optional
- if the first result fails or stalls, `planner` escalates to `developer-strong`

Runtime artifacts stay under `.aiw3-runtime/`:
- `work-orders/`
- `plans/`
- `handoffs/`
- `events/`
- `docs/`

Documentation is operational runtime state. It is generated under `.aiw3-runtime/docs/` and should stay untracked unless a human explicitly promotes content into real repo documentation.
