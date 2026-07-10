const NUM = String.raw`-?\d+(?:\.\d+)?`;

function toLatLng(latStr: string, lngStr: string): { lat: number; lng: number } | null {
  const lat = Number(latStr);
  const lng = Number(lngStr);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return null;
  return { lat, lng };
}

/**
 * Parses a latitude/longitude pair out of a plain "lat, lng" string or a
 * handful of common Google Maps URL shapes. No network calls, no API key.
 * Returns null when nothing matches or the parsed values are out of range.
 */
export function parseLatLng(input: string): { lat: number; lng: number } | null {
  const text = input.trim();
  if (!text) return null;

  // A plain coordinate pair, e.g. "3.139, 101.6869".
  const plain = text.match(new RegExp(`^(${NUM})\\s*,\\s*(${NUM})$`));
  if (plain) return toLatLng(plain[1], plain[2]);

  // Google Maps map-center segment, e.g. "/@3.1390,101.6869,17z/".
  const at = text.match(new RegExp(`@(${NUM}),(${NUM}),`));
  if (at) return toLatLng(at[1], at[2]);

  // "q=", "query=", or "ll=" query params carrying a coordinate pair.
  const param = text.match(new RegExp(`[?&](?:q|query|ll)=(${NUM}),(${NUM})`));
  if (param) return toLatLng(param[1], param[2]);

  // Place-detail pin coordinates, e.g. "!3d3.139!4d101.6869".
  const bang = text.match(new RegExp(`!3d(${NUM})!4d(${NUM})`));
  if (bang) return toLatLng(bang[1], bang[2]);

  return null;
}
