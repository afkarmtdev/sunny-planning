import * as stylex from "@stylexjs/stylex";
import { useEffect, useState } from "react";
import { colors, fonts } from "../theme/tokens.stylex";
import { JellyButton } from "./JellyButton";
import hopPng from "../assets/sunny/hop.png";

// The reusable wait state (design screens 00b / 00c). Two modes: "fullscreen"
// sits on a solid cream field (cold launch, whole-screen waits); "overlay"
// floats over the frozen current screen behind a translucent, blurred scrim
// and blocks taps until the request resolves. A short fade-in delay means
// sub-300ms operations never flash it. On failure it swaps to an inline error
// with retry rather than leaving Sunny hopping forever.

const hop = stylex.keyframes({
  "0%": { transform: "translateY(0)" },
  "50%": { transform: "translateY(-9px)" },
  "100%": { transform: "translateY(0)" },
});

const styles = stylex.create({
  root: {
    position: "fixed",
    inset: 0,
    zIndex: 60,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    padding: 24,
    transitionProperty: "opacity",
    transitionDuration: "0.2s",
    transitionTimingFunction: "ease",
  },
  fullscreen: {
    backgroundColor: colors.cream,
  },
  overlay: {
    backgroundColor: "rgba(255,249,240,0.72)",
    backdropFilter: "blur(1.5px)",
    WebkitBackdropFilter: "blur(1.5px)",
  },
  hidden: { opacity: 0 },
  shown: { opacity: 1 },
  card: {
    position: "relative",
    backgroundColor: colors.lcdMint,
    borderWidth: 3,
    borderStyle: "solid",
    borderColor: colors.ink,
    borderRadius: 22,
    boxShadow: "0 0 0 4px #FFF9F0, 4px 4px 0 0 #332B33",
    overflow: "hidden",
  },
  cardFull: { padding: "22px 26px" },
  cardOverlay: { padding: "16px 20px" },
  scanlines: {
    position: "absolute",
    inset: 0,
    backgroundImage:
      "repeating-linear-gradient(rgba(51,43,51,0.06) 0px, rgba(51,43,51,0.06) 1px, transparent 1px, transparent 3px)",
  },
  sprite: (size: number) => ({
    position: "relative",
    display: "block",
    width: size,
    height: size,
    imageRendering: "pixelated",
    animationName: hop,
    animationDuration: "1.3s",
    animationTimingFunction: "ease-in-out",
    animationIterationCount: "infinite",
  }),
  dots: {
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  dot: (size: number, delay: number) => ({
    width: size,
    height: size,
    borderRadius: "50%",
    backgroundColor: colors.heartPop,
    borderWidth: 2,
    borderStyle: "solid",
    borderColor: colors.ink,
    animationName: hop,
    animationDuration: "1s",
    animationTimingFunction: "ease-in-out",
    animationIterationCount: "infinite",
    animationDelay: `${delay}s`,
  }),
  caption: {
    fontFamily: fonts.hand,
    color: colors.ink,
    opacity: 0.72,
    transform: "rotate(-1deg)",
    textAlign: "center",
  },
  captionFull: { fontSize: 16 },
  captionOverlay: { fontSize: 14 },
  errorCard: {
    width: "100%",
    maxWidth: 320,
    backgroundColor: colors.white,
    borderWidth: 3,
    borderStyle: "solid",
    borderColor: colors.ink,
    borderRadius: 18,
    boxShadow: "0 0 0 4px #FFF9F0, 4px 4px 0 0 #332B33",
    padding: "18px 18px 16px",
    textAlign: "center",
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  errorText: {
    fontFamily: fonts.body,
    fontWeight: 700,
    fontSize: 14,
    color: colors.ink,
  },
  cancel: {
    fontFamily: fonts.body,
    fontWeight: 700,
    fontSize: 12.5,
    color: colors.ink,
    opacity: 0.6,
    background: "none",
    borderStyle: "none",
    cursor: "pointer",
    paddingBlock: 4,
  },
});

type Props = {
  mode?: "fullscreen" | "overlay";
  /** Contextual line, e.g. "packing up your PDF...". */
  caption?: string;
  /** When set, the hop swaps for an inline error with a retry action. */
  error?: string | null;
  onRetry?: () => void;
  /** A cancel affordance for long operations like PDF export. */
  onCancel?: () => void;
  /** Fade-in delay so quick operations never flash it; 0 to skip. */
  delayMs?: number;
};

export function LoadingOverlay({
  mode = "overlay",
  caption = "just a sec...",
  error = null,
  onRetry,
  onCancel,
  delayMs = 180,
}: Props) {
  // Stay invisible until the delay elapses; an error shows at once.
  const [visible, setVisible] = useState(delayMs <= 0);
  useEffect(() => {
    if (delayMs <= 0) return;
    const t = window.setTimeout(() => setVisible(true), delayMs);
    return () => window.clearTimeout(t);
  }, [delayMs]);

  const isFull = mode === "fullscreen";
  const rootProps = stylex.props(
    styles.root,
    isFull ? styles.fullscreen : styles.overlay,
    visible || error ? styles.shown : styles.hidden
  );

  return (
    <div {...rootProps} className={`${rootProps.className ?? ""} no-print`} role="status" aria-live="polite">
      {error ? (
        <div {...stylex.props(styles.errorCard)}>
          <div {...stylex.props(styles.errorText)}>{error}</div>
          {onRetry && (
            <JellyButton variant="soft" fullWidth onClick={onRetry}>
              Try again
            </JellyButton>
          )}
          {onCancel && (
            <button type="button" onClick={onCancel} {...stylex.props(styles.cancel)}>
              Cancel
            </button>
          )}
        </div>
      ) : (
        <>
          <div {...stylex.props(styles.card, isFull ? styles.cardFull : styles.cardOverlay)}>
            <div {...stylex.props(styles.scanlines)} />
            <img src={hopPng} alt="" aria-hidden {...stylex.props(styles.sprite(isFull ? 120 : 88))} />
          </div>
          <div {...stylex.props(styles.dots)}>
            <div {...stylex.props(styles.dot(isFull ? 11 : 9, 0))} />
            <div {...stylex.props(styles.dot(isFull ? 11 : 9, 0.15))} />
            <div {...stylex.props(styles.dot(isFull ? 11 : 9, 0.3))} />
          </div>
          <div {...stylex.props(styles.caption, isFull ? styles.captionFull : styles.captionOverlay)}>
            {caption}
          </div>
          {onCancel && (
            <button type="button" onClick={onCancel} {...stylex.props(styles.cancel)}>
              Cancel
            </button>
          )}
        </>
      )}
    </div>
  );
}
