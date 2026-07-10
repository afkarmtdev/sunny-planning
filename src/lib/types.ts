export type TravelMode = "drive" | "walk";

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
};

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
};

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
};

export type Photo = {
  id: string;
  caption: string;
  dateISO: string;
  /** The date this photo belongs to. One itinerary can hold many photos. */
  itineraryId?: string;
  /** Optional: the specific stop within that date this photo belongs to. */
  stopId?: string;
  src?: string;
  art?: number;
  rot: number;
  tape?: "lavender" | "pink" | null;
  dot?: boolean;
};

export type PartnerId = "Y" | "P";

export type VenueNote = {
  author: PartnerId;
  text: string;
};

export type VenueRating = {
  id: string;
  rating: number; // 1-5 paws
  /** The visit this rating came from; absent for a manual rating from the card. */
  itineraryId?: string;
  stopId?: string;
  /** Day the rating applies to; absent only for legacy migrated ratings. */
  dateISO?: string;
};

export type Venue = {
  id: string;
  name: string;
  category: string;
  ratings: VenueRating[];
  fave: boolean;
  notes: VenueNote[];
};

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
