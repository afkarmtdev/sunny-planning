// Coop sync: bridges the local Zustand store and Supabase for a shared space.
//
// Shape of the deal (decided in the v2 roadmap, Milestone 4):
//   - Logged-in spaces START EMPTY and fill only from server rows; local demo
//     data is never uploaded.
//   - Writes are OPTIMISTIC: the store mutates immediately, and we push the
//     changed rows to Postgres in the background (diffing the collections).
//   - Partner changes arrive over Realtime; any event triggers a debounced full
//     refetch (the dataset is small, so a refetch is simpler and safer than
//     merging individual nested events).
//   - Conflict handling is CONTENT-based and clock-free. Timestamps are never
//     trusted for change detection: local updatedAt stamps come from the client
//     clock at millisecond resolution (two writes in one tick collide), while
//     server rows are stamped by the set_updated_at trigger on the server
//     clock. Instead, each row's user content is signed (contentSig) and diffed
//     against the snapshot of what the server last acknowledged, and a
//     monotonic write sequence decides whether a fetch is stale for a given
//     row: a SELECT that started before we acknowledged a write cannot be
//     trusted to reflect it, so that row (or its deletion, via a tombstone) is
//     kept as-is. No wall-clock windows, no magic timeouts.
//
// Everything here is a no-op unless Supabase is configured; demo mode never
// imports a live client. The store shape is nested (itineraries hold stops and
// expenses; venues hold ratings and notes) while the server is flat, so the
// mappers below flatten on push and re-nest on pull. Store-only fields with no
// column yet (photo src/author, expense receiptId, note author) are grafted
// back onto re-assembled rows so a pull never wipes them.

import type { SupabaseClient } from "@supabase/supabase-js";
import { supabase } from "./supabase";
import { setActingUser, useApp } from "../store/useApp";
import { DEFAULT_AVATAR_COLOR } from "./avatar";
import { signAvatar, signAvatars, uploadAvatar } from "./storage";
import type { Expense, Itinerary, Member, Photo, Profile, Stop, Venue, VenueNote, VenueRating } from "./types";

// The tables we flatten the store into, in FK-safe upsert order (parents first)
// and reverse for deletes.
const TABLES = [
  "venues",
  "itineraries",
  "stops",
  "expenses",
  "photos",
  "venue_ratings",
  "venue_notes",
] as const;
type TableName = (typeof TABLES)[number];

type Row = Record<string, unknown> & { id: string; updated_at?: string | null };

/** All rows to sync, grouped by table, plus the assembled store collections. */
type Flattened = Record<TableName, Row[]>;

// ---- Flatten: store -> flat rows -----------------------------------------

function flatten(
  spaceId: string,
  itineraries: Itinerary[],
  venues: Venue[],
  photos: Photo[]
): Flattened {
  const out: Flattened = {
    venues: [],
    itineraries: [],
    stops: [],
    expenses: [],
    photos: [],
    venue_ratings: [],
    venue_notes: [],
  };

  for (const it of itineraries) {
    out.itineraries.push({
      id: it.id,
      space_id: spaceId,
      title: it.title,
      date: it.dateISO,
      status: it.status,
      skin: it.skin,
      draft: Boolean(it.draft),
      actual_total: it.actualTotal ?? null,
      created_at: it.createdAt ?? null,
      updated_at: it.updatedAt ?? null,
      created_by: it.createdBy ?? null,
      updated_by: it.updatedBy ?? null,
    });
    it.stops.forEach((st, i) => {
      out.stops.push({
        id: st.id,
        itinerary_id: it.id,
        position: i,
        name: st.name,
        time_label: st.time,
        note: st.note,
        cost: st.cost,
        lat: st.lat ?? null,
        lng: st.lng ?? null,
        travel_minutes_to_next: st.travelMinutesToNext ?? null,
        travel_mode_to_next: st.travelModeToNext ?? null,
        venue_id: st.venueId ?? null,
        created_at: st.createdAt ?? null,
        updated_at: st.updatedAt ?? null,
        created_by: st.createdBy ?? null,
        updated_by: st.updatedBy ?? null,
      });
    });
    for (const ex of it.expenses ?? []) {
      out.expenses.push({
        id: ex.id,
        space_id: spaceId,
        itinerary_id: it.id,
        stop_id: ex.stopId ?? null,
        label: ex.label,
        amount: ex.amount,
        spent_on: ex.createdISO,
        created_at: ex.createdAt ?? null,
        updated_at: ex.updatedAt ?? null,
        created_by: ex.createdBy ?? null,
        updated_by: ex.updatedBy ?? null,
        deleted_at: ex.deletedAt ?? null,
        deleted_by: ex.deletedBy ?? null,
      });
    }
  }

  for (const v of venues) {
    out.venues.push({
      id: v.id,
      space_id: spaceId,
      name: v.name,
      category: v.category,
      fave: v.fave,
      created_at: v.createdAt ?? null,
      updated_at: v.updatedAt ?? null,
      created_by: v.createdBy ?? null,
      updated_by: v.updatedBy ?? null,
    });
    for (const r of v.ratings) {
      out.venue_ratings.push({
        id: r.id,
        venue_id: v.id,
        rating: r.rating,
        itinerary_id: r.itineraryId ?? null,
        stop_id: r.stopId ?? null,
        rated_on: r.dateISO ?? null,
        created_at: r.createdAt ?? null,
        updated_at: r.updatedAt ?? null,
        created_by: r.createdBy ?? null,
        updated_by: r.updatedBy ?? null,
      });
    }
    for (const n of v.notes) {
      if (!n.id) continue; // legacy note without an id; the persist backfill mints one
      out.venue_notes.push({
        id: n.id,
        venue_id: v.id,
        body: n.text,
        created_at: n.createdAt ?? null,
        updated_at: n.updatedAt ?? null,
        created_by: n.createdBy ?? null,
        updated_by: n.updatedBy ?? null,
      });
    }
  }

  for (const p of photos) {
    out.photos.push({
      id: p.id,
      space_id: spaceId,
      itinerary_id: p.itineraryId ?? null,
      stop_id: p.stopId ?? null,
      caption: p.caption,
      taken_on: p.dateISO,
      art: p.art ?? null,
      rot: p.rot ?? null,
      tape: p.tape ?? null,
      dot: Boolean(p.dot),
      created_at: p.createdAt ?? null,
      updated_at: p.updatedAt ?? null,
      created_by: p.createdBy ?? null,
      updated_by: p.updatedBy ?? null,
    });
  }

  return out;
}

// ---- Re-nest: flat rows -> store collections ------------------------------

type FetchedRows = Record<TableName, Row[]> & { space_members?: Row[] };

function assemble(rows: FetchedRows): {
  itineraries: Itinerary[];
  venues: Venue[];
  photos: Photo[];
} {
  const stopsByItin = groupBy(rows.stops, (r) => r.itinerary_id as string);
  const expensesByItin = groupBy(rows.expenses, (r) => r.itinerary_id as string);
  const ratingsByVenue = groupBy(rows.venue_ratings, (r) => r.venue_id as string);
  const notesByVenue = groupBy(rows.venue_notes, (r) => r.venue_id as string);

  const itineraries: Itinerary[] = rows.itineraries.map((r) => {
    const stops: Stop[] = (stopsByItin.get(r.id) ?? [])
      .slice()
      .sort((a, b) => (a.position as number) - (b.position as number))
      .map(
        (s): Stop => ({
          id: s.id,
          name: s.name as string,
          time: (s.time_label as string) ?? "",
          note: (s.note as string) ?? "",
          cost: Number(s.cost ?? 0),
          lat: (s.lat as number) ?? undefined,
          lng: (s.lng as number) ?? undefined,
          travelMinutesToNext: (s.travel_minutes_to_next as number) ?? undefined,
          travelModeToNext: (s.travel_mode_to_next as Stop["travelModeToNext"]) ?? undefined,
          venueId: (s.venue_id as string) ?? undefined,
          createdAt: (s.created_at as string) ?? undefined,
          updatedAt: (s.updated_at as string) ?? undefined,
          createdBy: (s.created_by as string) ?? undefined,
          updatedBy: (s.updated_by as string) ?? undefined,
        })
      );
    const expenses: Expense[] = (expensesByItin.get(r.id) ?? []).map(
      (e): Expense => ({
        id: e.id,
        label: e.label as string,
        amount: Number(e.amount ?? 0),
        stopId: (e.stop_id as string) ?? undefined,
        createdISO: (e.spent_on as string) ?? "",
        createdAt: (e.created_at as string) ?? undefined,
        updatedAt: (e.updated_at as string) ?? undefined,
        createdBy: (e.created_by as string) ?? undefined,
        updatedBy: (e.updated_by as string) ?? undefined,
        deletedAt: (e.deleted_at as string) ?? undefined,
        deletedBy: (e.deleted_by as string) ?? undefined,
      })
    );
    return {
      id: r.id,
      title: r.title as string,
      dateISO: r.date as string,
      stops,
      skin: r.skin as Itinerary["skin"],
      status: r.status as Itinerary["status"],
      draft: Boolean(r.draft),
      actualTotal: (r.actual_total as number) ?? undefined,
      expenses,
      createdAt: (r.created_at as string) ?? undefined,
      updatedAt: (r.updated_at as string) ?? undefined,
      createdBy: (r.created_by as string) ?? undefined,
      updatedBy: (r.updated_by as string) ?? undefined,
    };
  });

  const venues: Venue[] = rows.venues.map((r) => {
    const ratings: VenueRating[] = (ratingsByVenue.get(r.id) ?? []).map(
      (rt): VenueRating => ({
        id: rt.id,
        rating: Number(rt.rating ?? 0),
        itineraryId: (rt.itinerary_id as string) ?? undefined,
        stopId: (rt.stop_id as string) ?? undefined,
        dateISO: (rt.rated_on as string) ?? undefined,
        createdAt: (rt.created_at as string) ?? undefined,
        updatedAt: (rt.updated_at as string) ?? undefined,
        createdBy: (rt.created_by as string) ?? undefined,
        updatedBy: (rt.updated_by as string) ?? undefined,
      })
    );
    const notes: VenueNote[] = (notesByVenue.get(r.id) ?? []).map(
      (n): VenueNote => ({
        id: n.id,
        // The author chip derives from createdBy (the acting member). The legacy
        // Y/P author has no column; graftLocalOnly restores it for demo notes.
        text: n.body as string,
        createdAt: (n.created_at as string) ?? undefined,
        updatedAt: (n.updated_at as string) ?? undefined,
        createdBy: (n.created_by as string) ?? undefined,
        updatedBy: (n.updated_by as string) ?? undefined,
      })
    );
    return {
      id: r.id,
      name: r.name as string,
      category: (r.category as string) ?? "",
      ratings,
      fave: Boolean(r.fave),
      notes,
      createdAt: (r.created_at as string) ?? undefined,
      updatedAt: (r.updated_at as string) ?? undefined,
      createdBy: (r.created_by as string) ?? undefined,
      updatedBy: (r.updated_by as string) ?? undefined,
    };
  });

  const photos: Photo[] = rows.photos.map(
    (r): Photo => ({
      id: r.id,
      caption: (r.caption as string) ?? "",
      dateISO: r.taken_on as string,
      itineraryId: (r.itinerary_id as string) ?? undefined,
      stopId: (r.stop_id as string) ?? undefined,
      art: (r.art as number) ?? undefined,
      rot: Number(r.rot ?? 0),
      tape: (r.tape as Photo["tape"]) ?? null,
      dot: Boolean(r.dot),
      createdAt: (r.created_at as string) ?? undefined,
      updatedAt: (r.updated_at as string) ?? undefined,
      createdBy: (r.created_by as string) ?? undefined,
      updatedBy: (r.updated_by as string) ?? undefined,
    })
  );

  return { itineraries, venues, photos };
}

/**
 * Carry store-only fields (no server column yet) from the previous store state
 * onto freshly assembled rows, matched by id. Without this, every pull wipes a
 * photo's image data, an expense's receipt link, and a note's author chip,
 * because flatten/assemble round-trips only the columns.
 */
function graftLocalOnly(
  next: { itineraries: Itinerary[]; venues: Venue[]; photos: Photo[] },
  prev: { itineraries: Itinerary[]; venues: Venue[]; photos: Photo[] }
): void {
  const prevPhotos = new Map(prev.photos.map((p) => [p.id, p]));
  for (const p of next.photos) {
    const old = prevPhotos.get(p.id);
    if (!old) continue;
    if (p.src === undefined) p.src = old.src;
    if (p.author === undefined) p.author = old.author;
  }

  const prevExpenses = new Map<string, Expense>();
  for (const it of prev.itineraries) {
    for (const ex of it.expenses ?? []) prevExpenses.set(ex.id, ex);
  }
  for (const it of next.itineraries) {
    for (const ex of it.expenses ?? []) {
      const old = prevExpenses.get(ex.id);
      if (old && ex.receiptId === undefined) ex.receiptId = old.receiptId;
    }
  }

  const prevNotes = new Map<string, VenueNote>();
  for (const v of prev.venues) {
    for (const n of v.notes) if (n.id) prevNotes.set(n.id, n);
  }
  for (const v of next.venues) {
    for (const n of v.notes) {
      const old = n.id ? prevNotes.get(n.id) : undefined;
      if (old) n.author = old.author;
    }
  }
}

// Keys ignored when deciding whether a pulled row really changed: audit stamps
// live on two different clocks (client nowISO vs the set_updated_at trigger),
// so they differ on every echo of our own write without any real change.
const AUDIT_KEYS = new Set(["createdAt", "updatedAt", "createdBy", "updatedBy"]);

const TIMESTAMPISH = /^\d{4}-\d{2}-\d{2}T/;

// All the ways store data spells "nothing": a fresh local row omits a key
// (undefined) where the same row assembled from the server carries an explicit
// empty list, null, or false (e.g. `expenses: []`, `tape: null`,
// `draft: false`). They are the same content and must not read as a change.
function isEmptyValue(v: unknown): boolean {
  return v === undefined || v === null || v === false || (Array.isArray(v) && v.length === 0);
}

/**
 * Deep value equality over plain store data, blind to audit stamps, tolerant
 * of the two timestamp renderings (client `...Z` vs server `+00:00`, which
 * matter for deletedAt), and treating every empty spelling as equal.
 */
function contentEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (isEmptyValue(a) && isEmptyValue(b)) return true;
  if (typeof a === "string" && typeof b === "string" && TIMESTAMPISH.test(a) && TIMESTAMPISH.test(b)) {
    return Date.parse(a) === Date.parse(b);
  }
  if (Array.isArray(a) && Array.isArray(b)) {
    return a.length === b.length && a.every((v, i) => contentEqual(v, b[i]));
  }
  if (a && b && typeof a === "object" && !Array.isArray(a) && typeof b === "object" && !Array.isArray(b)) {
    const ra = a as Record<string, unknown>;
    const rb = b as Record<string, unknown>;
    const ka = Object.keys(ra).filter((k) => !AUDIT_KEYS.has(k) && !isEmptyValue(ra[k]));
    const kb = Object.keys(rb).filter((k) => !AUDIT_KEYS.has(k) && !isEmptyValue(rb[k]));
    if (ka.length !== kb.length) return false;
    return ka.every((k) => contentEqual(ra[k], rb[k]));
  }
  return false;
}

/**
 * Preserve object and array identity across a pull: reuse the previous store
 * object for every row whose content did not really change, keep the previous
 * ordering (a bare `select *` has none worth adopting), and hand back the
 * previous array untouched when nothing changed at all. Screens rely on
 * reference equality (the form baseline / isDirty standard), so an echo of our
 * own write must never manufacture "changes" - without this, any Realtime
 * event flips every open editor to "Save changes".
 */
function reconcile<T extends { id: string }>(next: T[], prev: T[]): T[] {
  const nextById = new Map(next.map((n) => [n.id, n]));
  const out: T[] = [];
  for (const p of prev) {
    const n = nextById.get(p.id);
    if (!n) continue; // deleted remotely
    nextById.delete(p.id);
    out.push(contentEqual(n, p) ? p : n);
  }
  let unchanged = out.length === prev.length;
  for (const n of nextById.values()) {
    out.push(n); // new rows (partner-created)
    unchanged = false;
  }
  if (unchanged && out.every((item, i) => item === prev[i])) return prev;
  return out;
}

function groupBy<T>(items: T[], key: (item: T) => string): Map<string, T[]> {
  const map = new Map<string, T[]>();
  for (const item of items) {
    const k = key(item);
    const list = map.get(k);
    if (list) list.push(item);
    else map.set(k, [item]);
  }
  return map;
}

// ---- Content signatures ----------------------------------------------------
//
// The user-content columns per table: everything flatten produces EXCEPT the
// timestamps. created_at/updated_at are deliberately excluded so change
// detection never depends on a clock. Two rows with equal signatures are the
// same edit, whatever their stamps say.

const CONTENT_COLS: Record<TableName, readonly string[]> = {
  venues: ["space_id", "name", "category", "fave"],
  itineraries: ["space_id", "title", "date", "status", "skin", "draft", "actual_total"],
  stops: [
    "itinerary_id",
    "position",
    "name",
    "time_label",
    "note",
    "cost",
    "lat",
    "lng",
    "travel_minutes_to_next",
    "travel_mode_to_next",
    "venue_id",
  ],
  expenses: ["space_id", "itinerary_id", "stop_id", "label", "amount", "spent_on", "deleted_at"],
  photos: ["space_id", "itinerary_id", "stop_id", "caption", "taken_on", "art", "rot", "tape", "dot"],
  venue_ratings: ["venue_id", "rating", "itinerary_id", "stop_id", "rated_on"],
  venue_notes: ["venue_id", "body"],
};

// Numeric columns can come back from PostgREST as strings, and timestamps
// (deleted_at) render differently on each side (client `...Z` vs server
// `+00:00`); normalize both so a local value and its server rendering sign
// identically. Applied to both sides, so even a text value that happens to
// look numeric stays consistent.
function normalizeSigValue(v: unknown): unknown {
  if (v === undefined) return null;
  if (typeof v === "string" && TIMESTAMPISH.test(v)) {
    const t = Date.parse(v);
    if (!Number.isNaN(t)) return t;
  }
  if (typeof v === "string" && v !== "" && !Number.isNaN(Number(v))) return Number(v);
  return v;
}

/** Clock-free signature of a row's user content, comparable local vs server. */
function contentSig(table: TableName, row: Row): string {
  return JSON.stringify(CONTENT_COLS[table].map((col) => normalizeSigValue(row[col])));
}

// ---- Sync engine ----------------------------------------------------------

let active: { spaceId: string; userId: string; stop: () => void } | null = null;
// While applying server data to the store we must not echo it back as a push.
let applyingRemote = false;
// The last profile we believe the server holds, so an unchanged profile (or an
// echo of the row we just pulled) does not re-trigger an update.
let profileSig = "";

// Per-table snapshot of what the server last acknowledged holding, keyed by id:
// the row's content signature plus the write sequence at which we acknowledged
// it. A local row is DIRTY exactly while its content diverges from `content`.
type SnapshotEntry = { content: string; seq: number };
let snapshot: Record<TableName, Map<string, SnapshotEntry>> = emptySnapshot();

// Ids we deleted server-side, tagged with the write sequence of the delete's
// acknowledgement, so a stale fetch cannot resurrect them (see pull()).
let tombstones: Record<TableName, Map<string, number>> = emptyTombstones();

// Monotonic count of acknowledged server writes (each successful upsert/delete
// statement bumps it). A pull records the sequence BEFORE its SELECTs go out:
// any row acknowledged after that point cannot be reflected in the fetch, so
// the merge keeps the local side for exactly those rows. This is causal, not
// timed: no clock comparisons, no expiry window to mis-tune.
let writeSeq = 0;

// Serializes pushOnce and the merge/apply half of pull. Fetches overlap freely;
// snapshot mutation and store application do not, so a pull can never rediff a
// half-advanced snapshot or clobber the store mid-push.
let lock: Promise<void> = Promise.resolve();
function withLock<T>(fn: () => Promise<T>): Promise<T> {
  const run = lock.then(fn);
  lock = run.then(
    () => undefined,
    () => undefined
  );
  return run;
}

function emptySnapshot(): Record<TableName, Map<string, SnapshotEntry>> {
  return {
    venues: new Map(),
    itineraries: new Map(),
    stops: new Map(),
    expenses: new Map(),
    photos: new Map(),
    venue_ratings: new Map(),
    venue_notes: new Map(),
  };
}

function emptyTombstones(): Record<TableName, Map<string, number>> {
  return {
    venues: new Map(),
    itineraries: new Map(),
    stops: new Map(),
    expenses: new Map(),
    photos: new Map(),
    venue_ratings: new Map(),
    venue_notes: new Map(),
  };
}

function emptyRowMaps(): Record<TableName, Map<string, Row>> {
  return {
    venues: new Map(),
    itineraries: new Map(),
    stops: new Map(),
    expenses: new Map(),
    photos: new Map(),
    venue_ratings: new Map(),
    venue_notes: new Map(),
  };
}

function mapsToFetched(maps: Record<TableName, Map<string, Row>>): FetchedRows {
  return {
    itineraries: [...maps.itineraries.values()],
    stops: [...maps.stops.values()],
    expenses: [...maps.expenses.values()],
    photos: [...maps.photos.values()],
    venues: [...maps.venues.values()],
    venue_ratings: [...maps.venue_ratings.values()],
    venue_notes: [...maps.venue_notes.values()],
  };
}

// ---- Profile sync: store.profile <-> space_members -----------------------
//
// The profile is the caller's own row in space_members (one row per member).
// Unlike the collections, it is a single row updated in place: the row is minted
// by the space-bootstrap RPCs (ensure_solo_space / accept_invite), and RLS
// (member_update_self) lets the caller update only their own row, so this is an
// update, never an upsert. `onboarded` is a client-only flag and has no column.

/** Compare only the fields that map to columns, so unrelated state doesn't push. */
function memberSig(p: Profile): string {
  return JSON.stringify([p.displayName, p.initial, p.color, p.birthdayISO ?? null, p.avatarUrl ?? null]);
}

/**
 * Load the caller's space_members row into store.profile. Only adopts a server
 * profile that has actually been set (non-empty name): a fresh solo space has a
 * blank member row, and adopting that would wipe a just-onboarded local profile
 * before the push sends it up. A real server profile also marks the user
 * onboarded so a second device skips the setup wizard.
 */
async function pullProfile(client: SupabaseClient, spaceId: string, userId: string): Promise<void> {
  const { data, error } = await client
    .from("space_members")
    .select("display_name, display_initial, color, birthday, avatar_path")
    .eq("space_id", spaceId)
    .eq("user_id", userId)
    .maybeSingle();
  if (error) {
    console.error("sync profile fetch failed", error.message);
    return;
  }
  const displayName = ((data?.display_name as string) ?? "").trim();
  if (displayName) {
    // Resolve the stored object path to a signed URL for display.
    const avatarPath = (data?.avatar_path as string) ?? null;
    const avatarUrl = avatarPath ? (await signAvatar(avatarPath)) ?? undefined : undefined;
    // Server has a real profile: adopt it (last-write-wins on boot), mark the
    // user onboarded, and record its signature so an unchanged local edit does
    // not needlessly re-push.
    applyingRemote = true;
    try {
      useApp.setState((s) => ({
        profile: {
          ...s.profile,
          displayName,
          initial: (data?.display_initial as string) || s.profile.initial,
          color: (data?.color as string) || s.profile.color,
          birthdayISO: (data?.birthday as string) ?? undefined,
          avatarUrl,
          onboarded: true,
        },
      }));
    } finally {
      applyingRemote = false;
    }
    profileSig = memberSig(useApp.getState().profile);
  } else {
    // Server profile is unset (a fresh member row, or a profile onboarded before
    // profile sync existed). Keep the local profile and leave profileSig blank so
    // the reconcile push in startSync actually sends the local profile up.
    profileSig = "";
  }
}

/**
 * Load the whole space roster into store.members so an author chip can resolve a
 * member id (a record's created_by) to an initial and color. Unlike pullProfile,
 * this reads every member, not just the caller's own row, and never touches
 * store.profile. Applied under applyingRemote so it is not echoed back as a push.
 */
async function pullMembers(client: SupabaseClient, spaceId: string): Promise<void> {
  const { data, error } = await client
    .from("space_members")
    .select("user_id, display_name, display_initial, color, avatar_path, last_seen")
    .eq("space_id", spaceId);
  if (error) {
    console.error("sync members fetch failed", error.message);
    return;
  }
  const rows = data ?? [];
  // One batched signing call for every member that has an avatar object.
  const signed = await signAvatars(
    rows.map((r) => r.avatar_path as string | null).filter((p): p is string => Boolean(p))
  );
  const members: Member[] = rows.map((r) => {
    const path = (r.avatar_path as string) ?? null;
    return {
      userId: r.user_id as string,
      displayName: (r.display_name as string) ?? "",
      initial: (r.display_initial as string) || "",
      color: (r.color as string) || DEFAULT_AVATAR_COLOR,
      avatarUrl: path ? signed.get(path) : undefined,
      lastSeen: (r.last_seen as string) ?? undefined,
    };
  });
  applyingRemote = true;
  try {
    useApp.setState({ members });
  } finally {
    applyingRemote = false;
  }
}

/** Push the local profile to the caller's space_members row when it changed. */
async function pushProfile(client: SupabaseClient, spaceId: string, userId: string): Promise<void> {
  const profile = useApp.getState().profile;
  const nextSig = memberSig(profile);
  if (nextSig === profileSig) return;
  profileSig = nextSig;

  const update: Record<string, unknown> = {
    display_name: profile.displayName,
    display_initial: profile.initial,
    color: profile.color,
    birthday: profile.birthdayISO ?? null,
  };

  // Avatar: a freshly picked photo is a data: URL and is uploaded to the bucket,
  // storing its path; a removed photo clears the path; a photo already synced
  // (an https signed URL from a pull) leaves avatar_path untouched.
  const avatar = profile.avatarUrl;
  let uploadFailed = false;
  if (!avatar) {
    update.avatar_path = null;
  } else if (avatar.startsWith("data:")) {
    const path = await uploadAvatar(spaceId, userId, avatar);
    if (path) update.avatar_path = path;
    else uploadFailed = true;
  }

  const { error } = await client
    .from("space_members")
    .update(update)
    .eq("space_id", spaceId)
    .eq("user_id", userId);
  if (error || uploadFailed) {
    // Clear the signature so the next profile change retries the update/upload.
    if (error) console.error("sync profile update failed", error.message);
    profileSig = "";
  }
}

/**
 * Start syncing the store against `spaceId`. Fetches the space into the store
 * (replacing whatever was there), then keeps pushing local changes and pulling
 * partner changes until stopped. Safe to call repeatedly; it restarts cleanly.
 */
export async function startSync(spaceId: string): Promise<void> {
  const client = supabase;
  if (!client) return;
  if (active) active.stop();
  snapshot = emptySnapshot();
  tombstones = emptyTombstones();
  profileSig = "";

  // The caller's own id, needed to target their space_members row (their profile)
  // and to stamp created_by / updated_by on every local write while signed in.
  const { data: userData } = await client.auth.getUser();
  const userId = userData.user?.id;
  if (!userId) return;
  setActingUser(userId);

  // Initial load replaces the store (logged-in spaces start empty; local demo
  // data is discarded in favour of server truth). The profile is the exception:
  // it merges the caller's member row over the local profile (see pullProfile).
  await pull(client, spaceId, "replace");
  await pullProfile(client, spaceId, userId);
  // Load both members' identities so author chips can resolve a created_by id.
  await pullMembers(client, spaceId);
  // Reconcile: if the server profile was unset, push the local one up so a
  // profile onboarded before sync existed catches the server up on boot.
  if (useApp.getState().profile.displayName.trim()) {
    void pushProfile(client, spaceId, userId);
  }

  // Push local changes: diff the synced collections on every store change, and
  // push the profile whenever it changes (a separate single-row update).
  const unsub = useApp.subscribe((state, prev) => {
    if (applyingRemote) return;
    if (state.profile !== prev.profile) {
      void pushProfile(client, spaceId, userId);
    }
    if (
      state.itineraries === prev.itineraries &&
      state.venues === prev.venues &&
      state.photos === prev.photos
    ) {
      return;
    }
    void push(client, spaceId);
  });

  // Pull partner changes: any Realtime event -> debounced full refetch.
  let pullTimer: ReturnType<typeof setTimeout> | null = null;
  const schedulePull = () => {
    if (pullTimer) clearTimeout(pullTimer);
    pullTimer = setTimeout(() => {
      // Live refetches MERGE, protecting locally-dirty rows, so an in-flight
      // local edit is never clobbered by an echo of the pre-edit server row.
      pull(client, spaceId, "merge").catch((err) => console.error("realtime refetch failed", err));
    }, 300);
  };

  // A partner joining, renaming their profile, or recoloring their avatar
  // refreshes the roster so author chips stay current. Debounced separately from
  // the collection refetch: it reads only space_members.
  let membersTimer: ReturnType<typeof setTimeout> | null = null;
  const scheduleMembers = () => {
    if (membersTimer) clearTimeout(membersTimer);
    membersTimer = setTimeout(() => {
      pullMembers(client, spaceId).catch((err) => console.error("members refetch failed", err));
    }, 300);
  };

  const channel = client
    .channel(`space:${spaceId}`)
    .on("postgres_changes", { event: "*", schema: "public", table: "itineraries" }, schedulePull)
    .on("postgres_changes", { event: "*", schema: "public", table: "stops" }, schedulePull)
    .on("postgres_changes", { event: "*", schema: "public", table: "expenses" }, schedulePull)
    .on("postgres_changes", { event: "*", schema: "public", table: "photos" }, schedulePull)
    .on("postgres_changes", { event: "*", schema: "public", table: "venues" }, schedulePull)
    .on("postgres_changes", { event: "*", schema: "public", table: "venue_ratings" }, schedulePull)
    .on("postgres_changes", { event: "*", schema: "public", table: "venue_notes" }, schedulePull)
    .on("postgres_changes", { event: "*", schema: "public", table: "space_members" }, scheduleMembers)
    .subscribe();

  active = {
    spaceId,
    userId,
    stop: () => {
      unsub();
      if (pullTimer) clearTimeout(pullTimer);
      if (membersTimer) clearTimeout(membersTimer);
      void client.removeChannel(channel);
    },
  };
}

/** Stop syncing (on logout). */
export function stopSync(): void {
  active?.stop();
  active = null;
  snapshot = emptySnapshot();
  tombstones = emptyTombstones();
  profileSig = "";
  setActingUser(undefined);
  // Drop the roster so a later demo session shows no author chips. Guarded so it
  // does not echo back as a push (members are not a pushed slice anyway).
  applyingRemote = true;
  try {
    useApp.setState({ members: [] });
  } finally {
    applyingRemote = false;
  }
}

type PullMode = "replace" | "merge";

/**
 * Fetch the whole space and apply it to the store.
 *   - "replace": take server truth wholesale (initial load).
 *   - "merge": take server truth per row EXCEPT for
 *       (a) rows that are locally DIRTY (content diverges from the last
 *           acknowledged signature), which are kept and reconcile-pushed;
 *       (b) rows whose last acknowledgement postdates this fetch's start (the
 *           SELECT cannot have seen the write), where local state stands,
 *           including a local delete guarded by its tombstone.
 *     Local rows the server has never seen are kept as pending inserts; rows
 *     the server acknowledged and then dropped are treated as remote deletes.
 */
async function pull(client: SupabaseClient, spaceId: string, mode: PullMode): Promise<void> {
  // Causality marker: this fetch can only reflect writes acknowledged up to
  // here. Captured BEFORE the SELECTs go out.
  const startSeq = writeSeq;

  const [itineraries, stops, expenses, photos, venues, ratings, notes] = await Promise.all([
    client.from("itineraries").select("*").eq("space_id", spaceId),
    client.from("stops").select("*"),
    client.from("expenses").select("*").eq("space_id", spaceId),
    client.from("photos").select("*").eq("space_id", spaceId),
    client.from("venues").select("*").eq("space_id", spaceId),
    client.from("venue_ratings").select("*"),
    client.from("venue_notes").select("*"),
  ]);

  // Surface a fetch failure instead of silently applying an empty result (which
  // would wipe the store and read as an empty space). The initial pull propagates
  // this to the boot gate; a realtime-triggered refetch just logs and keeps state.
  const failed = [itineraries, stops, expenses, photos, venues, ratings, notes].find(
    (r) => r.error
  );
  if (failed?.error) {
    throw new Error(`sync fetch failed: ${failed.error.message}`);
  }

  // stops / ratings / notes have no space_id column; RLS already limits the
  // select to the caller's space, so an unfiltered select is correct.
  const serverRows: FetchedRows = {
    itineraries: (itineraries.data ?? []) as Row[],
    stops: (stops.data ?? []) as Row[],
    expenses: (expenses.data ?? []) as Row[],
    photos: (photos.data ?? []) as Row[],
    venues: (venues.data ?? []) as Row[],
    venue_ratings: (ratings.data ?? []) as Row[],
    venue_notes: (notes.data ?? []) as Row[],
  };

  // Server rows keyed by id, per table.
  const server: Record<TableName, Map<string, Row>> = emptyRowMaps();
  for (const table of TABLES) {
    for (const row of serverRows[table]) server[table].set(row.id, row);
  }

  if (mode === "replace") {
    const assembled = assemble(serverRows);
    const prev = useApp.getState();
    graftLocalOnly(assembled, prev);
    applyState(assembled, prev);
    // Replace mode: server is truth wholesale. Track exactly what we applied.
    snapshot = emptySnapshot();
    tombstones = emptyTombstones();
    for (const table of TABLES) {
      for (const [id, row] of server[table]) {
        snapshot[table].set(id, { content: contentSig(table, row), seq: startSeq });
      }
    }
    return;
  }

  // Merge under the lock so an in-flight push cannot interleave: pushOnce would
  // otherwise diff its stale flatten against a snapshot we rewrite here and
  // clobber a partner row it never saw.
  await withLock(async () => {
    const state = useApp.getState();
    const localFlat = flatten(spaceId, state.itineraries, state.venues, state.photos);
    const merged = emptyRowMaps();
    let keptLocal = false;

    for (const table of TABLES) {
      const localMap = new Map<string, Row>(localFlat[table].map((r) => [r.id, r]));

      for (const [id, row] of server[table]) {
        const tomb = tombstones[table].get(id);
        if (tomb !== undefined && tomb > startSeq) {
          // We deleted this row after the fetch started: a stale echo must not
          // resurrect it.
          continue;
        }
        if (tomb !== undefined) tombstones[table].delete(id);

        const local = localMap.get(id);
        const snap = snapshot[table].get(id);

        if (!local) {
          if (snap) {
            // Deleted locally but the delete has not reached the server yet:
            // keep it deleted; the reconcile push below removes the server row.
            keptLocal = true;
            continue;
          }
          // Partner-created row: adopt it.
          merged[table].set(id, row);
          snapshot[table].set(id, { content: contentSig(table, row), seq: startSeq });
          continue;
        }

        if (snap && snap.seq > startSeq) {
          // We acknowledged a write for this row after the fetch started, so
          // the fetched copy is stale for it (a self-echo): keep local.
          merged[table].set(id, local);
          continue;
        }

        if (!snap || snap.content !== contentSig(table, local)) {
          // Locally dirty (edited, or never acknowledged): the edit wins and is
          // reconcile-pushed. Never resolved by comparing timestamps.
          merged[table].set(id, local);
          keptLocal = true;
        } else {
          // Clean: adopt server truth, so partner edits land.
          merged[table].set(id, row);
          snapshot[table].set(id, { content: contentSig(table, row), seq: startSeq });
        }
      }

      for (const [id, local] of localMap) {
        if (server[table].has(id)) continue;
        const snap = snapshot[table].get(id);
        if (!snap) {
          // Local-only and never acknowledged: a pending insert.
          merged[table].set(id, local);
          keptLocal = true;
          continue;
        }
        if (snap.seq > startSeq) {
          // Acknowledged after the fetch started (fresh insert or update): the
          // fetch simply predates it.
          merged[table].set(id, local);
          continue;
        }
        // The server had this row and dropped it: the remote delete stands.
        snapshot[table].delete(id);
      }

      // A fresh fetch that no longer contains a tombstoned id confirms the
      // delete landed; the tombstone has done its job.
      for (const [id, seq] of tombstones[table]) {
        if (seq <= startSeq && !server[table].has(id)) tombstones[table].delete(id);
      }
    }

    const assembled = assemble(mapsToFetched(merged));
    graftLocalOnly(assembled, state);
    applyState(assembled, state);

    // Reconcile: push kept dirty rows and pending deletes back up.
    if (keptLocal) void push(client, spaceId);
  });
}

/**
 * Apply pulled collections to the store, identity-preserving: rows and arrays
 * whose content is unchanged keep their previous references (see reconcile),
 * and if nothing changed at all the setState is skipped entirely.
 */
function applyState(
  next: { itineraries: Itinerary[]; venues: Venue[]; photos: Photo[] },
  prev: { itineraries: Itinerary[]; venues: Venue[]; photos: Photo[] }
): void {
  const itineraries = reconcile(next.itineraries, prev.itineraries);
  const venues = reconcile(next.venues, prev.venues);
  const photos = reconcile(next.photos, prev.photos);
  if (itineraries === prev.itineraries && venues === prev.venues && photos === prev.photos) {
    return;
  }
  applyingRemote = true;
  try {
    useApp.setState({ itineraries, venues, photos });
  } finally {
    applyingRemote = false;
  }
}

// Serialize pushes: if the store changes again mid-push, run one more pass after.
let pushing = false;
let pushQueued = false;

/** Diff the store's synced collections against the snapshot and push changes. */
async function push(client: SupabaseClient, spaceId: string): Promise<void> {
  if (pushing) {
    pushQueued = true;
    return;
  }
  pushing = true;
  try {
    await pushOnce(client, spaceId);
  } finally {
    pushing = false;
  }
  if (pushQueued) {
    pushQueued = false;
    await push(client, spaceId);
  }
}

async function pushOnce(client: SupabaseClient, spaceId: string): Promise<void> {
  await withLock(async () => {
    const { itineraries, venues, photos } = useApp.getState();
    const flat = flatten(spaceId, itineraries, venues, photos);

    // Deletes first (children before parents). Ids gone from the store are
    // removed server side; a cascade may have already taken the children, so
    // .in() is a safe no-op.
    for (const table of [...TABLES].reverse()) {
      const present = new Set(flat[table].map((row) => row.id));
      const gone: string[] = [];
      for (const id of snapshot[table].keys()) {
        if (!present.has(id)) gone.push(id);
      }
      if (gone.length === 0) continue;
      const { error } = await client.from(table).delete().in("id", gone);
      if (error) {
        console.error(`sync delete ${table} failed`, error.message);
        return;
      }
      // Acknowledge: bump the sequence and tombstone each id so a stale fetch
      // (SELECT executed before this delete committed) cannot resurrect it.
      writeSeq += 1;
      for (const id of gone) {
        snapshot[table].delete(id);
        tombstones[table].set(id, writeSeq);
      }
    }

    // Upserts (parents before children): rows whose CONTENT diverges from what
    // the server last acknowledged. Comparing content, not updatedAt: client
    // stamps have millisecond resolution, and two same-tick store actions (a
    // date change then a rename in one Save click) would otherwise collide and
    // silently drop the second write.
    for (const table of TABLES) {
      const changed = flat[table].filter(
        (row) => snapshot[table].get(row.id)?.content !== contentSig(table, row)
      );
      if (changed.length === 0) continue;
      // Never send updated_at: the server owns that column (insert default +
      // set_updated_at trigger), keeping it on a single clock. Send created_at
      // only when the row carries one, so the column default can fill it.
      // Likewise drop null created_by / updated_by so a pre-auth or partner-owned
      // row never has its author overwritten with null; deleted_by is kept so a
      // restore (deleted_at -> null) can clear it too.
      const payload = changed.map((row) => {
        const { updated_at: _updatedAt, ...rest } = row;
        if (rest.created_at == null) delete rest.created_at;
        if (rest.created_by == null) delete rest.created_by;
        if (rest.updated_by == null) delete rest.updated_by;
        return rest;
      });
      const { error } = await client.from(table).upsert(payload);
      if (error) {
        // Leave the snapshot untouched for this table so the rows stay dirty
        // and the next push (or reconcile pull) retries.
        console.error(`sync upsert ${table} failed`, error.message);
        return;
      }
      // Acknowledge in the same synchronous step: from here on, any pull whose
      // fetch started earlier reads these rows as stale-for-fetch and keeps the
      // local copies (see pull()).
      writeSeq += 1;
      for (const row of changed) {
        snapshot[table].set(row.id, { content: contentSig(table, row), seq: writeSeq });
        tombstones[table].delete(row.id);
      }
    }
  });
}
