import type { Expense, Itinerary, Photo, Stop, Venue } from "../lib/types";
import { DEMO_RECEIPT_ID } from "./demoReceipt";

/**
 * Seed data for local demo mode, matching the Sunny Planning design mockups.
 * Dates are anchored around July 2026 (the design's "next date" is Sat Jul 11).
 */

/**
 * Stops for some completed demo dates, keyed by itinerary id. Their cost fields
 * are planning-time estimates, deliberately different from the logged expenses
 * below so the est-vs-actual comparison shows up in the builder and date detail.
 */
const demoStops: Record<string, Stop[]> = {
  "it-night-market": [
    { id: "st-nm-stalls", name: "Pasar Malam Alley", time: "7:30 PM", note: "eat everything", cost: 45, venueId: "ve-pasar-malam" },
    { id: "st-nm-arcade", name: "Retro Arcade Corner", time: "9:00 PM", note: "air hockey rematch", cost: 20 },
  ],
  "it-lake-picnic": [
    { id: "st-lp-mart", name: "Picnic Mart", time: "10:00 AM", note: "sandwich supplies", cost: 25 },
    { id: "st-lp-lake", name: "Titiwangsa Lakeside", time: "11:00 AM", note: "the usual bench", cost: 0, venueId: "ve-lakeside" },
  ],
  "it-bookstore": [
    { id: "st-bk-books", name: "BookXcess", time: "2:00 PM", note: "one book each, we said", cost: 40, venueId: "ve-bookxcess" },
    { id: "st-bk-gelato", name: "Gelato Bar", time: "4:00 PM", note: "pistachio or nothing", cost: 20 },
  ],
  "it-roller-rink": [
    { id: "st-rr-rink", name: "Rollerwave Rink", time: "7:00 PM", note: "try not to fall", cost: 50, venueId: "ve-roller" },
    { id: "st-rr-diner", name: "Milkshake Diner", time: "9:00 PM", note: "post-skate sugar", cost: 20 },
  ],
  "it-pottery": [
    { id: "st-pt-studio", name: "Clay & Kiln Studio", time: "10:00 AM", note: "handles are hard", cost: 110 },
  ],
  "it-movie-night": [
    { id: "st-mv-drivein", name: "Moonlight Drive-in", time: "8:30 PM", note: "bring the big blanket", cost: 70, venueId: "ve-drivein" },
  ],
};

/**
 * Itemized spend for completed demo dates, keyed by itinerary id, each summing
 * exactly to that itinerary's legacy `actualTotal` so the mockup month totals
 * hold. Dates without an entry here keep `actualTotal` only, exercising the
 * legacy fallback path. The street food expense carries the seeded demo
 * receipt (see demoReceipt.ts).
 */
const demoExpenses: Record<string, Expense[]> = {
  "it-night-market": [
    { id: "ex-nm-food", label: "Street food", amount: 34, stopId: "st-nm-stalls", receiptId: DEMO_RECEIPT_ID, createdISO: "2026-07-07" },
    { id: "ex-nm-games", label: "Arcade games", amount: 16, stopId: "st-nm-arcade", createdISO: "2026-07-07" },
    { id: "ex-nm-parking", label: "Parking", amount: 24, createdISO: "2026-07-07" },
  ],
  "it-lake-picnic": [
    { id: "ex-lp-snacks", label: "Picnic snacks", amount: 28, stopId: "st-lp-mart", createdISO: "2026-07-06" },
    { id: "ex-lp-boat", label: "Swan boat ride", amount: 12, stopId: "st-lp-lake", createdISO: "2026-07-06" },
  ],
  "it-bookstore": [
    { id: "ex-bk-books", label: "Two paperbacks", amount: 34, stopId: "st-bk-books", createdISO: "2026-07-05" },
    { id: "ex-bk-gelato", label: "Gelato cups", amount: 18, stopId: "st-bk-gelato", createdISO: "2026-07-05" },
  ],
  "it-roller-rink": [
    { id: "ex-rr-entry", label: "Entry + skate rental", amount: 44, stopId: "st-rr-rink", createdISO: "2026-07-04" },
    { id: "ex-rr-shakes", label: "Milkshakes", amount: 16, stopId: "st-rr-diner", createdISO: "2026-07-04" },
    { id: "ex-rr-locker", label: "Locker", amount: 6, createdISO: "2026-07-04" },
  ],
  "it-claw-duel": [
    { id: "ex-cd-tokens", label: "Token refills", amount: 24, createdISO: "2026-07-03" },
    { id: "ex-cd-drinks", label: "Vending machine drinks", amount: 6, createdISO: "2026-07-03" },
  ],
  "it-pottery": [
    { id: "ex-pt-class", label: "Class for two", amount: 110, stopId: "st-pt-studio", createdISO: "2026-07-01" },
    { id: "ex-pt-glaze", label: "Extra glaze", amount: 10, createdISO: "2026-07-01" },
  ],
  "it-movie-night": [
    { id: "ex-mn-tickets", label: "Movie tickets", amount: 46, stopId: "st-mv-drivein", createdISO: "2026-06-24" },
    { id: "ex-mn-snacks", label: "Popcorn & drinks", amount: 24, stopId: "st-mv-drivein", createdISO: "2026-06-24" },
    { id: "ex-mn-parking", label: "Parking", amount: 18, createdISO: "2026-06-24" },
  ],
  "it-sushi": [
    { id: "ex-su-dinner", label: "Sushi dinner", amount: 108, createdISO: "2026-05-30" },
    { id: "ex-su-dessert", label: "Dessert", amount: 22, createdISO: "2026-05-30" },
    { id: "ex-su-parking", label: "Parking", amount: 10, createdISO: "2026-05-30" },
  ],
};

export const demoItineraries: Itinerary[] = [
  {
    id: "it-cafe-day",
    title: "Cafe day → arcade → ramen",
    dateISO: "2026-07-11",
    skin: "strawberry",
    status: "planned",
    stops: [
      {
        id: "st-kopi",
        name: "Kopi & Cream Cafe",
        time: "3:00 PM",
        note: "iced matcha & pastries",
        cost: 28,
        lat: 3.1478,
        lng: 101.7068,
        travelMinutesToNext: 12,
        travelModeToNext: "drive",
        venueId: "ve-kopi",
      },
      {
        id: "st-arcade",
        name: "Neon Alley Arcade",
        time: "4:00 PM",
        note: "claw machine rematch",
        cost: 45,
        lat: 3.139,
        lng: 101.6869,
        travelMinutesToNext: 8,
        travelModeToNext: "walk",
        venueId: "ve-arcade",
      },
      {
        id: "st-ramen",
        name: "Tanuki Ramen House",
        time: "6:30 PM",
        note: "the usual tonkotsu",
        cost: 96,
        lat: 3.158,
        lng: 101.7123,
        venueId: "ve-ramen",
      },
    ],
  },
  ...(
    [
      ["it-night-market", "Night market crawl", "2026-07-07", 74],
      ["it-lake-picnic", "Picnic at the lake", "2026-07-06", 40],
      ["it-bookstore", "Bookstore + gelato", "2026-07-05", 52],
      ["it-roller-rink", "Roller rink", "2026-07-04", 66],
      ["it-claw-duel", "Claw machine duel", "2026-07-03", 30],
      ["it-breakfast", "Breakfast run", "2026-07-02", 38],
      ["it-pottery", "Pottery class", "2026-07-01", 120],
      ["it-movie-night", "Movie night", "2026-06-24", 88],
      ["it-beach-picnic", "Beach picnic", "2026-06-14", 64],
      ["it-bubble-tea", "Bubble tea run", "2026-06-09", 22],
      ["it-sushi", "Sushi anniversary", "2026-05-30", 140],
      ["it-museum", "Art museum wander", "2026-05-17", 40],
      ["it-karaoke", "Karaoke night", "2026-05-09", 75],
      ["it-market", "Farmers market", "2026-05-02", 26],
    ] as const
  ).map(
    ([id, title, dateISO, actualTotal]): Itinerary => ({
      id,
      title,
      dateISO,
      skin: "strawberry",
      status: "completed",
      stops: demoStops[id] ?? [],
      actualTotal,
      expenses: demoExpenses[id],
    })
  ),
];

export const demoPhotos: Photo[] = [
  { id: "ph-arcade", caption: "arcade high score!!", dateISO: "2026-07-03", itineraryId: "it-claw-duel", author: "P", art: 0, rot: -3, tape: "lavender", dot: true },
  { id: "ph-matcha", caption: "matcha runs", dateISO: "2026-07-05", itineraryId: "it-bookstore", author: "Y", art: 1, rot: 2, tape: null },
  { id: "ph-sunset", caption: "sunset walk", dateISO: "2026-07-06", itineraryId: "it-lake-picnic", author: "Y", art: 2, rot: -2, tape: "pink" },
  { id: "ph-ramen", caption: "ramen date, round 2", dateISO: "2026-06-24", itineraryId: "it-movie-night", author: "P", art: 3, rot: 1.5, tape: null },
];

export const demoVenues: Venue[] = [
  {
    id: "ve-kopi",
    name: "Kopi & Cream Cafe",
    category: "Cafe",
    // Linked date (it-cafe-day) is still planned, so this rating predates it: legacy, no dateISO.
    ratings: [{ id: "vr-legacy-ve-kopi", rating: 5 }],
    fave: true,
    notes: [{ author: "Y", text: "always our first stop" }],
  },
  {
    id: "ve-arcade",
    name: "Neon Alley Arcade",
    category: "Arcade",
    ratings: [{ id: "vr-legacy-ve-arcade", rating: 3 }],
    fave: false,
    notes: [{ author: "P", text: "the claw machine is rigged lol" }],
  },
  {
    id: "ve-ramen",
    name: "Tanuki Ramen House",
    category: "Dinner",
    ratings: [{ id: "vr-legacy-ve-ramen", rating: 5 }],
    fave: true,
    notes: [{ author: "Y", text: "the tonkotsu, every single time" }],
  },
  {
    id: "ve-drivein",
    name: "Moonlight Drive-in",
    category: "Movie",
    ratings: [{ id: "vr-mn-drivein", rating: 3, itineraryId: "it-movie-night", stopId: "st-mv-drivein", dateISO: "2026-06-24" }],
    fave: false,
    notes: [{ author: "P", text: "good seats, loud crowd" }],
  },
  {
    id: "ve-pasar-malam",
    name: "Pasar Malam Alley",
    category: "Street food",
    ratings: [{ id: "vr-nm-stalls", rating: 5, itineraryId: "it-night-market", stopId: "st-nm-stalls", dateISO: "2026-07-07" }],
    fave: false,
    notes: [],
  },
  {
    id: "ve-roller",
    name: "Rollerwave Rink",
    category: "Activity",
    ratings: [{ id: "vr-rr-rink", rating: 4, itineraryId: "it-roller-rink", stopId: "st-rr-rink", dateISO: "2026-07-04" }],
    fave: false,
    notes: [],
  },
  {
    id: "ve-bookxcess",
    name: "BookXcess",
    category: "Books",
    ratings: [{ id: "vr-bk-books", rating: 5, itineraryId: "it-bookstore", stopId: "st-bk-books", dateISO: "2026-07-05" }],
    fave: false,
    notes: [],
  },
  {
    id: "ve-lakeside",
    name: "Titiwangsa Lakeside",
    category: "Outdoors",
    ratings: [{ id: "vr-lp-lake", rating: 4, itineraryId: "it-lake-picnic", stopId: "st-lp-lake", dateISO: "2026-07-06" }],
    fave: false,
    notes: [],
  },
];

export const demoInviteCode = "8fk2q";
