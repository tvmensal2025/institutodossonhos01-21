
-- Migração para corrigir problemas da Roda da Vida
-- 1. Primeiro, vamos garantir que a tabela sessions existe e tem os dados corretos
INSERT INTO sessions (id, title, description, type, difficulty, estimated_time, content, target_saboteurs, is_active, created_at, updated_at)
VALUES (
  'health-wheel-session-001',
  'Roda da Saúde - Avaliação Inicial',
  'Avaliação completa dos seus sistemas de saúde através da Roda da Saúde',
  'health_wheel_assessment',
  'beginner',
  30,
  '{
    "systems": {
      "cardiovascular": {
        "name": "Sistema Cardiovascular",
        "icon": "❤️",
        "color": "#ef4444",
        "questions": [
          "Você sente dores no peito frequentemente?",
          "Tem falta de ar ao subir escadas?",
          "Sente palpitações ou batimentos irregulares?",
          "Tem pressão alta ou baixa?",
          "Sente fadiga constante?"
        ]
      },
      "respiratory": {
        "name": "Sistema Respiratório", 
        "icon": "🫁",
        "color": "#3b82f6",
        "questions": [
          "Tem tosse frequente ou persistente?",
          "Sente falta de ar em repouso?",
          "Tem chiado no peito?",
          "Sente dor ao respirar?",
          "Tem congestão nasal frequente?"
        ]
      },
      "digestive": {
        "name": "Sistema Digestivo",
        "icon": "🍎", 
        "color": "#22c55e",
        "questions": [
          "Tem azia ou refluxo frequente?",
          "Sente dores abdominais?",
          "Tem problemas de constipação?",
          "Sente náuseas frequentes?",
          "Tem diarreia recorrente?"
        ]
      },
      "nervous": {
        "name": "Sistema Nervoso",
        "icon": "🧠",
        "color": "#a855f7", 
        "questions": [
          "Tem dores de cabeça frequentes?",
          "Sente tonturas ou vertigens?",
          "Tem problemas de memória?",
          "Sente formigamento nas mãos/pés?",
          "Tem dificuldade para se concentrar?"
        ]
      },
      "musculoskeletal": {
        "name": "Sistema Músculo-Esquelético",
        "icon": "🦴",
        "color": "#f59e0b",
        "questions": [
          "Sente dores nas costas?",
          "Tem dores nas articulações?",
          "Sente rigidez muscular?",
          "Tem cãibras frequentes?",
          "Sente fraqueza muscular?"
        ]
      },
      "endocrine": {
        "name": "Sistema Endócrino",
        "icon": "⚖️",
        "color": "#06b6d4",
        "questions": [
          "Tem alterações de peso inexplicáveis?",
          "Sente muita sede ou fome?",
          "Tem problemas de sono?",
          "Sente mudanças de humor frequentes?",
          "Tem problemas de tireoide?"
        ]
      },
      "immune": {
        "name": "Sistema Imunológico",
        "icon": "🛡️",
        "color": "#ec4899",
        "questions": [
          "Fica doente com frequência?",
          "Demora para se curar de feridas?",
          "Tem alergias frequentes?",
          "Sente cansaço excessivo?",
          "Tem infecções recorrentes?"
        ]
      },
      "reproductive": {
        "name": "Sistema Reprodutivo",
        "icon": "🌸",
        "color": "#f43f5e",
        "questions": [
          "Tem irregularidades menstruais?",
          "Sente dores pélvicas?",
          "Tem problemas de libido?",
          "Sente desconforto durante intimidade?",
          "Tem problemas hormonais?"
        ]
      }
    }
  }',
  '{}',
  true,
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  content = EXCLUDED.content,
  updated_at = NOW();

-- 2. Garantir que todos os usuários tenham acesso à sessão da Roda da Vida
-- Criar uma função para atribuir automaticamente a Roda da Vida a novos usuários
CREATE OR REPLACE FUNCTION assign_health_wheel_to_user(p_user_id UUID)
RETURNS VOID AS $$
BEGIN
  INSERT INTO user_sessions (
    user_id,
    session_id,
    status,
    assigned_at,
    progress,
    due_date
  )
  VALUES (
    p_user_id,
    'health-wheel-session-001',
    'pending',
    NOW(),
    0,
    NOW() + INTERVAL '30 days'
  )
  ON CONFLICT (user_id, session_id) DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Atribuir a Roda da Vida a todos os usuários existentes
DO $$
DECLARE
  user_record RECORD;
BEGIN
  FOR user_record IN SELECT id FROM auth.users
  LOOP
    PERFORM assign_health_wheel_to_user(user_record.id);
  END LOOP;
END;
$$;

-- 4. Criar um trigger para atribuir automaticamente a Roda da Vida a novos usuários
CREATE OR REPLACE FUNCTION auto_assign_health_wheel()
RETURNS TRIGGER AS $$
BEGIN
  -- Aguardar um pouco para garantir que o usuário foi criado completamente
  PERFORM pg_sleep(1);
  PERFORM assign_health_wheel_to_user(NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Criar o trigger se não existir
DROP TRIGGER IF EXISTS auto_assign_health_wheel_trigger ON auth.users;
CREATE TRIGGER auto_assign_health_wheel_trigger
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION auto_assign_health_wheel();

-- 5. Corrigir as políticas RLS para user_sessions
DROP POLICY IF EXISTS "Users can manage their own sessions" ON user_sessions;
CREATE POLICY "Users can manage their own sessions" ON user_sessions
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- 6. Garantir que a tabela health_wheel_responses existe
CREATE TABLE IF NOT EXISTS health_wheel_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,
  system_name TEXT NOT NULL,
  responses JSONB NOT NULL DEFAULT '{}',
  score INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, session_id, system_name)
);

-- RLS para health_wheel_responses
ALTER TABLE health_wheel_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own health wheel responses" ON health_wheel_responses
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- 7. Função para processar respostas da Roda da Vida
CREATE OR REPLACE FUNCTION process_health_wheel_responses(
  p_user_id UUID,
  p_session_id TEXT,
  p_system_name TEXT,
  p_responses JSONB
)
RETURNS INTEGER AS $$
DECLARE
  v_score INTEGER := 0;
  v_question_count INTEGER;
  v_yes_count INTEGER;
BEGIN
  -- Calcular score baseado nas respostas
  SELECT 
    jsonb_array_length(p_responses),
    (SELECT COUNT(*) FROM jsonb_array_elements_text(p_responses) WHERE value = 'Não')
  INTO v_question_count, v_yes_count;
  
  -- Score = (número de "Não" / total de questões) * 100
  IF v_question_count > 0 THEN
    v_score := ROUND((v_yes_count::NUMERIC / v_question_count::NUMERIC) * 100);
  END IF;
  
  -- Salvar resposta
  INSERT INTO health_wheel_responses (
    user_id,
    session_id,
    system_name,
    responses,
    score,
    updated_at
  )
  VALUES (
    p_user_id,
    p_session_id,
    p_system_name,
    p_responses,
    v_score,
    NOW()
  )
  ON CONFLICT (user_id, session_id, system_name) 
  DO UPDATE SET
    responses = EXCLUDED.responses,
    score = EXCLUDED.score,
    updated_at = NOW();
    
  RETURN v_score;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Comentário de finalização
COMMENT ON FUNCTION assign_health_wheel_to_user(UUID) IS 'Atribui automaticamente a sessão da Roda da Vida a um usuário';
COMMENT ON FUNCTION process_health_wheel_responses(UUID, TEXT, TEXT, JSONB) IS 'Processa e calcula o score das respostas da Roda da Vida';
