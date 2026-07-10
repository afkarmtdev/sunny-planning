import * as stylex from "@stylexjs/stylex";
import { useEffect, useState } from "react";
import { colors, fonts } from "../theme/tokens.stylex";
import type { Photo } from "../lib/types";
import { JellyButton } from "./JellyButton";
import { shortDate } from "../lib/dates";

const EXIT_MS = 220;

const styles = stylex.create({
  overlay: {
    position: "fixed",
    inset: 0,
    backgroundColor: "rgba(51,43,51,0.55)",
    zIndex: 70,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 22,
    transitionProperty: "opacity",
    transitionDuration: "0.22s",
    transitionTimingFunction: "ease",
  },
  overlayHidden: { opacity: 0 },
  overlayShown: { opacity: 1 },
  card: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: colors.white,
    borderWidth: 3,
    borderStyle: "solid",
    borderColor: colors.ink,
    borderRadius: 6,
    boxShadow: "0 0 0 5px #FFF9F0, 6px 6px 0 0 #332B33",
    padding: "14px 14px 16px",
    transitionProperty: "transform, opacity",
    transitionDuration: "0.24s",
    transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)",
  },
  cardHidden: { transform: "scale(0.9)", opacity: 0 },
  cardShown: { transform: "scale(1)", opacity: 1 },
  photoBox: {
    width: "100%",
    height: 300,
    maxHeight: "50vh",
    borderRadius: 3,
    overflow: "hidden",
    position: "relative",
    backgroundColor: colors.cream,
  },
  img: { width: "100%", height: "100%", objectFit: "contain" },
  fill: { position: "absolute", inset: 0 },
  art0: { backgroundImage: "linear-gradient(180deg, #FFD3E8 0%, #FFA24C 60%, #FF8FC2 100%)" },
  art1: { backgroundImage: "linear-gradient(180deg, #D9F2E4, #CDB4F6)" },
  art2: { backgroundImage: "linear-gradient(180deg, #FFA24C, #FF8FC2)" },
  art3: { backgroundImage: "linear-gradient(180deg, #FFF9F0, #FFD3E8)" },
  caption: {
    fontFamily: fonts.hand,
    fontSize: 20,
    color: colors.ink,
    marginTop: 10,
    textAlign: "center",
  },
  meta: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.ink,
    opacity: 0.6,
    textAlign: "center",
    marginTop: 2,
  },
  actions: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
    marginTop: 14,
  },
});

const ART_STYLES = [styles.art0, styles.art1, styles.art2, styles.art3];

type Props = {
  photo: Photo | null;
  /** Itinerary title for this photo, if it is tied to a date. */
  itineraryTitle?: string;
  /** Name of the stop this photo is tied to, if any. */
  stopLabel?: string;
  onClose: () => void;
  /** Called with the photo's itineraryId to open its detail screen. */
  onView?: (itineraryId: string) => void;
  /** When set, shows an action to tie this photo to a stop within its date. */
  onTagStop?: () => void;
};

export function PhotoLightbox({ photo, itineraryTitle, stopLabel, onClose, onView, onTagStop }: Props) {
  const [mounted, setMounted] = useState(Boolean(photo));
  const [shown, setShown] = useState(false);
  // Keep the last photo while sliding out so content does not blank mid-exit.
  const [current, setCurrent] = useState(photo);
  const [currentTitle, setCurrentTitle] = useState(itineraryTitle);
  const [currentStop, setCurrentStop] = useState(stopLabel);

  useEffect(() => {
    if (photo) {
      setCurrent(photo);
      setCurrentTitle(itineraryTitle);
      setCurrentStop(stopLabel);
      setMounted(true);
      const raf = requestAnimationFrame(() => setShown(true));
      return () => cancelAnimationFrame(raf);
    }
    setShown(false);
    const timer = setTimeout(() => setMounted(false), EXIT_MS);
    return () => clearTimeout(timer);
  }, [photo, itineraryTitle, stopLabel]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (!mounted || !current) return null;

  return (
    <div
      {...stylex.props(styles.overlay, shown ? styles.overlayShown : styles.overlayHidden)}
      onClick={onClose}
    >
      <div
        {...stylex.props(styles.card, shown ? styles.cardShown : styles.cardHidden)}
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        <div {...stylex.props(styles.photoBox)}>
          {current.src ? (
            <img src={current.src} alt={current.caption || "date photo"} {...stylex.props(styles.img)} />
          ) : (
            <div {...stylex.props(styles.fill, ART_STYLES[((current.art ?? 0) % 4 + 4) % 4])} />
          )}
        </div>
        {current.caption && <div {...stylex.props(styles.caption)}>{current.caption}</div>}
        <div {...stylex.props(styles.meta)}>
          {[currentTitle, currentStop, shortDate(current.dateISO), current.author && `added by ${current.author}`]
            .filter(Boolean)
            .join(" · ")}
        </div>
        <div {...stylex.props(styles.actions)}>
          {onTagStop && (
            <JellyButton variant="soft" fullWidth onClick={onTagStop}>
              {currentStop ? "Change stop" : "Tag to a stop"}
            </JellyButton>
          )}
          {current.itineraryId && onView && (
            <JellyButton fullWidth onClick={() => onView(current.itineraryId as string)}>
              View this date
            </JellyButton>
          )}
          <JellyButton variant="white" fullWidth onClick={onClose}>
            Close
          </JellyButton>
        </div>
      </div>
    </div>
  );
}
