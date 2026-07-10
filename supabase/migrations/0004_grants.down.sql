-- 0004 role grants (down)

begin;

revoke execute on function join_demo_space () from authenticated;
revoke execute on function accept_invite (text) from authenticated;
revoke execute on function ensure_solo_space () from authenticated;

revoke select, insert, update, delete on
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
from authenticated;

commit;
