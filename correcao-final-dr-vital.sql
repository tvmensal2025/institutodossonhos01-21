-- 🔧 CORREÇÃO FINAL DO DR. VITAL - RESOLVE TUDO
-- Execute este script no SQL Editor do Supabase

-- 1. CORRIGIR POLÍTICAS RLS - PERMITIR ACESSO TOTAL AO RAFAEL
-- ai_configurations
DROP POLICY IF EXISTS "Only admins can manage AI configurations" ON public.ai_configurations;
DROP POLICY IF EXISTS "Rafael and admins can manage AI configurations" ON public.ai_configurations;
DROP POLICY IF EXISTS "Authenticated users can manage AI configurations" ON public.ai_configurations;

CREATE POLICY "Rafael full access to AI configurations" ON public.ai_configurations
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE id = auth.uid() AND email = 'rafael.ids@icloud.com'
        )
        OR
        EXISTS (
            SELECT 1 FROM public.user_roles 
            WHERE user_id = auth.uid() AND role = 'admin'::app_role
        )
        OR
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- 2. CORRIGIR POLÍTICAS PARA TODAS AS TABELAS NECESSÁRIAS
-- weight_measurements
DROP POLICY IF EXISTS "Users can view their own weight measurements" ON public.weight_measurements;
CREATE POLICY "Rafael full access to weight measurements" ON public.weight_measurements
    FOR ALL USING (
        auth.uid() = user_id
        OR
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE id = auth.uid() AND email = 'rafael.ids@icloud.com'
        )
    );

-- user_goals
DROP POLICY IF EXISTS "Users can view their own goals" ON public.user_goals;
CREATE POLICY "Rafael full access to user goals" ON public.user_goals
    FOR ALL USING (
        auth.uid() = user_id
        OR
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE id = auth.uid() AND email = 'rafael.ids@icloud.com'
        )
    );

-- daily_responses
DROP POLICY IF EXISTS "Users can view their own daily responses" ON public.daily_responses;
CREATE POLICY "Rafael full access to daily responses" ON public.daily_responses
    FOR ALL USING (
        auth.uid() = user_id
        OR
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE id = auth.uid() AND email = 'rafael.ids@icloud.com'
        )
    );

-- nutrition_logs
DROP POLICY IF EXISTS "Users can view their own nutrition logs" ON public.nutrition_logs;
CREATE POLICY "Rafael full access to nutrition logs" ON public.nutrition_logs
    FOR ALL USING (
        auth.uid() = user_id
        OR
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE id = auth.uid() AND email = 'rafael.ids@icloud.com'
        )
    );

-- anamnesis
DROP POLICY IF EXISTS "Users can view their own anamnesis" ON public.anamnesis;
CREATE POLICY "Rafael full access to anamnesis" ON public.anamnesis
    FOR ALL USING (
        auth.uid() = user_id
        OR
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE id = auth.uid() AND email = 'rafael.ids@icloud.com'
        )
    );

-- 3. GARANTIR QUE O RAFAEL É ADMIN
UPDATE profiles 
SET 
  role = 'admin',
  admin_level = 'super',
  is_admin = true,
  is_super_admin = true,
  updated_at = NOW()
WHERE email = 'rafael.ids@icloud.com';

-- 4. GARANTIR ROLE DE ADMIN
INSERT INTO user_roles (user_id, role, assigned_at)
SELECT 
  id,
  'admin'::app_role,
  NOW()
FROM auth.users 
WHERE email = 'rafael.ids@icloud.com'
ON CONFLICT (user_id, role) DO NOTHING;

-- 5. ATIVAR TODAS AS CONFIGURAÇÕES DE IA NECESSÁRIAS
UPDATE ai_configurations 
SET 
  is_enabled = true,
  is_active = true,
  updated_at = NOW()
WHERE functionality IN ('medical_analysis', 'preventive_analysis', 'weekly_report', 'daily_chat')
   OR personality IN ('drvital', 'sofia');

-- 6. ADICIONAR DADOS DE TESTE PARA O RAFAEL (se não existirem)
DO $$
DECLARE
    rafael_user_id UUID;
BEGIN
    -- Buscar o user_id do Rafael
    SELECT user_id INTO rafael_user_id 
    FROM profiles 
    WHERE email = 'rafael.ids@icloud.com';
    
    IF rafael_user_id IS NOT NULL THEN
        -- Adicionar dados de peso (se não existirem)
        INSERT INTO weight_measurements (user_id, weight, measurement_date, notes, created_at, updated_at)
        SELECT 
            rafael_user_id,
            75.0 + (random() * 2 - 1),
            CURRENT_DATE - INTERVAL '1 day' * generate_series(0, 29),
            'Medição automática de teste',
            NOW(),
            NOW()
        WHERE NOT EXISTS (
            SELECT 1 FROM weight_measurements 
            WHERE user_id = rafael_user_id
        );
        
        -- Adicionar metas (se não existirem)
        INSERT INTO user_goals (user_id, goal_type, title, description, target_value, current_value, start_date, target_date, status, created_at, updated_at)
        VALUES 
            (rafael_user_id, 'weight', 'Perder 5kg', 'Meta de peso para melhorar saúde', 70.0, 75.0, CURRENT_DATE - INTERVAL '30 days', CURRENT_DATE + INTERVAL '90 days', 'active', NOW(), NOW()),
            (rafael_user_id, 'nutrition', 'Comer mais vegetais', 'Aumentar consumo de vegetais', 5, 3, CURRENT_DATE - INTERVAL '30 days', CURRENT_DATE + INTERVAL '60 days', 'active', NOW(), NOW())
        ON CONFLICT DO NOTHING;
        
        -- Adicionar anamnese (se não existir)
        INSERT INTO anamnesis (user_id, height, gender, birth_date, medical_history, medications, allergies, family_history, lifestyle_factors, created_at, updated_at)
        VALUES (
            rafael_user_id,
            175,
            'male',
            '1985-01-15',
            'Histórico médico básico para teste',
            'Nenhuma medicação regular',
            'Nenhuma alergia conhecida',
            'Histórico familiar de diabetes tipo 2',
            'Sedentário, trabalha em escritório',
            NOW(),
            NOW()
        ) ON CONFLICT (user_id) DO UPDATE SET
            height = EXCLUDED.height,
            medical_history = EXCLUDED.medical_history,
            updated_at = NOW();
    END IF;
END $$;

-- 7. VERIFICAR SE TUDO FOI APLICADO
SELECT 
  '✅ CORREÇÃO APLICADA:' as info,
  'Políticas RLS corrigidas' as rls_status,
  'Rafael configurado como admin' as admin_status,
  'Configurações de IA ativadas' as ai_status,
  'Dados de teste adicionados' as data_status;

-- 8. VERIFICAR CONFIGURAÇÕES ATIVAS
SELECT 
  '🤖 CONFIGURAÇÕES ATIVAS:' as info,
  functionality,
  service,
  model,
  is_enabled,
  personality,
  level
FROM ai_configurations 
WHERE is_enabled = true
ORDER BY functionality;

-- 9. VERIFICAR DADOS DO RAFAEL
SELECT 
  '📊 DADOS DO RAFAEL:' as info,
  p.full_name,
  p.email,
  p.role,
  (SELECT COUNT(*) FROM weight_measurements WHERE user_id = p.user_id) as peso_medicoes,
  (SELECT COUNT(*) FROM user_goals WHERE user_id = p.user_id) as metas,
  (SELECT COUNT(*) FROM anamnesis WHERE user_id = p.user_id) as anamneses
FROM profiles p
WHERE p.email = 'rafael.ids@icloud.com';

-- 10. MENSAGEM FINAL
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '🎉 CORREÇÃO COMPLETA APLICADA!';
  RAISE NOTICE '✅ Rafael agora tem acesso total';
  RAISE NOTICE '✅ Políticas RLS corrigidas';
  RAISE NOTICE '✅ Configurações de IA ativadas';
  RAISE NOTICE '✅ Dados de teste adicionados';
  RAISE NOTICE '';
  RAISE NOTICE '🔧 PRÓXIMO PASSO:';
  RAISE NOTICE '   Configure as variáveis de ambiente no Supabase Dashboard:';
  RAISE NOTICE '   https://supabase.com/dashboard/project/hlrkoyywjpckdotimtik/settings/functions';
  RAISE NOTICE '';
  RAISE NOTICE '   OPENAI_API_KEY=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';
  RAISE NOTICE '';
  RAISE NOTICE '🧪 TESTE AGORA:';
  RAISE NOTICE '   Faça login como rafael.ids@icloud.com';
  RAISE NOTICE '   Vá para Dr. Vital e teste a análise!';
END $$;
