import * as stylex from "@stylexjs/stylex";
import type { ReactNode } from "react";
import { useRef, useState } from "react";
import { colors, fonts } from "../theme/tokens.stylex";

export type SwipeTone = "complete" | "delete" | "reopen";

export type SwipeAction = {
  label: string;
  tone: SwipeTone;
  onAction: () => void;
};

type Props = {
  /** Revealed by swiping right (finger moves right). */
  leftAction?: SwipeAction;
  /** Revealed by swiping left (finger moves left). */
  rightAction?: SwipeAction;
  /** Tap when the row is closed. */
  onClick?: () => void;
  children: ReactNode;
};

const ACTION_W = 96;
const THRESHOLD = ACTION_W / 2;
const AXIS_LOCK = 8;

const styles = stylex.create({
  frame: {
    position: "relative",
    overflow: "hidden",
    backgroundColor: colors.white,
    borderWidth: 3,
    borderStyle: "solid",
    borderColor: colors.ink,
    borderRadius: 20,
    boxShadow: "0 0 0 4px #FFF9F0, 4px 4px 0 0 #332B33",
  },
  action: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: ACTION_W,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 0,
    fontFamily: fonts.display,
    fontWeight: 800,
    fontSize: 14,
    cursor: "pointer",
  },
  actionLeft: { left: 0 },
  actionRight: { right: 0 },
  complete: { backgroundColor: colors.lcdMint, color: colors.ink },
  reopen: { backgroundColor: colors.lavender, color: colors.ink },
  delete: { backgroundColor: colors.heartPop, color: colors.cream },
  face: (x: number, dragging: boolean) => ({
    position: "relative",
    backgroundColor: colors.white,
    padding: 14,
    touchAction: "pan-y",
    cursor: "pointer",
    transform: `translateX(${x}px)`,
    transitionProperty: dragging ? "none" : "transform",
    transitionDuration: dragging ? "0s" : "0.18s",
    transitionTimingFunction: "ease-out",
  }),
});

const toneStyle = (tone: SwipeTone) =>
  tone === "complete" ? styles.complete : tone === "reopen" ? styles.reopen : styles.delete;

export function SwipeRow({ leftAction, rightAction, onClick, children }: Props) {
  const [offset, setOffset] = useState(0);
  const [dragging, setDragging] = useState(false);
  const drag = useRef({ startX: 0, startY: 0, startOffset: 0, axis: "none" as "none" | "x" | "y", moved: false });

  const maxOffset = leftAction ? ACTION_W : 0;
  const minOffset = rightAction ? -ACTION_W : 0;

  const onPointerDown = (e: React.PointerEvent) => {
    drag.current = { startX: e.clientX, startY: e.clientY, startOffset: offset, axis: "none", moved: false };
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current;
    const dx = e.clientX - d.startX;
    const dy = e.clientY - d.startY;
    if (d.axis === "none") {
      if (Math.abs(dx) < AXIS_LOCK && Math.abs(dy) < AXIS_LOCK) return;
      d.axis = Math.abs(dx) > Math.abs(dy) ? "x" : "y";
      if (d.axis === "x") {
        setDragging(true);
        e.currentTarget.setPointerCapture(e.pointerId);
      }
    }
    if (d.axis === "x") {
      d.moved = true;
      const next = Math.max(minOffset, Math.min(maxOffset, d.startOffset + dx));
      setOffset(next);
    }
  };

  const onPointerUp = () => {
    const d = drag.current;
    if (d.axis === "x") {
      setDragging(false);
      let target = 0;
      if (offset > THRESHOLD && leftAction) target = ACTION_W;
      else if (offset < -THRESHOLD && rightAction) target = -ACTION_W;
      setOffset(target);
    }
    d.axis = "none";
  };

  const handleClick = () => {
    if (drag.current.moved) {
      drag.current.moved = false;
      return;
    }
    if (offset !== 0) {
      setOffset(0);
      return;
    }
    onClick?.();
  };

  const runAction = (action: SwipeAction) => {
    setOffset(0);
    action.onAction();
  };

  return (
    <div {...stylex.props(styles.frame)}>
      {leftAction && (
        <button
          type="button"
          {...stylex.props(styles.action, styles.actionLeft, toneStyle(leftAction.tone))}
          onClick={() => runAction(leftAction)}
        >
          {leftAction.label}
        </button>
      )}
      {rightAction && (
        <button
          type="button"
          {...stylex.props(styles.action, styles.actionRight, toneStyle(rightAction.tone))}
          onClick={() => runAction(rightAction)}
        >
          {rightAction.label}
        </button>
      )}
      <div
        {...stylex.props(styles.face(offset, dragging))}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onClick={handleClick}
      >
        {children}
      </div>
    </div>
  );
}
