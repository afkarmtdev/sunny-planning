import * as stylex from "@stylexjs/stylex";
import { useEffect, useState } from "react";
import { colors } from "../theme/tokens.stylex";
import { JellyButton } from "./JellyButton";
import { useReceiptUrl } from "../lib/receipts";

const EXIT_MS = 220;

const styles = stylex.create({
  overlay: {
    position: "fixed",
    inset: 0,
    backgroundColor: "rgba(51,43,51,0.55)",
    zIndex: 80,
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
    height: 360,
    maxHeight: "60vh",
    borderRadius: 3,
    overflow: "hidden",
    backgroundColor: colors.cream,
  },
  img: { width: "100%", height: "100%", objectFit: "contain" },
  actions: {
    marginTop: 14,
  },
});

type Props = {
  /** The receipt id to view; null (or absent) closes the lightbox. */
  receiptId: string | null;
  onClose: () => void;
};

/** Minimal full-size viewer for a single receipt image, separate from PhotoLightbox. */
export function ReceiptLightbox({ receiptId, onClose }: Props) {
  const [mounted, setMounted] = useState(Boolean(receiptId));
  const [shown, setShown] = useState(false);
  // Keep the last id while sliding out so the image does not blank mid-exit.
  const [current, setCurrent] = useState(receiptId);
  const url = useReceiptUrl(current ?? undefined);

  useEffect(() => {
    if (receiptId) {
      setCurrent(receiptId);
      setMounted(true);
      const raf = requestAnimationFrame(() => setShown(true));
      return () => cancelAnimationFrame(raf);
    }
    setShown(false);
    const timer = setTimeout(() => setMounted(false), EXIT_MS);
    return () => clearTimeout(timer);
  }, [receiptId]);

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
          {url && <img src={url} alt="Receipt" {...stylex.props(styles.img)} />}
        </div>
        <div {...stylex.props(styles.actions)}>
          <JellyButton variant="white" fullWidth onClick={onClose}>
            Close
          </JellyButton>
        </div>
      </div>
    </div>
  );
}
