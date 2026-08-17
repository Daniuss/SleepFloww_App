-- SleepFlow — schema Supabase (nights + records)
-- Rode isto no SQL Editor do painel do Supabase (Project > SQL Editor > New query).
-- auth.users já existe e é gerenciada pelo Supabase Auth — não recriamos users
-- nem guardamos e-mail/senha aqui, só o user_id (auth.uid()).

create table if not exists public.nights (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  date date not null,
  weekday_label text not null,
  events_count integer not null,
  snore_minutes integer not null,
  sleep_duration_hours numeric not null,
  severity text not null check (severity in ('baixo', 'moderado', 'alto')),
  created_at timestamptz not null default now()
);

create table if not exists public.records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  payload jsonb not null
);

create index if not exists nights_user_id_idx on public.nights (user_id);
create index if not exists records_user_id_idx on public.records (user_id);

alter table public.nights enable row level security;
alter table public.records enable row level security;

create policy "nights_select_own" on public.nights
  for select using (auth.uid() = user_id);
create policy "nights_insert_own" on public.nights
  for insert with check (auth.uid() = user_id);
create policy "nights_update_own" on public.nights
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "nights_delete_own" on public.nights
  for delete using (auth.uid() = user_id);

create policy "records_select_own" on public.records
  for select using (auth.uid() = user_id);
create policy "records_insert_own" on public.records
  for insert with check (auth.uid() = user_id);
create policy "records_update_own" on public.records
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "records_delete_own" on public.records
  for delete using (auth.uid() = user_id);
