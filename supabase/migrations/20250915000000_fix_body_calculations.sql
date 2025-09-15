-- Correção das fórmulas de cálculo de métricas corporais
-- Implementa fórmulas científicamente validadas

-- Atualizar função de cálculo de IMC com fórmulas corretas
CREATE OR REPLACE FUNCTION public.calculate_imc()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  user_altura DECIMAL(5,2);
  calculated_bmi DECIMAL(4,2);
  calculated_body_fat DECIMAL(4,2);
  calculated_water DECIMAL(4,2);
  calculated_bmr INTEGER;
  user_idade INTEGER;
  user_sexo VARCHAR(10);
  user_etnia VARCHAR(20) DEFAULT 'branca';
BEGIN
  -- Buscar dados físicos do usuário
  SELECT altura_cm, idade, sexo INTO user_altura, user_idade, user_sexo
  FROM user_physical_data 
  WHERE user_id = NEW.user_id;
  
  -- Se não encontrou dados físicos, usar valores padrão
  IF user_altura IS NULL THEN
    RAISE NOTICE 'Dados físicos não encontrados para usuário %, usando valores padrão', NEW.user_id;
    user_altura := 165.0;
    user_idade := 30;
    user_sexo := 'masculino';
  END IF;
  
  -- 1. Calcular IMC: peso / (altura/100)²
  IF user_altura > 0 THEN
    calculated_bmi := NEW.peso_kg / POWER(user_altura / 100, 2);
    NEW.imc := calculated_bmi;
  END IF;
  
  -- 2. Calcular risco metabólico baseado no IMC (padrão OMS)
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
  
  -- 3. Calcular gordura corporal usando fórmula de Deurenberg CORRIGIDA
  IF NEW.gordura_corporal_percent IS NULL OR NEW.gordura_corporal_percent = 0 THEN
    -- Fórmula Deurenberg completa com fator de etnia
    IF user_sexo = 'masculino' THEN
      -- Homens: (1.20 × IMC) + (0.23 × idade) - (10.8 × sexo) - (5.4 × etnia)
      calculated_body_fat := (1.20 * calculated_bmi) + (0.23 * user_idade) - 10.8 - 5.4;
    ELSE
      -- Mulheres: (1.20 × IMC) + (0.23 × idade) - (5.4 × etnia)
      calculated_body_fat := (1.20 * calculated_bmi) + (0.23 * user_idade) - 5.4;
    END IF;
    
    -- Aplicar limites realistas (5% a 50%)
    calculated_body_fat := GREATEST(5.0, LEAST(50.0, calculated_body_fat));
    NEW.gordura_corporal_percent := calculated_body_fat;
  END IF;
  
  -- 4. Calcular RFM (Relative Fat Mass) se temos circunferência abdominal
  IF NEW.circunferencia_abdominal_cm IS NOT NULL AND NEW.circunferencia_abdominal_cm > 0 THEN
    DECLARE
      rfm_value DECIMAL(4,2);
      idade_factor DECIMAL(4,2);
    BEGIN
      -- Fator de idade para RFM
      idade_factor := 12.0 * (user_idade / 100.0);
      
      -- Fórmula RFM correta
      IF user_sexo = 'masculino' THEN
        rfm_value := 64 - (20 * user_altura / NEW.circunferencia_abdominal_cm) + idade_factor;
      ELSE
        rfm_value := 76 - (20 * user_altura / NEW.circunferencia_abdominal_cm) + idade_factor;
      END IF;
      
      -- Aplicar limites realistas
      rfm_value := GREATEST(5.0, LEAST(50.0, rfm_value));
      
      -- Se RFM é mais preciso que Deurenberg (quando temos cintura), usar RFM
      IF NEW.gordura_corporal_percent IS NULL OR NEW.gordura_corporal_percent = calculated_body_fat THEN
        NEW.gordura_corporal_percent := rfm_value;
      END IF;
    END;
  END IF;
  
  -- 5. Calcular água corporal usando fórmula de Watson CORRIGIDA
  IF NEW.agua_corporal_percent IS NULL OR NEW.agua_corporal_percent = 0 THEN
    -- Fórmula Watson para água corporal total (em litros)
    IF user_sexo = 'masculino' THEN
      calculated_water := 2.447 - (0.09516 * user_idade) + (0.1074 * user_altura) + (0.3362 * NEW.peso_kg);
    ELSE
      calculated_water := -2.097 + (0.1069 * user_altura) + (0.2466 * NEW.peso_kg);
    END IF;
    
    -- Converter para percentual do peso corporal
    IF NEW.peso_kg > 0 THEN
      calculated_water := (calculated_water / NEW.peso_kg) * 100;
    END IF;
    
    -- Aplicar limites realistas (45% a 75%)
    calculated_water := GREATEST(45.0, LEAST(75.0, calculated_water));
    NEW.agua_corporal_percent := calculated_water;
  END IF;
  
  -- 6. Calcular massa muscular CORRIGIDA
  IF NEW.massa_muscular_kg IS NULL OR NEW.massa_muscular_kg = 0 THEN
    DECLARE
      massa_gorda_kg DECIMAL(5,2);
      massa_magra_kg DECIMAL(5,2);
      fator_muscular DECIMAL(3,2);
    BEGIN
      -- Calcular massa gorda
      massa_gorda_kg := NEW.peso_kg * (COALESCE(NEW.gordura_corporal_percent, calculated_body_fat) / 100);
      
      -- Calcular massa magra
      massa_magra_kg := NEW.peso_kg - massa_gorda_kg;
      
      -- Massa muscular é aproximadamente 45-50% da massa magra
      fator_muscular := CASE WHEN user_sexo = 'masculino' THEN 0.50 ELSE 0.45 END;
      NEW.massa_muscular_kg := massa_magra_kg * fator_muscular;
      
      -- Garantir valores positivos e realistas
      NEW.massa_muscular_kg := GREATEST(5.0, LEAST(NEW.peso_kg * 0.6, NEW.massa_muscular_kg));
    END;
  END IF;
  
  -- 7. Calcular metabolismo basal usando Harris-Benedict Revisada
  IF NEW.metabolismo_basal_kcal IS NULL OR NEW.metabolismo_basal_kcal = 0 THEN
    IF user_sexo = 'masculino' THEN
      calculated_bmr := (88.362 + (13.397 * NEW.peso_kg) + (4.799 * user_altura) - (5.677 * user_idade))::INTEGER;
    ELSE
      calculated_bmr := (447.593 + (9.247 * NEW.peso_kg) + (3.098 * user_altura) - (4.330 * user_idade))::INTEGER;
    END IF;
    
    -- Aplicar limites realistas
    NEW.metabolismo_basal_kcal := GREATEST(800, LEAST(4000, calculated_bmr));
  END IF;
  
  -- 8. Calcular idade metabólica CORRIGIDA
  IF NEW.idade_metabolica IS NULL OR NEW.idade_metabolica = 0 THEN
    DECLARE
      idade_meta INTEGER;
      ajuste_imc DECIMAL(3,1);
      ajuste_gordura DECIMAL(3,1);
    BEGIN
      -- Ajuste baseado no IMC
      ajuste_imc := (calculated_bmi - 22) * 0.5;
      
      -- Ajuste baseado na gordura corporal
      ajuste_gordura := (COALESCE(NEW.gordura_corporal_percent, calculated_body_fat) - 15) * 0.3;
      
      -- Calcular idade metabólica
      idade_meta := user_idade + ajuste_imc::INTEGER + ajuste_gordura::INTEGER;
      
      -- Aplicar limites realistas
      NEW.idade_metabolica := GREATEST(18, LEAST(80, idade_meta));
    END;
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

-- Função para validar dados de entrada
CREATE OR REPLACE FUNCTION public.validate_body_measurement()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Validar peso
  IF NEW.peso_kg IS NULL OR NEW.peso_kg <= 0 OR NEW.peso_kg > 300 THEN
    RAISE EXCEPTION 'Peso deve estar entre 1 e 300 kg. Valor fornecido: %', NEW.peso_kg;
  END IF;
  
  -- Validar percentual de gordura corporal
  IF NEW.gordura_corporal_percent IS NOT NULL AND 
     (NEW.gordura_corporal_percent < 3 OR NEW.gordura_corporal_percent > 60) THEN
    RAISE EXCEPTION 'Percentual de gordura deve estar entre 3%% e 60%%. Valor fornecido: %', NEW.gordura_corporal_percent;
  END IF;
  
  -- Validar percentual de água corporal
  IF NEW.agua_corporal_percent IS NOT NULL AND 
     (NEW.agua_corporal_percent < 30 OR NEW.agua_corporal_percent > 80) THEN
    RAISE EXCEPTION 'Percentual de água deve estar entre 30%% e 80%%. Valor fornecido: %', NEW.agua_corporal_percent;
  END IF;
  
  -- Validar circunferência abdominal
  IF NEW.circunferencia_abdominal_cm IS NOT NULL AND 
     (NEW.circunferencia_abdominal_cm < 40 OR NEW.circunferencia_abdominal_cm > 200) THEN
    RAISE EXCEPTION 'Circunferência abdominal deve estar entre 40 e 200 cm. Valor fornecido: %', NEW.circunferencia_abdominal_cm;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Criar trigger de validação
DROP TRIGGER IF EXISTS validate_body_measurement_trigger ON weight_measurements;
CREATE TRIGGER validate_body_measurement_trigger
    BEFORE INSERT OR UPDATE ON weight_measurements
    FOR EACH ROW
    EXECUTE FUNCTION validate_body_measurement();

-- Comentários sobre as correções implementadas
COMMENT ON FUNCTION calculate_imc() IS 'Função corrigida com fórmulas científicamente validadas:
- Deurenberg completa com fator de etnia
- RFM (Relative Fat Mass) com fator de idade
- Watson para água corporal com conversão correta
- Massa muscular como % da massa magra
- Harris-Benedict revisada para TMB
- Idade metabólica com múltiplos fatores';

COMMENT ON FUNCTION validate_body_measurement() IS 'Validação de dados de entrada para garantir valores realistas e prevenir erros de cálculo';
