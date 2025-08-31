-- Correção na função sofia-image-analysis para suportar o fluxo completo de confirmação

-- Primeiro, vamos corrigir problemas na tabela sofia_food_analysis
ALTER TABLE sofia_food_analysis ADD COLUMN IF NOT EXISTS confirmed_by_user BOOLEAN DEFAULT false;
ALTER TABLE sofia_food_analysis ADD COLUMN IF NOT EXISTS confirmation_prompt_sent BOOLEAN DEFAULT false;
ALTER TABLE sofia_food_analysis ADD COLUMN IF NOT EXISTS user_name TEXT;

-- Criar função para formatar resposta da Sofia com confirmação obrigatória
CREATE OR REPLACE FUNCTION format_sofia_food_response(
    detected_foods TEXT[],
    user_name TEXT,
    estimated_calories INTEGER DEFAULT 0
) RETURNS TEXT
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN format('Oi %s! 😊 

📸 Analisei sua refeição e identifiquei:
%s

🤔 Esses alimentos estão corretos?', 
        COALESCE(user_name, 'querido(a)'),
        array_to_string(detected_foods, E'\n'));
END;
$$;

-- Função para calcular calorias de confirmação
CREATE OR REPLACE FUNCTION format_sofia_calories_response(
    user_name TEXT,
    calories INTEGER,
    foods TEXT[]
) RETURNS TEXT
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN format('Perfeito, %s! ✅

🔥 Estimativa calórica: aproximadamente %s kcal

%s

Continue compartilhando suas refeições comigo! Se quiser uma análise mais precisa, me conte as quantidades de cada item! 😉✨', 
        COALESCE(user_name, 'querido(a)'),
        calories,
        CASE 
            WHEN calories < 300 THEN 'Uma refeição leve e saudável! 🌱'
            WHEN calories BETWEEN 300 AND 600 THEN 'Ótima quantidade de energia! 💪'
            WHEN calories BETWEEN 600 AND 900 THEN 'Uma refeição bem completa! 🍽️'
            ELSE 'Uma refeição reforçada! ⚡'
        END
    );
END;
$$;