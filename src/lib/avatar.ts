// The couple's avatar colors. Hex literals (not token vars) because they are
// stored on the profile and mirror space_members.color server-side; the same
// values appear in the token palette. Order is the swatch order in setup.
export const AVATAR_COLORS = [
  { name: "Heart pop", value: "#FF4D9D" },
  { name: "Bubblegum", value: "#FF8FC2" },
  { name: "Marmalade", value: "#FFA24C" },
  { name: "Lavender", value: "#CDB4F6" },
  { name: "Mint", value: "#6FD8A8" },
  { name: "Sky", value: "#7EC7F5" },
] as const;

export const DEFAULT_AVATAR_COLOR = AVATAR_COLORS[0].value;

/** First letter of a name, uppercased; a heart when the name is still blank. */
export function initialFor(name: string): string {
  const trimmed = name.trim();
  return trimmed ? trimmed[0].toUpperCase() : "";
}
