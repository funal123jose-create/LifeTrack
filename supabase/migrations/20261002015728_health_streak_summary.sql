create function public.health_streak_summary(p_today date)
returns table(current_streak integer, best_streak integer, recent_days jsonb)
language sql stable security invoker
set search_path = public, pg_temp
as $$
  with days as (
    select date from public.daily_health_tracker
    where user_id = (select auth.uid())
      and (water_ingested_liters > 0 or calories_ingested > 0 or is_workout_day)
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

revoke all on function public.health_streak_summary(date) from public, anon;
grant execute on function public.health_streak_summary(date) to authenticated;
