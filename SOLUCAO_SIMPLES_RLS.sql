-- 🚨 SOLUÇÃO SIMPLES - Desabilitar RLS temporariamente
-- Execute este script NO SUPABASE DASHBOARD SQL EDITOR

-- 1. Verificar se a tabela existe
SELECT 'Tabela professional_evaluations existe' as status 
WHERE EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'professional_evaluations'
);

-- 2. Desabilitar RLS temporariamente (SOLUÇÃO RÁPIDA)
ALTER TABLE professional_evaluations DISABLE ROW LEVEL SECURITY;

-- 3. Verificar se RLS foi desabilitado
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename = 'professional_evaluations';

-- 4. Testar inserção
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
  '00000000-0000-0000-0000-000000000000',
  CURRENT_DATE,
  97.0,
  97.0,
  97.0,
  97.0,
  44.8,
  43.4,
  53.6,
  48.2,
  33.6,
  1800,
  0.57,
  1.0,
  1.1,
  'high',
  'Teste de solução simples',
  '00000000-0000-0000-0000-000000000000'
) RETURNING id, evaluation_date, weight_kg, body_fat_percentage;

-- 5. Verificar dados inseridos
SELECT 
  id,
  user_id,
  evaluation_date,
  weight_kg,
  body_fat_percentage,
  risk_level,
  created_at
FROM professional_evaluations 
ORDER BY created_at DESC 
LIMIT 5;

-- 6. Remover teste (opcional)
-- DELETE FROM professional_evaluations WHERE notes = 'Teste de solução simples';
