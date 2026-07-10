---
name: error-offline-states
description: The house standard for offline and unexpected-error UI in Sunny Planning. Use whenever adding a network-boundary action (login, sync) or an error/empty fallback, or when tempted to block the app while offline.
---

# Error and offline states

Sunny is local-first: the Zustand store lives in localStorage and every screen
keeps working with no network. Two consequences drive the standard:

## Offline is a notice, never a wall

Being offline is not a failure. Do NOT gate screens, show a full-screen "no
connection" takeover, or disable local actions when `navigator.onLine` is false.

- Read online state with `useOnline()` (`src/lib/useOnline.ts`), a
  `useSyncExternalStore` over the `online` / `offline` window events.
- The global signal is `src/components/OfflineBanner.tsx`: a slim non-blocking
  pill mounted app-wide in `App.tsx` (outside the router, next to
  `UpdatePrompt`). It auto shows/hides and reassures ("Changes save on this
  device.").
- Only guard the true network boundary: magic-link login and, later, Supabase
  sync. There, use `useOnline()` to disable just that button and explain, or
  render `<ErrorScreen>` with `expression="smitten"` and offline copy. Never
  block anything the local store can satisfy.

## Unexpected errors land on the themed ErrorScreen

`src/components/ErrorScreen.tsx` is the reusable full-page fallback: pure,
router-hook-free, actions via `window.location` so it works both inside and
outside the router. Reuse it (title / message / expression / action props) for
any unrecoverable full-page state; do not invent a new one.

Two boundaries feed it, both in `src/components/ErrorBoundary.tsx`:

- `RouteError` is the data router's `errorElement`, set on the pathless root
  route in `App.tsx`. It catches render/loader errors in any screen and special
  cases a 404 `Response` as a "wandered off" state.
- `AppErrorBoundary` is a class boundary wrapping `<Boot>` in `App.tsx`, the
  outermost net for render errors thrown outside the router (Boot, Splash).

Technical detail (`error.message`) is passed to `ErrorScreen` only under
`import.meta.env.DEV`, so production stays friendly. A real error sink lands
with the backend (Milestone 4).

## Rules that still apply

- No native browser UI: these are themed, never `window.confirm` / `alert`.
- No emojis, no em dashes in copy.
- Composed from the existing design language (SunnySprite, JellyButton, ink
  borders, hard shadows); not one of the nine design-doc screens.
