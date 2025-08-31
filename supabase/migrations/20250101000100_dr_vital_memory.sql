-- Memória persistente do Dr. Vital
create extension if not exists pgcrypto;

create table if not exists public.dr_vital_memory (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  key text not null,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create unique index if not exists dr_vital_memory_user_key_idx on public.dr_vital_memory(user_id, key);
create index if not exists dr_vital_memory_user_idx on public.dr_vital_memory(user_id);

alter table public.dr_vital_memory enable row level security;

do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'dr_vital_memory' and policyname = 'dr_vital_memory_select_own'
  ) then
    create policy dr_vital_memory_select_own on public.dr_vital_memory
      for select using (auth.uid() = user_id);
  end if;
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'dr_vital_memory' and policyname = 'dr_vital_memory_modify_own'
  ) then
    create policy dr_vital_memory_modify_own on public.dr_vital_memory
      for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
  end if;
end $$;


