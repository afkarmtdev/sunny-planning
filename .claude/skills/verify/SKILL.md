---
name: verify
description: How to drive Sunny Planning in a real browser to verify a change end-to-end - demo-mode dev server, puppeteer-core against system Edge, the onboarding walk, and the gotchas that cost time. Use whenever verifying UI changes at runtime or automating the app in a browser.
---

# Verifying Sunny Planning in a running browser

## Launch the app in demo mode (no login gate)

`.env.local` configures Supabase, which gates the app behind magic-link auth.
Blank the vars in the process env to force demo mode; actual env vars beat
`.env.local` in Vite:

```bash
export VITE_SUPABASE_URL=""; export VITE_SUPABASE_PUBLISHABLE_KEY=""; export VITE_SUPABASE_ANON_KEY=""; bun run dev
```

Use the `export` form, not inline `VAR= cmd` prefixes: through the background
task runner the inline assignments have failed to reach Vite and the app came
up in auth mode (magic-link login instead of onboarding). If the driven page
shows "Send me a magic link", that is what happened; kill the server (find the
PID via `Get-NetTCPConnection -LocalPort <port> -State Listen`) and relaunch.

Even the `export` form has failed to reach Vite through the background runner.
The deterministic fallback: write `.env.development.local` in the repo root
with the three vars blank (`VITE_SUPABASE_URL=` etc.). It outranks `.env.local`
in Vite's env-file precedence, so demo mode is guaranteed regardless of process
env. Delete the file when done, or the user's own dev server silently loses
auth mode on its next restart. Confirm which mode the server is in before
driving it: `curl http://localhost:<port>/src/lib/supabase.ts` and check the
inlined `"VITE_SUPABASE_URL"` value in `import.meta.env`.

Run it in the background and read the startup output for the port: 5173 is
often taken (a parallel dev server) and Vite silently moves to 5180 or similar.

## Drive it with puppeteer-core + system Edge

No Playwright and no bundled browsers here. Install `puppeteer-core` in the
session scratchpad (not the repo; still pick a version at least 10 days old)
and launch the installed Edge:

```js
import puppeteer from "puppeteer-core";
const browser = await puppeteer.launch({
  executablePath: "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  headless: "new",
});
```

Use forward slashes in the path; backslashes get eaten by shell escaping in
inline `bun -e` scripts. Viewport 430x900 matches the mobile design.

## First run always lands on onboarding

Each headless launch has a fresh profile, so localStorage is empty and any
navigation bounces to `/welcome` (after the splash redirect race above). The
wizard is four fixed steps, so walk it deterministically: wait for the name
input (it has no `type` attribute, so do not select on `input[type='text']`),
click it and type a name, then click "Next" (to birthday), "Skip for now" (to
color), "Next" (to the partner fork), "Just me for now" (finishes, navigates
to `/`). Leave ~500ms between clicks and confirm arrival with
`waitForFunction(() => location.pathname === "/")`, then assert the persisted
profile in localStorage (`sunny-planning-v1` -> `state.profile.onboarded`)
before trusting later screens.

## Gotchas that cost real time

- **Boot splash redirect race**: after `page.goto`, the app renders the Splash
  screen at `/` for a moment before `RequireOnboarded` redirects to `/welcome`.
  A loop gated on `page.url().includes("/welcome")` exits immediately having
  done nothing, and later navigations silently bounce back to onboarding. Wait
  for the redirect first (`page.waitForFunction(() => location.pathname ===
  "/welcome")`), and after any goto wait for a concrete selector (e.g.
  `button[aria-label*="Invite"]` on Home) instead of asserting right away.
- **Sheet enter animation**: `Sheet` slides up over 0.28s. Measuring
  `boundingBox()` right after the open condition returns coordinates below the
  viewport and real mouse events land on nothing (elementFromPoint returns
  null). Wait ~500ms after a sheet opens before any coordinate-based input.
- **Synthetic vs real input**: `el.click()` in `page.evaluate` bypasses
  hit-testing and works for buttons, but gesture surfaces (the avatar cropper)
  need real `page.mouse` events at correct coordinates.
- **File pickers**: never `.click()` the upload button (opens a native chooser
  that hangs headless). Grab the hidden `input[type=file]` and call
  `uploadFile(path)` directly; it fires the change event.
- **Fabricating test images**: no canvas in Bun. Open `about:blank`, draw on a
  canvas in `page.evaluate`, `toDataURL`, base64-decode, write to disk. A
  half-red half-blue image makes crop/pan effects assertable by sampling
  pixels of the output data URL (again via an in-page canvas).
- **Verifying avatar output**: the profile avatar is a `data:image/jpeg` URL on
  an `img`; find it by `src.startsWith("data:image/jpeg")`.

## Forcing the ErrorScreen (to verify error UI)

Corrupting `sunny-planning-v1` in localStorage and reloading does not work:
`migrate` (persist version 8) repairs old payloads, nulling `prefs` also
crashes `AppErrorBoundary` itself (it reads `prefs.locale`), and nulling
`itineraries` hangs the boot splash because the redirect logic runs in an
effect, which no boundary catches. What works: after the app is up, corrupt
the live store in memory through Vite's module graph, which is the same module
instance the app uses, then the next render throws inside the boundary:

```js
await page.evaluate(async () => {
  const m = await import("/src/store/useApp.ts");
  m.useApp.setState({ itineraries: null });
});
```

Leave `prefs` intact so the boundary and the ErrorScreen's own `useT()` work.

## Flows worth driving

- Settings -> profile card (the element containing "Birthday:" text) opens the
  ProfileSheet; hidden file input lives inside it.
- Avatar crop: upload -> "Frame your photo" sheet -> `.reactEasyCrop_Container`
  appears -> "Use photo" enables once react-easy-crop reports the initial crop.
- Persistence: "Save profile", reload, assert the data URL survives
  (localStorage key `sunny-planning-v1`).
