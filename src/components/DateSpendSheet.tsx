import * as stylex from "@stylexjs/stylex";
import { useEffect, useState } from "react";
import { colors, fonts } from "../theme/tokens.stylex";
import { Sheet } from "./Sheet";
import { JellyButton } from "./JellyButton";
import { LcdPanel, LcdValue } from "./Lcd";
import { ExpenseSheet } from "./ExpenseSheet";
import { ReceiptLightbox } from "./ReceiptLightbox";
import { useReceiptUrl } from "../lib/receipts";
import { dateSpend, itineraryTotal } from "../lib/derive";
import { shortDate } from "../lib/dates";
import { rm } from "../lib/format";
import type { Expense, Itinerary } from "../lib/types";

const styles = stylex.create({
  dateLabel: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.ink,
    opacity: 0.55,
    marginTop: -6,
  },
  totalsRow: {
    borderRadius: 14,
    paddingBlock: 10,
    paddingInline: 14,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  totalLabel: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.ink,
    opacity: 0.65,
  },
  totalSub: {
    fontFamily: fonts.body,
    fontSize: 10,
    color: colors.ink,
    opacity: 0.5,
    marginTop: 2,
  },
  totalValue: { fontSize: 18 },
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
    cursor: "pointer",
  },
  rowLeft: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    minWidth: 0,
  },
  rowThumb: {
    width: 40,
    height: 40,
    objectFit: "cover",
    borderRadius: 8,
    borderWidth: 2,
    borderStyle: "solid",
    borderColor: colors.ink,
    flexShrink: 0,
    cursor: "pointer",
  },
  rowLabel: {
    fontFamily: fonts.display,
    fontWeight: 700,
    fontSize: 13,
    color: colors.ink,
  },
  rowStop: {
    fontFamily: fonts.body,
    fontSize: 10,
    color: colors.ink,
    opacity: 0.55,
  },
  rowAmount: {
    fontFamily: fonts.lcd,
    fontSize: 13,
    color: colors.marmalade,
    flexShrink: 0,
  },
  emptyList: {
    borderWidth: 3,
    borderStyle: "dashed",
    borderColor: colors.ink,
    opacity: 0.6,
    borderRadius: 16,
    padding: 16,
    textAlign: "center",
    fontFamily: fonts.display,
    fontWeight: 700,
    fontSize: 13,
    color: colors.ink,
  },
  addBtn: {
    fontSize: 14,
    paddingBlock: 11,
  },
});

function ExpenseRow({
  expense,
  stopName,
  onEdit,
  onOpenReceipt,
}: {
  expense: Expense;
  stopName?: string;
  onEdit: () => void;
  onOpenReceipt: () => void;
}) {
  const url = useReceiptUrl(expense.receiptId);
  return (
    <div {...stylex.props(styles.row)} onClick={onEdit}>
      <div {...stylex.props(styles.rowLeft)}>
        {url && (
          <img
            src={url}
            alt="Receipt"
            {...stylex.props(styles.rowThumb)}
            onClick={(e) => {
              e.stopPropagation();
              onOpenReceipt();
            }}
          />
        )}
        <div>
          <div {...stylex.props(styles.rowLabel)}>{expense.label}</div>
          {stopName && <div {...stylex.props(styles.rowStop)}>{stopName}</div>}
        </div>
      </div>
      <div {...stylex.props(styles.rowAmount)}>{rm(expense.amount)}</div>
    </div>
  );
}

type Props = {
  /** The completed (or planned) date to show detail for; null closes the sheet. */
  itinerary: Itinerary | null;
  onClose: () => void;
};

/** Date-detail sheet opened from a Costs screen row: itemized spend plus receipts. */
export function DateSpendSheet({ itinerary, onClose }: Props) {
  // Keep the last itinerary while the sheet slides out so content does not blank mid-exit.
  const [current, setCurrent] = useState<Itinerary | null>(itinerary);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [addingExpense, setAddingExpense] = useState(false);
  const [receiptId, setReceiptId] = useState<string | null>(null);

  useEffect(() => {
    if (itinerary) setCurrent(itinerary);
  }, [itinerary]);

  const handleClose = () => {
    setEditingExpense(null);
    setAddingExpense(false);
    setReceiptId(null);
    onClose();
  };

  const expenses = current?.expenses ?? [];
  const estimate = current ? itineraryTotal(current) : 0;
  const actual = current ? dateSpend(current) : 0;
  const showEstimateDiff = current != null && actual !== estimate;

  return (
    <>
      <Sheet open={itinerary !== null} onClose={handleClose} title={current?.title}>
        {current && (
          <>
            <div {...stylex.props(styles.dateLabel)}>{shortDate(current.dateISO)}</div>

            <LcdPanel xstyle={styles.totalsRow}>
              <div>
                <div {...stylex.props(styles.totalLabel)}>
                  {current.status === "completed" ? "ACTUAL TOTAL" : "EST. TOTAL"}
                </div>
                {showEstimateDiff && <div {...stylex.props(styles.totalSub)}>est. ~{rm(estimate)}</div>}
              </div>
              <LcdValue xstyle={styles.totalValue}>{rm(actual)}</LcdValue>
            </LcdPanel>

            {expenses.length === 0 ? (
              <div {...stylex.props(styles.emptyList)}>No expenses logged for this date yet.</div>
            ) : (
              <div {...stylex.props(styles.list)}>
                {expenses.map((ex) => (
                  <ExpenseRow
                    key={ex.id}
                    expense={ex}
                    stopName={current.stops.find((s) => s.id === ex.stopId)?.name}
                    onEdit={() => setEditingExpense(ex)}
                    onOpenReceipt={() => ex.receiptId && setReceiptId(ex.receiptId)}
                  />
                ))}
              </div>
            )}

            <JellyButton
              variant="soft"
              fullWidth
              xstyle={styles.addBtn}
              onClick={() => setAddingExpense(true)}
            >
              + Add expense
            </JellyButton>
          </>
        )}
      </Sheet>

      {current && (
        <ExpenseSheet
          open={addingExpense || editingExpense !== null}
          onClose={() => {
            setAddingExpense(false);
            setEditingExpense(null);
          }}
          itinerary={current}
          expense={editingExpense ?? undefined}
        />
      )}

      <ReceiptLightbox receiptId={receiptId} onClose={() => setReceiptId(null)} />
    </>
  );
}
