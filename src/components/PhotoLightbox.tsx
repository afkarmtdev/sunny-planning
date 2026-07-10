import * as stylex from "@stylexjs/stylex";
import { useEffect, useState } from "react";
import { colors, fonts } from "../theme/tokens.stylex";
import type { Photo } from "../lib/types";
import { JellyButton } from "./JellyButton";
import { ConfirmDialog } from "./ConfirmDialog";
import { shortDate } from "../lib/dates";
import { useStorageUrl } from "../lib/storage";
import { useT } from "../lib/i18n";

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
  deleteBtn: {
    fontFamily: fonts.display,
    fontWeight: 700,
    fontSize: 13,
    color: colors.heartPop,
    backgroundColor: "transparent",
    borderWidth: 0,
    paddingBlock: 6,
    cursor: "pointer",
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
  /** When set, shows a Delete action (behind a themed confirm). */
  onDelete?: () => void;
};

export function PhotoLightbox({ photo, itineraryTitle, stopLabel, onClose, onView, onTagStop, onDelete }: Props) {
  const t = useT();
  const [mounted, setMounted] = useState(Boolean(photo));
  const [shown, setShown] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
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

  // Local data URL if this device has it, else the signed Storage URL.
  const remoteSrc = useStorageUrl("photos", current?.storagePath);
  const src = current?.src ?? remoteSrc;

  if (!mounted || !current) return null;

  return (
    <>
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
          {src ? (
            <img src={src} alt={current.caption || t("album.datePhotoAlt")} {...stylex.props(styles.img)} />
          ) : (
            <div {...stylex.props(styles.fill, ART_STYLES[((current.art ?? 0) % 4 + 4) % 4])} />
          )}
        </div>
        {current.caption && <div {...stylex.props(styles.caption)}>{current.caption}</div>}
        <div {...stylex.props(styles.meta)}>
          {[currentTitle, currentStop, shortDate(current.dateISO), current.author && t("album.addedBy", { name: current.author })]
            .filter(Boolean)
            .join(" · ")}
        </div>
        <div {...stylex.props(styles.actions)}>
          {onTagStop && (
            <JellyButton variant="soft" fullWidth onClick={onTagStop}>
              {currentStop ? t("album.changeStop") : t("album.tagStop")}
            </JellyButton>
          )}
          {current.itineraryId && onView && (
            <JellyButton fullWidth onClick={() => onView(current.itineraryId as string)}>
              {t("album.viewDate")}
            </JellyButton>
          )}
          <JellyButton variant="white" fullWidth onClick={onClose}>
            {t("common.close")}
          </JellyButton>
          {onDelete && (
            <button type="button" {...stylex.props(styles.deleteBtn)} onClick={() => setConfirmDelete(true)}>
              {t("album.deletePhoto")}
            </button>
          )}
        </div>
      </div>
    </div>

      <ConfirmDialog
        open={confirmDelete}
        title={t("album.deleteConfirmTitle")}
        message={t("album.deleteConfirmMsg")}
        confirmLabel={t("common.delete")}
        cancelLabel={t("common.keep")}
        tone="danger"
        onConfirm={() => {
          setConfirmDelete(false);
          onDelete?.();
          onClose();
        }}
        onClose={() => setConfirmDelete(false)}
      />
    </>
  );
}
