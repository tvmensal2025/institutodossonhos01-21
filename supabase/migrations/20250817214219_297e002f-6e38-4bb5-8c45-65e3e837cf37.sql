-- Criar todas as tabelas faltantes da lista completa
-- Execute este script no Supabase SQL Editor

-- 1. Views e tabelas de backup/histórico
CREATE TABLE IF NOT EXISTS public.v_daily_macro_intake (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE DEFAULT CURRENT_DATE,
  total_calories NUMERIC,
  total_protein_g NUMERIC,
  total_carbs_g NUMERIC,
  total_fat_g NUMERIC,
  total_fiber_g NUMERIC,
  meal_count INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public._backup_profiles_unify (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  backup_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID,
  full_name TEXT,
  email TEXT,
  role TEXT,
  points INTEGER,
  avatar_url TEXT,
  phone TEXT,
  birth_date DATE,
  city TEXT,
  original_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Configurações e documentos AI
CREATE TABLE IF NOT EXISTS public.ai_fallback_configs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  service_name TEXT NOT NULL,
  fallback_config JSONB DEFAULT '{}',
  priority_order INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.ai_documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL,
  content TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.ai_system_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  system_name TEXT NOT NULL,
  log_level TEXT DEFAULT 'INFO',
  message TEXT,
  error_details JSONB,
  performance_metrics JSONB,
  user_id UUID,
  session_id TEXT,
  request_id TEXT,
  stack_trace TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Tabelas de alimentos expandidas
CREATE TABLE IF NOT EXISTS public.alimentos_alias (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  alimento_id UUID,
  alias_name TEXT NOT NULL,
  confidence_score DECIMAL(3,2) DEFAULT 1.0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.alimentos_completos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  categoria TEXT,
  subcategoria TEXT,
  marca TEXT,
  codigo_barras TEXT,
  informacao_nutricional JSONB,
  origem TEXT,
  certificacoes TEXT[],
  preco_medio DECIMAL(10,2),
  disponibilidade TEXT,
  sazonalidade TEXT,
  metodos_preparo TEXT[],
  tempo_preparo_minutos INTEGER,
  dificuldade_preparo TEXT,
  ingredientes_principais TEXT[],
  allergens TEXT[],
  preferencias_dieteticas TEXT[],
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.alimentos_densidades (
  alimento_id UUID,
  densidade_nutricional DECIMAL(10,4)
);

CREATE TABLE IF NOT EXISTS public.alimentos_epf (
  alimento_id UUID,
  epf_score DECIMAL(10,4)
);

CREATE TABLE IF NOT EXISTS public.alimentos_yield (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  alimento_id UUID,
  yield_factor DECIMAL(5,3),
  preparation_method TEXT,
  waste_percentage DECIMAL(5,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Sistema de avaliações
CREATE TABLE IF NOT EXISTS public.assessments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  questions JSONB DEFAULT '[]',
  scoring_method TEXT,
  max_score INTEGER,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Backup e políticas
CREATE TABLE IF NOT EXISTS public.backup_rls_policies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  table_name TEXT NOT NULL,
  policy_name TEXT NOT NULL,
  policy_definition TEXT,
  backup_date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Benefícios e objetivos
CREATE TABLE IF NOT EXISTS public.beneficios_objetivo (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  categoria TEXT,
  descricao TEXT,
  beneficios TEXT[],
  contraindicacoes TEXT[],
  recomendacoes TEXT[],
  evidencia_cientifica TEXT,
  nivel_evidencia TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Combinações terapêuticas
CREATE TABLE IF NOT EXISTS public.combinacoes_terapeuticas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  componentes JSONB DEFAULT '[]',
  indicacoes TEXT[],
  contraindicacoes TEXT[],
  dosagem_recomendada TEXT,
  modo_uso TEXT,
  tempo_tratamento TEXT,
  observacoes TEXT,
  evidencia_cientifica TEXT,
  nivel_recomendacao TEXT,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.combinacoes_ideais (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  alimento_principal UUID,
  alimento_complementar UUID,
  tipo_combinacao TEXT,
  beneficio TEXT,
  explicacao_cientifica TEXT,
  potencializacao_percentual DECIMAL(5,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Dados da empresa
CREATE TABLE IF NOT EXISTS public.company_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_name TEXT,
  company_logo TEXT,
  settings JSONB DEFAULT '{}',
  subscription_info JSONB,
  contact_info JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. Acesso a conteúdo
CREATE TABLE IF NOT EXISTS public.content_access (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content_type TEXT NOT NULL,
  content_id UUID,
  access_level TEXT DEFAULT 'read',
  expires_at TIMESTAMP WITH TIME ZONE,
  granted_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. Contexto cultural
CREATE TABLE IF NOT EXISTS public.contexto_cultural (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  regiao TEXT NOT NULL,
  pais TEXT,
  tradicoes_alimentares TEXT[],
  alimentos_tipicos TEXT[],
  restricoes_culturais TEXT[],
  celebracoes_comida JSONB,
  influencias_externas TEXT[],
  tendencias_atuais TEXT[],
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 11. Contraindicações
CREATE TABLE IF NOT EXISTS public.contraindicacoes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  item_id UUID,
  item_type TEXT, -- 'alimento', 'suplemento', 'medicamento', etc
  condicao_medica TEXT,
  nivel_restricao TEXT, -- 'absoluta', 'relativa', 'cuidado'
  descricao TEXT,
  justificativa_cientifica TEXT,
  alternativas_sugeridas TEXT[],
  observacoes TEXT,
  fonte_informacao TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 12. Anexos de conversas
CREATE TABLE IF NOT EXISTS public.conversation_attachments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID,
  message_id UUID,
  file_name TEXT,
  file_url TEXT,
  file_type TEXT,
  file_size INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 13. Fatos de conversas
CREATE TABLE IF NOT EXISTS public.conversation_facts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  fact_type TEXT,
  fact_content TEXT,
  confidence_score DECIMAL(3,2),
  source_message_id UUID,
  is_verified BOOLEAN DEFAULT false,
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 14. Sabotadores customizados
CREATE TABLE IF NOT EXISTS public.custom_saboteurs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  saboteur_name TEXT NOT NULL,
  description TEXT,
  triggers TEXT[],
  patterns TEXT[],
  coping_strategies TEXT[],
  intensity_level INTEGER CHECK (intensity_level >= 1 AND intensity_level <= 10),
  frequency TEXT,
  impact_areas TEXT[],
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 15. Tracking avançado diário
CREATE TABLE IF NOT EXISTS public.daily_advanced_tracking (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE DEFAULT CURRENT_DATE,
  
  -- Métricas nutricionais
  total_calories NUMERIC,
  total_protein_g NUMERIC,
  total_carbs_g NUMERIC,
  total_fat_g NUMERIC,
  total_fiber_g NUMERIC,
  total_sugar_g NUMERIC,
  total_sodium_mg NUMERIC,
  
  -- Métricas de hidratação
  water_intake_ml INTEGER,
  hydration_goal_met BOOLEAN,
  
  -- Métricas de exercício
  exercise_duration_minutes INTEGER,
  calories_burned INTEGER,
  steps_count INTEGER,
  active_minutes INTEGER,
  
  -- Métricas de bem-estar
  mood_score INTEGER,
  energy_level INTEGER,
  stress_level INTEGER,
  sleep_hours DECIMAL(3,1),
  sleep_quality INTEGER,
  
  -- Métricas de peso e composição corporal
  weight_kg DECIMAL(5,2),
  body_fat_percentage DECIMAL(4,2),
  muscle_mass_kg DECIMAL(5,2),
  
  -- Sinais vitais
  resting_heart_rate INTEGER,
  blood_pressure_systolic INTEGER,
  blood_pressure_diastolic INTEGER,
  
  -- Métricas comportamentais
  meal_timing_score INTEGER,
  portion_control_score INTEGER,
  mindful_eating_score INTEGER,
  
  -- Notas e observações
  daily_notes TEXT,
  medication_taken BOOLEAN,
  supplements_taken TEXT[],
  
  -- Metas e conquistas
  daily_goals_met INTEGER,
  streaks_maintained TEXT[],
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 16. Log de sincronização de dispositivos
CREATE TABLE IF NOT EXISTS public.device_sync_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  device_type TEXT NOT NULL,
  device_id TEXT,
  sync_status TEXT DEFAULT 'pending',
  data_synced JSONB,
  error_message TEXT,
  sync_started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  sync_completed_at TIMESTAMP WITH TIME ZONE,
  records_synced INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 17. Exercício e nutrição
CREATE TABLE IF NOT EXISTS public.exercicio_nutricao (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  exercicio_tipo TEXT NOT NULL,
  intensidade TEXT,
  duracao_minutos INTEGER,
  alimentos_pre_treino TEXT[],
  alimentos_pos_treino TEXT[],
  hidratacao_recomendada_ml INTEGER,
  suplementos_recomendados TEXT[],
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 18. Padrões alimentares
CREATE TABLE IF NOT EXISTS public.food_patterns (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  pattern_type TEXT NOT NULL,
  pattern_data JSONB DEFAULT '{}',
  frequency_score DECIMAL(5,2),
  trend TEXT,
  insights TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Continuar na próxima parte...
-- Notificar reload do schema
NOTIFY pgrst, 'reload schema';

SELECT 'Primeira parte das tabelas faltantes criada!' as status;