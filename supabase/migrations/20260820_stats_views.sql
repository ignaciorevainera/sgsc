-- view_player_streaks
create or replace view view_player_streaks as
with ordered as (
  select
    mp.player_id,
    mp.match_id,
    m.date,
    case
      when m.result = 'draw' then 'D'
      when mp.team = m.result then 'W'
      else 'L'
    end as outcome
  from match_players mp
  join matches m on m.id = mp.match_id
),
ranked as (
  select
    player_id,
    match_id,
    date,
    outcome,
    row_number() over (partition by player_id order by date, match_id) as rn
  from ordered
),
islands as (
  select
    player_id,
    outcome,
    rn - row_number() over (partition by player_id, outcome order by rn) as grp
  from ranked
),
lengths as (
  select
    i.player_id,
    i.outcome,
    i.grp,
    count(*) as len,
    max(r.rn) as max_rn
  from islands i
  join ranked r on r.player_id = i.player_id and r.rn = i.rn
  group by i.player_id, i.outcome, i.grp
)
select
  p.id as player_id,
  c.outcome as current_streak_type,
  c.len as current_streak_length,
  coalesce(max(case when l.outcome = 'W' then l.len end), 0) as longest_win_streak,
  coalesce(max(case when l.outcome = 'L' then l.len end), 0) as longest_loss_streak
from players p
left join lengths l on l.player_id = p.id
left join lengths c
  on c.player_id = p.id
  and c.max_rn = (select max(max_rn) from lengths where player_id = p.id)
group by p.id, c.outcome, c.len;

-- view_head_to_head
create or replace view view_head_to_head as
with pairs as (
  select
    a.player_id as player_a_id,
    b.player_id as player_b_id,
    m.id as match_id,
    m.date,
    m.result,
    a.team as a_team,
    b.team as b_team
  from match_players a
  join match_players b
    on b.match_id = a.match_id and b.player_id <> a.player_id
  join matches m on m.id = a.match_id
),
ordered_pairs as (
  select
    player_a_id,
    player_b_id,
    match_id,
    date,
    result,
    a_team,
    b_team,
    row_number() over (
      partition by player_a_id, player_b_id
      order by date desc, match_id desc
    ) as rn
  from pairs
),
aggregated as (
  select
    player_a_id,
    player_b_id,
    count(*) as matches_together,
    count(*) filter (where a_team <> b_team) as matches_against,
    count(*) filter (where a_team <> b_team and result = a_team) as a_wins,
    count(*) filter (where a_team <> b_team and result = b_team) as b_wins,
    count(*) filter (where a_team <> b_team and result = 'draw') as draws,
    count(*) filter (where a_team = b_team) as shared_teams
  from pairs
  group by player_a_id, player_b_id
),
last5 as (
  select
    player_a_id,
    player_b_id,
    array_agg(
      case
        when result = 'draw' then 'D'
        when result = a_team then 'A'
        else 'B'
      end
      order by rn
    ) filter (where rn <= 5) as last_5_outcomes
  from ordered_pairs
  group by player_a_id, player_b_id
)
select
  a.player_a_id,
  a.player_b_id,
  a.matches_together,
  a.matches_against,
  a.a_wins,
  a.b_wins,
  a.draws,
  a.shared_teams,
  case
    when a.matches_against = 0 then 0
    else round(100.0 * a.a_wins / a.matches_against)
  end as a_win_rate,
  l.last_5_outcomes
from aggregated a
join last5 l
  on l.player_a_id = a.player_a_id and l.player_b_id = a.player_b_id;

-- view_field_dominance
create or replace view view_field_dominance as
with field_stats as (
  select
    mp.player_id,
    m.field_id,
    count(*) as matches_at_field,
    count(*) filter (where m.result = mp.team) as wins
  from match_players mp
  join matches m on m.id = mp.match_id
  where m.field_id is not null
  group by mp.player_id, m.field_id
),
home as (
  select distinct on (player_id)
    player_id,
    field_id as home_field_id
  from field_stats
  order by player_id, matches_at_field desc, field_id
)
select
  fs.player_id,
  fs.field_id,
  fs.matches_at_field,
  fs.wins,
  case
    when fs.matches_at_field = 0 then 0
    else round(100.0 * fs.wins / fs.matches_at_field)
  end as win_rate,
  (h.home_field_id = fs.field_id) as home_field
from field_stats fs
join home h on h.player_id = fs.player_id;
