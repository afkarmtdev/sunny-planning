import * as stylex from "@stylexjs/stylex";
import { colors } from "../theme/tokens.stylex";

const styles = stylex.create({
  row: {
    display: "flex",
    justifyContent: "center",
    gap: 10,
    paddingBlock: 6,
  },
  dot: {
    width: 14,
    height: 14,
    borderRadius: "50%",
    borderWidth: 3,
    borderStyle: "solid",
    borderColor: colors.ink,
  },
  past: { backgroundColor: colors.bubblegum },
  current: { backgroundColor: colors.heartPop },
  upcoming: { backgroundColor: colors.white },
});

type Props = {
  total: number;
  current: number;
  completed: boolean;
};

export function ProgressDots({ total, current, completed }: Props) {
  return (
    <div {...stylex.props(styles.row)}>
      {Array.from({ length: total }, (_, i) => {
        const state = completed || i < current ? styles.past : i === current ? styles.current : styles.upcoming;
        return <div key={i} {...stylex.props(styles.dot, state)} />;
      })}
    </div>
  );
}
