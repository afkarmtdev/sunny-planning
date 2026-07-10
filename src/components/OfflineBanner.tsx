import * as stylex from "@stylexjs/stylex";
import { colors, fonts } from "../theme/tokens.stylex";
import { IconWifiOff } from "./icons";
import { useOnline } from "../lib/useOnline";
import { useT } from "../lib/i18n";

// A non-blocking notice, not a wall. Sunny is local-first, so offline is not a
// failure state: everything keeps working and saves on the device. This slim
// pill just tells the truth and reassures, then slides away when the network
// returns. Mounted app-wide (outside the router) alongside the update prompt.

const slideIn = stylex.keyframes({
  "0%": { transform: "translate(-50%, -120%)", opacity: 0 },
  "100%": { transform: "translate(-50%, 0)", opacity: 1 },
});

const styles = stylex.create({
  pill: {
    position: "fixed",
    top: "max(12px, env(safe-area-inset-top))",
    left: "50%",
    zIndex: 55,
    display: "flex",
    alignItems: "center",
    gap: 9,
    maxWidth: "calc(100vw - 28px)",
    paddingBlock: 9,
    paddingInline: 14,
    backgroundColor: colors.kraft,
    borderWidth: 2,
    borderStyle: "solid",
    borderColor: colors.ink,
    borderRadius: 999,
    boxShadow: "3px 3px 0 0 #332B33",
    color: colors.ink,
    animationName: slideIn,
    animationDuration: "0.28s",
    animationTimingFunction: "ease-out",
  },
  icon: {
    display: "flex",
    color: colors.ink,
    opacity: 0.8,
    flexShrink: 0,
  },
  text: {
    fontFamily: fonts.body,
    fontWeight: 800,
    fontSize: 12.5,
    lineHeight: 1.2,
  },
  sub: {
    fontWeight: 700,
    opacity: 0.6,
  },
});

export function OfflineBanner() {
  const t = useT();
  const online = useOnline();
  if (online) return null;
  return (
    <div {...stylex.props(styles.pill)} role="status" aria-live="polite" className="no-print">
      <span {...stylex.props(styles.icon)}>
        <IconWifiOff size={16} />
      </span>
      <span {...stylex.props(styles.text)}>
        {t("ui.offline.text")} <span {...stylex.props(styles.sub)}>{t("ui.offline.sub")}</span>
      </span>
    </div>
  );
}
