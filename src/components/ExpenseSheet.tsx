import * as stylex from "@stylexjs/stylex";
import { useEffect, useState } from "react";
import { colors, fonts } from "../theme/tokens.stylex";
import { Sheet } from "./Sheet";
import { Field, TextInput } from "./Field";
import { JellyButton } from "./JellyButton";
import { ConfirmDialog } from "./ConfirmDialog";
import { UploadDropzone } from "./UploadDropzone";
import { useApp } from "../store/useApp";
import { deleteReceipt, saveReceipt, useReceiptUrl } from "../lib/receipts";
import { useStorageUrl } from "../lib/storage";
import { useT } from "../lib/i18n";
import type { Expense, Itinerary } from "../lib/types";

const styles = stylex.create({
  chipRow: {
    display: "flex",
    gap: 6,
    flexWrap: "wrap",
  },
  chip: {
    backgroundColor: colors.white,
    borderWidth: 2,
    borderStyle: "solid",
    borderColor: colors.ink,
    borderRadius: 999,
    paddingBlock: 6,
    paddingInline: 12,
    fontFamily: fonts.body,
    fontSize: 12,
    fontWeight: 700,
    color: colors.ink,
    cursor: "pointer",
    opacity: 0.6,
  },
  chipOn: {
    backgroundColor: colors.lcdMint,
    opacity: 1,
  },
  receiptRow: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    gap: 8,
  },
  receiptThumb: {
    width: 84,
    height: 84,
    objectFit: "cover",
    borderRadius: 12,
    borderWidth: 3,
    borderStyle: "solid",
    borderColor: colors.ink,
    flexShrink: 0,
  },
  removeReceiptBtn: {
    fontFamily: fonts.body,
    fontWeight: 700,
    fontSize: 12,
    color: colors.heartPop,
    backgroundColor: "transparent",
    borderWidth: 0,
    padding: 0,
    cursor: "pointer",
    textDecorationLine: "underline",
  },
  deleteBtn: {
    fontFamily: fonts.display,
    fontWeight: 700,
    fontSize: 13,
    color: colors.heartPop,
    textAlign: "center",
    paddingBlock: 8,
  },
});

type Props = {
  open: boolean;
  onClose: () => void;
  itinerary: Itinerary;
  /** Editing an existing expense, vs adding a new one. */
  expense?: Expense;
  /** Stop to link a fresh expense to by default (for example, the current Day-of stop). */
  defaultStopId?: string;
};

export function ExpenseSheet({ open, onClose, itinerary, expense, defaultStopId }: Props) {
  const t = useT();
  const { addExpense, updateExpense, removeExpense } = useApp();
  const stops = itinerary.stops;

  const [label, setLabel] = useState("");
  const [amount, setAmount] = useState("");
  const [stopId, setStopId] = useState<string | undefined>(undefined);
  const [receiptId, setReceiptId] = useState<string | undefined>(undefined);
  // The synced Storage path staged alongside the local blob: kept while the
  // existing receipt is untouched, cleared when it is removed or replaced.
  const [receiptPath, setReceiptPath] = useState<string | undefined>(undefined);
  const [confirmDelete, setConfirmDelete] = useState(false);
  // Prefer the local blob (fast, offline); else the signed Storage URL for the
  // staged path (re-signs itself when the path is cleared/replaced).
  const localReceiptUrl = useReceiptUrl(receiptId);
  const remoteReceiptUrl = useStorageUrl("receipts", receiptPath);
  const receiptUrl = localReceiptUrl ?? remoteReceiptUrl;

  // The local blob already saved on this expense, if any: kept around so we know
  // whether a swapped-in receipt should retire the old IndexedDB blob. The synced
  // Storage object is retired by the sync layer when the path changes.
  const savedReceiptId = expense?.receiptId;

  useEffect(() => {
    if (!open) return;
    const initialStopId = expense?.stopId ?? defaultStopId;
    const initialStop = initialStopId ? stops.find((s) => s.id === initialStopId) : undefined;
    setLabel(expense?.label ?? initialStop?.name ?? "");
    setAmount(expense ? String(expense.amount) : "");
    setStopId(initialStopId);
    setReceiptId(expense?.receiptId);
    setReceiptPath(expense?.receiptPath);
    setConfirmDelete(false);
    // Only re-seed when the sheet opens for a (possibly new) expense/stop; the
    // itinerary's stop list is not expected to change while the sheet is open.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, expense, defaultStopId]);

  const toggleStop = (id: string) => {
    setStopId((cur) => {
      const next = cur === id ? undefined : id;
      if (next && !label.trim()) {
        const stop = stops.find((s) => s.id === next);
        if (stop) setLabel(stop.name);
      }
      return next;
    });
  };

  const handleFiles = async (files: FileList | null) => {
    const file = files?.[0];
    if (!file) return;
    // Replacing a receipt already staged this session drops the earlier blob.
    if (receiptId && receiptId !== savedReceiptId) void deleteReceipt(receiptId);
    const id = await saveReceipt(file);
    setReceiptId(id);
    // A fresh local blob supersedes any synced object; clear the path so sync
    // re-uploads it (the old object is retired on Save).
    setReceiptPath(undefined);
  };

  const removeReceipt = () => {
    if (receiptId) void deleteReceipt(receiptId);
    setReceiptId(undefined);
    setReceiptPath(undefined);
  };

  const handleClose = () => {
    // A freshly uploaded receipt that was never saved would otherwise orphan
    // its blob in IndexedDB.
    if (receiptId && receiptId !== savedReceiptId) void deleteReceipt(receiptId);
    onClose();
  };

  const save = () => {
    const linkedStop = stopId ? stops.find((s) => s.id === stopId) : undefined;
    const finalLabel = label.trim() || linkedStop?.name || "Spend";
    const finalAmount = Number(amount) || 0;
    if (savedReceiptId && receiptId !== savedReceiptId) void deleteReceipt(savedReceiptId);
    if (expense) {
      updateExpense(itinerary.id, expense.id, { label: finalLabel, amount: finalAmount, stopId, receiptId, receiptPath });
    } else {
      addExpense(itinerary.id, { label: finalLabel, amount: finalAmount, stopId, receiptId, receiptPath });
    }
    onClose();
  };

  return (
    <Sheet open={open} onClose={handleClose} title={expense ? t("costs.editExpense") : t("costs.logSpend")}>
      <Field label={t("costs.field.label")}>
        <TextInput
          value={label}
          placeholder={t("costs.field.labelPlaceholder")}
          onChange={(e) => setLabel(e.target.value)}
        />
      </Field>
      <Field label={t("costs.field.amount")}>
        <TextInput
          value={amount}
          placeholder="28"
          inputMode="decimal"
          onChange={(e) => setAmount(e.target.value)}
        />
      </Field>
      {stops.length > 0 && (
        <Field label={t("costs.field.linkedStop")}>
          <div {...stylex.props(styles.chipRow)}>
            {stops.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => toggleStop(s.id)}
                {...stylex.props(styles.chip, stopId === s.id && styles.chipOn)}
              >
                {s.name}
              </button>
            ))}
          </div>
        </Field>
      )}
      <Field label={t("costs.receipt")}>
        {receiptUrl ? (
          <div {...stylex.props(styles.receiptRow)}>
            <img src={receiptUrl} alt={t("costs.receipt")} {...stylex.props(styles.receiptThumb)} />
            <button type="button" {...stylex.props(styles.removeReceiptBtn)} onClick={removeReceipt}>
              {t("costs.removeReceipt")}
            </button>
          </div>
        ) : (
          <UploadDropzone
            title={t("costs.addReceipt")}
            subtitle={t("costs.addReceiptSub")}
            spriteSize={48}
            onFiles={(files) => void handleFiles(files)}
          />
        )}
      </Field>
      <JellyButton variant="primary" onClick={save}>
        {expense ? t("costs.saveExpense") : t("costs.addExpense")}
      </JellyButton>
      {expense && (
        <button
          type="button"
          {...stylex.props(styles.deleteBtn)}
          onClick={() => setConfirmDelete(true)}
        >
          {t("costs.deleteExpense")}
        </button>
      )}
      <ConfirmDialog
        open={confirmDelete}
        title={t("costs.deleteExpenseTitle")}
        message={t("costs.deleteExpenseMessage")}
        confirmLabel={t("common.delete")}
        cancelLabel={t("common.keep")}
        tone="danger"
        onConfirm={() => {
          if (expense) removeExpense(itinerary.id, expense.id);
          setConfirmDelete(false);
          onClose();
        }}
        onClose={() => setConfirmDelete(false)}
      />
    </Sheet>
  );
}
