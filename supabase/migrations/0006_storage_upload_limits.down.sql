-- 0006 storage upload limits (down)
-- Remove the bucket-level size and MIME constraints, restoring the unrestricted
-- buckets as created by 0002 and 0005.
begin;

update storage.buckets
set file_size_limit = null, allowed_mime_types = null
where id in ('photos', 'receipts', 'avatars');

commit;
