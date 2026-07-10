// Supabase Storage helpers. Buckets are private (see supabase/migrations 0002
// and 0005), so writes upload an object and reads mint a short-lived signed URL.
// Everything here is a no-op returning null/empty when Supabase is unconfigured,
// so demo mode never touches the network.

import { useEffect, useState } from "react";
import { supabase } from "./supabase";

/** A private bucket from the migrations. */
export type Bucket = "avatars" | "photos" | "receipts";

// Signed URLs are re-minted on every load, so this only bounds a single long
// session; a year is comfortably beyond that and avoids mid-session expiry.
const SIGNED_URL_TTL = 60 * 60 * 24 * 365;

/** Decode a `data:` URL into a Blob for upload. */
function dataUrlToBlob(dataUrl: string): Blob {
  const [head, body] = dataUrl.split(",", 2);
  const mime = /:(.*?);/.exec(head)?.[1] ?? "image/jpeg";
  const binary = atob(body);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return new Blob([bytes], { type: mime });
}

/** A fresh object path under a space, `<spaceId>/<prefix>-<uuid>.jpg`. */
export function newObjectPath(spaceId: string, prefix: string): string {
  return `${spaceId}/${prefix}-${crypto.randomUUID()}.jpg`;
}

/** Upload a Blob to `bucket` at `path`; return the path, or null on failure. */
export async function uploadBlob(bucket: Bucket, path: string, blob: Blob): Promise<string | null> {
  if (!supabase) return null;
  const { error } = await supabase.storage
    .from(bucket)
    .upload(path, blob, { contentType: blob.type || "image/jpeg", upsert: true });
  if (error) {
    console.error(`${bucket} upload failed`, error.message);
    return null;
  }
  return path;
}

/** Upload a `data:` URL to `bucket` at `path`; return the path, or null. */
export function uploadDataUrl(bucket: Bucket, path: string, dataUrl: string): Promise<string | null> {
  return uploadBlob(bucket, path, dataUrlToBlob(dataUrl));
}

/** A signed URL for a single object path, or null. */
export async function signPath(bucket: Bucket, path: string): Promise<string | null> {
  if (!supabase) return null;
  const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, SIGNED_URL_TTL);
  if (error) {
    console.error(`${bucket} sign failed`, error.message);
    return null;
  }
  return data?.signedUrl ?? null;
}

/** Signed URLs for many object paths at once, keyed by path (failures omitted). */
export async function signPaths(bucket: Bucket, paths: string[]): Promise<Map<string, string>> {
  const urls = new Map<string, string>();
  if (!supabase || paths.length === 0) return urls;
  const { data, error } = await supabase.storage.from(bucket).createSignedUrls(paths, SIGNED_URL_TTL);
  if (error) {
    console.error(`${bucket} sign failed`, error.message);
    return urls;
  }
  for (const entry of data ?? []) {
    if (entry.path && entry.signedUrl) urls.set(entry.path, entry.signedUrl);
  }
  return urls;
}

/** Best-effort delete of an object; swallows failures. */
export async function removePath(bucket: Bucket, path: string): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase.storage.from(bucket).remove([path]);
  if (error) console.error(`${bucket} remove failed`, error.message);
}

// Signed URLs by `${bucket}:${path}`, shared across every hook instance so a grid
// of images signs each path once. Cleared on logout.
const urlCache = new Map<string, string>();

/** Drop cached signed URLs (on logout, so a later account never reuses them). */
export function clearStorageUrlCache(): void {
  urlCache.clear();
}

/**
 * Resolve a bucket object path to a signed URL for display, re-signing whenever
 * the path changes (so a replaced receipt never shows a stale image). Returns
 * null while loading, for no path, or in demo mode. Cached module-wide.
 */
export function useStorageUrl(bucket: Bucket, path?: string): string | null {
  const key = path ? `${bucket}:${path}` : "";
  const [url, setUrl] = useState<string | null>(() => (key ? urlCache.get(key) ?? null : null));

  useEffect(() => {
    if (!path) {
      setUrl(null);
      return;
    }
    const cached = urlCache.get(key);
    if (cached) {
      setUrl(cached);
      return;
    }
    let cancelled = false;
    void signPath(bucket, path).then((signed) => {
      if (cancelled || !signed) return;
      urlCache.set(key, signed);
      setUrl(signed);
    });
    return () => {
      cancelled = true;
    };
  }, [bucket, path, key]);

  return url;
}

// ---- Avatar wrappers (the profile photo lives in the avatars bucket) --------

export async function uploadAvatar(
  spaceId: string,
  userId: string,
  dataUrl: string
): Promise<string | null> {
  // Fresh uuid per upload so the stored path changes: busts caches and changes
  // the space_members row, so the partner gets a Realtime event and re-signs.
  return uploadDataUrl("avatars", newObjectPath(spaceId, userId), dataUrl);
}

export function signAvatar(path: string): Promise<string | null> {
  return signPath("avatars", path);
}

export function signAvatars(paths: string[]): Promise<Map<string, string>> {
  return signPaths("avatars", paths);
}
