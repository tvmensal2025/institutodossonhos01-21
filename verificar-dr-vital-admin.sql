-- 🔍 VERIFICAR DR. VITAL - ADMIN E CONEXÕES
-- Execute este script no SQL Editor do Supabase

-- 1. VERIFICAR SE O RAFAEL É O ADMIN CORRETO
SELECT 
  '🔍 VERIFICAÇÃO DO ADMIN:' as info,
  p.full_name,
  p.email,
  p.role,
  p.admin_level,
  p.is_admin,
  p.is_super_admin,
  ur.role as user_role,
  CASE 
    WHEN p.email = 'rafael.ids@icloud.com' AND p.role = 'admin' THEN '✅ Rafael é admin correto'
    ELSE '❌ Rafael não é admin'
  END as admin_status
FROM profiles p
LEFT JOIN user_roles ur ON p.user_id = ur.user_id
WHERE p.email = 'rafael.ids@icloud.com';

-- 2. VERIFICAR CONFIGURAÇÕES DE IA PARA DR. VITAL
SELECT 
  '🤖 CONFIGURAÇÕES DR. VITAL:' as info,
  functionality,
  service,
  model,
  max_tokens,
  temperature,
  is_enabled,
  is_active,
  personality,
  level,
  CASE 
    WHEN functionality = 'medical_analysis' AND is_enabled = true THEN '✅ Dr. Vital ativo'
    WHEN personality = 'drvital' AND is_enabled = true THEN '✅ Dr. Vital ativo'
    ELSE '❌ Dr. Vital inativo'
  END as vital_status
FROM ai_configurations 
WHERE functionality = 'medical_analysis' 
   OR personality = 'drvital'
ORDER BY functionality, personality;

-- 3. VERIFICAR SE A FUNÇÃO DR-VITAL-ENHANCED EXISTE
SELECT 
  '🔧 FUNÇÃO DR-VITAL-ENHANCED:' as info,
  proname as function_name,
  CASE 
    WHEN proname = 'dr-vital-enhanced' THEN '✅ Função existe'
    ELSE '❌ Função não encontrada'
  END as function_status
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public' 
  AND proname = 'dr-vital-enhanced';

-- 4. VERIFICAR DADOS MÍNIMOS PARA ANÁLISE
SELECT 
  '📊 DADOS PARA ANÁLISE:' as info,
  p.full_name,
  p.email,
  (SELECT COUNT(*) FROM weight_measurements WHERE user_id = p.user_id) as peso_medicoes,
  (SELECT COUNT(*) FROM user_goals WHERE user_id = p.user_id) as metas,
  (SELECT COUNT(*) FROM daily_responses WHERE user_id = p.user_id) as respostas_diarias,
  (SELECT COUNT(*) FROM nutrition_logs WHERE user_id = p.user_id) as logs_nutricao,
  (SELECT COUNT(*) FROM anamnesis WHERE user_id = p.user_id) as anamneses,
  CASE 
    WHEN (
      SELECT COUNT(*) FROM weight_measurements WHERE user_id = p.user_id
    ) > 0 OR (
      SELECT COUNT(*) FROM user_goals WHERE user_id = p.user_id
    ) > 0 THEN '✅ Dados suficientes'
    ELSE '❌ Dados insuficientes'
  END as data_status
FROM profiles p
WHERE p.email = 'rafael.ids@icloud.com';

-- 5. VERIFICAR POLÍTICAS RLS PARA TABELAS NECESSÁRIAS
SELECT 
  '🛡️ POLÍTICAS RLS:' as info,
  tablename,
  policyname,
  cmd,
  CASE 
    WHEN tablename = 'ai_configurations' AND cmd = 'ALL' THEN '✅ Acesso total'
    WHEN tablename IN ('weight_measurements', 'user_goals', 'daily_responses', 'nutrition_logs', 'anamnesis') AND cmd = 'ALL' THEN '✅ Acesso total'
    ELSE '⚠️ Acesso limitado'
  END as access_status
FROM pg_policies 
WHERE tablename IN ('ai_configurations', 'weight_measurements', 'user_goals', 'daily_responses', 'nutrition_logs', 'anamnesis')
ORDER BY tablename, policyname;

-- 6. TESTE DE CONEXÃO COM OPENAI (simulado)
SELECT 
  '🧪 TESTE DE CONEXÃO:' as info,
  'Para testar a conexão com OpenAI, verifique:' as instruction,
  '1. Variáveis de ambiente configuradas' as step1,
  '2. OPENAI_API_KEY válida' as step2,
  '3. Função dr-vital-enhanced funcionando' as step3;

-- 7. VERIFICAR LOGS DE ERRO RECENTES
SELECT 
  '📝 LOGS DE ERRO:' as info,
  'Verificar logs em:' as instruction,
  'https://supabase.com/dashboard/project/hlrkoyywjpckdotimtik/functions/dr-vital-enhanced/logs' as log_url;

-- 8. INSTRUÇÕES PARA CONFIGURAR VARIÁVEIS
SELECT 
  '🔧 CONFIGURAR VARIÁVEIS:' as info,
  '1. Acesse: https://supabase.com/dashboard/project/hlrkoyywjpckdotimtik/settings/functions' as step1,
  '2. Adicione: OPENAI_API_KEY=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' as step2,
  '3. Clique em "Save"' as step3,
  '4. Aguarde 2-3 minutos' as step4;

-- 9. TESTE DIRETO DA FUNÇÃO
SELECT 
  '🧪 TESTE DIRETO:' as info,
  'Para testar a função diretamente:' as instruction,
  'curl -X POST https://hlrkoyywjpckdotimtik.supabase.co/functions/v1/dr-vital-enhanced -H "Content-Type: application/json" -H "Authorization: Bearer SEU_TOKEN" -d "{\"message\":\"teste\",\"userId\":\"ID_DO_RAFAEL\"}"' as curl_command;

-- 10. RECOMENDAÇÕES FINAIS
SELECT 
  '💡 RECOMENDAÇÕES:' as info,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM profiles 
      WHERE email = 'rafael.ids@icloud.com' AND role = 'admin'
    ) THEN '✅ Rafael é admin'
    ELSE '❌ Configurar Rafael como admin'
  END as admin_rec,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM ai_configurations 
      WHERE functionality = 'medical_analysis' AND is_enabled = true
    ) THEN '✅ Configuração medical_analysis ativa'
    ELSE '❌ Ativar configuração medical_analysis'
  END as config_rec,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM profiles p
      LEFT JOIN weight_measurements w ON p.user_id = w.user_id
      WHERE p.email = 'rafael.ids@icloud.com' AND w.user_id IS NOT NULL
    ) THEN '✅ Dados de peso disponíveis'
    ELSE '❌ Adicionar dados de peso'
  END as data_rec,
  'Verificar variáveis de ambiente e logs de erro' as env_rec;
