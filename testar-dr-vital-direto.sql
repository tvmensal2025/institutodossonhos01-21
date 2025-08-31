-- 🧪 TESTAR DR. VITAL DIRETAMENTE
-- Execute este script no SQL Editor do Supabase

-- 1. OBTER USER_ID DO RAFAEL
DO $$
DECLARE
    rafael_user_id UUID;
    test_result JSONB;
BEGIN
    -- Buscar o user_id do Rafael
    SELECT user_id INTO rafael_user_id 
    FROM profiles 
    WHERE email = 'rafael.ids@icloud.com';
    
    IF rafael_user_id IS NULL THEN
        RAISE NOTICE '❌ Rafael não encontrado!';
        RETURN;
    END IF;
    
    RAISE NOTICE '✅ Rafael encontrado. User ID: %', rafael_user_id;
    
    -- 2. VERIFICAR SE EXISTEM DADOS PARA ANÁLISE
    RAISE NOTICE '';
    RAISE NOTICE '📊 VERIFICANDO DADOS:';
    
    -- Verificar peso
    DECLARE
        peso_count INTEGER;
    BEGIN
        SELECT COUNT(*) INTO peso_count FROM weight_measurements WHERE user_id = rafael_user_id;
        RAISE NOTICE '   - Peso: % medições', peso_count;
    END;
    
    -- Verificar metas
    DECLARE
        metas_count INTEGER;
    BEGIN
        SELECT COUNT(*) INTO metas_count FROM user_goals WHERE user_id = rafael_user_id;
        RAISE NOTICE '   - Metas: % metas', metas_count;
    END;
    
    -- Verificar anamnese
    DECLARE
        anamnese_count INTEGER;
    BEGIN
        SELECT COUNT(*) INTO anamnese_count FROM anamnesis WHERE user_id = rafael_user_id;
        RAISE NOTICE '   - Anamnese: % registros', anamnese_count;
    END;
    
    -- 3. VERIFICAR CONFIGURAÇÃO DE IA
    RAISE NOTICE '';
    RAISE NOTICE '🤖 VERIFICANDO CONFIGURAÇÃO DE IA:';
    
    DECLARE
        ai_config RECORD;
    BEGIN
        SELECT * INTO ai_config FROM ai_configurations 
        WHERE functionality = 'medical_analysis' 
           OR personality = 'drvital'
        LIMIT 1;
        
        IF ai_config IS NOT NULL THEN
            RAISE NOTICE '   - Funcionalidade: %', ai_config.functionality;
            RAISE NOTICE '   - Serviço: %', ai_config.service;
            RAISE NOTICE '   - Modelo: %', ai_config.model;
            RAISE NOTICE '   - Ativo: %', ai_config.is_enabled;
            RAISE NOTICE '   - Personalidade: %', ai_config.personality;
        ELSE
            RAISE NOTICE '   ❌ Nenhuma configuração de IA encontrada!';
        END IF;
    END;
    
    -- 4. TESTE DE ACESSO ÀS TABELAS
    RAISE NOTICE '';
    RAISE NOTICE '🛡️ TESTANDO ACESSO ÀS TABELAS:';
    
    -- Teste ai_configurations
    BEGIN
        SELECT COUNT(*) INTO test_result FROM ai_configurations WHERE functionality = 'medical_analysis';
        RAISE NOTICE '   ✅ ai_configurations: Acesso OK';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE '   ❌ ai_configurations: Erro de acesso - %', SQLERRM;
    END;
    
    -- Teste weight_measurements
    BEGIN
        SELECT COUNT(*) INTO test_result FROM weight_measurements WHERE user_id = rafael_user_id;
        RAISE NOTICE '   ✅ weight_measurements: Acesso OK';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE '   ❌ weight_measurements: Erro de acesso - %', SQLERRM;
    END;
    
    -- Teste user_goals
    BEGIN
        SELECT COUNT(*) INTO test_result FROM user_goals WHERE user_id = rafael_user_id;
        RAISE NOTICE '   ✅ user_goals: Acesso OK';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE '   ❌ user_goals: Erro de acesso - %', SQLERRM;
    END;
    
    -- 5. VERIFICAR SE A FUNÇÃO EXISTE
    RAISE NOTICE '';
    RAISE NOTICE '🔧 VERIFICANDO FUNÇÃO DR-VITAL-ENHANCED:';
    
    DECLARE
        function_exists BOOLEAN;
    BEGIN
        SELECT EXISTS (
            SELECT 1 FROM pg_proc p
            JOIN pg_namespace n ON p.pronamespace = n.oid
            WHERE n.nspname = 'public' 
              AND proname = 'dr-vital-enhanced'
        ) INTO function_exists;
        
        IF function_exists THEN
            RAISE NOTICE '   ✅ Função dr-vital-enhanced existe';
        ELSE
            RAISE NOTICE '   ❌ Função dr-vital-enhanced NÃO existe!';
        END IF;
    END;
    
    -- 6. RECOMENDAÇÕES
    RAISE NOTICE '';
    RAISE NOTICE '💡 RECOMENDAÇÕES:';
    RAISE NOTICE '   1. Verifique se a variável OPENAI_API_KEY está configurada';
    RAISE NOTICE '   2. Acesse: https://supabase.com/dashboard/project/hlrkoyywjpckdotimtik/settings/functions';
    RAISE NOTICE '   3. Adicione: OPENAI_API_KEY=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';
    RAISE NOTICE '   4. Verifique logs em: https://supabase.com/dashboard/project/hlrkoyywjpckdotimtik/functions/dr-vital-enhanced/logs';
    RAISE NOTICE '';
    RAISE NOTICE '🧪 TESTE MANUAL:';
    RAISE NOTICE '   curl -X POST https://hlrkoyywjpckdotimtik.supabase.co/functions/v1/dr-vital-enhanced';
    RAISE NOTICE '   -H "Content-Type: application/json"';
    RAISE NOTICE '   -H "Authorization: Bearer SEU_TOKEN"';
    RAISE NOTICE '   -d "{\"message\":\"teste\",\"userId\":\"%"}', rafael_user_id;
    
END $$;

-- 7. VERIFICAR VARIÁVEIS DE AMBIENTE (se possível)
SELECT 
  '🔑 VARIÁVEIS DE AMBIENTE:' as info,
  'Para verificar variáveis de ambiente:' as instruction,
  '1. Acesse: https://supabase.com/dashboard/project/hlrkoyywjpckdotimtik/settings/functions' as step1,
  '2. Verifique se OPENAI_API_KEY está configurada' as step2,
  '3. Se não estiver, adicione a variável' as step3;

-- 8. VERIFICAR LOGS DE ERRO
SELECT 
  '📝 LOGS DE ERRO:' as info,
  'Para verificar logs de erro:' as instruction,
  'https://supabase.com/dashboard/project/hlrkoyywjpckdotimtik/functions/dr-vital-enhanced/logs' as log_url;
