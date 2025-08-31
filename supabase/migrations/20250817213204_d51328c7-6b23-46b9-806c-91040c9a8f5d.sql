-- Migração completa para criar todas as tabelas faltantes do sistema
-- Execute este script no Supabase SQL Editor

-- 1. Profiles (caso não exista)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  full_name VARCHAR(255),
  email VARCHAR(255),
  role VARCHAR(50) DEFAULT 'user',
  points INTEGER DEFAULT 0,
  avatar_url TEXT,
  phone VARCHAR(20),
  birth_date DATE,
  city VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. User Anamnesis
CREATE TABLE IF NOT EXISTS public.user_anamnesis (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  profession TEXT,
  marital_status TEXT,
  city_state TEXT,
  how_found_method TEXT,
  family_obesity_history BOOLEAN,
  family_diabetes_history BOOLEAN,
  family_heart_disease_history BOOLEAN,
  family_eating_disorders_history BOOLEAN,
  family_depression_anxiety_history BOOLEAN,
  family_thyroid_problems_history BOOLEAN,
  family_other_chronic_diseases TEXT,
  weight_gain_started_age INTEGER,
  major_weight_gain_periods TEXT,
  emotional_events_during_weight_gain TEXT,
  lowest_adult_weight DECIMAL(5,2),
  highest_adult_weight DECIMAL(5,2),
  current_weight DECIMAL(5,2),
  height_cm DECIMAL(5,2),
  current_bmi DECIMAL(4,2),
  weight_fluctuation_classification TEXT,
  previous_weight_treatments JSONB DEFAULT '[]',
  most_effective_treatment TEXT,
  least_effective_treatment TEXT,
  had_rebound_effect BOOLEAN,
  current_medications JSONB DEFAULT '[]',
  chronic_diseases JSONB DEFAULT '[]',
  supplements JSONB DEFAULT '[]',
  herbal_medicines JSONB DEFAULT '[]',
  food_relationship_score INTEGER,
  has_compulsive_eating BOOLEAN,
  compulsive_eating_situations TEXT,
  problematic_foods JSONB DEFAULT '[]',
  forbidden_foods JSONB DEFAULT '[]',
  feels_guilt_after_eating BOOLEAN,
  eats_in_secret BOOLEAN,
  eats_until_uncomfortable BOOLEAN,
  sleep_hours_per_night DECIMAL(3,1),
  sleep_quality_score INTEGER,
  daily_stress_level INTEGER,
  physical_activity_type TEXT,
  physical_activity_frequency TEXT,
  daily_energy_level INTEGER,
  general_quality_of_life INTEGER,
  main_treatment_goals TEXT,
  biggest_weight_loss_challenge TEXT,
  ideal_weight_goal DECIMAL(5,2),
  timeframe_to_achieve_goal TEXT,
  treatment_success_definition TEXT,
  motivation_for_seeking_treatment TEXT,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT unique_user_anamnesis UNIQUE (user_id)
);

-- 3. User Goals
CREATE TABLE IF NOT EXISTS public.user_goals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT,
    challenge_id UUID,
    target_value NUMERIC,
    unit TEXT,
    difficulty TEXT DEFAULT 'medio',
    target_date DATE,
    is_group_goal BOOLEAN DEFAULT false,
    evidence_required BOOLEAN DEFAULT true,
    estimated_points INTEGER DEFAULT 0,
    status TEXT DEFAULT 'pendente',
    current_value NUMERIC DEFAULT 0,
    final_points INTEGER,
    admin_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. User Goal Invitations
CREATE TABLE IF NOT EXISTS public.user_goal_invitations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  goal_id UUID REFERENCES public.user_goals(id) ON DELETE CASCADE,
  inviter_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  invitee_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  invitee_email TEXT,
  invitee_name TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. User Goal Participants
CREATE TABLE IF NOT EXISTS public.user_goal_participants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  goal_id UUID REFERENCES public.user_goals(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  can_view_progress BOOLEAN DEFAULT true,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Weight Measurements
CREATE TABLE IF NOT EXISTS public.weight_measurements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  peso_kg NUMERIC NOT NULL,
  circunferencia_abdominal_cm NUMERIC,
  agua_corporal_percent NUMERIC,
  massa_ossea_kg NUMERIC,
  massa_muscular_kg NUMERIC,
  gordura_corporal_percent NUMERIC,
  gordura_visceral_level INTEGER,
  taxa_metabolica_basal INTEGER,
  idade_metabolica INTEGER,
  imc NUMERIC,
  risco_cardiometabolico TEXT,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. User Physical Data
CREATE TABLE IF NOT EXISTS public.user_physical_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  altura_cm DECIMAL(5,2),
  peso_kg DECIMAL(5,2),
  idade INTEGER,
  sexo VARCHAR(10),
  nivel_atividade VARCHAR(20) DEFAULT 'sedentario',
  objetivo VARCHAR(50),
  restricoes_alimentares TEXT[],
  alergias TEXT[],
  condicoes_medicas TEXT[],
  medicamentos_atuais TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- 8. User Roles
CREATE TYPE IF NOT EXISTS app_role AS ENUM ('admin', 'moderator', 'user');

CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE (user_id, role)
);

-- 9. User Sessions
CREATE TABLE IF NOT EXISTS public.user_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_type TEXT NOT NULL,
  start_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  end_time TIMESTAMP WITH TIME ZONE,
  duration_minutes INTEGER,
  data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. Alimentos
CREATE TABLE IF NOT EXISTS public.alimentos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  categoria TEXT,
  subcategoria TEXT,
  calorias_por_100g NUMERIC,
  proteinas_g NUMERIC,
  carboidratos_g NUMERIC,
  gorduras_g NUMERIC,
  fibras_g NUMERIC,
  acucares_g NUMERIC,
  sodio_mg NUMERIC,
  potassio_mg NUMERIC,
  calcio_mg NUMERIC,
  ferro_mg NUMERIC,
  magnesio_mg NUMERIC,
  fosforo_mg NUMERIC,
  zinco_mg NUMERIC,
  vitamina_a_mcg NUMERIC,
  vitamina_c_mg NUMERIC,
  vitamina_d_mcg NUMERIC,
  vitamina_e_mg NUMERIC,
  vitamina_k_mcg NUMERIC,
  tiamina_mg NUMERIC,
  riboflavina_mg NUMERIC,
  niacina_mg NUMERIC,
  vitamina_b6_mg NUMERIC,
  folato_mcg NUMERIC,
  vitamina_b12_mcg NUMERIC,
  colesterol_mg NUMERIC,
  acidos_graxos_saturados_g NUMERIC,
  acidos_graxos_monoinsaturados_g NUMERIC,
  acidos_graxos_poliinsaturados_g NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 11. Receitas
CREATE TABLE IF NOT EXISTS public.receitas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  descricao TEXT,
  categoria TEXT,
  dificuldade TEXT DEFAULT 'facil',
  tempo_preparo_minutos INTEGER,
  rendimento_porcoes INTEGER,
  calorias_por_porcao NUMERIC,
  modo_preparo TEXT,
  observacoes TEXT,
  tags TEXT[],
  created_by UUID REFERENCES auth.users(id),
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 12. Recipe Items (ingredientes das receitas)
CREATE TABLE IF NOT EXISTS public.recipe_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  receita_id UUID REFERENCES public.receitas(id) ON DELETE CASCADE,
  alimento_id UUID REFERENCES public.alimentos(id),
  quantidade NUMERIC NOT NULL,
  unidade TEXT NOT NULL,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 13. Weighings (pesagens)
CREATE TABLE IF NOT EXISTS public.weighings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  peso_kg NUMERIC NOT NULL,
  data_pesagem DATE DEFAULT CURRENT_DATE,
  imc NUMERIC,
  massa_muscular_kg NUMERIC,
  gordura_corporal_percent NUMERIC,
  agua_corporal_percent NUMERIC,
  massa_ossea_kg NUMERIC,
  metabolic_age INTEGER,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 14. User Assessments
CREATE TABLE IF NOT EXISTS public.user_assessments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  assessment_type TEXT NOT NULL,
  assessment_data JSONB NOT NULL,
  score NUMERIC,
  recommendations TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 15. Conversations
CREATE TABLE IF NOT EXISTS public.conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT,
  context_type TEXT DEFAULT 'general',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 16. Conversation Messages
CREATE TABLE IF NOT EXISTS public.conversation_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL, -- 'user' ou 'assistant'
  content TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 17. User Progress
CREATE TABLE IF NOT EXISTS public.user_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  metric_type TEXT NOT NULL,
  metric_value NUMERIC NOT NULL,
  target_value NUMERIC,
  unit TEXT,
  date_recorded DATE DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 18. User Achievements
CREATE TABLE IF NOT EXISTS public.user_achievements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_type TEXT NOT NULL,
  achievement_name TEXT NOT NULL,
  description TEXT,
  points_earned INTEGER DEFAULT 0,
  badge_icon TEXT,
  unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 19. Receita Componentes (componentes das receitas)
CREATE TABLE IF NOT EXISTS public.receita_componentes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  receita_id UUID REFERENCES public.receitas(id) ON DELETE CASCADE,
  nome_ingrediente TEXT NOT NULL,
  quantidade NUMERIC NOT NULL,
  unidade TEXT NOT NULL,
  categoria TEXT,
  observacoes TEXT,
  ordem INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_anamnesis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_goal_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_goal_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weight_measurements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_physical_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alimentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.receitas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipe_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weighings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.receita_componentes ENABLE ROW LEVEL SECURITY;

-- Criar função helper para verificar roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Políticas RLS para Profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Políticas RLS para User Anamnesis
CREATE POLICY "Users can view their own anamnesis" ON public.user_anamnesis
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own anamnesis" ON public.user_anamnesis
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own anamnesis" ON public.user_anamnesis
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Políticas RLS para User Goals
CREATE POLICY "Users can view their own goals" ON public.user_goals
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own goals" ON public.user_goals
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own goals" ON public.user_goals
  FOR UPDATE USING (auth.uid() = user_id);

-- Políticas RLS para Weight Measurements
CREATE POLICY "Users can manage their weight measurements" ON public.weight_measurements
  FOR ALL USING (auth.uid() = user_id);

-- Políticas RLS para User Physical Data
CREATE POLICY "Users can manage their physical data" ON public.user_physical_data
  FOR ALL USING (auth.uid() = user_id);

-- Políticas RLS para User Sessions
CREATE POLICY "Users can manage their sessions" ON public.user_sessions
  FOR ALL USING (auth.uid() = user_id);

-- Políticas RLS para Alimentos (leitura pública)
CREATE POLICY "Alimentos are viewable by everyone" ON public.alimentos
  FOR SELECT USING (true);

-- Políticas RLS para Receitas
CREATE POLICY "Users can view public recipes" ON public.receitas
  FOR SELECT USING (is_public = true OR auth.uid() = created_by);
CREATE POLICY "Users can manage their own recipes" ON public.receitas
  FOR ALL USING (auth.uid() = created_by);

-- Políticas RLS para Recipe Items
CREATE POLICY "Users can view recipe items" ON public.recipe_items
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM public.receitas r 
    WHERE r.id = recipe_items.receita_id 
    AND (r.is_public = true OR r.created_by = auth.uid())
  ));

-- Políticas RLS para Weighings
CREATE POLICY "Users can manage their weighings" ON public.weighings
  FOR ALL USING (auth.uid() = user_id);

-- Políticas RLS para User Assessments
CREATE POLICY "Users can manage their assessments" ON public.user_assessments
  FOR ALL USING (auth.uid() = user_id);

-- Políticas RLS para Conversations
CREATE POLICY "Users can manage their conversations" ON public.conversations
  FOR ALL USING (auth.uid() = user_id);

-- Políticas RLS para Conversation Messages
CREATE POLICY "Users can manage their conversation messages" ON public.conversation_messages
  FOR ALL USING (EXISTS (
    SELECT 1 FROM public.conversations c 
    WHERE c.id = conversation_messages.conversation_id 
    AND c.user_id = auth.uid()
  ));

-- Políticas RLS para User Progress
CREATE POLICY "Users can manage their progress" ON public.user_progress
  FOR ALL USING (auth.uid() = user_id);

-- Políticas RLS para User Achievements
CREATE POLICY "Users can view their achievements" ON public.user_achievements
  FOR SELECT USING (auth.uid() = user_id);

-- Políticas RLS para Receita Componentes
CREATE POLICY "Users can view recipe components" ON public.receita_componentes
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM public.receitas r 
    WHERE r.id = receita_componentes.receita_id 
    AND (r.is_public = true OR r.created_by = auth.uid())
  ));

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para updated_at
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_anamnesis_updated_at
    BEFORE UPDATE ON public.user_anamnesis
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_goals_updated_at
    BEFORE UPDATE ON public.user_goals
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_receitas_updated_at
    BEFORE UPDATE ON public.receitas
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_conversations_updated_at
    BEFORE UPDATE ON public.conversations
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Função para calcular IMC automaticamente
CREATE OR REPLACE FUNCTION public.calculate_bmi_trigger()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.current_weight IS NOT NULL AND NEW.height_cm IS NOT NULL THEN
    NEW.current_bmi := NEW.current_weight / POWER(NEW.height_cm / 100, 2);
  END IF;
  RETURN NEW;
END;
$$;

-- Trigger para calcular IMC automaticamente na anamnese
CREATE TRIGGER calculate_bmi_on_anamnesis
BEFORE INSERT OR UPDATE ON public.user_anamnesis
FOR EACH ROW
EXECUTE FUNCTION public.calculate_bmi_trigger();

-- Notificar reload do schema
NOTIFY pgrst, 'reload schema';

SELECT 'Todas as tabelas foram criadas com sucesso!' as status;