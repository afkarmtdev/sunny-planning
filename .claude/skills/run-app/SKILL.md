---
name: run-app
description: Launch the Sunny Planning dev server and verify changes in the running app. Use when asked to run the app, check that a change works, or debug rendering.
---

# Run and verify Sunny Planning

## Launch

```bash
bun run dev
```

Run it in the background; the server comes up on http://localhost:5173 within a few seconds. Scripts must stay on `bunx --bun` (system Node is v14 and cannot run Vite).

## Verify a change

1. Probe the server: `curl -s -o /dev/null -w "%{http_code}" http://localhost:5173/` should print 200.
2. Fetch a transformed module to surface compile errors as non-200 or error payloads, for example `curl -s http://localhost:5173/src/screens/Home.tsx | head -20`. A correct StyleX transform leaves no `stylex.create(` in the output, only classname strings like `"x154lu6m"`.
3. For full confidence run `bun run typecheck` and `bun run build`. In the built CSS, StyleX rules should be present: `grep -o "\.x[a-z0-9]*" dist/assets/*.css | wc -l` should be in the hundreds. Near zero means the postcss extraction broke (check `babel.config.cjs` and `postcss.config.cjs` are in sync with `vite.config.ts`).

## App-specific checks

- Demo state persists in localStorage under `sunny-planning-v1`; clear that key (or use a private window) to get the pristine seed data from `src/data/demo.ts`.
- Routes to exercise: `/` (Home), `/plan` (redirects into the builder), `/today` (day-of flow), `/costs`, `/album`, `/ratings`, `/plan/<id>/export`, `/invite`, `/login`, `/j/<code>`.
- The print route `/print/<id>?skin=<skin>` auto-opens the browser print dialog shortly after load; that is intended behavior, not a bug.
- Supabase behavior only activates when `.env.local` defines `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`; without them the app is in demo mode and login is a pass-through.
