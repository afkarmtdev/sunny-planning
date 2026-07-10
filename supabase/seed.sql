-- Sunny Planning demo seed.
-- Populates a fixed "demo space" with the same sample data as local demo mode
-- (src/data/demo.ts), so a logged-in account can see a full app immediately.
--
-- How to use:
--   1. Apply the migrations in supabase/migrations first.
--   2. Run this file in the SQL editor (or `supabase db reset` runs it after
--      migrations automatically).
--   3. Sign in through the app, then call the join_demo_space() RPC once so RLS
--      lets you see this data. From the SQL editor you can instead run, with your
--      auth user id:
--        insert into space_members (space_id, user_id, display_initial, color)
--        values ('11111111-1111-4111-8111-111111111111', '<your-user-id>', 'Y', 'bubblegum')
--        on conflict do nothing;
--
-- Ids are derived with md5('<kind>:<slug>')::uuid so foreign keys line up and
-- re-running the seed is a no-op (every insert is on conflict do nothing).
-- created_by / receipt_path / storage_path stay null: seed rows have no acting
-- member and no uploaded blobs.

-- The demo space. Keep this uuid in sync with join_demo_space() in 0003.
insert into spaces (id, name)
values ('11111111-1111-4111-8111-111111111111', 'Demo space')
on conflict (id) do nothing;

-- Venues -------------------------------------------------------------------
insert into venues (id, space_id, name, category, fave) values
  (md5('ve:kopi')::uuid,        '11111111-1111-4111-8111-111111111111', 'Kopi & Cream Cafe',   'Cafe',        true),
  (md5('ve:arcade')::uuid,      '11111111-1111-4111-8111-111111111111', 'Neon Alley Arcade',   'Arcade',      false),
  (md5('ve:ramen')::uuid,       '11111111-1111-4111-8111-111111111111', 'Tanuki Ramen House',  'Dinner',      true),
  (md5('ve:drivein')::uuid,     '11111111-1111-4111-8111-111111111111', 'Moonlight Drive-in',  'Movie',       false),
  (md5('ve:pasar-malam')::uuid, '11111111-1111-4111-8111-111111111111', 'Pasar Malam Alley',   'Street food', false),
  (md5('ve:roller')::uuid,      '11111111-1111-4111-8111-111111111111', 'Rollerwave Rink',     'Activity',    false),
  (md5('ve:bookxcess')::uuid,   '11111111-1111-4111-8111-111111111111', 'BookXcess',           'Books',       false),
  (md5('ve:lakeside')::uuid,    '11111111-1111-4111-8111-111111111111', 'Titiwangsa Lakeside', 'Outdoors',    false)
on conflict (id) do nothing;

-- Itineraries --------------------------------------------------------------
-- One planned upcoming date, the rest completed, created_at anchored to the date.
insert into itineraries (id, space_id, title, date, status, skin, actual_total, created_at) values
  (md5('it:cafe-day')::uuid,     '11111111-1111-4111-8111-111111111111', 'Cafe day, arcade, ramen', '2026-07-11', 'planned',   'strawberry', null,      '2026-07-11'),
  (md5('it:night-market')::uuid, '11111111-1111-4111-8111-111111111111', 'Night market crawl',      '2026-07-07', 'completed', 'strawberry', 74,        '2026-07-07'),
  (md5('it:lake-picnic')::uuid,  '11111111-1111-4111-8111-111111111111', 'Picnic at the lake',      '2026-07-06', 'completed', 'strawberry', 40,        '2026-07-06'),
  (md5('it:bookstore')::uuid,    '11111111-1111-4111-8111-111111111111', 'Bookstore + gelato',      '2026-07-05', 'completed', 'strawberry', 52,        '2026-07-05'),
  (md5('it:roller-rink')::uuid,  '11111111-1111-4111-8111-111111111111', 'Roller rink',             '2026-07-04', 'completed', 'strawberry', 66,        '2026-07-04'),
  (md5('it:claw-duel')::uuid,    '11111111-1111-4111-8111-111111111111', 'Claw machine duel',       '2026-07-03', 'completed', 'strawberry', 30,        '2026-07-03'),
  (md5('it:breakfast')::uuid,    '11111111-1111-4111-8111-111111111111', 'Breakfast run',           '2026-07-02', 'completed', 'strawberry', 38,        '2026-07-02'),
  (md5('it:pottery')::uuid,      '11111111-1111-4111-8111-111111111111', 'Pottery class',           '2026-07-01', 'completed', 'strawberry', 120,       '2026-07-01'),
  (md5('it:movie-night')::uuid,  '11111111-1111-4111-8111-111111111111', 'Movie night',            '2026-06-24', 'completed', 'strawberry', 88,        '2026-06-24'),
  (md5('it:beach-picnic')::uuid, '11111111-1111-4111-8111-111111111111', 'Beach picnic',            '2026-06-14', 'completed', 'strawberry', 64,        '2026-06-14'),
  (md5('it:bubble-tea')::uuid,   '11111111-1111-4111-8111-111111111111', 'Bubble tea run',          '2026-06-09', 'completed', 'strawberry', 22,        '2026-06-09'),
  (md5('it:sushi')::uuid,        '11111111-1111-4111-8111-111111111111', 'Sushi anniversary',       '2026-05-30', 'completed', 'strawberry', 140,       '2026-05-30'),
  (md5('it:museum')::uuid,       '11111111-1111-4111-8111-111111111111', 'Art museum wander',       '2026-05-17', 'completed', 'strawberry', 40,        '2026-05-17'),
  (md5('it:karaoke')::uuid,      '11111111-1111-4111-8111-111111111111', 'Karaoke night',           '2026-05-09', 'completed', 'strawberry', 75,        '2026-05-09'),
  (md5('it:market')::uuid,       '11111111-1111-4111-8111-111111111111', 'Farmers market',          '2026-05-02', 'completed', 'strawberry', 26,        '2026-05-02')
on conflict (id) do nothing;

-- Stops --------------------------------------------------------------------
insert into stops (id, itinerary_id, position, name, time_label, note, cost, lat, lng, travel_minutes_to_next, travel_mode_to_next, venue_id) values
  (md5('st:kopi')::uuid,      md5('it:cafe-day')::uuid,     0, 'Kopi & Cream Cafe',    '3:00 PM', 'iced matcha & pastries', 28, 3.1478, 101.7068, 12,   'drive', md5('ve:kopi')::uuid),
  (md5('st:arcade')::uuid,    md5('it:cafe-day')::uuid,     1, 'Neon Alley Arcade',    '4:00 PM', 'claw machine rematch',   45, 3.139,  101.6869, 8,    'walk',  md5('ve:arcade')::uuid),
  (md5('st:ramen')::uuid,     md5('it:cafe-day')::uuid,     2, 'Tanuki Ramen House',   '6:30 PM', 'the usual tonkotsu',     96, 3.158,  101.7123, null, null,    md5('ve:ramen')::uuid),
  (md5('st:nm-stalls')::uuid, md5('it:night-market')::uuid, 0, 'Pasar Malam Alley',    '7:30 PM', 'eat everything',         45, null,   null,     null, null,    md5('ve:pasar-malam')::uuid),
  (md5('st:nm-arcade')::uuid, md5('it:night-market')::uuid, 1, 'Retro Arcade Corner',  '9:00 PM', 'air hockey rematch',     20, null,   null,     null, null,    null),
  (md5('st:lp-mart')::uuid,   md5('it:lake-picnic')::uuid,  0, 'Picnic Mart',          '10:00 AM','sandwich supplies',      25, null,   null,     null, null,    null),
  (md5('st:lp-lake')::uuid,   md5('it:lake-picnic')::uuid,  1, 'Titiwangsa Lakeside',  '11:00 AM','the usual bench',        0,  null,   null,     null, null,    md5('ve:lakeside')::uuid),
  (md5('st:bk-books')::uuid,  md5('it:bookstore')::uuid,    0, 'BookXcess',            '2:00 PM', 'one book each, we said', 40, null,   null,     null, null,    md5('ve:bookxcess')::uuid),
  (md5('st:bk-gelato')::uuid, md5('it:bookstore')::uuid,    1, 'Gelato Bar',           '4:00 PM', 'pistachio or nothing',   20, null,   null,     null, null,    null),
  (md5('st:rr-rink')::uuid,   md5('it:roller-rink')::uuid,  0, 'Rollerwave Rink',      '7:00 PM', 'try not to fall',        50, null,   null,     null, null,    md5('ve:roller')::uuid),
  (md5('st:rr-diner')::uuid,  md5('it:roller-rink')::uuid,  1, 'Milkshake Diner',      '9:00 PM', 'post-skate sugar',       20, null,   null,     null, null,    null),
  (md5('st:pt-studio')::uuid, md5('it:pottery')::uuid,      0, 'Clay & Kiln Studio',   '10:00 AM','handles are hard',       110,null,   null,     null, null,    null),
  (md5('st:mv-drivein')::uuid,md5('it:movie-night')::uuid,  0, 'Moonlight Drive-in',   '8:30 PM', 'bring the big blanket',  70, null,   null,     null, null,    md5('ve:drivein')::uuid)
on conflict (id) do nothing;

-- Expenses -----------------------------------------------------------------
insert into expenses (id, space_id, itinerary_id, stop_id, label, amount, spent_on) values
  (md5('ex:nm-food')::uuid,    '11111111-1111-4111-8111-111111111111', md5('it:night-market')::uuid, md5('st:nm-stalls')::uuid, 'Street food',           34, '2026-07-07'),
  (md5('ex:nm-games')::uuid,   '11111111-1111-4111-8111-111111111111', md5('it:night-market')::uuid, md5('st:nm-arcade')::uuid, 'Arcade games',          16, '2026-07-07'),
  (md5('ex:nm-parking')::uuid, '11111111-1111-4111-8111-111111111111', md5('it:night-market')::uuid, null,                      'Parking',               24, '2026-07-07'),
  (md5('ex:lp-snacks')::uuid,  '11111111-1111-4111-8111-111111111111', md5('it:lake-picnic')::uuid,  md5('st:lp-mart')::uuid,   'Picnic snacks',         28, '2026-07-06'),
  (md5('ex:lp-boat')::uuid,    '11111111-1111-4111-8111-111111111111', md5('it:lake-picnic')::uuid,  md5('st:lp-lake')::uuid,   'Swan boat ride',        12, '2026-07-06'),
  (md5('ex:bk-books')::uuid,   '11111111-1111-4111-8111-111111111111', md5('it:bookstore')::uuid,    md5('st:bk-books')::uuid,  'Two paperbacks',        34, '2026-07-05'),
  (md5('ex:bk-gelato')::uuid,  '11111111-1111-4111-8111-111111111111', md5('it:bookstore')::uuid,    md5('st:bk-gelato')::uuid, 'Gelato cups',           18, '2026-07-05'),
  (md5('ex:rr-entry')::uuid,   '11111111-1111-4111-8111-111111111111', md5('it:roller-rink')::uuid,  md5('st:rr-rink')::uuid,   'Entry + skate rental',  44, '2026-07-04'),
  (md5('ex:rr-shakes')::uuid,  '11111111-1111-4111-8111-111111111111', md5('it:roller-rink')::uuid,  md5('st:rr-diner')::uuid,  'Milkshakes',            16, '2026-07-04'),
  (md5('ex:rr-locker')::uuid,  '11111111-1111-4111-8111-111111111111', md5('it:roller-rink')::uuid,  null,                      'Locker',                6,  '2026-07-04'),
  (md5('ex:cd-tokens')::uuid,  '11111111-1111-4111-8111-111111111111', md5('it:claw-duel')::uuid,    null,                      'Token refills',         24, '2026-07-03'),
  (md5('ex:cd-drinks')::uuid,  '11111111-1111-4111-8111-111111111111', md5('it:claw-duel')::uuid,    null,                      'Vending machine drinks',6,  '2026-07-03'),
  (md5('ex:pt-class')::uuid,   '11111111-1111-4111-8111-111111111111', md5('it:pottery')::uuid,      md5('st:pt-studio')::uuid, 'Class for two',         110,'2026-07-01'),
  (md5('ex:pt-glaze')::uuid,   '11111111-1111-4111-8111-111111111111', md5('it:pottery')::uuid,      null,                      'Extra glaze',           10, '2026-07-01'),
  (md5('ex:mn-tickets')::uuid, '11111111-1111-4111-8111-111111111111', md5('it:movie-night')::uuid,  md5('st:mv-drivein')::uuid,'Movie tickets',         46, '2026-06-24'),
  (md5('ex:mn-snacks')::uuid,  '11111111-1111-4111-8111-111111111111', md5('it:movie-night')::uuid,  md5('st:mv-drivein')::uuid,'Popcorn & drinks',      24, '2026-06-24'),
  (md5('ex:mn-parking')::uuid, '11111111-1111-4111-8111-111111111111', md5('it:movie-night')::uuid,  null,                      'Parking',               18, '2026-06-24'),
  (md5('ex:su-dinner')::uuid,  '11111111-1111-4111-8111-111111111111', md5('it:sushi')::uuid,        null,                      'Sushi dinner',          108,'2026-05-30'),
  (md5('ex:su-dessert')::uuid, '11111111-1111-4111-8111-111111111111', md5('it:sushi')::uuid,        null,                      'Dessert',               22, '2026-05-30'),
  (md5('ex:su-parking')::uuid, '11111111-1111-4111-8111-111111111111', md5('it:sushi')::uuid,        null,                      'Parking',               10, '2026-05-30')
on conflict (id) do nothing;

-- Photos (no uploaded blobs in the seed, so storage_path stays null) --------
insert into photos (id, space_id, itinerary_id, caption, taken_on, art, rot, tape, dot) values
  (md5('ph:arcade')::uuid, '11111111-1111-4111-8111-111111111111', md5('it:claw-duel')::uuid,   'arcade high score!!',   '2026-07-03', 0, -3,  'lavender', true),
  (md5('ph:matcha')::uuid, '11111111-1111-4111-8111-111111111111', md5('it:bookstore')::uuid,   'matcha runs',           '2026-07-05', 1, 2,   null,       false),
  (md5('ph:sunset')::uuid, '11111111-1111-4111-8111-111111111111', md5('it:lake-picnic')::uuid, 'sunset walk',           '2026-07-06', 2, -2,  'pink',     false),
  (md5('ph:ramen')::uuid,  '11111111-1111-4111-8111-111111111111', md5('it:movie-night')::uuid, 'ramen date, round 2',   '2026-06-24', 3, 1.5, null,       false)
on conflict (id) do nothing;

-- Venue ratings ------------------------------------------------------------
-- Legacy ratings (no visit) carry no itinerary/stop/date; the rest tie to a visit.
insert into venue_ratings (id, venue_id, rating, itinerary_id, stop_id, rated_on) values
  (md5('vr:kopi')::uuid,     md5('ve:kopi')::uuid,        5, null,                         null,                       null),
  (md5('vr:arcade')::uuid,   md5('ve:arcade')::uuid,      3, null,                         null,                       null),
  (md5('vr:ramen')::uuid,    md5('ve:ramen')::uuid,       5, null,                         null,                       null),
  (md5('vr:drivein')::uuid,  md5('ve:drivein')::uuid,     3, md5('it:movie-night')::uuid,  md5('st:mv-drivein')::uuid, '2026-06-24'),
  (md5('vr:pasar')::uuid,    md5('ve:pasar-malam')::uuid, 5, md5('it:night-market')::uuid, md5('st:nm-stalls')::uuid,  '2026-07-07'),
  (md5('vr:roller')::uuid,   md5('ve:roller')::uuid,      4, md5('it:roller-rink')::uuid,  md5('st:rr-rink')::uuid,    '2026-07-04'),
  (md5('vr:bookxcess')::uuid,md5('ve:bookxcess')::uuid,   5, md5('it:bookstore')::uuid,    md5('st:bk-books')::uuid,   '2026-07-05'),
  (md5('vr:lakeside')::uuid, md5('ve:lakeside')::uuid,    4, md5('it:lake-picnic')::uuid,  md5('st:lp-lake')::uuid,    '2026-07-06')
on conflict (id) do nothing;

-- Venue notes --------------------------------------------------------------
insert into venue_notes (id, venue_id, body) values
  (md5('vn:kopi')::uuid,    md5('ve:kopi')::uuid,    'always our first stop'),
  (md5('vn:arcade')::uuid,  md5('ve:arcade')::uuid,  'the claw machine is rigged lol'),
  (md5('vn:ramen')::uuid,   md5('ve:ramen')::uuid,   'the tonkotsu, every single time'),
  (md5('vn:drivein')::uuid, md5('ve:drivein')::uuid, 'good seats, loud crowd')
on conflict (id) do nothing;
