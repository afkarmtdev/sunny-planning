import * as stylex from "@stylexjs/stylex";
import { useState } from "react";
import { colors, fonts } from "../theme/tokens.stylex";
import { Screen } from "../components/Screen";
import { StatTile } from "../components/StatTile";
import { SunnySprite } from "../components/SunnySprite";
import { DateSpendSheet } from "../components/DateSpendSheet";
import { JellyButton } from "../components/JellyButton";
import { useApp } from "../store/useApp";
import { completedDates, deletedExpenses, monthStats } from "../lib/derive";
import { addMonths, isSameMonth, monthLabel, shortDate } from "../lib/dates";
import { rm } from "../lib/format";

const PAGE_SIZE = 8;

const styles = stylex.create({
  // Pinned above the scrolling date list; owns the page background so rows
  // slide underneath instead of showing through.
  stickyHead: {
    position: "sticky",
    top: 0,
    zIndex: 5,
    backgroundColor: colors.cream,
    display: "flex",
    flexDirection: "column",
    gap: 14,
    paddingTop: 12,
    marginTop: -12,
    paddingBottom: 2,
  },
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
    justifyContent: "space-between",
    gap: 12,
  },
  hudMain: {
    display: "flex",
    alignItems: "center",
    gap: 12,
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
  monthNav: {
    position: "relative",
    display: "flex",
    flexDirection: "column",
    gap: 6,
    flexShrink: 0,
  },
  monthBtn: {
    width: 30,
    height: 30,
    borderRadius: "50%",
    backgroundColor: colors.cream,
    borderWidth: 2,
    borderStyle: "solid",
    borderColor: colors.ink,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: fonts.display,
    fontWeight: 700,
    fontSize: 14,
    color: colors.ink,
    lineHeight: 1,
    transform: { default: "translateY(0)", ":active": "translateY(2px)" },
  },
  monthBtnDisabled: {
    opacity: 0.35,
    cursor: "default",
    transform: "translateY(0)",
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
    width: "100%",
    textAlign: "left",
    cursor: "pointer",
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
  showMore: {
    borderWidth: 3,
    borderStyle: "dashed",
    borderColor: colors.ink,
    opacity: 0.45,
    borderRadius: 16,
    padding: 14,
    textAlign: "center",
    fontFamily: fonts.display,
    fontWeight: 700,
    fontSize: 13,
    color: colors.ink,
    width: "100%",
    cursor: "pointer",
  },
  emptyMonth: {
    borderWidth: 3,
    borderStyle: "dashed",
    borderColor: colors.ink,
    opacity: 0.6,
    borderRadius: 16,
    padding: 16,
    textAlign: "center",
    fontFamily: fonts.display,
    fontWeight: 700,
    fontSize: 14,
    color: colors.ink,
  },
  deletedRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    backgroundColor: colors.white,
    borderWidth: 3,
    borderStyle: "dashed",
    borderColor: colors.ink,
    borderRadius: 14,
    paddingBlock: 10,
    paddingInline: 14,
    opacity: 0.85,
  },
  deletedLabel: {
    fontFamily: fonts.display,
    fontWeight: 700,
    fontSize: 13,
    color: colors.ink,
    textDecorationLine: "line-through",
    textDecorationColor: "rgba(51,43,51,0.5)",
  },
  deletedMeta: {
    fontFamily: fonts.body,
    fontSize: 10,
    color: colors.ink,
    opacity: 0.55,
  },
  restoreBtn: {
    fontSize: 11,
    paddingBlock: 6,
    paddingInline: 12,
    flexShrink: 0,
  },
});

export function Costs() {
  const itineraries = useApp((s) => s.itineraries);
  const restoreExpense = useApp((s) => s.restoreExpense);
  const deleted = deletedExpenses(itineraries);
  const [monthOffset, setMonthOffset] = useState(0);
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selectedItinerary = itineraries.find((it) => it.id === selectedId) ?? null;

  const refDate = addMonths(new Date(), monthOffset);
  const { total, count, avg } = monthStats(itineraries, refDate);
  const dates = completedDates(itineraries).filter((d) => isSameMonth(d.dateISO, refDate));
  const shown = dates.slice(0, visible);
  const hasMore = dates.length > shown.length;

  const changeMonth = (delta: number) => {
    if (delta > 0 && monthOffset >= 0) return;
    setMonthOffset((m) => m + delta);
    setVisible(PAGE_SIZE);
  };

  const isCurrentMonth = monthOffset === 0;

  return (
    <Screen gap={14}>
      <div {...stylex.props(styles.stickyHead)}>
        <div {...stylex.props(styles.title)}>Cost Tracker</div>

        <div {...stylex.props(styles.hud)}>
        <div {...stylex.props(styles.hudScanlines)} />
        <div {...stylex.props(styles.hudRow)}>
          <div {...stylex.props(styles.hudMain)}>
            <SunnySprite size={48} expression="happy" blink />
            <div>
              <div {...stylex.props(styles.hudLabel)}>
                {isCurrentMonth ? "THIS MONTH" : monthLabel(refDate).toUpperCase()}
              </div>
              <div {...stylex.props(styles.hudValue)}>{rm(total)}</div>
            </div>
          </div>
          <div {...stylex.props(styles.monthNav)}>
            <button
              type="button"
              aria-label="Previous month"
              onClick={() => changeMonth(-1)}
              {...stylex.props(styles.monthBtn)}
            >
              &lt;
            </button>
            <button
              type="button"
              aria-label="Next month"
              disabled={isCurrentMonth}
              onClick={() => changeMonth(1)}
              {...stylex.props(styles.monthBtn, isCurrentMonth && styles.monthBtnDisabled)}
            >
              &gt;
            </button>
          </div>
        </div>
      </div>

        <div {...stylex.props(styles.statRow)}>
          <StatTile value={rm(avg)} label="avg per date" />
          <StatTile value={String(count)} label="dates this month" />
        </div>

        <div {...stylex.props(styles.sectionTitle)}>
          {isCurrentMonth ? "Dates this month" : `Dates in ${monthLabel(refDate)}`}
        </div>
      </div>

      {dates.length === 0 ? (
        <div {...stylex.props(styles.emptyMonth)}>No dates logged this month.</div>
      ) : (
        <div {...stylex.props(styles.list)}>
          {shown.map((d) => (
            <button
              key={d.id}
              type="button"
              {...stylex.props(styles.row)}
              onClick={() => setSelectedId(d.id)}
            >
              <div>
                <div {...stylex.props(styles.rowLabel)}>{d.label}</div>
                <div {...stylex.props(styles.rowDate)}>{shortDate(d.dateISO)}</div>
              </div>
              <div {...stylex.props(styles.rowAmount)}>
                {d.isEstimate ? "~" : ""}
                {rm(d.amount)}
              </div>
            </button>
          ))}
        </div>
      )}

      {hasMore && (
        <button
          type="button"
          {...stylex.props(styles.showMore)}
          onClick={() => setVisible((v) => v + PAGE_SIZE)}
        >
          Show more
        </button>
      )}

      {deleted.length > 0 && (
        <>
          <div {...stylex.props(styles.sectionTitle)}>Recently deleted</div>
          <div {...stylex.props(styles.list)}>
            {deleted.map((d) => (
              <div key={d.expense.id} {...stylex.props(styles.deletedRow)}>
                <div>
                  <div {...stylex.props(styles.deletedLabel)}>
                    {d.expense.label} · {rm(d.expense.amount)}
                  </div>
                  <div {...stylex.props(styles.deletedMeta)}>
                    {d.itineraryTitle} · {shortDate(d.dateISO)}
                  </div>
                </div>
                <JellyButton
                  variant="white"
                  xstyle={styles.restoreBtn}
                  onClick={() => restoreExpense(d.itineraryId, d.expense.id)}
                >
                  Restore
                </JellyButton>
              </div>
            ))}
          </div>
        </>
      )}

      <DateSpendSheet itinerary={selectedItinerary} onClose={() => setSelectedId(null)} />
    </Screen>
  );
}
