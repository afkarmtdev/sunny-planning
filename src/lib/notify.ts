// Local (not push) notifications for the "date today" reminder. Fired when the
// app or its service worker is awake; true scheduled push while the app is
// closed needs a push server (Milestone 4+) and is deliberately out of scope.
// Permission is only ever requested from Settings, never on first load.

export type PermissionState = NotificationPermission | "unsupported";

export function notificationsSupported(): boolean {
  return typeof window !== "undefined" && "Notification" in window;
}

export function notificationPermission(): PermissionState {
  if (!notificationsSupported()) return "unsupported";
  return Notification.permission;
}

export async function requestNotificationPermission(): Promise<PermissionState> {
  if (!notificationsSupported()) return "unsupported";
  try {
    return await Notification.requestPermission();
  } catch {
    return Notification.permission;
  }
}

/**
 * Surface an OS notification. Prefers the service worker registration (works
 * even when a real push lands later) and falls back to a page Notification.
 * No-op unless permission is already granted.
 */
export async function fireTodayNotification(title: string, body: string): Promise<void> {
  if (notificationPermission() !== "granted") return;
  const options: NotificationOptions = { body, icon: "/pwa-192.png", badge: "/pwa-192.png", tag: "sunny-today" };
  try {
    const reg = await navigator.serviceWorker?.getRegistration();
    if (reg) {
      await reg.showNotification(title, options);
      return;
    }
  } catch {
    // Fall through to the page-level Notification below.
  }
  try {
    new Notification(title, options);
  } catch {
    // Some browsers only allow SW notifications; nothing more we can do here.
  }
}
