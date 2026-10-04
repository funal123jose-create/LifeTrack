alter table public.meal_logs
  add column if not exists protein_g numeric(8,2),
  add column if not exists carbs_g numeric(8,2),
  add column if not exists fat_g numeric(8,2);

alter table public.meal_logs
  add constraint meal_logs_protein_nonnegative check (protein_g is null or protein_g between 0 and 1000),
  add constraint meal_logs_carbs_nonnegative check (carbs_g is null or carbs_g between 0 and 1000),
  add constraint meal_logs_fat_nonnegative check (fat_g is null or fat_g between 0 and 1000);

create table public.health_weight_goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  start_weight_kg numeric(6,2) not null check (start_weight_kg > 0 and start_weight_kg < 1000),
  target_weight_kg numeric(6,2) not null check (target_weight_kg > 0 and target_weight_kg < 1000),
  target_date date not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index health_weight_goals_user_idx on public.health_weight_goals (user_id);

alter table public.health_weight_goals enable row level security;
revoke all on public.health_weight_goals from anon, authenticated;
grant select, insert, update on public.health_weight_goals to authenticated;

create policy "Users view own weight goal" on public.health_weight_goals
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "Users insert own weight goal" on public.health_weight_goals
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "Users update own weight goal" on public.health_weight_goals
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
