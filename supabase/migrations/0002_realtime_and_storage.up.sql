-- 0002 realtime and storage (up)
-- Turn on Realtime for the synced tables and create the private Storage buckets
-- that hold photos and receipts.

-- Realtime: broadcast row changes so a partner's edits stream into the store.
-- replica identity full so UPDATE/DELETE payloads carry the full old row (needed
-- to route soft-deletes and removals to the right local record).
begin;

alter table itineraries replica identity full;
alter table stops replica identity full;
alter table expenses replica identity full;
alter table photos replica identity full;
alter table venues replica identity full;
alter table venue_ratings replica identity full;
alter table venue_notes replica identity full;
alter table space_members replica identity full;

alter publication supabase_realtime add table itineraries;
alter publication supabase_realtime add table stops;
alter publication supabase_realtime add table expenses;
alter publication supabase_realtime add table photos;
alter publication supabase_realtime add table venues;
alter publication supabase_realtime add table venue_ratings;
alter publication supabase_realtime add table venue_notes;
alter publication supabase_realtime add table space_members;

-- Private buckets. Objects are keyed by <space_id>/<file>, so the first path
-- segment names the owning space and drives the access policies below.
insert into storage.buckets (id, name, public)
values ('photos', 'photos', false), ('receipts', 'receipts', false)
on conflict (id) do nothing;

-- Only members of the space that owns the object (its first path segment) may
-- read or write it. One policy per bucket, covering all verbs.
create policy "photos space members" on storage.objects for all
  using (
    bucket_id = 'photos'
    and is_space_member (nullif((storage.foldername(name))[1], '')::uuid)
  )
  with check (
    bucket_id = 'photos'
    and is_space_member (nullif((storage.foldername(name))[1], '')::uuid)
  );

create policy "receipts space members" on storage.objects for all
  using (
    bucket_id = 'receipts'
    and is_space_member (nullif((storage.foldername(name))[1], '')::uuid)
  )
  with check (
    bucket_id = 'receipts'
    and is_space_member (nullif((storage.foldername(name))[1], '')::uuid)
  );

commit;
