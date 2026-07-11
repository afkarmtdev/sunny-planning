import * as stylex from "@stylexjs/stylex";
import { useEffect, useState } from "react";
import { colors, fonts } from "../theme/tokens.stylex";
import { Avatar } from "./Avatar";
import { JellyButton } from "./JellyButton";
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
  title: {
    fontFamily: fonts.display,
    fontWeight: 800,
    fontSize: 18,
    color: colors.ink,
    textAlign: "center",
    marginBottom: 10,
  },
  photoBox: {
    width: "100%",
    aspectRatio: "1 / 1",
    maxHeight: "55vh",
    borderRadius: 3,
    overflow: "hidden",
    backgroundColor: colors.cream,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  img: { width: "100%", height: "100%", objectFit: "contain" },
  caption: {
    fontFamily: fonts.hand,
    fontSize: 20,
    color: colors.ink,
    marginTop: 10,
    textAlign: "center",
  },
  actions: { marginTop: 14 },
});

type Face = { src?: string; name?: string; initial: string; color: string };

type Props = {
  open: boolean;
  /** Heading above the photo, e.g. "Your Partner". */
  title?: string;
  /** Photo URL to display; without one the big initial chip shows instead. */
  src?: string;
  /** Shown as a handwritten caption under the photo. */
  name?: string;
  /** Fallback initial and avatar color when there is no photo. */
  initial?: string;
  color?: string;
  onClose: () => void;
};

/** A themed popup showing a member's profile photo at full size. */
export function AvatarLightbox({ open, title, src, name, initial = "", color, onClose }: Props) {
  const t = useT();
  const [mounted, setMounted] = useState(open);
  const [shown, setShown] = useState(false);
  // Keep the last face while sliding out so content does not blank mid-exit.
  const [current, setCurrent] = useState<Face | null>(null);

  useEffect(() => {
    if (open) {
      setCurrent({ src, name, initial, color: color ?? "#FF8FC2" });
      setMounted(true);
      const raf = requestAnimationFrame(() => setShown(true));
      return () => cancelAnimationFrame(raf);
    }
    setShown(false);
    const timer = setTimeout(() => setMounted(false), EXIT_MS);
    return () => clearTimeout(timer);
  }, [open, src, name, initial, color]);

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
        {title && <div {...stylex.props(styles.title)}>{title}</div>}
        <div {...stylex.props(styles.photoBox)}>
          {current.src ? (
            <img src={current.src} alt={t("settings.photoAlt")} {...stylex.props(styles.img)} />
          ) : (
            <Avatar initial={current.initial} color={current.color} size={160} />
          )}
        </div>
        {current.name && <div {...stylex.props(styles.caption)}>{current.name}</div>}
        <div {...stylex.props(styles.actions)}>
          <JellyButton variant="white" fullWidth onClick={onClose}>
            {t("common.close")}
          </JellyButton>
        </div>
      </div>
    </div>
  );
}
