-- 🔥 CORREÇÃO URGENTE - Políticas RLS para professional_evaluations
-- Execute este script NO SUPABASE DASHBOARD SQL EDITOR

-- 1. Verificar tabela
SELECT 'Tabela professional_evaluations existe' as status 
WHERE EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'professional_evaluations'
);

-- 2. Remover TODAS as políticas existentes
DROP POLICY IF EXISTS "Admins can create evaluations" ON professional_evaluations;
DROP POLICY IF EXISTS "Admins can view all evaluations" ON professional_evaluations;
DROP POLICY IF EXISTS "Users can view own evaluations" ON professional_evaluations;
DROP POLICY IF EXISTS "Admins can update evaluations" ON professional_evaluations;
DROP POLICY IF EXISTS "Admins can delete evaluations" ON professional_evaluations;
DROP POLICY IF EXISTS "Allow authenticated insert" ON professional_evaluations;
DROP POLICY IF EXISTS "Allow authenticated select" ON professional_evaluations;
DROP POLICY IF EXISTS "Allow authenticated update" ON professional_evaluations;
DROP POLICY IF EXISTS "Allow authenticated delete" ON professional_evaluations;

-- 3. Criar políticas PERMISSIVAS para desenvolvimento
-- Política para INSERÇÃO - qualquer usuário autenticado
CREATE POLICY "Enable insert for authenticated users" ON professional_evaluations
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Política para SELEÇÃO - qualquer usuário autenticado
CREATE POLICY "Enable select for authenticated users" ON professional_evaluations
  FOR SELECT USING (auth.role() = 'authenticated');

-- Política para ATUALIZAÇÃO - qualquer usuário autenticado
CREATE POLICY "Enable update for authenticated users" ON professional_evaluations
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Política para EXCLUSÃO - qualquer usuário autenticado
CREATE POLICY "Enable delete for authenticated users" ON professional_evaluations
  FOR DELETE USING (auth.role() = 'authenticated');

-- 4. Verificar políticas criadas
SELECT 
  policyname,
  cmd,
  permissive,
  roles
FROM pg_policies 
WHERE tablename = 'professional_evaluations'
ORDER BY policyname;

-- 5. Testar inserção (descomente para testar)
/*
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
  'Teste de correção urgente',
  '00000000-0000-0000-0000-000000000000'
) RETURNING id, evaluation_date, weight_kg, body_fat_percentage;
*/

-- 6. Verificar dados existentes
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
LIMIT 10;
