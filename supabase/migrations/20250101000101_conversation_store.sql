-- Conversas do usuário (Sofia / Dr. Vital) + mensagens, anexos e extração de fatos
-- Idempotente e seguro para executar várias vezes

create extension if not exists pgcrypto;
create extension if not exists pg_trgm;

-- Tipos enum (idempotentes)
do $$ begin
  if not exists (select 1 from pg_type where typname = 'conversation_agent') then
    create type public.conversation_agent as enum ('sofia','dr_vital');
  end if;
  if not exists (select 1 from pg_type where typname = 'message_role') then
    create type public.message_role as enum ('user','assistant','system');
  end if;
end $$;

-- Tabela de conversas
create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  agent public.conversation_agent not null,
  title text,
  meta jsonb not null default '{}'::jsonb,
  started_at timestamptz not null default now(),
  last_message_at timestamptz not null default now()
);

create index if not exists conversations_user_idx on public.conversations(user_id);
create index if not exists conversations_agent_idx on public.conversations(agent);

alter table public.conversations enable row level security;

do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='conversations' and policyname='conversations_select_own'
  ) then
    create policy conversations_select_own on public.conversations
      for select using (auth.uid() = user_id);
  end if;
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='conversations' and policyname='conversations_modify_own'
  ) then
    create policy conversations_modify_own on public.conversations
      for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
  end if;
end $$;

-- Mensagens
create table if not exists public.conversation_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  role public.message_role not null,
  content text not null,
  model text,
  tokens_in int,
  tokens_out int,
  message_index int,
  meta jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  content_fts tsvector
);

create unique index if not exists conv_messages_conv_idx_unique on public.conversation_messages(conversation_id, message_index);
create index if not exists conv_messages_conv_idx on public.conversation_messages(conversation_id);
create index if not exists conv_messages_fts_idx on public.conversation_messages using gin(content_fts);

alter table public.conversation_messages enable row level security;

-- RLS: usuário só acessa mensagens de suas conversas
do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='conversation_messages' and policyname='conv_messages_select_own'
  ) then
    create policy conv_messages_select_own on public.conversation_messages
      for select using (
        exists (
          select 1 from public.conversations c
          where c.id = conversation_id and c.user_id = auth.uid()
        )
      );
  end if;
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='conversation_messages' and policyname='conv_messages_modify_own'
  ) then
    create policy conv_messages_modify_own on public.conversation_messages
      for all using (
        exists (
          select 1 from public.conversations c
          where c.id = conversation_id and c.user_id = auth.uid()
        )
      ) with check (
        exists (
          select 1 from public.conversations c
          where c.id = conversation_id and c.user_id = auth.uid()
        )
      );
  end if;
end $$;

-- Anexos de mensagem (ex.: imagens)
create table if not exists public.conversation_attachments (
  id uuid primary key default gen_random_uuid(),
  message_id uuid not null references public.conversation_messages(id) on delete cascade,
  storage_path text not null,
  mime text,
  bytes bigint,
  meta jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists conv_attach_msg_idx on public.conversation_attachments(message_id);
alter table public.conversation_attachments enable row level security;

do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='conversation_attachments' and policyname='conv_attach_select_own'
  ) then
    create policy conv_attach_select_own on public.conversation_attachments
      for select using (
        exists (
          select 1 from public.conversation_messages m
          join public.conversations c on c.id = m.conversation_id
          where m.id = message_id and c.user_id = auth.uid()
        )
      );
  end if;
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='conversation_attachments' and policyname='conv_attach_modify_own'
  ) then
    create policy conv_attach_modify_own on public.conversation_attachments
      for all using (
        exists (
          select 1 from public.conversation_messages m
          join public.conversations c on c.id = m.conversation_id
          where m.id = message_id and c.user_id = auth.uid()
        )
      ) with check (
        exists (
          select 1 from public.conversation_messages m
          join public.conversations c on c.id = m.conversation_id
          where m.id = message_id and c.user_id = auth.uid()
        )
      );
  end if;
end $$;

-- Fatos extraídos (memória estruturada) sem duplicar
create table if not exists public.conversation_facts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  conversation_id uuid references public.conversations(id) on delete cascade,
  source_message_id uuid references public.conversation_messages(id) on delete cascade,
  category text not null, -- ex.: allergies, chronic_flags, pain_mood, food_preferences
  payload jsonb not null, -- estrutura específica por categoria
  confidence numeric,
  hash text generated always as (md5(payload::text)) stored,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists conv_facts_dedupe_idx on public.conversation_facts(user_id, category, hash);
create index if not exists conv_facts_user_idx on public.conversation_facts(user_id);
alter table public.conversation_facts enable row level security;

do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='conversation_facts' and policyname='conv_facts_select_own'
  ) then
    create policy conv_facts_select_own on public.conversation_facts
      for select using (auth.uid() = user_id);
  end if;
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='conversation_facts' and policyname='conv_facts_modify_own'
  ) then
    create policy conv_facts_modify_own on public.conversation_facts
      for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
  end if;
end $$;

-- Triggers auxiliares
-- 1) Atualizar last_message_at e message_index; 2) Preencher FTS; 3) updated_at facts

create or replace function public.trg_set_message_index() returns trigger as $$
declare next_idx int;
begin
  select coalesce(max(message_index), -1) + 1 into next_idx from public.conversation_messages where conversation_id = new.conversation_id;
  new.message_index := coalesce(new.message_index, next_idx);
  return new;
end $$ language plpgsql;

create or replace function public.trg_touch_conversation() returns trigger as $$
begin
  update public.conversations set last_message_at = now() where id = new.conversation_id;
  return new;
end $$ language plpgsql;

create or replace function public.trg_fill_fts() returns trigger as $$
begin
  new.content_fts := to_tsvector('portuguese', coalesce(new.content,'') );
  return new;
end $$ language plpgsql;

create or replace function public.trg_touch_fact_updated() returns trigger as $$
begin
  new.updated_at := now();
  return new;
end $$ language plpgsql;

do $$ begin
  if not exists (
    select 1 from pg_trigger where tgname = 'conv_msg_set_index'
  ) then
    create trigger conv_msg_set_index before insert on public.conversation_messages
      for each row execute function public.trg_set_message_index();
  end if;
  if not exists (
    select 1 from pg_trigger where tgname = 'conv_msg_touch_conv'
  ) then
    create trigger conv_msg_touch_conv after insert on public.conversation_messages
      for each row execute function public.trg_touch_conversation();
  end if;
  if not exists (
    select 1 from pg_trigger where tgname = 'conv_msg_fill_fts'
  ) then
    create trigger conv_msg_fill_fts before insert or update on public.conversation_messages
      for each row execute function public.trg_fill_fts();
  end if;
  if not exists (
    select 1 from pg_trigger where tgname = 'conv_fact_touch'
  ) then
    create trigger conv_fact_touch before update on public.conversation_facts
      for each row execute function public.trg_touch_fact_updated();
  end if;
end $$;

-- View de resumo por usuário
create or replace view public.v_user_conversation_summary as
select
  c.user_id,
  count(distinct c.id) as conversations,
  count(m.id) as messages,
  min(c.started_at) as first_conversation,
  max(c.last_message_at) as last_activity
from public.conversations c
left join public.conversation_messages m on m.conversation_id = c.id
group by c.user_id;


