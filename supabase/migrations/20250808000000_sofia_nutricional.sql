-- Sofia Nutricional - Tabelas principais

-- 1) Perfil alimentar do usuário
create table if not exists public.user_food_profile (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  alergias text,
  restricoes_religiosas text,
  dislikes text,
  orcamento text check (orcamento in ('baixo','médio','alto')) default 'médio',
  tempo_preparo_min integer default 30,
  utensilios text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.user_food_profile enable row level security;
create policy "user_food_profile_select_own" on public.user_food_profile for select using (auth.uid() = user_id);
create policy "user_food_profile_insert_own" on public.user_food_profile for insert with check (auth.uid() = user_id);
create policy "user_food_profile_update_own" on public.user_food_profile for update using (auth.uid() = user_id);
create index if not exists idx_user_food_profile_user on public.user_food_profile(user_id);

-- 2) Sugestões de refeição (planos gerados)
create table if not exists public.meal_suggestions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  type text not null check (type in ('dia','semana')),
  is_active boolean default false,
  target_calories_kcal integer,
  score integer,
  tags text[],
  intake_answers jsonb, -- respostas do wizard (Q&A)
  plan_json jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.meal_suggestions enable row level security;
create policy "meal_suggestions_select_own" on public.meal_suggestions for select using (auth.uid() = user_id);
create policy "meal_suggestions_insert_own" on public.meal_suggestions for insert with check (auth.uid() = user_id);
create policy "meal_suggestions_update_own" on public.meal_suggestions for update using (auth.uid() = user_id);
create index if not exists idx_meal_suggestions_user on public.meal_suggestions(user_id);
create index if not exists idx_meal_suggestions_active on public.meal_suggestions(user_id, is_active);

-- 3) Feedback por refeição
create table if not exists public.meal_feedback (
  id uuid primary key default gen_random_uuid(),
  suggestion_id uuid not null references public.meal_suggestions(id) on delete cascade,
  user_id uuid not null,
  refeicao text check (refeicao in ('breakfast','lunch','afternoon_snack','dinner','supper')),
  rating integer check (rating between 1 and 5),
  feedback_text text,
  created_at timestamptz not null default now()
);

alter table public.meal_feedback enable row level security;
create policy "meal_feedback_select_own" on public.meal_feedback for select using (auth.uid() = user_id);
create policy "meal_feedback_insert_own" on public.meal_feedback for insert with check (auth.uid() = user_id);
create index if not exists idx_meal_feedback_user on public.meal_feedback(user_id);
create index if not exists idx_meal_feedback_suggestion on public.meal_feedback(suggestion_id);










