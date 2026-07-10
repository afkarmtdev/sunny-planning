import * as stylex from "@stylexjs/stylex";
import { useState } from "react";
import { colors, fonts } from "../theme/tokens.stylex";
import { parseISO, toISODate, addMonths, monthLabel, todayISO, shortDate } from "../lib/dates";
import { IconChevronLeft } from "./icons";

const WEEKDAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

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

  const todayBlocked = blocked.has(today) && today !== selected;
  const goToday = () => {
    if (todayBlocked) {
      setView(new Date(parseISO(today).getFullYear(), parseISO(today).getMonth(), 1));
      setNudged(today);
      return;
    }
    const d = parseISO(today);
    setView(new Date(d.getFullYear(), d.getMonth(), 1));
    setNudged(null);
    onChange(today);
  };

  return (
    <div {...stylex.props(styles.wrap)}>
      <div {...stylex.props(styles.head)}>
        <button
          type="button"
          aria-label="Previous month"
          onClick={() => setView((v) => addMonths(v, -1))}
          {...stylex.props(styles.nav)}
        >
          <IconChevronLeft />
        </button>
        <div {...stylex.props(styles.monthText)}>{monthLabel(view)}</div>
        <button
          type="button"
          aria-label="Next month"
          onClick={() => setView((v) => addMonths(v, 1))}
          {...stylex.props(styles.nav, styles.navNext)}
        >
          <IconChevronLeft />
        </button>
      </div>

      <div {...stylex.props(styles.weekRow)}>
        {WEEKDAYS.map((w) => (
          <div key={w} {...stylex.props(styles.weekday)}>
            {w}
          </div>
        ))}
      </div>

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
