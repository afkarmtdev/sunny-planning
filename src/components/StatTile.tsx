import * as stylex from "@stylexjs/stylex";
import { colors, fonts } from "../theme/tokens.stylex";

const styles = stylex.create({
  tile: {
    flex: 1,
    backgroundColor: colors.lcdMint,
    borderWidth: 3,
    borderStyle: "solid",
    borderColor: colors.ink,
    borderRadius: 14,
    paddingBlock: 8,
    paddingInline: 10,
    textAlign: "center",
  },
  value: {
    fontFamily: fonts.lcd,
    fontSize: 16,
    color: colors.ink,
  },
  label: {
    fontFamily: fonts.body,
    fontSize: 9,
    color: colors.ink,
    opacity: 0.6,
  },
});

type Props = {
  value: string;
  label: string;
};

export function StatTile({ value, label }: Props) {
  return (
    <div {...stylex.props(styles.tile)}>
      <div {...stylex.props(styles.value)}>{value}</div>
      <div {...stylex.props(styles.label)}>{label}</div>
    </div>
  );
}
