import * as stylex from "@stylexjs/stylex";
import type { StyleXStyles } from "@stylexjs/stylex";
import { colors, fonts } from "../theme/tokens.stylex";
import { IconHeart } from "./icons";

const styles = stylex.create({
  chip: (size: number, color: string) => ({
    width: size,
    height: size,
    borderRadius: "50%",
    backgroundColor: color,
    borderWidth: Math.max(2, Math.round(size / 16)),
    borderStyle: "solid",
    borderColor: colors.ink,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    color: colors.white,
    fontFamily: fonts.display,
    fontWeight: 800,
    lineHeight: 1,
    boxShadow: "2px 2px 0 0 #332B33",
  }),
  glyph: (size: number) => ({ fontSize: Math.round(size * 0.44) }),
});

type Props = {
  /** Single letter; falls back to a heart when blank (name not set yet). */
  initial: string;
  color: string;
  size?: number;
  xstyle?: StyleXStyles;
};

export function Avatar({ initial, color, size = 44, xstyle }: Props) {
  return (
    <div {...stylex.props(styles.chip(size, color), xstyle)} aria-hidden>
      {initial ? (
        <span {...stylex.props(styles.glyph(size))}>{initial}</span>
      ) : (
        <IconHeart size={Math.round(size * 0.4)} />
      )}
    </div>
  );
}
