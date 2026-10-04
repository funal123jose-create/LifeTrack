alter table public.daily_health_tracker
  add column calorie_manual_adjustment numeric(8,2) not null default 0
  constraint daily_health_tracker_manual_adjustment_range check (calorie_manual_adjustment between -100000 and 100000);

alter table public.health_weight_goals
  add column start_date date;

update public.health_weight_goals
set start_date = (created_at at time zone 'America/Bogota')::date
where start_date is null;

alter table public.health_weight_goals
  alter column start_date set not null,
  alter column start_date set default current_date,
  add constraint health_weight_goals_date_order check (target_date >= start_date);

create table public.health_weight_goal_history (
  id uuid primary key default gen_random_uuid(),
  original_goal_id uuid not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  start_date date not null,
  start_weight_kg numeric not null,
  target_weight_kg numeric not null,
  target_date date not null,
  final_weight_kg numeric,
  status text not null check (status in ('completed', 'expired', 'cancelled', 'replaced')),
  closed_at timestamptz not null default now(),
  unique (original_goal_id, closed_at)
);

create index health_weight_goal_history_user_date_idx
  on public.health_weight_goal_history (user_id, closed_at desc);

alter table public.health_weight_goal_history enable row level security;
revoke all on public.health_weight_goal_history from anon, authenticated;
grant select, insert on public.health_weight_goal_history to authenticated;

create policy "Users view own closed weight goals" on public.health_weight_goal_history
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "Users archive own weight goals" on public.health_weight_goal_history
  for insert to authenticated with check ((select auth.uid()) = user_id);

create policy "Users delete own active weight goal" on public.health_weight_goals
  for delete to authenticated using ((select auth.uid()) = user_id);
grant delete on public.health_weight_goals to authenticated;

create or replace function public.replace_health_weight_goal(
  p_start_weight numeric,
  p_target_weight numeric,
  p_target_date date
) returns uuid
language plpgsql security invoker set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_today date := (now() at time zone 'America/Bogota')::date;
  v_current public.health_weight_goals%rowtype;
  v_latest_weight numeric;
  v_goal_id uuid;
begin
  if v_user is null then raise exception 'Authentication required'; end if;
  if p_start_weight is null or p_start_weight <= 0 or p_start_weight >= 1000
    or p_target_weight is null or p_target_weight <= 0 or p_target_weight >= 1000
    or p_target_date is null or p_target_date < v_today then
    raise exception 'Invalid weight goal';
  end if;

  select * into v_current from public.health_weight_goals
  where user_id = v_user for update;
  select weight_kg into v_latest_weight from public.body_progress_logs
  where user_id = v_user and weight_kg is not null
  order by date desc, created_at desc limit 1;

  if v_current.id is not null then
    insert into public.health_weight_goal_history (
      original_goal_id, user_id, start_date, start_weight_kg, target_weight_kg,
      target_date, final_weight_kg, status
    ) values (
      v_current.id, v_user, v_current.start_date, v_current.start_weight_kg,
      v_current.target_weight_kg, v_current.target_date, v_latest_weight,
      case
        when v_latest_weight is not null and
          (case when v_current.target_weight_kg < v_current.start_weight_kg
            then v_latest_weight <= v_current.target_weight_kg
            else v_latest_weight >= v_current.target_weight_kg end) then 'completed'
        when v_current.target_date < v_today then 'expired'
        else 'replaced'
      end
    );
    update public.health_weight_goals set
      start_date = v_today, start_weight_kg = p_start_weight,
      target_weight_kg = p_target_weight, target_date = p_target_date,
      updated_at = now()
    where id = v_current.id returning id into v_goal_id;
  else
    insert into public.health_weight_goals (
      user_id, start_date, start_weight_kg, target_weight_kg, target_date
    ) values (v_user, v_today, p_start_weight, p_target_weight, p_target_date)
    returning id into v_goal_id;
  end if;
  return v_goal_id;
end;
$$;

create or replace function public.cancel_health_weight_goal() returns boolean
language plpgsql security invoker set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_current public.health_weight_goals%rowtype;
  v_latest_weight numeric;
begin
  if v_user is null then raise exception 'Authentication required'; end if;
  select * into v_current from public.health_weight_goals
  where user_id = v_user for update;
  if v_current.id is null then return false; end if;
  select weight_kg into v_latest_weight from public.body_progress_logs
  where user_id = v_user and weight_kg is not null
  order by date desc, created_at desc limit 1;
  insert into public.health_weight_goal_history (
    original_goal_id, user_id, start_date, start_weight_kg, target_weight_kg,
    target_date, final_weight_kg, status
  ) values (
    v_current.id, v_user, v_current.start_date, v_current.start_weight_kg,
    v_current.target_weight_kg, v_current.target_date, v_latest_weight, 'cancelled'
  );
  delete from public.health_weight_goals where id = v_current.id;
  return true;
end;
$$;

revoke all on function public.replace_health_weight_goal(numeric, numeric, date) from public, anon;
revoke all on function public.cancel_health_weight_goal() from public, anon;
grant execute on function public.replace_health_weight_goal(numeric, numeric, date) to authenticated;
grant execute on function public.cancel_health_weight_goal() to authenticated;
