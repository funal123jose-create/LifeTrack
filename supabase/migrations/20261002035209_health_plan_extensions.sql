alter table public.user_physical_profiles
  add column water_goal_ml integer not null default 3000
  constraint user_physical_profiles_water_goal_check check (water_goal_ml between 250 and 10000);

alter table public.meal_logs
  add column food_breakdown jsonb;

alter table public.health_routine_completions
  drop constraint health_routine_completions_routine_type_check;

alter table public.health_routine_completions
  add constraint health_routine_completions_routine_type_check
  check (routine_type in ('fuerza', 'cardio', 'movilidad', 'hiit'));

alter table public.health_weekly_plans
  add column planned_routines jsonb not null default '{}'::jsonb;

create table public.health_plan_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  category text not null check (category in ('nutrition', 'hydration', 'measurement', 'other')),
  title text not null check (length(btrim(title)) between 2 and 160),
  scheduled_time time,
  target_value numeric(8,2) check (target_value is null or target_value > 0),
  target_unit text check (target_unit is null or length(target_unit) between 1 and 20),
  completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index health_plan_items_user_date_idx on public.health_plan_items (user_id, date);

alter table public.health_plan_items enable row level security;
revoke all on public.health_plan_items from anon, authenticated;
grant select, insert, update, delete on public.health_plan_items to authenticated;

create policy "Users view own health plan items" on public.health_plan_items
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "Users insert own health plan items" on public.health_plan_items
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "Users update own health plan items" on public.health_plan_items
  for update to authenticated using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
create policy "Users delete own health plan items" on public.health_plan_items
  for delete to authenticated using ((select auth.uid()) = user_id);
