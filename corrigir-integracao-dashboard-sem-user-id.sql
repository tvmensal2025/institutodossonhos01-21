-- 🔗 INTEGRAR PROFESSIONAL_EVALUATIONS COM DASHBOARD (SEM USER_ID ESPECÍFICO)
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

-- 3. Criar constraint única para evitar duplicatas (se não existir)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'weight_measurements_user_date_unique'
  ) THEN
    ALTER TABLE weight_measurements 
    ADD CONSTRAINT weight_measurements_user_date_unique 
    UNIQUE (user_id, measurement_date);
  END IF;
END $$;

-- 4. Verificar se há usuários válidos
SELECT 'Usuários válidos' as status, COUNT(*) as total
FROM auth.users
WHERE id IS NOT NULL;

-- 5. Verificar avaliações profissionais existentes
SELECT 'Avaliações profissionais' as status, COUNT(*) as total
FROM professional_evaluations;

-- 6. Mostrar alguns usuários válidos (para referência)
SELECT id, email, created_at
FROM auth.users
ORDER BY created_at DESC
LIMIT 5;

-- 7. Criar função para sincronizar dados automaticamente (COM VERIFICAÇÃO DE USER_ID)
CREATE OR REPLACE FUNCTION sync_professional_evaluation_to_weight_measurements()
RETURNS TRIGGER AS $$
BEGIN
  -- Verificar se o user_id existe na tabela auth.users
  IF NOT EXISTS (
    SELECT 1 FROM auth.users 
    WHERE id = NEW.user_id
  ) THEN
    -- Se o user_id não existe, não fazer nada (evitar erro)
    RAISE NOTICE 'User ID % não existe em auth.users, pulando sincronização', NEW.user_id;
    RETURN NEW;
  END IF;

  -- Verificar se já existe registro para esta data
  IF EXISTS (
    SELECT 1 FROM weight_measurements 
    WHERE user_id = NEW.user_id 
    AND measurement_date = NEW.evaluation_date
  ) THEN
    -- Atualizar registro existente
    UPDATE weight_measurements SET
      peso_kg = NEW.weight_kg,
      circunferencia_abdominal_cm = NEW.abdominal_circumference_cm,
      imc = NEW.bmi,
      gordura_corporal_percent = NEW.body_fat_percentage,
      massa_muscular_kg = NEW.muscle_mass_kg,
      agua_corporal_percent = NEW.total_body_water_percent,
      metabolismo_basal_kcal = NEW.bmr_kcal,
      idade_metabolica = NEW.metabolic_age,
      notes = CONCAT('Avaliação profissional - ', COALESCE(NEW.notes, 'Sem observações')),
      device_type = 'professional_evaluation'
    WHERE user_id = NEW.user_id 
    AND measurement_date = NEW.evaluation_date;
  ELSE
    -- Inserir novo registro
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
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 8. Criar trigger para sincronização automática
DROP TRIGGER IF EXISTS trigger_sync_professional_evaluation ON professional_evaluations;

CREATE TRIGGER trigger_sync_professional_evaluation
  AFTER INSERT OR UPDATE ON professional_evaluations
  FOR EACH ROW
  EXECUTE FUNCTION sync_professional_evaluation_to_weight_measurements();

-- 9. Criar função para sincronizar dados existentes (COM VERIFICAÇÃO DE USER_ID)
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
    -- Verificar se o user_id existe na tabela auth.users
    IF EXISTS (
      SELECT 1 FROM auth.users 
      WHERE id = eval_record.user_id
    ) THEN
      -- Verificar se já existe registro para esta data
      IF EXISTS (
        SELECT 1 FROM weight_measurements 
        WHERE user_id = eval_record.user_id 
        AND measurement_date = eval_record.evaluation_date
      ) THEN
        -- Atualizar registro existente
        UPDATE weight_measurements SET
          peso_kg = eval_record.weight_kg,
          circunferencia_abdominal_cm = eval_record.abdominal_circumference_cm,
          imc = eval_record.bmi,
          gordura_corporal_percent = eval_record.body_fat_percentage,
          massa_muscular_kg = eval_record.muscle_mass_kg,
          agua_corporal_percent = eval_record.total_body_water_percent,
          metabolismo_basal_kcal = eval_record.bmr_kcal,
          idade_metabolica = eval_record.metabolic_age,
          notes = CONCAT('Avaliação profissional sincronizada - ', COALESCE(eval_record.notes, 'Sem observações')),
          device_type = 'professional_evaluation'
        WHERE user_id = eval_record.user_id 
        AND measurement_date = eval_record.evaluation_date;
      ELSE
        -- Inserir novo registro
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
        );
      END IF;
      
      sync_count := sync_count + 1;
    ELSE
      -- Log do user_id inválido
      RAISE NOTICE 'User ID % não existe em auth.users, pulando avaliação', eval_record.user_id;
    END IF;
  END LOOP;
  
  RETURN sync_count;
END;
$$ LANGUAGE plpgsql;

-- 10. Executar sincronização de dados existentes
SELECT sync_existing_professional_evaluations() as "Avaliações sincronizadas";

-- 11. Verificar resultado da sincronização
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

-- 12. Mostrar dados sincronizados
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

-- 13. Verificar se o trigger está funcionando
SELECT 
  trigger_name,
  event_manipulation,
  action_statement
FROM information_schema.triggers 
WHERE trigger_name = 'trigger_sync_professional_evaluation';

-- 14. Testar inserção de nova avaliação (usando um user_id válido)
-- Primeiro, pegar um user_id válido
DO $$
DECLARE
  valid_user_id UUID;
BEGIN
  -- Pegar o primeiro user_id válido
  SELECT id INTO valid_user_id 
  FROM auth.users 
  LIMIT 1;
  
  IF valid_user_id IS NOT NULL THEN
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
      valid_user_id,
      CURRENT_DATE,
      75.5,
      85.0,
      80.0,
      95.0,
      18.5,
      14.0,
      61.5,
      58.0,
      24.8,
      1650,
      0.45,
      0.84,
      4.1,
      'low',
      'Teste de integração automática com user_id válido',
      valid_user_id
    );
    
    RAISE NOTICE 'Avaliação de teste inserida com user_id: %', valid_user_id;
  ELSE
    RAISE NOTICE 'Nenhum usuário válido encontrado para teste';
  END IF;
END $$;

-- 15. Verificar se a inserção foi sincronizada
SELECT 
  wm.measurement_date,
  wm.peso_kg,
  wm.circunferencia_abdominal_cm,
  wm.device_type,
  wm.notes
FROM weight_measurements wm
WHERE wm.notes LIKE '%Teste de integração automática com user_id válido%'
ORDER BY wm.created_at DESC
LIMIT 1;
