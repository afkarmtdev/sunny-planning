import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Expense, Itinerary, Photo, SkinId, Stop, Venue, VenueNote, VenueRating } from "../lib/types";
import { itineraryTotal } from "../lib/derive";
import { addDaysISO, todayISO } from "../lib/dates";
import { deleteReceipt } from "../lib/receipts";
import { demoInviteCode, demoItineraries, demoPhotos, demoVenues } from "../data/demo";

const uid = () => Math.random().toString(36).slice(2, 10);

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
};

type AppState = {
  itineraries: Itinerary[];
  photos: Photo[];
  venues: Venue[];
  inviteCode: string;
  dayOf: DayOf;
  prefs: Prefs;
  setPref: <K extends keyof Prefs>(key: K, value: Prefs[K]) => void;

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
  removeExpense: (itineraryId: string, expenseId: string) => void;

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
  return itineraries.map((it) => (it.id === id ? fn(it) : it));
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
    const created: Venue = { id: `vn-${uid()}`, name: stop.name, category: "Spot", ratings: [], fave: false, notes: [] };
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
      inviteCode: demoInviteCode,
      dayOf: { itineraryId: null, stopIdx: 0, completed: false },
      prefs: { soundOn: true, hapticsOn: true },

      setPref: (key, value) => set((s) => ({ prefs: { ...s.prefs, [key]: value } })),

      createItinerary: () => {
        const id = `it-${uid()}`;
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
              stops: [...it.stops, { ...stop, venueId, id: `st-${uid()}` }],
            })),
          };
        }),

      updateStop: (itineraryId, stopId, patch) =>
        set((s) => ({
          itineraries: patchItinerary(s.itineraries, itineraryId, (it) => ({
            ...it,
            stops: it.stops.map((st) => {
              if (st.id !== stopId) return st;
              const merged = { ...st, ...patch };
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
            expenses: [...(it.expenses ?? []), { ...expense, id: `ex-${uid()}`, createdISO: todayISO() }],
          })),
        })),

      updateExpense: (itineraryId, expenseId, patch) =>
        set((s) => ({
          itineraries: patchItinerary(s.itineraries, itineraryId, (it) => ({
            ...it,
            expenses: (it.expenses ?? []).map((ex) => (ex.id === expenseId ? { ...ex, ...patch } : ex)),
          })),
        })),

      removeExpense: (itineraryId, expenseId) => {
        const it = get().itineraries.find((x) => x.id === itineraryId);
        const expense = it?.expenses?.find((ex) => ex.id === expenseId);
        if (expense?.receiptId) void deleteReceipt(expense.receiptId);
        set((s) => ({
          itineraries: patchItinerary(s.itineraries, itineraryId, (x) => ({
            ...x,
            expenses: (x.expenses ?? []).filter((ex) => ex.id !== expenseId),
          })),
        }));
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

      addPhoto: (photo) => set((s) => ({ photos: [{ ...photo, id: `ph-${uid()}` }, ...s.photos] })),

      updatePhotoCaption: (id, caption) =>
        set((s) => ({ photos: s.photos.map((p) => (p.id === id ? { ...p, caption } : p)) })),

      updatePhotoStop: (id, stopId) =>
        set((s) => ({ photos: s.photos.map((p) => (p.id === id ? { ...p, stopId } : p)) })),

      rateVenue: (venueId, rating, visit) =>
        set((s) => ({
          venues: s.venues.map((v) => {
            if (v.id !== venueId) return v;
            if (visit) {
              const idx = v.ratings.findIndex((r) => r.itineraryId === visit.itineraryId);
              if (idx >= 0) {
                const ratings = [...v.ratings];
                ratings[idx] = { ...ratings[idx], rating, stopId: visit.stopId, dateISO: visit.dateISO };
                return { ...v, ratings };
              }
              const entry: VenueRating = {
                id: `vr-${uid()}`,
                rating,
                itineraryId: visit.itineraryId,
                stopId: visit.stopId,
                dateISO: visit.dateISO,
              };
              return { ...v, ratings: [...v.ratings, entry] };
            }
            // No visit context: a manual rating from the card, dated today.
            // Re-rating later the same day updates that entry in place.
            const today = todayISO();
            const idx = v.ratings.findIndex((r) => !r.itineraryId && r.dateISO === today);
            if (idx >= 0) {
              const ratings = [...v.ratings];
              ratings[idx] = { ...ratings[idx], rating };
              return { ...v, ratings };
            }
            return { ...v, ratings: [...v.ratings, { id: `vr-${uid()}`, rating, dateISO: today }] };
          }),
        })),

      toggleFave: (id) =>
        set((s) => ({ venues: s.venues.map((v) => (v.id === id ? { ...v, fave: !v.fave } : v)) })),

      addVenueNote: (id, note) =>
        set((s) => ({
          venues: s.venues.map((v) => (v.id === id ? { ...v, notes: [...v.notes, note] } : v)),
        })),

      setVenueCategory: (id, category) =>
        set((s) => ({
          venues: s.venues.map((v) => (v.id === id ? { ...v, category } : v)),
        })),
    }),
    {
      name: "sunny-planning-v1",
      version: 4,
      migrate: (persisted) => {
        const state = (persisted ?? {}) as {
          itineraries?: Itinerary[];
          venues?: Array<{ id?: string; rating?: number; ratings?: VenueRating[]; [key: string]: unknown }>;
          expenses?: Array<{ itineraryId?: string; amount?: number } | undefined>;
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

        const { expenses: _expenses, ...rest } = state;
        return { ...rest, itineraries, venues };
      },
    }
  )
);
