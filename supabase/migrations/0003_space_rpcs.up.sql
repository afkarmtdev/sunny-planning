-- 0003 space bootstrap RPCs (up)
-- Joining a space cannot go through table RLS: a brand-new user is not yet a
-- member of anything, so they cannot read an invite or insert their membership.
-- These security-definer functions run the membership writes safely and are the
-- only way a client creates or joins a space.

-- The demo space seeded by supabase/seed.sql; join_demo_space attaches the
-- caller to it so they can see the sample data through RLS.
-- Keep this uuid in sync with seed.sql.

-- Return the caller's active space, creating a solo space (space of one) if they
-- belong to none. "Active" is the most recently joined space, so accepting an
-- invite later takes precedence over an earlier solo space.
begin;

create or replace function ensure_solo_space () returns uuid
language plpgsql security definer set search_path = public as $$
declare
  existing uuid;
  fresh uuid;
begin
  if auth.uid() is null then
    raise exception 'not authenticated';
  end if;

  select space_id into existing
  from space_members
  where user_id = auth.uid()
  order by joined_at desc
  limit 1;

  if existing is not null then
    return existing;
  end if;

  insert into spaces (name) values ('Our space') returning id into fresh;
  insert into space_members (space_id, user_id, display_initial, color)
  values (fresh, auth.uid(), 'Y', 'bubblegum');
  return fresh;
end;
$$;

-- Join the space an invite points at. Idempotent: re-accepting when already a
-- member just returns the space. Raises on an unknown or expired code.
create or replace function accept_invite (p_code text) returns uuid
language plpgsql security definer set search_path = public as $$
declare
  inv invites;
begin
  if auth.uid() is null then
    raise exception 'not authenticated';
  end if;

  select * into inv from invites where code = p_code;
  if inv.code is null then
    raise exception 'invite not found';
  end if;
  if inv.expires_at is not null and inv.expires_at < now() then
    raise exception 'invite expired';
  end if;

  if not exists (
    select 1 from space_members
    where space_id = inv.space_id and user_id = auth.uid()
  ) then
    insert into space_members (space_id, user_id, display_initial, color)
    values (inv.space_id, auth.uid(), 'P', 'heartPop');
  end if;

  if inv.accepted_by is null then
    update invites set accepted_by = auth.uid() where code = p_code;
  end if;

  return inv.space_id;
end;
$$;

-- Attach the caller to the seeded demo space so the sample data is visible.
create or replace function join_demo_space () returns uuid
language plpgsql security definer set search_path = public as $$
declare
  demo uuid := '11111111-1111-4111-8111-111111111111';
begin
  if auth.uid() is null then
    raise exception 'not authenticated';
  end if;
  if not exists (select 1 from spaces where id = demo) then
    raise exception 'demo space not seeded; run supabase/seed.sql first';
  end if;
  if not exists (
    select 1 from space_members where space_id = demo and user_id = auth.uid()
  ) then
    insert into space_members (space_id, user_id, display_initial, color)
    values (demo, auth.uid(), 'Y', 'bubblegum');
  end if;
  return demo;
end;
$$;

commit;
