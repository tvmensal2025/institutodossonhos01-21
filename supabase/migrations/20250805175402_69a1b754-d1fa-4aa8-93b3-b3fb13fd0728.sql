-- ========================================
-- LIMPEZA COMPLETA DE DADOS DE TESTE - CORRIGIDA
-- Preparação para vendas oficiais
-- ========================================

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
    
    -- Se não há usuários de teste, finalizar
    IF array_length(test_user_ids, 1) IS NULL OR array_length(test_user_ids, 1) = 0 THEN
        RAISE NOTICE 'Nenhum usuário de teste encontrado. Sistema já limpo.';
        RETURN;
    END IF;
    
    -- Log dos usuários que serão removidos
    FOR user_id_var IN SELECT unnest(test_user_ids)
    LOOP
        SELECT email INTO email_var FROM auth.users WHERE id = user_id_var;
        RAISE NOTICE 'Removendo usuário: % (%)', email_var, user_id_var;
    END LOOP;
    
    -- REMOVER DADOS VINCULADOS (apenas tabelas que existem)
    
    -- Challenge data
    DELETE FROM challenge_daily_logs WHERE participation_id IN (
        SELECT id FROM challenge_participations WHERE user_id = ANY(test_user_ids)
    );
    DELETE FROM challenge_participations WHERE user_id = ANY(test_user_ids);
    
    -- Goals
    DELETE FROM goal_updates WHERE user_id = ANY(test_user_ids);
    DELETE FROM user_goals WHERE user_id = ANY(test_user_ids);
    
    -- Health tracking
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
    
    -- Weight measurements
    DELETE FROM weight_measurements WHERE user_id = ANY(test_user_ids);
    DELETE FROM weekly_analyses WHERE user_id = ANY(test_user_ids);
    DELETE FROM user_physical_data WHERE user_id = ANY(test_user_ids);
    
    -- Food data
    DELETE FROM food_analysis WHERE user_id = ANY(test_user_ids);
    DELETE FROM food_patterns WHERE user_id = ANY(test_user_ids);
    
    -- Sessions and activities
    DELETE FROM user_sessions WHERE user_id = ANY(test_user_ids);
    DELETE FROM activity_sessions WHERE user_id = ANY(test_user_ids);
    DELETE FROM activity_categories WHERE user_id = ANY(test_user_ids);
    
    -- Assessments
    DELETE FROM assessments WHERE user_id = ANY(test_user_ids);
    DELETE FROM weekly_insights WHERE user_id = ANY(test_user_ids);
    
    -- Achievements
    DELETE FROM user_achievements WHERE user_id = ANY(test_user_ids);
    DELETE FROM user_behavior_patterns WHERE user_id = ANY(test_user_ids);
    DELETE FROM tracking_achievements WHERE user_id = ANY(test_user_ids);
    
    -- Subscriptions
    DELETE FROM user_subscriptions WHERE user_id = ANY(test_user_ids);
    DELETE FROM content_access WHERE user_id = ANY(test_user_ids);
    
    -- Medical documents (se existir)
    DELETE FROM medical_documents WHERE user_id = ANY(test_user_ids);
    
    -- AI logs
    DELETE FROM ai_system_logs WHERE created_by = ANY(test_user_ids);
    
    -- Custom saboteurs
    DELETE FROM custom_saboteurs WHERE created_by = ANY(test_user_ids);
    
    -- REMOVER PROFILES
    DELETE FROM public.profiles WHERE user_id = ANY(test_user_ids);
    
    -- REMOVER USUÁRIOS DO AUTH
    DELETE FROM auth.users WHERE id = ANY(test_user_ids);
    
    RAISE NOTICE '✅ LIMPEZA CONCLUÍDA! Sistema preparado para vendas oficiais.';
    
END $$;

-- VERIFICAÇÃO FINAL
SELECT 
    '📋 SISTEMA LIMPO' as status,
    (SELECT COUNT(*) FROM auth.users) as total_users,
    (SELECT COUNT(*) FROM profiles) as total_profiles,
    (SELECT COUNT(*) FROM challenge_participations) as total_participations;

-- RESET CONTADORES
UPDATE challenges SET current_participants = 0 WHERE current_participants > 0;

SELECT '🎉 PRONTO PARA VENDAS OFICIAIS!' as final_status;