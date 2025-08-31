-- Corrigir questões de segurança críticas e problema dos desafios

-- 1. Habilitar RLS nas tabelas que não têm
ALTER TABLE public.goal_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.missions ENABLE ROW LEVEL SECURITY;

-- 2. Criar políticas para goal_categories (todos podem ver)
CREATE POLICY "goal_categories_select_all" ON public.goal_categories
FOR SELECT TO authenticated
USING (true);

-- 3. Criar políticas para challenges (todos podem ver, admin pode editar)
CREATE POLICY "challenges_select_all" ON public.challenges
FOR SELECT TO authenticated
USING (true);

CREATE POLICY "challenges_admin_all" ON public.challenges
FOR ALL TO authenticated
USING (auth.jwt() ->> 'email' IN ('admin@institutodossonhos.com.br', 'lucas11@gmail.com'));

-- 4. Criar políticas para missions (todos podem ver, admin pode editar)
CREATE POLICY "missions_select_all" ON public.missions
FOR SELECT TO authenticated
USING (true);

CREATE POLICY "missions_admin_all" ON public.missions
FOR ALL TO authenticated
USING (auth.jwt() ->> 'email' IN ('admin@institutodossonhos.com.br', 'lucas11@gmail.com'));

-- 5. Verificar se as tabelas de desafios estão configuradas corretamente
SELECT 'Challenges disponíveis:' as info, COUNT(*) as total
FROM public.challenges 
WHERE is_active = true;

SELECT 'User Goals:' as info, COUNT(*) as total
FROM public.user_goals;

SELECT 'User Missions:' as info, COUNT(*) as total
FROM public.user_missions;