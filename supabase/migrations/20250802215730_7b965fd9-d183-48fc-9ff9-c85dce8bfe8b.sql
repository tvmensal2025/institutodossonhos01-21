-- Remover a constraint única atual que impede múltiplas respostas
ALTER TABLE daily_responses DROP CONSTRAINT IF EXISTS daily_responses_user_id_date_question_id_key;

-- Adicionar um campo para identificar a sessão/tentativa específica
ALTER TABLE daily_responses ADD COLUMN IF NOT EXISTS session_attempt_id TEXT;

-- Criar nova constraint que permite múltiplas respostas da mesma pergunta em dias diferentes ou sessões diferentes
ALTER TABLE daily_responses 
ADD CONSTRAINT daily_responses_unique_attempt 
UNIQUE (user_id, date, question_id, session_attempt_id);