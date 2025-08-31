-- Criar tabela para análise emocional das conversas
CREATE TABLE IF NOT EXISTS public.chat_emotional_analysis (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  conversation_id UUID NOT NULL REFERENCES chat_conversations(id),
  sentiment_score DECIMAL(3,2), -- -1.0 a 1.0 (negativo a positivo)
  emotions_detected TEXT[], -- array de emoções detectadas
  pain_level INTEGER, -- 0-10 se mencionado
  stress_level INTEGER, -- 0-10 se mencionado
  energy_level INTEGER, -- 0-10 se mencionado
  mood_keywords TEXT[], -- palavras-chave do humor
  physical_symptoms TEXT[], -- sintomas físicos mencionados
  emotional_topics TEXT[], -- tópicos emocionais discutidos
  concerns_mentioned TEXT[], -- preocupações mencionadas
  goals_mentioned TEXT[], -- objetivos mencionados
  achievements_mentioned TEXT[], -- conquistas mencionadas
  analysis_metadata JSONB, -- dados extras da análise
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  week_start DATE NOT NULL DEFAULT date_trunc('week', CURRENT_DATE)::DATE
);

-- Enable RLS
ALTER TABLE public.chat_emotional_analysis ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Users can view their own emotional analysis"
ON public.chat_emotional_analysis
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "System can insert emotional analysis"
ON public.chat_emotional_analysis
FOR INSERT
WITH CHECK (true);

-- Índices para performance
CREATE INDEX idx_chat_emotional_analysis_user_week ON public.chat_emotional_analysis(user_id, week_start);
CREATE INDEX idx_chat_emotional_analysis_created ON public.chat_emotional_analysis(created_at);

-- Criar tabela para insights semanais do chat
CREATE TABLE IF NOT EXISTS public.weekly_chat_insights (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  week_start_date DATE NOT NULL,
  total_conversations INTEGER DEFAULT 0,
  average_sentiment DECIMAL(3,2), -- média do sentiment score
  dominant_emotions TEXT[], -- emoções mais frequentes
  average_pain_level DECIMAL(3,2), -- média das dores mencionadas
  average_stress_level DECIMAL(3,2), -- média do stress
  average_energy_level DECIMAL(3,2), -- média da energia
  most_discussed_topics TEXT[], -- tópicos mais discutidos
  main_concerns TEXT[], -- principais preocupações
  progress_noted TEXT[], -- progressos observados
  recommendations TEXT[], -- recomendações geradas
  emotional_summary TEXT, -- resumo emocional da semana
  ai_analysis JSONB, -- análise completa da IA
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.weekly_chat_insights ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Users can view their own weekly insights"
ON public.weekly_chat_insights
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "System can manage weekly insights"
ON public.weekly_chat_insights
FOR ALL
USING (true);

-- Índices
CREATE UNIQUE INDEX idx_weekly_chat_insights_user_week ON public.weekly_chat_insights(user_id, week_start_date);

-- Trigger para atualizar timestamp
CREATE TRIGGER update_weekly_chat_insights_updated_at
  BEFORE UPDATE ON public.weekly_chat_insights
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();