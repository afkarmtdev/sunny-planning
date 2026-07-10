import * as stylex from "@stylexjs/stylex";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { colors, fonts } from "../theme/tokens.stylex";
import { Screen } from "../components/Screen";
import { SwipeRow } from "../components/SwipeRow";
import type { SwipeAction } from "../components/SwipeRow";
import { JellyButton } from "../components/JellyButton";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { useApp } from "../store/useApp";
import { useT, type MessageKey, type TFn } from "../lib/i18n";
import { dateSpend, isEstimateSpend } from "../lib/derive";
import { shortDate } from "../lib/dates";
import { rm } from "../lib/format";
import type { Itinerary } from "../lib/types";

const PAGE_SIZE = 8;

type Filter = "all" | "planned" | "completed" | "cancelled";

const FILTERS: { id: Filter; labelKey: MessageKey }[] = [
  { id: "all", labelKey: "dayplan.filter.all" },
  { id: "planned", labelKey: "dayplan.filter.planned" },
  { id: "completed", labelKey: "dayplan.filter.completed" },
  { id: "cancelled", labelKey: "dayplan.filter.cancelled" },
];

const styles = stylex.create({
  title: {
    fontFamily: fonts.display,
    fontWeight: 800,
    fontSize: 24,
    color: colors.ink,
  },
  chipRow: {
    display: "flex",
    gap: 8,
  },
  chip: {
    flex: 1,
    textAlign: "center",
    fontFamily: fonts.display,
    fontWeight: 700,
    fontSize: 12,
    color: colors.ink,
    backgroundColor: colors.white,
    borderWidth: 2,
    borderStyle: "solid",
    borderColor: colors.ink,
    borderRadius: 999,
    paddingBlock: 8,
    cursor: "pointer",
    opacity: 0.55,
  },
  chipOn: {
    backgroundColor: colors.lcdMint,
    opacity: 1,
  },
  list: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  row1: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 10,
  },
  cardTitle: {
    fontFamily: fonts.display,
    fontWeight: 700,
    fontSize: 16,
    color: colors.ink,
  },
  amount: {
    fontFamily: fonts.lcd,
    fontSize: 13,
    color: colors.marmalade,
    flexShrink: 0,
  },
  row2: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    marginTop: 4,
  },
  meta: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.ink,
    opacity: 0.55,
  },
  doneChip: {
    fontFamily: fonts.body,
    fontWeight: 700,
    fontSize: 9,
    color: colors.ink,
    backgroundColor: colors.shellPink,
    borderWidth: 2,
    borderStyle: "solid",
    borderColor: colors.ink,
    borderRadius: 999,
    paddingBlock: 2,
    paddingInline: 8,
  },
  cancelledChip: {
    fontFamily: fonts.body,
    fontWeight: 700,
    fontSize: 9,
    color: colors.ink,
    backgroundColor: colors.white,
    borderWidth: 2,
    borderStyle: "solid",
    borderColor: colors.ink,
    borderRadius: 999,
    paddingBlock: 2,
    paddingInline: 8,
    opacity: 0.6,
  },
  titleMuted: {
    opacity: 0.6,
    textDecorationLine: "line-through",
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
  emptyCard: {
    borderWidth: 3,
    borderStyle: "dashed",
    borderColor: colors.ink,
    opacity: 0.6,
    borderRadius: 16,
    padding: 18,
    textAlign: "center",
    fontFamily: fonts.display,
    fontWeight: 700,
    fontSize: 14,
    color: colors.ink,
  },
  planBtn: {
    fontSize: 16,
    paddingBlock: 15,
    pointerEvents: "auto",
  },
  // Keeps the last card from hiding behind the fixed footer while scrolling.
  footerSpacer: {
    height: 60,
  },
  planFooter: {
    position: "fixed",
    left: "50%",
    transform: "translateX(-50%)",
    bottom: "calc(74px + env(safe-area-inset-bottom))",
    width: "100%",
    maxWidth: 430,
    paddingInline: 18,
    paddingBottom: 6,
    zIndex: 45,
    pointerEvents: "none",
  },
});

function sortedByFilter(itineraries: Itinerary[], filter: Filter): Itinerary[] {
  const planned = itineraries
    .filter((it) => it.status === "planned")
    .sort((a, b) => a.dateISO.localeCompare(b.dateISO));
  const completed = itineraries
    .filter((it) => it.status === "completed")
    .sort((a, b) => b.dateISO.localeCompare(a.dateISO));
  const cancelled = itineraries
    .filter((it) => it.status === "cancelled")
    .sort((a, b) => b.dateISO.localeCompare(a.dateISO));
  if (filter === "planned") return planned;
  if (filter === "completed") return completed;
  if (filter === "cancelled") return cancelled;
  return [...planned, ...completed, ...cancelled];
}

function metaLine(it: Itinerary, t: TFn): string {
  const date = shortDate(it.dateISO);
  const n = it.stops.length;
  if (n === 0) return date;
  return `${date} · ${n === 1 ? t("dayplan.stopCount.one") : t("dayplan.stopCount.other", { n })}`;
}

export function PlanList() {
  const t = useT();
  const navigate = useNavigate();
  const itineraries = useApp((s) => s.itineraries);
  const createItinerary = useApp((s) => s.createItinerary);
  const completeItinerary = useApp((s) => s.completeItinerary);
  const reopenItinerary = useApp((s) => s.reopenItinerary);
  const deleteItinerary = useApp((s) => s.deleteItinerary);
  const [filter, setFilter] = useState<Filter>("planned");
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);

  // Unsaved drafts are not real dates yet; keep them out of the list.
  const filtered = sortedByFilter(itineraries.filter((it) => !it.draft), filter);
  const shown = filtered.slice(0, visible);
  const hasMore = filtered.length > shown.length;

  const changeFilter = (f: Filter) => {
    setFilter(f);
    setVisible(PAGE_SIZE);
  };


  // Swipe-right action: complete a planned date with stops, reopen a finished or cancelled one.
  const leftActionFor = (it: Itinerary): SwipeAction | undefined => {
    if (it.status === "planned") {
      if (it.stops.length === 0) return undefined;
      return { label: t("dayplan.action.complete"), tone: "complete", onAction: () => completeItinerary(it.id) };
    }
    return { label: t("dayplan.action.reopen"), tone: "reopen", onAction: () => reopenItinerary(it.id) };
  };

  return (
    <Screen gap={14}>
      <div {...stylex.props(styles.title)}>{t("dayplan.title")}</div>

      <div {...stylex.props(styles.chipRow)}>
        {FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => changeFilter(f.id)}
            {...stylex.props(styles.chip, filter === f.id && styles.chipOn)}
          >
            {t(f.labelKey)}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div {...stylex.props(styles.emptyCard)}>{t(`dayplan.empty.${filter}`)}</div>
      ) : (
        <div {...stylex.props(styles.list)}>
          {shown.map((it) => (
            <SwipeRow
              key={it.id}
              onClick={() => navigate(`/plan/${it.id}`)}
              leftAction={leftActionFor(it)}
              rightAction={{ label: t("common.delete"), tone: "delete", onAction: () => setPendingDelete(it.id) }}
            >
              <div {...stylex.props(styles.row1)}>
                <div {...stylex.props(styles.cardTitle, it.status === "cancelled" && styles.titleMuted)}>
                  {it.title}
                </div>
                <div {...stylex.props(styles.amount)}>
                  {isEstimateSpend(it) ? "~" : ""}
                  {rm(dateSpend(it))}
                </div>
              </div>
              <div {...stylex.props(styles.row2)}>
                <div {...stylex.props(styles.meta)}>{metaLine(it, t)}</div>
                {it.status === "completed" && <div {...stylex.props(styles.doneChip)}>{t("dayplan.doneChip")}</div>}
                {it.status === "cancelled" && <div {...stylex.props(styles.cancelledChip)}>{t("dayplan.cancelledChip")}</div>}
              </div>
            </SwipeRow>
          ))}
        </div>
      )}

      {hasMore && (
        <button
          type="button"
          {...stylex.props(styles.showMore)}
          onClick={() => setVisible((v) => v + PAGE_SIZE)}
        >
          {t("dayplan.showMore")}
        </button>
      )}

      <div {...stylex.props(styles.footerSpacer)} />

      <div {...stylex.props(styles.planFooter)}>
        <JellyButton
          variant="primary"
          fullWidth
          xstyle={styles.planBtn}
          onClick={() => {
            const id = createItinerary();
            navigate(`/plan/${id}`);
          }}
        >
          {t("dayplan.planNewDate")}
        </JellyButton>
      </div>

      <ConfirmDialog
        open={pendingDelete !== null}
        title={t("dayplan.delete.title")}
        message={t("dayplan.delete.message")}
        confirmLabel={t("common.delete")}
        cancelLabel={t("common.keep")}
        tone="danger"
        onConfirm={() => {
          if (pendingDelete) deleteItinerary(pendingDelete);
          setPendingDelete(null);
        }}
        onClose={() => setPendingDelete(null)}
      />
    </Screen>
  );
}
