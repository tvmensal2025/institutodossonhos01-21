-- Primeiro, vamos verificar e criar colunas necessárias na tabela profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS daily_calories integer DEFAULT 2000,
ADD COLUMN IF NOT EXISTS daily_protein integer DEFAULT 150,
ADD COLUMN IF NOT EXISTS daily_carbs integer DEFAULT 250,
ADD COLUMN IF NOT EXISTS daily_fat integer DEFAULT 65,
ADD COLUMN IF NOT EXISTS daily_fiber integer DEFAULT 25;

-- Criar funções para cálculo baseado em TACO
CREATE OR REPLACE FUNCTION public.fn_user_daily_targets(uid uuid)
RETURNS TABLE (
  kcal integer,
  protein_g integer,
  carbs_g integer,
  fat_g integer,
  fiber_g integer
) LANGUAGE sql STABLE AS $$
  SELECT 
    COALESCE(p.daily_calories, 2000)::integer as kcal,
    COALESCE(p.daily_protein, 150)::integer as protein_g,
    COALESCE(p.daily_carbs, 250)::integer as carbs_g,
    COALESCE(p.daily_fat, 65)::integer as fat_g,
    COALESCE(p.daily_fiber, 25)::integer as fiber_g
  FROM profiles p 
  WHERE p.user_id = uid
  LIMIT 1;
$$;

-- Função para distribuição de metas por refeição
CREATE OR REPLACE FUNCTION public.fn_user_meal_targets(uid uuid)
RETURNS TABLE (
  cafe_manha_kcal integer,
  cafe_manha_protein integer,
  cafe_manha_carbs integer,
  cafe_manha_fat integer,
  almoco_kcal integer,
  almoco_protein integer,
  almoco_carbs integer,
  almoco_fat integer,
  lanche_kcal integer,
  lanche_protein integer,
  lanche_carbs integer,
  lanche_fat integer,
  jantar_kcal integer,
  jantar_protein integer,
  jantar_carbs integer,
  jantar_fat integer
) LANGUAGE sql STABLE AS $$
  WITH targets AS (
    SELECT * FROM fn_user_daily_targets(uid)
  )
  SELECT 
    -- Café da manhã: 25%
    (t.kcal * 0.25)::integer as cafe_manha_kcal,
    (t.protein_g * 0.20)::integer as cafe_manha_protein,
    (t.carbs_g * 0.25)::integer as cafe_manha_carbs,
    (t.fat_g * 0.25)::integer as cafe_manha_fat,
    
    -- Almoço: 35%
    (t.kcal * 0.35)::integer as almoco_kcal,
    (t.protein_g * 0.40)::integer as almoco_protein,
    (t.carbs_g * 0.35)::integer as almoco_carbs,
    (t.fat_g * 0.35)::integer as almoco_fat,
    
    -- Lanche: 15%
    (t.kcal * 0.15)::integer as lanche_kcal,
    (t.protein_g * 0.20)::integer as lanche_protein,
    (t.carbs_g * 0.15)::integer as lanche_carbs,
    (t.fat_g * 0.15)::integer as lanche_fat,
    
    -- Jantar: 25%
    (t.kcal * 0.25)::integer as jantar_kcal,
    (t.protein_g * 0.20)::integer as jantar_protein,
    (t.carbs_g * 0.25)::integer as jantar_carbs,
    (t.fat_g * 0.25)::integer as jantar_fat
  FROM targets t;
$$;

-- Tabela para receitas baseadas em TACO
CREATE TABLE IF NOT EXISTS public.receitas (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  nome text NOT NULL,
  refeicao text NOT NULL CHECK (refeicao IN ('cafe_manha', 'almoco', 'lanche', 'jantar', 'ceia')),
  descricao text,
  preparo text,
  tempo_preparo_min integer,
  dificuldade text DEFAULT 'facil',
  serve_pessoas integer DEFAULT 1,
  tags text[],
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Itens das receitas com referência à TACO
CREATE TABLE IF NOT EXISTS public.receita_itens (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  receita_id uuid REFERENCES receitas(id) ON DELETE CASCADE,
  numero_alimento integer NOT NULL, -- referência para taco_foods.numero
  quantidade_gramas numeric NOT NULL,
  observacoes text,
  ordem integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- RLS para receitas
ALTER TABLE public.receitas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Receitas são públicas para leitura" ON public.receitas FOR SELECT USING (true);
CREATE POLICY "Admins podem gerenciar receitas" ON public.receitas FOR ALL 
  USING (EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin'));

-- RLS para itens de receita
ALTER TABLE public.receita_itens ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Itens de receita são públicos para leitura" ON public.receita_itens FOR SELECT USING (true);
CREATE POLICY "Admins podem gerenciar itens de receita" ON public.receita_itens FOR ALL 
  USING (EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin'));