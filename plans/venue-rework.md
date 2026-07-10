# Venue rework: visit-based ratings tied to itineraries and stops

## Problem

Venues are currently a standalone list: one shared `rating` number, a `fave` flag, and
freeform notes, with no record of when the couple went or which date a rating came from.
The stop-to-venue link is fragile: `Stop.venueId` is only set when a name is picked from the
builder's suggestion chips, and `venuesForStops` (useApp.ts) auto-creates venues on
completion by name match without writing `venueId` back onto the stop. The Album already has
the pattern we want (photos carry `itineraryId`, screens filter and label by date); venues
need the same tie to the core. The design doc's Venue Ratings FUNCTIONALITY NOTES
(design/extracted/sunny-planning.html around line 2614) also call for a venue detail view
with history and photos taken there.

## Decisions (confirmed with the user)

1. **Per-visit rating history.** Each rating is a record linked to the itinerary/stop it
   came from; the venue card shows the LATEST rating; a detail view shows the history.
   Rating from the card without date context still works (a dateless "manual" entry).
2. **Shared ratings.** One rating per visit (no per-partner split); notes keep their Y/P
   author chips exactly as today and stay on the venue card.
3. **Venue detail view** contains visit + rating history and photos taken there. Note
   history stays on the card, unchanged.

## Hard project rules (from CLAUDE.md, do not violate)

- No native browser dialogs, no `<input type="date">`; use `src/components/ConfirmDialog.tsx`
  and `src/components/Calendar.tsx` if ever needed.
- No emojis, no em dashes anywhere. Currency via `rm()` (not needed here).
- StyleX: tokens only from `src/theme/tokens.stylex.ts`; `stylex.create` at module top
  level; function styles for dynamic values; `xstyle` prop pattern; hex literals in shadows.
  Do not touch `vite.config.ts` / `babel.config.cjs`.
- Scripts via bun only: `bun run typecheck`. No new dependencies. Do not commit.

## Step 1: types (`src/lib/types.ts`)

```ts
export type VenueRating = {
  id: string;
  rating: number; // 1-5 paws
  /** The visit this rating came from; absent for a manual rating from the card. */
  itineraryId?: string;
  stopId?: string;
  /** Day the rating applies to; absent only for legacy migrated ratings. */
  dateISO?: string;
};
```

- `Venue` loses `rating: number` and gains `ratings: VenueRating[]`.
- Keep `fave`, `notes` (VenueNote with author) unchanged.

## Step 2: derive (`src/lib/derive.ts`)

- `latestRating(venue: Venue): number` - the rating of the newest entry, 0 when none.
  Newest = highest `dateISO`, entries without `dateISO` count as oldest; ties broken by
  array position (later wins). Appending keeps entries in insertion order.
- `venueVisits(venue: Venue, itineraries: Itinerary[]): VenueVisit[]` - one row per
  completed itinerary that involves the venue, newest first. An itinerary "involves" the
  venue when any stop has `venueId === venue.id` OR a rating entry references the
  itinerary. Each row: `{ itinerary, rating?: number }` where rating is that itinerary's
  entry if present. Tolerate dangling `itineraryId` on ratings (deleted date): fall back to
  a row with `dateISO` from the entry and no itinerary.
- `venuePhotos(venue: Venue, itineraries: Itinerary[], photos: Photo[]): Photo[]` - photos
  whose `itineraryId` is one of the involving itineraries, newest first.

## Step 3: store (`src/store/useApp.ts`)

- Replace `setVenueRating(id, rating)` with
  `rateVenue(venueId, rating, visit?: { itineraryId: string; stopId?: string; dateISO: string })`:
  - With `visit`: if an entry for the same `itineraryId` already exists, update its rating
    (re-rating a visit must not append duplicates); else append.
  - Without `visit`: manual entry with `dateISO = todayISO()`; if a manual entry (no
    itineraryId) for today exists, update it; else append.
- `venuesForStops` becomes `linkStopsToVenues(stops, venues)` returning
  `{ stops: Stop[]; newVenues: Venue[] }`: auto-created venues as today (category "Spot",
  `ratings: []`), and every stop gets `venueId` backfilled (matching existing venue by id or
  case-insensitive name, or the newly created one). Both completion paths (`advanceDay`
  final stop and `completeItinerary`) write the returned stops back onto the itinerary so
  the link is durable, not name-based.
- Builder-side hardening: in `addStop`/`updateStop`, when the patch has no `venueId` and the
  stop name case-insensitively equals an existing venue's name, set `venueId` automatically.
- Persist migration to version 4: every venue gets `ratings`; a legacy `venue.rating > 0`
  becomes one entry `{ id: "vr-legacy-" + venue.id, rating }` with NO dateISO (renders as
  "rated earlier"); delete the old `rating` field. Guard reads with `v.ratings ?? []`.

## Step 4: venue detail sheet (`src/components/VenueDetailSheet.tsx`, new)

Opened by tapping a venue card on Ratings. Follow `DateSpendSheet.tsx` for structure (Sheet
with a null-closes-it prop, keep-last-content-while-sliding-out pattern).

- Header: venue name (Sheet title), category line, FaveBadge in the corner (toggle works).
- Current rating: interactive `PawRating` bound to `latestRating`; tapping records a manual
  rating via `rateVenue(venueId, r)`.
- Visits section ("You have been here N times"): rows from `venueVisits`, each showing the
  itinerary title, `shortDate(dateISO)`, and that visit's paw rating (small, read-only) or
  "not rated" text; tapping a row navigates to `/plan/:id` (close the sheet first). Legacy
  entries without a date show "rated earlier".
- Photos section ("Snaps from here"): photos from `venuePhotos` rendered with the existing
  `Polaroid` component (read its props first; small size), tap opens the existing
  `PhotoLightbox`. Omit the whole section when empty.
- Notes stay on the card, NOT here.

## Step 5: Ratings screen (`src/screens/Ratings.tsx`)

- Venue card: `PawRating` now shows `latestRating(venue)`; the paw tap still rates
  (manual entry). Add a muted subline under the category when the venue has visits:
  "last visited <shortDate> · <itinerary title>" (use an interpunct, not an em dash).
- Sorting: replace `b.rating - a.rating` with latest ratings.
- Tapping the card body opens `VenueDetailSheet`. The FaveBadge, paw row, and
  "+ add a note" must keep working without opening the sheet (stopPropagation).
- **Post-date rating flow**: accept a `?date=<itineraryId>` query param (useSearchParams).
  When present and the itinerary exists, show a dismissible banner card at the top:
  "Rating <title>" with that date's venues (stops' venueIds) listed first; paw taps on
  those venues record the rating WITH the visit context
  (`rateVenue(venueId, r, { itineraryId, stopId, dateISO: itinerary.dateISO })`).
  Dismissing the banner clears the param. Venues not on that date rate as manual, as usual.
- `src/screens/DayOf.tsx`: the complete card's "Rate the places you went" button navigates
  to `/ratings?date=<itineraryId>` instead of `/ratings`.

## Step 6: demo data (`src/data/demo.ts`)

- Venues: `rating: n` becomes `ratings: [...]`. Give the story some history:
  - `ve-drivein`: one entry from `it-movie-night` (stopId `st-mv-drivein`, dateISO
    2026-06-24, rating 3).
  - `ve-kopi`, `ve-arcade`, `ve-ramen`: keep their current numbers as legacy entries
    (no dateISO) since their linked date (it-cafe-day) is still planned.
  - New venues for completed-date stops, each with `venueId` backfilled on the demo stop
    and one dated rating entry: "Pasar Malam Alley" (Street food, 5, Jul 7),
    "Rollerwave Rink" (Activity, 4, Jul 4), "BookXcess" (Books, 5, Jul 5),
    "Titiwangsa Lakeside" (Outdoors, 4, Jul 6). Lakeside makes the photos section show:
    ph-sunset belongs to it-lake-picnic.
- Keep every stop/expense/actualTotal number unchanged (Costs mockup totals must hold).

## Step 7: read sites and cleanup

- Search for remaining `venue.rating` / `setVenueRating` usages and update them
  (`ItineraryBuilder` suggestion chips do not use rating; verify).
- `venuesForStops` callers updated per step 3. No PrintView/Costs impact.

## Verification

1. `bun run typecheck` passes. Do not launch a browser; the user tests manually.
2. List for the user what to manually check: fresh seed (clear `sunny-planning-v1`) shows
   venue cards with latest ratings and "last visited" sublines; tapping a card opens the
   detail with visits and photos (Lakeside has a photo); completing a date then "Rate the
   places you went" lands on Ratings with the banner and records dated ratings; re-rating
   the same visit updates instead of duplicating; legacy venues show "rated earlier".

## Out of scope

- Per-partner ratings, moving note history into the detail view.
- Supabase sync.
- Venue editing/deleting or merging duplicate venues.
