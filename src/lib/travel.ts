import type { Stop, TravelMode } from "./types";

const SPEED_KMH: Record<TravelMode, number> = { drive: 34, walk: 4.7 };

function haversineKm(aLat: number, aLng: number, bLat: number, bLng: number): number {
  const R = 6371;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(bLat - aLat);
  const dLng = toRad(bLng - aLng);
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(aLat)) * Math.cos(toRad(bLat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

/**
 * Straight-line estimate scaled by typical city speeds. Used when both stops
 * have coordinates; otherwise the stop's manually saved minutes are shown.
 * Swap this for a real directions API when one is wired up.
 */
export function estimateMinutes(from: Stop, to: Stop, mode: TravelMode): number | undefined {
  if (from.lat == null || from.lng == null || to.lat == null || to.lng == null) return undefined;
  const km = haversineKm(from.lat, from.lng, to.lat, to.lng) * 1.3;
  return Math.max(1, Math.round((km / SPEED_KMH[mode]) * 60) + (mode === "drive" ? 3 : 0));
}

export function travelBetween(from: Stop, to: Stop): { minutes: number; mode: TravelMode } | null {
  const mode = from.travelModeToNext ?? "drive";
  const estimated = estimateMinutes(from, to, mode);
  const minutes = from.travelMinutesToNext ?? estimated;
  if (minutes == null) return null;
  return { minutes, mode };
}
