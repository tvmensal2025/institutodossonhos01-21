-- Remover tabelas conflitantes
DROP TABLE IF EXISTS public.receita_itens CASCADE;
DROP TABLE IF EXISTS public.receitas CASCADE;

-- Criar nova tabela de receitas com UUID
CREATE TABLE public.receitas (
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

-- Criar tabela de itens das receitas
CREATE TABLE public.receita_itens (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  receita_id uuid REFERENCES receitas(id) ON DELETE CASCADE,
  numero_taco integer NOT NULL, -- número do alimento na tabela TACO
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

-- Função para calcular nutrição de receita baseada na TACO
CREATE OR REPLACE FUNCTION public.fn_calcular_receita_nutricao(receita_uuid uuid)
RETURNS TABLE (
  total_kcal numeric,
  total_protein_g numeric,
  total_carbs_g numeric,
  total_fat_g numeric,
  total_fiber_g numeric,
  total_grams numeric
) LANGUAGE sql STABLE AS $$
  WITH receita_nutricao AS (
    SELECT 
      SUM((ri.quantidade_gramas / 100.0) * tf.energia_kcal) as kcal,
      SUM((ri.quantidade_gramas / 100.0) * tf.proteina_g) as protein_g,
      SUM((ri.quantidade_gramas / 100.0) * tf.carboidratos_g) as carbs_g,
      SUM((ri.quantidade_gramas / 100.0) * tf.lipidios_g) as fat_g,
      SUM((ri.quantidade_gramas / 100.0) * tf.fibra_alimentar_g) as fiber_g,
      SUM(ri.quantidade_gramas) as total_grams
    FROM receita_itens ri
    JOIN taco_foods tf ON tf.numero = ri.numero_taco
    WHERE ri.receita_id = receita_uuid
  )
  SELECT 
    COALESCE(rn.kcal, 0) as total_kcal,
    COALESCE(rn.protein_g, 0) as total_protein_g,
    COALESCE(rn.carbs_g, 0) as total_carbs_g,
    COALESCE(rn.fat_g, 0) as total_fat_g,
    COALESCE(rn.fiber_g, 0) as total_fiber_g,
    COALESCE(rn.total_grams, 0) as total_grams
  FROM receita_nutricao rn;
$$;