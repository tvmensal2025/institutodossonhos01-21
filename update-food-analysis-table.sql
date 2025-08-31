-- Adicionar colunas necessárias para a análise de imagem
ALTER TABLE public.food_analysis ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE public.food_analysis ADD COLUMN IF NOT EXISTS analysis_text TEXT;
ALTER TABLE public.food_analysis ADD COLUMN IF NOT EXISTS user_context JSONB;

-- Atualizar comentários
COMMENT ON COLUMN public.food_analysis.image_url IS 'URL da imagem analisada';
COMMENT ON COLUMN public.food_analysis.analysis_text IS 'Texto da análise gerada pela Sofia';
COMMENT ON COLUMN public.food_analysis.user_context IS 'Contexto do usuário no momento da análise';

-- Alterar constraint de meal_type para aceitar qualquer valor
ALTER TABLE public.food_analysis DROP CONSTRAINT IF EXISTS food_analysis_meal_type_check;

-- Tornar algumas colunas opcionais para compatibilidade
ALTER TABLE public.food_analysis ALTER COLUMN food_items DROP NOT NULL;
ALTER TABLE public.food_analysis ALTER COLUMN nutrition_analysis DROP NOT NULL;
ALTER TABLE public.food_analysis ALTER COLUMN sofia_analysis DROP NOT NULL;
ALTER TABLE public.food_analysis ALTER COLUMN meal_type DROP NOT NULL;