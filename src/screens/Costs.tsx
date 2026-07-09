import * as stylex from "@stylexjs/stylex";
import { useRef, useState } from "react";
import { colors, fonts } from "../theme/tokens.stylex";
import { Screen } from "../components/Screen";
import { StatTile } from "../components/StatTile";
import { SunnySprite } from "../components/SunnySprite";
import { useApp } from "../store/useApp";
import { monthStats } from "../lib/derive";
import { shortDate } from "../lib/dates";
import { rm } from "../lib/format";
import { fileToDataUrl } from "../lib/images";

const styles = stylex.create({
  title: {
    fontFamily: fonts.display,
    fontWeight: 800,
    fontSize: 24,
    color: colors.ink,
  },
  hud: {
    position: "relative",
    backgroundColor: colors.ink,
    borderRadius: 22,
    padding: 18,
    boxShadow: "0 0 0 4px #FFD3E8",
    overflow: "hidden",
  },
  hudScanlines: {
    position: "absolute",
    inset: 0,
    backgroundImage:
      "repeating-linear-gradient(rgba(255,249,240,0.05) 0px, rgba(255,249,240,0.05) 1px, transparent 1px, transparent 3px)",
  },
  hudRow: {
    position: "relative",
    display: "flex",
    alignItems: "center",
    gap: 12,
  },
  coin: {
    position: "relative",
    width: 44,
    height: 44,
    borderRadius: "50%",
    backgroundColor: colors.marmalade,
    borderWidth: 3,
    borderStyle: "solid",
    borderColor: colors.cream,
    flexShrink: 0,
  },
  coinRing: {
    position: "absolute",
    inset: 5,
    borderRadius: "50%",
    borderWidth: 2,
    borderStyle: "solid",
    borderColor: "rgba(51,43,51,0.3)",
  },
  coinHeart: {
    position: "absolute",
    top: 15,
    left: "50%",
    width: 9,
    height: 9,
    backgroundColor: colors.ink,
    borderRadius: "50% 50% 50% 0",
    transform: "translateX(-50%) rotate(45deg)",
  },
  hudLabel: {
    fontFamily: fonts.body,
    fontSize: 10,
    color: colors.lcdMint,
    opacity: 0.75,
    letterSpacing: 0.5,
  },
  hudValue: {
    fontFamily: fonts.lcd,
    fontSize: 28,
    color: colors.cream,
    letterSpacing: 1,
  },
  statRow: {
    display: "flex",
    gap: 8,
  },
  sectionTitle: {
    fontFamily: fonts.display,
    fontWeight: 700,
    fontSize: 14,
    color: colors.ink,
    marginTop: 4,
  },
  list: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  row: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    backgroundColor: colors.white,
    borderWidth: 3,
    borderStyle: "solid",
    borderColor: colors.ink,
    borderRadius: 14,
    paddingBlock: 10,
    paddingInline: 14,
  },
  rowLabel: {
    fontFamily: fonts.display,
    fontWeight: 700,
    fontSize: 13,
    color: colors.ink,
  },
  rowDate: {
    fontFamily: fonts.body,
    fontSize: 10,
    color: colors.ink,
    opacity: 0.55,
  },
  rowAmount: {
    fontFamily: fonts.lcd,
    fontSize: 14,
    color: colors.marmalade,
    flexShrink: 0,
  },
  dropZone: {
    borderWidth: 3,
    borderStyle: "dashed",
    borderColor: "rgba(51,43,51,0.4)",
    borderRadius: 16,
    backgroundColor: colors.cream,
    minHeight: 140,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: 14,
    cursor: "pointer",
    width: "100%",
  },
  dropTitle: {
    fontFamily: fonts.display,
    fontWeight: 700,
    fontSize: 13,
    color: "rgba(51,43,51,0.8)",
  },
  dropSub: {
    fontFamily: fonts.body,
    fontSize: 10,
    color: "rgba(51,43,51,0.5)",
    marginTop: 2,
  },
  dropSaved: {
    fontFamily: fonts.hand,
    fontSize: 13,
    color: colors.heartPop,
    marginTop: 2,
  },
  hiddenInput: {
    display: "none",
  },
});

export function Costs() {
  const expenses = useApp((s) => s.expenses);
  const attachReceipt = useApp((s) => s.attachReceipt);
  const inputRef = useRef<HTMLInputElement>(null);
  const [savedTo, setSavedTo] = useState<string | null>(null);

  const { total, count, avg } = monthStats(expenses);
  const recent = [...expenses].sort((a, b) => b.dateISO.localeCompare(a.dateISO)).slice(0, 8);

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    try {
      const dataUrl = await fileToDataUrl(file, 1100);
      const expense = attachReceipt(dataUrl);
      setSavedTo(expense ? expense.label : null);
      setTimeout(() => setSavedTo(null), 2600);
    } catch {
      setSavedTo(null);
    }
  };

  return (
    <Screen gap={14}>
      <div {...stylex.props(styles.title)}>Cost Tracker</div>

      <div {...stylex.props(styles.hud)}>
        <div {...stylex.props(styles.hudScanlines)} />
        <div {...stylex.props(styles.hudRow)}>
          <div {...stylex.props(styles.coin)} aria-hidden>
            <div {...stylex.props(styles.coinRing)} />
            <div {...stylex.props(styles.coinHeart)} />
          </div>
          <div>
            <div {...stylex.props(styles.hudLabel)}>THIS MONTH</div>
            <div {...stylex.props(styles.hudValue)}>{rm(total)}</div>
          </div>
        </div>
      </div>

      <div {...stylex.props(styles.statRow)}>
        <StatTile value={rm(avg)} label="avg per date" />
        <StatTile value={String(count)} label="dates this month" />
      </div>

      <div {...stylex.props(styles.sectionTitle)}>Recent dates</div>

      <div {...stylex.props(styles.list)}>
        {recent.map((e) => (
          <div key={e.id} {...stylex.props(styles.row)}>
            <div>
              <div {...stylex.props(styles.rowLabel)}>{e.label}</div>
              <div {...stylex.props(styles.rowDate)}>{shortDate(e.dateISO)}</div>
            </div>
            <div {...stylex.props(styles.rowAmount)}>{rm(e.amount)}</div>
          </div>
        ))}
      </div>

      <button
        type="button"
        {...stylex.props(styles.dropZone)}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          void handleFile(e.dataTransfer.files[0]);
        }}
      >
        <SunnySprite size={70} dim />
        <div {...stylex.props(styles.dropTitle)}>Upload a receipt</div>
        {savedTo ? (
          <div {...stylex.props(styles.dropSaved)}>saved to "{savedTo}"</div>
        ) : (
          <div {...stylex.props(styles.dropSub)}>Drag it here or tap to browse</div>
        )}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        {...stylex.props(styles.hiddenInput)}
        onChange={(e) => {
          void handleFile(e.target.files?.[0]);
          e.target.value = "";
        }}
      />
    </Screen>
  );
}
