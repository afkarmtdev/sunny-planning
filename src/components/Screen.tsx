import * as stylex from "@stylexjs/stylex";
import type { ReactNode } from "react";
import { colors } from "../theme/tokens.stylex";

const styles = stylex.create({
  page: {
    position: "relative",
    minHeight: "100dvh",
    maxWidth: 430,
    marginInline: "auto",
    backgroundColor: colors.cream,
    paddingTop: 24,
    paddingBottom: 120,
    paddingInline: 18,
    display: "flex",
    flexDirection: "column",
    boxShadow: "0 0 0 1px rgba(51,43,51,0.08)",
  },
  gap14: { gap: 14 },
  gap16: { gap: 16 },
  dots: {
    backgroundImage: "radial-gradient(circle, #FFD3E8 1.5px, transparent 1.5px)",
    backgroundSize: "18px 18px",
  },
  dotsTight: {
    backgroundSize: "16px 16px",
  },
  noTab: {
    paddingBottom: 40,
  },
});

type Props = {
  children: ReactNode;
  dots?: boolean;
  dotsTight?: boolean;
  gap?: 14 | 16;
  noTab?: boolean;
};

export function Screen({ children, dots = false, dotsTight = false, gap = 14, noTab = false }: Props) {
  return (
    <div
      {...stylex.props(
        styles.page,
        gap === 16 ? styles.gap16 : styles.gap14,
        dots && styles.dots,
        dots && dotsTight && styles.dotsTight,
        noTab && styles.noTab
      )}
    >
      {children}
    </div>
  );
}
