create table public.health_weekly_plans (
  user_id uuid not null references auth.users(id) on delete cascade,
  week_start date not null,
  planned_days integer[] not null default '{}',
  updated_at timestamptz not null default now(),
  primary key (user_id, week_start),
  constraint planned_days_valid check (planned_days <@ array[1,2,3,4,5,6,7])
);

create index health_weekly_plans_week_idx on public.health_weekly_plans (user_id, week_start desc);
alter table public.health_weekly_plans enable row level security;
revoke all on public.health_weekly_plans from anon, authenticated;
grant select, insert, update on public.health_weekly_plans to authenticated;

create policy "Users view own weekly plans" on public.health_weekly_plans
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "Users insert own weekly plans" on public.health_weekly_plans
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "Users update own weekly plans" on public.health_weekly_plans
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create or replace function public.health_streak_summary(p_today date)
returns table(current_streak integer, best_streak integer, recent_days jsonb)
language sql stable security invoker
set search_path = public, pg_temp
as $$
  with days as (
    select date from public.daily_health_tracker
    where user_id = (select auth.uid())
      and (water_ingested_liters > 0 or calories_ingested > 0)
    union
    select date from public.meal_logs where user_id = (select auth.uid())
    union
    select date from public.water_logs where user_id = (select auth.uid())
    union
    select date from public.health_routine_completions
    where user_id = (select auth.uid()) and completed
  ),
  runs as (
    select date, date - row_number() over (order by date)::integer as island
    from days where date <= p_today
  ),
  grouped as (
    select island, count(*)::integer as length, max(date) as last_date
    from runs group by island
  )
  select
    coalesce((select length from grouped where last_date >= p_today - 1 order by last_date desc limit 1), 0),
    coalesce((select max(length) from grouped), 0),
    coalesce((select jsonb_agg(to_char(date, 'YYYY-MM-DD') order by date)
      from days where date between p_today - 13 and p_today), '[]'::jsonb);
$$;
