-- Sunny Planning schema. Run in the Supabase SQL editor of a fresh project.
-- One shared "space" per couple; every row is scoped to a space and guarded by RLS.

create table spaces (
  id uuid primary key default gen_random_uuid(),
  name text not null default 'Our space',
  created_at timestamptz not null default now()
);

create table space_members (
  space_id uuid not null references spaces (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  display_initial text not null default 'Y',
  color text not null default 'bubblegum',
  joined_at timestamptz not null default now(),
  primary key (space_id, user_id)
);

create table invites (
  code text primary key,
  space_id uuid not null references spaces (id) on delete cascade,
  created_by uuid not null references auth.users (id),
  expires_at timestamptz,
  accepted_by uuid references auth.users (id),
  created_at timestamptz not null default now()
);

create table itineraries (
  id uuid primary key default gen_random_uuid(),
  space_id uuid not null references spaces (id) on delete cascade,
  title text not null,
  date date not null,
  status text not null default 'planned' check (status in ('planned', 'completed')),
  skin text not null default 'strawberry'
    check (skin in ('strawberry', 'retro', 'scrapbook', 'loveletter')),
  created_at timestamptz not null default now()
);

create table stops (
  id uuid primary key default gen_random_uuid(),
  itinerary_id uuid not null references itineraries (id) on delete cascade,
  position int not null,
  name text not null,
  time_label text not null default '',
  note text not null default '',
  cost numeric(10, 2) not null default 0,
  lat double precision,
  lng double precision,
  travel_minutes_to_next int,
  travel_mode_to_next text check (travel_mode_to_next in ('drive', 'walk'))
);

create table expenses (
  id uuid primary key default gen_random_uuid(),
  space_id uuid not null references spaces (id) on delete cascade,
  itinerary_id uuid references itineraries (id) on delete set null,
  label text not null,
  spent_on date not null,
  amount numeric(10, 2) not null,
  receipt_path text,
  created_at timestamptz not null default now()
);

create table photos (
  id uuid primary key default gen_random_uuid(),
  space_id uuid not null references spaces (id) on delete cascade,
  itinerary_id uuid references itineraries (id) on delete set null,
  storage_path text not null,
  caption text not null default '',
  taken_on date not null default current_date,
  created_at timestamptz not null default now()
);

create table venues (
  id uuid primary key default gen_random_uuid(),
  space_id uuid not null references spaces (id) on delete cascade,
  name text not null,
  category text not null default '',
  rating int not null default 0 check (rating between 0 and 5),
  fave boolean not null default false,
  lat double precision,
  lng double precision,
  created_at timestamptz not null default now()
);

create table venue_notes (
  id uuid primary key default gen_random_uuid(),
  venue_id uuid not null references venues (id) on delete cascade,
  author uuid not null references auth.users (id),
  text text not null,
  created_at timestamptz not null default now()
);

-- Row level security: members of a space see only their space's rows.
create or replace function is_space_member (target uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from space_members
    where space_id = target and user_id = auth.uid()
  );
$$;

alter table spaces enable row level security;
alter table space_members enable row level security;
alter table invites enable row level security;
alter table itineraries enable row level security;
alter table stops enable row level security;
alter table expenses enable row level security;
alter table photos enable row level security;
alter table venues enable row level security;
alter table venue_notes enable row level security;

create policy member_read on spaces for select using (is_space_member (id));
create policy member_all on space_members for all
  using (user_id = auth.uid() or is_space_member (space_id));
create policy invite_member on invites for all using (is_space_member (space_id));
create policy itin_member on itineraries for all using (is_space_member (space_id));
create policy stop_member on stops for all
  using (is_space_member ((select space_id from itineraries where id = itinerary_id)));
create policy expense_member on expenses for all using (is_space_member (space_id));
create policy photo_member on photos for all using (is_space_member (space_id));
create policy venue_member on venues for all using (is_space_member (space_id));
create policy note_member on venue_notes for all
  using (is_space_member ((select space_id from venues where id = venue_id)));
