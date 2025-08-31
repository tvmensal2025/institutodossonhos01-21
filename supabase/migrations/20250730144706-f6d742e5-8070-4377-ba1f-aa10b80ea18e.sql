-- Verificar dados existentes e inserir desafios básicos

-- Primeiro, ver o que já existe
SELECT COUNT(*) as total_challenges FROM public.challenges;
SELECT COUNT(*) as total_missions FROM public.missions;

-- Inserir um desafio simples sem categoria primeiro
INSERT INTO public.challenges (title, description, points) VALUES
('Beber Água', 'Beba 8 copos de água hoje', 5)
ON CONFLICT DO NOTHING;

-- Inserir uma missão simples sem categoria
INSERT INTO public.missions (title, description, points) VALUES
('Fazer Login', 'Acesse a plataforma pela primeira vez', 5)
ON CONFLICT DO NOTHING;

-- Ver o resultado
SELECT id, title, description, category, difficulty, points FROM public.challenges;
SELECT id, title, description, category, difficulty, points FROM public.missions;