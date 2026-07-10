import { album } from "./album";
import { auth } from "./auth";
import { builder } from "./builder";
import { common } from "./common";
import { costs } from "./costs";
import { dayplan } from "./dayplan";
import { exportMsgs } from "./export";
import { home } from "./home";
import { ratings } from "./ratings";
import { settings } from "./settings";
import { ui } from "./ui";

/**
 * The full message catalogue: every area dictionary merged into one object so
 * `keyof typeof messages` is the union of all keys. Add a new area file, then
 * spread it here.
 */
export const messages = {
  ...common,
  ...ui,
  ...home,
  ...settings,
  ...album,
  ...auth,
  ...builder,
  ...costs,
  ...dayplan,
  ...exportMsgs,
  ...ratings,
} as const;
