import type { Stop } from "./types";

export function wazeUrl(stop: Pick<Stop, "name" | "lat" | "lng">): string {
  if (stop.lat != null && stop.lng != null) {
    return `https://waze.com/ul?ll=${stop.lat},${stop.lng}&navigate=yes`;
  }
  return `https://waze.com/ul?q=${encodeURIComponent(stop.name)}&navigate=yes`;
}

export function openWaze(stop: Pick<Stop, "name" | "lat" | "lng">): void {
  window.open(wazeUrl(stop), "_blank", "noopener");
}
