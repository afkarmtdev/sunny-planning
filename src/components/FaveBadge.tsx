import * as stylex from "@stylexjs/stylex";
import { colors, fonts } from "../theme/tokens.stylex";
import { useT } from "../lib/i18n";

const shimmer = stylex.keyframes({
  "0%": { backgroundPosition: "0% 50%" },
  "100%": { backgroundPosition: "200% 50%" },
});

const styles = stylex.create({
  // Holographic award pill, shown only once a venue is favorited.
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
    backgroundImage: "linear-gradient(120deg, #CDB4F6, #FF8FC2, #D9F2E4, #CDB4F6)",
    backgroundSize: "300% 100%",
    animationName: shimmer,
    animationDuration: "3s",
    animationTimingFunction: "linear",
    animationIterationCount: "infinite",
    boxShadow: { default: "2px 2px 0 0 #332B33", ":active": "0 0 0 0 #332B33" },
    transform: { default: "translate(0, 0)", ":active": "translate(2px, 2px)" },
  },
  // Unlit toggle: a small heart sticker that blooms into the badge on tap.
  heart: {
    position: "absolute",
    top: -10,
    right: 12,
    width: 26,
    height: 26,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.white,
    borderWidth: 2,
    borderStyle: "solid",
    borderColor: colors.ink,
    borderRadius: "50%",
    cursor: "pointer",
    color: colors.ink,
    opacity: { default: 0.65, ":hover": 1 },
    boxShadow: { default: "2px 2px 0 0 #332B33", ":active": "0 0 0 0 #332B33" },
    transform: { default: "translate(0, 0)", ":active": "translate(2px, 2px)" },
  },
});

type Props = {
  fave: boolean;
  onToggle: () => void;
};

export function FaveBadge({ fave, onToggle }: Props) {
  const t = useT();
  if (fave) {
    return (
      <button
        type="button"
        aria-pressed
        aria-label={t("ratings.removeFave")}
        onClick={onToggle}
        {...stylex.props(styles.badge)}
      >
        {t("ratings.faveBadge")}
      </button>
    );
  }

  return (
    <button
      type="button"
      aria-pressed={false}
      aria-label={t("ratings.addFave")}
      onClick={onToggle}
      {...stylex.props(styles.heart)}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true">
        <path
          d="M12 20.5S3.5 15.2 3.5 9.4C3.5 6.6 5.7 4.8 8 4.8c1.7 0 3.1 1 4 2.4 0.9-1.4 2.3-2.4 4-2.4 2.3 0 4.5 1.8 4.5 4.6 0 5.8-8.5 11.1-8.5 11.1z"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}
