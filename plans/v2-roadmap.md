# Sunny Planning v2 roadmap

Nineteen features, grouped into four milestones ordered easiest to hardest. Numbers
in parentheses are the feature numbers from the original request; 19 is the loading
states added alongside the splash screen.

## What already exists (changes the difficulty math)

- `supabase/schema.sql` already models the coop world: spaces, space_members
  (with display_initial and color), invites with codes, plus RLS policies. It has
  never been wired to the UI; screens read and write only the local Zustand store.
- `src/screens/Login.tsx`, `Invite.tsx`, and `AcceptInvite.tsx` exist. Login already
  sends real magic links when `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` are set,
  and passes everyone through in demo mode.
- The loading and splash design export is extracted at
  `design/extracted/loading-splash/loading-splash.html` (three screens: 00 Splash,
  00b Loading full screen, 00c Loading as overlay, each with FUNCTIONALITY NOTES).
  The hopping Sunny sprite is `assets/39270210-....png` in that folder and belongs
  in `src/assets/sunny/` with a descriptive name; the `lg-hop` keyframe is defined
  in the template.
- `SwipeRow.tsx` exists, which is the natural gesture for soft-deleting expenses.

## Milestone 1: Juice and polish (easy, local only, no backend)

Each of these is roughly a day or less, independently shippable, in any order.

### Sound effects (12) and touch feedback (13)

**Status (2026-07-10): DONE (infrastructure), sound wiring in progress.** `src/lib/sfx.ts`
synthesizes chiptune blips over WebAudio and pairs `navigator.vibrate`, both gated on a
new `prefs` slice (`soundOn` / `hapticsOn`, default on) in `useApp.ts`. Wired into
JellyButton (press) and StickerTabBar (nav tap). The nav tap voice is "Pop", a sine
glide, chosen from an audition page that drafts five candidates per interaction. Still
to wire: the remaining per-scenario picks (toggle, save, delete are new voices; press and
date-completed swap) once finalized, and their trigger points in the store actions. The
on/off toggles surface in the Settings screen (Milestone 2).

One `src/lib/sfx.ts` module that synthesizes chiptune blips with WebAudio (no audio
assets, no dependencies, no licensing). Pair each sound with `navigator.vibrate`
micro-haptics on devices that support it; the existing `:active` press states in
StyleX already give the visual half. Hook into JellyButton and StickerTabBar. Both
get on/off toggles that land in the preferences slice (see Settings below).

### App version (14)

**Status (2026-07-10): DONE (plumbing).** `__APP_VERSION__` is injected by a `define`
in `vite.config.ts` from package.json (declared in `src/env.d.ts`, needed `resolveJsonModule`
in `tsconfig.json`). The Settings display lands with the Settings screen (Milestone 2).

Expose the `package.json` version at build time via `define` in `vite.config.ts`
(`__APP_VERSION__`). Displayed in Settings. Careful: `vite.config.ts` also hosts the
fragile StyleX pipeline; the change is additive only.

### Splash screen (16) and loading states (19)

**Status (2026-07-10): DONE.** `src/screens/Splash.tsx` (hopping Sunny, `hop.png` ported
to `src/assets/sunny/`) and a reusable `src/components/LoadingOverlay.tsx` (fullscreen +
overlay modes, staggered dots, fade-in delay, inline error + retry, cancel), both built
from the loading-splash spec. A `Boot` gate in `App.tsx` shows the splash while the store
hydrates and fonts load (with a hard timeout ceiling), then reveals the router; it also
runs `purgeDeletedExpenses` on load. First consumer wired: the "packing up your PDF..."
overlay in `PrintView.tsx`. The auth-aware splash routing and timeout-to-Login only fully
activate with Supabase (Milestone 4), as planned.

Both are fully designed in `design/extracted/loading-splash/loading-splash.html`;
implement from that spec, do not invent.

Splash (screen 00): shown on cold launch while the Zustand persist rehydrates, fonts
load, and (once configured) the auth session and space data are fetched. Sunny hops
in an idle loop (the `lg-hop` keyframe from the template, ported to StyleX
`stylex.keyframes`). Routing on finish per the spec: Home if a session exists, Login
if not, Invite Partner for a paired-but-uninvited account. Hard timeout of 4 to 6
seconds that falls through to Login with an error state instead of hanging offline.

Loading (screens 00b and 00c): one reusable `<LoadingOverlay>` component with two
modes, full screen and overlay. Spec highlights to honor:

- Overlay mode sits on top of the current screen: blur and dim the frozen content
  behind a translucent cream scrim, block taps until the request resolves.
- Three dots hop with staggered `animation-delay`, not in sync.
- Caption is a prop, contextual per operation: "fetching your next date...",
  "saving your itinerary...", "packing up your PDF...".
- Fade-in delay of roughly 150 to 250ms so sub-300ms operations never flash it;
  skip it entirely for instant local actions.
- On failure, swap to an inline error state with retry, never an endless hop; a
  cancel affordance for long operations like PDF export.

Build the component now (it has immediate consumers: PDF export, photo and receipt
IndexedDB reads); it becomes the standard wait state for every Supabase fetch and
mutation in Milestone 4, and the splash timeout-to-Login behavior also only fully
activates then.

### Soft-deleted transactions (9)

**Status (2026-07-10): DONE.** `deletedAt` on the expense type; delete now soft-deletes
(recoverable) via `removeExpense`, `derive.ts` excludes deleted rows from every total
(`activeExpenses`), the Costs screen gained a "Recently deleted" section with restore
(`restoreExpense`), and `purgeDeletedExpenses` hard-purges rows deleted over 30 days ago
on app load (receipts kept until purge). The Supabase `deleted_at` / `deleted_by` columns
landed with the audit trail below.

Add `deletedAt?: string` to the expense type. Swipe-to-delete sets it instead of
removing the row (with the existing SwipeRow plus ConfirmDialog `tone="danger"`).
`derive.ts` filters deleted rows out of every total. Costs screen gains a
"Recently deleted" section with restore; hard-purge after 30 days on app load.
Mirror later in Supabase as a `deleted_at timestamptz` column so sync carries it.

## Milestone 2: Identity, settings, onboarding (medium)

### General settings screen (10, 10.1, 10.2, 14)

New route plus tab-bar or Home entry point. Settings is NOT one of the nine screens
in the design doc, so it must be composed from the existing design language (sticker
cards, ink borders, Sunny in the corner) rather than invented freestyle. Contents:
profile summary, preferences, app version, reset demo data, logout.

Preferences (10.2) must include, as a hard requirement:

- Sound effects on/off (controls every blip from 12)
- Touch feedback on/off (controls the haptics from 13)
- Language picker (10.3)

The sound and haptics toggles read and write the same preferences slice that
`sfx.ts` checks (built in Milestone 1), so the toggles are wiring, not new plumbing.
Both default to on. Logout (10.1) is `supabase.auth.signOut()` when configured, and clears
the session flag back to Login in demo mode.

### User profile (1)

Display name, avatar (initial plus color, matching what `space_members` already
stores), and birthday. Lives in a new store slice, local-first; becomes the synced
profile in Milestone 4. Feeds the birthday special and first-time setup.

### First-time setup (17) and coop-optional (8)

Onboarding wizard on first launch or first login: your name, your birthday, pick
your color, then a fork: "invite your partner" (existing Invite screen) or
"just me for now". That fork is the whole UX of feature 8; the architectural half
of 8 lives in Milestone 4 (every user gets a space of one, partner is just a second
member, so nothing else in the app cares whether you are solo).

### Birthday special (4)

Depends on profile birthdays. On a member's birthday: Home takeover with a party
Sunny sprite and banner, confetti on first open, and a suggested birthday itinerary
one week before (a planned itinerary pre-filled with the date). Small feature,
disproportionate delight.

### Multi-language: en / zh / zh with pinyin tone numbers (10.3)

Mechanical but wide. A tiny homegrown i18n module (a `t()` over three locale
dictionaries, stored preference, no library needed) plus extracting every string
from all screens, which is the bulk of the work. The zh-with-pinyin locale renders
Chinese with tone-numbered pinyin annotations (ni3 hao3) as a third dictionary.
Hidden hard part: Baloo 2, Nunito, Gaegu, and Silkscreen are Latin-only, so a
CJK-capable display and body font pairing must be added and woven into the tokens.

### Today's itinerary, in-app reminder (18, first half)

On app open, if an itinerary is planned for today, show a Sunny speech-bubble banner
on Home linking to Day-of mode. Easy and works everywhere. The real system
notification is Milestone 3 because it needs a service worker.

## Milestone 3: PWA and release plumbing (medium, needs a deploy story)

The app must actually be deployed somewhere for these to mean anything.

### Pull to refresh (5)

A touch-gesture component at the scroll root: Sunny gets pulled down on a spring and
does a little animation on release. Suppress the browser's native reload gesture
with `overscroll-behavior-y: contain`. In local mode the refresh is cosmetic
(re-derive, replay animation); after Milestone 4 it refetches from Supabase. Build
it now so the gesture and animation are ready.

### Update ping (6) and update popup (15)

One feature. Add `vite-plugin-pwa` (through the add-dep skill, 10-day rule): the
service worker polls for a new deployed build, and when one is waiting we show a
themed prompt (ConfirmDialog styling, never a native dialog): "Sunny learned new
tricks. Update now?" Accepting calls `skipWaiting` and reloads. The app version from
Milestone 1 appears in the prompt.

### Today's itinerary, system notification (18, second half)

With the service worker in place, request Notification permission from Settings
(never on first load), and fire a local notification for today's itinerary when the
app or SW wakes. True scheduled push while the app is closed requires a push server
(Supabase Edge Function plus Web Push keys); defer that unless it proves necessary,
since the in-app banner plus this covers most real usage.

## Milestone 4: The coop epic (hard)

Everything here is one project: making the existing Supabase schema real.

### Coop session / live sync (2)

The centerpiece and the most expensive item on the list. Work:

1. A sync layer between the Zustand store and Supabase: initial fetch into the store
   on login, optimistic local writes pushed to Postgres, Supabase Realtime
   subscriptions applying the partner's changes back into the store.
2. ID strategy: store already uses string ids; standardize on uuid so local and
   server rows are the same shape.
3. Photos and receipts move from IndexedDB blobs to Supabase Storage buckets
   (schema already has `storage_path` / `receipt_path` columns waiting).
4. Migration path: option to upload existing local demo data into a fresh space.
5. Demo mode (no env vars) must keep working exactly as today; the sync layer is
   a no-op behind `isSupabaseConfigured`.

Last-write-wins per row is acceptable conflict handling for a two-person app.

### Solo spaces (8, architectural half)

Decided inside the sync design, not built separately: signup creates a space of one,
accepting an invite joins you to the inviter's space. Costs nothing if decided
up front, expensive to retrofit.

### Login page as a real gate (3)

The screen exists and works. Remaining: polish per the design doc, magic-link error
and expired states, and the RequireAuth wrapper becoming a real gate in configured
mode, which it already is; feature 3 is mostly done once first-time setup hooks in.

### Created by / updated by (7)

**Status (2026-07-10): audit trail landed early (data model + schema); UI chip still
pending sync.** Every stored record now carries an `Audit` mixin (`createdAt` / `createdBy`
/ `updatedAt` / `updatedBy`) and expenses also carry `SoftDelete` (`deletedAt` /
`deletedBy`), defined in `src/lib/types.ts`. Timestamps are stamped live in `useApp.ts`
(`createdAudit` / `touchedAudit`, with `patchItinerary` auto-bumping `updatedAt`); all the
`*By` fields stay unset until auth supplies the acting member. The persist store bumped to
v5 with a best-effort backfill. `supabase/schema.sql` mirrors the columns (the `*By`
columns reference `auth.users`) with a `set_updated_at` trigger per table. Convention
captured in the `audit-trail` skill. What remains for feature 7 proper: populate the `*By`
fields from `auth.uid()` in the sync layer, and the author-chip UI.

Schema migration: `created_by uuid` and `updated_by uuid` columns plus a trigger to
stamp them. UI: a tiny author chip (partner's initial in their color) on
itineraries, expenses, photos, and venue notes. Trivial after sync exists,
meaningless before it, hence its position despite being conceptually simple.

### Partner online / last seen (11)

Supabase Realtime Presence on a per-space channel: a dot or heart next to the
partner's initial on Home, "last seen" persisted to `space_members` on disconnect.
A day of work once sync exists.

## Difficulty summary

| Tier | Features |
| --- | --- |
| Easy | sounds (12), haptics (13), app version (14), splash (16), loading states (19), soft delete (9) |
| Medium | settings + logout + prefs (10), profile (1), first-time setup (17), birthday (4), in-app reminder (18a), pull to refresh (5) |
| Medium, needs deploy | update ping + popup (6, 15), system notification (18b), i18n (10.3) |
| Hard | coop sync (2), solo spaces (8), login gate (3), created/updated by (7), presence (11) |

i18n is rated up a tier not for logic but for surface area: every screen changes and
CJK fonts touch the token system.

## Dependency graph, short version

- 4 and 17 depend on 1 (profile birthdays and identity).
- 10.1 logout is trivial now, real after Milestone 4.
- 6 and 15 are one feature; both depend on being deployed as a PWA.
- 18b depends on the Milestone 3 service worker.
- 7 and 11 depend entirely on 2; do not attempt before sync.
- 8 is a design decision inside 2 plus one onboarding fork in 17.
- 5 is buildable now, becomes meaningful after 2.
- 19 (loading overlay) has immediate consumers (PDF export, photo and receipt
  reads) but becomes ubiquitous after 2; the splash routing and timeout logic in
  16 also only fully activates with real auth.

## Hard project rules (from CLAUDE.md, apply to every milestone)

- No native browser UI: ConfirmDialog and Calendar only; the update prompt (15) and
  notification permission ask (18) must be themed, never `window.confirm`.
- No emojis, no em dashes in any copy, comments, or commits.
- New dependencies (vite-plugin-pwa is the only one foreseen) go through the
  add-dep skill with the 10-day minimum release age.
- StyleX: tokens only from `tokens.stylex.ts`, top-level `stylex.create`, hex
  literals in shadows; keep `vite.config.ts` and `babel.config.cjs` in sync.
- Check `design/extracted/sunny-planning.html` before inventing UI for new screens.
