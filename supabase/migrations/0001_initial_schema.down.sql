-- 0001 initial schema (down)
-- Drop in reverse dependency order. Table drops cascade their triggers, policies,
-- and foreign keys; the shared functions are dropped explicitly at the end.

begin;

drop table if exists venue_notes cascade;
drop table if exists venue_ratings cascade;
drop table if exists photos cascade;
drop table if exists expenses cascade;
drop table if exists stops cascade;
drop table if exists itineraries cascade;
drop table if exists venues cascade;
drop table if exists invites cascade;
drop table if exists space_members cascade;
drop table if exists spaces cascade;

drop function if exists set_updated_at ();
drop function if exists is_space_member (uuid);

commit;
