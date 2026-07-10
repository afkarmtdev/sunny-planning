import { useSyncExternalStore } from "react";

// Tracks the browser's online/offline state. Sunny is local-first, so being
// offline is not an error: the store lives in localStorage and every screen
// keeps working. This only signals the network boundary (magic-link login and,
// later, Supabase sync), so the UI can reassure rather than block.

function subscribe(callback: () => void): () => void {
  window.addEventListener("online", callback);
  window.addEventListener("offline", callback);
  return () => {
    window.removeEventListener("online", callback);
    window.removeEventListener("offline", callback);
  };
}

function getSnapshot(): boolean {
  return navigator.onLine;
}

// Assume online during SSR / non-browser render so nothing flashes offline.
function getServerSnapshot(): boolean {
  return true;
}

export function useOnline(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
