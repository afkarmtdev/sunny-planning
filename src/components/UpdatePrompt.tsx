import { useRegisterSW } from "virtual:pwa-register/react";
import { ConfirmDialog } from "./ConfirmDialog";

/**
 * Watches the service worker for a freshly deployed build and, when one is
 * waiting, offers a themed prompt (never a native dialog). Accepting calls
 * `updateServiceWorker(true)`, which triggers skipWaiting and reloads into the
 * new version. Renders nothing until an update is actually waiting, and is a
 * no-op in dev / when no service worker is registered.
 */
export function UpdatePrompt() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW();

  return (
    <ConfirmDialog
      open={needRefresh}
      title="Sunny learned new tricks"
      message={`A fresh version (v${__APP_VERSION__}) is ready. Update now?`}
      confirmLabel="Update"
      cancelLabel="Later"
      onConfirm={() => void updateServiceWorker(true)}
      onClose={() => setNeedRefresh(false)}
    />
  );
}
