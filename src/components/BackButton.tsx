import * as stylex from "@stylexjs/stylex";
import { useNavigate } from "react-router-dom";
import { colors, fonts } from "../theme/tokens.stylex";
import { IconChevronLeft } from "./icons";

const styles = stylex.create({
  row: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    alignSelf: "flex-start",
    cursor: "pointer",
    transform: { default: "translateX(0)", ":active": "translateX(-2px)" },
    transitionProperty: "transform",
    transitionDuration: "0.05s",
  },
  circle: {
    width: 26,
    height: 26,
    borderRadius: "50%",
    backgroundColor: colors.white,
    borderWidth: 2,
    borderStyle: "solid",
    borderColor: colors.ink,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    color: colors.ink,
  },
  label: {
    fontFamily: fonts.body,
    fontSize: 12,
    fontWeight: 700,
    color: colors.ink,
    opacity: 0.6,
  },
});

type Props = {
  label: string;
  to?: string;
};

export function BackButton({ label, to }: Props) {
  const navigate = useNavigate();
  return (
    <button
      type="button"
      onClick={() => (to ? navigate(to) : navigate(-1))}
      {...stylex.props(styles.row)}
    >
      <span {...stylex.props(styles.circle)}>
        <IconChevronLeft />
      </span>
      <span {...stylex.props(styles.label)}>{label}</span>
    </button>
  );
}
