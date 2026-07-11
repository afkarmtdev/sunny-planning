# Plan: per-member venue ratings

## Goal

Let both members of the couple space hold their own rating for the same venue
visit (and the same manual-rating day), instead of the current behavior where
the second member's rating overwrites the first. Attribution already exists
(`VenueRating.createdBy` via the audit trail, rendered by `AuthorChip`); what
changes is the dedup key in the store, the derived helpers, and the four UI
surfaces that show or edit a rating.

Read these skills before starting: `i18n` (new copy), `store-supabase-sync`
(one sync gotcha below is exactly its territory), `form-save-discard`
(VenueEditSheet already complies; keep it that way), `audit-trail`.

## Current state (verified)

- `VenueRating` (`src/lib/types.ts:144`) already carries `createdBy` via `Audit`.
- `rateVenue` (`src/store/useApp.ts:592`) dedups visit ratings by `itineraryId`
  alone and manual ratings by `!itineraryId && dateISO === today` alone. No
  member in either key, so partner writes update the other member's entry.
- Server side needs NO schema change: `venue_ratings`
  (`supabase/migrations/0001_initial_schema.up.sql:144`) is one row per rating
  event with `created_by`, no uniqueness constraint, and sync round-trips
  `created_by` both ways (`src/lib/sync.ts:161`, `:281`).
- `actingUserId` (`src/store/useApp.ts:24`) is the signed-in member's id;
  undefined in demo mode. `getActingUser()` is exported.
- Members roster lives in `store.members`; `AuthorChip` resolves `by` against
  `members[].userId` and renders nothing for unknown/absent ids.

## Semantics to implement

1. A rating entry is owned by `createdBy`. Owner key = `createdBy ?? undefined`
   (undefined = the shared/unattributed bucket).
2. Each owner has at most one rating per visit (`itineraryId`) and at most one
   manual rating per venue per day.
3. Demo mode (`actingUserId` undefined): the owner key is undefined for every
   write, which matches the unattributed bucket, so behavior collapses to
   exactly today's single shared rating. No special-casing needed beyond the
   key comparison.
4. Claiming: when a signed-in member rates a context whose only existing entry
   is unattributed (legacy demo data or pre-auth history), update that entry in
   place and stamp `createdBy`/`updatedBy` with the acting member rather than
   appending a duplicate row for the same visit. Rationale: backfilling an
   unknown author with a known one keeps the visit history one-row-per-owner;
   without it, a pre-auth rating lingers forever next to the member's new one.

## Changes by file

### 1. `src/store/useApp.ts` — rateVenue (line ~592)

For the visit branch, replace the single `findIndex` with:

- First look for the acting member's own entry:
  `r.itineraryId === visit.itineraryId && r.createdBy === actingUserId`
  (in demo mode this matches unattributed entries, preserving old behavior).
- If none and `actingUserId` is set, look for an unattributed entry
  (`!r.createdBy`) for the same itinerary and claim it: update rating/stopId/
  dateISO, spread `...touchedAudit()`, and set `createdBy: actingUserId`.
- Otherwise append a new entry with `...createdAudit()` (which already stamps
  `createdBy` when signed in).

Mirror the same three steps in the manual branch with the key
`!r.itineraryId && r.dateISO === today`.

Extract a tiny local helper if it keeps the two branches readable, but keep
`stylex`/store conventions: pure map over `s.venues`, `...touchedAudit()` on
the venue itself on every change.

No type changes and no persist-version bump: the data shape is unchanged, only
write-time dedup semantics change. Do not add a migration.

### 2. `src/lib/derive.ts`

- Add `memberRatingEntries(venue: Venue): VenueRating[]` — the newest entry per
  owner (group by `createdBy ?? ""`, pick newest within each group using the
  same rule as `latestRatingEntry`: highest `dateISO`, dateless counts oldest,
  ties broken by array position later-wins). Return in stable venue-array
  order; callers put the acting member first if they care.
- Repoint `latestRating(venue)` to mean "sort/aggregate score": the average of
  `memberRatingEntries` values (a float is fine, it feeds sorting). Keep the
  name or rename to `venueScore` — if renamed, update both callers
  (`Ratings.tsx:219` sort; the card display at `:386` moves to per-member rows
  anyway, see below).
- `latestRatingEntry` will lose its display callers; delete it if nothing else
  uses it after the UI changes, or keep it only if the claim logic wants it.
- `venueVisits`: change `VenueVisit.rating?/ratedBy?` to
  `ratings: Array<{ rating: number; ratedBy?: string }>` and collect ALL
  entries matching the itinerary (`filter`, not `find`). Manual/orphan entries
  still emit one row each (two members' same-day manual ratings = two rows,
  each with its own chip; that is fine and honest). Keep the
  claimed-itinerary-ids logic as is.

### 3. `src/lib/sync.ts` — one line, but load-bearing

Add `"created_by"` to `CONTENT_COLS.venue_ratings` (line ~480). The claim flow
mutates `created_by` on an existing row, and if the paw value happens to be
unchanged the content signature would otherwise be identical, so the claim
would never push to Supabase. This is the `store-supabase-sync` "my edit does
not reach Supabase" trap. `created_by` round-trips verbatim, so it is safe in
the signature.

No other sync changes; pushes are id-keyed upserts and per-member entries have
distinct ids.

### 4. `src/components/VenueDetailSheet.tsx`

- Header rating row (lines 160-166): replace the single chip+paws with one row
  per entry from `memberRatingEntries(current)`, acting member (via
  `getActingUser()`) first. Each row: `AuthorChip by={entry.createdBy}` +
  `PawRating value={entry.rating}`. When the list is empty render one
  `PawRating value={0}` as today.
- Label: replace the `ratings.yourRating` key with a new `ratings.ourRating`
  ("OUR RATINGS" / zh "我们的评分" / pinyin per the i18n skill rules). Remove
  the old key from the catalogue.
- Visit rows (lines 194-201): a visit can now hold up to two ratings. Render
  `visit.ratings` stacked in a small column (flex column, gap 4, aligned
  right), each chip+paws at the current small sizes; fall back to the
  `ratings.notRated` text when the array is empty.

### 5. `src/screens/Ratings.tsx`

- Card paw row (lines 384-397): swap `lastEntry`/`latestRating` for
  `memberRatingEntries(venue)` rows (stacked, acting member first), pencil
  unchanged. Empty list renders `PawRating value={0}` as today.
- Sort (line 219): keep using the aggregate score helper from derive.
- Rate-day banner rows (lines 327-359): `entry` becomes "the acting member's
  entry for this visit" (owner key match, demo mode = unattributed). Show the
  partner's entry too, read-only, as a second chip+paws beside or below yours.
  The pencil stages YOUR rating (see next point).
- Edit-target resolution (lines 274-283): `value` = the acting member's rating
  for the context (visit: own entry for that itinerary; manual: own newest
  entry), `?? 0`. Never stage the partner's number, otherwise Save would fork
  their value into your entry.

### 6. `src/screens/ItineraryBuilder.tsx`

- Stop row (line 782): `visitRating` becomes the acting member's rating for
  this visit (owner-key match, demo = unattributed). The
  `builder.thisVisit`/`builder.rateThisVisit` label keys off that value.
- Show the partner's rating for the stop when present: a small
  `AuthorChip + PawRating` after yours (same 16px scale). Keep it read-only;
  the pencil still opens VenueEditSheet staged with YOUR value — fix the
  `rateTarget.value` lookup at line 626 the same way as in Ratings.tsx.

### 7. `src/components/VenueEditSheet.tsx`

No structural change: it stages a number and calls `rateVenue`, which now keys
by acting member. Just verify the staged `value` passed in by both callers is
the acting member's (steps 5 and 6). Save/discard behavior already follows the
form-save-discard standard; do not regress it.

### 8. i18n catalogue (`src/lib/i18n/messages/ratings.ts`)

Follow the i18n skill (glossary, pinyin tone-number rules) for:

- `ratings.ourRating` replacing `ratings.yourRating`.
- Any new aria labels if added (e.g. a per-member rating row aria like
  "{name}: {value} paws") — optional, only if straightforward.

No other locales work: currency/dates untouched.

## Explicitly out of scope

- No Supabase migration. The schema already fits. (A future hardening
  migration could restrict `venue_ratings` UPDATE to the row's author, but the
  claim flow updates rows whose `created_by` is null and sync conflict-merges
  can legitimately push partner rows, so leave RLS as space-wide for now.)
- No persist-version bump / local data migration.
- No change to demo seed (`src/data/demo.ts`); unattributed demo ratings render
  without chips exactly as today.
- No averaging UI (half paws etc.); the average is only a sort key.

## Verification

1. `bun run typecheck`.
2. Demo-mode walk with the `verify` skill: rate a venue from the card twice in
   one day (updates in place, no duplicate), rate a visit from the builder and
   re-rate from the Ratings banner (same entry updates), detail sheet shows the
   single shared rating with no chip.
3. Per-member paths cannot be exercised in demo mode (no session). Simulate by
   temporarily calling `setActingUser("<uuid-a>")` / `"<uuid-b>"` from the
   console (it is exported) with two seeded members, or at minimum unit-walk
   the logic by hand: rate a visit as A, switch to B, rate the same visit —
   expect two entries; re-rate as B — still two, B's updated. Claim path:
   unattributed entry + signed-in re-rate — expect one entry now owned by the
   member and (with rating unchanged) still pushed to sync thanks to the
   CONTENT_COLS change.
4. Sync spot-check per the store-supabase-sync skill checklist if a Supabase
   env is configured.

## Housekeeping

- The working tree already has uncommitted changes (maps deep links, i18n
  edits) touching some of the same files (`VenueDetailSheet.tsx`,
  `Ratings.tsx`, `derive.ts`). Build on top of them; do not revert anything.
  Commit this feature as its own themed commit per CLAUDE.md.
- Copy style: no emojis, no em dashes, RM currency.
- After the session, fold any non-obvious lesson into a skill (the
  CONTENT_COLS/claim interaction likely belongs in `store-supabase-sync`).
- Delete this plan file in the feature commit once executed.
