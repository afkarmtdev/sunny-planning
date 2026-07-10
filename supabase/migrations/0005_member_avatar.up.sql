-- 0005 member avatar (up)
-- Give each space member an optional profile photo, shown on the author chip.
-- The image lives in a private 'avatars' storage bucket (same member-scoped
-- model as photos/receipts, keyed by <space_id>/<file>); space_members.avatar_path
-- holds its object path. member_update_self (0001) already lets a member update
-- their own row, and space_members carries replica identity full (0002), so a new
-- path streams to the partner, who re-signs it for display.

begin;

alter table space_members add column avatar_path text;

-- Private bucket, same access model as the photos/receipts buckets in 0002: only
-- members of the space that owns the object (its first path segment) may read or
-- write it.
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', false)
on conflict (id) do nothing;

create policy "avatars space members" on storage.objects for all
  using (
    bucket_id = 'avatars'
    and is_space_member (nullif((storage.foldername(name))[1], '')::uuid)
  )
  with check (
    bucket_id = 'avatars'
    and is_space_member (nullif((storage.foldername(name))[1], '')::uuid)
  );

commit;
