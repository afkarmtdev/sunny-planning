import { useRegisterSW } from "virtual:pwa-register/react";
import { ConfirmDialog } from "./ConfirmDialog";
import { useT } from "../lib/i18n";

/**
 * Watches the service worker for a freshly deployed build and, when one is
 * waiting, offers a themed prompt (never a native dialog). Accepting calls
 * `updateServiceWorker(true)`, which triggers skipWaiting and reloads into the
 * new version. Renders nothing until an update is actually waiting, and is a
 * no-op in dev / when no service worker is registered.
 */
export function UpdatePrompt() {
  const t = useT();
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW();

  return (
    <ConfirmDialog
      open={needRefresh}
      title={t("ui.update.title")}
      message={t("ui.update.message", { version: __APP_VERSION__ })}
      confirmLabel={t("ui.update.confirm")}
      cancelLabel={t("ui.update.later")}
      onConfirm={() => void updateServiceWorker(true)}
      onClose={() => setNeedRefresh(false)}
    />
  );
}
