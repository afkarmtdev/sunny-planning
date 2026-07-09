import * as stylex from "@stylexjs/stylex";
import { colors, fonts } from "../theme/tokens.stylex";

const shimmer = stylex.keyframes({
  "0%": { backgroundPosition: "0% 50%" },
  "100%": { backgroundPosition: "200% 50%" },
});

const styles = stylex.create({
  badge: {
    position: "absolute",
    top: -9,
    right: 12,
    fontFamily: fonts.display,
    fontWeight: 800,
    fontSize: 10,
    color: colors.ink,
    borderWidth: 2,
    borderStyle: "solid",
    borderColor: colors.ink,
    borderRadius: 999,
    paddingBlock: 4,
    paddingInline: 10,
    cursor: "pointer",
  },
  holo: {
    backgroundImage: "linear-gradient(120deg, #CDB4F6, #FF8FC2, #D9F2E4, #CDB4F6)",
    backgroundSize: "300% 100%",
    animationName: shimmer,
    animationDuration: "3s",
    animationTimingFunction: "linear",
    animationIterationCount: "infinite",
    boxShadow: "2px 2px 0 0 #332B33",
  },
  ghost: {
    backgroundColor: colors.white,
    borderStyle: "dashed",
    borderColor: "rgba(51,43,51,0.4)",
    color: "rgba(51,43,51,0.4)",
  },
});

type Props = {
  fave: boolean;
  onToggle: () => void;
};

export function FaveBadge({ fave, onToggle }: Props) {
  return (
    <button
      type="button"
      aria-pressed={fave}
      aria-label={fave ? "Remove from favorites" : "Mark as favorite"}
      onClick={onToggle}
      {...stylex.props(styles.badge, fave ? styles.holo : styles.ghost)}
    >
      FAVE
    </button>
  );
}
