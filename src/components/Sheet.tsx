import * as stylex from "@stylexjs/stylex";
import type { ReactNode } from "react";
import { colors, fonts } from "../theme/tokens.stylex";

const styles = stylex.create({
  overlay: {
    position: "fixed",
    inset: 0,
    backgroundColor: "rgba(51,43,51,0.45)",
    zIndex: 60,
  },
  panel: {
    position: "fixed",
    bottom: 0,
    left: "50%",
    transform: "translateX(-50%)",
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
  },
  notch: {
    width: 44,
    height: 5,
    borderRadius: 999,
    backgroundColor: colors.ink,
    opacity: 0.25,
    marginInline: "auto",
    marginBottom: 4,
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
  if (!open) return null;
  return (
    <>
      <div {...stylex.props(styles.overlay)} onClick={onClose} />
      <div {...stylex.props(styles.panel)} role="dialog" aria-modal="true">
        <div {...stylex.props(styles.notch)} />
        {title && <div {...stylex.props(styles.title)}>{title}</div>}
        {children}
      </div>
    </>
  );
}
