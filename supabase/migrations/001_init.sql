create extension if not exists "pgcrypto";

create type app_role as enum ('admin', 'umpire');
create type tie_status as enum ('upcoming', 'live', 'paused', 'finished');
create type match_status as enum ('not_started', 'live', 'paused', 'finished');
create type score_event_type as enum ('point_added', 'point_undone', 'set_completed', 'set_reset', 'match_completed', 'match_reopened', 'manual_adjustment');
create type team_side as enum ('a', 'b');

create table if not exists tournament_settings (
  id uuid primary key default gen_random_uuid(),
  open_assignment_mode boolean not null default false,
  tournament_title text not null default 'Badminton Team Tournament',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists teams (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  logo_url text,
  created_at timestamptz not null default now()
);

create table if not exists players (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references teams(id) on delete cascade,
  full_name text not null,
  gender text,
  created_at timestamptz not null default now()
);

create table if not exists ties (
  id uuid primary key default gen_random_uuid(),
  team_a_id uuid not null references teams(id),
  team_b_id uuid not null references teams(id),
  scheduled_at timestamptz,
  status tie_status not null default 'upcoming',
  venue text,
  court_label text,
  team_a_tie_score int not null default 0,
  team_b_tie_score int not null default 0,
  winner_team_id uuid references teams(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (team_a_id <> team_b_id)
);

create table if not exists tie_matches (
  id uuid primary key default gen_random_uuid(),
  tie_id uuid not null references ties(id) on delete cascade,
  category text not null,
  order_index int not null,
  team_a_player_1_id uuid references players(id),
  team_a_player_2_id uuid references players(id),
  team_b_player_1_id uuid references players(id),
  team_b_player_2_id uuid references players(id),
  current_set_number int not null default 1,
  team_a_sets_won int not null default 0,
  team_b_sets_won int not null default 0,
  status match_status not null default 'not_started',
  winner_team_id uuid references teams(id),
  umpire_user_id uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(tie_id, category),
  unique(tie_id, order_index)
);

create table if not exists match_sets (
  id uuid primary key default gen_random_uuid(),
  tie_match_id uuid not null references tie_matches(id) on delete cascade,
  set_number int not null,
  team_a_score int not null default 0,
  team_b_score int not null default 0,
  completed boolean not null default false,
  winner_team_id uuid references teams(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(tie_match_id, set_number)
);

create table if not exists score_events (
  id uuid primary key default gen_random_uuid(),
  tie_match_id uuid not null references tie_matches(id) on delete cascade,
  set_number int not null,
  event_type score_event_type not null,
  team_side team_side,
  value int,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create table if not exists user_profiles (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid not null unique references auth.users(id) on delete cascade,
  full_name text not null,
  role app_role not null,
  created_at timestamptz not null default now()
);

alter table tournament_settings enable row level security;
alter table teams enable row level security;
alter table players enable row level security;
alter table ties enable row level security;
alter table tie_matches enable row level security;
alter table match_sets enable row level security;
alter table score_events enable row level security;
alter table user_profiles enable row level security;

create or replace function is_admin(uid uuid) returns boolean language sql stable as $$
  select exists(select 1 from user_profiles where auth_user_id = uid and role = 'admin');
$$;

create or replace function is_umpire(uid uuid) returns boolean language sql stable as $$
  select exists(select 1 from user_profiles where auth_user_id = uid and role in ('admin','umpire'));
$$;

create policy "public read teams" on teams for select using (true);
create policy "public read players" on players for select using (true);
create policy "public read ties" on ties for select using (true);
create policy "public read tie_matches" on tie_matches for select using (true);
create policy "public read match_sets" on match_sets for select using (true);
create policy "public read score_events" on score_events for select using (true);
create policy "users read own profile" on user_profiles for select using (auth.uid() = auth_user_id or is_admin(auth.uid()));
create policy "admin full teams" on teams for all using (is_admin(auth.uid())) with check (is_admin(auth.uid()));
create policy "admin full players" on players for all using (is_admin(auth.uid())) with check (is_admin(auth.uid()));
create policy "admin full ties" on ties for all using (is_admin(auth.uid())) with check (is_admin(auth.uid()));
create policy "admin full tie_matches" on tie_matches for all using (is_admin(auth.uid())) with check (is_admin(auth.uid()));
create policy "admin full sets" on match_sets for all using (is_admin(auth.uid())) with check (is_admin(auth.uid()));
create policy "admin full score_events" on score_events for all using (is_admin(auth.uid())) with check (is_admin(auth.uid()));
create policy "admin full settings" on tournament_settings for all using (is_admin(auth.uid())) with check (is_admin(auth.uid()));

create policy "umpire update assigned matches" on tie_matches for update using (
  is_admin(auth.uid()) or umpire_user_id = auth.uid() or
  (select open_assignment_mode from tournament_settings limit 1)
) with check (
  is_admin(auth.uid()) or umpire_user_id = auth.uid() or
  (select open_assignment_mode from tournament_settings limit 1)
);
create policy "umpire update assigned sets" on match_sets for update using (
  is_admin(auth.uid()) or exists(select 1 from tie_matches tm where tm.id = tie_match_id and (tm.umpire_user_id = auth.uid() or (select open_assignment_mode from tournament_settings limit 1)))
) with check (
  is_admin(auth.uid()) or exists(select 1 from tie_matches tm where tm.id = tie_match_id and (tm.umpire_user_id = auth.uid() or (select open_assignment_mode from tournament_settings limit 1)))
);
create policy "umpire add score events" on score_events for insert with check (
  is_admin(auth.uid()) or exists(select 1 from tie_matches tm where tm.id = tie_match_id and (tm.umpire_user_id = auth.uid() or (select open_assignment_mode from tournament_settings limit 1)))
);

create or replace function touch_updated_at() returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger touch_ties_updated before update on ties for each row execute function touch_updated_at();
create trigger touch_matches_updated before update on tie_matches for each row execute function touch_updated_at();
create trigger touch_sets_updated before update on match_sets for each row execute function touch_updated_at();

create or replace function ensure_set_row(p_match_id uuid, p_set_number int) returns void language plpgsql as $$
begin
  insert into match_sets(tie_match_id, set_number)
  values (p_match_id, p_set_number)
  on conflict (tie_match_id, set_number) do nothing;
end;
$$;

create or replace function recalc_tie(p_tie_id uuid) returns void language plpgsql as $$
declare
  a_score int;
  b_score int;
  a_id uuid;
  b_id uuid;
  finished_matches int;
begin
  select team_a_id, team_b_id into a_id, b_id from ties where id = p_tie_id;

  select count(*) filter (where winner_team_id = a_id),
         count(*) filter (where winner_team_id = b_id),
         count(*) filter (where status = 'finished')
    into a_score, b_score, finished_matches
  from tie_matches
  where tie_id = p_tie_id;

  update ties
     set team_a_tie_score = coalesce(a_score, 0),
         team_b_tie_score = coalesce(b_score, 0),
         winner_team_id = case when coalesce(a_score,0) > coalesce(b_score,0) then a_id when coalesce(b_score,0) > coalesce(a_score,0) then b_id else null end,
         status = case when finished_matches = 7 then 'finished'::tie_status else status end
   where id = p_tie_id;
end;
$$;

create or replace function recalc_match(p_match_id uuid) returns void language plpgsql as $$
declare
  a_sets int;
  b_sets int;
  tie_id_val uuid;
  a_id uuid;
  b_id uuid;
begin
  select tm.tie_id, t.team_a_id, t.team_b_id
    into tie_id_val, a_id, b_id
  from tie_matches tm
  join ties t on t.id = tm.tie_id
  where tm.id = p_match_id;

  select count(*) filter (where completed and team_a_score > team_b_score),
         count(*) filter (where completed and team_b_score > team_a_score)
    into a_sets, b_sets
  from match_sets where tie_match_id = p_match_id;

  update tie_matches
  set team_a_sets_won = coalesce(a_sets,0),
      team_b_sets_won = coalesce(b_sets,0),
      winner_team_id = case when coalesce(a_sets,0) >= 2 then a_id when coalesce(b_sets,0) >= 2 then b_id else null end,
      status = case when coalesce(a_sets,0) >= 2 or coalesce(b_sets,0) >= 2 then 'finished'::match_status when status = 'not_started' then 'live'::match_status else status end,
      current_set_number = case when coalesce(a_sets,0) >= 2 or coalesce(b_sets,0) >= 2 then current_set_number else least(3, greatest(1, coalesce(a_sets,0)+coalesce(b_sets,0)+1)) end
  where id = p_match_id;

  perform recalc_tie(tie_id_val);
end;
$$;

create or replace function add_match_point(p_match_id uuid, p_team_side team_side) returns void language plpgsql security definer as $$
declare
  set_no int;
  uid uuid := auth.uid();
begin
  select current_set_number into set_no from tie_matches where id = p_match_id;
  perform ensure_set_row(p_match_id, set_no);

  update tie_matches set status = 'live' where id = p_match_id and status = 'not_started';

  if p_team_side = 'a' then
    update match_sets set team_a_score = team_a_score + 1 where tie_match_id = p_match_id and set_number = set_no;
  else
    update match_sets set team_b_score = team_b_score + 1 where tie_match_id = p_match_id and set_number = set_no;
  end if;

  insert into score_events(tie_match_id, set_number, event_type, team_side, value, created_by)
  values (p_match_id, set_no, 'point_added', p_team_side, 1, uid);
end;
$$;

create or replace function undo_last_point(p_match_id uuid) returns void language plpgsql security definer as $$
declare
  set_no int;
  last_side team_side;
  uid uuid := auth.uid();
begin
  select current_set_number into set_no from tie_matches where id = p_match_id;
  select team_side into last_side
  from score_events
  where tie_match_id = p_match_id and event_type = 'point_added' and set_number = set_no
  order by created_at desc
  limit 1;

  if last_side = 'a' then
    update match_sets set team_a_score = greatest(team_a_score - 1, 0) where tie_match_id = p_match_id and set_number = set_no;
  elsif last_side = 'b' then
    update match_sets set team_b_score = greatest(team_b_score - 1, 0) where tie_match_id = p_match_id and set_number = set_no;
  end if;

  insert into score_events(tie_match_id, set_number, event_type, team_side, value, created_by)
  values (p_match_id, set_no, 'point_undone', last_side, 1, uid);
end;
$$;

create or replace function complete_current_set(p_match_id uuid) returns void language plpgsql security definer as $$
declare
  set_no int;
  a int;
  b int;
  tie_a uuid;
  tie_b uuid;
  uid uuid := auth.uid();
begin
  select current_set_number into set_no from tie_matches where id = p_match_id;
  perform ensure_set_row(p_match_id, set_no);

  select ms.team_a_score, ms.team_b_score, t.team_a_id, t.team_b_id
    into a, b, tie_a, tie_b
  from match_sets ms
  join tie_matches tm on tm.id = ms.tie_match_id
  join ties t on t.id = tm.tie_id
  where ms.tie_match_id = p_match_id and ms.set_number = set_no;

  update match_sets
     set completed = true,
         winner_team_id = case when a > b then tie_a when b > a then tie_b else null end
   where tie_match_id = p_match_id and set_number = set_no;

  insert into score_events(tie_match_id, set_number, event_type, value, created_by)
  values (p_match_id, set_no, 'set_completed', null, uid);

  perform recalc_match(p_match_id);
  perform ensure_set_row(p_match_id, (select current_set_number from tie_matches where id = p_match_id));
end;
$$;

create or replace function reset_current_set(p_match_id uuid) returns void language plpgsql security definer as $$
declare
  set_no int;
  uid uuid := auth.uid();
begin
  select current_set_number into set_no from tie_matches where id = p_match_id;
  update match_sets set team_a_score = 0, team_b_score = 0, completed = false, winner_team_id = null where tie_match_id = p_match_id and set_number = set_no;
  insert into score_events(tie_match_id, set_number, event_type, created_by) values (p_match_id, set_no, 'set_reset', uid);
end;
$$;

create or replace function finalize_match_manually(p_match_id uuid) returns void language plpgsql security definer as $$
declare uid uuid := auth.uid(); set_no int;
begin
  select current_set_number into set_no from tie_matches where id = p_match_id;
  perform complete_current_set(p_match_id);
  update tie_matches set status = 'finished' where id = p_match_id;
  insert into score_events(tie_match_id, set_number, event_type, created_by) values (p_match_id, set_no, 'match_completed', uid);
  perform recalc_match(p_match_id);
end;
$$;

create or replace function get_standings()
returns table (
  team_id uuid,
  team_name text,
  ties_played int,
  ties_won int,
  ties_lost int,
  matches_won int,
  matches_lost int,
  sets_won int,
  sets_lost int,
  match_difference int,
  set_difference int,
  ranking_points int
)
language sql stable as $$
with base as (
  select t.id, t.name from teams t
),
tie_stats as (
  select b.id team_id,
    count(*) filter (where ties.status = 'finished' and (ties.team_a_id = b.id or ties.team_b_id = b.id))::int ties_played,
    count(*) filter (where ties.status = 'finished' and ties.winner_team_id = b.id)::int ties_won,
    count(*) filter (where ties.status = 'finished' and ties.winner_team_id is not null and ties.winner_team_id <> b.id)::int ties_lost
  from base b
  left join ties on ties.team_a_id = b.id or ties.team_b_id = b.id
  group by b.id
),
match_stats as (
  select b.id team_id,
    count(*) filter (where tm.winner_team_id = b.id)::int matches_won,
    count(*) filter (where tm.winner_team_id is not null and tm.winner_team_id <> b.id)::int matches_lost,
    sum(case when ties.team_a_id = b.id then tm.team_a_sets_won when ties.team_b_id = b.id then tm.team_b_sets_won else 0 end)::int sets_won,
    sum(case when ties.team_a_id = b.id then tm.team_b_sets_won when ties.team_b_id = b.id then tm.team_a_sets_won else 0 end)::int sets_lost
  from base b
  left join ties on ties.team_a_id = b.id or ties.team_b_id = b.id
  left join tie_matches tm on tm.tie_id = ties.id and ties.status = 'finished'
  group by b.id
)
select b.id,
  b.name,
  ts.ties_played,
  ts.ties_won,
  ts.ties_lost,
  coalesce(ms.matches_won, 0),
  coalesce(ms.matches_lost, 0),
  coalesce(ms.sets_won, 0),
  coalesce(ms.sets_lost, 0),
  coalesce(ms.matches_won, 0) - coalesce(ms.matches_lost, 0) as match_difference,
  coalesce(ms.sets_won, 0) - coalesce(ms.sets_lost, 0) as set_difference,
  ts.ties_won * 3 as ranking_points
from base b
join tie_stats ts on ts.team_id = b.id
join match_stats ms on ms.team_id = b.id
order by ts.ties_won desc, (coalesce(ms.matches_won, 0) - coalesce(ms.matches_lost, 0)) desc, (coalesce(ms.sets_won, 0) - coalesce(ms.sets_lost, 0)) desc;
$$;

insert into tournament_settings (open_assignment_mode) values (false) on conflict do nothing;
