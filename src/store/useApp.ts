import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Expense, Itinerary, Photo, SkinId, Stop, Venue, VenueNote } from "../lib/types";
import { itineraryTotal } from "../lib/derive";
import { todayISO } from "../lib/dates";
import { demoExpenses, demoInviteCode, demoItineraries, demoPhotos, demoVenues } from "../data/demo";

const uid = () => Math.random().toString(36).slice(2, 10);

type DayOf = {
  itineraryId: string | null;
  stopIdx: number;
  completed: boolean;
};

type AppState = {
  itineraries: Itinerary[];
  expenses: Expense[];
  photos: Photo[];
  venues: Venue[];
  inviteCode: string;
  dayOf: DayOf;

  createItinerary: () => string;
  renameItinerary: (id: string, title: string) => void;
  setItineraryDate: (id: string, dateISO: string) => void;
  setSkin: (id: string, skin: SkinId) => void;

  addStop: (itineraryId: string, stop: Omit<Stop, "id">) => void;
  updateStop: (itineraryId: string, stopId: string, patch: Partial<Omit<Stop, "id">>) => void;
  removeStop: (itineraryId: string, stopId: string) => void;
  moveStop: (itineraryId: string, from: number, to: number) => void;

  syncDayOf: (itineraryId: string | null) => void;
  advanceDay: () => void;
  resetDay: () => void;

  addPhoto: (photo: Omit<Photo, "id">) => void;
  updatePhotoCaption: (id: string, caption: string) => void;

  setVenueRating: (id: string, rating: number) => void;
  toggleFave: (id: string) => void;
  addVenueNote: (id: string, note: VenueNote) => void;

  attachReceipt: (dataUrl: string) => Expense | null;
};

function patchItinerary(
  itineraries: Itinerary[],
  id: string,
  fn: (it: Itinerary) => Itinerary
): Itinerary[] {
  return itineraries.map((it) => (it.id === id ? fn(it) : it));
}

export const useApp = create<AppState>()(
  persist(
    (set, get) => ({
      itineraries: demoItineraries,
      expenses: demoExpenses,
      photos: demoPhotos,
      venues: demoVenues,
      inviteCode: demoInviteCode,
      dayOf: { itineraryId: null, stopIdx: 0, completed: false },

      createItinerary: () => {
        const id = `it-${uid()}`;
        const fresh: Itinerary = {
          id,
          title: "New date",
          dateISO: todayISO(),
          stops: [],
          skin: "strawberry",
          status: "planned",
        };
        set((s) => ({ itineraries: [fresh, ...s.itineraries] }));
        return id;
      },

      renameItinerary: (id, title) =>
        set((s) => ({ itineraries: patchItinerary(s.itineraries, id, (it) => ({ ...it, title })) })),

      setItineraryDate: (id, dateISO) =>
        set((s) => ({ itineraries: patchItinerary(s.itineraries, id, (it) => ({ ...it, dateISO })) })),

      setSkin: (id, skin) =>
        set((s) => ({ itineraries: patchItinerary(s.itineraries, id, (it) => ({ ...it, skin })) })),

      addStop: (itineraryId, stop) =>
        set((s) => ({
          itineraries: patchItinerary(s.itineraries, itineraryId, (it) => ({
            ...it,
            stops: [...it.stops, { ...stop, id: `st-${uid()}` }],
          })),
        })),

      updateStop: (itineraryId, stopId, patch) =>
        set((s) => ({
          itineraries: patchItinerary(s.itineraries, itineraryId, (it) => ({
            ...it,
            stops: it.stops.map((st) => (st.id === stopId ? { ...st, ...patch } : st)),
          })),
        })),

      removeStop: (itineraryId, stopId) =>
        set((s) => ({
          itineraries: patchItinerary(s.itineraries, itineraryId, (it) => ({
            ...it,
            stops: it.stops.filter((st) => st.id !== stopId),
          })),
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

      syncDayOf: (itineraryId) => {
        const { dayOf } = get();
        if (dayOf.itineraryId !== itineraryId) {
          set({ dayOf: { itineraryId, stopIdx: 0, completed: false } });
        }
      },

      advanceDay: () => {
        const { dayOf, itineraries } = get();
        const it = itineraries.find((x) => x.id === dayOf.itineraryId);
        if (!it || dayOf.completed) return;
        if (dayOf.stopIdx < it.stops.length - 1) {
          set({ dayOf: { ...dayOf, stopIdx: dayOf.stopIdx + 1 } });
          return;
        }
        // Final stop: complete the date. Log it to the cost tracker and mark it done.
        const expense: Expense = {
          id: `ex-${uid()}`,
          label: it.title,
          dateISO: it.dateISO,
          amount: itineraryTotal(it),
          itineraryId: it.id,
        };
        set((s) => ({
          dayOf: { ...s.dayOf, completed: true },
          itineraries: patchItinerary(s.itineraries, it.id, (x) => ({ ...x, status: "completed" })),
          expenses: [expense, ...s.expenses],
        }));
      },

      resetDay: () => {
        const { dayOf } = get();
        const id = dayOf.itineraryId;
        if (!id) return;
        set((s) => ({
          dayOf: { itineraryId: id, stopIdx: 0, completed: false },
          itineraries: patchItinerary(s.itineraries, id, (x) => ({ ...x, status: "planned" })),
          expenses: s.expenses.filter((e) => e.itineraryId !== id),
        }));
      },

      addPhoto: (photo) => set((s) => ({ photos: [{ ...photo, id: `ph-${uid()}` }, ...s.photos] })),

      updatePhotoCaption: (id, caption) =>
        set((s) => ({ photos: s.photos.map((p) => (p.id === id ? { ...p, caption } : p)) })),

      setVenueRating: (id, rating) =>
        set((s) => ({ venues: s.venues.map((v) => (v.id === id ? { ...v, rating } : v)) })),

      toggleFave: (id) =>
        set((s) => ({ venues: s.venues.map((v) => (v.id === id ? { ...v, fave: !v.fave } : v)) })),

      addVenueNote: (id, note) =>
        set((s) => ({
          venues: s.venues.map((v) => (v.id === id ? { ...v, notes: [...v.notes, note] } : v)),
        })),

      attachReceipt: (dataUrl) => {
        const { expenses } = get();
        if (expenses.length === 0) return null;
        const latest = [...expenses].sort((a, b) => b.dateISO.localeCompare(a.dateISO))[0];
        set((s) => ({
          expenses: s.expenses.map((e) => (e.id === latest.id ? { ...e, receiptUrl: dataUrl } : e)),
        }));
        return latest;
      },
    }),
    { name: "sunny-planning-v1", version: 1 }
  )
);
