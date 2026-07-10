import { common } from "./common";
import { settings } from "./settings";

/**
 * The full message catalogue: every area dictionary merged into one object so
 * `keyof typeof messages` is the union of all keys. Add a new area file, then
 * spread it here.
 */
export const messages = {
  ...common,
  ...settings,
} as const;
