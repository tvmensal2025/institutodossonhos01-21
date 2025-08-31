-- Inserir dados de teste para demonstração do relatório de 30 dias
-- Usando o usuário Rafael Ferreira

-- 1. Inserir pesagens dos últimos 30 dias (variando entre 78-82kg)
INSERT INTO weight_measurements (
  user_id, 
  peso_kg, 
  gordura_corporal_percent, 
  agua_corporal_percent, 
  massa_muscular_kg, 
  massa_ossea_kg, 
  metabolismo_basal, 
  gordura_visceral_nivel,
  measurement_date,
  imc
) VALUES
-- Semana 1 (mais recente)
('cc294798-5eff-44b2-b88a-af96627e600b', 81.2, 18.5, 62.8, 34.2, 3.1, 1856, 8, CURRENT_DATE - INTERVAL '1 day', 24.8),
('cc294798-5eff-44b2-b88a-af96627e600b', 81.0, 18.8, 62.5, 34.0, 3.1, 1850, 8, CURRENT_DATE - INTERVAL '3 days', 24.7),
('cc294798-5eff-44b2-b88a-af96627e600b', 80.8, 19.1, 62.2, 33.8, 3.0, 1845, 9, CURRENT_DATE - INTERVAL '5 days', 24.6),
('cc294798-5eff-44b2-b88a-af96627e600b', 80.5, 19.3, 61.9, 33.5, 3.0, 1840, 9, CURRENT_DATE - INTERVAL '7 days', 24.5),

-- Semana 2
('cc294798-5eff-44b2-b88a-af96627e600b', 80.3, 19.6, 61.6, 33.2, 2.9, 1835, 9, CURRENT_DATE - INTERVAL '10 days', 24.4),
('cc294798-5eff-44b2-b88a-af96627e600b', 80.0, 19.8, 61.3, 33.0, 2.9, 1830, 10, CURRENT_DATE - INTERVAL '12 days', 24.3),
('cc294798-5eff-44b2-b88a-af96627e600b', 79.8, 20.1, 61.0, 32.8, 2.9, 1825, 10, CURRENT_DATE - INTERVAL '14 days', 24.3),

-- Semana 3
('cc294798-5eff-44b2-b88a-af96627e600b', 79.5, 20.3, 60.8, 32.5, 2.8, 1820, 10, CURRENT_DATE - INTERVAL '17 days', 24.2),
('cc294798-5eff-44b2-b88a-af96627e600b', 79.2, 20.6, 60.5, 32.2, 2.8, 1815, 11, CURRENT_DATE - INTERVAL '19 days', 24.1),
('cc294798-5eff-44b2-b88a-af96627e600b', 79.0, 20.8, 60.2, 32.0, 2.8, 1810, 11, CURRENT_DATE - INTERVAL '21 days', 24.0),

-- Semana 4 (mais antiga)
('cc294798-5eff-44b2-b88a-af96627e600b', 78.8, 21.1, 59.9, 31.8, 2.7, 1805, 11, CURRENT_DATE - INTERVAL '24 days', 24.0),
('cc294798-5eff-44b2-b88a-af96627e600b', 78.5, 21.3, 59.6, 31.5, 2.7, 1800, 12, CURRENT_DATE - INTERVAL '26 days', 23.9),
('cc294798-5eff-44b2-b88a-af96627e600b', 78.2, 21.6, 59.3, 31.2, 2.7, 1795, 12, CURRENT_DATE - INTERVAL '28 days', 23.8),
('cc294798-5eff-44b2-b88a-af96627e600b', 78.0, 21.8, 59.0, 31.0, 2.6, 1790, 12, CURRENT_DATE - INTERVAL '30 days', 23.7);

-- 2. Inserir conversas de chat dos últimos 30 dias
INSERT INTO chat_conversations (
  user_id,
  user_message,
  bot_response,
  created_at
) VALUES
-- Conversas recentes
('cc294798-5eff-44b2-b88a-af96627e600b', 
 'Oi Sof.ia! Como você está hoje?', 
 'Olá Rafael! Estou muito bem, obrigada por perguntar! 😊 Como você está se sentindo hoje? Vi que você tem se dedicado bastante à sua jornada de saúde!',
 CURRENT_TIMESTAMP - INTERVAL '1 day'),

('cc294798-5eff-44b2-b88a-af96627e600b', 
 'Estou me sentindo mais disposto! Acho que a dieta está funcionando.', 
 'Que maravilha ouvir isso! 🎉 Sua dedicação está dando frutos. Vi que você perdeu quase 3kg nas últimas semanas - isso é fantástico! Como está se sentindo em relação aos exercícios?',
 CURRENT_TIMESTAMP - INTERVAL '1 day'),

('cc294798-5eff-44b2-b88a-af96627e600b', 
 'Às vezes sinto que posso comer mais besteira...', 
 'É completamente normal ter esses pensamentos, Rafael! 💪 Lembre-se de que cada escolha saudável é uma vitória. Que tal pensarmos em algumas estratégias para quando a vontade aparecer?',
 CURRENT_TIMESTAMP - INTERVAL '3 days'),

('cc294798-5eff-44b2-b88a-af96627e600b', 
 'Tive um dia difícil no trabalho. Acabei comendo muito doce.', 
 'Entendo perfeitamente, Rafael. 🤗 Dias difíceis acontecem e é humano buscar conforto na comida. O importante é não se culpar e retomar amanhã. Quer conversar sobre o que te estressou?',
 CURRENT_TIMESTAMP - INTERVAL '5 days'),

-- Conversas da semana anterior
('cc294798-5eff-44b2-b88a-af96627e600b', 
 'Consegui fazer exercício 4 vezes essa semana!', 
 'Rafael, isso é INCRÍVEL! 🏆 Quatro vezes por semana é uma frequência excelente! Como você está se sentindo fisicamente? Notou alguma melhora na disposição?',
 CURRENT_TIMESTAMP - INTERVAL '8 days'),

('cc294798-5eff-44b2-b88a-af96627e600b', 
 'Estou dormindo melhor desde que comecei a meditar antes de dormir.', 
 'Que descoberta maravilhosa! 😴✨ O sono de qualidade é fundamental para o emagrecimento e bem-estar geral. A meditação realmente ajuda a acalmar a mente. Quantas horas você tem dormido?',
 CURRENT_TIMESTAMP - INTERVAL '10 days'),

-- Conversas de 2 semanas atrás
('cc294798-5eff-44b2-b88a-af96627e600b', 
 'Sof.ia, tenho dúvidas sobre minha alimentação. Posso comer carboidrato à noite?', 
 'Ótima pergunta, Rafael! 🍝 Carboidratos à noite não são vilões se consumidos com moderação. O importante é o balanço calórico total do dia. Que tipo de carboidrato você gostaria de incluir?',
 CURRENT_TIMESTAMP - INTERVAL '15 days'),

('cc294798-5eff-44b2-b88a-af96627e600b', 
 'Estou me sentindo mais confiante com meu corpo!', 
 'Rafael, que alegria imensa ler isso! 💫 Sua autoestima melhorando é um dos maiores presentes dessa jornada. Você está percebendo mudanças além do peso? Como está se sentindo nas roupas?',
 CURRENT_TIMESTAMP - INTERVAL '18 days'),

-- Conversas mais antigas
('cc294798-5eff-44b2-b88a-af96627e600b', 
 'Às vezes desanimo... será que vou conseguir?', 
 'Rafael, entendo esse sentimento! 💚 É normal ter dias de desânimo, mas olhe o quanto você já evoluiu! Lembre-se: cada pequeno passo conta. Vamos focar no progresso, não na perfeição!',
 CURRENT_TIMESTAMP - INTERVAL '22 days'),

('cc294798-5eff-44b2-b88a-af96627e600b', 
 'Comecei a beber mais água! Já estou nos 2 litros por dia.', 
 'Parabéns, Rafael! 💧 Hidratação adequada é essencial para o metabolismo e ajuda muito no emagrecimento. Você notou alguma diferença na pele ou disposição desde que aumentou o consumo de água?',
 CURRENT_TIMESTAMP - INTERVAL '25 days');

-- 3. Inserir dados do diário de saúde
INSERT INTO health_diary (
  user_id,
  date,
  mood_rating,
  energy_level,
  sleep_hours,
  water_intake,
  exercise_minutes,
  notes
) VALUES
-- Última semana
('cc294798-5eff-44b2-b88a-af96627e600b', CURRENT_DATE - INTERVAL '1 day', 8, 8, 7.5, 2.2, 45, 'Dia produtivo! Treino de força na academia.'),
('cc294798-5eff-44b2-b88a-af96627e600b', CURRENT_DATE - INTERVAL '2 days', 7, 7, 7.0, 2.0, 30, 'Caminhada no parque. Me senti bem.'),
('cc294798-5eff-44b2-b88a-af96627e600b', CURRENT_DATE - INTERVAL '3 days', 9, 9, 8.0, 2.5, 60, 'Excelente dia! Treino completo e boa alimentação.'),
('cc294798-5eff-44b2-b88a-af96627e600b', CURRENT_DATE - INTERVAL '4 days', 6, 6, 6.5, 1.8, 0, 'Dia corrido, não consegui exercitar.'),
('cc294798-5eff-44b2-b88a-af96627e600b', CURRENT_DATE - INTERVAL '5 days', 8, 8, 7.5, 2.1, 40, 'Yoga pela manhã. Muito relaxante.'),

-- Semana anterior  
('cc294798-5eff-44b2-b88a-af96627e600b', CURRENT_DATE - INTERVAL '8 days', 7, 7, 7.0, 2.0, 35, 'Treino leve. Foco na consistência.'),
('cc294798-5eff-44b2-b88a-af96627e600b', CURRENT_DATE - INTERVAL '10 days', 8, 8, 8.0, 2.3, 50, 'Dia muito bom! Energia alta o dia todo.'),
('cc294798-5eff-44b2-b88a-af96627e600b', CURRENT_DATE - INTERVAL '12 days', 6, 5, 6.0, 1.5, 20, 'Dia difícil no trabalho. Pouco exercício.'),

-- Duas semanas atrás
('cc294798-5eff-44b2-b88a-af96627e600b', CURRENT_DATE - INTERVAL '15 days', 7, 7, 7.5, 2.0, 45, 'Retomando o ritmo dos exercícios.'),
('cc294798-5eff-44b2-b88a-af96627e600b', CURRENT_DATE - INTERVAL '18 days', 8, 8, 7.0, 2.2, 55, 'Ótimo treino! Me sentindo mais forte.'),

-- Três semanas atrás
('cc294798-5eff-44b2-b88a-af96627e600b', CURRENT_DATE - INTERVAL '22 days', 5, 5, 6.5, 1.7, 15, 'Começando a rotina. Ainda me adaptando.'),
('cc294798-5eff-44b2-b88a-af96627e600b', CURRENT_DATE - INTERVAL '25 days', 6, 6, 7.0, 1.8, 25, 'Progresso lento mas constante.'),
('cc294798-5eff-44b2-b88a-af96627e600b', CURRENT_DATE - INTERVAL '28 days', 7, 6, 6.5, 1.9, 30, 'Estabelecendo a rotina de exercícios.');

-- 4. Inserir sessões de missões diárias
INSERT INTO daily_mission_sessions (
  user_id,
  date,
  is_completed,
  total_points,
  streak_days,
  completed_sections
) VALUES
-- Últimos dias
('cc294798-5eff-44b2-b88a-af96627e600b', CURRENT_DATE - INTERVAL '1 day', true, 85, 5, ARRAY['morning_reflection', 'nutrition_log', 'exercise_log', 'gratitude']),
('cc294798-5eff-44b2-b88a-af96627e600b', CURRENT_DATE - INTERVAL '2 days', true, 75, 4, ARRAY['morning_reflection', 'nutrition_log', 'gratitude']),
('cc294798-5eff-44b2-b88a-af96627e600b', CURRENT_DATE - INTERVAL '3 days', true, 90, 3, ARRAY['morning_reflection', 'nutrition_log', 'exercise_log', 'gratitude', 'evening_reflection']),
('cc294798-5eff-44b2-b88a-af96627e600b', CURRENT_DATE - INTERVAL '4 days', false, 45, 0, ARRAY['morning_reflection', 'nutrition_log']),
('cc294798-5eff-44b2-b88a-af96627e600b', CURRENT_DATE - INTERVAL '5 days', true, 80, 2, ARRAY['morning_reflection', 'nutrition_log', 'exercise_log', 'gratitude']),

-- Semana anterior
('cc294798-5eff-44b2-b88a-af96627e600b', CURRENT_DATE - INTERVAL '8 days', true, 70, 1, ARRAY['morning_reflection', 'gratitude', 'exercise_log']),
('cc294798-5eff-44b2-b88a-af96627e600b', CURRENT_DATE - INTERVAL '10 days', true, 85, 3, ARRAY['morning_reflection', 'nutrition_log', 'exercise_log', 'gratitude']),
('cc294798-5eff-44b2-b88a-af96627e600b', CURRENT_DATE - INTERVAL '12 days', false, 30, 0, ARRAY['morning_reflection']),

-- Duas semanas atrás
('cc294798-5eff-44b2-b88a-af96627e600b', CURRENT_DATE - INTERVAL '15 days', true, 65, 2, ARRAY['morning_reflection', 'nutrition_log', 'gratitude']),
('cc294798-5eff-44b2-b88a-af96627e600b', CURRENT_DATE - INTERVAL '18 days', true, 80, 1, ARRAY['morning_reflection', 'nutrition_log', 'exercise_log', 'gratitude']),

-- Três semanas atrás
('cc294798-5eff-44b2-b88a-af96627e600b', CURRENT_DATE - INTERVAL '22 days', false, 25, 0, ARRAY['morning_reflection']),
('cc294798-5eff-44b2-b88a-af96627e600b', CURRENT_DATE - INTERVAL '25 days', true, 55, 1, ARRAY['morning_reflection', 'gratitude']),
('cc294798-5eff-44b2-b88a-af96627e600b', CURRENT_DATE - INTERVAL '28 days', true, 60, 1, ARRAY['morning_reflection', 'nutrition_log', 'gratitude']);

-- 5. Inserir respostas das missões diárias
INSERT INTO daily_responses (
  user_id,
  date,
  section,
  question_id,
  answer,
  text_response,
  points_earned
) VALUES
-- Respostas recentes
('cc294798-5eff-44b2-b88a-af96627e600b', CURRENT_DATE - INTERVAL '1 day', 'morning', 'day_rating', '8', 'Me sentindo muito bem hoje! Com energia para treinar.', 10),
('cc294798-5eff-44b2-b88a-af96627e600b', CURRENT_DATE - INTERVAL '1 day', 'health', 'water_intake', '2L', NULL, 15),
('cc294798-5eff-44b2-b88a-af96627e600b', CURRENT_DATE - INTERVAL '1 day', 'health', 'physical_activity', 'Sim', 'Treino de força na academia - 45 minutos', 20),
('cc294798-5eff-44b2-b88a-af96627e600b', CURRENT_DATE - INTERVAL '1 day', 'reflection', 'gratitude', NULL, 'Grato pela minha saúde e pela oportunidade de me cuidar melhor a cada dia.', 15),

('cc294798-5eff-44b2-b88a-af96627e600b', CURRENT_DATE - INTERVAL '3 days', 'morning', 'day_rating', '9', 'Dia excelente! Muito motivado.', 10),
('cc294798-5eff-44b2-b88a-af96627e600b', CURRENT_DATE - INTERVAL '3 days', 'health', 'water_intake', '3L ou mais', NULL, 20),
('cc294798-5eff-44b2-b88a-af96627e600b', CURRENT_DATE - INTERVAL '3 days', 'health', 'physical_activity', 'Sim', 'Treino completo - 60 minutos', 20),
('cc294798-5eff-44b2-b88a-af96627e600b', CURRENT_DATE - INTERVAL '3 days', 'reflection', 'gratitude', NULL, 'Grato pelos resultados que estou vendo e pela disciplina que estou desenvolvendo.', 15),

('cc294798-5eff-44b2-b88a-af96627e600b', CURRENT_DATE - INTERVAL '5 days', 'morning', 'day_rating', '8', 'Dia tranquilo e positivo.', 10),
('cc294798-5eff-44b2-b88a-af96627e600b', CURRENT_DATE - INTERVAL '5 days', 'health', 'water_intake', '2L', NULL, 15),
('cc294798-5eff-44b2-b88a-af96627e600b', CURRENT_DATE - INTERVAL '5 days', 'health', 'physical_activity', 'Sim', 'Yoga matinal - muito relaxante', 20),
('cc294798-5eff-44b2-b88a-af96627e600b', CURRENT_DATE - INTERVAL '5 days', 'reflection', 'gratitude', NULL, 'Grato pelo equilíbrio entre corpo e mente que estou encontrando.', 15);

-- Atualizar perfil do usuário para ter email de teste
UPDATE user_profiles 
SET email = 'tvmensal2025@gmail.com' 
WHERE user_id = 'cc294798-5eff-44b2-b88a-af96627e600b';