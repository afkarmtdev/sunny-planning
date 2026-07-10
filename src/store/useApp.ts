import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Expense, Itinerary, Member, Photo, Profile, SkinId, Stop, Venue, VenueNote, VenueRating } from "../lib/types";
import { itineraryTotal } from "../lib/derive";
import { addDaysISO, nowISO, parseISO, todayISO } from "../lib/dates";
import { DEFAULT_AVATAR_COLOR } from "../lib/avatar";
import { fireTodayNotification } from "../lib/notify";
import { deleteReceipt } from "../lib/receipts";
import { demoInviteCode, demoItineraries, demoPhotos, demoVenues } from "../data/demo";

// Ids are uuids so local rows and Supabase rows share one shape (the id survives
// unchanged when a row syncs). crypto.randomUUID needs a secure context, which
// localhost and any https deployment both satisfy.
const uid = () => crypto.randomUUID();

// How long a soft-deleted expense lingers in Recently deleted before it is
// purged for good on app load.
const RECENTLY_DELETED_DAYS = 30;

// The signed-in member's id, supplied by the sync layer from the auth session
// (auth.uid()) when Supabase is configured, and cleared on logout. In demo mode
// it stays undefined, so the *By audit fields remain unset exactly as before.
let actingUserId: string | undefined;

/** Sync sets the acting member so store writes stamp created_by / updated_by. */
export function setActingUser(id: string | undefined): void {
  actingUserId = id;
}

// Audit stamps. The timestamps are always live; createdBy / updatedBy /
// deletedBy fill in only when there is a session (actingUserId set), per the
// audit-trail house standard.
const createdAudit = () => {
  const at = nowISO();
  return actingUserId
    ? { createdAt: at, updatedAt: at, createdBy: actingUserId, updatedBy: actingUserId }
    : { createdAt: at, updatedAt: at };
};
const touchedAudit = () =>
  actingUserId ? { updatedAt: nowISO(), updatedBy: actingUserId } : { updatedAt: nowISO() };

type DayOf = {
  itineraryId: string | null;
  stopIdx: number;
  completed: boolean;
};

/**
 * User preferences, read imperatively by `src/lib/sfx.ts` and edited from the
 * Settings screen. Both default to on. New keys land here so the Settings
 * toggles stay pure wiring over this one slice.
 */
type Prefs = {
  soundOn: boolean;
  hapticsOn: boolean;
  /** Opt-in (needs OS permission) reminder when a date is planned for today. */
  notifyToday: boolean;
};

// A blank profile for a brand-new install; `onboarded: false` sends first
// launch into the setup wizard. Existing persisted users are marked onboarded
// in the migration so they never see it.
const FRESH_PROFILE: Profile = {
  displayName: "",
  initial: "",
  color: DEFAULT_AVATAR_COLOR,
  onboarded: false,
};

// How many days before a birthday the suggested date auto-appears.
const BIRTHDAY_SUGGEST_LEAD_DAYS = 7;

/** Days from today until `iso` (negative once it has passed). */
function daysUntil(iso: string): number {
  const start = parseISO(todayISO()).getTime();
  const end = parseISO(iso).getTime();
  return Math.round((end - start) / (24 * 60 * 60 * 1000));
}

/**
 * The next occurrence of a birthday on or after today, as an ISO date. Takes
 * the month and day from `birthdayISO` and pins them to this year, rolling to
 * next year once this year's has already passed.
 */
function upcomingBirthdayISO(birthdayISO: string): string {
  const b = parseISO(birthdayISO);
  const thisYear = parseISO(todayISO()).getFullYear();
  const at = (year: number) =>
    `${year}-${String(b.getMonth() + 1).padStart(2, "0")}-${String(b.getDate()).padStart(2, "0")}`;
  const thisYears = at(thisYear);
  return daysUntil(thisYears) >= 0 ? thisYears : at(thisYear + 1);
}

type AppState = {
  itineraries: Itinerary[];
  photos: Photo[];
  venues: Venue[];
  /**
   * The space roster (both members), mirrored from `space_members` by sync so an
   * author chip can resolve a member id to an initial and color. Empty in demo
   * mode; written only by the sync layer, never persisted meaningfully.
   */
  members: Member[];
  inviteCode: string;
  dayOf: DayOf;
  prefs: Prefs;
  setPref: <K extends keyof Prefs>(key: K, value: Prefs[K]) => void;

  profile: Profile;
  /** The birthday year (of `upcomingBirthdayISO`) already offered a suggested date. */
  birthdaySuggestionYear?: number;
  /** The birthday year whose Home takeover confetti has already played. */
  birthdayCelebratedYear?: number;
  /** Merge a patch into the profile; used by Settings and the setup wizard. */
  setProfile: (patch: Partial<Profile>) => void;
  /** Finish first-time setup: apply the profile and flip `onboarded` on. */
  completeOnboarding: (profile: Omit<Profile, "onboarded">) => void;
  /** Reset the whole app back to the seeded demo (logout / reset data). */
  resetDemo: () => void;
  /** Auto-create the pre-filled birthday date in the week before it; called on load. */
  ensureBirthdaySuggestion: () => void;
  /** Record that this year's birthday takeover has been celebrated (confetti fired). */
  markBirthdayCelebrated: (year: number) => void;
  /** The date whose "today" notification has already fired, so it fires at most once. */
  lastTodayNotifyISO?: string;
  /** Fire the OS reminder if a date is planned for today and one is due; called on wake. */
  notifyTodayIfDue: () => void;

  createItinerary: () => string;
  /** Commit a freshly created date, clearing its draft flag. */
  saveItinerary: (id: string) => void;
  renameItinerary: (id: string, title: string) => void;
  /** Rejects (returns false) when another itinerary already owns that date. */
  setItineraryDate: (id: string, dateISO: string) => boolean;
  setSkin: (id: string, skin: SkinId) => void;
  completeItinerary: (id: string) => void;
  cancelItinerary: (id: string) => void;
  reopenItinerary: (id: string) => void;
  deleteItinerary: (id: string) => void;

  addStop: (itineraryId: string, stop: Omit<Stop, "id">) => void;
  updateStop: (itineraryId: string, stopId: string, patch: Partial<Omit<Stop, "id">>) => void;
  removeStop: (itineraryId: string, stopId: string) => void;
  moveStop: (itineraryId: string, from: number, to: number) => void;

  addExpense: (itineraryId: string, expense: Omit<Expense, "id" | "createdISO">) => void;
  updateExpense: (itineraryId: string, expenseId: string, patch: Partial<Omit<Expense, "id">>) => void;
  /** Soft-delete: marks the expense deleted (recoverable) instead of removing it. */
  removeExpense: (itineraryId: string, expenseId: string) => void;
  /** Undo a soft-delete, bringing the expense back into every total. */
  restoreExpense: (itineraryId: string, expenseId: string) => void;
  /** Hard-remove expenses soft-deleted over 30 days ago; called on app load. */
  purgeDeletedExpenses: () => void;

  syncDayOf: (itineraryId: string | null) => void;
  advanceDay: () => void;
  resetDay: () => void;

  addPhoto: (photo: Omit<Photo, "id">) => void;
  updatePhotoCaption: (id: string, caption: string) => void;
  /** Tie a photo to a stop within its date, or clear it (undefined) back to the date. */
  updatePhotoStop: (id: string, stopId: string | undefined) => void;

  /**
   * Record a paw rating. With `visit`, the rating is tied to that itinerary
   * (and stop, when known): re-rating the same itinerary updates its entry
   * instead of appending a duplicate. Without `visit`, it is a manual rating
   * from the card, dated today; re-rating later the same day updates that
   * entry in place.
   */
  rateVenue: (
    venueId: string,
    rating: number,
    visit?: { itineraryId: string; stopId?: string; dateISO: string }
  ) => void;
  toggleFave: (id: string) => void;
  addVenueNote: (id: string, note: VenueNote) => void;
  /** Change a venue's category tag; the Ratings filter chips derive from these. */
  setVenueCategory: (id: string, category: string) => void;
};

function patchItinerary(
  itineraries: Itinerary[],
  id: string,
  fn: (it: Itinerary) => Itinerary
): Itinerary[] {
  // Any patch to an itinerary (its own fields, a stop, or an expense) counts
  // as touching it, so bump updatedAt centrally here.
  return itineraries.map((it) => (it.id === id ? { ...fn(it), ...touchedAudit() } : it));
}

/** Find a venue by case-insensitive name match. */
function findVenueByName(name: string, venues: Venue[]): Venue | undefined {
  return venues.find((v) => v.name.toLowerCase() === name.toLowerCase());
}

/**
 * Make sure every stop points at a real venue, creating one by name when
 * needed, so completed dates always have something rateable on the Ratings
 * screen and the link survives even if the venue is later renamed. Returns
 * the stops with `venueId` backfilled and any newly created venues.
 */
function linkStopsToVenues(stops: Stop[], venues: Venue[]): { stops: Stop[]; newVenues: Venue[] } {
  const newVenues: Venue[] = [];
  const linkedStops = stops.map((stop) => {
    if (stop.venueId && (venues.some((v) => v.id === stop.venueId) || newVenues.some((v) => v.id === stop.venueId))) {
      return stop;
    }
    const existing = findVenueByName(stop.name, venues) ?? findVenueByName(stop.name, newVenues);
    if (existing) return { ...stop, venueId: existing.id };
    const created: Venue = { id: uid(), name: stop.name, category: "Spot", ratings: [], fave: false, notes: [], ...createdAudit() };
    newVenues.push(created);
    return { ...stop, venueId: created.id };
  });
  return { stops: linkedStops, newVenues };
}

export const useApp = create<AppState>()(
  persist(
    (set, get) => ({
      itineraries: demoItineraries,
      photos: demoPhotos,
      venues: demoVenues,
      members: [],
      inviteCode: demoInviteCode,
      dayOf: { itineraryId: null, stopIdx: 0, completed: false },
      prefs: { soundOn: true, hapticsOn: true, notifyToday: false },
      profile: FRESH_PROFILE,

      setPref: (key, value) => set((s) => ({ prefs: { ...s.prefs, [key]: value } })),

      setProfile: (patch) => set((s) => ({ profile: { ...s.profile, ...patch } })),

      completeOnboarding: (profile) => set(() => ({ profile: { ...profile, onboarded: true } })),

      resetDemo: () => {
        // Wipe every receipt blob the current data references before clearing,
        // then drop the persisted key so a reload reseeds the demo cleanly.
        for (const it of get().itineraries) {
          for (const ex of it.expenses ?? []) {
            if (ex.receiptId) void deleteReceipt(ex.receiptId);
          }
        }
        try {
          localStorage.removeItem("sunny-planning-v1");
        } catch {
          // Ignore storage errors; the reload below still re-seeds in memory.
        }
        set(() => ({
          itineraries: demoItineraries,
          photos: demoPhotos,
          venues: demoVenues,
          inviteCode: demoInviteCode,
          dayOf: { itineraryId: null, stopIdx: 0, completed: false },
          profile: FRESH_PROFILE,
          birthdaySuggestionYear: undefined,
          birthdayCelebratedYear: undefined,
        }));
      },

      ensureBirthdaySuggestion: () => {
        const { profile, itineraries, birthdaySuggestionYear } = get();
        if (!profile.birthdayISO) return;
        const dateISO = upcomingBirthdayISO(profile.birthdayISO);
        const year = parseISO(dateISO).getFullYear();
        // One suggestion per birthday, and only inside the lead-up window.
        if (birthdaySuggestionYear === year) return;
        const lead = daysUntil(dateISO);
        if (lead < 0 || lead > BIRTHDAY_SUGGEST_LEAD_DAYS) return;
        // Respect the one-itinerary-per-date rule; record the year either way so
        // a taken date (or a user who deletes the suggestion) is not retried.
        const taken = itineraries.some((it) => it.dateISO === dateISO && it.status !== "cancelled");
        if (taken) {
          set({ birthdaySuggestionYear: year });
          return;
        }
        const name = profile.displayName.trim();
        const fresh: Itinerary = {
          id: uid(),
          title: name ? `${name}'s birthday` : "Birthday date",
          dateISO,
          stops: [],
          skin: "strawberry",
          status: "planned",
          ...createdAudit(),
        };
        set((s) => ({ itineraries: [fresh, ...s.itineraries], birthdaySuggestionYear: year }));
      },

      markBirthdayCelebrated: (year) => set({ birthdayCelebratedYear: year }),

      notifyTodayIfDue: () => {
        const { prefs, itineraries, lastTodayNotifyISO } = get();
        if (!prefs.notifyToday) return;
        const today = todayISO();
        if (lastTodayNotifyISO === today) return;
        const plan = itineraries.find(
          (it) => !it.draft && it.status === "planned" && it.dateISO === today
        );
        if (!plan) return;
        // Record before firing so a rapid second wake cannot double-notify.
        set({ lastTodayNotifyISO: today });
        void fireTodayNotification("You have a date today", `${plan.title} is on. Open Sunny to start Day-of.`);
      },

      createItinerary: () => {
        const id = uid();
        // Drop any abandoned draft so unsaved dates never pile up.
        const kept = get().itineraries.filter((it) => !it.draft);
        // One date, one itinerary: start today and walk forward to the first free day.
        const taken = new Set(kept.map((it) => it.dateISO));
        let dateISO = todayISO();
        while (taken.has(dateISO)) dateISO = addDaysISO(dateISO, 1);
        const fresh: Itinerary = {
          id,
          title: "New date",
          dateISO,
          stops: [],
          skin: "strawberry",
          status: "planned",
          draft: true,
          ...createdAudit(),
        };
        set(() => ({ itineraries: [fresh, ...kept] }));
        return id;
      },

      saveItinerary: (id) =>
        set((s) => ({ itineraries: patchItinerary(s.itineraries, id, (it) => ({ ...it, draft: false })) })),

      renameItinerary: (id, title) =>
        set((s) => ({ itineraries: patchItinerary(s.itineraries, id, (it) => ({ ...it, title })) })),

      setItineraryDate: (id, dateISO) => {
        // Enforce one itinerary per date; a no-op change to its own date is allowed.
        const clash = get().itineraries.some((it) => it.id !== id && it.dateISO === dateISO);
        if (clash) return false;
        set((s) => ({ itineraries: patchItinerary(s.itineraries, id, (it) => ({ ...it, dateISO })) }));
        return true;
      },

      setSkin: (id, skin) =>
        set((s) => ({ itineraries: patchItinerary(s.itineraries, id, (it) => ({ ...it, skin })) })),

      completeItinerary: (id) =>
        set((s) => {
          const it = s.itineraries.find((x) => x.id === id);
          if (!it || it.status === "completed") return {};
          const { stops, newVenues } = linkStopsToVenues(it.stops, s.venues);
          return {
            venues: [...s.venues, ...newVenues],
            itineraries: patchItinerary(s.itineraries, id, (x) => ({
              ...x,
              stops,
              status: "completed",
              actualTotal: itineraryTotal({ ...x, stops }),
            })),
            dayOf:
              s.dayOf.itineraryId === id
                ? { ...s.dayOf, stopIdx: Math.max(0, stops.length - 1), completed: true }
                : s.dayOf,
          };
        }),

      cancelItinerary: (id) =>
        set((s) => ({
          itineraries: patchItinerary(s.itineraries, id, (x) => ({
            ...x,
            status: "cancelled",
            actualTotal: undefined,
          })),
          dayOf:
            s.dayOf.itineraryId === id ? { itineraryId: null, stopIdx: 0, completed: false } : s.dayOf,
        })),

      reopenItinerary: (id) =>
        set((s) => ({
          itineraries: patchItinerary(s.itineraries, id, (x) => ({
            ...x,
            status: "planned",
            actualTotal: undefined,
          })),
          dayOf:
            s.dayOf.itineraryId === id ? { itineraryId: id, stopIdx: 0, completed: false } : s.dayOf,
        })),

      deleteItinerary: (id) => {
        const it = get().itineraries.find((x) => x.id === id);
        for (const expense of it?.expenses ?? []) {
          if (expense.receiptId) void deleteReceipt(expense.receiptId);
        }
        set((s) => ({
          itineraries: s.itineraries.filter((it) => it.id !== id),
          dayOf:
            s.dayOf.itineraryId === id ? { itineraryId: null, stopIdx: 0, completed: false } : s.dayOf,
        }));
      },

      addStop: (itineraryId, stop) =>
        set((s) => {
          const venueId = stop.venueId ?? findVenueByName(stop.name, s.venues)?.id;
          return {
            itineraries: patchItinerary(s.itineraries, itineraryId, (it) => ({
              ...it,
              stops: [...it.stops, { ...stop, venueId, id: uid(), ...createdAudit() }],
            })),
          };
        }),

      updateStop: (itineraryId, stopId, patch) =>
        set((s) => ({
          itineraries: patchItinerary(s.itineraries, itineraryId, (it) => ({
            ...it,
            stops: it.stops.map((st) => {
              if (st.id !== stopId) return st;
              const merged = { ...st, ...patch, ...touchedAudit() };
              // The patch did not carry an explicit venue link: fall back to a
              // case-insensitive name match so a manually typed exact name
              // still ties back to its venue.
              if (!patch.venueId) {
                const match = findVenueByName(merged.name, s.venues);
                if (match) merged.venueId = match.id;
              }
              return merged;
            }),
          })),
        })),

      removeStop: (itineraryId, stopId) =>
        set((s) => ({
          itineraries: patchItinerary(s.itineraries, itineraryId, (it) => ({
            ...it,
            stops: it.stops.filter((st) => st.id !== stopId),
          })),
          // Photos tagged to the removed stop fall back to the date they belong to.
          photos: s.photos.map((p) => (p.stopId === stopId ? { ...p, stopId: undefined } : p)),
        })),

      moveStop: (itineraryId, from, to) =>
        set((s) => ({
          itineraries: patchItinerary(s.itineraries, itineraryId, (it) => {
            if (from === to || from < 0 || to < 0 || from >= it.stops.length || to >= it.stops.length) {
              return it;
            }
            const stops = [...it.stops];
            const [moved] = stops.splice(from, 1);
            stops.splice(to, 0, moved);
            return { ...it, stops };
          }),
        })),

      addExpense: (itineraryId, expense) =>
        set((s) => ({
          itineraries: patchItinerary(s.itineraries, itineraryId, (it) => ({
            ...it,
            expenses: [
              ...(it.expenses ?? []),
              { ...expense, id: uid(), createdISO: todayISO(), ...createdAudit() },
            ],
          })),
        })),

      updateExpense: (itineraryId, expenseId, patch) =>
        set((s) => ({
          itineraries: patchItinerary(s.itineraries, itineraryId, (it) => ({
            ...it,
            expenses: (it.expenses ?? []).map((ex) =>
              ex.id === expenseId ? { ...ex, ...patch, ...touchedAudit() } : ex
            ),
          })),
        })),

      // Soft-delete: the row stays (recoverable from Recently deleted), so its
      // receipt is kept too; the blob is only dropped when purge hard-removes it.
      removeExpense: (itineraryId, expenseId) =>
        set((s) => ({
          itineraries: patchItinerary(s.itineraries, itineraryId, (x) => ({
            ...x,
            expenses: (x.expenses ?? []).map((ex) =>
              ex.id === expenseId
                ? { ...ex, deletedAt: nowISO(), deletedBy: actingUserId, ...touchedAudit() }
                : ex
            ),
          })),
        })),

      restoreExpense: (itineraryId, expenseId) =>
        set((s) => ({
          itineraries: patchItinerary(s.itineraries, itineraryId, (x) => ({
            ...x,
            expenses: (x.expenses ?? []).map((ex) =>
              ex.id === expenseId
                ? { ...ex, deletedAt: undefined, deletedBy: undefined, ...touchedAudit() }
                : ex
            ),
          })),
        })),

      purgeDeletedExpenses: () => {
        const cutoffMs = Date.now() - RECENTLY_DELETED_DAYS * 24 * 60 * 60 * 1000;
        const orphanedReceipts: string[] = [];
        set((s) => ({
          itineraries: s.itineraries.map((it) => {
            const expenses = it.expenses;
            if (!expenses?.some((ex) => ex.deletedAt)) return it;
            const kept = expenses.filter((ex) => {
              if (ex.deletedAt && new Date(ex.deletedAt).getTime() < cutoffMs) {
                if (ex.receiptId) orphanedReceipts.push(ex.receiptId);
                return false;
              }
              return true;
            });
            // A system cleanup, not a user edit, so do not bump updatedAt.
            return kept.length === expenses.length ? it : { ...it, expenses: kept };
          }),
        }));
        for (const receiptId of orphanedReceipts) void deleteReceipt(receiptId);
      },

      syncDayOf: (itineraryId) => {
        const { dayOf } = get();
        if (dayOf.itineraryId !== itineraryId) {
          set({ dayOf: { itineraryId, stopIdx: 0, completed: false } });
        }
      },

      advanceDay: () => {
        const { dayOf, itineraries, venues } = get();
        const it = itineraries.find((x) => x.id === dayOf.itineraryId);
        if (!it || dayOf.completed) return;
        if (dayOf.stopIdx < it.stops.length - 1) {
          set({ dayOf: { ...dayOf, stopIdx: dayOf.stopIdx + 1 } });
          return;
        }
        // Final stop: complete the date, freeze its spend, and make sure every
        // stop has a rateable venue waiting on the Ratings screen.
        const { stops, newVenues } = linkStopsToVenues(it.stops, venues);
        set((s) => ({
          dayOf: { ...s.dayOf, completed: true },
          venues: [...s.venues, ...newVenues],
          itineraries: patchItinerary(s.itineraries, it.id, (x) => ({
            ...x,
            stops,
            status: "completed",
            actualTotal: itineraryTotal({ ...x, stops }),
          })),
        }));
      },

      resetDay: () => {
        const { dayOf } = get();
        const id = dayOf.itineraryId;
        if (!id) return;
        set((s) => ({
          dayOf: { itineraryId: id, stopIdx: 0, completed: false },
          itineraries: patchItinerary(s.itineraries, id, (x) => ({
            ...x,
            status: "planned",
            actualTotal: undefined,
          })),
        }));
      },

      addPhoto: (photo) =>
        set((s) => ({ photos: [{ ...photo, id: uid(), ...createdAudit() }, ...s.photos] })),

      updatePhotoCaption: (id, caption) =>
        set((s) => ({
          photos: s.photos.map((p) => (p.id === id ? { ...p, caption, ...touchedAudit() } : p)),
        })),

      updatePhotoStop: (id, stopId) =>
        set((s) => ({
          photos: s.photos.map((p) => (p.id === id ? { ...p, stopId, ...touchedAudit() } : p)),
        })),

      rateVenue: (venueId, rating, visit) =>
        set((s) => ({
          venues: s.venues.map((v) => {
            if (v.id !== venueId) return v;
            if (visit) {
              const idx = v.ratings.findIndex((r) => r.itineraryId === visit.itineraryId);
              if (idx >= 0) {
                const ratings = [...v.ratings];
                ratings[idx] = {
                  ...ratings[idx],
                  rating,
                  stopId: visit.stopId,
                  dateISO: visit.dateISO,
                  ...touchedAudit(),
                };
                return { ...v, ratings, ...touchedAudit() };
              }
              const entry: VenueRating = {
                id: uid(),
                rating,
                itineraryId: visit.itineraryId,
                stopId: visit.stopId,
                dateISO: visit.dateISO,
                ...createdAudit(),
              };
              return { ...v, ratings: [...v.ratings, entry], ...touchedAudit() };
            }
            // No visit context: a manual rating from the card, dated today.
            // Re-rating later the same day updates that entry in place.
            const today = todayISO();
            const idx = v.ratings.findIndex((r) => !r.itineraryId && r.dateISO === today);
            if (idx >= 0) {
              const ratings = [...v.ratings];
              ratings[idx] = { ...ratings[idx], rating, ...touchedAudit() };
              return { ...v, ratings, ...touchedAudit() };
            }
            return {
              ...v,
              ratings: [...v.ratings, { id: uid(), rating, dateISO: today, ...createdAudit() }],
              ...touchedAudit(),
            };
          }),
        })),

      toggleFave: (id) =>
        set((s) => ({
          venues: s.venues.map((v) => (v.id === id ? { ...v, fave: !v.fave, ...touchedAudit() } : v)),
        })),

      addVenueNote: (id, note) =>
        set((s) => ({
          venues: s.venues.map((v) =>
            v.id === id
              ? { ...v, notes: [...v.notes, { ...note, id: note.id ?? uid(), ...createdAudit() }], ...touchedAudit() }
              : v
          ),
        })),

      setVenueCategory: (id, category) =>
        set((s) => ({
          venues: s.venues.map((v) => (v.id === id ? { ...v, category, ...touchedAudit() } : v)),
        })),
    }),
    {
      name: "sunny-planning-v1",
      version: 7,
      migrate: (persisted) => {
        const state = (persisted ?? {}) as {
          itineraries?: Itinerary[];
          venues?: Array<{ id?: string; rating?: number; ratings?: VenueRating[]; [key: string]: unknown }>;
          expenses?: Array<{ itineraryId?: string; amount?: number } | undefined>;
          profile?: Profile;
          prefs?: Partial<Prefs>;
          [key: string]: unknown;
        };
        const legacyExpenses = Array.isArray(state.expenses) ? state.expenses : [];
        const itineraries = Array.isArray(state.itineraries) ? state.itineraries : [];
        if (legacyExpenses.length > 0 && itineraries.length > 0) {
          for (const expense of legacyExpenses) {
            const itineraryId = expense?.itineraryId;
            if (!itineraryId) continue;
            const it = itineraries.find((x) => x?.id === itineraryId);
            if (it && typeof expense?.amount === "number") {
              it.actualTotal = expense.amount;
            }
          }
        }
        // Every itinerary gains an expenses log, defaulting to empty for dates
        // completed (or planned) before itemized spend existed.
        for (const it of itineraries) {
          if (it && !Array.isArray(it.expenses)) it.expenses = [];
        }

        // Every venue gains a rating history; a legacy single number becomes
        // one dateless entry ("rated earlier"), then the old field is dropped.
        const venues = Array.isArray(state.venues) ? state.venues : [];
        for (const v of venues) {
          if (!v || Array.isArray(v.ratings)) continue;
          const legacyRating = typeof v.rating === "number" ? v.rating : 0;
          v.ratings = legacyRating > 0 ? [{ id: `vr-legacy-${v.id}`, rating: legacyRating }] : [];
          delete v.rating;
        }

        // v5: audit trail. Backfill created/updated timestamps on pre-audit
        // records, best-effort from the date the record already carried, so the
        // history is not blank. createdBy / updatedBy stay unset until auth.
        const backfill = (rec: Record<string, unknown> | undefined, seedISO?: string) => {
          if (!rec) return;
          const seed = seedISO ? `${seedISO}T00:00:00.000Z` : undefined;
          if (rec.createdAt == null && seed) rec.createdAt = seed;
          if (rec.updatedAt == null) rec.updatedAt = (rec.createdAt as string) ?? seed;
        };
        for (const it of itineraries as Array<Record<string, unknown>>) {
          const dateISO = typeof it?.dateISO === "string" ? it.dateISO : undefined;
          backfill(it, dateISO);
          for (const st of (Array.isArray(it?.stops) ? it.stops : []) as Array<Record<string, unknown>>) {
            backfill(st, dateISO);
          }
          for (const ex of (Array.isArray(it?.expenses) ? it.expenses : []) as Array<Record<string, unknown>>) {
            backfill(ex, typeof ex?.createdISO === "string" ? ex.createdISO : dateISO);
          }
        }
        for (const v of venues as Array<Record<string, unknown>>) {
          backfill(v);
          for (const note of (Array.isArray(v?.notes) ? v.notes : []) as Array<Record<string, unknown>>) {
            backfill(note);
            // v7: venue notes gained a stable id (for sync); mint one for legacy notes.
            if (note.id == null) note.id = crypto.randomUUID();
          }
          for (const r of (Array.isArray(v?.ratings) ? v.ratings : []) as Array<Record<string, unknown>>) {
            backfill(r, typeof r?.dateISO === "string" ? r.dateISO : undefined);
          }
        }

        // v6: profile slice. Anyone with persisted state is an existing user,
        // so mark them onboarded (never surface the first-time wizard to them);
        // a partial pre-v6 profile is merged over the blank default.
        const profile: Profile = { ...FRESH_PROFILE, ...(state.profile ?? {}), onboarded: true };

        // Ensure new preference keys have a default for pre-v6 users.
        const prefs: Prefs = { soundOn: true, hapticsOn: true, notifyToday: false, ...(state.prefs ?? {}) };

        const { expenses: _expenses, ...rest } = state;
        return { ...rest, itineraries, venues, profile, prefs };
      },
    }
  )
);
