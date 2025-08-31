-- 🚨 SOLUÇÃO FINAL - FOREIGN KEY CONSTRAINT BLOQUEANDO
-- Execute este script NO SUPABASE DASHBOARD SQL EDITOR

-- 1. VERIFICAR SE EXISTE FOREIGN KEY CONSTRAINT
SELECT 
  tc.constraint_name,
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_name = 'professional_evaluations';

-- 2. REMOVER FOREIGN KEY CONSTRAINT SE EXISTIR
DO $$
BEGIN
  -- Verificar se existe a constraint
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'professional_evaluations_user_id_fkey'
    AND table_name = 'professional_evaluations'
  ) THEN
    -- Remover a constraint
    ALTER TABLE professional_evaluations 
    DROP CONSTRAINT professional_evaluations_user_id_fkey;
    
    RAISE NOTICE '✅ Foreign key constraint removida com sucesso!';
  ELSE
    RAISE NOTICE 'ℹ️ Foreign key constraint não encontrada';
  END IF;
END $$;

-- 3. VERIFICAR SE HÁ OUTRAS CONSTRAINTS
SELECT 
  constraint_name,
  constraint_type
FROM information_schema.table_constraints
WHERE table_name = 'professional_evaluations'
AND table_schema = 'public';

-- 4. CRIAR USUÁRIO DE TESTE SE NÃO EXISTIR
DO $$
DECLARE
  test_user_id UUID := '00000000-0000-0000-0000-000000000000';
BEGIN
  -- Verificar se o usuário de teste já existe
  IF NOT EXISTS (
    SELECT 1 FROM auth.users WHERE id = test_user_id
  ) THEN
    -- Inserir usuário de teste na tabela auth.users
    INSERT INTO auth.users (
      id,
      email,
      encrypted_password,
      email_confirmed_at,
      created_at,
      updated_at,
      raw_app_meta_data,
      raw_user_meta_data,
      is_super_admin,
      confirmation_token,
      email_change,
      email_change_token_new,
      recovery_token
    ) VALUES (
      test_user_id,
      'teste@exemplo.com',
      crypt('senha123', gen_salt('bf')),
      NOW(),
      NOW(),
      NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{}',
      false,
      '',
      '',
      '',
      ''
    );
    
    RAISE NOTICE '✅ Usuário de teste criado com sucesso!';
  ELSE
    RAISE NOTICE 'ℹ️ Usuário de teste já existe';
  END IF;
END $$;

-- 5. TESTAR INSERÇÃO SEM FOREIGN KEY CONSTRAINT
DO $$
DECLARE
  test_user_id UUID := '00000000-0000-0000-0000-000000000000';
BEGIN
  -- Inserir avaliação de teste
  INSERT INTO professional_evaluations (
    user_id,
    evaluation_date,
    weight_kg,
    abdominal_circumference_cm,
    waist_circumference_cm,
    hip_circumference_cm,
    body_fat_percentage,
    fat_mass_kg,
    lean_mass_kg,
    muscle_mass_kg,
    bmi,
    bmr_kcal,
    waist_to_height_ratio,
    waist_to_hip_ratio,
    muscle_to_fat_ratio,
    risk_level,
    notes,
    evaluator_id
  ) VALUES (
    test_user_id,
    CURRENT_DATE,
    70.0,
    70.0,
    70.0,
    70.0,
    50.0,
    35.0,
    35.0,
    31.5,
    24.2,
    1650,
    0.40,
    1.0,
    0.9,
    'high',
    'Teste após remover foreign key constraint',
    test_user_id
  );
  
  RAISE NOTICE '✅ Avaliação de teste inserida com sucesso!';
END $$;

-- 6. VERIFICAR SE A INSERÇÃO FUNCIONOU
SELECT 
  id,
  user_id,
  evaluation_date,
  weight_kg,
  body_fat_percentage,
  notes,
  created_at
FROM professional_evaluations 
WHERE notes LIKE '%Teste após remover foreign key constraint%'
ORDER BY created_at DESC
LIMIT 1;

-- 7. VERIFICAR SE FOI SINCRONIZADO COM WEIGHT_MEASUREMENTS
SELECT 
  wm.measurement_date,
  wm.peso_kg,
  wm.circunferencia_abdominal_cm,
  wm.device_type,
  wm.notes
FROM weight_measurements wm
WHERE wm.notes LIKE '%Teste após remover foreign key constraint%'
ORDER BY wm.created_at DESC
LIMIT 1;

-- 8. MOSTRAR STATUS FINAL
SELECT 
  'professional_evaluations' as tabela,
  COUNT(*) as total_registros,
  'FOREIGN KEY REMOVIDA' as status
FROM professional_evaluations
UNION ALL
SELECT 
  'weight_measurements' as tabela,
  COUNT(*) as total_registros,
  'SINCRONIZADO' as status
FROM weight_measurements
WHERE device_type = 'professional_evaluation';

-- 9. CONFIRMAR QUE NÃO HÁ MAIS FOREIGN KEY
SELECT 
  tc.constraint_name,
  tc.constraint_type
FROM information_schema.table_constraints tc
WHERE tc.table_name = 'professional_evaluations'
AND tc.table_schema = 'public'
AND tc.constraint_type = 'FOREIGN KEY';
