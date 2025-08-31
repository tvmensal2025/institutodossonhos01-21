-- Garantir que user_profiles tem todas as colunas necessárias
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS total_points INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS level_name TEXT DEFAULT 'Iniciante',
ADD COLUMN IF NOT EXISTS current_streak INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS badges TEXT[] DEFAULT '{}';

-- Função para calcular nível baseado em pontos (cast para INTEGER)
CREATE OR REPLACE FUNCTION public.calculate_user_level(points INTEGER)
RETURNS TEXT AS $$
BEGIN
  CASE 
    WHEN points >= 10000 THEN RETURN 'Mestre';
    WHEN points >= 5000 THEN RETURN 'Especialista';
    WHEN points >= 2000 THEN RETURN 'Avançado';
    WHEN points >= 1000 THEN RETURN 'Experiente';
    WHEN points >= 500 THEN RETURN 'Intermediário';
    WHEN points >= 100 THEN RETURN 'Dedicado';
    ELSE RETURN 'Iniciante';
  END CASE;
END;
$$ LANGUAGE plpgsql;

-- Atualizar pontos e níveis dos usuários baseado nas missões diárias (com cast)
UPDATE public.user_profiles 
SET 
  total_points = COALESCE((
    SELECT SUM(total_points)::INTEGER 
    FROM daily_mission_sessions 
    WHERE user_id = user_profiles.user_id
  ), 0),
  level_name = public.calculate_user_level(COALESCE((
    SELECT SUM(total_points)::INTEGER 
    FROM daily_mission_sessions 
    WHERE user_id = user_profiles.user_id
  ), 0));

-- Inserir dados de exemplo se não houver usuários com pontos
INSERT INTO public.user_profiles (user_id, full_name, bio, total_points, level_name, current_streak)
SELECT 
  gen_random_uuid(),
  name,
  'Membro da comunidade de saúde',
  points,
  public.calculate_user_level(points),
  streak
FROM (VALUES 
  ('Maria Silva', 1250, 15),
  ('João Santos', 980, 12),
  ('Ana Costa', 750, 8),
  ('Carlos Oliveira', 650, 10),
  ('Beatriz Lima', 540, 6),
  ('Ricardo Nunes', 480, 7),
  ('Fernanda Cruz', 420, 5),
  ('Paulo Mendes', 380, 4),
  ('Juliana Rocha', 340, 3),
  ('Bruno Alves', 280, 2)
) AS sample_data(name, points, streak)
WHERE NOT EXISTS (
  SELECT 1 FROM public.user_profiles WHERE total_points > 0
);