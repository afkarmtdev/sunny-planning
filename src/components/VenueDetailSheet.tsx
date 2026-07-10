import * as stylex from "@stylexjs/stylex";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { colors, fonts } from "../theme/tokens.stylex";
import { Sheet } from "./Sheet";
import { Card } from "./Card";
import { FaveBadge } from "./FaveBadge";
import { PawRating } from "./PawRating";
import { Polaroid } from "./Polaroid";
import { PhotoLightbox } from "./PhotoLightbox";
import { useApp } from "../store/useApp";
import { latestRating, venuePhotos, venueVisits } from "../lib/derive";
import { shortDate } from "../lib/dates";
import type { Photo, Venue } from "../lib/types";

const styles = stylex.create({
  header: {
    position: "relative",
    marginTop: 6,
    borderRadius: 18,
    padding: 14,
  },
  name: {
    fontFamily: fonts.display,
    fontWeight: 700,
    fontSize: 18,
    color: colors.ink,
  },
  category: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.ink,
    opacity: 0.55,
  },
  ratingRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  ratingLabel: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.ink,
    opacity: 0.55,
    letterSpacing: 0.5,
  },
  sectionTitle: {
    fontFamily: fonts.display,
    fontWeight: 700,
    fontSize: 14,
    color: colors.ink,
    marginTop: 2,
  },
  visitList: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  visitRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    backgroundColor: colors.white,
    borderWidth: 2,
    borderStyle: "solid",
    borderColor: colors.ink,
    borderRadius: 14,
    paddingBlock: 10,
    paddingInline: 14,
    textAlign: "left",
    width: "100%",
  },
  visitRowLink: {
    cursor: "pointer",
    boxShadow: { default: "0 3px 0 0 #332B33", ":active": "0 0 0 0 #332B33" },
    transform: { default: "translateY(0)", ":active": "translateY(3px)" },
  },
  visitTitle: {
    fontFamily: fonts.display,
    fontWeight: 700,
    fontSize: 13,
    color: colors.ink,
  },
  visitSub: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.ink,
    opacity: 0.55,
  },
  visitUnrated: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.ink,
    opacity: 0.45,
    flexShrink: 0,
  },
  photoGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 14,
  },
});

type Props = {
  /** The venue to show detail for; null closes the sheet. */
  venue: Venue | null;
  onClose: () => void;
};

export function VenueDetailSheet({ venue, onClose }: Props) {
  const navigate = useNavigate();
  const itineraries = useApp((s) => s.itineraries);
  const photos = useApp((s) => s.photos);
  const { toggleFave } = useApp();
  // Keep the last venue while the sheet slides out so content does not blank mid-exit.
  const [current, setCurrent] = useState<Venue | null>(venue);
  const [lightboxId, setLightboxId] = useState<string | null>(null);

  useEffect(() => {
    if (venue) setCurrent(venue);
  }, [venue]);

  const handleClose = () => {
    setLightboxId(null);
    onClose();
  };

  const visits = current ? venueVisits(current, itineraries) : [];
  const snaps: Photo[] = current ? venuePhotos(current, itineraries, photos) : [];
  const lightboxPhoto = lightboxId ? snaps.find((p) => p.id === lightboxId) ?? null : null;
  const lightboxItinerary = lightboxPhoto
    ? itineraries.find((it) => it.id === lightboxPhoto.itineraryId)
    : undefined;

  const goToItinerary = (itineraryId: string) => {
    handleClose();
    navigate(`/plan/${itineraryId}`);
  };

  return (
    <>
      <Sheet open={venue !== null} onClose={handleClose}>
        {current && (
          <>
            <Card xstyle={styles.header}>
              <FaveBadge fave={current.fave} onToggle={() => toggleFave(current.id)} />
              <div {...stylex.props(styles.name)}>{current.name}</div>
              <div {...stylex.props(styles.category)}>{current.category}</div>
            </Card>

            <div {...stylex.props(styles.ratingRow)}>
              <div {...stylex.props(styles.ratingLabel)}>YOUR RATING</div>
              <PawRating value={latestRating(current)} size={24} />
            </div>

            {visits.length > 0 && (
              <>
                <div {...stylex.props(styles.sectionTitle)}>
                  You have been here {visits.length} {visits.length === 1 ? "time" : "times"}
                </div>
                <div {...stylex.props(styles.visitList)}>
                  {visits.map((visit, i) => {
                    const clickable = !!visit.itinerary;
                    return (
                      <button
                        key={visit.itinerary?.id ?? `manual-${i}`}
                        type="button"
                        disabled={!clickable}
                        onClick={clickable ? () => goToItinerary(visit.itinerary!.id) : undefined}
                        {...stylex.props(styles.visitRow, clickable && styles.visitRowLink)}
                      >
                        <div>
                          <div {...stylex.props(styles.visitTitle)}>
                            {visit.itinerary?.title ?? "Manual rating"}
                          </div>
                          <div {...stylex.props(styles.visitSub)}>
                            {visit.dateISO ? shortDate(visit.dateISO) : "rated earlier"}
                          </div>
                        </div>
                        {visit.rating ? (
                          <PawRating value={visit.rating} size={13} />
                        ) : (
                          <div {...stylex.props(styles.visitUnrated)}>not rated</div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </>
            )}

            {snaps.length > 0 && (
              <>
                <div {...stylex.props(styles.sectionTitle)}>Snaps from here</div>
                <div {...stylex.props(styles.photoGrid)}>
                  {snaps.map((photo) => (
                    <Polaroid
                      key={photo.id}
                      photo={photo}
                      size="small"
                      onEnlarge={() => setLightboxId(photo.id)}
                    />
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </Sheet>

      <PhotoLightbox
        photo={lightboxPhoto}
        itineraryTitle={lightboxItinerary?.title}
        onClose={() => setLightboxId(null)}
        onView={(itineraryId) => goToItinerary(itineraryId)}
      />

    </>
  );
}
