import * as stylex from "@stylexjs/stylex";
import { IconPaw } from "./icons";

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
  return (
    <div {...stylex.props(styles.row)} role="img" aria-label={`${value} out of 5 paws`}>
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
            aria-label={`Rate ${i} paws`}
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
