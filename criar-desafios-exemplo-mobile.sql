-- CRIAR DESAFIOS DE EXEMPLO PARA TESTAR MODAL MOBILE
-- Execute este script no Supabase para ter desafios funcionais

-- Primeiro, garantir que a tabela challenges existe
CREATE TABLE IF NOT EXISTS public.challenges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  difficulty VARCHAR(50) DEFAULT 'medio',
  duration_days INTEGER DEFAULT 30,
  points_reward INTEGER DEFAULT 100,
  badge_icon VARCHAR(10) DEFAULT '🏆',
  badge_name VARCHAR(100),
  instructions TEXT,
  tips TEXT[],
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  is_group_challenge BOOLEAN DEFAULT false,
  daily_log_target NUMERIC DEFAULT 1,
  daily_log_unit VARCHAR(50) DEFAULT 'unidade',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;

-- Política para visualizar desafios (todos podem ver)
DROP POLICY IF EXISTS "Anyone can view challenges" ON public.challenges;
CREATE POLICY "Anyone can view challenges" ON public.challenges
  FOR SELECT USING (is_active = true);

-- Criar tabela de participações se não existir
CREATE TABLE IF NOT EXISTS public.challenge_participations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  challenge_id UUID REFERENCES public.challenges(id) ON DELETE CASCADE,
  progress NUMERIC DEFAULT 0,
  is_completed BOOLEAN DEFAULT false,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, challenge_id)
);

-- Habilitar RLS para participações
ALTER TABLE public.challenge_participations ENABLE ROW LEVEL SECURITY;

-- Política para participações (usuários veem apenas suas próprias)
DROP POLICY IF EXISTS "Users can view their own participations" ON public.challenge_participations;
CREATE POLICY "Users can view their own participations" ON public.challenge_participations
  FOR ALL USING (auth.uid() = user_id);

-- Inserir desafios de exemplo
INSERT INTO public.challenges (
  title, description, category, difficulty, duration_days, points_reward, 
  badge_icon, badge_name, instructions, tips, is_active, is_featured, 
  is_group_challenge, daily_log_target, daily_log_unit
) VALUES 
(
  'Beber 2L de Água Diariamente',
  'Mantenha-se hidratado bebendo pelo menos 2 litros de água por dia',
  'Hidratação',
  'facil',
  30,
  50,
  '💧',
  'Hidratação Master',
  'Beba água regularmente ao longo do dia. Use um aplicativo ou marque em uma garrafa para acompanhar.',
  ARRAY['Tenha sempre uma garrafa de água por perto', 'Beba um copo ao acordar', 'Use apps para lembrar'],
  true,
  true,
  false,
  2000,
  'ml'
),
(
  'Caminhar 8000 Passos',
  'Dê pelo menos 8000 passos todos os dias para manter-se ativo',
  'Atividade Física',
  'medio',
  30,
  75,
  '🚶‍♂️',
  'Caminhador Dedicado',
  'Use um contador de passos ou app no celular. Caminhe durante as ligações, use escadas.',
  ARRAY['Estacione mais longe', 'Use escadas', 'Caminhe durante ligações'],
  true,
  true,
  false,
  8000,
  'passos'
),
(
  'Meditar 10 Minutos',
  'Pratique meditação ou mindfulness por 10 minutos diários',
  'Bem-estar Mental',
  'facil',
  21,
  60,
  '🧘‍♀️',
  'Mente Zen',
  'Use apps como Headspace, Calm ou pratique respiração profunda. Encontre um local tranquilo.',
  ARRAY['Comece com 5 minutos', 'Use apps guiados', 'Pratique sempre no mesmo horário'],
  true,
  false,
  false,
  10,
  'minutos'
),
(
  'Dormir 8 Horas',
  'Tenha uma noite de sono reparador com pelo menos 8 horas',
  'Sono',
  'medio',
  30,
  80,
  '😴',
  'Dorminhoco Saudável',
  'Estabeleça uma rotina noturna, evite telas 1h antes de dormir, mantenha o quarto escuro.',
  ARRAY['Desligue telas 1h antes', 'Mantenha horário fixo', 'Quarto escuro e fresco'],
  true,
  true,
  false,
  8,
  'horas'
),
(
  'Comer 5 Porções de Frutas/Vegetais',
  'Consuma pelo menos 5 porções de frutas e vegetais por dia',
  'Nutrição',
  'dificil',
  30,
  100,
  '🥗',
  'Nutrição Perfeita',
  'Inclua frutas e vegetais em todas as refeições. Varie as cores para diferentes nutrientes.',
  ARRAY['Varie as cores', 'Inclua em todas refeições', 'Tenha frutas sempre à mão'],
  true,
  false,
  false,
  5,
  'porções'
),
(
  'Exercitar-se 30 Minutos',
  'Faça pelo menos 30 minutos de exercício físico moderado',
  'Atividade Física',
  'dificil',
  30,
  120,
  '💪',
  'Atleta Dedicado',
  'Pode ser academia, corrida, natação, dança ou esportes. O importante é mover o corpo.',
  ARRAY['Escolha atividade prazerosa', 'Comece gradualmente', 'Varie os exercícios'],
  true,
  true,
  false,
  30,
  'minutos'
),
(
  'Ler 20 Páginas',
  'Dedique tempo à leitura, lendo pelo menos 20 páginas por dia',
  'Desenvolvimento Pessoal',
  'facil',
  30,
  40,
  '📚',
  'Leitor Voraz',
  'Escolha livros de seu interesse. Pode ser físico, digital ou audiobook.',
  ARRAY['Tenha sempre um livro', 'Leia antes de dormir', 'Use momentos livres'],
  true,
  false,
  false,
  20,
  'páginas'
),
(
  'Gratidão Diária',
  'Anote 3 coisas pelas quais você é grato todos os dias',
  'Bem-estar Mental',
  'facil',
  21,
  30,
  '🙏',
  'Coração Grato',
  'Use um diário de gratidão ou app. Reflita sobre momentos positivos do dia.',
  ARRAY['Anote ao acordar ou antes de dormir', 'Seja específico', 'Include pessoas'],
  true,
  false,
  false,
  3,
  'itens'
) ON CONFLICT (title) DO NOTHING;

-- Verificar se os desafios foram criados
SELECT 
  'DESAFIOS CRIADOS PARA TESTE MOBILE!' as status,
  COUNT(*) as total_desafios
FROM public.challenges 
WHERE is_active = true;

-- Mostrar todos os desafios criados
SELECT 
  title,
  difficulty,
  daily_log_target,
  daily_log_unit,
  points_reward,
  badge_icon
FROM public.challenges 
WHERE is_active = true
ORDER BY difficulty, points_reward;