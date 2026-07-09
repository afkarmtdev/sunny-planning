import * as stylex from "@stylexjs/stylex";
import type { StyleXStyles } from "@stylexjs/stylex";
import type { ReactNode } from "react";
import { colors, fonts } from "../theme/tokens.stylex";

const styles = stylex.create({
  panel: {
    position: "relative",
    backgroundColor: colors.lcdMint,
    backgroundImage:
      "repeating-linear-gradient(rgba(51,43,51,0.06) 0px, rgba(51,43,51,0.06) 1px, transparent 1px, transparent 3px)",
    borderWidth: 3,
    borderStyle: "solid",
    borderColor: colors.ink,
    borderRadius: 12,
    overflow: "hidden",
  },
  label: {
    fontFamily: fonts.body,
    fontSize: 10,
    color: colors.ink,
    opacity: 0.6,
    letterSpacing: 0.5,
  },
  value: {
    fontFamily: fonts.lcd,
    color: colors.ink,
    letterSpacing: 1,
  },
});

type PanelProps = {
  children: ReactNode;
  xstyle?: StyleXStyles;
};

export function LcdPanel({ children, xstyle }: PanelProps) {
  return <div {...stylex.props(styles.panel, xstyle)}>{children}</div>;
}

export function LcdLabel({ children, xstyle }: PanelProps) {
  return <div {...stylex.props(styles.label, xstyle)}>{children}</div>;
}

export function LcdValue({ children, xstyle }: PanelProps) {
  return <div {...stylex.props(styles.value, xstyle)}>{children}</div>;
}
