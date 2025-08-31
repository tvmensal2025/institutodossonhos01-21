-- Tabela para análise de comida com IA
CREATE TABLE IF NOT EXISTS public.food_analysis (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Dados da refeição
  meal_type TEXT NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
  food_items JSONB NOT NULL,
  
  -- Análise nutricional
  nutrition_analysis JSONB NOT NULL,
  
  -- Análise da Sofia com IA
  sofia_analysis JSONB NOT NULL,
  
  -- Metadados
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_food_analysis_user_id ON public.food_analysis(user_id);
CREATE INDEX IF NOT EXISTS idx_food_analysis_created_at ON public.food_analysis(created_at);
CREATE INDEX IF NOT EXISTS idx_food_analysis_meal_type ON public.food_analysis(meal_type);

-- RLS Policies
ALTER TABLE public.food_analysis ENABLE ROW LEVEL SECURITY;

-- Política para usuários verem apenas suas próprias análises
CREATE POLICY "Users can view own food analysis" ON public.food_analysis
  FOR SELECT USING (auth.uid() = user_id);

-- Política para usuários inserirem suas próprias análises
CREATE POLICY "Users can insert own food analysis" ON public.food_analysis
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Política para usuários atualizarem suas próprias análises
CREATE POLICY "Users can update own food analysis" ON public.food_analysis
  FOR UPDATE USING (auth.uid() = user_id);

-- Política para usuários deletarem suas próprias análises
CREATE POLICY "Users can delete own food analysis" ON public.food_analysis
  FOR DELETE USING (auth.uid() = user_id);

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_food_analysis_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar updated_at
CREATE TRIGGER update_food_analysis_updated_at
  BEFORE UPDATE ON public.food_analysis
  FOR EACH ROW
  EXECUTE FUNCTION update_food_analysis_updated_at();

-- Tabela para histórico de alimentos favoritos
CREATE TABLE IF NOT EXISTS public.user_favorite_foods (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Dados do alimento
  food_name TEXT NOT NULL,
  food_category TEXT NOT NULL,
  nutrition_data JSONB,
  
  -- Metadados
  usage_count INTEGER DEFAULT 1,
  last_used TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Índices para alimentos favoritos
CREATE INDEX IF NOT EXISTS idx_user_favorite_foods_user_id ON public.user_favorite_foods(user_id);
CREATE INDEX IF NOT EXISTS idx_user_favorite_foods_usage_count ON public.user_favorite_foods(usage_count);

-- RLS Policies para alimentos favoritos
ALTER TABLE public.user_favorite_foods ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own favorite foods" ON public.user_favorite_foods
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own favorite foods" ON public.user_favorite_foods
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own favorite foods" ON public.user_favorite_foods
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own favorite foods" ON public.user_favorite_foods
  FOR DELETE USING (auth.uid() = user_id);

-- Tabela para padrões alimentares detectados
CREATE TABLE IF NOT EXISTS public.food_patterns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Dados do padrão
  pattern_type TEXT NOT NULL, -- 'emotional_eating', 'healthy_choices', 'meal_timing', etc.
  pattern_description TEXT NOT NULL,
  confidence_score DECIMAL(3,2) CHECK (confidence_score >= 0 AND confidence_score <= 1),
  
  -- Dados de contexto
  context_data JSONB,
  
  -- Metadados
  detected_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_active BOOLEAN DEFAULT true
);

-- Índices para padrões alimentares
CREATE INDEX IF NOT EXISTS idx_food_patterns_user_id ON public.food_patterns(user_id);
CREATE INDEX IF NOT EXISTS idx_food_patterns_pattern_type ON public.food_patterns(pattern_type);
CREATE INDEX IF NOT EXISTS idx_food_patterns_detected_at ON public.food_patterns(detected_at);

-- RLS Policies para padrões alimentares
ALTER TABLE public.food_patterns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own food patterns" ON public.food_patterns
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own food patterns" ON public.food_patterns
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own food patterns" ON public.food_patterns
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own food patterns" ON public.food_patterns
  FOR DELETE USING (auth.uid() = user_id);

-- Comentários para documentação
COMMENT ON TABLE public.food_analysis IS 'Análises de comida com IA da Sofia';
COMMENT ON TABLE public.user_favorite_foods IS 'Alimentos favoritos dos usuários';
COMMENT ON TABLE public.food_patterns IS 'Padrões alimentares detectados pela IA'; 