import type { Stop, TravelMode } from "./types";

// Deep links out to navigation apps. Waze and Google Maps universal links
// open the installed app on mobile and fall back to the web on desktop.
// Between-stop directions are Google-only by necessity: Waze links cannot
// carry an origin, the app always routes from the current position.

const DIRECTIONS_MODE: Record<TravelMode, string> = { drive: "driving", walk: "walking" };

export function wazeUrl(stop: Pick<Stop, "name" | "lat" | "lng">): string {
  if (stop.lat != null && stop.lng != null) {
    // ll pins the destination; q labels it with the stop name instead of raw
    // coordinates (Waze prefers ll when both are present).
    const label = stop.name ? `&q=${encodeURIComponent(stop.name)}` : "";
    return `https://waze.com/ul?ll=${stop.lat},${stop.lng}${label}&navigate=yes`;
  }
  return `https://waze.com/ul?q=${encodeURIComponent(stop.name)}&navigate=yes`;
}

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

export function openWaze(stop: Pick<Stop, "name" | "lat" | "lng">): void {
  window.open(wazeUrl(stop), "_blank", "noopener");
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
