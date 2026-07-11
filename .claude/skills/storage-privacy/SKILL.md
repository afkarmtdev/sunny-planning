---
name: storage-privacy
description: The house standard for user image privacy in Sunny Planning - private buckets, short signed URL TTLs, bucket upload constraints, EXIF stripping, and the logout device wipe. Use whenever adding a storage bucket, an image upload or display path, or touching logout/session teardown.
---

# Storage privacy (photos, receipts, avatars)

User images are personal data. Every part of the pipeline defends them; keep all
of these invariants when adding a bucket or an upload/display path.

## Buckets are private and constrained

- Every bucket is created with `public: false` and a member-scoped RLS policy on
  `storage.objects`: objects are keyed `<space_id>/<file>` and the policy checks
  `is_space_member` on the first path segment for both `using` and `with check`
  (see migrations 0002 and 0005). A new bucket must follow the same model.
- Buckets carry server-side upload constraints as defense in depth behind RLS:
  `file_size_limit = 5242880` (5 MiB) and `allowed_mime_types` of
  image/jpeg, image/png, image/webp (migration 0006). The app only uploads small
  canvas-encoded JPEGs, but RLS alone would let a member drive the API directly
  and store huge files or HTML that a signed URL would serve from the project
  domain. Set both fields on any new bucket in its creating migration.

## Reads are short-lived signed URLs

- `SIGNED_URL_TTL` in `src/lib/storage.ts` is 24 hours. A signed URL is a bearer
  token that cannot be revoked individually, so the TTL bounds how long a leaked
  URL, or one minted by someone since removed from the space, keeps working. Do
  NOT raise it to dodge expiry bugs; the caching below is the mechanism.
- The module-level `urlCache` stores `{ url, expiresAt }` and `freshUrl()`
  re-signs anything within 5 minutes of expiry, so long sessions never render a
  dying URL. The cache is memory-only (never persisted) and `clearStorageUrlCache`
  runs in `stopSync`.
- The one signed URL that reaches localStorage is `profile.avatarUrl` (and
  member avatarUrls until stopSync clears them); both are re-signed on every
  `startSync` pull, which is what makes the short TTL safe. If you persist a new
  signed URL anywhere, it must be re-signed on session start the same way.

## Uploads strip metadata

Photos, receipts, and avatars are all re-encoded through a canvas before upload
(`src/lib/images.ts` fileToDataUrl, `src/lib/receipts.ts` downscaleToJpeg), which
downsizes them AND strips EXIF (GPS position, device, timestamps). Never upload a
user-picked File object raw; route it through a canvas re-encode first.

## Nothing orphans, nothing lingers

- Deleting or replacing an object-backed row retires its storage object
  (`removePath` calls in `src/lib/sync.ts` pushOnce and pushProfile). A new
  object-backed entity must do the same.
- Logout in auth mode wipes personal data from the device (`doLogout` in
  `src/screens/Settings.tsx`): sign out first so the session is revoked and no
  late push can run, then `stopSync()`, `resetDemo()` (drops the persisted store
  key), and `clearReceipts()` (empties the IndexedDB blob store). The logout
  confirm copy warns the user their data leaves the device. Demo mode logout
  intentionally keeps data; there is no server copy to restore from.

## What this does not cover

Images are TLS in transit and encrypted at rest by Supabase, but not end-to-end
encrypted: anyone with the project dashboard or secret key can view them. Local
data before logout (localStorage store, IndexedDB receipts) is unencrypted by
design; the logout wipe is the mitigation.
