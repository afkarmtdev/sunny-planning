# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Sunny Planning: a couples' date-planner SPA (itinerary builder, live day-of mode, cost tracker, polaroid album, venue ratings, themed PDF export) with a Tamagotchi-style mascot, Sunny the pixel cat, whose happiness derives from logged dates. Implemented from the Claude Design project "Sunny Planning". The extracted design doc at `design/extracted/sunny-planning.html` (nine screens, tokens, and per-screen FUNCTIONALITY NOTES) is the visual and behavioral source of truth; check it before inventing UI.

## Commands

- `bun install`
- `bun run dev` (Vite dev server on http://localhost:5173)
- `bun run build`
- `bun run typecheck`
- `bun run preview`

There is no test suite yet. All scripts go through `bunx --bun` because the system Node is v14 and cannot run Vite or TS 6; never strip the `--bun` flag or invoke the `vite`/`tsc` bins directly.

`node_modules/` is read-denied by workspace permissions; to inspect a package's published internals, fetch from unpkg instead (`https://unpkg.com/<pkg>@<version>/<path>`).

## Dependency policy (strict)

Every dependency version must have been published at least 10 days before install, to dodge fresh supply chain compromises (Shai-Hulud style). Enforced twice: `bunfig.toml` sets `minimumReleaseAge = 864000` (seconds), and `package.json` pins exact versions (no `^`, no `latest`). To add or upgrade a package, use the `add-dep` skill: resolve the newest stable version at least 10 days old from the registry `time` data, pin it exactly, then `bun install`. Keep Bun's default of skipping lifecycle scripts.

## StyleX pipeline (non-standard, easy to break)

`@vitejs/plugin-react` v6 is oxc-based and has no `babel` option, so StyleX compiles in a custom `stylexBabel` pre-transform plugin inside `vite.config.ts` (runtimeInjection false). CSS is extracted separately by `@stylexjs/postcss-plugin` (`postcss.config.cjs`), which is the only consumer of `babel.config.cjs`, and lands where `src/stylex.css` declares `@stylex;`. The two halves must stay in sync: any change to the StyleX babel options in `vite.config.ts` must be mirrored in `babel.config.cjs`, or dev classnames and extracted CSS drift apart.

StyleX conventions in this repo:

- Design tokens come only from `src/theme/tokens.stylex.ts` (`defineVars`); only `*.stylex.ts` files may export vars.
- Box shadows and gradients use hex literals (for example `4px 4px 0 0 #332B33`), not token vars, because template literals with vars are not statically evaluable.
- `stylex.create` only at module top level. Dynamic values use function styles, for example `sticker: (deg: number) => ({ transform: ... })`.
- Components accept an `xstyle?: StyleXStyles` prop for overrides, merged via `stylex.props(base, variant, xstyle)`.
- Interaction states are conditional values, for example `transform: { default: "translateY(0)", ":active": "translateY(5px)" }`.

## Architecture

- **State**: one Zustand store, `src/store/useApp.ts`, persisted to localStorage key `sunny-planning-v1`. Seed data (`src/data/demo.ts`, matching the design mockups around July 2026) loads on first run; clearing that key resets the demo. Derived numbers (month totals, streak weeks, mascot happiness, next planned date) are computed in `src/lib/derive.ts` and never stored.
- **Supabase is optional**: `src/lib/supabase.ts` exposes `isSupabaseConfigured` from `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`. Absent env vars mean demo mode: `RequireAuth` passes everyone and Login's button just enters the app. Present env vars gate the app behind a session and Login sends real magic links. The couple-space schema with RLS is `supabase/schema.sql`; screens still read and write only the local store, so server data sync is the known open work.
- **Routing** (`src/App.tsx`): a data router (`createBrowserRouter`) so screens can call `useBlocker` to guard unsaved edits; do not revert it to the plain `BrowserRouter`/`Routes` form. Tab roots (`/`, `/plan/:id`, `/today`, `/costs`, `/album`, `/ratings`) render inside `TabLayout`, which appends the `StickerTabBar`. `/plan/:id/export`, `/invite`, and `/print/:id` sit outside it (back button instead of tabs). `/plan` redirects to the next planned itinerary, creating one when none exists.
- **Day-of flow**: `store.dayOf` holds `{ itineraryId, stopIdx, completed }`. `advanceDay` on the final stop completes the date: itinerary status flips to completed and an expense is appended (keyed by `itineraryId`). `resetDay` reverses both.
- **PDF export**: `ExportPicker` saves the skin on the itinerary, then navigates to `/print/:id?skin=...`. `src/print/PrintView.tsx` styles the document per skin (Strawberry Milk, Retro LCD, Scrapbook, Love Letter) and auto-calls `window.print()`; saving as PDF from the dialog is the export. Printing depends on the `.no-print` class and `@page` rules in `src/global.css`.
- **Design language**: tokens (shellPink, bubblegum, heartPop, cream, lcdMint, marmalade, lavender, ink), fonts (Baloo 2 display, Nunito body, Silkscreen for LCD numerals, Gaegu handwriting), 2-3px ink borders, hard offset shadows, sticker rotations. Sprites live in `src/assets/sunny/`.

## No native browser UI

Never use native browser dialogs or inputs that render OS chrome: no `window.confirm`, `window.alert`, or `window.prompt`, and no `<input type="date">`. They break the themed look and feel. Use the in-app equivalents instead: `src/components/ConfirmDialog.tsx` for confirmations (pass `tone="danger"` for destructive actions) and `src/components/Calendar.tsx` for date picking.

## Forms: save and discard (standard)

Any screen that edits store data is transactional from the user's point of view,
even though the store persists to localStorage on every write. The standard, on
every editable screen: an explicit **Save** action that commits the edits, a
themed **discard prompt** on any exit with unsaved edits that reverts to the last
saved state, and locked (completed/cancelled) states that hide edit affordances so
the user must reopen to edit. The mechanism is a baseline snapshot plus reference
`isDirty` detection plus `useBlocker` (never persist-blocking or native prompts).
`src/screens/ItineraryBuilder.tsx` is the reference implementation. Before building
or changing a form, follow the `form-save-discard` skill.

## Capture reusable work as skills

After any session, create or update a skill under `.claude/skills/<name>/SKILL.md`
for anything that could be reused or should become a standard: a non-obvious
procedure, a pattern worth repeating, a convention future work must follow, or a
gotcha and its fix. Prefer updating an existing skill over adding a near-duplicate.
When a skill encodes a house standard (not just a how-to), also add a short pointer
to it from this file so it is discoverable, as the `form-save-discard` section does.

## Copy style

No emojis and no em dashes anywhere: UI copy, code comments, docs, commit messages. Currency is RM via `src/lib/format.ts`.

Commit messages carry no `Co-Authored-By` trailer.
