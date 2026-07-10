import * as stylex from "@stylexjs/stylex";
import { useEffect, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent, ReactNode } from "react";
import { colors, fonts } from "../theme/tokens.stylex";

const EXIT_MS = 240;
// How far the sheet must be dragged down before releasing dismisses it.
const DISMISS_PX = 110;

const styles = stylex.create({
  overlay: {
    position: "fixed",
    inset: 0,
    backgroundColor: "rgba(51,43,51,0.45)",
    zIndex: 60,
    transitionProperty: "opacity",
    transitionDuration: "0.24s",
    transitionTimingFunction: "ease",
  },
  overlayHidden: {
    opacity: 0,
  },
  overlayShown: {
    opacity: 1,
  },
  panel: {
    position: "fixed",
    bottom: 0,
    left: "50%",
    width: "100%",
    maxWidth: 430,
    maxHeight: "84dvh",
    overflowY: "auto",
    backgroundColor: colors.cream,
    borderTopWidth: 3,
    borderInlineWidth: 3,
    borderBottomWidth: 0,
    borderStyle: "solid",
    borderColor: colors.ink,
    borderStartStartRadius: 24,
    borderStartEndRadius: 24,
    paddingTop: 10,
    paddingBottom: "calc(20px + env(safe-area-inset-bottom))",
    paddingInline: 20,
    zIndex: 61,
    display: "flex",
    flexDirection: "column",
    gap: 12,
    transitionProperty: "transform",
    transitionDuration: "0.28s",
    transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)",
  },
  panelHidden: {
    transform: "translate(-50%, 100%)",
  },
  panelShown: {
    transform: "translate(-50%, 0)",
  },
  handle: {
    // A generous grab area around the notch so the drag target is easy to hit.
    alignSelf: "stretch",
    marginTop: -10,
    marginInline: -20,
    paddingTop: 10,
    paddingBottom: 6,
    touchAction: "none",
    cursor: { default: "grab", ":active": "grabbing" },
  },
  notch: {
    width: 44,
    height: 5,
    borderRadius: 999,
    backgroundColor: colors.ink,
    opacity: 0.25,
    marginInline: "auto",
  },
  title: {
    fontFamily: fonts.display,
    fontWeight: 800,
    fontSize: 18,
    color: colors.ink,
  },
});

type Props = {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
};

export function Sheet({ open, onClose, title, children }: Props) {
  // Keep the sheet mounted while it slides out; `shown` drives the transition.
  const [mounted, setMounted] = useState(open);
  const [shown, setShown] = useState(false);
  // Live drag offset in px (0 at rest, positive when pulled down).
  const [drag, setDrag] = useState(0);
  const [dragging, setDragging] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const startY = useRef(0);

  useEffect(() => {
    if (open) {
      setDrag(0);
      setDragging(false);
      setMounted(true);
      const raf = requestAnimationFrame(() => setShown(true));
      return () => cancelAnimationFrame(raf);
    }
    setShown(false);
    const timer = setTimeout(() => setMounted(false), EXIT_MS);
    return () => clearTimeout(timer);
  }, [open]);

  // Lock background scroll while the sheet is open.
  useEffect(() => {
    if (!open) return;
    const { body } = document;
    const prevOverflow = body.style.overflow;
    const prevPadding = body.style.paddingRight;
    const scrollbar = window.innerWidth - document.documentElement.clientWidth;
    body.style.overflow = "hidden";
    if (scrollbar > 0) body.style.paddingRight = `${scrollbar}px`;
    return () => {
      body.style.overflow = prevOverflow;
      body.style.paddingRight = prevPadding;
    };
  }, [open]);

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!e.isPrimary) return;
    startY.current = e.clientY;
    setDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragging) return;
    const delta = e.clientY - startY.current;
    // Downward drags follow the finger; upward drags rubber-band with resistance.
    setDrag(delta > 0 ? delta : delta * 0.25);
  };

  const endDrag = () => {
    if (!dragging) return;
    setDragging(false);
    if (drag > DISMISS_PX) {
      // Fling the rest of the way down, then close.
      const h = panelRef.current?.offsetHeight ?? 480;
      setDrag(h + 40);
      window.setTimeout(onClose, EXIT_MS);
    } else {
      setDrag(0);
    }
  };

  if (!mounted) return null;

  // Apply the live transform only while a drag is in play; otherwise the
  // enter/exit classes drive the transform.
  const dragActive = dragging || drag !== 0;
  const panelStyle = dragActive
    ? {
        transform: `translate(-50%, ${drag}px)`,
        transitionDuration: dragging ? "0s" : undefined,
      }
    : undefined;

  return (
    <>
      <div
        {...stylex.props(styles.overlay, shown ? styles.overlayShown : styles.overlayHidden)}
        onClick={onClose}
      />
      <div
        ref={panelRef}
        {...stylex.props(styles.panel, shown ? styles.panelShown : styles.panelHidden)}
        style={panelStyle}
        role="dialog"
        aria-modal="true"
      >
        <div
          {...stylex.props(styles.handle)}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
        >
          <div {...stylex.props(styles.notch)} />
        </div>
        {title && <div {...stylex.props(styles.title)}>{title}</div>}
        {children}
      </div>
    </>
  );
}
