---
name: store-supabase-sync
description: How local store slices sync to Supabase in Sunny Planning, and the checklist for debugging "my edit does not reach Supabase" or "my saved edit reverts under live sync", or wiring a new module into sync. Use whenever a store write should reach Postgres but does not, a synced edit gets clobbered by a pull, or when adding a new synced entity/slice.
---

# Store <-> Supabase sync

All server sync lives in one file, `src/lib/sync.ts`. Screens never talk to
Supabase directly: they only read and write the Zustand store (`src/store/useApp.ts`),
and `sync.ts` bridges the store to Postgres. If a store write does not appear in
Supabase, the gap is almost always in `sync.ts`, not in the screen.

Sync only runs when Supabase is configured **and** a session exists: `RequireAuth`
resolves the space and calls `startSync(spaceId)`. In demo mode (no env vars)
nothing syncs and that is expected.

## Two shapes of synced data

1. **Collections** (`itineraries`, `venues`, `photos`, and their nested `stops` /
   `expenses` / `venue_ratings` / `venue_notes`). The store holds them nested; the
   server is flat. `flatten()` maps store -> flat rows, `assemble()` maps back.
   Changes are diffed against a per-table `snapshot` (id -> `updated_at`) and
   upserted/deleted. Pushed by `push()` / `pushOnce()`.
2. **Single-row slices** (`profile` -> the caller's `space_members` row). Not a
   collection: one row per member, updated in place with `.update()` (never
   upsert - RLS only lets a member update their own existing row; the row is
   minted by the `ensure_solo_space` / `accept_invite` RPCs). Pushed by
   `pushProfile()`, pulled by `pullProfile()`. `onboarded` is a client-only flag
   with no column.

When you add a new synced thing, decide which shape it is first.

## How a write reaches the server

`startSync` registers `useApp.subscribe((state, prev) => ...)`. On every store
change it:

- skips if `applyingRemote` is true (we are applying a server pull; do not echo it back),
- pushes the profile if `state.profile !== prev.profile`,
- pushes the collections if any of `itineraries` / `venues` / `photos` changed by reference.

So a slice only syncs if the subscription actually checks it. **A new slice that
is not named in this subscription will never push, no matter how correct the
mappers are.** This is the single most common reason a module "does not sync."

## Debugging: "my edit does not reach Supabase"

Work top-down; each step rules out a layer.

1. **Is sync even running?** Confirm Supabase env vars are set and you are signed
   in (demo mode never syncs). A `startSync` boot log / the initial `select`
   requests in the Network tab confirm it ran.
2. **Does the store actually change on the edit?** The action in `useApp.ts` must
   return a **new** object for the slice (`{ profile: { ...s.profile, ...patch } }`),
   so `state.X !== prev.X` is true. A mutation in place would not trip the
   subscription.
3. **Does the subscription watch this slice?** Check the `useApp.subscribe`
   callback in `startSync`. If the slice is not named there, add it. This was the
   bug for `profile` originally - the callback only checked collections.
4. **No network request fires at all** -> the push function short-circuited before
   the request. The usual cause is a **signature guard**: `pushProfile` compares
   `memberSig(profile)` to `profileSig` and returns early on a match. If boot
   recorded the *local* value as the server signature, an unchanged Save matches
   and never pushes. The fix: the pull must record what the **server** holds (or
   leave the signature blank when the server row is unset), then `startSync`
   reconcile-pushes the local value up. See "The reconcile gotcha" below.
5. **A request fires but returns 200 and nothing changes** -> server-side, not
   client. Almost always RLS or grants:
   - Grants: `authenticated` needs `select, insert, update, delete` on the table
     (`supabase/migrations/0004_grants.up.sql`). Missing grants fail with 42501.
   - RLS: an `update` whose `USING` clause matches no row updates 0 rows with **no
     error** (looks like success). Confirm the policy (e.g. `member_update_self`)
     matches the row you are targeting, and that the row exists.
6. **An error is logged but swallowed** -> `pushOnce` and `pushProfile` log to
   `console.error` and return; they do not surface to the UI. Check the console
   for `sync ... failed`.

## The reconcile gotcha (single-row slices)

For a slice that pre-dates its own sync (data onboarded/created before the sync
code existed), the local store has the value but the server row is still blank.
The pull must NOT stamp the signature with the local value, or an unchanged Save
will match the signature and skip the push forever. Pattern (`pullProfile` +
`startSync`):

- On pull, if the server value is set: adopt it and record its signature.
- If the server value is unset: keep local, leave the signature blank.
- After the pull, `startSync` reconcile-pushes the local value up when it is
  non-empty, so the server catches up on the next boot without a manual Save.

Collections get the same reconcile via `pull(..., "merge")` and the `keptLocal`
re-push; single-row slices need it wired explicitly.

## The revert gotcha (timestamps are never a change detector)

Symptom: in configured mode a saved edit (e.g. an itinerary title) flashes the
new value, then reverts to the old one moments later; demo mode is fine. The
culprit is always the same family: sync trusted a timestamp to answer "did this
row change / is this fetch fresh", and the timestamp lied. Two ways it lies:

1. **Across clocks.** Local `updatedAt` comes from the client clock (`nowISO`);
   server `updated_at` is rewritten by the `set_updated_at` trigger on the
   server clock. A wall-clock last-write-wins compare between them is
   meaningless: a client whose clock trails the server sees its own just-typed
   edit lose to the server's pre-edit row when the self-echo pull lands.
2. **Within one clock.** `nowISO()` has millisecond resolution, and one Save
   click can run several store actions synchronously (the Date-details sheet
   calls `setItineraryDate` then `renameItinerary`). Both stamp the SAME
   `updatedAt`. The push triggered by the first action captures the sig
   mid-burst; the queued push then sees an unchanged sig and silently drops the
   second write. The row now reads clean while local differs from server, so
   the next pull reverts the edit. This was the bug that survived the first
   "fix": the dirty-check was clock-independent but still keyed on `updatedAt`.

The rule: **timestamps (local or server) are audit data, never sync signals.**
`sync.ts` implements change detection and staleness with two clock-free
mechanisms; keep both intact when extending it:

- **Content signatures.** `contentSig(table, row)` signs the user-content
  columns (`CONTENT_COLS`, everything flatten emits except
  `created_at`/`updated_at`). The push diff sends rows whose content diverges
  from the last-acknowledged `snapshot` entry; the merge keeps rows that are
  dirty by the same compare. A mutation syncs even if it never bumps
  `updatedAt` (stop reorder, venueId backfill) and even if two actions share a
  millisecond.
- **Causal write sequence.** `writeSeq` increments on every acknowledged
  upsert/delete statement; each snapshot entry (and each delete tombstone)
  records the seq of its acknowledgement, and `pull` records `startSeq` BEFORE
  its SELECTs go out. A row acknowledged after `startSeq` cannot be reflected
  in that fetch, so the merge keeps the local side for exactly those rows
  (including keeping a tombstoned delete dead). This replaces any wall-clock
  "write guard" window: it is exact HTTP request/response causality, has no
  magic timeout to exceed on a slow network, and consumes no partner events -
  a partner edit hidden behind a stale fetch re-arrives on its own Realtime
  event's pull, which necessarily starts after the ack and is therefore fresh.

Two supporting invariants:

- `pushOnce` and the merge/apply half of `pull` run under one mutex
  (`withLock`), so a pull can never rewrite the snapshot while a multi-table
  push is mid-flight (which would make the push diff its stale flatten against
  new snapshot entries and clobber a partner row).
- `updated_at` is never sent in upsert payloads: the server owns that column
  (insert default + trigger), so it stays on a single clock. `created_at` is
  sent only when the local row has one.

Also: the merge round-trips every kept row through `flatten` -> `assemble`, so
store-only fields with no column (photo `src`/`author`, expense `receiptId`,
note `author`) are re-grafted by `graftLocalOnly` after every pull. A new
store-only field must be added there or pulls will wipe it.

Pulls are also **identity-preserving** (`reconcile` + `applyState`): a row whose
content did not really change keeps its previous object reference, arrays are
reused when untouched, and a no-op pull skips `setState` entirely. Screens
depend on this - the form standard's `isDirty` is reference-based, so without
it any Realtime echo flips every open editor to "Save changes" with no edits.
Do not replace store objects wholesale when applying server data.

This applies to any new collection you merge: never reintroduce an `updated_at`
comparison (or any timestamp compare) as the conflict resolver or change
detector, and add the new table's user-content columns to `CONTENT_COLS`.

## Checklist: wiring a new module into sync

- Pick the shape (collection vs single-row) and confirm a server table/columns
  exist for it (`supabase/migrations/`); add a numbered migration if not, and keep
  the local model and schema in step. See [[audit-trail]] for the audit columns.
- Collection: extend `flatten()`, `assemble()`, the `TABLES` list (FK-safe order),
  `CONTENT_COLS` (user-content columns only, never timestamps), the per-table maps
  (`emptySnapshot` / `emptyTombstones` / `emptyRowMaps`), the Realtime channel
  `.on(...)` subscriptions, and `graftLocalOnly` if the store carries fields with
  no column.
- Single-row: add a `pull<Name>` and `push<Name>` pair modelled on the profile
  ones, plus its own signature var.
- **Name the slice in the `useApp.subscribe` callback in `startSync`** so it
  actually pushes.
- Guard every server-applied write with `applyingRemote = true` around the
  `setState` so the pull does not echo back as a push.
- Add the reconcile push if the slice can carry local data from before sync existed.
- `bun run typecheck`.

Verifying sync needs live Supabase env vars; typecheck plus a Network-tab check
(request fires, row changes) is the practical confirmation - the app runs in demo
mode here otherwise.
