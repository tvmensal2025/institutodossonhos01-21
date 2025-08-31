-- ========================================
-- DESABILITAR RLS TEMPORARIAMENTE
-- ========================================

-- 1. DESABILITAR RLS NAS TABELAS
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenges DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenge_participations DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenge_daily_logs DISABLE ROW LEVEL SECURITY;

-- 2. VERIFICAÇÃO
SELECT '✅ RLS DESABILITADO TEMPORARIAMENTE!' as status;

-- 3. TESTE DE ACESSO
SELECT COUNT(*) as total_profiles FROM public.profiles;
SELECT COUNT(*) as total_challenges FROM public.challenges;
SELECT COUNT(*) as total_participations FROM public.challenge_participations; 