-- 🔑 VERIFICAR E CONFIGURAR VARIÁVEIS DE AMBIENTE
-- Execute este script no SQL Editor do Supabase

-- 1. VERIFICAR SE AS FUNÇÕES DO DR. VITAL ESTÃO FUNCIONANDO
SELECT 
  '🔍 VERIFICAÇÃO DAS FUNÇÕES:' as info,
  'dr-vital-enhanced' as function_name,
  'https://hlrkoyywjpckdotimtik.supabase.co/functions/v1/dr-vital-enhanced' as function_url;

-- 2. VERIFICAR CONFIGURAÇÕES DE IA ATUAIS
SELECT 
  '🤖 CONFIGURAÇÕES DE IA ATIVAS:' as info,
  functionality,
  service,
  model,
  is_enabled,
  is_active,
  personality,
  level
FROM ai_configurations 
WHERE is_enabled = true 
  AND (functionality = 'medical_analysis' OR personality = 'drvital')
ORDER BY functionality;

-- 3. TESTE DE CONEXÃO COM OPENAI (via função de teste)
SELECT 
  '🧪 TESTE DE CONEXÃO:' as info,
  'Para testar a conexão com OpenAI, execute:' as instruction,
  'SELECT * FROM test_openai_connection();' as test_command;

-- 4. VERIFICAR SE HÁ DADOS SUFICIENTES PARA ANÁLISE
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
  END as status_analise
FROM profiles p
WHERE p.email = 'rafael.ids@icloud.com';

-- 5. VERIFICAR POLÍTICAS RLS PARA TABELAS NECESSÁRIAS
SELECT 
  '🛡️ POLÍTICAS RLS:' as info,
  tablename,
  policyname,
  cmd,
  permissive
FROM pg_policies 
WHERE tablename IN ('ai_configurations', 'weight_measurements', 'user_goals', 'daily_responses', 'nutrition_logs', 'anamnesis')
ORDER BY tablename, policyname;

-- 6. INSTRUÇÕES PARA CONFIGURAR VARIÁVEIS DE AMBIENTE
SELECT 
  '🔧 CONFIGURAÇÃO DE VARIÁVEIS:' as info,
  '1. Acesse: https://supabase.com/dashboard/project/hlrkoyywjpckdotimtik/settings/functions' as step1,
  '2. Adicione as seguintes variáveis:' as step2,
  '   OPENAI_API_KEY=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' as openai_key,
  '   GOOGLE_AI_API_KEY=AIzaSyCOdeLu7T_uhCcXlTzZgat5wbo8Y-0DbNc' as google_key,
  '3. Clique em "Save"' as step3,
  '4. Aguarde 2-3 minutos para propagar' as step4,
  '5. Teste novamente o Dr. Vital' as step5;

-- 7. VERIFICAR LOGS DE ERRO (se houver)
SELECT 
  '📝 LOGS DE ERRO:' as info,
  'Para verificar logs de erro, acesse:' as instruction,
  'https://supabase.com/dashboard/project/hlrkoyywjpckdotimtik/functions/dr-vital-enhanced/logs' as log_url;

-- 8. TESTE SIMPLES DE FUNÇÃO
SELECT 
  '🧪 TESTE SIMPLES:' as info,
  'Para testar se a função está respondendo:' as instruction,
  'curl -X POST https://hlrkoyywjpckdotimtik.supabase.co/functions/v1/dr-vital-enhanced -H "Content-Type: application/json" -d "{\"message\":\"teste\",\"userId\":\"test\"}"' as curl_command;

-- 9. RECOMENDAÇÕES FINAIS
SELECT 
  '💡 RECOMENDAÇÕES:' as info,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM ai_configurations 
      WHERE functionality = 'medical_analysis' AND is_enabled = true
    ) THEN '✅ Configuração medical_analysis ativa'
    ELSE '❌ Ativar configuração medical_analysis'
  END as config_status,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM profiles p
      LEFT JOIN weight_measurements w ON p.user_id = w.user_id
      WHERE p.email = 'rafael.ids@icloud.com' AND w.user_id IS NOT NULL
    ) THEN '✅ Dados de peso disponíveis'
    ELSE '❌ Adicionar dados de peso'
  END as data_status,
  'Verificar variáveis de ambiente no Supabase Dashboard' as env_status;
