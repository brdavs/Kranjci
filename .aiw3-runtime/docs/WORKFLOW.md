# Workflow

## AIW3 operating workflow
- `planner` is the only human-facing role.
- `planner` assigns one focused task to one developer.
- Runtime task artifacts live under `.aiw3-runtime/tasks/<task-id>/`.
- Runtime docs under `.aiw3-runtime/docs/` should reflect current code, not aspirational design.

## Repo workflows grounded in project files

### Local development
1. `npm install`
2. `npm run dev`
3. Open `http://localhost:5173`

### Local container development
1. `docker compose up --build`
2. Open `http://localhost:5173`
3. Source is bind-mounted into `/app`, so edits should hot-reload.

### Content refresh
1. `npm run fetch-shows`
2. `npm run fetch-news`
3. or `npm run fetch-all`

Important: generated JSON in `src/data/` is script output and should not be hand-edited.

### Build and deploy path
1. `npm run build`
2. `postbuild` generates RSS, sitemap, and robots files into `dist/`
3. Vercel serves the SPA with a catch-all rewrite to `index.html`
4. Vercel cron calls `/api/fetch-all` daily

### Documentation workflow for this repo
- Prefer current code and checked-in docs as source of truth.
- Record discrepancies between README/code and docs in runtime docs.
- Keep runtime docs operational: architecture, onboarding, workflow, current state, decisions, and open follow-ups.
