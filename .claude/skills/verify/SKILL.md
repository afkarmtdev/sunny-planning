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
VITE_SUPABASE_URL= VITE_SUPABASE_PUBLISHABLE_KEY= VITE_SUPABASE_ANON_KEY= bun run dev
```

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
navigation bounces to `/welcome`. Walk it generically: focus the first visible
empty text input (it has no `type` attribute, so do not select on
`input[type='text']`), type a name, then repeatedly click the first enabled
button labeled "Just me for now" / "Skip for now" / "Next" until the URL leaves
`/welcome`. Then navigate where you need.

## Gotchas that cost real time

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

## Flows worth driving

- Settings -> profile card (the element containing "Birthday:" text) opens the
  ProfileSheet; hidden file input lives inside it.
- Avatar crop: upload -> "Frame your photo" sheet -> `.reactEasyCrop_Container`
  appears -> "Use photo" enables once react-easy-crop reports the initial crop.
- Persistence: "Save profile", reload, assert the data URL survives
  (localStorage key `sunny-planning-v1`).
