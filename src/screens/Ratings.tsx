import * as stylex from "@stylexjs/stylex";
import { useState } from "react";
import { colors, fonts } from "../theme/tokens.stylex";
import { Screen } from "../components/Screen";
import { Card } from "../components/Card";
import { FaveBadge } from "../components/FaveBadge";
import { PawRating } from "../components/PawRating";
import { JellyButton } from "../components/JellyButton";
import { Sheet } from "../components/Sheet";
import { Field, TextInput } from "../components/Field";
import { useApp } from "../store/useApp";
import type { PartnerId } from "../lib/types";

const styles = stylex.create({
  title: {
    fontFamily: fonts.display,
    fontWeight: 800,
    fontSize: 24,
    color: colors.ink,
  },
  venueCard: {
    borderRadius: 18,
    padding: 14,
  },
  name: {
    fontFamily: fonts.display,
    fontWeight: 700,
    fontSize: 16,
    color: colors.ink,
  },
  category: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.ink,
    opacity: 0.55,
    marginBottom: 8,
  },
  paws: {
    marginBottom: 8,
  },
  noteRow: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    marginTop: 4,
  },
  avatar: {
    width: 18,
    height: 18,
    borderRadius: "50%",
    borderWidth: 2,
    borderStyle: "solid",
    borderColor: colors.ink,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    fontFamily: fonts.display,
    fontWeight: 700,
    fontSize: 9,
    color: colors.ink,
  },
  avatarY: { backgroundColor: colors.bubblegum },
  avatarP: { backgroundColor: colors.lavender },
  noteText: {
    fontFamily: fonts.hand,
    fontSize: 14,
    color: colors.ink,
    opacity: 0.75,
  },
  addNote: {
    fontFamily: fonts.hand,
    fontSize: 13,
    color: colors.heartPop,
    marginTop: 6,
    cursor: "pointer",
  },
  authorRow: {
    display: "flex",
    gap: 8,
  },
  authorChip: {
    flex: 1,
    textAlign: "center",
    fontFamily: fonts.display,
    fontWeight: 700,
    fontSize: 13,
    color: colors.ink,
    backgroundColor: colors.white,
    borderWidth: 2,
    borderStyle: "solid",
    borderColor: colors.ink,
    borderRadius: 999,
    paddingBlock: 8,
    cursor: "pointer",
    opacity: 0.5,
  },
  authorChipOnY: { backgroundColor: colors.bubblegum, opacity: 1 },
  authorChipOnP: { backgroundColor: colors.lavender, opacity: 1 },
});

export function Ratings() {
  const venues = useApp((s) => s.venues);
  const { setVenueRating, toggleFave, addVenueNote } = useApp();
  const [noteFor, setNoteFor] = useState<string | null>(null);
  const [author, setAuthor] = useState<PartnerId>("Y");
  const [text, setText] = useState("");

  const saveNote = () => {
    if (noteFor && text.trim()) {
      addVenueNote(noteFor, { author, text: text.trim() });
    }
    setNoteFor(null);
    setText("");
  };

  return (
    <Screen gap={14}>
      <div {...stylex.props(styles.title)}>Venue Ratings</div>

      {venues.map((venue) => (
        <Card key={venue.id} xstyle={styles.venueCard}>
          <FaveBadge fave={venue.fave} onToggle={() => toggleFave(venue.id)} />
          <div {...stylex.props(styles.name)}>{venue.name}</div>
          <div {...stylex.props(styles.category)}>{venue.category}</div>
          <div {...stylex.props(styles.paws)}>
            <PawRating value={venue.rating} onChange={(r) => setVenueRating(venue.id, r)} />
          </div>
          {venue.notes.map((note, i) => (
            <div key={i} {...stylex.props(styles.noteRow)}>
              <div {...stylex.props(styles.avatar, note.author === "Y" ? styles.avatarY : styles.avatarP)}>
                {note.author}
              </div>
              <div {...stylex.props(styles.noteText)}>"{note.text}"</div>
            </div>
          ))}
          <div
            {...stylex.props(styles.addNote)}
            onClick={() => {
              setNoteFor(venue.id);
              setText("");
            }}
          >
            + add a note
          </div>
        </Card>
      ))}

      <Sheet open={noteFor !== null} onClose={() => setNoteFor(null)} title="Add a note">
        <Field label="Who is writing?">
          <div {...stylex.props(styles.authorRow)}>
            {(["Y", "P"] as const).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setAuthor(p)}
                {...stylex.props(
                  styles.authorChip,
                  author === p && (p === "Y" ? styles.authorChipOnY : styles.authorChipOnP)
                )}
              >
                {p}
              </button>
            ))}
          </div>
        </Field>
        <Field label="Note">
          <TextInput
            value={text}
            placeholder="always our first stop"
            onChange={(e) => setText(e.target.value)}
          />
        </Field>
        <JellyButton variant="primary" onClick={saveNote}>
          Save note
        </JellyButton>
      </Sheet>
    </Screen>
  );
}
