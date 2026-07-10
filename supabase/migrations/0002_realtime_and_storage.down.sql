-- 0002 realtime and storage (down)

begin;

drop policy if exists "photos space members" on storage.objects;
drop policy if exists "receipts space members" on storage.objects;

-- Note: bucket objects must be emptied before a bucket can be removed. This
-- leaves the (now policy-less, inaccessible) buckets in place on purpose so a
-- rollback never destroys uploaded files; drop them by hand if truly wanted.

alter publication supabase_realtime drop table space_members;
alter publication supabase_realtime drop table venue_notes;
alter publication supabase_realtime drop table venue_ratings;
alter publication supabase_realtime drop table venues;
alter publication supabase_realtime drop table photos;
alter publication supabase_realtime drop table expenses;
alter publication supabase_realtime drop table stops;
alter publication supabase_realtime drop table itineraries;

alter table space_members replica identity default;
alter table venue_notes replica identity default;
alter table venue_ratings replica identity default;
alter table venues replica identity default;
alter table photos replica identity default;
alter table expenses replica identity default;
alter table stops replica identity default;
alter table itineraries replica identity default;

commit;
