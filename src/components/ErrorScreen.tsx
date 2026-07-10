import * as stylex from "@stylexjs/stylex";
import { colors, fonts } from "../theme/tokens.stylex";
import { SunnySprite } from "./SunnySprite";
import { JellyButton } from "./JellyButton";

// A full-screen themed fallback for states we cannot recover from in place.
// It deliberately uses no router hooks and only `window.location`, so it works
// both as the router's errorElement and inside the top-level class error
// boundary (which sits outside the router). Composed from the existing design
// language rather than invented, per the house rule for non-design-doc screens.

const styles = stylex.create({
  page: {
    position: "fixed",
    inset: 0,
    zIndex: 70,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 18,
    padding: 28,
    backgroundColor: colors.cream,
    backgroundImage: "radial-gradient(circle, #FFD3E8 1.5px, transparent 1.5px)",
    backgroundSize: "18px 18px",
    textAlign: "center",
  },
  card: {
    width: "100%",
    maxWidth: 340,
    backgroundColor: colors.white,
    borderWidth: 3,
    borderStyle: "solid",
    borderColor: colors.ink,
    borderRadius: 22,
    boxShadow: "0 0 0 4px #FFF9F0, 5px 5px 0 0 #332B33",
    padding: "26px 22px 22px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 12,
  },
  title: {
    fontFamily: fonts.display,
    fontWeight: 800,
    fontSize: 22,
    color: colors.ink,
  },
  message: {
    fontFamily: fonts.body,
    fontSize: 14,
    fontWeight: 600,
    lineHeight: 1.45,
    color: colors.ink,
    opacity: 0.7,
  },
  detail: {
    marginTop: 2,
    width: "100%",
    fontFamily: fonts.lcd,
    fontSize: 11,
    color: colors.marmalade,
    backgroundColor: colors.cream,
    borderWidth: 2,
    borderStyle: "solid",
    borderColor: "rgba(51,43,51,0.12)",
    borderRadius: 12,
    padding: "8px 10px",
    wordBreak: "break-word",
    overflowWrap: "anywhere",
  },
  actions: {
    marginTop: 6,
    width: "100%",
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
});

type Props = {
  /** Header line. */
  title?: string;
  /** Reassuring sub-line. */
  message?: string;
  /** Sunny's mood; sleepy suits a stumble, smitten suits offline reassurance. */
  expression?: "sleepy" | "asleep" | "smitten" | "happy";
  /** Primary action label; defaults to reloading the app. */
  actionLabel?: string;
  onAction?: () => void;
  /** Optional secondary action, e.g. back to Home. */
  secondaryLabel?: string;
  onSecondary?: () => void;
  /** Short technical detail, only shown when provided (dev only at call sites). */
  detail?: string | null;
};

export function ErrorScreen({
  title = "Something went sideways",
  message = "Sunny tripped over a wire. A quick reload usually sorts it out.",
  expression = "sleepy",
  actionLabel = "Reload",
  onAction,
  secondaryLabel,
  onSecondary,
  detail = null,
}: Props) {
  const reload = onAction ?? (() => window.location.reload());
  return (
    <div {...stylex.props(styles.page)} role="alert" className="no-print">
      <SunnySprite expression={expression} size={104} hop hopFast />
      <div {...stylex.props(styles.card)}>
        <div {...stylex.props(styles.title)}>{title}</div>
        <div {...stylex.props(styles.message)}>{message}</div>
        {detail && <div {...stylex.props(styles.detail)}>{detail}</div>}
        <div {...stylex.props(styles.actions)}>
          <JellyButton variant="primary" fullWidth onClick={reload}>
            {actionLabel}
          </JellyButton>
          {secondaryLabel && (
            <JellyButton variant="white" fullWidth onClick={onSecondary ?? (() => window.location.assign("/"))}>
              {secondaryLabel}
            </JellyButton>
          )}
        </div>
      </div>
    </div>
  );
}
