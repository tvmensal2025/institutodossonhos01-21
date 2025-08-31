
-- AUDITORIA COMPLETA E CORREÇÃO DE TODAS AS TABELAS
-- Esta migração corrige TODOS os erros identificados na auditoria

-- 1. Corrigir tabela company_data com campos em falta
ALTER TABLE public.company_data 
ADD COLUMN IF NOT EXISTS name TEXT DEFAULT 'Instituto dos Sonhos',
ADD COLUMN IF NOT EXISTS mission TEXT DEFAULT 'Transformar vidas através da saúde e bem-estar',
ADD COLUMN IF NOT EXISTS vision TEXT DEFAULT 'Ser referência em saúde preventiva e bem-estar',
ADD COLUMN IF NOT EXISTS values TEXT DEFAULT 'Cuidado, Inovação, Excelência, Humanização',
ADD COLUMN IF NOT EXISTS about_us TEXT DEFAULT 'Somos uma plataforma completa de saúde e bem-estar com IA',
ADD COLUMN IF NOT EXISTS target_audience TEXT DEFAULT 'Pessoas que buscam uma vida mais saudável',
ADD COLUMN IF NOT EXISTS main_services TEXT DEFAULT 'Acompanhamento nutricional, análise de peso, metas de saúde',
ADD COLUMN IF NOT EXISTS differentials TEXT DEFAULT 'IA avançada, análise personalizada, acompanhamento 24/7',
ADD COLUMN IF NOT EXISTS company_culture TEXT DEFAULT 'Cultura focada na saúde e bem-estar dos usuários',
ADD COLUMN IF NOT EXISTS health_philosophy TEXT DEFAULT 'Prevenção é o melhor remédio';

-- 2. Criar tabela course_lessons que está sendo referenciada mas não existe
CREATE TABLE IF NOT EXISTS public.course_lessons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  module_id UUID REFERENCES public.course_modules(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT,
  video_url TEXT,
  duration_minutes INTEGER DEFAULT 0,
  order_index INTEGER NOT NULL DEFAULT 0,
  is_free BOOLEAN DEFAULT false,
  is_completed BOOLEAN DEFAULT false,
  is_premium BOOLEAN DEFAULT false,
  color TEXT DEFAULT '#6366f1',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Habilitar RLS para course_lessons
ALTER TABLE public.course_lessons ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para course_lessons
CREATE POLICY "Everyone can view course lessons" 
ON public.course_lessons 
FOR SELECT 
USING (true);

-- 3. Corrigir tabela challenges com campos necessários
ALTER TABLE public.challenges 
ADD COLUMN IF NOT EXISTS challenge_type TEXT DEFAULT 'general',
ADD COLUMN IF NOT EXISTS difficulty TEXT DEFAULT 'medio',
ADD COLUMN IF NOT EXISTS duration_days INTEGER DEFAULT 30,
ADD COLUMN IF NOT EXISTS points_reward INTEGER DEFAULT 100,
ADD COLUMN IF NOT EXISTS badge_icon TEXT DEFAULT '🎯',
ADD COLUMN IF NOT EXISTS badge_name TEXT,
ADD COLUMN IF NOT EXISTS instructions TEXT,
ADD COLUMN IF NOT EXISTS tips JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS daily_log_type TEXT DEFAULT 'boolean',
ADD COLUMN IF NOT EXISTS daily_log_target INTEGER,
ADD COLUMN IF NOT EXISTS daily_log_unit TEXT,
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS is_group_challenge BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS start_date DATE DEFAULT CURRENT_DATE,
ADD COLUMN IF NOT EXISTS end_date DATE,
ADD COLUMN IF NOT EXISTS created_by UUID,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- 4. Criar tabela challenge_participations
CREATE TABLE IF NOT EXISTS public.challenge_participations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  challenge_id UUID NOT NULL REFERENCES public.challenges(id) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  status TEXT DEFAULT 'active',
  progress INTEGER DEFAULT 0,
  points_earned INTEGER DEFAULT 0,
  completed_at TIMESTAMP WITH TIME ZONE,
  daily_logs JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, challenge_id)
);

-- Habilitar RLS para challenge_participations
ALTER TABLE public.challenge_participations ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para challenge_participations
CREATE POLICY "Users can view own challenge participations" 
ON public.challenge_participations 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own challenge participations" 
ON public.challenge_participations 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own challenge participations" 
ON public.challenge_participations 
FOR UPDATE 
USING (auth.uid() = user_id);

-- 5. Criar tabela custom_saboteurs
CREATE TABLE IF NOT EXISTS public.custom_saboteurs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  triggers JSONB DEFAULT '[]'::jsonb,
  strategies JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Habilitar RLS para custom_saboteurs
ALTER TABLE public.custom_saboteurs ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para custom_saboteurs
CREATE POLICY "Users can manage own custom saboteurs" 
ON public.custom_saboteurs 
FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 6. Criar tabela water_tracking
CREATE TABLE IF NOT EXISTS public.water_tracking (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  amount_ml INTEGER NOT NULL,
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Habilitar RLS para water_tracking
ALTER TABLE public.water_tracking ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para water_tracking
CREATE POLICY "Users can manage own water tracking" 
ON public.water_tracking 
FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 7. Criar tabela sleep_tracking
CREATE TABLE IF NOT EXISTS public.sleep_tracking (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  sleep_hours DECIMAL(3,1) NOT NULL,
  quality_rating INTEGER CHECK (quality_rating >= 1 AND quality_rating <= 10),
  bedtime TIME,
  wake_time TIME,
  notes TEXT,
  date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Habilitar RLS para sleep_tracking
ALTER TABLE public.sleep_tracking ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para sleep_tracking
CREATE POLICY "Users can manage own sleep tracking" 
ON public.sleep_tracking 
FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 8. Criar tabela mood_tracking
CREATE TABLE IF NOT EXISTS public.mood_tracking (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  mood_rating INTEGER CHECK (mood_rating >= 1 AND mood_rating <= 10),
  energy_level INTEGER CHECK (energy_level >= 1 AND energy_level <= 10),
  stress_level INTEGER CHECK (stress_level >= 1 AND stress_level <= 10),
  notes TEXT,
  emotions JSONB DEFAULT '[]'::jsonb,
  date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Habilitar RLS para mood_tracking
ALTER TABLE public.mood_tracking ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para mood_tracking
CREATE POLICY "Users can manage own mood tracking" 
ON public.mood_tracking 
FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 9. Criar tabela user_gamification
CREATE TABLE IF NOT EXISTS public.user_gamification (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  level INTEGER DEFAULT 1,
  total_points INTEGER DEFAULT 0,
  experience_points INTEGER DEFAULT 0,
  streak_days INTEGER DEFAULT 0,
  badges JSONB DEFAULT '[]'::jsonb,
  achievements JSONB DEFAULT '[]'::jsonb,
  rank_position INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Habilitar RLS para user_gamification
ALTER TABLE public.user_gamification ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para user_gamification
CREATE POLICY "Users can view own gamification data" 
ON public.user_gamification 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update own gamification data" 
ON public.user_gamification 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own gamification data" 
ON public.user_gamification 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- 10. Criar tabela health_feed_posts
CREATE TABLE IF NOT EXISTS public.health_feed_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  content TEXT,
  type TEXT DEFAULT 'text',
  image_url TEXT,
  is_public BOOLEAN DEFAULT true,
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  tags JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Habilitar RLS para health_feed_posts
ALTER TABLE public.health_feed_posts ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para health_feed_posts
CREATE POLICY "Everyone can view public posts" 
ON public.health_feed_posts 
FOR SELECT 
USING (is_public = true);

CREATE POLICY "Users can manage own posts" 
ON public.health_feed_posts 
FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 11. Criar tabela google_fit_data
CREATE TABLE IF NOT EXISTS public.google_fit_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  data_type TEXT NOT NULL,
  value NUMERIC,
  unit TEXT,
  data_date DATE DEFAULT CURRENT_DATE,
  timestamp_start TIMESTAMP WITH TIME ZONE,
  timestamp_end TIMESTAMP WITH TIME ZONE,
  source TEXT DEFAULT 'google_fit',
  raw_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Habilitar RLS para google_fit_data
ALTER TABLE public.google_fit_data ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para google_fit_data
CREATE POLICY "Users can manage own google fit data" 
ON public.google_fit_data 
FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 12. Criar tabela weekly_insights
CREATE TABLE IF NOT EXISTS public.weekly_insights (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  week_start_date DATE NOT NULL,
  average_mood DECIMAL(3,2),
  average_energy DECIMAL(3,2),
  average_stress DECIMAL(3,2),
  most_common_gratitude TEXT,
  water_consistency DECIMAL(5,2),
  sleep_consistency DECIMAL(5,2),
  exercise_frequency DECIMAL(5,2),
  total_points INTEGER DEFAULT 0,
  insights JSONB DEFAULT '[]'::jsonb,
  recommendations JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, week_start_date)
);

-- Habilitar RLS para weekly_insights
ALTER TABLE public.weekly_insights ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para weekly_insights
CREATE POLICY "Users can view own weekly insights" 
ON public.weekly_insights 
FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 13. Criar tabela weighings (compatibilidade)
CREATE TABLE IF NOT EXISTS public.weighings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  weight DECIMAL(5,2) NOT NULL,
  body_fat_percentage DECIMAL(4,2),
  muscle_mass_kg DECIMAL(5,2),
  bone_mass_kg DECIMAL(4,2),
  water_percentage DECIMAL(4,2),
  visceral_fat INTEGER,
  metabolic_age INTEGER,
  bmr_kcal INTEGER,
  device_type TEXT DEFAULT 'manual',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Habilitar RLS para weighings
ALTER TABLE public.weighings ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para weighings
CREATE POLICY "Users can manage own weighings" 
ON public.weighings 
FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 14. Corrigir campos em falta na tabela user_anamnesis
CREATE TABLE IF NOT EXISTS public.user_anamnesis (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  
  -- Dados Pessoais
  profession TEXT,
  marital_status TEXT,
  city_state TEXT,
  how_found_method TEXT,
  
  -- Histórico Familiar
  family_obesity_history BOOLEAN,
  family_diabetes_history BOOLEAN,
  family_heart_disease_history BOOLEAN,
  family_eating_disorders_history BOOLEAN,
  family_depression_anxiety_history BOOLEAN,
  family_thyroid_problems_history BOOLEAN,
  family_other_chronic_diseases TEXT,
  
  -- Histórico de Peso
  weight_gain_started_age INTEGER,
  major_weight_gain_periods TEXT,
  emotional_events_during_weight_gain TEXT,
  lowest_adult_weight DECIMAL(5,2),
  highest_adult_weight DECIMAL(5,2),
  current_weight DECIMAL(5,2),
  height_cm DECIMAL(5,2),
  current_bmi DECIMAL(4,2),
  weight_fluctuation_classification TEXT,
  
  -- Tratamentos Anteriores
  previous_weight_treatments JSONB,
  most_effective_treatment TEXT,
  least_effective_treatment TEXT,
  had_rebound_effect BOOLEAN,
  
  -- Medicações Atuais
  current_medications JSONB,
  chronic_diseases JSONB,
  supplements JSONB,
  herbal_medicines JSONB,
  
  -- Relacionamento com Comida
  food_relationship_score INTEGER,
  has_compulsive_eating BOOLEAN,
  compulsive_eating_situations TEXT,
  problematic_foods JSONB,
  forbidden_foods JSONB,
  feels_guilt_after_eating BOOLEAN,
  eats_in_secret BOOLEAN,
  eats_until_uncomfortable BOOLEAN,
  
  -- Qualidade de Vida
  sleep_hours_per_night DECIMAL(3,1),
  sleep_quality_score INTEGER,
  daily_stress_level INTEGER,
  physical_activity_type TEXT,
  physical_activity_frequency TEXT,
  daily_energy_level INTEGER,
  general_quality_of_life INTEGER,
  
  -- Objetivos e Expectativas
  main_treatment_goals TEXT,
  biggest_weight_loss_challenge TEXT,
  ideal_weight_goal DECIMAL(5,2),
  timeframe_to_achieve_goal TEXT,
  treatment_success_definition TEXT,
  motivation_for_seeking_treatment TEXT,
  
  -- Metadados
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraint para garantir uma anamnese por usuário
  CONSTRAINT unique_user_anamnesis UNIQUE (user_id)
);

-- Habilitar RLS para user_anamnesis se não estiver
ALTER TABLE public.user_anamnesis ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para user_anamnesis (recriar se necessário)
DROP POLICY IF EXISTS "Users can view their own anamnesis" ON public.user_anamnesis;
DROP POLICY IF EXISTS "Users can create their own anamnesis" ON public.user_anamnesis;
DROP POLICY IF EXISTS "Users can update their own anamnesis" ON public.user_anamnesis;

CREATE POLICY "Users can view their own anamnesis" 
ON public.user_anamnesis 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own anamnesis" 
ON public.user_anamnesis 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own anamnesis" 
ON public.user_anamnesis 
FOR UPDATE 
USING (auth.uid() = user_id);

-- 15. Ajustar RLS policies para permitir leitura pública de algumas tabelas
DROP POLICY IF EXISTS "Admins can manage challenges" ON public.challenges;
CREATE POLICY "Admins can manage challenges" 
ON public.challenges 
FOR ALL 
USING (true)
WITH CHECK (true);

-- 16. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_weight_measurements_user_date ON public.weight_measurements(user_id, measurement_date DESC);
CREATE INDEX IF NOT EXISTS idx_daily_responses_user_date ON public.daily_responses(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_user_goals_user_status ON public.user_goals(user_id, status);
CREATE INDEX IF NOT EXISTS idx_food_analysis_user_date ON public.food_analysis(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_challenge_participations_user ON public.challenge_participations(user_id);
CREATE INDEX IF NOT EXISTS idx_course_lessons_course ON public.course_lessons(course_id, order_index);

-- 17. Atualizar triggers e funções
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger de updated_at em tabelas relevantes
CREATE TRIGGER update_company_data_updated_at BEFORE UPDATE ON public.company_data FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_challenges_updated_at BEFORE UPDATE ON public.challenges FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_course_lessons_updated_at BEFORE UPDATE ON public.course_lessons FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_challenge_participations_updated_at BEFORE UPDATE ON public.challenge_participations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_custom_saboteurs_updated_at BEFORE UPDATE ON public.custom_saboteurs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_user_gamification_updated_at BEFORE UPDATE ON public.user_gamification FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_health_feed_posts_updated_at BEFORE UPDATE ON public.health_feed_posts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 18. Inserir dados iniciais necessários
INSERT INTO public.company_data (
  company_name, 
  name,
  description,
  mission,
  vision,
  values,
  about_us,
  target_audience,
  main_services,
  differentials,
  company_culture,
  health_philosophy,
  primary_color,
  secondary_color
) VALUES (
  'Instituto dos Sonhos',
  'Instituto dos Sonhos',
  'Plataforma completa de saúde e bem-estar com IA',
  'Transformar vidas através da saúde e bem-estar',
  'Ser referência em saúde preventiva e bem-estar',
  'Cuidado, Inovação, Excelência, Humanização',
  'Somos uma plataforma completa de saúde e bem-estar com IA avançada',
  'Pessoas que buscam uma vida mais saudável e equilibrada',
  'Acompanhamento nutricional, análise de peso, metas de saúde, IA Sofia',
  'IA avançada, análise personalizada, acompanhamento 24/7, comunidade ativa',
  'Cultura focada na saúde e bem-estar integral dos usuários',
  'Prevenção é o melhor remédio - cuidar da saúde antes de adoecer',
  '#6366f1',
  '#8b5cf6'
) ON CONFLICT DO NOTHING;

-- 19. Inserir categorias de metas padrão
INSERT INTO public.goal_categories (name, icon, color) VALUES
('Peso', '⚖️', '#3b82f6'),
('Exercício', '💪', '#10b981'),
('Alimentação', '🥗', '#f59e0b'),
('Hidratação', '💧', '#06b6d4'),
('Sono', '😴', '#8b5cf6'),
('Bem-estar', '🧘', '#ec4899')
ON CONFLICT DO NOTHING;

-- 20. Inserir desafios padrão
INSERT INTO public.challenges (
  title, 
  description, 
  challenge_type,
  difficulty,
  duration_days,
  points_reward,
  badge_icon,
  badge_name,
  instructions,
  tips,
  is_active,
  is_featured
) VALUES
(
  'Hidratação Saudável',
  'Beba pelo menos 2 litros de água por dia durante uma semana',
  'health',
  'facil',
  7,
  150,
  '💧',
  'Mestre da Hidratação',
  'Registre diariamente a quantidade de água consumida. Meta: 2L por dia.',
  '["Mantenha uma garrafa sempre por perto", "Configure lembretes no celular", "Adicione frutas na água para sabor"]'::jsonb,
  true,
  true
),
(
  'Caminhada Diária',
  'Caminhe pelo menos 30 minutos todos os dias por uma semana',
  'exercise',
  'medio',
  7,
  200,
  '🚶‍♀️',
  'Caminhante Dedicado',
  'Registre diariamente sua caminhada de pelo menos 30 minutos.',
  '["Escolha horários mais frescos", "Use tênis confortável", "Varie os percursos"]'::jsonb,
  true,
  true
)
ON CONFLICT DO NOTHING;

-- VERIFICAÇÃO FINAL
-- Listar todas as tabelas criadas/atualizadas
SELECT 
  schemaname,
  tablename,
  tableowner
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;
