import * as stylex from "@stylexjs/stylex";
import type { StyleXStyles } from "@stylexjs/stylex";
import type { ReactNode } from "react";
import { colors } from "../theme/tokens.stylex";

const styles = stylex.create({
  card: {
    position: "relative",
    backgroundColor: colors.white,
    borderWidth: 3,
    borderStyle: "solid",
    borderColor: colors.ink,
    borderRadius: 20,
    boxShadow: "0 0 0 4px #FFF9F0, 4px 4px 0 0 #332B33",
  },
  shellPink: { backgroundColor: colors.shellPink },
  flat: { boxShadow: "none" },
});

type Props = {
  children: ReactNode;
  tone?: "white" | "shellPink";
  flat?: boolean;
  xstyle?: StyleXStyles;
  onClick?: () => void;
};

export function Card({ children, tone = "white", flat = false, xstyle, onClick }: Props) {
  return (
    <div
      {...stylex.props(styles.card, tone === "shellPink" && styles.shellPink, flat && styles.flat, xstyle)}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
