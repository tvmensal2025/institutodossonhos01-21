-- Criar tabela food_analysis para armazenar análises nutricionais
CREATE TABLE public.food_analysis (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  analysis_date DATE NOT NULL DEFAULT CURRENT_DATE,
  analysis_time TIME NOT NULL DEFAULT CURRENT_TIME,
  meal_type TEXT DEFAULT 'refeicao',
  food_items JSONB NOT NULL,
  total_calories NUMERIC(8,2) DEFAULT 0,
  total_protein NUMERIC(8,2) DEFAULT 0,
  total_carbs NUMERIC(8,2) DEFAULT 0,
  total_fat NUMERIC(8,2) DEFAULT 0,
  total_fiber NUMERIC(8,2) DEFAULT 0,
  total_sodium NUMERIC(8,2) DEFAULT 0,
  nutrition_summary JSONB,
  sofia_analysis TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.food_analysis ENABLE ROW LEVEL SECURITY;

-- Política para usuários verem apenas suas análises
CREATE POLICY "Users can view own food analysis" ON public.food_analysis
  FOR SELECT USING (auth.uid() = user_id);

-- Política para usuários criarem suas análises
CREATE POLICY "Users can create own food analysis" ON public.food_analysis
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Política para usuários atualizarem suas análises
CREATE POLICY "Users can update own food analysis" ON public.food_analysis
  FOR UPDATE USING (auth.uid() = user_id);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION public.update_food_analysis_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER update_food_analysis_updated_at
  BEFORE UPDATE ON public.food_analysis
  FOR EACH ROW
  EXECUTE FUNCTION public.update_food_analysis_updated_at();

-- Índices para performance
CREATE INDEX idx_food_analysis_user_date ON public.food_analysis(user_id, analysis_date DESC);
CREATE INDEX idx_food_analysis_created_at ON public.food_analysis(created_at DESC);