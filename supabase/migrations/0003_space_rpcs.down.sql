-- 0003 space bootstrap RPCs (down)

begin;

drop function if exists join_demo_space ();
drop function if exists accept_invite (text);
drop function if exists ensure_solo_space ();

commit;
