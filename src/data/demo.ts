import type { Expense, Itinerary, Photo, Venue } from "../lib/types";

/**
 * Seed data for local demo mode, matching the Sunny Planning design mockups.
 * Dates are anchored around July 2026 (the design's "next date" is Sat Jul 11).
 */

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
        travelMinutesToNext: 12,
        travelModeToNext: "drive",
      },
      {
        id: "st-arcade",
        name: "Neon Alley Arcade",
        time: "4:00 PM",
        note: "claw machine rematch",
        cost: 45,
        travelMinutesToNext: 8,
        travelModeToNext: "walk",
      },
      {
        id: "st-ramen",
        name: "Tanuki Ramen House",
        time: "6:30 PM",
        note: "the usual tonkotsu",
        cost: 96,
      },
    ],
  },
  ...(
    [
      ["it-night-market", "Night market crawl", "2026-07-07"],
      ["it-lake-picnic", "Picnic at the lake", "2026-07-06"],
      ["it-bookstore", "Bookstore + gelato", "2026-07-05"],
      ["it-roller-rink", "Roller rink", "2026-07-04"],
      ["it-claw-duel", "Claw machine duel", "2026-07-03"],
      ["it-breakfast", "Breakfast run", "2026-07-02"],
      ["it-pottery", "Pottery class", "2026-07-01"],
      ["it-movie-night", "Movie night", "2026-06-24"],
      ["it-beach-picnic", "Beach picnic", "2026-06-14"],
      ["it-bubble-tea", "Bubble tea run", "2026-06-09"],
      ["it-sushi", "Sushi anniversary", "2026-05-30"],
      ["it-museum", "Art museum wander", "2026-05-17"],
      ["it-karaoke", "Karaoke night", "2026-05-09"],
      ["it-market", "Farmers market", "2026-05-02"],
    ] as const
  ).map(
    ([id, title, dateISO]): Itinerary => ({
      id,
      title,
      dateISO,
      skin: "strawberry",
      status: "completed",
      stops: [],
    })
  ),
];

export const demoExpenses: Expense[] = [
  { id: "ex-night-market", label: "Night market crawl", dateISO: "2026-07-07", amount: 74, itineraryId: "it-night-market" },
  { id: "ex-lake-picnic", label: "Picnic at the lake", dateISO: "2026-07-06", amount: 40, itineraryId: "it-lake-picnic" },
  { id: "ex-bookstore", label: "Bookstore + gelato", dateISO: "2026-07-05", amount: 52, itineraryId: "it-bookstore" },
  { id: "ex-roller-rink", label: "Roller rink", dateISO: "2026-07-04", amount: 66, itineraryId: "it-roller-rink" },
  { id: "ex-claw-duel", label: "Claw machine duel", dateISO: "2026-07-03", amount: 30, itineraryId: "it-claw-duel" },
  { id: "ex-breakfast", label: "Breakfast run", dateISO: "2026-07-02", amount: 38, itineraryId: "it-breakfast" },
  { id: "ex-pottery", label: "Pottery class", dateISO: "2026-07-01", amount: 120, itineraryId: "it-pottery" },
  { id: "ex-movie-night", label: "Movie night", dateISO: "2026-06-24", amount: 88, itineraryId: "it-movie-night" },
  { id: "ex-beach-picnic", label: "Beach picnic", dateISO: "2026-06-14", amount: 64, itineraryId: "it-beach-picnic" },
  { id: "ex-bubble-tea", label: "Bubble tea run", dateISO: "2026-06-09", amount: 22, itineraryId: "it-bubble-tea" },
  { id: "ex-sushi", label: "Sushi anniversary", dateISO: "2026-05-30", amount: 140, itineraryId: "it-sushi" },
  { id: "ex-museum", label: "Art museum wander", dateISO: "2026-05-17", amount: 40, itineraryId: "it-museum" },
  { id: "ex-karaoke", label: "Karaoke night", dateISO: "2026-05-09", amount: 75, itineraryId: "it-karaoke" },
  { id: "ex-market", label: "Farmers market", dateISO: "2026-05-02", amount: 26, itineraryId: "it-market" },
];

export const demoPhotos: Photo[] = [
  { id: "ph-arcade", caption: "arcade high score!!", dateISO: "2026-07-03", art: 0, rot: -3, tape: "lavender", dot: true },
  { id: "ph-matcha", caption: "matcha runs", dateISO: "2026-07-05", art: 1, rot: 2, tape: null },
  { id: "ph-sunset", caption: "sunset walk", dateISO: "2026-07-06", art: 2, rot: -2, tape: "pink" },
  { id: "ph-ramen", caption: "ramen date, round 2", dateISO: "2026-06-24", art: 3, rot: 1.5, tape: null },
];

export const demoVenues: Venue[] = [
  {
    id: "ve-kopi",
    name: "Kopi & Cream Cafe",
    category: "Cafe",
    rating: 5,
    fave: true,
    notes: [{ author: "Y", text: "always our first stop" }],
  },
  {
    id: "ve-arcade",
    name: "Neon Alley Arcade",
    category: "Arcade",
    rating: 3,
    fave: false,
    notes: [{ author: "P", text: "the claw machine is rigged lol" }],
  },
  {
    id: "ve-ramen",
    name: "Tanuki Ramen House",
    category: "Dinner",
    rating: 5,
    fave: true,
    notes: [{ author: "Y", text: "the tonkotsu, every single time" }],
  },
  {
    id: "ve-drivein",
    name: "Moonlight Drive-in",
    category: "Movie",
    rating: 3,
    fave: false,
    notes: [{ author: "P", text: "good seats, loud crowd" }],
  },
];

export const demoInviteCode = "8fk2q";
