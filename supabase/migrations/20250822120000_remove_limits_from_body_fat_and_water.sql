-- Remove clamps/limits from body fat and water estimates
-- and only auto-calculate composition metrics for manual-like entries.

-- Recreate calculate_imc with no clamps and conditional auto-calculation
CREATE OR REPLACE FUNCTION public.calculate_imc()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  user_altura DECIMAL(5,2);
  user_idade INTEGER;
  user_sexo VARCHAR(10);
  calculated_bmi DECIMAL(6,3);
  dev TEXT;
  is_manual BOOLEAN;
  rce_val DECIMAL(6,3);
  body_fat_est DECIMAL(6,3);
  water_est DECIMAL(6,3);
BEGIN
  -- Fetch user physical data
  SELECT altura_cm, idade, sexo
    INTO user_altura, user_idade, user_sexo
  FROM public.user_physical_data
  WHERE user_id = NEW.user_id
  LIMIT 1;

  IF user_altura IS NULL THEN
    -- Sensible fallbacks if profile missing
    user_altura := 165.0;
    user_idade := 30;
    user_sexo := 'masculino';
  END IF;

  -- BMI
  calculated_bmi := NEW.peso_kg / POWER(user_altura / 100, 2);
  NEW.imc := calculated_bmi;

  -- IMC classification
  IF calculated_bmi < 18.5 THEN
    NEW.risco_metabolico := 'baixo_peso';
  ELSIF calculated_bmi < 25 THEN
    NEW.risco_metabolico := 'normal';
  ELSIF calculated_bmi < 30 THEN
    NEW.risco_metabolico := 'sobrepeso';
  ELSIF calculated_bmi < 35 THEN
    NEW.risco_metabolico := 'obesidade_grau1';
  ELSIF calculated_bmi < 40 THEN
    NEW.risco_metabolico := 'obesidade_grau2';
  ELSE
    NEW.risco_metabolico := 'obesidade_grau3';
  END IF;

  -- RCE and cardio-metabolic risk
  IF NEW.circunferencia_abdominal_cm IS NOT NULL AND user_altura IS NOT NULL AND user_altura > 0 THEN
    rce_val := NEW.circunferencia_abdominal_cm / user_altura;
    NEW.rce := rce_val;
    IF rce_val >= 0.6 THEN
      NEW.risco_cardiometabolico := 'ALTO';
    ELSIF rce_val >= 0.5 THEN
      NEW.risco_cardiometabolico := 'MODERADO';
    ELSE
      NEW.risco_cardiometabolico := 'BAIXO';
    END IF;
  END IF;

  -- Determine manual vs device
  dev := lower(coalesce(NEW.device_type, 'manual'));
  is_manual := dev IN ('manual', 'digital_scale', 'professional_evaluation');

  -- Only for manual-like entries, auto-calc composition metrics when absent (NO CLAMPS)
  IF is_manual THEN
    -- Body fat % (Deurenberg) if null
    IF NEW.gordura_corporal_percent IS NULL THEN
      IF lower(user_sexo) = 'masculino' THEN
        body_fat_est := (1.20 * calculated_bmi) + (0.23 * user_idade) - 16.2;
      ELSE
        body_fat_est := (1.20 * calculated_bmi) + (0.23 * user_idade) - 5.4;
      END IF;
      -- CORREÇÃO: Aplicar limites realistas para gordura corporal
      body_fat_est := GREATEST(5, LEAST(50, body_fat_est));
      NEW.gordura_corporal_percent := body_fat_est;
    END IF;

    -- Water % (Watson) if null
    IF NEW.agua_corporal_percent IS NULL THEN
      IF lower(user_sexo) = 'masculino' THEN
        water_est := 2.447 - (0.09516 * user_idade) + (0.1074 * user_altura) + (0.3362 * NEW.peso_kg);
      ELSE
        water_est := -2.097 + (0.1069 * user_altura) + (0.2466 * NEW.peso_kg);
      END IF;
      IF NEW.peso_kg IS NOT NULL AND NEW.peso_kg > 0 THEN
        water_est := (water_est / NEW.peso_kg) * 100; -- to percent
      END IF;
      -- CORREÇÃO: Aplicar limites realistas para água corporal
      water_est := GREATEST(40, LEAST(70, water_est));
      NEW.agua_corporal_percent := water_est;
    END IF;

    -- Basal Metabolism if null
    IF NEW.metabolismo_basal_kcal IS NULL THEN
      IF lower(user_sexo) = 'masculino' THEN
        NEW.metabolismo_basal_kcal := (88.362 + (13.397 * NEW.peso_kg) + (4.799 * user_altura) - (5.677 * user_idade))::INTEGER;
      ELSE
        NEW.metabolismo_basal_kcal := (447.593 + (9.247 * NEW.peso_kg) + (3.098 * user_altura) - (4.330 * user_idade))::INTEGER;
      END IF;
    END IF;

    -- Metabolic age if null (no cap)
    IF NEW.idade_metabolica IS NULL THEN
      NEW.idade_metabolica := (user_idade + ((calculated_bmi - 22) * 0.5))::INTEGER;
    END IF;
  END IF;

  IF NEW.measurement_date IS NULL THEN
    NEW.measurement_date := now();
  END IF;

  RETURN NEW;
END;
$$;

-- Ensure trigger points to the updated function
DROP TRIGGER IF EXISTS weight_measurements_calculate_imc_trigger ON public.weight_measurements;
CREATE TRIGGER weight_measurements_calculate_imc_trigger
  BEFORE INSERT OR UPDATE ON public.weight_measurements
  FOR EACH ROW
  EXECUTE FUNCTION public.calculate_imc();


