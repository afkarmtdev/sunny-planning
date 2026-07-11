-- 0006 storage upload limits (up)
-- Server-side upload constraints on the private buckets. The app itself only
-- uploads small canvas-encoded JPEGs, but RLS alone would let a space member
-- drive the API directly and store arbitrarily large files or non-image content
-- (which a signed URL would then serve from the project domain). Cap the object
-- size and pin the content types at the bucket level as defense in depth.
begin;

update storage.buckets
set
  file_size_limit = 5242880, -- 5 MiB, generous headroom over the ~500 KB app uploads
  allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp']
where id in ('photos', 'receipts', 'avatars');

commit;
