-- Expansão da tabela google_fit_data para capturar mais dados do Google Fit
-- Para integração completa com Sofia e Dr. Vital

-- Adicionar novas colunas à tabela google_fit_data
ALTER TABLE google_fit_data 
ADD COLUMN IF NOT EXISTS active_minutes INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS sleep_duration_hours DECIMAL(4,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS weight_kg DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS height_cm DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS heart_rate_resting INTEGER,
ADD COLUMN IF NOT EXISTS heart_rate_max INTEGER,
ADD COLUMN IF NOT EXISTS raw_data JSONB;

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_google_fit_data_user_date ON google_fit_data(user_id, data_date);
CREATE INDEX IF NOT EXISTS idx_google_fit_data_sync_timestamp ON google_fit_data(sync_timestamp);
CREATE INDEX IF NOT EXISTS idx_google_fit_data_weight ON google_fit_data(weight_kg) WHERE weight_kg IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_google_fit_data_heart_rate ON google_fit_data(heart_rate_avg) WHERE heart_rate_avg > 0;

-- Adicionar comentários para documentação
COMMENT ON COLUMN google_fit_data.active_minutes IS 'Minutos ativos registrados pelo Google Fit';
COMMENT ON COLUMN google_fit_data.sleep_duration_hours IS 'Duração do sono em horas';
COMMENT ON COLUMN google_fit_data.weight_kg IS 'Peso em quilogramas do Google Fit';
COMMENT ON COLUMN google_fit_data.height_cm IS 'Altura em centímetros do Google Fit';
COMMENT ON COLUMN google_fit_data.heart_rate_resting IS 'Frequência cardíaca em repouso';
COMMENT ON COLUMN google_fit_data.heart_rate_max IS 'Frequência cardíaca máxima';
COMMENT ON COLUMN google_fit_data.raw_data IS 'Dados brutos completos do Google Fit em JSON';

-- Versão simples e resiliente: garante coluna display_name e recria a VIEW
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS display_name TEXT;
DROP VIEW IF EXISTS google_fit_analysis;
CREATE VIEW google_fit_analysis AS
SELECT 
  gfd.*,
  COALESCE(NULLIF(p.display_name, ''), p.full_name, 'Usuário') AS display_name,
  p.email,
  CASE 
    WHEN gfd.steps_count >= 10000 THEN 'Excelente'
    WHEN gfd.steps_count >= 7500 THEN 'Bom'
    WHEN gfd.steps_count >= 5000 THEN 'Moderado'
    ELSE 'Baixo'
  END as steps_classification,
  CASE 
    WHEN gfd.heart_rate_avg BETWEEN 60 AND 100 THEN 'Normal'
    WHEN gfd.heart_rate_avg < 60 THEN 'Baixa'
    WHEN gfd.heart_rate_avg > 100 THEN 'Alta'
    ELSE 'Não medido'
  END as heart_rate_classification,
  CASE 
    WHEN gfd.sleep_duration_hours >= 7 AND gfd.sleep_duration_hours <= 9 THEN 'Ideal'
    WHEN gfd.sleep_duration_hours >= 6 AND gfd.sleep_duration_hours < 7 THEN 'Insuficiente'
    WHEN gfd.sleep_duration_hours > 9 THEN 'Excessivo'
    ELSE 'Muito pouco'
  END as sleep_classification,
  CASE 
    WHEN gfd.weight_kg IS NOT NULL AND gfd.height_cm IS NOT NULL AND gfd.height_cm > 0 
    THEN ROUND((gfd.weight_kg / POWER((gfd.height_cm / 100.0), 2))::numeric, 2)
    ELSE NULL
  END as calculated_bmi
FROM google_fit_data gfd
LEFT JOIN public.profiles p ON gfd.user_id = p.user_id
WHERE gfd.sync_timestamp >= NOW() - INTERVAL '90 days'
ORDER BY gfd.data_date DESC, gfd.sync_timestamp DESC;

-- Conceder permissões para a view
GRANT SELECT ON google_fit_analysis TO authenticated;

-- Política RLS para a view (herdará da tabela base)
ALTER VIEW google_fit_analysis SET (security_barrier = true);

-- Criar função para obter resumo semanal do Google Fit
CREATE OR REPLACE FUNCTION get_google_fit_weekly_summary(user_uuid UUID, weeks_back INTEGER DEFAULT 1)
RETURNS TABLE (
  week_start DATE,
  week_end DATE,
  total_steps BIGINT,
  total_calories BIGINT,
  total_distance DECIMAL,
  avg_heart_rate DECIMAL,
  total_active_minutes BIGINT,
  avg_sleep_hours DECIMAL,
  days_with_data INTEGER,
  latest_weight DECIMAL,
  latest_height DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (DATE_TRUNC('week', data_date))::DATE as week_start,
    (DATE_TRUNC('week', data_date) + INTERVAL '6 days')::DATE as week_end,
    SUM(steps_count) as total_steps,
    SUM(calories_burned) as total_calories,
    ROUND(SUM(distance_meters / 1000.0)::numeric, 2) as total_distance,
    ROUND(AVG(NULLIF(heart_rate_avg, 0))::numeric, 0) as avg_heart_rate,
    SUM(active_minutes) as total_active_minutes,
    ROUND(AVG(NULLIF(sleep_duration_hours, 0))::numeric, 1) as avg_sleep_hours,
    COUNT(DISTINCT data_date) as days_with_data,
    (
      SELECT weight_kg 
      FROM google_fit_data 
      WHERE user_id = user_uuid AND weight_kg IS NOT NULL 
      ORDER BY data_date DESC, sync_timestamp DESC 
      LIMIT 1
    ) as latest_weight,
    (
      SELECT height_cm 
      FROM google_fit_data 
      WHERE user_id = user_uuid AND height_cm IS NOT NULL 
      ORDER BY data_date DESC, sync_timestamp DESC 
      LIMIT 1
    ) as latest_height
  FROM google_fit_data 
  WHERE user_id = user_uuid 
    AND data_date >= DATE_TRUNC('week', CURRENT_DATE) - (weeks_back * INTERVAL '1 week')
    AND data_date < DATE_TRUNC('week', CURRENT_DATE) - ((weeks_back - 1) * INTERVAL '1 week')
  GROUP BY DATE_TRUNC('week', data_date)
  ORDER BY week_start DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Conceder execução da função
GRANT EXECUTE ON FUNCTION get_google_fit_weekly_summary TO authenticated;

-- Comentário final
COMMENT ON TABLE google_fit_data IS 'Dados expandidos do Google Fit para análise completa por Sofia e Dr. Vital - Instituto dos Sonhos 2024';