import * as stylex from "@stylexjs/stylex";
import { useState } from "react";
import { colors, fonts } from "../theme/tokens.stylex";
import { parseISO, toISODate, addMonths, monthLabel, todayISO, shortDate } from "../lib/dates";
import { IconChevronLeft } from "./icons";

const WEEKDAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
const MONTHS_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
// How many years fill one page of the year grid (3 columns x 4 rows).
const YEAR_PAGE = 12;

const styles = stylex.create({
  wrap: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  head: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  nav: {
    width: 30,
    height: 30,
    borderRadius: "50%",
    backgroundColor: colors.white,
    borderWidth: 2,
    borderStyle: "solid",
    borderColor: colors.ink,
    color: colors.ink,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    transform: { default: "translateY(0)", ":active": "translateY(2px)" },
  },
  navNext: {
    transform: "scaleX(-1)",
  },
  monthText: {
    fontFamily: fonts.display,
    fontWeight: 800,
    fontSize: 15,
    color: colors.ink,
    backgroundColor: "transparent",
    borderWidth: 0,
    borderRadius: 10,
    paddingBlock: 4,
    paddingInline: 10,
    cursor: "pointer",
    transform: { default: "translateY(0)", ":active": "translateY(2px)" },
  },
  panelGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: 6,
    paddingBlock: 4,
  },
  panelCell: {
    height: 42,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: fonts.body,
    fontWeight: 700,
    fontSize: 13,
    color: colors.ink,
    backgroundColor: "transparent",
    borderWidth: 2,
    borderStyle: "solid",
    borderColor: "transparent",
    borderRadius: 12,
    cursor: "pointer",
    transform: { default: "translateY(0)", ":active": "translateY(2px)" },
  },
  panelCellSelected: {
    backgroundColor: colors.heartPop,
    borderColor: colors.ink,
    color: colors.white,
  },
  panelCellToday: {
    borderColor: colors.ink,
  },
  weekRow: {
    display: "grid",
    gridTemplateColumns: "repeat(7, 1fr)",
  },
  weekday: {
    textAlign: "center",
    fontFamily: fonts.body,
    fontWeight: 700,
    fontSize: 10,
    color: colors.ink,
    opacity: 0.45,
    paddingBlock: 2,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(7, 1fr)",
    gap: 4,
  },
  spacer: {
    height: 34,
  },
  cell: {
    height: 34,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: fonts.body,
    fontWeight: 700,
    fontSize: 13,
    color: colors.ink,
    backgroundColor: "transparent",
    borderWidth: 2,
    borderStyle: "solid",
    borderColor: "transparent",
    borderRadius: 12,
    cursor: "pointer",
  },
  cellToday: {
    borderColor: colors.ink,
    opacity: 0.9,
  },
  cellSelected: {
    backgroundColor: colors.heartPop,
    borderColor: colors.ink,
    color: colors.white,
    opacity: 1,
  },
  cellDisabled: {
    opacity: 0.28,
    cursor: "not-allowed",
    textDecorationLine: "line-through",
  },
  todayBtn: {
    alignSelf: "center",
    marginTop: 2,
    fontFamily: fonts.display,
    fontWeight: 700,
    fontSize: 12,
    color: colors.ink,
    backgroundColor: colors.lcdMint,
    borderWidth: 2,
    borderStyle: "solid",
    borderColor: colors.ink,
    borderRadius: 999,
    paddingBlock: 6,
    paddingInline: 16,
    cursor: "pointer",
    transform: { default: "translateY(0)", ":active": "translateY(2px)" },
  },
  note: {
    alignSelf: "center",
    marginTop: 2,
    fontFamily: fonts.body,
    fontWeight: 700,
    fontSize: 11,
    color: colors.ink,
    opacity: 0.7,
    textAlign: "center",
  },
});

type Props = {
  value: string;
  onChange: (iso: string) => void;
  /** Dates already owned by other itineraries; not selectable. */
  disabledDates?: string[];
};

export function Calendar({ value, onChange, disabledDates }: Props) {
  const selected = value || todayISO();
  const [view, setView] = useState(() => {
    const d = parseISO(selected);
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  // Drill-down level: pick a day, jump to a month, or scan years fast.
  const [mode, setMode] = useState<"days" | "months" | "years">("days");
  // The date the user tapped that is already taken; shows a gentle reason note.
  const [nudged, setNudged] = useState<string | null>(null);
  const today = todayISO();
  const blocked = new Set(disabledDates ?? []);

  const year = view.getFullYear();
  const month = view.getMonth();
  // Monday-first, matching the rest of the app's week handling.
  const leading = (new Date(year, month, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: (string | null)[] = [];
  for (let i = 0; i < leading; i++) cells.push(null);
  for (let day = 1; day <= daysInMonth; day++) cells.push(toISODate(new Date(year, month, day)));

  const todayDate = parseISO(today);
  const selectedDate = parseISO(selected);
  // First year shown on the current page of the year grid; pages tile the timeline.
  const yearPageStart = Math.floor(year / YEAR_PAGE) * YEAR_PAGE;

  const todayBlocked = blocked.has(today) && today !== selected;
  const goToday = () => {
    if (todayBlocked) {
      setView(new Date(todayDate.getFullYear(), todayDate.getMonth(), 1));
      setMode("days");
      setNudged(today);
      return;
    }
    setView(new Date(todayDate.getFullYear(), todayDate.getMonth(), 1));
    setMode("days");
    setNudged(null);
    onChange(today);
  };

  // Header chevrons step by the unit the current mode shows.
  const stepBack = () => {
    if (mode === "days") setView((v) => addMonths(v, -1));
    else if (mode === "months") setView((v) => new Date(v.getFullYear() - 1, v.getMonth(), 1));
    else setView((v) => new Date(v.getFullYear() - YEAR_PAGE, v.getMonth(), 1));
  };
  const stepForward = () => {
    if (mode === "days") setView((v) => addMonths(v, 1));
    else if (mode === "months") setView((v) => new Date(v.getFullYear() + 1, v.getMonth(), 1));
    else setView((v) => new Date(v.getFullYear() + YEAR_PAGE, v.getMonth(), 1));
  };
  // Tapping the header label drills out: days -> months -> years.
  const headerLabel =
    mode === "days" ? monthLabel(view) : mode === "months" ? String(year) : `${yearPageStart} - ${yearPageStart + YEAR_PAGE - 1}`;
  const onHeaderTap = () => setMode((m) => (m === "days" ? "months" : m === "months" ? "years" : "years"));

  return (
    <div {...stylex.props(styles.wrap)}>
      <div {...stylex.props(styles.head)}>
        <button
          type="button"
          aria-label={mode === "days" ? "Previous month" : mode === "months" ? "Previous year" : "Previous years"}
          onClick={stepBack}
          {...stylex.props(styles.nav)}
        >
          <IconChevronLeft />
        </button>
        <button
          type="button"
          aria-label={mode === "days" ? "Pick a month" : mode === "months" ? "Pick a year" : headerLabel}
          onClick={onHeaderTap}
          {...stylex.props(styles.monthText)}
        >
          {headerLabel}
        </button>
        <button
          type="button"
          aria-label={mode === "days" ? "Next month" : mode === "months" ? "Next year" : "Next years"}
          onClick={stepForward}
          {...stylex.props(styles.nav, styles.navNext)}
        >
          <IconChevronLeft />
        </button>
      </div>

      {mode === "days" && (
        <div {...stylex.props(styles.weekRow)}>
          {WEEKDAYS.map((w) => (
            <div key={w} {...stylex.props(styles.weekday)}>
              {w}
            </div>
          ))}
        </div>
      )}

      {mode === "days" && (
        <div {...stylex.props(styles.grid)}>
          {cells.map((iso, i) => {
            if (iso === null) return <div key={`x${i}`} {...stylex.props(styles.spacer)} />;
            const isBlocked = blocked.has(iso) && iso !== selected;
            return (
              <button
                key={iso}
                type="button"
                aria-disabled={isBlocked}
                onClick={() => {
                  if (isBlocked) {
                    setNudged(iso);
                    return;
                  }
                  setNudged(null);
                  onChange(iso);
                }}
                {...stylex.props(
                  styles.cell,
                  iso === today && styles.cellToday,
                  iso === selected && styles.cellSelected,
                  isBlocked && styles.cellDisabled
                )}
              >
                {parseISO(iso).getDate()}
              </button>
            );
          })}
        </div>
      )}

      {mode === "months" && (
        <div {...stylex.props(styles.panelGrid)}>
          {MONTHS_SHORT.map((label, m) => {
            const isSelected = year === selectedDate.getFullYear() && m === selectedDate.getMonth();
            const isThisMonth = year === todayDate.getFullYear() && m === todayDate.getMonth();
            return (
              <button
                key={label}
                type="button"
                onClick={() => {
                  setView(new Date(year, m, 1));
                  setMode("days");
                }}
                {...stylex.props(
                  styles.panelCell,
                  isThisMonth && styles.panelCellToday,
                  isSelected && styles.panelCellSelected
                )}
              >
                {label}
              </button>
            );
          })}
        </div>
      )}

      {mode === "years" && (
        <div {...stylex.props(styles.panelGrid)}>
          {Array.from({ length: YEAR_PAGE }, (_, i) => yearPageStart + i).map((y) => {
            const isSelected = y === selectedDate.getFullYear();
            const isThisYear = y === todayDate.getFullYear();
            return (
              <button
                key={y}
                type="button"
                onClick={() => {
                  setView(new Date(y, month, 1));
                  setMode("months");
                }}
                {...stylex.props(
                  styles.panelCell,
                  isThisYear && styles.panelCellToday,
                  isSelected && styles.panelCellSelected
                )}
              >
                {y}
              </button>
            );
          })}
        </div>
      )}

      {nudged && (
        <div {...stylex.props(styles.note)} role="status">
          {shortDate(nudged)} already has a date-plan, so it cannot be picked.
        </div>
      )}

      <button
        type="button"
        onClick={goToday}
        aria-disabled={todayBlocked}
        {...stylex.props(styles.todayBtn, todayBlocked && styles.cellDisabled)}
      >
        Today
      </button>
    </div>
  );
}
