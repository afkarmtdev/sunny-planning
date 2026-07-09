import * as stylex from "@stylexjs/stylex";
import type { StyleXStyles } from "@stylexjs/stylex";
import { colors } from "../theme/tokens.stylex";

const styles = stylex.create({
  tape: (w: number, h: number, deg: number) => ({
    position: "absolute",
    width: w,
    height: h,
    transform: `rotate(${deg}deg)`,
    opacity: 0.85,
    borderWidth: 2,
    borderStyle: "solid",
    borderColor: colors.ink,
  }),
  lavender: { backgroundColor: colors.lavender },
  pink: { backgroundColor: colors.shellPink },
});

type Props = {
  w: number;
  h: number;
  rot: number;
  color?: "lavender" | "pink";
  xstyle?: StyleXStyles;
};

export function WashiTape({ w, h, rot, color = "lavender", xstyle }: Props) {
  return <div aria-hidden {...stylex.props(styles.tape(w, h, rot), styles[color], xstyle)} />;
}
