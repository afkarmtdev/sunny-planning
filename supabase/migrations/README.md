# Migrations

Ordered, reversible SQL migrations for the Sunny Planning couple-space backend.
Laravel-style: every migration is a pair of files, an `up` that applies it and a
`down` that reverses it.

## Naming

```
NNNN_short_description.up.sql
NNNN_short_description.down.sql
```

`NNNN` is a zero-padded sequence number that defines apply order. The `up` files,
concatenated in order, are the full current schema; there is no separate
`schema.sql`.

## Transactions

Every migration (both `up` and `down`) is wrapped in `begin; ... commit;` so it
applies atomically: if any statement fails partway through, the whole file rolls
back and the schema is never left half-applied. Fix the file and re-run it from
the top. If your SQL client leaves the failed transaction open (you see "current
transaction is aborted"), run `rollback;` once to clear it, then re-run.

Keep migrations transaction-safe: do not add statements Postgres refuses to run
inside a transaction block (e.g. `create index concurrently`, `alter type ... add
value`, `vacuum`). None of the current migrations use those.

## Applying

These target a hosted Supabase project (no local Supabase CLI required):

1. Open the project's SQL editor.
2. Run each `*.up.sql` in ascending `NNNN` order. Run each file once.
3. Optionally run `../seed.sql` to load the demo dataset.

To roll one back, run its `*.down.sql`. Roll back in descending order when
undoing several (e.g. `0003` down before `0002` down).

If you use the Supabase CLI instead, `supabase db reset` applies everything in
`migrations/` and then runs `../seed.sql`.

## Current migrations

- `0001_initial_schema` - tables (spaces, members, invites, venues, itineraries,
  stops, expenses, photos, venue_ratings, venue_notes), reconciled with the local
  Zustand store shape, plus RLS policies and the `updated_at` trigger.
- `0002_realtime_and_storage` - adds the synced tables to the `supabase_realtime`
  publication and creates the private `photos` and `receipts` storage buckets with
  member-scoped access policies.
- `0003_space_rpcs` - security-definer functions `ensure_solo_space()`,
  `accept_invite(code)`, and `join_demo_space()` (the only sanctioned way to
  create or join a space, since a new user is not yet a member of anything).
- `0004_grants` - base table/function GRANTs to the `authenticated` role. RLS
  (0001) gates which rows; without these grants every client query is denied with
  42501 before RLS even runs.

## Adding a migration

Create the next `NNNN` pair. Wrap each file's body in `begin; ... commit;`. Keep
the `down` a faithful inverse of the `up` (drop what it created, in reverse
dependency order). Never edit an already-applied migration; add a new one instead.
