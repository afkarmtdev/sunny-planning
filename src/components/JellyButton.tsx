import * as stylex from "@stylexjs/stylex";
import type { StyleXStyles } from "@stylexjs/stylex";
import type { ReactNode } from "react";
import { colors, fonts } from "../theme/tokens.stylex";
import { sfx } from "../lib/sfx";

const styles = stylex.create({
  base: {
    display: "block",
    fontFamily: fonts.display,
    fontWeight: 700,
    fontSize: 14,
    color: colors.ink,
    backgroundColor: colors.white,
    borderWidth: 3,
    borderStyle: "solid",
    borderColor: colors.ink,
    borderRadius: 999,
    paddingBlock: 12,
    paddingInline: 18,
    textAlign: "center",
    userSelect: "none",
    transitionProperty: "transform",
    transitionDuration: "0.05s",
  },
  primary: {
    fontSize: 16,
    paddingBlock: 15,
    color: colors.cream,
    backgroundImage: "linear-gradient(180deg, #FF7DC0, #FF4D9D)",
    boxShadow: { default: "0 5px 0 0 #332B33", ":active": "0 0 0 0 #332B33" },
    transform: { default: "translateY(0)", ":active": "translateY(5px)" },
  },
  soft: {
    paddingBlock: 9,
    backgroundImage: "linear-gradient(180deg, #FFB3D6, #FF8FC2)",
    boxShadow: { default: "0 4px 0 0 #332B33", ":active": "0 0 0 0 #332B33" },
    transform: { default: "translateY(0)", ":active": "translateY(4px)" },
  },
  white: {
    paddingBlock: 13,
    boxShadow: { default: "0 4px 0 0 #332B33", ":active": "0 0 0 0 #332B33" },
    transform: { default: "translateY(0)", ":active": "translateY(4px)" },
  },
  mint: {
    backgroundColor: colors.lcdMint,
    borderWidth: 2,
    paddingBlock: 6,
    paddingInline: 12,
    fontSize: 11,
    transform: { default: "translateY(0)", ":active": "translateY(2px)" },
  },
  fullWidth: { width: "100%" },
});

type Props = {
  children: ReactNode;
  variant?: "primary" | "soft" | "white" | "mint";
  onClick?: () => void;
  fullWidth?: boolean;
  xstyle?: StyleXStyles;
  disabled?: boolean;
};

export function JellyButton({ children, variant = "primary", onClick, fullWidth, xstyle, disabled }: Props) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={
        onClick &&
        (() => {
          sfx.press();
          onClick();
        })
      }
      {...stylex.props(styles.base, styles[variant], fullWidth && styles.fullWidth, xstyle)}
    >
      {children}
    </button>
  );
}
