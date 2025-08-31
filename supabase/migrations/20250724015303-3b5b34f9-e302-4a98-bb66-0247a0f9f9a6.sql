-- Corrigir trigger para funcionar com RLS
DROP TRIGGER IF EXISTS trigger_weekly_analysis ON weight_measurements;
DROP FUNCTION IF EXISTS generate_weekly_analysis();

-- Recriar função com SECURITY DEFINER para contornar RLS
CREATE OR REPLACE FUNCTION generate_weekly_analysis()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_semana_inicio DATE;
  v_semana_fim DATE;
  v_peso_inicial DECIMAL(5,2);
  v_peso_final DECIMAL(5,2);
  v_variacao_peso DECIMAL(5,2);
BEGIN
  -- Definir semana (segunda a domingo)
  v_semana_inicio = DATE_TRUNC('week', NEW.measurement_date)::DATE;
  v_semana_fim = v_semana_inicio + INTERVAL '6 days';
  
  -- Buscar primeira pesagem da semana
  SELECT peso_kg INTO v_peso_inicial
  FROM weight_measurements
  WHERE user_id = NEW.user_id 
    AND measurement_date >= v_semana_inicio 
    AND measurement_date <= v_semana_fim
  ORDER BY measurement_date ASC
  LIMIT 1;
  
  -- Última pesagem da semana
  v_peso_final = NEW.peso_kg;
  
  -- Calcular variação
  v_variacao_peso = v_peso_final - COALESCE(v_peso_inicial, v_peso_final);
  
  -- Inserir ou atualizar análise semanal
  INSERT INTO weekly_analyses (
    user_id, semana_inicio, semana_fim, 
    peso_inicial, peso_final, variacao_peso,
    tendencia
  ) VALUES (
    NEW.user_id, v_semana_inicio, v_semana_fim,
    v_peso_inicial, v_peso_final, v_variacao_peso,
    CASE 
      WHEN v_variacao_peso < -0.1 THEN 'diminuindo'
      WHEN v_variacao_peso > 0.1 THEN 'aumentando'
      ELSE 'estavel'
    END
  )
  ON CONFLICT (user_id, semana_inicio) 
  DO UPDATE SET
    peso_final = EXCLUDED.peso_final,
    variacao_peso = EXCLUDED.variacao_peso,
    tendencia = EXCLUDED.tendencia;
  
  RETURN NEW;
END;
$$;

-- Recriar trigger
CREATE TRIGGER trigger_weekly_analysis
  AFTER INSERT ON weight_measurements
  FOR EACH ROW
  EXECUTE FUNCTION generate_weekly_analysis();