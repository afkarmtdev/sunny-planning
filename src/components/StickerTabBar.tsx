import * as stylex from "@stylexjs/stylex";
import type { ReactElement } from "react";
import { NavLink } from "react-router-dom";
import { colors, fonts } from "../theme/tokens.stylex";
import { IconClock, IconCoin, IconHeart, IconHome, IconPaw, IconPhoto } from "./icons";
import { sfx } from "../lib/sfx";
import { useT, type MessageKey } from "../lib/i18n";

const styles = stylex.create({
  bar: {
    position: "fixed",
    bottom: 0,
    left: "50%",
    transform: "translateX(-50%)",
    width: "100%",
    maxWidth: 430,
    paddingInline: 16,
    paddingTop: 30,
    paddingBottom: "calc(10px + env(safe-area-inset-bottom))",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
    gap: 4,
    backgroundImage: "linear-gradient(180deg, rgba(255,249,240,0), rgba(255,249,240,0.95) 52%)",
    pointerEvents: "none",
    zIndex: 40,
  },
  link: {
    pointerEvents: "auto",
    textDecoration: "none",
  },
  sticker: (deg: number) => ({
    transform: `rotate(${deg}deg)`,
  }),
  tab: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 2,
    backgroundColor: colors.white,
    borderWidth: 2,
    borderStyle: "solid",
    borderColor: colors.ink,
    borderRadius: 10,
    paddingBlock: 6,
    paddingInline: 5,
    boxShadow: "2px 2px 0 0 #332B33",
    color: colors.ink,
    opacity: 0.55,
    minWidth: 44,
  },
  tabActive: {
    backgroundColor: colors.shellPink,
    borderWidth: 2.5,
    borderRadius: 12,
    paddingBlock: 9,
    paddingInline: 8,
    boxShadow: "3px 3px 0 0 #332B33",
    color: colors.heartPop,
    opacity: 1,
  },
  label: {
    fontFamily: fonts.body,
    fontSize: 9,
    fontWeight: 700,
  },
  labelActive: {
    fontSize: 9.5,
    fontWeight: 800,
  },
});

const TABS: { to: string; end: boolean; label: MessageKey; rot: number; icon: (active: boolean) => ReactElement }[] = [
  { to: "/", end: true, label: "common.home", rot: -4, icon: (active: boolean) => <IconHome size={active ? 18 : 16} /> },
  { to: "/plan", end: false, label: "ui.tab.plan", rot: 3, icon: (active: boolean) => <IconHeart size={active ? 15 : 13} /> },
  { to: "/today", end: false, label: "ui.tab.today", rot: 4, icon: (active: boolean) => <IconClock size={active ? 16 : 15} /> },
  {
    to: "/costs",
    end: false,
    label: "ui.tab.costs",
    rot: -3,
    icon: (active: boolean) => <IconCoin size={active ? 16 : 15} ringColor={active ? "#FFD3E8" : "#FFFFFF"} />,
  },
  { to: "/album", end: false, label: "ui.tab.album", rot: 4, icon: (active: boolean) => <IconPhoto size={active ? 18 : 17} /> },
  { to: "/ratings", end: false, label: "ui.tab.ratings", rot: -4, icon: (active: boolean) => <IconPaw size={active ? 18 : 17} /> },
];

export function StickerTabBar() {
  const t = useT();
  const barProps = stylex.props(styles.bar);
  return (
    <nav {...barProps} className={`${barProps.className ?? ""} no-print`}>
      {TABS.map((tab) => (
        <NavLink key={tab.to} to={tab.to} end={tab.end} onClick={() => sfx.tap()} {...stylex.props(styles.link)}>
          {({ isActive }) => (
            <div {...stylex.props(styles.tab, isActive && styles.tabActive, styles.sticker(tab.rot))}>
              {tab.icon(isActive)}
              <div {...stylex.props(styles.label, isActive && styles.labelActive)}>{t(tab.label)}</div>
            </div>
          )}
        </NavLink>
      ))}
    </nav>
  );
}
