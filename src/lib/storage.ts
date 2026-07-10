// Supabase Storage helpers. Buckets are private (see supabase/migrations 0002
// and 0005), so writes upload an object and reads mint a short-lived signed URL.
// Everything here is a no-op returning null when Supabase is unconfigured, so
// demo mode never touches the network.

import { supabase } from "./supabase";

const AVATARS_BUCKET = "avatars";

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

/**
 * Upload a member's avatar (a data URL) to the private avatars bucket and return
 * its object path, or null on failure. The filename carries a fresh uuid so the
 * stored path changes on every update: that both busts caches and changes the
 * space_members row, so the partner gets a Realtime event and re-signs the URL.
 */
export async function uploadAvatar(
  spaceId: string,
  userId: string,
  dataUrl: string
): Promise<string | null> {
  if (!supabase) return null;
  const path = `${spaceId}/${userId}-${crypto.randomUUID()}.jpg`;
  const { error } = await supabase.storage
    .from(AVATARS_BUCKET)
    .upload(path, dataUrlToBlob(dataUrl), { contentType: "image/jpeg", upsert: true });
  if (error) {
    console.error("avatar upload failed", error.message);
    return null;
  }
  return path;
}

/** A signed URL for a single avatar object path, or null. */
export async function signAvatar(path: string): Promise<string | null> {
  if (!supabase) return null;
  const { data, error } = await supabase.storage
    .from(AVATARS_BUCKET)
    .createSignedUrl(path, SIGNED_URL_TTL);
  if (error) {
    console.error("avatar sign failed", error.message);
    return null;
  }
  return data?.signedUrl ?? null;
}

/** Signed URLs for many avatar paths at once, keyed by path (failures omitted). */
export async function signAvatars(paths: string[]): Promise<Map<string, string>> {
  const urls = new Map<string, string>();
  if (!supabase || paths.length === 0) return urls;
  const { data, error } = await supabase.storage.from(AVATARS_BUCKET).createSignedUrls(paths, SIGNED_URL_TTL);
  if (error) {
    console.error("avatar sign failed", error.message);
    return urls;
  }
  for (const entry of data ?? []) {
    if (entry.path && entry.signedUrl) urls.set(entry.path, entry.signedUrl);
  }
  return urls;
}
