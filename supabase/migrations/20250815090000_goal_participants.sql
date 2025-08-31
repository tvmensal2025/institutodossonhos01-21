-- Tabela de convites e participantes de metas em grupo
create table if not exists public.user_goal_invitations (
  id uuid primary key default gen_random_uuid(),
  goal_id uuid references public.user_goals(id) on delete cascade,
  inviter_id uuid references auth.users(id) on delete cascade,
  invitee_email text,
  invitee_name text,
  invitee_user_id uuid references auth.users(id) on delete set null,
  status text default 'pending', -- pending | approved | rejected
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.user_goal_participants (
  id uuid primary key default gen_random_uuid(),
  goal_id uuid references public.user_goals(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  can_view_progress boolean default true,
  created_at timestamptz default now(),
  unique(goal_id, user_id)
);

alter table public.user_goal_invitations enable row level security;
alter table public.user_goal_participants enable row level security;

-- Quem convidou pode ver seus convites e o convidado também
create policy "inviter or invitee can read invitations" on public.user_goal_invitations
  for select using (auth.uid() = inviter_id or auth.uid() = invitee_user_id);

-- Apenas o convidador pode inserir convites
create policy "inviter can insert invitations" on public.user_goal_invitations
  for insert with check (auth.uid() = inviter_id);

-- O convidado pode atualizar o status para approved/rejected
create policy "invitee can update own invitation" on public.user_goal_invitations
  for update using (auth.uid() = invitee_user_id);

-- Participantes: quem pertence à meta pode ver e inserir a si mesmo após aprovação
create policy "participants readable by members" on public.user_goal_participants
  for select using (auth.uid() = user_id);

create policy "insert own participation" on public.user_goal_participants
  for insert with check (auth.uid() = user_id);

-- trigger de updated_at
create or replace function public.set_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end; $$ language plpgsql;

drop trigger if exists trg_user_goal_invitations_updated on public.user_goal_invitations;
create trigger trg_user_goal_invitations_updated
  before update on public.user_goal_invitations
  for each row execute function public.set_updated_at();


