-- Run in Supabase SQL Editor

-- Players and their picks
create table if not exists open_players (
  name text primary key,
  picks text not null, -- JSON array of 5 golfer names
  updated_at timestamptz default now()
);
alter table open_players enable row level security;
create policy "allow all" on open_players for all using (true) with check (true);

-- Live scores per golfer
create table if not exists golf_scores (
  golfer_name text primary key,
  r1 integer,
  r2 integer,
  r3 integer,
  r4 integer,
  made_cut boolean default true,
  updated_at timestamptz default now()
);
alter table golf_scores enable row level security;
create policy "allow all" on golf_scores for all using (true) with check (true);
