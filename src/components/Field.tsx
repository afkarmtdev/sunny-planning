import * as stylex from "@stylexjs/stylex";
import type { InputHTMLAttributes, ReactNode } from "react";
import { colors, fonts } from "../theme/tokens.stylex";

const styles = stylex.create({
  wrap: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
    width: "100%",
    textAlign: "left",
  },
  label: {
    fontFamily: fonts.body,
    fontSize: 11,
    fontWeight: 800,
    color: colors.ink,
    opacity: 0.6,
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  input: {
    width: "100%",
    backgroundColor: colors.white,
    borderWidth: 3,
    borderStyle: "solid",
    borderColor: { default: colors.ink, ":focus": colors.heartPop },
    borderRadius: 14,
    paddingBlock: 11,
    paddingInline: 14,
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.ink,
    outline: "none",
  },
});

type FieldProps = {
  label: string;
  children: ReactNode;
};

export function Field({ label, children }: FieldProps) {
  return (
    <label {...stylex.props(styles.wrap)}>
      <span {...stylex.props(styles.label)}>{label}</span>
      {children}
    </label>
  );
}

type InputProps = InputHTMLAttributes<HTMLInputElement>;

export function TextInput(props: InputProps) {
  return <input {...props} {...stylex.props(styles.input)} />;
}
