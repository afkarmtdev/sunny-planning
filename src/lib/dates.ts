const DAY_MS = 24 * 60 * 60 * 1000;

export function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function todayISO(): string {
  return toISODate(new Date());
}

/** Full ISO datetime for audit timestamps (createdAt / updatedAt / deletedAt). */
export function nowISO(): string {
  return new Date().toISOString();
}

export function parseISO(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

/** ISO date `n` days after `iso` (n may be negative). */
export function addDaysISO(iso: string, n: number): string {
  const d = parseISO(iso);
  return toISODate(new Date(d.getFullYear(), d.getMonth(), d.getDate() + n));
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

/** "Jul 11" */
export function shortDate(iso: string): string {
  const d = parseISO(iso);
  return `${MONTHS[d.getMonth()]} ${d.getDate()}`;
}

/** "Saturday, Jul 11" */
export function longDate(iso: string): string {
  const d = parseISO(iso);
  return `${WEEKDAYS[d.getDay()]}, ${MONTHS[d.getMonth()]} ${d.getDate()}`;
}

/** "SAT, JUL 11" */
export function stampDate(iso: string): string {
  const d = parseISO(iso);
  return `${WEEKDAYS[d.getDay()].slice(0, 3)}, ${MONTHS[d.getMonth()]} ${d.getDate()}`.toUpperCase();
}

export function isSameMonth(iso: string, ref: Date): boolean {
  const d = parseISO(iso);
  return d.getFullYear() === ref.getFullYear() && d.getMonth() === ref.getMonth();
}

/** "July 2026" */
export function monthLabel(d: Date): string {
  return d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

/** First day of the month, shifted by delta months. */
export function addMonths(d: Date, delta: number): Date {
  return new Date(d.getFullYear(), d.getMonth() + delta, 1);
}

/** Monday 00:00 of the week containing d. */
export function weekStart(d: Date): Date {
  const copy = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const dow = (copy.getDay() + 6) % 7;
  return new Date(copy.getTime() - dow * DAY_MS);
}

export function daysAgo(iso: string, ref: Date): number {
  return Math.floor((ref.getTime() - parseISO(iso).getTime()) / DAY_MS);
}

/** "4:12 PM" */
export function clockLabel(d: Date): string {
  let h = d.getHours();
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return `${h}:${String(d.getMinutes()).padStart(2, "0")} ${ampm}`;
}

export function greeting(d: Date): string {
  const h = d.getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}
