import * as stylex from "@stylexjs/stylex";
import { useEffect, useState } from "react";
import { colors, fonts } from "../theme/tokens.stylex";
import { Sheet } from "./Sheet";
import { Field, TextInput } from "./Field";
import { PawRating } from "./PawRating";
import { JellyButton } from "./JellyButton";
import { ConfirmDialog } from "./ConfirmDialog";
import { useApp } from "../store/useApp";
import type { Venue } from "../lib/types";

const styles = stylex.create({
  context: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.ink,
    opacity: 0.55,
    textAlign: "center",
    marginTop: -6,
  },
  pawRow: {
    display: "flex",
    justifyContent: "center",
    paddingBlock: 10,
  },
  chipRow: {
    display: "flex",
    gap: 6,
    flexWrap: "wrap",
    marginBottom: 8,
  },
  chip: {
    fontFamily: fonts.body,
    fontWeight: 700,
    fontSize: 12,
    color: colors.ink,
    backgroundColor: colors.white,
    borderWidth: 2,
    borderStyle: "solid",
    borderColor: colors.ink,
    borderRadius: 999,
    paddingBlock: 6,
    paddingInline: 12,
    cursor: "pointer",
    opacity: 0.6,
  },
  chipOn: {
    backgroundColor: colors.lcdMint,
    opacity: 1,
  },
});

export type VenueEditTarget = {
  venue: Venue;
  /** When present, the rating ties to this visit; otherwise it is a manual rating. */
  visit?: { itineraryId: string; stopId?: string; dateISO: string; label?: string };
  /** The rating currently on record for this context, staged as the starting value. */
  value: number;
};

type Props = {
  /** What is being edited; null closes the sheet. */
  target: VenueEditTarget | null;
  onClose: () => void;
};

/**
 * The one edit surface for a venue: paw rating and tag staged together behind
 * an explicit Save; closing with unsaved changes prompts to discard. Nothing
 * touches the store until Save.
 */
export function VenueEditSheet({ target, onClose }: Props) {
  const venues = useApp((s) => s.venues);
  const rateVenue = useApp((s) => s.rateVenue);
  const setVenueCategory = useApp((s) => s.setVenueCategory);
  // Keep the last target while the sheet slides out so content does not blank mid-exit.
  const [current, setCurrent] = useState<VenueEditTarget | null>(target);
  const [stagedRating, setStagedRating] = useState(0);
  const [picked, setPicked] = useState("");
  const [typed, setTyped] = useState("");
  const [confirmDiscard, setConfirmDiscard] = useState(false);

  useEffect(() => {
    if (target) {
      setCurrent(target);
      setStagedRating(target.value);
      setPicked(target.venue.category);
      setTyped("");
      setConfirmDiscard(false);
    }
  }, [target]);

  const categories = Array.from(new Set(venues.map((v) => v.category))).sort((a, b) =>
    a.localeCompare(b)
  );

  // A typed tag wins over a chip pick; empty text falls back to the pick.
  const stagedTag = typed.trim() !== "" ? typed.trim() : picked;
  const ratingDirty = current != null && stagedRating !== current.value;
  const tagDirty = current != null && stagedTag !== current.venue.category;
  const isDirty = ratingDirty || tagDirty;

  const save = () => {
    if (current) {
      if (ratingDirty) {
        const { itineraryId, stopId, dateISO } = current.visit ?? {};
        rateVenue(
          current.venue.id,
          stagedRating,
          itineraryId && dateISO ? { itineraryId, stopId, dateISO } : undefined
        );
      }
      if (tagDirty) setVenueCategory(current.venue.id, stagedTag);
    }
    onClose();
  };

  const requestClose = () => {
    if (isDirty) setConfirmDiscard(true);
    else onClose();
  };

  return (
    <>
      <Sheet
        open={target !== null}
        onClose={requestClose}
        title={current ? `Edit ${current.venue.name}` : undefined}
      >
        {current && (
          <>
            {current.visit?.label && (
              <div {...stylex.props(styles.context)}>{current.visit.label}</div>
            )}
            <div {...stylex.props(styles.pawRow)}>
              <PawRating value={stagedRating} onChange={setStagedRating} size={34} />
            </div>
            <Field label="Tag">
              <div {...stylex.props(styles.chipRow)}>
                {categories.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => {
                      setPicked(c);
                      setTyped("");
                    }}
                    {...stylex.props(styles.chip, c === stagedTag && styles.chipOn)}
                  >
                    {c}
                  </button>
                ))}
              </div>
              <TextInput
                value={typed}
                placeholder="Or make a new tag"
                onChange={(e) => setTyped(e.target.value)}
              />
            </Field>
            <JellyButton variant="primary" onClick={save}>
              {isDirty ? "Save changes" : "Done"}
            </JellyButton>
          </>
        )}
      </Sheet>

      <ConfirmDialog
        open={confirmDiscard}
        title="Discard changes?"
        message={
          current ? `Your unsaved edits to ${current.venue.name} will be lost.` : ""
        }
        confirmLabel="Discard"
        cancelLabel="Keep editing"
        tone="danger"
        onConfirm={() => {
          setConfirmDiscard(false);
          onClose();
        }}
        onClose={() => setConfirmDiscard(false)}
      />
    </>
  );
}
