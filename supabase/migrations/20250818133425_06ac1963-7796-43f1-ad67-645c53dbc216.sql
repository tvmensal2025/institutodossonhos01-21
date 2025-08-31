-- Verificar e corrigir tabela food_analysis (erro encontrado nos logs)
DO $$ 
BEGIN
  -- Verificar se a tabela food_analysis existe
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'food_analysis' AND table_schema = 'public') THEN
    -- Criar tabela food_analysis se não existir
    CREATE TABLE food_analysis (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      user_id UUID NOT NULL,
      image_url TEXT,
      analysis_text TEXT NOT NULL,
      nutritional_data JSONB,
      confidence_score NUMERIC(3,2),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    
    -- Habilitar RLS
    ALTER TABLE food_analysis ENABLE ROW LEVEL SECURITY;
    
    -- Política para usuários gerenciarem suas próprias análises
    CREATE POLICY "Users can manage their food analysis" ON food_analysis
    FOR ALL TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
    
  ELSE
    -- Adicionar coluna analysis_text se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'food_analysis' AND column_name = 'analysis_text' AND table_schema = 'public') THEN
      ALTER TABLE food_analysis ADD COLUMN analysis_text TEXT NOT NULL DEFAULT '';
    END IF;
  END IF;
END $$;

-- Verificar e criar tabelas essenciais para missões diárias
CREATE TABLE IF NOT EXISTS daily_mission_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  mission_id UUID NOT NULL,
  progress NUMERIC DEFAULT 0,
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP WITH TIME ZONE,
  date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, mission_id, date)
);

-- RLS para daily_mission_progress
ALTER TABLE daily_mission_progress ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage their mission progress" ON daily_mission_progress;
CREATE POLICY "Users can manage their mission progress" ON daily_mission_progress
FOR ALL TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Verificar tabela para interações com Dr. Vital
CREATE TABLE IF NOT EXISTS dr_vital_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  session_type TEXT NOT NULL,
  context JSONB,
  analysis_result JSONB,
  recommendations JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS para dr_vital_sessions
ALTER TABLE dr_vital_sessions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage their dr vital sessions" ON dr_vital_sessions;
CREATE POLICY "Users can manage their dr vital sessions" ON dr_vital_sessions
FOR ALL TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Verificar tabela para conversas da Sofia
CREATE TABLE IF NOT EXISTS sofia_conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  conversation_title TEXT,
  messages JSONB NOT NULL DEFAULT '[]'::jsonb,
  context_data JSONB,
  last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS para sofia_conversations
ALTER TABLE sofia_conversations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage their Sofia conversations" ON sofia_conversations;
CREATE POLICY "Users can manage their Sofia conversations" ON sofia_conversations
FOR ALL TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Verificar e corrigir coluna user_id em meal_plan_history (garantir que não seja nullable)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'meal_plan_history' 
    AND column_name = 'user_id' 
    AND is_nullable = 'YES'
    AND table_schema = 'public'
  ) THEN
    ALTER TABLE meal_plan_history ALTER COLUMN user_id SET NOT NULL;
  END IF;
END $$;

-- Verificar tabela para notificações
CREATE TABLE IF NOT EXISTS user_notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info',
  read BOOLEAN DEFAULT FALSE,
  action_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS para user_notifications
ALTER TABLE user_notifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage their notifications" ON user_notifications;
CREATE POLICY "Users can manage their notifications" ON user_notifications
FOR ALL TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Trigger para updated_at em todas as tabelas necessárias
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar triggers onde necessário
DROP TRIGGER IF EXISTS update_food_analysis_updated_at ON food_analysis;
CREATE TRIGGER update_food_analysis_updated_at
    BEFORE UPDATE ON food_analysis
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_sofia_conversations_updated_at ON sofia_conversations;
CREATE TRIGGER update_sofia_conversations_updated_at
    BEFORE UPDATE ON sofia_conversations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();