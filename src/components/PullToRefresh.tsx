import * as stylex from "@stylexjs/stylex";
import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { SunnySprite } from "./SunnySprite";
import { sfx } from "../lib/sfx";

// Pull distance (after resistance) needed to trigger a refresh, and the cap the
// content can be dragged to.
const THRESHOLD = 66;
const MAX_PULL = 108;
const RESIST = 0.5;
// Where the content rests while the refresh "runs", and how long it plays. In
// local mode the refresh is purely cosmetic (derived values recompute on every
// render already); after Milestone 4 this is where a Supabase refetch hooks in.
const REFRESH_REST = 56;
const REFRESH_MS = 750;

type Phase = "idle" | "pulling" | "refreshing";

const styles = stylex.create({
  root: {
    position: "relative",
  },
  indicator: {
    position: "absolute",
    top: -52,
    left: "50%",
    display: "flex",
    justifyContent: "center",
    pointerEvents: "none",
    zIndex: 5,
  },
});

type Props = {
  children: ReactNode;
  /** Optional real refresh (e.g. a Supabase refetch); awaited before settling. */
  onRefresh?: () => Promise<void> | void;
};

/**
 * A pull-to-refresh gesture for the whole scroll root. Engages only when the
 * page is scrolled to the top and the finger drags down, taking over the
 * gesture (preventDefault) so the browser's own reload never fires; the
 * companion `overscroll-behavior-y: contain` in global.css blocks the rest.
 * Touch-only, so desktop/mouse use is unaffected.
 */
export function PullToRefresh({ children, onRefresh }: Props) {
  const [pull, setPull] = useState(0);
  const [phase, setPhase] = useState<Phase>("idle");

  const rootRef = useRef<HTMLDivElement>(null);
  const startY = useRef<number | null>(null);
  const pullRef = useRef(0);
  const phaseRef = useRef<Phase>("idle");
  const onRefreshRef = useRef(onRefresh);
  onRefreshRef.current = onRefresh;

  const update = (p: number) => {
    pullRef.current = p;
    setPull(p);
  };
  const goto = (p: Phase) => {
    phaseRef.current = p;
    setPhase(p);
  };

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;

    const reset = () => {
      if (phaseRef.current === "pulling") {
        goto("idle");
        update(0);
      }
    };

    const onStart = (e: TouchEvent) => {
      if (window.scrollY > 3 || phaseRef.current === "refreshing") {
        startY.current = null;
        return;
      }
      startY.current = e.touches[0].clientY;
    };

    const onMove = (e: TouchEvent) => {
      if (startY.current === null) return;
      // Scrolled away from the very top mid-gesture: hand control back.
      if (window.scrollY > 3) {
        startY.current = null;
        reset();
        return;
      }
      const delta = e.touches[0].clientY - startY.current;
      if (delta <= 0) {
        reset();
        return;
      }
      e.preventDefault();
      goto("pulling");
      update(Math.min(MAX_PULL, delta * RESIST));
    };

    const onEnd = () => {
      if (startY.current === null) return;
      startY.current = null;
      if (phaseRef.current !== "pulling") return;
      if (pullRef.current >= THRESHOLD) {
        sfx.pop();
        goto("refreshing");
        update(REFRESH_REST);
        void Promise.resolve(onRefreshRef.current?.()).finally(() => {
          window.setTimeout(() => {
            goto("idle");
            update(0);
          }, REFRESH_MS);
        });
      } else {
        goto("idle");
        update(0);
      }
    };

    el.addEventListener("touchstart", onStart, { passive: true });
    el.addEventListener("touchmove", onMove, { passive: false });
    el.addEventListener("touchend", onEnd);
    el.addEventListener("touchcancel", onEnd);
    return () => {
      el.removeEventListener("touchstart", onStart);
      el.removeEventListener("touchmove", onMove);
      el.removeEventListener("touchend", onEnd);
      el.removeEventListener("touchcancel", onEnd);
    };
  }, []);

  const settling = phase !== "pulling";
  const progress = Math.min(1, pull / THRESHOLD);
  const spring = "cubic-bezier(0.22, 1, 0.36, 1)";

  return (
    <div ref={rootRef} {...stylex.props(styles.root)}>
      <div
        {...stylex.props(styles.indicator)}
        style={{
          transform: `translate(-50%, ${pull}px)`,
          opacity: phase === "refreshing" ? 1 : progress,
          transition: settling ? `transform 0.4s ${spring}, opacity 0.3s ease` : "none",
        }}
      >
        <div style={{ transform: `scale(${0.7 + progress * 0.3})` }}>
          <SunnySprite size={40} expression="happy" hop={phase === "refreshing"} hopFast blink />
        </div>
      </div>
      {/*
        Reveal the content with padding, NOT transform: a transform here would
        create a containing block and re-anchor every `position: fixed` footer
        (Plan, the builder) to this element instead of the viewport.
      */}
      <div
        style={{
          paddingTop: pull,
          transition: settling ? `padding-top 0.4s ${spring}` : "none",
        }}
      >
        {children}
      </div>
    </div>
  );
}
