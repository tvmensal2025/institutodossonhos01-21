-- Criar/atualizar tabelas da Sofia se não existirem

-- Tabela para conversas da Sofia
CREATE TABLE IF NOT EXISTS public.sofia_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    user_message TEXT NOT NULL,
    sofia_response TEXT NOT NULL,
    context_data JSONB DEFAULT '{}',
    conversation_type TEXT DEFAULT 'chat',
    related_analysis_id UUID NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela para análises de alimentos da Sofia
CREATE TABLE IF NOT EXISTS public.sofia_food_analysis (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    image_url TEXT NOT NULL,
    analysis_result JSONB NOT NULL DEFAULT '{}',
    detected_foods TEXT[] DEFAULT '{}',
    estimated_calories INTEGER DEFAULT 0,
    meal_type TEXT DEFAULT 'refeicao',
    nutritional_score INTEGER DEFAULT 7,
    user_confirmed BOOLEAN DEFAULT FALSE,
    user_profile JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE public.sofia_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sofia_food_analysis ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para sofia_conversations
DROP POLICY IF EXISTS "Users can view own sofia conversations" ON public.sofia_conversations;
CREATE POLICY "Users can view own sofia conversations" 
ON public.sofia_conversations FOR SELECT 
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own sofia conversations" ON public.sofia_conversations;
CREATE POLICY "Users can insert own sofia conversations" 
ON public.sofia_conversations FOR INSERT 
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own sofia conversations" ON public.sofia_conversations;
CREATE POLICY "Users can update own sofia conversations" 
ON public.sofia_conversations FOR UPDATE 
USING (auth.uid() = user_id);

-- Políticas RLS para sofia_food_analysis
DROP POLICY IF EXISTS "Users can view own sofia food analysis" ON public.sofia_food_analysis;
CREATE POLICY "Users can view own sofia food analysis" 
ON public.sofia_food_analysis FOR SELECT 
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own sofia food analysis" ON public.sofia_food_analysis;
CREATE POLICY "Users can insert own sofia food analysis" 
ON public.sofia_food_analysis FOR INSERT 
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own sofia food analysis" ON public.sofia_food_analysis;
CREATE POLICY "Users can update own sofia food analysis" 
ON public.sofia_food_analysis FOR UPDATE 
USING (auth.uid() = user_id);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_sofia_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para as tabelas
DROP TRIGGER IF EXISTS update_sofia_conversations_updated_at ON public.sofia_conversations;
CREATE TRIGGER update_sofia_conversations_updated_at
  BEFORE UPDATE ON public.sofia_conversations
  FOR EACH ROW
  EXECUTE FUNCTION update_sofia_updated_at();

DROP TRIGGER IF EXISTS update_sofia_food_analysis_updated_at ON public.sofia_food_analysis;
CREATE TRIGGER update_sofia_food_analysis_updated_at
  BEFORE UPDATE ON public.sofia_food_analysis
  FOR EACH ROW
  EXECUTE FUNCTION update_sofia_updated_at();