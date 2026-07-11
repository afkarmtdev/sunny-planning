---
name: maps-deep-links
description: How Sunny Planning links out to Waze and Google Maps and parses pasted location text into coordinates. Use whenever touching stop locations, navigation buttons, src/lib/nav.ts, or src/lib/geo.ts.
---

# Maps deep links and location parsing

## Architecture

- `src/lib/nav.ts` is the ONE module for external navigation links (Waze and
  Google Maps universal links). Do not scatter `waze.com/ul` or
  `google.com/maps` URL building elsewhere; add new providers (e.g. Apple Maps)
  here.
- `src/lib/geo.ts` parses pasted location text into `{ lat, lng }` with no
  network calls and no API key. Stops store only the extracted coordinates
  (`Stop.lat` / `Stop.lng`); the pasted link itself is discarded.
- Flow: user pastes a Google Maps URL or "lat, lng" into the stop sheet
  (`ItineraryBuilder`), `parseLatLng` extracts coordinates, save rounds them to
  6 decimals, and the Waze / Google Maps buttons rebuild fresh deep links from
  those coordinates. Coordinates are the interchange format between apps.

## Gotchas (each cost real debugging or correctness)

- **Pin vs viewport**: a Google Maps place URL carries both `!3d<lat>!4d<lng>`
  (the actual pin) and `@lat,lng,zoom` (the viewport center, wrong if the user
  panned before copying). `parseLatLng` must try `!3d!4d` BEFORE `@`. Keep that
  order.
- **Short links cannot work client-side**: `maps.app.goo.gl` / `goo.gl/maps`
  links (the mobile share sheet default) are opaque redirects with no
  coordinates in the URL, and the browser cannot follow the redirect (CORS).
  `isMapsShortLink` detects them so the stop sheet can show the "open it and
  paste the full URL" hint instead of failing silently. Resolving them for real
  needs a server hop (e.g. a Supabase Edge Function); demo mode would still
  need the hint.
- **Waze has no origin**: Waze deep links always navigate from the current
  position; only Google (`googleDirectionsUrl`) can do stop-to-stop directions.
  Do not add a Waze directions button.
- **Label the Waze pin**: pass both `ll=` and `q=<name>` so Waze shows the stop
  name instead of raw coordinates (`ll` wins for the destination position).
- **Parse feedback**: the stop sheet shows a hint under the location field for
  all three states (parsed = "Pinned", short link, unparseable). If parsing
  fails on save, the previously saved coordinates are kept; do not silently
  drop or overwrite them.
