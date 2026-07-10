import { useEffect, useState } from "react";

/**
 * Receipt image storage. Blobs live in IndexedDB (never localStorage); the
 * Zustand store only ever keeps a receipt id string on an Expense.
 */

const DB_NAME = "sunny-receipts";
const DB_VERSION = 1;
const STORE_NAME = "receipts";
const MAX_DIM = 1600;
const JPEG_QUALITY = 0.85;

function hasIndexedDB(): boolean {
  return typeof indexedDB !== "undefined";
}

function openDb(): Promise<IDBDatabase | null> {
  if (!hasIndexedDB()) return Promise.resolve(null);
  return new Promise((resolve) => {
    let request: IDBOpenDBRequest;
    try {
      request = indexedDB.open(DB_NAME, DB_VERSION);
    } catch {
      resolve(null);
      return;
    }
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => resolve(null);
  });
}

function uid(): string {
  return `rc-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

/** Downscale to a max dimension and re-encode as JPEG; falls back to the original file. */
function downscaleToJpeg(file: File): Promise<Blob> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, MAX_DIM / Math.max(img.width, img.height));
      const w = Math.round(img.width * scale);
      const h = Math.round(img.height * scale);
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        URL.revokeObjectURL(url);
        resolve(file);
        return;
      }
      ctx.drawImage(img, 0, 0, w, h);
      URL.revokeObjectURL(url);
      canvas.toBlob((blob) => resolve(blob ?? file), "image/jpeg", JPEG_QUALITY);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(file);
    };
    img.src = url;
  });
}

/** Downscales, stores the blob, and returns its new receipt id. */
export async function saveReceipt(file: File): Promise<string> {
  const id = uid();
  const blob = await downscaleToJpeg(file).catch(() => file);
  const db = await openDb();
  if (!db) return id;
  await new Promise<void>((resolve) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).put(blob, id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => resolve();
    tx.onabort = () => resolve();
  });
  db.close();
  return id;
}

/** Stores a blob under a caller-chosen id; used to seed the demo receipt. */
export async function putReceipt(id: string, blob: Blob): Promise<void> {
  const db = await openDb();
  if (!db) return;
  await new Promise<void>((resolve) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).put(blob, id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => resolve();
    tx.onabort = () => resolve();
  });
  db.close();
}

export async function getReceiptBlob(id: string): Promise<Blob | null> {
  const db = await openDb();
  if (!db) return null;
  return new Promise((resolve) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const req = tx.objectStore(STORE_NAME).get(id);
    req.onsuccess = () => {
      resolve((req.result as Blob | undefined) ?? null);
      db.close();
    };
    req.onerror = () => {
      resolve(null);
      db.close();
    };
  });
}

/** Best effort delete; swallows any failure. */
export async function deleteReceipt(id: string): Promise<void> {
  try {
    const db = await openDb();
    if (!db) return;
    await new Promise<void>((resolve) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      tx.objectStore(STORE_NAME).delete(id);
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
      tx.onabort = () => resolve();
    });
    db.close();
  } catch {
    // Best effort; nothing more to do if this fails.
  }
}

/** Loads a receipt blob and exposes an object URL, revoked on unmount or id change. */
export function useReceiptUrl(id?: string): string | null {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setUrl(null);
      return;
    }
    let cancelled = false;
    let objectUrl: string | null = null;
    void getReceiptBlob(id).then((blob) => {
      if (cancelled || !blob) return;
      objectUrl = URL.createObjectURL(blob);
      setUrl(objectUrl);
    });
    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [id]);

  return url;
}
