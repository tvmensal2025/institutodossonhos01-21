-- 🔗 INTEGRAR PROFESSIONAL_EVALUATIONS COM DASHBOARD (CORRIGIDO)
-- Execute este script NO SUPABASE DASHBOARD SQL EDITOR

-- 1. Verificar estrutura atual da tabela weight_measurements
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'weight_measurements' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Adicionar colunas faltantes se necessário
ALTER TABLE weight_measurements 
ADD COLUMN IF NOT EXISTS circunferencia_abdominal_cm DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS device_type VARCHAR(50) DEFAULT 'manual',
ADD COLUMN IF NOT EXISTS notes TEXT;

-- 3. Criar função para sincronizar dados automaticamente (CORRIGIDA)
CREATE OR REPLACE FUNCTION sync_professional_evaluation_to_weight_measurements()
RETURNS TRIGGER AS $$
BEGIN
  -- Quando uma avaliação profissional é inserida, criar/atualizar weight_measurement
  INSERT INTO weight_measurements (
    user_id,
    peso_kg,
    circunferencia_abdominal_cm,
    measurement_date,
    imc,
    gordura_corporal_percent,
    massa_muscular_kg,
    agua_corporal_percent,
    metabolismo_basal_kcal,
    idade_metabolica,
    notes,
    device_type
  ) VALUES (
    NEW.user_id,
    NEW.weight_kg,
    NEW.abdominal_circumference_cm,
    NEW.evaluation_date,
    NEW.bmi,
    NEW.body_fat_percentage,
    NEW.muscle_mass_kg,
    NEW.total_body_water_percent,
    NEW.bmr_kcal,
    NEW.metabolic_age,
    CONCAT('Avaliação profissional - ', COALESCE(NEW.notes, 'Sem observações')),
    'professional_evaluation'
  )
  ON CONFLICT (user_id, measurement_date) 
  DO UPDATE SET
    peso_kg = EXCLUDED.peso_kg,
    circunferencia_abdominal_cm = EXCLUDED.circunferencia_abdominal_cm,
    imc = EXCLUDED.imc,
    gordura_corporal_percent = EXCLUDED.gordura_corporal_percent,
    massa_muscular_kg = EXCLUDED.massa_muscular_kg,
    agua_corporal_percent = EXCLUDED.agua_corporal_percent,
    metabolismo_basal_kcal = EXCLUDED.metabolismo_basal_kcal,
    idade_metabolica = EXCLUDED.idade_metabolica,
    notes = EXCLUDED.notes,
    device_type = EXCLUDED.device_type;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Criar trigger para sincronização automática
DROP TRIGGER IF EXISTS trigger_sync_professional_evaluation ON professional_evaluations;

CREATE TRIGGER trigger_sync_professional_evaluation
  AFTER INSERT OR UPDATE ON professional_evaluations
  FOR EACH ROW
  EXECUTE FUNCTION sync_professional_evaluation_to_weight_measurements();

-- 5. Criar função para sincronizar dados existentes (CORRIGIDA)
CREATE OR REPLACE FUNCTION sync_existing_professional_evaluations()
RETURNS INTEGER AS $$
DECLARE
  sync_count INTEGER := 0;
  eval_record RECORD;
BEGIN
  -- Sincronizar todas as avaliações profissionais existentes
  FOR eval_record IN 
    SELECT * FROM professional_evaluations 
    ORDER BY evaluation_date DESC
  LOOP
    INSERT INTO weight_measurements (
      user_id,
      peso_kg,
      circunferencia_abdominal_cm,
      measurement_date,
      imc,
      gordura_corporal_percent,
      massa_muscular_kg,
      agua_corporal_percent,
      metabolismo_basal_kcal,
      idade_metabolica,
      notes,
      device_type
    ) VALUES (
      eval_record.user_id,
      eval_record.weight_kg,
      eval_record.abdominal_circumference_cm,
      eval_record.evaluation_date,
      eval_record.bmi,
      eval_record.body_fat_percentage,
      eval_record.muscle_mass_kg,
      eval_record.total_body_water_percent,
      eval_record.bmr_kcal,
      eval_record.metabolic_age,
      CONCAT('Avaliação profissional sincronizada - ', COALESCE(eval_record.notes, 'Sem observações')),
      'professional_evaluation'
    )
    ON CONFLICT (user_id, measurement_date) 
    DO UPDATE SET
      peso_kg = EXCLUDED.peso_kg,
      circunferencia_abdominal_cm = EXCLUDED.circunferencia_abdominal_cm,
      imc = EXCLUDED.imc,
      gordura_corporal_percent = EXCLUDED.gordura_corporal_percent,
      massa_muscular_kg = EXCLUDED.massa_muscular_kg,
      agua_corporal_percent = EXCLUDED.agua_corporal_percent,
      metabolismo_basal_kcal = EXCLUDED.metabolismo_basal_kcal,
      idade_metabolica = EXCLUDED.idade_metabolica,
      notes = EXCLUDED.notes,
      device_type = EXCLUDED.device_type;
    
    sync_count := sync_count + 1;
  END LOOP;
  
  RETURN sync_count;
END;
$$ LANGUAGE plpgsql;

-- 6. Executar sincronização de dados existentes
SELECT sync_existing_professional_evaluations() as "Avaliações sincronizadas";

-- 7. Verificar resultado da sincronização
SELECT 
  'weight_measurements' as tabela,
  COUNT(*) as total_registros,
  COUNT(CASE WHEN device_type = 'professional_evaluation' THEN 1 END) as avaliacoes_profissionais
FROM weight_measurements
UNION ALL
SELECT 
  'professional_evaluations' as tabela,
  COUNT(*) as total_registros,
  COUNT(*) as avaliacoes_profissionais
FROM professional_evaluations;

-- 8. Mostrar dados sincronizados
SELECT 
  wm.user_id,
  wm.measurement_date,
  wm.peso_kg,
  wm.circunferencia_abdominal_cm,
  wm.imc,
  wm.gordura_corporal_percent,
  wm.device_type,
  wm.notes
FROM weight_measurements wm
WHERE wm.device_type = 'professional_evaluation'
ORDER BY wm.measurement_date DESC
LIMIT 10;

-- 9. Verificar se o trigger está funcionando
SELECT 
  trigger_name,
  event_manipulation,
  action_statement
FROM information_schema.triggers 
WHERE trigger_name = 'trigger_sync_professional_evaluation';

-- 10. Testar inserção de nova avaliação (opcional)
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
--   75.5,
--   85.0,
--   80.0,
--   95.0,
--   18.5,
--   14.0,
--   61.5,
--   58.0,
--   24.8,
--   1650,
--   0.45,
--   0.84,
--   4.1,
--   'low',
--   'Teste de integração automática corrigida',
--   '00000000-0000-0000-0000-000000000000'
-- );

-- 11. Verificar se a inserção foi sincronizada (descomente se executou o teste)
-- SELECT 
--   wm.measurement_date,
--   wm.peso_kg,
--   wm.circunferencia_abdominal_cm,
--   wm.device_type,
--   wm.notes
-- FROM weight_measurements wm
-- WHERE wm.notes LIKE '%Teste de integração automática corrigida%'
-- ORDER BY wm.created_at DESC
-- LIMIT 1;
