import * as stylex from "@stylexjs/stylex";
import { colors, fonts } from "../theme/tokens.stylex";
import hopPng from "../assets/sunny/hop.png";
import { useT } from "../lib/i18n";

// Cold-launch splash (design screen 00). Shown while the persisted store
// rehydrates and fonts load; the Boot gate in App.tsx dismisses it. Sunny hops
// in an idle loop the whole time it is on screen.

const hop = stylex.keyframes({
  "0%": { transform: "translateY(0)" },
  "50%": { transform: "translateY(-9px)" },
  "100%": { transform: "translateY(0)" },
});

const styles = stylex.create({
  root: {
    position: "fixed",
    inset: 0,
    zIndex: 70,
    boxSizing: "border-box",
    padding: "60px 24px",
    backgroundColor: colors.cream,
    backgroundImage: "radial-gradient(circle, #FFD3E8 1.5px, transparent 1.5px)",
    backgroundPosition: "0 0",
    backgroundSize: "20px 20px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 22,
    overflow: "hidden",
  },
  // Floating decorative teardrops, per the mockup.
  drop: (
    top: string,
    bottom: string,
    side: "left" | "right",
    offset: number,
    size: number,
    color: string,
    deg: number,
    opacity: number
  ) => ({
    position: "absolute",
    top,
    bottom,
    left: side === "left" ? offset : "auto",
    right: side === "right" ? offset : "auto",
    width: size,
    height: size,
    backgroundColor: color,
    borderWidth: 2,
    borderStyle: "solid",
    borderColor: colors.ink,
    borderRadius: "50% 50% 50% 0",
    transform: `rotate(${deg}deg)`,
    opacity,
  }),
  badge: {
    position: "relative",
    backgroundColor: colors.shellPink,
    borderWidth: 3,
    borderStyle: "solid",
    borderColor: colors.ink,
    borderRadius: "50%",
    width: 210,
    height: 210,
    boxShadow: "0 0 0 6px #FFF9F0, 6px 6px 0 0 #332B33",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  sprite: {
    width: 150,
    height: 150,
    imageRendering: "pixelated",
    animationName: hop,
    animationDuration: "2.6s",
    animationTimingFunction: "ease-in-out",
    animationIterationCount: "infinite",
  },
  titleWrap: { textAlign: "center" },
  title: {
    fontFamily: fonts.display,
    fontWeight: 800,
    fontSize: 32,
    color: colors.ink,
    letterSpacing: "0.3px",
  },
  tagline: {
    fontFamily: fonts.hand,
    fontSize: 15,
    color: colors.ink,
    opacity: 0.65,
    marginTop: 2,
    transform: "rotate(-1deg)",
  },
});

export function Splash() {
  const t = useT();
  // Merge the .no-print utility with the StyleX className rather than
  // overwriting it: a bare className="no-print" after the spread would drop
  // every StyleX class and collapse the layout (see PrintView for the same fix).
  const rootProps = stylex.props(styles.root);
  return (
    <div {...rootProps} className={`${rootProps.className ?? ""} no-print`}>
      <div {...stylex.props(styles.drop("70px", "auto", "left", 36, 24, "#FF4D9D", 45, 0.9))} />
      <div {...stylex.props(styles.drop("130px", "auto", "right", 40, 16, "#CDB4F6", 20, 0.85))} />
      <div {...stylex.props(styles.drop("auto", "110px", "left", 48, 18, "#D9F2E4", -15, 0.85))} />
      <div {...stylex.props(styles.badge)}>
        <img src={hopPng} alt="Sunny" {...stylex.props(styles.sprite)} />
      </div>
      <div {...stylex.props(styles.titleWrap)}>
        <div {...stylex.props(styles.title)}>Sunny Planning</div>
        <div {...stylex.props(styles.tagline)}>{t("auth.splashTagline")}</div>
      </div>
    </div>
  );
}
