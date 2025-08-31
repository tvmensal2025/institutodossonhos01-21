-- Criar tabelas faltantes para base de conhecimento Sofia

-- 1. Tabela idade_alimentos
CREATE TABLE IF NOT EXISTS public.idade_alimentos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  faixa_etaria TEXT NOT NULL,
  descricao_faixa TEXT,
  necessidades_nutricionais TEXT,
  alimentos_essenciais TEXT[],
  alimentos_evitar TEXT[],
  suplementos_recomendados TEXT[],
  consideracoes_especiais TEXT,
  evidencia_cientifica TEXT,
  nivel_evidencia TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Tabela genero_alimentos
CREATE TABLE IF NOT EXISTS public.genero_alimentos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  genero TEXT NOT NULL,
  necessidades_especificas TEXT,
  alimentos_beneficos TEXT[],
  alimentos_evitar TEXT[],
  suplementos_recomendados TEXT[],
  consideracoes_hormonais TEXT,
  evidencia_cientifica TEXT,
  nivel_evidencia TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Tabela estados_emocionais_alimentos
CREATE TABLE IF NOT EXISTS public.estados_emocionais_alimentos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  estado_emocional TEXT NOT NULL,
  descricao_estado TEXT,
  alimentos_beneficos TEXT[],
  alimentos_evitar TEXT[],
  mecanismo_acao TEXT,
  evidencia_cientifica TEXT,
  nivel_evidencia TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Tabela objetivos_fitness_alimentos
CREATE TABLE IF NOT EXISTS public.objetivos_fitness_alimentos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  objetivo_fitness TEXT NOT NULL,
  descricao_objetivo TEXT,
  alimentos_recomendados TEXT[],
  alimentos_evitar TEXT[],
  suplementos_sugeridos TEXT[],
  protocolo_nutricional TEXT,
  consideracoes_especiais TEXT,
  evidencia_cientifica TEXT,
  nivel_evidencia TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Tabela sintomas_alimentos
CREATE TABLE IF NOT EXISTS public.sintomas_alimentos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sintoma TEXT NOT NULL,
  categoria_sintoma TEXT,
  descricao_sintoma TEXT,
  alimentos_beneficos TEXT[],
  alimentos_evitar TEXT[],
  mecanismo_acao TEXT,
  evidencia_cientifica TEXT,
  nivel_evidencia TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Tabela atividade_fisica_alimentos
CREATE TABLE IF NOT EXISTS public.atividade_fisica_alimentos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tipo_atividade TEXT NOT NULL,
  intensidade TEXT,
  duracao_minutos INTEGER,
  alimentos_pre_treino TEXT[],
  alimentos_pos_treino TEXT[],
  hidratacao_recomendada TEXT,
  suplementos_sugeridos TEXT[],
  timing_nutricional TEXT,
  consideracoes_especiais TEXT,
  evidencia_cientifica TEXT,
  nivel_evidencia TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS para todas as tabelas
ALTER TABLE public.idade_alimentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.genero_alimentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.estados_emocionais_alimentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.objetivos_fitness_alimentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sintomas_alimentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.atividade_fisica_alimentos ENABLE ROW LEVEL SECURITY;

-- Criar políticas RLS - dados públicos para consulta
CREATE POLICY "Knowledge base data is viewable by everyone" ON public.idade_alimentos
  FOR SELECT USING (true);

CREATE POLICY "Knowledge base data is viewable by everyone" ON public.genero_alimentos
  FOR SELECT USING (true);

CREATE POLICY "Knowledge base data is viewable by everyone" ON public.estados_emocionais_alimentos
  FOR SELECT USING (true);

CREATE POLICY "Knowledge base data is viewable by everyone" ON public.objetivos_fitness_alimentos
  FOR SELECT USING (true);

CREATE POLICY "Knowledge base data is viewable by everyone" ON public.sintomas_alimentos
  FOR SELECT USING (true);

CREATE POLICY "Knowledge base data is viewable by everyone" ON public.atividade_fisica_alimentos
  FOR SELECT USING (true);