import type { Expense, Itinerary } from "./types";
import { daysAgo, isSameMonth, parseISO, todayISO, weekStart } from "./dates";

export function itineraryTotal(it: Itinerary): number {
  return it.stops.reduce((sum, s) => sum + (s.cost || 0), 0);
}

export function monthStats(expenses: Expense[], ref = new Date()) {
  const inMonth = expenses.filter((e) => isSameMonth(e.dateISO, ref));
  const total = inMonth.reduce((sum, e) => sum + e.amount, 0);
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
  const planned = itineraries.filter((it) => it.status === "planned");
  if (planned.length === 0) return undefined;
  const today = todayISO();
  const upcoming = planned
    .filter((it) => it.dateISO >= today)
    .sort((a, b) => a.dateISO.localeCompare(b.dateISO));
  if (upcoming.length > 0) return upcoming[0];
  return planned.sort((a, b) => b.dateISO.localeCompare(a.dateISO))[0];
}
