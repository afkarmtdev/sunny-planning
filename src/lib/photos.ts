import type { Photo } from "./types";

const ROTS = [-3, 2, -2, 1.5];
const TAPES: Photo["tape"][] = ["lavender", null, "pink", null];

/** Deterministic sticker rhythm for the nth photo added, matching the Album layout. */
export function photoDecoration(n: number): Pick<Photo, "rot" | "tape" | "dot"> {
  return {
    rot: ROTS[n % ROTS.length],
    tape: TAPES[n % TAPES.length],
    dot: n % 5 === 0,
  };
}
