import * as stylex from "@stylexjs/stylex";
import { useEffect } from "react";
import { colors, fonts } from "../theme/tokens.stylex";
import { useT } from "../lib/i18n";

const styles = stylex.create({
  overlay: {
    position: "fixed",
    inset: 0,
    backgroundColor: "rgba(51,43,51,0.45)",
    zIndex: 70,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  panel: {
    width: "100%",
    maxWidth: 320,
    backgroundColor: colors.cream,
    borderWidth: 3,
    borderStyle: "solid",
    borderColor: colors.ink,
    borderRadius: 22,
    boxShadow: "6px 6px 0 0 #332B33",
    padding: 22,
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  title: {
    fontFamily: fonts.display,
    fontWeight: 800,
    fontSize: 18,
    color: colors.ink,
  },
  message: {
    fontFamily: fonts.body,
    fontSize: 13,
    lineHeight: 1.4,
    color: colors.ink,
    opacity: 0.7,
  },
  row: {
    display: "flex",
    gap: 10,
    marginTop: 4,
  },
  btn: {
    flex: 1,
    display: "block",
    fontFamily: fonts.display,
    fontWeight: 700,
    fontSize: 14,
    color: colors.ink,
    backgroundColor: colors.white,
    borderWidth: 3,
    borderStyle: "solid",
    borderColor: colors.ink,
    borderRadius: 999,
    paddingBlock: 11,
    textAlign: "center",
    cursor: "pointer",
    boxShadow: { default: "0 4px 0 0 #332B33", ":active": "0 0 0 0 #332B33" },
    transform: { default: "translateY(0)", ":active": "translateY(4px)" },
  },
  confirmDefault: {
    color: colors.cream,
    backgroundImage: "linear-gradient(180deg, #FF7DC0, #FF4D9D)",
  },
  confirmDanger: {
    color: colors.white,
    backgroundColor: colors.heartPop,
  },
});

type Props = {
  open: boolean;
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: "default" | "danger";
  onConfirm: () => void;
  onClose: () => void;
};

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel,
  cancelLabel,
  tone = "default",
  onConfirm,
  onClose,
}: Props) {
  const t = useT();
  const confirmText = confirmLabel ?? t("ui.confirm");
  const cancelText = cancelLabel ?? t("common.cancel");
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <>
      <div {...stylex.props(styles.overlay)} onClick={onClose}>
        <div
          {...stylex.props(styles.panel)}
          role="alertdialog"
          aria-modal="true"
          onClick={(e) => e.stopPropagation()}
        >
          <div {...stylex.props(styles.title)}>{title}</div>
          {message && <div {...stylex.props(styles.message)}>{message}</div>}
          <div {...stylex.props(styles.row)}>
            <button type="button" {...stylex.props(styles.btn)} onClick={onClose}>
              {cancelText}
            </button>
            <button
              type="button"
              {...stylex.props(styles.btn, tone === "danger" ? styles.confirmDanger : styles.confirmDefault)}
              onClick={onConfirm}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
