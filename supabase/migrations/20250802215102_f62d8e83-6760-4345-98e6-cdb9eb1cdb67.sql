-- Verificar o constraint atual e corrigir para aceitar 'health_wheel'
-- Remover o constraint atual e criar um novo que aceite 'health_wheel'
ALTER TABLE daily_responses DROP CONSTRAINT IF EXISTS daily_responses_section_check;

-- Criar novo constraint que aceita todas as seções necessárias
ALTER TABLE daily_responses 
ADD CONSTRAINT daily_responses_section_check 
CHECK (section IN ('morning', 'habits', 'mindset', 'health_wheel', 'life_wheel', 'sessions'));