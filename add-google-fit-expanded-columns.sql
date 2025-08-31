-- Adicionar colunas expandidas para dados completos do Google Fit
-- Instituto dos Sonhos - Sistema de Integração Completa

-- 1. Adicionar novas colunas para dados básicos expandidos
ALTER TABLE google_fit_data 
ADD COLUMN IF NOT EXISTS calories_total INTEGER DEFAULT 0;

-- 2. Adicionar colunas para dados cardiovasculares expandidos
ALTER TABLE google_fit_data 
ADD COLUMN IF NOT EXISTS heart_rate_min INTEGER,
ADD COLUMN IF NOT EXISTS resting_heart_rate INTEGER;

-- 3. Adicionar colunas para dados de sono detalhados
ALTER TABLE google_fit_data 
ADD COLUMN IF NOT EXISTS sleep_efficiency DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS sleep_stages JSONB;

-- 4. Adicionar colunas para dados antropométricos expandidos
ALTER TABLE google_fit_data 
ADD COLUMN IF NOT EXISTS bmi DECIMAL(4,2),
ADD COLUMN IF NOT EXISTS body_fat_percentage DECIMAL(4,2),
ADD COLUMN IF NOT EXISTS muscle_mass_kg DECIMAL(5,2);

-- 5. Adicionar colunas para dados de exercício
ALTER TABLE google_fit_data 
ADD COLUMN IF NOT EXISTS exercise_minutes INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS workout_sessions INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS exercise_calories INTEGER DEFAULT 0;

-- 6. Adicionar colunas para dados de hidratação
ALTER TABLE google_fit_data 
ADD COLUMN IF NOT EXISTS hydration_ml INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS water_intake_ml INTEGER DEFAULT 0;

-- 7. Adicionar colunas para dados de nutrição
ALTER TABLE google_fit_data 
ADD COLUMN IF NOT EXISTS nutrition_calories INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS protein_g DECIMAL(6,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS carbs_g DECIMAL(6,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS fat_g DECIMAL(6,2) DEFAULT 0;

-- 8. Adicionar colunas para dados de oxigenação
ALTER TABLE google_fit_data 
ADD COLUMN IF NOT EXISTS oxygen_saturation DECIMAL(4,2),
ADD COLUMN IF NOT EXISTS respiratory_rate DECIMAL(4,2);

-- 9. Adicionar colunas para dados de ambiente
ALTER TABLE google_fit_data 
ADD COLUMN IF NOT EXISTS location TEXT,
ADD COLUMN IF NOT EXISTS weather TEXT,
ADD COLUMN IF NOT EXISTS temperature_celsius DECIMAL(4,2);

-- 10. Adicionar colunas para dados de dispositivos
ALTER TABLE google_fit_data 
ADD COLUMN IF NOT EXISTS device_type TEXT,
ADD COLUMN IF NOT EXISTS data_source TEXT;

-- 11. Adicionar colunas para metadados
ALTER TABLE google_fit_data 
ADD COLUMN IF NOT EXISTS data_quality INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS raw_data JSONB;

-- 12. Adicionar comentários para documentação
COMMENT ON COLUMN google_fit_data.calories_total IS 'Calorias totais (ativas + basais) em kcal';
COMMENT ON COLUMN google_fit_data.heart_rate_min IS 'Frequência cardíaca mínima do dia em bpm';
COMMENT ON COLUMN google_fit_data.resting_heart_rate IS 'Frequência cardíaca em repouso em bpm';
COMMENT ON COLUMN google_fit_data.sleep_efficiency IS 'Eficiência do sono em porcentagem (0-100)';
COMMENT ON COLUMN google_fit_data.sleep_stages IS 'Estágios do sono detalhados em JSON';
COMMENT ON COLUMN google_fit_data.bmi IS 'Índice de Massa Corporal calculado';
COMMENT ON COLUMN google_fit_data.body_fat_percentage IS 'Percentual de gordura corporal';
COMMENT ON COLUMN google_fit_data.muscle_mass_kg IS 'Massa muscular em quilogramas';
COMMENT ON COLUMN google_fit_data.exercise_minutes IS 'Minutos de exercício do dia';
COMMENT ON COLUMN google_fit_data.workout_sessions IS 'Número de sessões de treino';
COMMENT ON COLUMN google_fit_data.exercise_calories IS 'Calorias queimadas em exercícios';
COMMENT ON COLUMN google_fit_data.hydration_ml IS 'Hidratação em mililitros';
COMMENT ON COLUMN google_fit_data.water_intake_ml IS 'Consumo de água em mililitros';
COMMENT ON COLUMN google_fit_data.nutrition_calories IS 'Calorias consumidas via nutrição';
COMMENT ON COLUMN google_fit_data.protein_g IS 'Proteína consumida em gramas';
COMMENT ON COLUMN google_fit_data.carbs_g IS 'Carboidratos consumidos em gramas';
COMMENT ON COLUMN google_fit_data.fat_g IS 'Gorduras consumidas em gramas';
COMMENT ON COLUMN google_fit_data.oxygen_saturation IS 'Saturação de oxigênio em porcentagem';
COMMENT ON COLUMN google_fit_data.respiratory_rate IS 'Taxa respiratória em respirações por minuto';
COMMENT ON COLUMN google_fit_data.location IS 'Localização geográfica';
COMMENT ON COLUMN google_fit_data.weather IS 'Condições climáticas';
COMMENT ON COLUMN google_fit_data.temperature_celsius IS 'Temperatura ambiente em Celsius';
COMMENT ON COLUMN google_fit_data.device_type IS 'Tipo de dispositivo usado';
COMMENT ON COLUMN google_fit_data.data_source IS 'Fonte dos dados';
COMMENT ON COLUMN google_fit_data.data_quality IS 'Qualidade dos dados (0-100)';
COMMENT ON COLUMN google_fit_data.raw_data IS 'Dados brutos completos em JSON';

-- 13. Criar índices para melhor performance nas consultas
CREATE INDEX IF NOT EXISTS idx_google_fit_data_bmi ON google_fit_data(bmi);
CREATE INDEX IF NOT EXISTS idx_google_fit_data_body_fat ON google_fit_data(body_fat_percentage);
CREATE INDEX IF NOT EXISTS idx_google_fit_data_exercise ON google_fit_data(exercise_minutes);
CREATE INDEX IF NOT EXISTS idx_google_fit_data_hydration ON google_fit_data(hydration_ml);
CREATE INDEX IF NOT EXISTS idx_google_fit_data_nutrition ON google_fit_data(nutrition_calories);
CREATE INDEX IF NOT EXISTS idx_google_fit_data_oxygen ON google_fit_data(oxygen_saturation);
CREATE INDEX IF NOT EXISTS idx_google_fit_data_quality ON google_fit_data(data_quality);

-- 14. Verificar se as colunas foram criadas corretamente
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'google_fit_data' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 15. Mensagem de confirmação
SELECT '✅ Tabela google_fit_data expandida com sucesso para capturar TODOS os dados do Google Fit!' as status;
