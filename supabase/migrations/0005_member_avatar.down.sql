-- 0005 member avatar (down)
-- Reverse 0005: drop the avatars access policy and the member avatar column.
-- As in 0002, the bucket itself is left in place so a rollback never destroys
-- uploaded files (its objects must be emptied before it could be removed); drop
-- it by hand if truly wanted.

begin;

drop policy if exists "avatars space members" on storage.objects;

alter table space_members drop column if exists avatar_path;

commit;
