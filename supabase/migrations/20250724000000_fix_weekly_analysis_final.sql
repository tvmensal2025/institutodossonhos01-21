-- Corrigir função de análise semanal e remover números fixos
DROP TRIGGER IF EXISTS trigger_weekly_analysis ON weight_measurements;
DROP FUNCTION IF EXISTS generate_weekly_analysis();

-- Função corrigida sem ambiguidade e sem números fixos
CREATE OR REPLACE FUNCTION generate_weekly_analysis()
RETURNS TRIGGER AS $$
DECLARE
  week_start DATE;
  week_end DATE;
  first_weight DECIMAL(5,2);
  last_weight DECIMAL(5,2);
  weight_variation DECIMAL(5,2);
  existing_analysis_id UUID;
BEGIN
  -- Calcular início e fim da semana (segunda-feira)
  week_start = DATE_TRUNC('week', NEW.measurement_date::DATE);
  week_end = week_start + INTERVAL '6 days';
  
  -- Verificar se já existe análise para esta semana
  SELECT id INTO existing_analysis_id
  FROM weekly_analyses wa
  WHERE wa.user_id = NEW.user_id 
  AND wa.semana_inicio = week_start;
  
  -- Se já existe, atualizar apenas
  IF existing_analysis_id IS NOT NULL THEN
    -- Buscar última pesagem da semana
    SELECT peso_kg INTO last_weight
    FROM weight_measurements wm
    WHERE wm.user_id = NEW.user_id
    AND wm.measurement_date::DATE >= week_start
    AND wm.measurement_date::DATE <= week_end
    ORDER BY wm.measurement_date DESC
    LIMIT 1;
    
    -- Buscar primeira pesagem da semana
    SELECT peso_kg INTO first_weight
    FROM weight_measurements wm
    WHERE wm.user_id = NEW.user_id
    AND wm.measurement_date::DATE >= week_start
    AND wm.measurement_date::DATE <= week_end
    ORDER BY wm.measurement_date ASC
    LIMIT 1;
    
    weight_variation = COALESCE(last_weight, 0) - COALESCE(first_weight, 0);
    
    -- Atualizar análise existente
    UPDATE weekly_analyses SET
      peso_final = last_weight,
      variacao_peso = weight_variation,
      tendencia = CASE 
        WHEN weight_variation < -0.1 THEN 'diminuindo'
        WHEN weight_variation > 0.1 THEN 'aumentando'
        ELSE 'estavel'
      END
    WHERE id = existing_analysis_id;
    
    RETURN NEW;
  END IF;
  
  -- Buscar primeira pesagem da semana
  SELECT peso_kg INTO first_weight
  FROM weight_measurements wm
  WHERE wm.user_id = NEW.user_id
  AND wm.measurement_date::DATE >= week_start
  AND wm.measurement_date::DATE <= week_end
  ORDER BY wm.measurement_date ASC
  LIMIT 1;
  
  -- Última pesagem é sempre a atual
  last_weight = NEW.peso_kg;
  weight_variation = COALESCE(last_weight, 0) - COALESCE(first_weight, 0);
  
  -- Inserir nova análise semanal
  INSERT INTO weekly_analyses (
    user_id,
    semana_inicio,
    semana_fim,
    peso_inicial,
    peso_final,
    variacao_peso,
    tendencia
  ) VALUES (
    NEW.user_id,
    week_start,
    week_end,
    first_weight,
    last_weight,
    weight_variation,
    CASE 
      WHEN weight_variation < -0.1 THEN 'diminuindo'
      WHEN weight_variation > 0.1 THEN 'aumentando'
      ELSE 'estavel'
    END
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recriar trigger
CREATE TRIGGER trigger_weekly_analysis
  AFTER INSERT ON weight_measurements
  FOR EACH ROW
  EXECUTE FUNCTION generate_weekly_analysis();

-- Remover dados de teste com números fixos (manter apenas altura fixa)
DELETE FROM daily_missions WHERE user_id = '55cd4171-80f2-4a13-9039-ce79973b675a';
DELETE FROM user_scores WHERE user_id = '55cd4171-80f2-4a13-9039-ce79973b675a';
DELETE FROM mood_tracking WHERE user_id = '55cd4171-80f2-4a13-9039-ce79973b675a';
DELETE FROM life_wheel WHERE user_id = '55cd4171-80f2-4a13-9039-ce79973b675a';
DELETE FROM activity_categories WHERE user_id = '55cd4171-80f2-4a13-9039-ce79973b675a';

-- Limpar dados antigos de weight_measurements para recomeçar
DELETE FROM weight_measurements WHERE user_id = '55cd4171-80f2-4a13-9039-ce79973b675a';
DELETE FROM weekly_analyses WHERE user_id = '55cd4171-80f2-4a13-9039-ce79973b675a';

SELECT 'Análise semanal corrigida e dados fixos removidos! ✅' as status;