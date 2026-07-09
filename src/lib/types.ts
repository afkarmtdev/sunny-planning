export type TravelMode = "drive" | "walk";

export type Stop = {
  id: string;
  name: string;
  time: string;
  note: string;
  cost: number;
  lat?: number;
  lng?: number;
  travelMinutesToNext?: number;
  travelModeToNext?: TravelMode;
};

export type SkinId = "strawberry" | "retro" | "scrapbook" | "loveletter";

export type Itinerary = {
  id: string;
  title: string;
  dateISO: string;
  stops: Stop[];
  skin: SkinId;
  status: "planned" | "completed";
};

export type Expense = {
  id: string;
  label: string;
  dateISO: string;
  amount: number;
  itineraryId?: string;
  receiptUrl?: string;
};

export type Photo = {
  id: string;
  caption: string;
  dateISO: string;
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

export type Venue = {
  id: string;
  name: string;
  category: string;
  rating: number;
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
