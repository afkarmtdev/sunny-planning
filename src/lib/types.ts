export type TravelMode = "drive" | "walk";

/**
 * Audit trail carried by every stored record. Timestamps are ISO datetimes,
 * stamped on every write now. createdBy / updatedBy are the acting member's id
 * and stay unset until auth lands (Milestone 4) and there is a session to read
 * the actor from; the fields exist now so sync carries them without a later
 * migration. All optional so pre-audit demo and persisted rows still typecheck;
 * new writes always set the timestamps.
 */
export type Audit = {
  createdAt?: string;
  createdBy?: string;
  updatedAt?: string;
  updatedBy?: string;
};

/** Soft-deletion marker; deletedBy fills in with auth, like Audit's *By. */
export type SoftDelete = {
  deletedAt?: string;
  deletedBy?: string;
};

export type Stop = {
  id: string;
  name: string;
  time: string;
  note: string;
  /** Estimated cost at planning time, RM. 0 means no estimate. */
  cost: number;
  lat?: number;
  lng?: number;
  travelMinutesToNext?: number;
  travelModeToNext?: TravelMode;
  venueId?: string;
} & Audit;

export type SkinId = "strawberry" | "retro" | "scrapbook" | "loveletter";

export type Expense = {
  id: string;
  label: string;
  amount: number;
  /** Stop this spend belongs to, when it maps to one. */
  stopId?: string;
  /** Receipt image in the IndexedDB receipt store. */
  receiptId?: string;
  createdISO: string;
} & Audit & SoftDelete;

export type Itinerary = {
  id: string;
  title: string;
  dateISO: string;
  stops: Stop[];
  skin: SkinId;
  status: "planned" | "completed" | "cancelled";
  /** True for a freshly created date that has not been saved yet. */
  draft?: boolean;
  /** Logged real spend for this date. */
  expenses?: Expense[];
  /**
   * Legacy fallback: spend frozen when the date completed, before itemized
   * expenses existed. Superseded by `expenses` when any are logged.
   */
  actualTotal?: number;
} & Audit;

export type Photo = {
  id: string;
  caption: string;
  dateISO: string;
  /** The date this photo belongs to. One itinerary can hold many photos. */
  itineraryId?: string;
  /** Optional: the specific stop within that date this photo belongs to. */
  stopId?: string;
  /** Which partner uploaded this photo; absent for legacy photos. */
  author?: PartnerId;
  src?: string;
  art?: number;
  rot: number;
  tape?: "lavender" | "pink" | null;
  dot?: boolean;
} & Audit;

export type PartnerId = "Y" | "P";

/**
 * The local user's identity. Mirrors what `space_members` stores server-side
 * (a display initial and a color) so it slots straight into the synced profile
 * in Milestone 4. `birthdayISO` drives the birthday special; `onboarded` gates
 * the first-time setup wizard. Local-first for now: no auth reads this yet.
 */
export type Profile = {
  displayName: string;
  /** Single letter shown in the avatar chip; derived from the name at setup. */
  initial: string;
  /** Avatar color, a hex from `AVATAR_COLORS`, matching space_members.color. */
  color: string;
  /** Birthday as YYYY-MM-DD; only month and day matter for the celebration. */
  birthdayISO?: string;
  /** Uploaded profile photo as a data URL; shown on the avatar chip when set. */
  avatarUrl?: string;
  /** True once first-time setup is done, so the wizard never shows again. */
  onboarded: boolean;
};

export type VenueNote = {
  /** Stable id for sync; optional only for legacy notes written before ids. */
  id?: string;
  /**
   * Legacy manual author (Y/P); superseded by the audit `createdBy` member id,
   * which drives the author chip. Only demo and pre-auth notes still carry it.
   */
  author?: PartnerId;
  text: string;
} & Audit;

/**
 * A member of the current space, mirrored from `space_members` for the author
 * chip: the acting member's id resolves to their initial and color. Populated by
 * sync only; empty in demo mode, so a chip attributed to no known member (or any
 * pre-auth record) simply renders nothing.
 */
export type Member = {
  userId: string;
  displayName: string;
  /** Single-letter avatar glyph, from `space_members.display_initial`. */
  initial: string;
  /** Avatar color hex, from `space_members.color`. */
  color: string;
  /** Uploaded profile photo (data URL), from `space_members.avatar_url`. */
  avatarUrl?: string;
  /** Last presence timestamp; backs partner online / last seen (feature 11). */
  lastSeen?: string;
};

export type VenueRating = {
  id: string;
  rating: number; // 1-5 paws
  /** The visit this rating came from; absent for a manual rating from the card. */
  itineraryId?: string;
  stopId?: string;
  /** Day the rating applies to; absent only for legacy migrated ratings. */
  dateISO?: string;
} & Audit;

export type Venue = {
  id: string;
  name: string;
  category: string;
  ratings: VenueRating[];
  fave: boolean;
  notes: VenueNote[];
} & Audit;

export const SKIN_NAMES: Record<SkinId, string> = {
  strawberry: "Strawberry Milk",
  retro: "Retro LCD",
  scrapbook: "Scrapbook",
  loveletter: "Love Letter",
};

export const SKIN_SUBTITLES: Record<SkinId, string> = {
  strawberry: "pink gingham",
  retro: "pixel mint",
  scrapbook: "kraft + stickers",
  loveletter: "lace + stamps",
};
