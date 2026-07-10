import type { Stop, TravelMode } from "./types";

const DIRECTIONS_MODE: Record<TravelMode, string> = { drive: "driving", walk: "walking" };

export function googleMapsUrl(stop: Pick<Stop, "name" | "lat" | "lng">): string {
  const query = stop.lat != null && stop.lng != null ? `${stop.lat},${stop.lng}` : encodeURIComponent(stop.name);
  return `https://www.google.com/maps/search/?api=1&query=${query}`;
}

export function googleDirectionsUrl(
  from: Pick<Stop, "name" | "lat" | "lng">,
  to: Pick<Stop, "name" | "lat" | "lng">,
  mode: TravelMode
): string {
  const origin = from.lat != null && from.lng != null ? `${from.lat},${from.lng}` : encodeURIComponent(from.name);
  const destination = to.lat != null && to.lng != null ? `${to.lat},${to.lng}` : encodeURIComponent(to.name);
  return `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=${DIRECTIONS_MODE[mode]}`;
}

export function openGoogleMaps(stop: Pick<Stop, "name" | "lat" | "lng">): void {
  window.open(googleMapsUrl(stop), "_blank", "noopener");
}

export function openDirections(
  from: Pick<Stop, "name" | "lat" | "lng">,
  to: Pick<Stop, "name" | "lat" | "lng">,
  mode: TravelMode
): void {
  window.open(googleDirectionsUrl(from, to, mode), "_blank", "noopener");
}
