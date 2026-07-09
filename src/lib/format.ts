/** "RM 169" */
export function rm(amount: number): string {
  return `RM ${Math.round(amount)}`;
}

/** "RM420" for tight stat tiles */
export function rmCompact(amount: number): string {
  return `RM${Math.round(amount)}`;
}

/** 12 -> "12:00" LCD travel readout, undefined -> "--:--" */
export function travelReadout(minutes: number | undefined): string {
  if (minutes == null) return "--:--";
  return `${String(Math.round(minutes)).padStart(2, "0")}:00`;
}
