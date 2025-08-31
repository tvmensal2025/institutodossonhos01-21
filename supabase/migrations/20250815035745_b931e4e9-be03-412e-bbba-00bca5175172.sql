-- Criar edge function para cálculo correto baseado em TACO
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

-- Distribuições de refeições por usuário
CREATE TABLE IF NOT EXISTS public.user_meal_distribution (
  user_id uuid REFERENCES auth.users(id) PRIMARY KEY,
  cafe_manha_percent numeric DEFAULT 0.25,
  almoco_percent numeric DEFAULT 0.35,
  lanche_percent numeric DEFAULT 0.15,
  jantar_percent numeric DEFAULT 0.25,
  ceia_percent numeric DEFAULT 0.0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
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

-- RLS para distribuição de refeições
ALTER TABLE public.user_meal_distribution ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Usuários podem ver e editar sua própria distribuição" ON public.user_meal_distribution FOR ALL 
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Triggers para updated_at
CREATE OR REPLACE FUNCTION public.update_receitas_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_receitas_updated_at
  BEFORE UPDATE ON public.receitas
  FOR EACH ROW
  EXECUTE FUNCTION public.update_receitas_updated_at();

CREATE TRIGGER update_user_meal_distribution_updated_at
  BEFORE UPDATE ON public.user_meal_distribution
  FOR EACH ROW
  EXECUTE FUNCTION public.update_receitas_updated_at();