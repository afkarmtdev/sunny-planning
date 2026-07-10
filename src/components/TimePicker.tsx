import * as stylex from "@stylexjs/stylex";
import { useEffect, useRef, useState } from "react";
import { colors, fonts } from "../theme/tokens.stylex";
import { parseTime, formatTime, type TimeParts } from "../lib/dates";
import { useT } from "../lib/i18n";
import { IconChevronLeft } from "./icons";

const HOURS = Array.from({ length: 12 }, (_, i) => i + 1);
// Five-minute increments cover the way people actually schedule stops.
const MINUTES = Array.from({ length: 12 }, (_, i) => i * 5);

const styles = stylex.create({
  wrap: {
    display: "flex",
    gap: 8,
    alignItems: "stretch",
  },
  field: {
    position: "relative",
    flex: 1,
  },
  select: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 6,
    backgroundColor: colors.white,
    borderWidth: 3,
    borderStyle: "solid",
    borderColor: { default: colors.ink, ":focus": colors.heartPop },
    borderRadius: 14,
    paddingBlock: 11,
    paddingInline: 14,
    fontFamily: fonts.body,
    fontSize: 14,
    fontWeight: 700,
    color: colors.ink,
    cursor: "pointer",
    outline: "none",
  },
  selectOpen: {
    borderColor: colors.heartPop,
  },
  placeholder: {
    opacity: 0.45,
    fontWeight: 400,
  },
  chevron: {
    display: "inline-flex",
    transform: "rotate(-90deg)",
    opacity: 0.6,
  },
  panel: {
    position: "absolute",
    insetBlockStart: "calc(100% + 4px)",
    insetInlineStart: 0,
    insetInlineEnd: 0,
    zIndex: 41,
    maxHeight: 180,
    overflowY: "auto",
    backgroundColor: colors.white,
    borderWidth: 3,
    borderStyle: "solid",
    borderColor: colors.ink,
    borderRadius: 14,
    padding: 4,
    boxShadow: "4px 4px 0 0 #332B33",
    display: "flex",
    flexDirection: "column",
    gap: 2,
  },
  option: {
    textAlign: "center",
    fontFamily: fonts.body,
    fontWeight: 700,
    fontSize: 14,
    color: colors.ink,
    backgroundColor: "transparent",
    borderWidth: 2,
    borderStyle: "solid",
    borderColor: "transparent",
    borderRadius: 10,
    paddingBlock: 8,
    cursor: "pointer",
  },
  optionOn: {
    backgroundColor: colors.heartPop,
    borderColor: colors.ink,
    color: colors.white,
  },
  ampmRow: {
    display: "flex",
    flexBasis: 104,
    flexGrow: 0,
    flexShrink: 0,
    gap: 4,
    padding: 4,
    borderWidth: 3,
    borderStyle: "solid",
    borderColor: colors.ink,
    borderRadius: 14,
    backgroundColor: colors.white,
  },
  ampmChip: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    fontFamily: fonts.body,
    fontWeight: 800,
    fontSize: 13,
    color: colors.ink,
    backgroundColor: "transparent",
    borderWidth: 0,
    borderRadius: 10,
    cursor: "pointer",
  },
  ampmChipOn: {
    backgroundColor: colors.heartPop,
    color: colors.white,
  },
});

type Props = {
  value: string;
  onChange: (time: string) => void;
};

/**
 * Themed replacement for a free-text time field. Emits a "3:00 PM" style
 * string so stored stop times stay in the same format the app displays.
 */
export function TimePicker({ value, onChange }: Props) {
  const t = useT();
  const parts = parseTime(value);
  const [open, setOpen] = useState<null | "hour" | "minute">(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  // Dismiss the open dropdown on any outside pointer or Escape. A backdrop
  // element is unreliable here because the animated Sheet transforms its
  // subtree, so a document-level listener is the robust choice.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(null);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
    };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // Fill the untouched half with a sensible default so the first pick already
  // yields a valid, complete time.
  const emit = (next: Partial<TimeParts>) => {
    const merged: TimeParts = {
      hour12: next.hour12 ?? parts?.hour12 ?? 12,
      minute: next.minute ?? parts?.minute ?? 0,
      ampm: next.ampm ?? parts?.ampm ?? "PM",
    };
    onChange(formatTime(merged));
  };

  return (
    <div ref={wrapRef} {...stylex.props(styles.wrap)}>
      <div {...stylex.props(styles.field)}>
        <button
          type="button"
          onClick={() => setOpen(open === "hour" ? null : "hour")}
          {...stylex.props(styles.select, open === "hour" && styles.selectOpen)}
        >
          <span {...(parts ? {} : stylex.props(styles.placeholder))}>{parts ? parts.hour12 : t("builder.time.hour")}</span>
          <span {...stylex.props(styles.chevron)}>
            <IconChevronLeft />
          </span>
        </button>
        {open === "hour" && (
          <div {...stylex.props(styles.panel)} role="listbox" aria-label={t("builder.time.hour")}>
            {HOURS.map((h) => (
              <button
                key={h}
                type="button"
                role="option"
                aria-selected={parts?.hour12 === h}
                onClick={() => {
                  emit({ hour12: h });
                  setOpen(null);
                }}
                {...stylex.props(styles.option, parts?.hour12 === h && styles.optionOn)}
              >
                {h}
              </button>
            ))}
          </div>
        )}
      </div>

      <div {...stylex.props(styles.field)}>
        <button
          type="button"
          onClick={() => setOpen(open === "minute" ? null : "minute")}
          {...stylex.props(styles.select, open === "minute" && styles.selectOpen)}
        >
          <span {...(parts ? {} : stylex.props(styles.placeholder))}>
            {parts ? String(parts.minute).padStart(2, "0") : t("builder.time.min")}
          </span>
          <span {...stylex.props(styles.chevron)}>
            <IconChevronLeft />
          </span>
        </button>
        {open === "minute" && (
          <div {...stylex.props(styles.panel)} role="listbox" aria-label={t("builder.time.minute")}>
            {MINUTES.map((min) => {
              const on = parts?.minute === min;
              return (
                <button
                  key={min}
                  type="button"
                  role="option"
                  aria-selected={on}
                  onClick={() => {
                    emit({ minute: min });
                    setOpen(null);
                  }}
                  {...stylex.props(styles.option, on && styles.optionOn)}
                >
                  {String(min).padStart(2, "0")}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div {...stylex.props(styles.ampmRow)} role="group" aria-label={t("builder.time.ampm")}>
        {(["AM", "PM"] as const).map((ap) => (
          <button
            key={ap}
            type="button"
            aria-pressed={parts?.ampm === ap}
            onClick={() => emit({ ampm: ap })}
            {...stylex.props(styles.ampmChip, parts?.ampm === ap && styles.ampmChipOn)}
          >
            {t(ap === "AM" ? "builder.time.am" : "builder.time.pm")}
          </button>
        ))}
      </div>
    </div>
  );
}
