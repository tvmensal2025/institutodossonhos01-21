-- DESABILITAR TODOS OS TRIGGERS - COMPLETO E DEFINITIVO
-- ⚠️ Este script remove TODOS os triggers do schema public

-- 1. Listar todos os triggers antes da remoção
SELECT 'TRIGGERS QUE SERÃO REMOVIDOS:' as info;
SELECT 
  trigger_name,
  event_object_table,
  action_timing || ' ' || event_manipulation as evento
FROM information_schema.triggers 
WHERE trigger_schema = 'public'
ORDER BY event_object_table, trigger_name;

-- 2. REMOVER TODOS OS TRIGGERS DO SCHEMA PUBLIC
DO $$ 
DECLARE 
    trigger_record RECORD;
BEGIN
    -- Iterar sobre todos os triggers do schema public
    FOR trigger_record IN 
        SELECT trigger_name, event_object_table
        FROM information_schema.triggers 
        WHERE trigger_schema = 'public'
    LOOP
        -- Remover cada trigger
        EXECUTE 'DROP TRIGGER IF EXISTS ' || trigger_record.trigger_name || ' ON public.' || trigger_record.event_object_table || ' CASCADE';
        RAISE NOTICE 'Trigger removido: % da tabela %', trigger_record.trigger_name, trigger_record.event_object_table;
    END LOOP;
    
    RAISE NOTICE 'TODOS os triggers foram removidos do schema public';
END $$;

-- 3. REMOVER TRIGGERS ESPECÍFICOS CONHECIDOS (garantia extra)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users CASCADE;
DROP TRIGGER IF EXISTS on_auth_user_created_profile ON auth.users CASCADE;
DROP TRIGGER IF EXISTS handle_new_user_trigger ON auth.users CASCADE;
DROP TRIGGER IF EXISTS trigger_create_notification_settings ON profiles CASCADE;
DROP TRIGGER IF EXISTS trigger_achievement_notification ON user_achievements CASCADE;
DROP TRIGGER IF EXISTS update_user_streak_trigger ON daily_mission_sessions CASCADE;
DROP TRIGGER IF EXISTS generate_weekly_insights_trigger ON daily_responses CASCADE;
DROP TRIGGER IF EXISTS check_achievements_trigger ON daily_responses CASCADE;
DROP TRIGGER IF EXISTS auto_calculate_heart_zones_trigger ON heart_rate_data CASCADE;
DROP TRIGGER IF EXISTS update_updated_at_trigger ON profiles CASCADE;
DROP TRIGGER IF EXISTS update_food_analysis_updated_at_trigger ON food_analysis CASCADE;
DROP TRIGGER IF EXISTS generate_weekly_analysis_trigger ON weight_measurements CASCADE;
DROP TRIGGER IF EXISTS update_assessment_updated_at_trigger ON assessments CASCADE;
DROP TRIGGER IF EXISTS calculate_bmi_trigger_on_anamnesis ON user_anamnesis CASCADE;
DROP TRIGGER IF EXISTS calculate_daily_tracking_score_trigger ON daily_advanced_tracking CASCADE;
DROP TRIGGER IF EXISTS check_tracking_achievements_trigger ON daily_advanced_tracking CASCADE;
DROP TRIGGER IF EXISTS update_medical_documents_updated_at_trigger ON medical_documents CASCADE;
DROP TRIGGER IF EXISTS update_ai_config_snapshot_trigger ON ai_configurations CASCADE;
DROP TRIGGER IF EXISTS calculate_imc_trigger ON weight_measurements CASCADE;

-- 4. VERIFICAR SE TODOS FORAM REMOVIDOS
SELECT 'VERIFICAÇÃO FINAL - TRIGGERS RESTANTES:' as status;
SELECT 
  COALESCE(COUNT(*), 0) as triggers_restantes,
  CASE 
    WHEN COUNT(*) = 0 THEN '✅ TODOS OS TRIGGERS FORAM REMOVIDOS!'
    ELSE '⚠️ AINDA HÁ TRIGGERS RESTANTES'
  END as resultado
FROM information_schema.triggers 
WHERE trigger_schema = 'public';

-- 5. Listar triggers restantes (se houver)
SELECT trigger_name, event_object_table
FROM information_schema.triggers 
WHERE trigger_schema = 'public';

-- 6. RESULTADO FINAL
SELECT 'OPERAÇÃO CONCLUÍDA!' as status,
       'Todos os triggers do schema public foram removidos' as resultado;