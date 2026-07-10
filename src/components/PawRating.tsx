import * as stylex from "@stylexjs/stylex";
import { IconPaw } from "./icons";
import { useT } from "../lib/i18n";

const styles = stylex.create({
  row: {
    display: "flex",
    gap: 4,
  },
  paw: {
    display: "flex",
    padding: 0,
    lineHeight: 0,
  },
  pressable: {
    cursor: "pointer",
    transform: { default: "scale(1)", ":active": "scale(0.85)" },
    transitionProperty: "transform",
    transitionDuration: "0.08s",
  },
});

type Props = {
  value: number;
  onChange?: (value: number) => void;
  size?: number;
};

export function PawRating({ value, onChange, size = 20 }: Props) {
  const t = useT();
  return (
    <div {...stylex.props(styles.row)} role="img" aria-label={t("ratings.pawsAria", { value })}>
      {[1, 2, 3, 4, 5].map((i) => {
        const filled = i <= value;
        const paw = <IconPaw size={size} color={filled ? "#FF4D9D" : "rgba(51,43,51,0.2)"} />;
        if (!onChange) {
          return (
            <span key={i} {...stylex.props(styles.paw)}>
              {paw}
            </span>
          );
        }
        return (
          <button
            key={i}
            type="button"
            aria-label={t("ratings.ratePaws", { count: i })}
            onClick={() => onChange(i)}
            {...stylex.props(styles.paw, styles.pressable)}
          >
            {paw}
          </button>
        );
      })}
    </div>
  );
}
