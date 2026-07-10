---
name: audit-trail
description: The house standard for stamping created/updated/deleted audit fields on stored records in Sunny Planning. Use whenever adding a new store entity or a new create/update/delete action, or when wiring soft-deletion.
---

# Audit trail (created / updated / deleted)

Every stored record carries an audit trail. Two mixin types in
`src/lib/types.ts` define it:

- `Audit` = `createdAt?`, `createdBy?`, `updatedAt?`, `updatedBy?`
- `SoftDelete` = `deletedAt?`, `deletedBy?`

Both are intersected onto the record type (`... } & Audit` or `& Audit & SoftDelete`).
All fields are optional so pre-audit demo and persisted rows still typecheck.

## Timestamps now, actor later

Timestamps (`createdAt` / `updatedAt` / `deletedAt`) are ISO datetimes from
`nowISO()` in `src/lib/dates.ts` and are stamped on every write **now**. The
`*By` fields (`createdBy` / `updatedBy` / `deletedBy`) are the acting member's
id and stay **unset** until auth lands (Milestone 4) and there is a session to
read the actor from. Do not invent an actor; leave `*By` undefined until the
sync layer supplies `auth.uid()`. See [[photo-note-author-auth-followup]].

## How to stamp in the store

`src/store/useApp.ts` has two helpers:

- `createdAudit()` -> `{ createdAt, updatedAt }` (same timestamp) for creates.
- `touchedAudit()` -> `{ updatedAt }` for updates.

Rules:

- On create, spread `...createdAudit()` into the new record.
- On update, spread `...touchedAudit()` into the changed record.
- `patchItinerary` auto-bumps the itinerary's `updatedAt` centrally, so any
  patch (own fields, a stop, or an expense) touches the parent. Nested records
  (stops, expenses, ratings, notes) still stamp their own audit on top.
- System cleanups (e.g. `purgeDeletedExpenses`) must **not** bump `updatedAt`;
  build the new object directly rather than through `patchItinerary`.

## Soft-deletion

Soft-delete sets `deletedAt` (via `nowISO()`) instead of removing the row, and
keeps any linked blob (e.g. a receipt) until a later hard purge. Pattern, using
expenses as the reference:

- `removeExpense` sets `deletedAt` and bumps `updatedAt`; it does not delete the
  receipt.
- `restoreExpense` clears `deletedAt` / `deletedBy` and bumps `updatedAt`.
- `purgeDeletedExpenses` hard-removes rows whose `deletedAt` is older than
  `RECENTLY_DELETED_DAYS` (30) and only then deletes their receipts. It runs on
  app load from the `Boot` gate in `src/App.tsx`, after store hydration.
- `derive.ts` must exclude soft-deleted rows from every total: `activeExpenses`
  filters them, and `expensesTotal` / `hasActuals` build on it. `deletedExpenses`
  lists them (newest-deleted first) for a "Recently deleted" restore UI.

## Persist migration

Adding audit fields is additive (optional), but bump the persist `version` and
backfill `createdAt` / `updatedAt` best-effort from the date a record already
carried (itinerary/stop from `dateISO`, expense from `createdISO`, rating from
its `dateISO`), so existing users' history is not blank. `*By` stays unset.

## Supabase schema

`supabase/schema.sql` mirrors this: every content table has `created_at`,
`created_by`, `updated_at`, `updated_by`, `deleted_at`, `deleted_by` (the `*By`
columns reference `auth.users`), plus a `set_updated_at` trigger per table that
keeps `updated_at` fresh on update. Keep the local model and schema in step.
