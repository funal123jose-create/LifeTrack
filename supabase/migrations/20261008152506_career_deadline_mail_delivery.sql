-- Project dates and server-only email delivery ledger.
alter table public.projects
  add constraint projects_valid_date_range
  check (start_date is null or end_date is null or end_date >= start_date);

create table public.career_deadline_email_deliveries (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  due_date date not null,
  kind text not null check (kind in ('tomorrow', 'overdue')),
  status text not null default 'pending' check (status in ('pending', 'sent')),
  claimed_at timestamptz not null default now(),
  sent_at timestamptz,
  unique (project_id, due_date, kind)
);

create index career_deadline_email_deliveries_user_idx
  on public.career_deadline_email_deliveries(user_id, status);

alter table public.career_deadline_email_deliveries enable row level security;
revoke all on public.career_deadline_email_deliveries from anon, authenticated;
