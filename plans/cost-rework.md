# Cost module rework: estimates, expense log, receipts

## Problem

Today `Stop.cost` is a single number entered at planning time, and completing a date just
freezes that planned total into `Itinerary.actualTotal` (`useApp.ts` `advanceDay` /
`completeItinerary`). There is no way to say "I do not know yet what this will cost", no way
to record what was actually spent, and no way to store receipts. The design doc's Cost
Tracker FUNCTIONALITY NOTES (design/extracted/sunny-planning.html around line 2385) already
call for a per-date detail with itemized costs and receipts attached to a specific date.

## Decisions (confirmed with the user)

1. **Cost model**: per-stop `cost` becomes an *optional estimate*. Actual spend is a list of
   expense line items logged on the itinerary (label, amount, optional stop link, optional
   receipt). Actual total = sum of logged expenses; falls back to the estimate until anything
   is logged.
2. **Capture flows**: all three of (a) Day-of quick-add while the date is live, (b) a
   completion wrap-up on the Day-of complete card, (c) a date-detail view opened from the
   Costs screen, editable any time.
3. **Receipt storage**: IndexedDB blobs via a new small lib; the Zustand store keeps only
   receipt ids. Do NOT put receipt images in localStorage.

## Hard project rules (from CLAUDE.md, do not violate)

- No native browser dialogs or `<input type="date">`. Use `src/components/ConfirmDialog.tsx`
  (`tone="danger"` for destructive) and `src/components/Calendar.tsx`.
- No emojis, no em dashes anywhere (copy, comments, commit messages).
- Currency through `rm()` from `src/lib/format.ts`.
- StyleX: tokens only from `src/theme/tokens.stylex.ts`; `stylex.create` at module top level;
  dynamic values via function styles; components take `xstyle?: StyleXStyles`; box shadows
  use hex literals. Do not touch `vite.config.ts` / `babel.config.cjs`.
- All scripts via bun: `bun run typecheck`, `bun run dev`. No new dependencies are needed;
  if one somehow becomes necessary, it must go through the `add-dep` skill (10-day rule).
- Commit messages carry no Co-Authored-By trailer. Do not commit unless asked.

## Step 1: types (`src/lib/types.ts`)

- Keep the field name `Stop.cost` (avoids migrating persisted stop data) but change its JSDoc
  to "Estimated cost at planning time, RM. 0 means no estimate."
- Add:

```ts
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
```

- `Itinerary` gains `expenses?: Expense[]`. Keep `actualTotal?: number` as a legacy fallback
  for dates completed before this change; update its JSDoc to say so.

## Step 2: receipt store (`src/lib/receipts.ts`, new)

IndexedDB database `sunny-receipts`, version 1, one object store `receipts` (key = string id).
No new dependency; use raw IndexedDB wrapped in promises.

- `saveReceipt(file: File): Promise<string>` - generate an id, downscale with canvas to max
  dimension 1600 and encode JPEG quality 0.85 via `canvas.toBlob` (receipts must stay
  legible; follow the shape of `src/lib/images.ts` but output a Blob, not a data URL), store
  the blob, return the id. If canvas fails, store the original file blob as-is.
- `getReceiptBlob(id: string): Promise<Blob | null>`.
- `deleteReceipt(id: string): Promise<void>` (swallow errors; best effort).
- React hook `useReceiptUrl(id?: string): string | null` - loads the blob, creates an object
  URL, revokes it on unmount or id change. Put it in the same file or `src/lib/useReceiptUrl.ts`.
- Everything must no-op gracefully when `indexedDB` is unavailable (return null / resolve).

## Step 3: store (`src/store/useApp.ts`)

- New actions:
  - `addExpense(itineraryId: string, expense: Omit<Expense, "id" | "createdISO">): void`
    (stamp `createdISO` with `todayISO()`, id via existing `uid()` pattern `ex-` prefix).
  - `updateExpense(itineraryId: string, expenseId: string, patch: Partial<Omit<Expense, "id">>): void`
  - `removeExpense(itineraryId: string, expenseId: string): void` - also fire-and-forget
    `deleteReceipt` if the expense had a `receiptId`.
- `deleteItinerary` additionally fire-and-forgets `deleteReceipt` for every expense receipt
  on the deleted itinerary.
- Completion behavior (`advanceDay` final stop and `completeItinerary`): keep freezing
  `actualTotal` exactly as today. It is only a fallback now; expenses override it in derive.
  `reopenItinerary` / `cancelItinerary` / `resetDay` keep clearing `actualTotal` and must NOT
  clear `expenses` (logged real spend survives a reopen).
- Persist migration: bump `version` to 3. Migrate: keep the existing v2 migration logic, and
  additionally default `expenses` to `[]` on every itinerary. Guard all reads with
  `it.expenses ?? []` anyway.

## Step 4: derive (`src/lib/derive.ts`)

- `itineraryTotal(it)` unchanged (sum of stop estimates). Rename NOT needed; update the doc
  comment to "Planned estimate: sum of stop costs."
- Add `expensesTotal(it: Itinerary): number` (sum of `it.expenses ?? []`).
- Add `hasActuals(it: Itinerary): boolean` (`(it.expenses ?? []).length > 0`).
- Rewrite `dateSpend(it)`: expenses total when `hasActuals`, else `actualTotal`, else the
  estimate. Update its doc comment.
- `completedDates` rows gain `isEstimate: boolean` (true when the amount fell back to an
  estimate, i.e. no expenses and no actualTotal) so the Costs screen can show `~`.

## Step 5: Itinerary builder (`src/screens/ItineraryBuilder.tsx`)

- Stop editor field label "Cost (RM)" becomes "Est. cost (RM)" with the existing input.
- Stop row cost display becomes `~RM x` (prefix `~`) when the itinerary is not completed;
  hide when 0.
- The LCD total panel (around line 652): label "EST. TOTAL" while planned/cancelled. When
  completed, show the actual (`dateSpend`) and, if it differs from the estimate, a small
  secondary line "est. ~RMx" in the existing panel typography.
- Do not build expense editing here; the Costs date detail covers it. Optional: when
  completed, a small "View spend" JellyButton that navigates to `/costs?date=<id>` is NOT
  required; skip to keep scope tight.

## Step 6: expense editor sheet (`src/components/ExpenseSheet.tsx`, new)

One reusable sheet used by Day-of and the Costs date detail. Follow the existing `Sheet`
component and the stop-editor sheet in ItineraryBuilder for structure and styling.

- Props: `open`, `onClose`, `itinerary: Itinerary`, `expense?: Expense` (edit vs add),
  `defaultStopId?: string`.
- Fields: label (text, defaults to the linked stop's name when a stop is chosen and label is
  empty), amount (numeric text input, same pattern as the cost field: `inputMode="decimal"`,
  parse with `Number(x) || 0`), stop link (chip row of the itinerary's stops, tap to toggle,
  none selected = general spend), receipt (UploadDropzone, `accept="image/*"`, single file;
  on file: `saveReceipt`, keep the id in local state; show a thumbnail via `useReceiptUrl`
  with a "Remove receipt" action that deletes the blob).
- Save calls `addExpense` / `updateExpense`. If an edit replaces an existing receipt, delete
  the old blob. Cancel/close of a NEW expense that already uploaded a receipt must delete
  the orphaned blob.
- Delete action only in edit mode, behind `ConfirmDialog` with `tone="danger"`.

## Step 7: Day-of (`src/screens/DayOf.tsx`)

- Live card: under the Waze/Google Maps pills, add a "Log a spend" pill (same `wazePill`
  styling family) opening `ExpenseSheet` with `defaultStopId` = current stop id.
- Complete card: replace the static "Logged to your cost tracker" subtitle with a compact
  wrap-up block: "Spent RMx" (expenses total when any, else "est. ~RMy"), a short list of
  logged expense labels+amounts (max 3, then "and N more"), and a "+ Log a spend" button
  opening the same sheet (no default stop). Keep the photo dropzone, Rate and Start again
  buttons exactly as they are.

## Step 8: Costs screen (`src/screens/Costs.tsx`) and date detail

- Rows in "Dates this month" become buttons; amount shows `~` prefix when `isEstimate`.
- Tapping opens a date-detail `Sheet` (new component `src/components/DateSpendSheet.tsx` or
  inline in Costs.tsx if under ~200 lines): header (title, `shortDate`), an est vs actual
  pair (LCD panel styling like the builder total), itemized expense rows (label, linked stop
  name if any, amount, receipt thumbnail when present), "+ Add expense" opening
  `ExpenseSheet`, tap a row to edit in `ExpenseSheet`.
- Receipt thumbnail tap opens a full-size viewer: a minimal overlay modeled on
  `PhotoLightbox.tsx` (`ReceiptLightbox`, image `object-fit: contain`, close button). Do not
  reuse PhotoLightbox directly; it is Photo-specific.
- The detail must work for completed dates primarily, but do not crash for planned ones.

## Step 9: other read sites

- `src/screens/Home.tsx` line ~210 and `src/screens/PlanList.tsx` line ~269 already show
  `~` prefixed estimates for planned dates; switch them to the updated derive helpers so a
  completed date with expenses shows the real spend without `~` (PlanList already branches
  on completed; just make sure it uses `dateSpend` and drops `~` only when not an estimate).
- `src/print/PrintView.tsx` (~line 328): total label becomes "Est. total" and per-stop costs
  keep `~`. Print is a plan artifact, so estimates are correct there; do not print expenses.

## Step 10: demo data (`src/data/demo.ts`)

- Give two or three of the completed demo itineraries an `expenses` array whose sum equals
  their existing `actualTotal` (2 to 4 items each, labels matching their stops, one item per
  linked stop plus one general item like "Parking"). No receipt ids in demo data.
- Leave the rest with `actualTotal` only, exercising the legacy fallback path.

## Verification

1. `bun run typecheck` passes.
2. Use the run-app skill: builder shows "Est. cost", `~` totals; Day-of live date can log a
   spend with a receipt; completing shows the wrap-up; Costs rows open the detail, expenses
   are editable, receipt thumbnail opens the lightbox and survives a page reload (IndexedDB);
   deleting an expense removes it and its receipt; month totals use actuals when present.
3. Clear localStorage key `sunny-planning-v1` and confirm demo seed renders itemized details.
4. Confirm no `window.confirm/alert/prompt` and no `<input type="date">` were introduced.

## Out of scope

- Supabase sync of expenses/receipts (server sync is a known open work item overall).
- OCR or amount extraction from receipts.
- Budgets or warnings when spend exceeds estimate.
