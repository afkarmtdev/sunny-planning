-- 0004 role grants (up)
-- Postgres gates table access in two layers: base GRANTs (may this role touch the
-- table at all) and RLS (which rows). 0001 set up RLS but not the grants, so every
-- client query was denied with 42501 before RLS ran. Grant the DML privileges to
-- the `authenticated` role (the role a logged-in Supabase client uses); RLS
-- remains the real boundary, restricting each role to its own space's rows.
--
-- `anon` is intentionally left without grants: the app requires a session, so the
-- pre-login client never queries these tables. Space creation and invite joins go
-- through the security-definer RPCs, which run as the owner and do not depend on
-- these grants.

begin;

grant select, insert, update, delete on
  spaces,
  space_members,
  invites,
  venues,
  itineraries,
  stops,
  expenses,
  photos,
  venue_ratings,
  venue_notes
to authenticated;

grant execute on function ensure_solo_space () to authenticated;
grant execute on function accept_invite (text) to authenticated;
grant execute on function join_demo_space () to authenticated;

commit;
