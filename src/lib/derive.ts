import type { Expense, Itinerary, Photo, Venue } from "./types";
import { daysAgo, isSameMonth, parseISO, todayISO, weekStart } from "./dates";

/** Planned estimate: sum of stop costs. */
export function itineraryTotal(it: Itinerary): number {
  return it.stops.reduce((sum, s) => sum + (s.cost || 0), 0);
}

/** Live (not soft-deleted) expenses for a date. */
export function activeExpenses(it: Itinerary): Expense[] {
  return (it.expenses ?? []).filter((ex) => !ex.deletedAt);
}

/** Sum of logged expense line items, ignoring soft-deleted ones. */
export function expensesTotal(it: Itinerary): number {
  return activeExpenses(it).reduce((sum, ex) => sum + (ex.amount || 0), 0);
}

/** True once any real (non-deleted) spend has been logged for this date. */
export function hasActuals(it: Itinerary): boolean {
  return activeExpenses(it).length > 0;
}

export type DeletedExpense = {
  expense: Expense;
  itineraryId: string;
  itineraryTitle: string;
  dateISO: string;
};

/** Every soft-deleted expense across all dates, most recently deleted first. */
export function deletedExpenses(itineraries: Itinerary[]): DeletedExpense[] {
  const rows: DeletedExpense[] = [];
  for (const it of itineraries) {
    for (const ex of it.expenses ?? []) {
      if (ex.deletedAt) {
        rows.push({ expense: ex, itineraryId: it.id, itineraryTitle: it.title, dateISO: it.dateISO });
      }
    }
  }
  return rows.sort((a, b) => (b.expense.deletedAt ?? "").localeCompare(a.expense.deletedAt ?? ""));
}

/**
 * Actual spend for a date: the logged expense total once anything is
 * logged, else the legacy frozen actualTotal, else the planned estimate.
 */
export function dateSpend(it: Itinerary): number {
  if (hasActuals(it)) return expensesTotal(it);
  return it.actualTotal ?? itineraryTotal(it);
}

/** True when dateSpend(it) is a fallback estimate, not a logged or frozen actual. */
export function isEstimateSpend(it: Itinerary): boolean {
  return !hasActuals(it) && it.actualTotal == null;
}

export type DateSpend = {
  id: string;
  label: string;
  dateISO: string;
  amount: number;
  /** True when the amount is a fallback estimate, not a logged/frozen actual. */
  isEstimate: boolean;
};

/** Completed dates as cost-tracker rows, newest first. */
export function completedDates(itineraries: Itinerary[]): DateSpend[] {
  return itineraries
    .filter((it) => it.status === "completed")
    .map((it) => ({
      id: it.id,
      label: it.title,
      dateISO: it.dateISO,
      amount: dateSpend(it),
      isEstimate: isEstimateSpend(it),
    }))
    .sort((a, b) => b.dateISO.localeCompare(a.dateISO));
}

export function monthStats(itineraries: Itinerary[], ref = new Date()) {
  const inMonth = itineraries.filter(
    (it) => it.status === "completed" && isSameMonth(it.dateISO, ref)
  );
  const total = inMonth.reduce((sum, it) => sum + dateSpend(it), 0);
  const count = inMonth.length;
  return { total, count, avg: count ? Math.round(total / count) : 0 };
}

export function datesLogged(itineraries: Itinerary[]): number {
  return itineraries.filter((it) => it.status === "completed").length;
}

/** Consecutive weeks (ending with the current week) that have a completed date. */
export function streakWeeks(itineraries: Itinerary[], ref = new Date()): number {
  const completed = itineraries
    .filter((it) => it.status === "completed")
    .map((it) => weekStart(parseISO(it.dateISO)).getTime());
  const weeks = new Set(completed);
  let streak = 0;
  let cursor = weekStart(ref).getTime();
  const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
  while (weeks.has(cursor)) {
    streak += 1;
    cursor -= WEEK_MS;
  }
  return streak;
}

/** Mascot mood, derived from dates completed in the trailing 30 days. */
export function happiness(itineraries: Itinerary[], ref = new Date()): number {
  const recent = itineraries.filter(
    (it) => it.status === "completed" && daysAgo(it.dateISO, ref) <= 30 && daysAgo(it.dateISO, ref) >= 0
  ).length;
  return Math.min(100, Math.max(10, 22 + recent * 6));
}

export type Mood = "happy" | "sleepy" | "asleep";

export function moodFor(pct: number): Mood {
  if (pct >= 70) return "happy";
  if (pct >= 40) return "sleepy";
  return "asleep";
}

/** The soonest planned itinerary on or after today, else the most recent planned one. */
export function nextPlanned(itineraries: Itinerary[]): Itinerary | undefined {
  const planned = itineraries.filter((it) => it.status === "planned" && !it.draft);
  if (planned.length === 0) return undefined;
  const today = todayISO();
  const upcoming = planned
    .filter((it) => it.dateISO >= today)
    .sort((a, b) => a.dateISO.localeCompare(b.dateISO));
  if (upcoming.length > 0) return upcoming[0];
  return planned.sort((a, b) => b.dateISO.localeCompare(a.dateISO))[0];
}

/**
 * The newest rating for a venue, 0 when it has never been rated. Newest = the
 * entry with the highest `dateISO`; entries without a `dateISO` (legacy,
 * migrated ratings) count as the oldest. Ties (including two entries with no
 * date at all) are broken by array position, later wins.
 */
export function latestRating(venue: Venue): number {
  let best: string | undefined;
  let value = 0;
  for (const entry of venue.ratings ?? []) {
    const key = entry.dateISO ?? "";
    if (best === undefined || key >= best) {
      best = key;
      value = entry.rating;
    }
  }
  return value;
}

export type VenueVisit = {
  /** The date this visit happened, when it is still around. */
  itinerary?: Itinerary;
  /** Falls back to the rating entry's own date when the itinerary is gone. */
  dateISO?: string;
  /** This visit's paw rating, when one was ever recorded for it. */
  rating?: number;
};

/**
 * Visit history for a venue, newest first: one row per completed itinerary
 * that involves the venue (a stop links to it, or a rating entry references
 * it), plus one row for every rating entry that does not resolve to a
 * completed itinerary (a manual rating, or one whose date got deleted).
 */
export function venueVisits(venue: Venue, itineraries: Itinerary[]): VenueVisit[] {
  const ratings = venue.ratings ?? [];
  const rows: VenueVisit[] = [];
  const claimedRatingItineraryIds = new Set<string>();

  for (const it of itineraries) {
    if (it.status !== "completed") continue;
    const stopMatch = it.stops.some((s) => s.venueId === venue.id);
    const ratingEntry = ratings.find((r) => r.itineraryId === it.id);
    if (!stopMatch && !ratingEntry) continue;
    if (ratingEntry) claimedRatingItineraryIds.add(it.id);
    rows.push({ itinerary: it, dateISO: it.dateISO, rating: ratingEntry?.rating });
  }

  for (const entry of ratings) {
    if (entry.itineraryId && claimedRatingItineraryIds.has(entry.itineraryId)) continue;
    rows.push({ dateISO: entry.dateISO, rating: entry.rating });
  }

  rows.sort((a, b) => (b.dateISO ?? "").localeCompare(a.dateISO ?? ""));
  return rows;
}

/** Photos taken during any completed itinerary that involves this venue, newest first. */
export function venuePhotos(venue: Venue, itineraries: Itinerary[], photos: Photo[]): Photo[] {
  const ratings = venue.ratings ?? [];
  const involving = new Set(
    itineraries
      .filter(
        (it) =>
          it.status === "completed" &&
          (it.stops.some((s) => s.venueId === venue.id) || ratings.some((r) => r.itineraryId === it.id))
      )
      .map((it) => it.id)
  );
  return photos
    .filter((p) => p.itineraryId && involving.has(p.itineraryId))
    .sort((a, b) => b.dateISO.localeCompare(a.dateISO));
}
