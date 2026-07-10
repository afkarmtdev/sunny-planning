# Sunny Planning

A private pocket-pet date planner for two. Plan itineraries, navigate stop by stop with Waze, track costs, keep a polaroid album, rate venues with paw prints, and export each date as a themed PDF. Sunny the pixel cat gets happier the more dates you log.

Implemented from the Claude Design project "Sunny Planning" (design source and extracted assets live in `design/`).

## Stack

Bun, Vite, React 19, StyleX, Zustand (with localStorage persistence), React Router, Supabase (auth + database, optional).

## Run it

```
bun install
bun run dev
```

Other scripts: `bun run build`, `bun run preview`, `bun run typecheck`.

## Demo mode vs Supabase

With no environment variables the app runs in demo mode: seeded data from the design mockups, no login, and all edits persist to localStorage.

To wire up Supabase:

1. Create a project, then run the migrations in `supabase/migrations/` (ascending order) in the SQL editor. Optionally run `supabase/seed.sql` for the demo dataset. See `supabase/migrations/README.md`.
2. Copy `.env.example` to `.env.local` and fill in the project URL and publishable key (`sb_publishable_...`, under Project Settings > API keys). It is client-safe and respects RLS; never use the secret key here.
3. Enable the Email (magic link) provider under Authentication.

With env vars present the app requires a session and the login screen sends real magic links. Data sync against the schema is the next step; screens currently read and write the local store.

## Dependency policy

Supply chain cooldown, enforced two ways:

- `bunfig.toml` sets `minimumReleaseAge = 864000` (10 days, in seconds), so `bun install` refuses versions published more recently.
- `package.json` pins exact versions, each chosen as the newest stable release at least 10 days old at the time of adding.

Keep both rules when adding dependencies. Bun's default of skipping lifecycle scripts (except `trustedDependencies`) should also stay untouched.

## Feature map

- Home: mascot happiness (derived from dates completed in the trailing 30 days), next date card, stats, plan CTA
- Plan: drag-reorderable stop trail, per-stop edit sheet, travel time chips, live estimated total, Waze deep links
- Today: live "day of" mode with progress dots, LCD travel readout, GO flow; completing the final stop logs the cost and celebrates
- Costs: month HUD, averages, recent dates, receipt upload attached to the latest date
- Album: staggered polaroids with editable handwritten captions, photo upload (downscaled to fit localStorage)
- Ratings: paw-print ratings, holo FAVE badge toggle, per-partner notes
- Export: four PDF skins (Strawberry Milk, Retro LCD, Scrapbook, Love Letter) rendered on a print route that opens the system print dialog for save-as-PDF
