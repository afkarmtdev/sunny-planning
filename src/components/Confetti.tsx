import * as stylex from "@stylexjs/stylex";
import { useEffect, useMemo, useState } from "react";

// A one-shot confetti burst: themed squares rain down once, then the whole
// overlay unmounts. No dependency, no canvas; just CSS keyframes on a fixed set
// of pieces whose positions are rolled once on mount. Sits above everything and
// ignores pointer events so it never blocks a tap.

const CONFETTI_COLORS = ["#FF4D9D", "#FF8FC2", "#FFA24C", "#CDB4F6", "#6FD8A8", "#FFD3E8"];
const PIECES = 46;
const DURATION_MS = 2600;

const fall = stylex.keyframes({
  "0%": { transform: "translateY(-12vh) rotate(0deg)", opacity: 1 },
  "100%": { transform: "translateY(104vh) rotate(720deg)", opacity: 1 },
});

const styles = stylex.create({
  layer: {
    position: "fixed",
    inset: 0,
    overflow: "hidden",
    pointerEvents: "none",
    zIndex: 80,
  },
  piece: (left: number, color: string, delay: number, size: number, rounded: boolean) => ({
    position: "absolute",
    top: 0,
    left: `${left}%`,
    width: size,
    height: size,
    backgroundColor: color,
    borderRadius: rounded ? "50%" : 2,
    animationName: fall,
    animationDuration: `${DURATION_MS}ms`,
    animationTimingFunction: "cubic-bezier(0.35, 0.15, 0.5, 1)",
    animationDelay: `${delay}ms`,
    animationFillMode: "both",
  }),
});

type Props = {
  /** Bumping this value re-fires the burst. */
  fireKey: number;
};

export function Confetti({ fireKey }: Props) {
  const [active, setActive] = useState(false);

  const pieces = useMemo(
    () =>
      Array.from({ length: PIECES }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
        delay: Math.random() * 700,
        size: 7 + Math.round(Math.random() * 7),
        rounded: Math.random() > 0.5,
      })),
    // Re-roll the pieces whenever a new burst fires.
    [fireKey]
  );

  useEffect(() => {
    if (!fireKey) return;
    setActive(true);
    const timer = window.setTimeout(() => setActive(false), DURATION_MS + 800);
    return () => window.clearTimeout(timer);
  }, [fireKey]);

  if (!active) return null;

  return (
    <div {...stylex.props(styles.layer)} aria-hidden>
      {pieces.map((p) => (
        <span key={p.id} {...stylex.props(styles.piece(p.left, p.color, p.delay, p.size, p.rounded))} />
      ))}
    </div>
  );
}
