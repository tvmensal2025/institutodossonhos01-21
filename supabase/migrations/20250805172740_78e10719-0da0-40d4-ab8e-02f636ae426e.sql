-- Fix and enhance the weight measurement system for accurate calculations

-- First, let's fix the calculate_imc function to be more robust
CREATE OR REPLACE FUNCTION public.calculate_imc()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  user_altura DECIMAL(5,2);
  calculated_bmi DECIMAL(4,2);
  calculated_body_fat DECIMAL(4,2);
  calculated_water DECIMAL(4,2);
  user_idade INTEGER;
  user_sexo VARCHAR(10);
BEGIN
  -- Buscar dados físicos do usuário
  SELECT altura_cm, idade, sexo INTO user_altura, user_idade, user_sexo
  FROM user_physical_data 
  WHERE user_id = NEW.user_id;
  
  -- Se não encontrou dados físicos, criar dados padrão ou falhar graciosamente
  IF user_altura IS NULL THEN
    -- Log do problema
    RAISE NOTICE 'Dados físicos não encontrados para usuário %, usando altura padrão', NEW.user_id;
    -- Usar altura padrão de 165cm se não estiver especificada
    user_altura := 165.0;
    user_idade := 30;
    user_sexo := 'masculino';
  END IF;
  
  -- Calcular IMC: peso / (altura/100)²
  calculated_bmi := NEW.peso_kg / POWER(user_altura / 100, 2);
  NEW.imc := calculated_bmi;
  
  -- Calcular risco metabólico baseado no IMC
  IF calculated_bmi < 18.5 THEN
    NEW.risco_metabolico = 'baixo_peso';
  ELSIF calculated_bmi >= 18.5 AND calculated_bmi < 25 THEN
    NEW.risco_metabolico = 'normal';
  ELSIF calculated_bmi >= 25 AND calculated_bmi < 30 THEN
    NEW.risco_metabolico = 'sobrepeso';
  ELSIF calculated_bmi >= 30 AND calculated_bmi < 35 THEN
    NEW.risco_metabolico = 'obesidade_grau1';
  ELSIF calculated_bmi >= 35 AND calculated_bmi < 40 THEN
    NEW.risco_metabolico = 'obesidade_grau2';
  ELSE
    NEW.risco_metabolico = 'obesidade_grau3';
  END IF;
  
  -- Se não há dados específicos de composição corporal, calcular estimativas
  -- Fórmulas científicamente validadas para estimativa de gordura corporal
  
  -- Estimativa de percentual de gordura corporal (Fórmula Deurenberg)
  IF NEW.gordura_corporal_percent IS NULL OR NEW.gordura_corporal_percent = 0 THEN
    IF user_sexo = 'masculino' THEN
      calculated_body_fat := (1.20 * calculated_bmi) + (0.23 * user_idade) - 16.2;
    ELSE
      calculated_body_fat := (1.20 * calculated_bmi) + (0.23 * user_idade) - 5.4;
    END IF;
    
    -- Limitar valores realistas (5% a 50%)
    calculated_body_fat := GREATEST(5.0, LEAST(50.0, calculated_body_fat));
    NEW.gordura_corporal_percent := calculated_body_fat;
  END IF;
  
  -- Estimativa de percentual de água corporal
  IF NEW.agua_corporal_percent IS NULL OR NEW.agua_corporal_percent = 0 THEN
    -- Fórmula Watson para água corporal total
    IF user_sexo = 'masculino' THEN
      calculated_water := 2.447 - (0.09516 * user_idade) + (0.1074 * user_altura) + (0.3362 * NEW.peso_kg);
      calculated_water := (calculated_water / NEW.peso_kg) * 100; -- Converter para percentual
    ELSE
      calculated_water := -2.097 + (0.1069 * user_altura) + (0.2466 * NEW.peso_kg);
      calculated_water := (calculated_water / NEW.peso_kg) * 100; -- Converter para percentual
    END IF;
    
    -- Limitar valores realistas (45% a 75%)
    calculated_water := GREATEST(45.0, LEAST(75.0, calculated_water));
    NEW.agua_corporal_percent := calculated_water;
  END IF;
  
  -- Estimativa de massa muscular se não informada
  IF NEW.massa_muscular_kg IS NULL OR NEW.massa_muscular_kg = 0 THEN
    -- Massa muscular = Peso total - (Peso * % gordura / 100) - massa óssea estimada
    NEW.massa_muscular_kg := NEW.peso_kg - (NEW.peso_kg * COALESCE(NEW.gordura_corporal_percent, calculated_body_fat) / 100) - COALESCE(NEW.osso_kg, NEW.peso_kg * 0.15);
    -- Garantir valores positivos
    NEW.massa_muscular_kg := GREATEST(10.0, NEW.massa_muscular_kg);
  END IF;
  
  -- Estimativa de metabolismo basal (Harris-Benedict atualizada)
  IF NEW.metabolismo_basal_kcal IS NULL OR NEW.metabolismo_basal_kcal = 0 THEN
    IF user_sexo = 'masculino' THEN
      NEW.metabolismo_basal_kcal := (88.362 + (13.397 * NEW.peso_kg) + (4.799 * user_altura) - (5.677 * user_idade))::INTEGER;
    ELSE
      NEW.metabolismo_basal_kcal := (447.593 + (9.247 * NEW.peso_kg) + (3.098 * user_altura) - (4.330 * user_idade))::INTEGER;
    END IF;
  END IF;
  
  -- Estimativa de idade metabólica
  IF NEW.idade_metabolica IS NULL OR NEW.idade_metabolica = 0 THEN
    -- Baseada no IMC e composição corporal
    NEW.idade_metabolica := user_idade + ((calculated_bmi - 22) * 0.5)::INTEGER;
    NEW.idade_metabolica := GREATEST(18, LEAST(80, NEW.idade_metabolica));
  END IF;
  
  -- Garantir que measurement_date está definida
  IF NEW.measurement_date IS NULL THEN
    NEW.measurement_date := NOW();
  END IF;
  
  RETURN NEW;
END;
$$;

-- Recriar o trigger
DROP TRIGGER IF EXISTS weight_measurements_calculate_imc_trigger ON weight_measurements;
CREATE TRIGGER weight_measurements_calculate_imc_trigger
    BEFORE INSERT OR UPDATE ON weight_measurements
    FOR EACH ROW
    EXECUTE FUNCTION calculate_imc();

-- Função para calcular circunferência da cintura para riscos metabólicos
CREATE OR REPLACE FUNCTION public.calculate_waist_risk(waist_cm DECIMAL, gender VARCHAR)
RETURNS VARCHAR
LANGUAGE plpgsql
AS $$
BEGIN
  IF waist_cm IS NULL THEN
    RETURN 'desconhecido';
  END IF;
  
  IF gender = 'masculino' THEN
    IF waist_cm >= 102 THEN
      RETURN 'alto_risco';
    ELSIF waist_cm >= 94 THEN
      RETURN 'risco_moderado';
    ELSE
      RETURN 'baixo_risco';
    END IF;
  ELSE -- feminino
    IF waist_cm >= 88 THEN
      RETURN 'alto_risco';
    ELSIF waist_cm >= 80 THEN
      RETURN 'risco_moderado';
    ELSE
      RETURN 'baixo_risco';
    END IF;
  END IF;
END;
$$;

-- Função para gerar relatório completo de pesagem
CREATE OR REPLACE FUNCTION public.generate_weighing_report(measurement_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
  measurement_data RECORD;
  physical_data RECORD;
  waist_risk VARCHAR;
  result JSONB;
BEGIN
  -- Buscar dados da medição
  SELECT * INTO measurement_data
  FROM weight_measurements
  WHERE id = measurement_id;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('error', 'Medição não encontrada');
  END IF;
  
  -- Buscar dados físicos do usuário
  SELECT * INTO physical_data
  FROM user_physical_data
  WHERE user_id = measurement_data.user_id;
  
  -- Calcular risco da circunferência da cintura
  waist_risk := calculate_waist_risk(measurement_data.circunferencia_abdominal_cm, physical_data.sexo);
  
  -- Montar relatório completo
  result := jsonb_build_object(
    'measurement_id', measurement_id,
    'measurement_date', measurement_data.measurement_date,
    'basic_data', jsonb_build_object(
      'weight_kg', measurement_data.peso_kg,
      'height_cm', physical_data.altura_cm,
      'age', physical_data.idade,
      'gender', physical_data.sexo,
      'waist_circumference_cm', measurement_data.circunferencia_abdominal_cm
    ),
    'calculated_indicators', jsonb_build_object(
      'bmi', measurement_data.imc,
      'bmi_category', measurement_data.risco_metabolico,
      'body_fat_percent', measurement_data.gordura_corporal_percent,
      'muscle_mass_kg', measurement_data.massa_muscular_kg,
      'water_percent', measurement_data.agua_corporal_percent,
      'bone_mass_kg', measurement_data.osso_kg,
      'basal_metabolism_kcal', measurement_data.metabolismo_basal_kcal,
      'metabolic_age', measurement_data.idade_metabolica
    ),
    'risk_assessment', jsonb_build_object(
      'metabolic_risk', measurement_data.risco_metabolico,
      'waist_risk', waist_risk,
      'overall_health_score', COALESCE(measurement_data.overall_health_score, 75)
    ),
    'recommendations', jsonb_build_object(
      'calorie_goal', measurement_data.metabolismo_basal_kcal * 1.2,
      'water_goal_ml', measurement_data.peso_kg * 35,
      'protein_goal_g', measurement_data.peso_kg * 1.2
    )
  );
  
  RETURN result;
END;
$$;

-- Atualizar dados existentes com cálculos corretos (apenas onde IMC = 0)
UPDATE weight_measurements 
SET imc = peso_kg / POWER((
  SELECT altura_cm / 100 
  FROM user_physical_data 
  WHERE user_physical_data.user_id = weight_measurements.user_id
  LIMIT 1
), 2)
WHERE imc = 0 OR imc IS NULL;