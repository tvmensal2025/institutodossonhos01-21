-- Adicionar colunas que estão faltando na tabela user_goals
ALTER TABLE public.user_goals 
ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES public.goal_categories(id),
ADD COLUMN IF NOT EXISTS title TEXT,
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS target_value NUMERIC,
ADD COLUMN IF NOT EXISTS current_value NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS unit TEXT,
ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'medium',
ADD COLUMN IF NOT EXISTS deadline DATE,
ADD COLUMN IF NOT EXISTS is_completed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Criar trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_user_goals_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_user_goals_updated_at
  BEFORE UPDATE ON public.user_goals
  FOR EACH ROW
  EXECUTE FUNCTION update_user_goals_updated_at();

-- Inserir categorias padrão (verificando se já existem)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.goal_categories WHERE name = 'Peso') THEN
    INSERT INTO public.goal_categories (name, description, color, icon, is_active) 
    VALUES ('Peso', 'Metas relacionadas ao controle de peso', '#FF6B6B', 'Scale', true);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM public.goal_categories WHERE name = 'Exercício') THEN
    INSERT INTO public.goal_categories (name, description, color, icon, is_active) 
    VALUES ('Exercício', 'Metas de atividade física e exercícios', '#4ECDC4', 'Dumbbell', true);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM public.goal_categories WHERE name = 'Nutrição') THEN
    INSERT INTO public.goal_categories (name, description, color, icon, is_active) 
    VALUES ('Nutrição', 'Metas alimentares e nutricionais', '#45B7D1', 'Apple', true);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM public.goal_categories WHERE name = 'Sono') THEN
    INSERT INTO public.goal_categories (name, description, color, icon, is_active) 
    VALUES ('Sono', 'Metas relacionadas ao sono e descanso', '#96CEB4', 'Moon', true);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM public.goal_categories WHERE name = 'Bem-estar') THEN
    INSERT INTO public.goal_categories (name, description, color, icon, is_active) 
    VALUES ('Bem-estar', 'Metas gerais de saúde e bem-estar', '#FECA57', 'Heart', true);
  END IF;
END $$;