import * as stylex from "@stylexjs/stylex";
import { colors } from "../theme/tokens.stylex";
import { sfx } from "../lib/sfx";

const styles = stylex.create({
  track: {
    position: "relative",
    width: 52,
    height: 30,
    flexShrink: 0,
    borderRadius: 999,
    borderWidth: 2.5,
    borderStyle: "solid",
    borderColor: colors.ink,
    backgroundColor: colors.white,
    cursor: "pointer",
    padding: 0,
    transitionProperty: "background-color",
    transitionDuration: "0.12s",
  },
  trackOn: {
    backgroundColor: colors.heartPop,
  },
  knob: {
    position: "absolute",
    top: 2,
    left: 2,
    width: 21,
    height: 21,
    borderRadius: "50%",
    backgroundColor: colors.white,
    borderWidth: 2,
    borderStyle: "solid",
    borderColor: colors.ink,
    transitionProperty: "transform",
    transitionDuration: "0.12s",
    transitionTimingFunction: "cubic-bezier(0.34, 1.56, 0.64, 1)",
  },
  knobOn: {
    transform: "translateX(22px)",
  },
});

type Props = {
  on: boolean;
  onChange: (next: boolean) => void;
  label: string;
};

/** Themed on/off switch. Plays the pop voice on the way on, tap on the way off. */
export function Toggle({ on, onChange, label }: Props) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={() => {
        on ? sfx.tap() : sfx.pop();
        onChange(!on);
      }}
      {...stylex.props(styles.track, on && styles.trackOn)}
    >
      <span {...stylex.props(styles.knob, on && styles.knobOn)} />
    </button>
  );
}
