-- Script para aplicar políticas RLS na tabela professional_evaluations
-- Execute este script no dashboard do Supabase SQL Editor

-- 1. Primeiro, vamos verificar se a tabela existe
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'professional_evaluations'
) as table_exists;

-- 2. Verificar políticas existentes
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'professional_evaluations';

-- 3. Remover políticas existentes (se houver)
DROP POLICY IF EXISTS "Admins can create evaluations" ON professional_evaluations;
DROP POLICY IF EXISTS "Admins can view all evaluations" ON professional_evaluations;
DROP POLICY IF EXISTS "Users can view own evaluations" ON professional_evaluations;
DROP POLICY IF EXISTS "Admins can update evaluations" ON professional_evaluations;
DROP POLICY IF EXISTS "Admins can delete evaluations" ON professional_evaluations;

-- 4. Criar políticas mais permissivas para desenvolvimento
-- Política para permitir inserção por qualquer usuário autenticado (temporário)
CREATE POLICY "Allow authenticated insert" ON professional_evaluations
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Política para permitir visualização por qualquer usuário autenticado (temporário)
CREATE POLICY "Allow authenticated select" ON professional_evaluations
  FOR SELECT USING (auth.role() = 'authenticated');

-- Política para permitir atualização por qualquer usuário autenticado (temporário)
CREATE POLICY "Allow authenticated update" ON professional_evaluations
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Política para permitir exclusão por qualquer usuário autenticado (temporário)
CREATE POLICY "Allow authenticated delete" ON professional_evaluations
  FOR DELETE USING (auth.role() = 'authenticated');

-- 5. Verificar se as políticas foram criadas
SELECT 
  policyname,
  cmd,
  permissive
FROM pg_policies 
WHERE tablename = 'professional_evaluations'
ORDER BY policyname;

-- 6. Testar inserção (opcional - descomente para testar)
-- INSERT INTO professional_evaluations (
--   user_id,
--   evaluation_date,
--   weight_kg,
--   abdominal_circumference_cm,
--   waist_circumference_cm,
--   hip_circumference_cm,
--   body_fat_percentage,
--   fat_mass_kg,
--   lean_mass_kg,
--   muscle_mass_kg,
--   bmi,
--   bmr_kcal,
--   waist_to_height_ratio,
--   waist_to_hip_ratio,
--   muscle_to_fat_ratio,
--   risk_level,
--   notes,
--   evaluator_id
-- ) VALUES (
--   '00000000-0000-0000-0000-000000000000',
--   CURRENT_DATE,
--   75.0,
--   85.0,
--   80.0,
--   95.0,
--   18.5,
--   14.0,
--   61.0,
--   58.0,
--   24.8,
--   1650,
--   0.45,
--   0.84,
--   4.1,
--   'low',
--   'Teste de políticas RLS',
--   '00000000-0000-0000-0000-000000000000'
-- );

-- 7. Verificar dados inseridos (se o teste foi executado)
-- SELECT * FROM professional_evaluations ORDER BY created_at DESC LIMIT 5;
