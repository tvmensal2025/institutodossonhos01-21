-- 🔍 DIAGNÓSTICO COMPLETO DO DR. VITAL
-- Execute este script no SQL Editor do Supabase

-- 1. VERIFICAR SE O RAFAEL TEM ACESSO TOTAL
SELECT 
  '🔍 VERIFICAÇÃO DO RAFAEL:' as info,
  p.full_name,
  p.email,
  p.role,
  p.admin_level,
  p.is_admin,
  p.is_super_admin,
  ur.role as user_role
FROM profiles p
LEFT JOIN user_roles ur ON p.user_id = ur.user_id
WHERE p.email = 'rafael.ids@icloud.com';

-- 2. VERIFICAR CONFIGURAÇÕES DE IA PARA DR. VITAL
SELECT 
  '🤖 CONFIGURAÇÕES DE IA:' as info,
  functionality,
  service,
  model,
  max_tokens,
  temperature,
  is_enabled,
  is_active,
  personality,
  level
FROM ai_configurations 
WHERE functionality = 'medical_analysis' 
   OR personality = 'drvital'
ORDER BY functionality, personality;

-- 3. VERIFICAR SE EXISTEM DADOS DE TESTE PARA O RAFAEL
SELECT 
  '📊 DADOS DO RAFAEL:' as info,
  (SELECT COUNT(*) FROM weight_measurements WHERE user_id = p.user_id) as peso_medicoes,
  (SELECT COUNT(*) FROM user_goals WHERE user_id = p.user_id) as metas,
  (SELECT COUNT(*) FROM daily_responses WHERE user_id = p.user_id) as respostas_diarias,
  (SELECT COUNT(*) FROM nutrition_logs WHERE user_id = p.user_id) as logs_nutricao,
  (SELECT COUNT(*) FROM anamnesis WHERE user_id = p.user_id) as anamneses
FROM profiles p
WHERE p.email = 'rafael.ids@icloud.com';

-- 4. VERIFICAR POLÍTICAS RLS ATUAIS
SELECT 
  '🛡️ POLÍTICAS RLS:' as info,
  schemaname,
  tablename,
  policyname,
  cmd,
  roles,
  permissive
FROM pg_policies 
WHERE tablename IN ('ai_configurations', 'ai_usage_logs', 'profiles', 'weight_measurements', 'user_goals', 'daily_responses', 'nutrition_logs', 'anamnesis')
ORDER BY tablename, policyname;

-- 5. VERIFICAR SE AS FUNÇÕES DO DR. VITAL EXISTEM
SELECT 
  '🔧 FUNÇÕES DR. VITAL:' as info,
  proname as function_name,
  prosrc as function_source
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public' 
  AND proname LIKE '%dr%vital%'
ORDER BY proname;

-- 6. VERIFICAR LOGS DE ERRO RECENTES (se houver tabela de logs)
SELECT 
  '📝 LOGS RECENTES:' as info,
  'Verificar logs em: https://supabase.com/dashboard/project/hlrkoyywjpckdotimtik/functions/dr-vital-enhanced/logs' as log_url;

-- 7. VERIFICAR VARIÁVEIS DE AMBIENTE (via função de teste)
SELECT 
  '🔑 VARIÁVEIS DE AMBIENTE:' as info,
  'Verificar em: https://supabase.com/dashboard/project/hlrkoyywjpckdotimtik/settings/functions' as env_url;

-- 8. TESTE DE ACESSO DIRETO À TABELA AI_CONFIGURATIONS
SELECT 
  '🧪 TESTE DE ACESSO:' as info,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM ai_configurations 
      WHERE functionality = 'medical_analysis'
    ) THEN '✅ Acesso à tabela ai_configurations OK'
    ELSE '❌ Erro de acesso à tabela ai_configurations'
  END as access_test;

-- 9. VERIFICAR SE HÁ DADOS MÍNIMOS PARA ANÁLISE
SELECT 
  '📋 DADOS MÍNIMOS PARA ANÁLISE:' as info,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM profiles p
      LEFT JOIN weight_measurements w ON p.user_id = w.user_id
      LEFT JOIN user_goals g ON p.user_id = g.user_id
      WHERE p.email = 'rafael.ids@icloud.com'
        AND (w.user_id IS NOT NULL OR g.user_id IS NOT NULL)
    ) THEN '✅ Dados suficientes para análise'
    ELSE '⚠️ Dados insuficientes - adicionar peso ou metas'
  END as data_sufficiency;

-- 10. RECOMENDAÇÕES FINAIS
SELECT 
  '💡 RECOMENDAÇÕES:' as info,
  CASE 
    WHEN NOT EXISTS (
      SELECT 1 FROM profiles 
      WHERE email = 'rafael.ids@icloud.com' AND role = 'admin'
    ) THEN '1. Executar script de correção do Rafael'
    ELSE '1. ✅ Rafael já é admin'
  END as rec1,
  CASE 
    WHEN NOT EXISTS (
      SELECT 1 FROM ai_configurations 
      WHERE functionality = 'medical_analysis' AND is_enabled = true
    ) THEN '2. Ativar configuração medical_analysis'
    ELSE '2. ✅ Configuração medical_analysis ativa'
  END as rec2,
  CASE 
    WHEN NOT EXISTS (
      SELECT 1 FROM weight_measurements w
      JOIN profiles p ON w.user_id = p.user_id
      WHERE p.email = 'rafael.ids@icloud.com'
    ) THEN '3. Adicionar dados de peso para teste'
    ELSE '3. ✅ Dados de peso disponíveis'
  END as rec3;
