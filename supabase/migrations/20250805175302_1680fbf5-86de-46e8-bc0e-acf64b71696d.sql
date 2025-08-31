-- ========================================
-- LIMPEZA COMPLETA DE DADOS DE TESTE
-- Preparação para vendas oficiais
-- ========================================

-- Este script remove TODOS os dados de usuários de teste mas mantém 
-- toda a estrutura do banco de dados intacta

-- 1. IDENTIFICAR USUÁRIOS DE TESTE
-- Baseado nos emails conhecidos dos scripts de teste
DO $$
DECLARE
    test_emails text[] := ARRAY[
        'teste@institutodossonhos.com',
        'teste@email.com', 
        'luu@gmail.com',
        'teste-desafio@teste.com',
        'o@gmail.com',
        'user@example.com'
    ];
    test_user_ids uuid[];
    user_id_var uuid;
    email_var text;
BEGIN
    -- Buscar IDs de todos os usuários de teste
    SELECT ARRAY(
        SELECT au.id 
        FROM auth.users au 
        WHERE au.email = ANY(test_emails)
           OR au.email LIKE '%@teste.%'
           OR au.email LIKE 'teste%'
           OR au.email LIKE '%test%'
           OR au.raw_user_meta_data->>'full_name' LIKE '%Teste%'
           OR au.raw_user_meta_data->>'full_name' LIKE '%Test%'
    ) INTO test_user_ids;
    
    RAISE NOTICE 'Encontrados % usuários de teste para remoção', array_length(test_user_ids, 1);
    
    -- Log dos usuários que serão removidos
    FOR user_id_var IN SELECT unnest(test_user_ids)
    LOOP
        SELECT email INTO email_var FROM auth.users WHERE id = user_id_var;
        RAISE NOTICE 'Removendo usuário: % (%)', email_var, user_id_var;
    END LOOP;
    
    -- Se não há usuários de teste, finalizar
    IF array_length(test_user_ids, 1) IS NULL OR array_length(test_user_ids, 1) = 0 THEN
        RAISE NOTICE 'Nenhum usuário de teste encontrado. Sistema já limpo.';
        RETURN;
    END IF;
    
    -- 2. REMOVER DADOS VINCULADOS A USUÁRIOS DE TESTE
    -- (em ordem de dependência para evitar erros de FK)
    
    -- Challenge data
    DELETE FROM challenge_daily_logs WHERE participation_id IN (
        SELECT id FROM challenge_participations WHERE user_id = ANY(test_user_ids)
    );
    DELETE FROM challenge_participations WHERE user_id = ANY(test_user_ids);
    
    -- User goals and updates
    DELETE FROM goal_updates WHERE user_id = ANY(test_user_ids);
    DELETE FROM user_goals WHERE user_id = ANY(test_user_ids);
    
    -- Health and tracking data
    DELETE FROM daily_advanced_tracking WHERE user_id = ANY(test_user_ids);
    DELETE FROM daily_mission_sessions WHERE user_id = ANY(test_user_ids);
    DELETE FROM daily_missions WHERE user_id = ANY(test_user_ids);
    DELETE FROM daily_responses WHERE user_id = ANY(test_user_ids);
    DELETE FROM health_diary WHERE user_id = ANY(test_user_ids);
    DELETE FROM exercise_tracking WHERE user_id = ANY(test_user_ids);
    DELETE FROM exercise_sessions WHERE user_id = ANY(test_user_ids);
    DELETE FROM heart_rate_data WHERE user_id = ANY(test_user_ids);
    DELETE FROM google_fit_data WHERE user_id = ANY(test_user_ids);
    DELETE FROM device_sync_log WHERE user_id = ANY(test_user_ids);
    
    -- Weight and body measurements
    DELETE FROM weight_measurements WHERE user_id = ANY(test_user_ids);
    DELETE FROM weekly_analyses WHERE user_id = ANY(test_user_ids);
    DELETE FROM user_physical_data WHERE user_id = ANY(test_user_ids);
    
    -- Food and nutrition data
    DELETE FROM food_analysis WHERE user_id = ANY(test_user_ids);
    DELETE FROM food_patterns WHERE user_id = ANY(test_user_ids);
    
    -- Sessions and activities
    DELETE FROM user_sessions WHERE user_id = ANY(test_user_ids);
    DELETE FROM activity_sessions WHERE user_id = ANY(test_user_ids);
    DELETE FROM activity_categories WHERE user_id = ANY(test_user_ids);
    
    -- Assessments and insights
    DELETE FROM assessments WHERE user_id = ANY(test_user_ids);
    DELETE FROM weekly_insights WHERE user_id = ANY(test_user_ids);
    
    -- Achievements and behavior
    DELETE FROM user_achievements WHERE user_id = ANY(test_user_ids);
    DELETE FROM user_behavior_patterns WHERE user_id = ANY(test_user_ids);
    DELETE FROM tracking_achievements WHERE user_id = ANY(test_user_ids);
    
    -- Subscriptions and access
    DELETE FROM user_subscriptions WHERE user_id = ANY(test_user_ids);
    DELETE FROM content_access WHERE user_id = ANY(test_user_ids);
    
    -- Notifications and settings
    DELETE FROM notifications_sent WHERE user_id = ANY(test_user_ids);
    -- notification_settings pode não existir em algumas bases
    IF EXISTS (
      SELECT 1 FROM information_schema.tables 
      WHERE table_schema='public' AND table_name='notification_settings'
    ) THEN
      EXECUTE 'DELETE FROM public.notification_settings WHERE user_id = ANY($1)' USING test_user_ids;
    END IF;
    
    -- Medical documents
    DELETE FROM medical_documents WHERE user_id = ANY(test_user_ids);
    
    -- AI system logs relacionados
    DELETE FROM ai_system_logs WHERE created_by = ANY(test_user_ids);
    
    -- Saboteur data (tabelas podem não existir em algumas bases)
    IF EXISTS (
      SELECT 1 FROM information_schema.tables 
      WHERE table_schema='public' AND table_name='user_saboteur_results'
    ) THEN
      EXECUTE 'DELETE FROM public.user_saboteur_results WHERE user_id = ANY($1)' USING test_user_ids;
    END IF;
    IF EXISTS (
      SELECT 1 FROM information_schema.tables 
      WHERE table_schema='public' AND table_name='custom_saboteurs'
    ) THEN
      EXECUTE 'DELETE FROM public.custom_saboteurs WHERE created_by = ANY($1)' USING test_user_ids;
    END IF;
    
    -- 3. REMOVER PROFILES DOS USUÁRIOS DE TESTE
    DELETE FROM public.profiles WHERE user_id = ANY(test_user_ids);
    
    -- 4. REMOVER USUÁRIOS DE TESTE DO AUTH
    DELETE FROM auth.users WHERE id = ANY(test_user_ids);
    
    RAISE NOTICE '✅ LIMPEZA CONCLUÍDA! Sistema preparado para vendas oficiais.';
    RAISE NOTICE '📊 Todos os dados de teste foram removidos mantendo a estrutura intacta.';
    
END $$;

-- 5. VERIFICAÇÃO FINAL - CONTAGEM DE DADOS RESTANTES
SELECT 
    '📋 RESUMO PÓS-LIMPEZA' as info,
    (SELECT COUNT(*) FROM auth.users) as total_users,
    (SELECT COUNT(*) FROM profiles) as total_profiles,
    (SELECT COUNT(*) FROM challenges) as total_challenges,
    (SELECT COUNT(*) FROM challenge_participations) as total_participations,
    (SELECT COUNT(*) FROM user_goals) as total_goals,
    (SELECT COUNT(*) FROM sessions) as total_sessions,
    (SELECT COUNT(*) FROM user_sessions) as total_user_sessions;

-- 6. RESET DE CONTADORES SE NECESSÁRIO
UPDATE challenges SET current_participants = 0 WHERE current_participants > 0;

-- 7. LOG FINAL
SELECT '🎉 SISTEMA LIMPO E PRONTO PARA VENDAS OFICIAIS!' as status;