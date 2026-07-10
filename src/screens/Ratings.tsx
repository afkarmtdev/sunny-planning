import * as stylex from "@stylexjs/stylex";
import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { colors, fonts } from "../theme/tokens.stylex";
import { Screen } from "../components/Screen";
import { Card } from "../components/Card";
import { FaveBadge } from "../components/FaveBadge";
import { PawRating } from "../components/PawRating";
import { JellyButton } from "../components/JellyButton";
import { Sheet } from "../components/Sheet";
import { Field, TextInput } from "../components/Field";
import { VenueDetailSheet } from "../components/VenueDetailSheet";
import { VenueEditSheet, type VenueEditTarget } from "../components/VenueEditSheet";
import { AuthorChip } from "../components/AuthorChip";
import { IconPencil } from "../components/icons";
import { useApp } from "../store/useApp";
import { latestRating, venueVisits } from "../lib/derive";
import { shortDate } from "../lib/dates";
import type { Venue } from "../lib/types";

const PAGE_SIZE = 8;

const styles = stylex.create({
  title: {
    fontFamily: fonts.display,
    fontWeight: 800,
    fontSize: 24,
    color: colors.ink,
  },
  chipRow: {
    display: "flex",
    gap: 8,
    flexWrap: "wrap",
  },
  chip: {
    textAlign: "center",
    fontFamily: fonts.display,
    fontWeight: 700,
    fontSize: 12,
    color: colors.ink,
    backgroundColor: colors.white,
    borderWidth: 2,
    borderStyle: "solid",
    borderColor: colors.ink,
    borderRadius: 999,
    paddingBlock: 8,
    paddingInline: 14,
    cursor: "pointer",
    opacity: 0.55,
  },
  chipOn: {
    backgroundColor: colors.lcdMint,
    opacity: 1,
  },
  showMore: {
    borderWidth: 3,
    borderStyle: "dashed",
    borderColor: colors.ink,
    opacity: 0.45,
    borderRadius: 16,
    padding: 14,
    textAlign: "center",
    fontFamily: fonts.display,
    fontWeight: 700,
    fontSize: 13,
    color: colors.ink,
    width: "100%",
    cursor: "pointer",
  },
  emptyCard: {
    borderWidth: 3,
    borderStyle: "dashed",
    borderColor: colors.ink,
    opacity: 0.6,
    borderRadius: 16,
    padding: 18,
    textAlign: "center",
    fontFamily: fonts.display,
    fontWeight: 700,
    fontSize: 14,
    color: colors.ink,
  },
  venueCard: {
    borderRadius: 18,
    padding: 14,
    cursor: "pointer",
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
  },
  lastVisited: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.ink,
    opacity: 0.5,
    marginBottom: 8,
  },
  paws: {
    marginTop: 8,
    marginBottom: 8,
  },
  noteRow: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    marginTop: 4,
  },
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
  pawEditRow: {
    display: "flex",
    alignItems: "center",
    gap: 6,
  },
  pencilBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 4,
    color: colors.ink,
    opacity: 0.55,
    cursor: "pointer",
    backgroundColor: "transparent",
    borderWidth: 0,
  },
  banner: {
    borderRadius: 18,
    padding: 14,
  },
  bannerTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  bannerTitle: {
    fontFamily: fonts.display,
    fontWeight: 700,
    fontSize: 15,
    color: colors.ink,
  },
  bannerDismiss: {
    fontFamily: fonts.body,
    fontWeight: 700,
    fontSize: 11,
    color: colors.ink,
    opacity: 0.55,
    cursor: "pointer",
    flexShrink: 0,
  },
  bannerRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    backgroundColor: colors.white,
    borderWidth: 2,
    borderStyle: "solid",
    borderColor: colors.ink,
    borderRadius: 14,
    paddingBlock: 8,
    paddingInline: 12,
    marginTop: 10,
  },
  bannerName: {
    fontFamily: fonts.display,
    fontWeight: 700,
    fontSize: 13,
    color: colors.ink,
  },
  bannerTag: {
    display: "inline-flex",
    alignItems: "center",
    fontFamily: fonts.body,
    fontWeight: 700,
    fontSize: 10,
    color: colors.ink,
    backgroundColor: colors.cream,
    borderWidth: 2,
    borderStyle: "solid",
    borderColor: colors.ink,
    borderRadius: 999,
    paddingBlock: 2,
    paddingInline: 8,
    marginTop: 4,
    opacity: 0.75,
  },
});

type Filter = "all" | "faves" | string;

function sortedByFilter(venues: Venue[], filter: Filter): Venue[] {
  return venues
    .filter((v) => {
      if (filter === "all") return true;
      if (filter === "faves") return v.fave;
      return v.category === filter;
    })
    .sort((a, b) => latestRating(b) - latestRating(a) || a.name.localeCompare(b.name));
}

export function Ratings() {
  const venues = useApp((s) => s.venues);
  const itineraries = useApp((s) => s.itineraries);
  const { toggleFave, addVenueNote } = useApp();
  const [searchParams, setSearchParams] = useSearchParams();
  const [noteFor, setNoteFor] = useState<string | null>(null);
  const [text, setText] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [detailFor, setDetailFor] = useState<string | null>(null);
  const [editFor, setEditFor] = useState<{
    venueId: string;
    visit?: { itineraryId: string; stopId?: string; dateISO: string; label?: string };
  } | null>(null);

  const categories = Array.from(new Set(venues.map((v) => v.category))).sort((a, b) => a.localeCompare(b));
  const filtered = sortedByFilter(venues, filter);
  const shown = filtered.slice(0, visible);
  const hasMore = filtered.length > shown.length;

  // Post-date rating flow: ?date=<itineraryId> from "Rate the places you went".
  const ratingItineraryId = searchParams.get("date");
  const ratingItinerary = ratingItineraryId
    ? itineraries.find((it) => it.id === ratingItineraryId)
    : undefined;
  const dismissBanner = () => setSearchParams({}, { replace: true });
  const bannerVenues = ratingItinerary
    ? ratingItinerary.stops
        .filter((s) => s.venueId)
        .map((s) => ({ stop: s, venue: venues.find((v) => v.id === s.venueId) }))
        .filter((row): row is { stop: (typeof ratingItinerary.stops)[number]; venue: Venue } => !!row.venue)
    : [];

  const detailVenue = detailFor ? venues.find((v) => v.id === detailFor) ?? null : null;

  const changeFilter = (f: Filter) => {
    setFilter(f);
    setVisible(PAGE_SIZE);
  };

  const saveNote = () => {
    if (noteFor && text.trim()) {
      // Author is derived from the acting member (createdBy) at write time; no
      // manual Y/P pick.
      addVenueNote(noteFor, { text: text.trim() });
    }
    setNoteFor(null);
    setText("");
  };

  // Resolve the edit sheet's target from live store state.
  let editTarget: VenueEditTarget | null = null;
  if (editFor) {
    const v = venues.find((x) => x.id === editFor.venueId);
    if (v) {
      const value = editFor.visit
        ? v.ratings.find((r) => r.itineraryId === editFor.visit?.itineraryId)?.rating ?? 0
        : latestRating(v);
      editTarget = { venue: v, visit: editFor.visit, value };
    }
  }

  return (
    <Screen gap={14}>
      <div {...stylex.props(styles.title)}>Venue Ratings</div>

      <div {...stylex.props(styles.chipRow)}>
        <button
          type="button"
          onClick={() => changeFilter("all")}
          {...stylex.props(styles.chip, filter === "all" && styles.chipOn)}
        >
          All
        </button>
        <button
          type="button"
          onClick={() => changeFilter("faves")}
          {...stylex.props(styles.chip, filter === "faves" && styles.chipOn)}
        >
          Faves
        </button>
        {categories.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => changeFilter(c)}
            {...stylex.props(styles.chip, filter === c && styles.chipOn)}
          >
            {c}
          </button>
        ))}
      </div>

      {ratingItinerary && (
        <Card tone="shellPink" xstyle={styles.banner}>
          <div {...stylex.props(styles.bannerTop)}>
            <div {...stylex.props(styles.bannerTitle)}>Rating {ratingItinerary.title}</div>
            <div {...stylex.props(styles.bannerDismiss)} onClick={dismissBanner}>
              Dismiss
            </div>
          </div>
          {bannerVenues.length === 0 ? (
            <div {...stylex.props(styles.bannerRow)}>Nothing to rate for this date.</div>
          ) : (
            bannerVenues.map(({ stop, venue }) => {
              const entry = venue.ratings.find((r) => r.itineraryId === ratingItinerary.id);
              return (
                <div key={venue.id} {...stylex.props(styles.bannerRow)}>
                  <div>
                    <div {...stylex.props(styles.bannerName)}>{venue.name}</div>
                    <span {...stylex.props(styles.bannerTag)}>{venue.category}</span>
                  </div>
                  <div {...stylex.props(styles.pawEditRow)}>
                    <PawRating value={entry?.rating ?? 0} size={18} />
                    <button
                      type="button"
                      aria-label={`Edit ${venue.name}`}
                      {...stylex.props(styles.pencilBtn)}
                      onClick={() =>
                        setEditFor({
                          venueId: venue.id,
                          visit: {
                            itineraryId: ratingItinerary.id,
                            stopId: stop.id,
                            dateISO: ratingItinerary.dateISO,
                            label: ratingItinerary.title,
                          },
                        })
                      }
                    >
                      <IconPencil />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </Card>
      )}

      {filtered.length === 0 && <div {...stylex.props(styles.emptyCard)}>Nothing here yet.</div>}

      {shown.map((venue) => {
        const lastVisit = venueVisits(venue, itineraries).find((v) => v.itinerary);
        return (
          <Card key={venue.id} xstyle={styles.venueCard} onClick={() => setDetailFor(venue.id)}>
            <div onClick={(e) => e.stopPropagation()}>
              <FaveBadge fave={venue.fave} onToggle={() => toggleFave(venue.id)} />
            </div>
            <div {...stylex.props(styles.name)}>{venue.name}</div>
            <div {...stylex.props(styles.category)}>{venue.category}</div>
            {lastVisit?.itinerary && (
              <div {...stylex.props(styles.lastVisited)}>
                last visited {shortDate(lastVisit.itinerary.dateISO)} · {lastVisit.itinerary.title}
              </div>
            )}
            <div {...stylex.props(styles.paws, styles.pawEditRow)} onClick={(e) => e.stopPropagation()}>
              <PawRating value={latestRating(venue)} />
              <button
                type="button"
                aria-label={`Edit ${venue.name}`}
                {...stylex.props(styles.pencilBtn)}
                onClick={() => setEditFor({ venueId: venue.id })}
              >
                <IconPencil />
              </button>
            </div>
            {venue.notes.map((note, i) => (
              <div key={i} {...stylex.props(styles.noteRow)}>
                <AuthorChip by={note.createdBy} size={18} />
                <div {...stylex.props(styles.noteText)}>"{note.text}"</div>
              </div>
            ))}
            <div
              {...stylex.props(styles.addNote)}
              onClick={(e) => {
                e.stopPropagation();
                setNoteFor(venue.id);
                setText("");
              }}
            >
              + add a note
            </div>
          </Card>
        );
      })}

      {hasMore && (
        <button
          type="button"
          {...stylex.props(styles.showMore)}
          onClick={() => setVisible((v) => v + PAGE_SIZE)}
        >
          Show more
        </button>
      )}

      <Sheet open={noteFor !== null} onClose={() => setNoteFor(null)} title="Add a note">
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

      <VenueDetailSheet venue={detailVenue} onClose={() => setDetailFor(null)} />
      <VenueEditSheet target={editTarget} onClose={() => setEditFor(null)} />
    </Screen>
  );
}
