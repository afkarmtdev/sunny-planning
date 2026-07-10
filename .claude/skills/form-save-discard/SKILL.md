---
name: form-save-discard
description: The house standard for editable screens and forms in Sunny Planning - stage edits behind an explicit Save, prompt to discard on exit, and lock read-only states. Use whenever building or changing a screen that edits store data (itineraries, stops, expenses, photos, profile, settings).
---

# Save + discard standard for forms

Every screen that edits persisted data must feel transactional to the user, even
though the Zustand store writes to localStorage immediately. That means three
things, always together:

1. A visible **Save** action that commits the edits (clears the dirty state).
2. A **discard prompt** on any attempt to leave with unsaved edits, which reverts
   the data to the last saved state.
3. Read-only (locked) states that **hide edit affordances** rather than letting a
   user edit something they should not; they reopen to edit.

The reference implementation is `src/screens/ItineraryBuilder.tsx`. Copy its shape
rather than inventing a new one.

## Why a snapshot, not a staging buffer

The store persists on every write, so "unsaved" is a UI concept layered on top of
immediate persistence. We do not stage edits in component state (that would mean
mirroring every sheet and handler). Instead we keep a **baseline snapshot** of the
last saved state and:

- derive `isDirty` by comparing current store references against the baseline,
- **Save** = re-snapshot the current state (dirty clears, nothing else to write),
- **Discard** = write the baseline back into the store (a real revert).

Known limitation to state honestly when relevant: because writes persist live, a
reload in the middle of editing keeps the edits (they read as saved). The prompt
protects against in-app navigation within a session, not tab close or refresh. Do
not add a `beforeunload` native dialog for this (see the no-native-UI rule).

## The pattern, concretely

### 1. Baseline snapshot

Store the last-saved state and re-baseline at every commit point (opening the
record, and any status/lifecycle flip). Store updates are immutable, so reference
inequality means edited.

```ts
const [baseline, setBaseline] = useState<{ record: T; photos: Photo[] } | null>(null);
useEffect(() => {
  const st = useApp.getState();
  const rec = st.records.find((x) => x.id === id);
  setBaseline(rec ? { record: rec, photos: st.photos } : null);
}, [id, record?.status, record?.draft]); // commit points, not every keystroke

const isDirty =
  !!record &&
  record.status === "editable" &&
  baseline != null &&
  (record !== baseline.record || photos !== baseline.photos);
```

Snapshot every slice the form can mutate (here the record plus the global photos
array). Reverting the whole photos array is safe because only this screen edits
photos while it is mounted.

### 2. Save and revert helpers

```ts
const rebaseline = () => {
  const st = useApp.getState();
  const rec = st.records.find((x) => x.id === id);
  if (rec) setBaseline({ record: rec, photos: st.photos });
};
const saveChanges = () => rebaseline();

const revertToBaseline = () => {
  if (!baseline) return;
  useApp.setState((s) => ({
    records: s.records.map((x) => (x.id === id ? baseline.record : x)),
    photos: baseline.photos,
  }));
};
```

### 3. Guard every exit with useBlocker

`src/App.tsx` uses a data router (`createBrowserRouter`) specifically so screens
can call `useBlocker`. It intercepts the back button, the bottom tab bar, and
programmatic `navigate` alike.

```ts
const bypassBlockRef = useRef(false); // for exits we drive on purpose (e.g. delete)
const blocker = useBlocker(({ nextLocation }) => {
  if (bypassBlockRef.current) return false;
  if (!(isDirty || record?.draft === true)) return false;
  if (id && nextLocation.pathname === `/plan/${id}/export`) return false; // sub-flow, keep edits
  return true;
});
```

Render the themed confirm (never `window.confirm`) when blocked, and drive the
blocker from it:

```tsx
<ConfirmDialog
  open={blocker.state === "blocked"}
  title={isDraft ? "Leave without saving?" : "Discard changes?"}
  message={isDraft ? "This new date has not been saved yet and will be discarded."
                   : "Your unsaved changes to this date will be lost."}
  confirmLabel="Discard"
  cancelLabel="Keep editing"
  tone="danger"
  onConfirm={() => {
    if (isDraft) deleteRecord(id);   // a never-saved draft is discarded by deleting it
    else revertToBaseline();
    blocker.proceed?.();
  }}
  onClose={() => blocker.reset?.()}
/>
```

For a deliberate exit that must not prompt (delete, or any navigation you trigger
while dirty), set `bypassBlockRef.current = true` immediately before
`deleteRecord` / `navigate`, or the stale render closure will block your own
navigation.

### 4. Footer button reflects state

- Draft (never saved): **Save this date** (saveRecord + rebaseline).
- Saved + dirty: **Save changes** (rebaseline). Hide the terminal action until saved.
- Saved + clean: the terminal action (e.g. Mark as complete).
- Locked: **Reopen to edit / plan**.

### 5. Locked states are read-only

When a record is completed/cancelled (or otherwise locked), do not render add or
edit affordances: hide upload dropzones and "add" buttons, pass `undefined` to
per-item edit callbacks (`onCaption`, `onTagStop`, row `onClick`), and require the
user to reopen. Never show an edit control that no-ops or silently discards.

## Checklist for a new form

- [ ] Baseline snapshot taken on mount and re-taken on every save / status flip.
- [ ] `isDirty` derived from store reference inequality, scoped to the editable status.
- [ ] Save action re-baselines; terminal action hidden while dirty.
- [ ] `useBlocker` guards back button, tabs, and programmatic navigation.
- [ ] Discard reverts via `useApp.setState`, not just a warning.
- [ ] Themed `ConfirmDialog` (`tone="danger"`), never a native dialog.
- [ ] `bypassBlockRef` set before intentional dirty-state exits (delete, etc.).
- [ ] Locked state hides all edit affordances; reopen to edit.
