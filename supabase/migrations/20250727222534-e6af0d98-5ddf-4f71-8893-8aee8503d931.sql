-- Inserir apenas dados básicos de teste para demonstração
-- Dados simples que não violam constraints

-- 1. Pesagens dos últimos 30 dias
INSERT INTO weight_measurements (
  user_id, 
  peso_kg, 
  gordura_corporal_percent, 
  agua_corporal_percent, 
  massa_muscular_kg, 
  osso_kg, 
  metabolismo_basal_kcal, 
  gordura_visceral,
  measurement_date,
  imc,
  user_name
) VALUES
-- Últimas duas semanas
('cc294798-5eff-44b2-b88a-af96627e600b', 81.2, 18.5, 62.8, 34.2, 3.1, 1856, 8, CURRENT_TIMESTAMP - INTERVAL '1 day', 24.8, 'Rafael Ferreira'),
('cc294798-5eff-44b2-b88a-af96627e600b', 81.0, 18.8, 62.5, 34.0, 3.1, 1850, 8, CURRENT_TIMESTAMP - INTERVAL '3 days', 24.7, 'Rafael Ferreira'),
('cc294798-5eff-44b2-b88a-af96627e600b', 80.8, 19.1, 62.2, 33.8, 3.0, 1845, 9, CURRENT_TIMESTAMP - INTERVAL '5 days', 24.6, 'Rafael Ferreira'),
('cc294798-5eff-44b2-b88a-af96627e600b', 80.5, 19.3, 61.9, 33.5, 3.0, 1840, 9, CURRENT_TIMESTAMP - INTERVAL '7 days', 24.5, 'Rafael Ferreira'),
('cc294798-5eff-44b2-b88a-af96627e600b', 80.3, 19.6, 61.6, 33.2, 2.9, 1835, 9, CURRENT_TIMESTAMP - INTERVAL '10 days', 24.4, 'Rafael Ferreira'),
('cc294798-5eff-44b2-b88a-af96627e600b', 80.0, 19.8, 61.3, 33.0, 2.9, 1830, 10, CURRENT_TIMESTAMP - INTERVAL '12 days', 24.3, 'Rafael Ferreira'),
('cc294798-5eff-44b2-b88a-af96627e600b', 79.8, 20.1, 61.0, 32.8, 2.9, 1825, 10, CURRENT_TIMESTAMP - INTERVAL '14 days', 24.3, 'Rafael Ferreira'),

-- Semanas anteriores
('cc294798-5eff-44b2-b88a-af96627e600b', 79.5, 20.3, 60.8, 32.5, 2.8, 1820, 10, CURRENT_TIMESTAMP - INTERVAL '17 days', 24.2, 'Rafael Ferreira'),
('cc294798-5eff-44b2-b88a-af96627e600b', 79.2, 20.6, 60.5, 32.2, 2.8, 1815, 11, CURRENT_TIMESTAMP - INTERVAL '19 days', 24.1, 'Rafael Ferreira'),
('cc294798-5eff-44b2-b88a-af96627e600b', 79.0, 20.8, 60.2, 32.0, 2.8, 1810, 11, CURRENT_TIMESTAMP - INTERVAL '21 days', 24.0, 'Rafael Ferreira'),
('cc294798-5eff-44b2-b88a-af96627e600b', 78.8, 21.1, 59.9, 31.8, 2.7, 1805, 11, CURRENT_TIMESTAMP - INTERVAL '24 days', 24.0, 'Rafael Ferreira'),
('cc294798-5eff-44b2-b88a-af96627e600b', 78.5, 21.3, 59.6, 31.5, 2.7, 1800, 12, CURRENT_TIMESTAMP - INTERVAL '26 days', 23.9, 'Rafael Ferreira'),
('cc294798-5eff-44b2-b88a-af96627e600b', 78.2, 21.6, 59.3, 31.2, 2.7, 1795, 12, CURRENT_TIMESTAMP - INTERVAL '28 days', 23.8, 'Rafael Ferreira'),
('cc294798-5eff-44b2-b88a-af96627e600b', 78.0, 21.8, 59.0, 31.0, 2.6, 1790, 12, CURRENT_TIMESTAMP - INTERVAL '30 days', 23.7, 'Rafael Ferreira');

-- 2. Conversas de chat
INSERT INTO chat_conversations (
  user_id,
  user_message,
  bot_response,
  created_at
) VALUES
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
 'Consegui fazer exercício 4 vezes essa semana!', 
 'Rafael, isso é INCRÍVEL! 🏆 Quatro vezes por semana é uma frequência excelente! Como você está se sentindo fisicamente? Notou alguma melhora na disposição?',
 CURRENT_TIMESTAMP - INTERVAL '8 days'),

('cc294798-5eff-44b2-b88a-af96627e600b', 
 'Estou dormindo melhor desde que comecei a meditar antes de dormir.', 
 'Que descoberta maravilhosa! 😴✨ O sono de qualidade é fundamental para o emagrecimento e bem-estar geral. A meditação realmente ajuda a acalmar a mente. Quantas horas você tem dormido?',
 CURRENT_TIMESTAMP - INTERVAL '10 days'),

('cc294798-5eff-44b2-b88a-af96627e600b', 
 'Sof.ia, tenho dúvidas sobre minha alimentação. Posso comer carboidrato à noite?', 
 'Ótima pergunta, Rafael! 🍝 Carboidratos à noite não são vilões se consumidos com moderação. O importante é o balanço calórico total do dia. Que tipo de carboidrato você gostaria de incluir?',
 CURRENT_TIMESTAMP - INTERVAL '15 days'),

('cc294798-5eff-44b2-b88a-af96627e600b', 
 'Estou me sentindo mais confiante com meu corpo!', 
 'Rafael, que alegria imensa ler isso! 💫 Sua autoestima melhorando é um dos maiores presentes dessa jornada. Você está percebendo mudanças além do peso? Como está se sentindo nas roupas?',
 CURRENT_TIMESTAMP - INTERVAL '18 days'),

('cc294798-5eff-44b2-b88a-af96627e600b', 
 'Comecei a beber mais água! Já estou nos 2 litros por dia.', 
 'Parabéns, Rafael! 💧 Hidratação adequada é essencial para o metabolismo e ajuda muito no emagrecimento. Você notou alguma diferença na pele ou disposição desde que aumentou o consumo de água?',
 CURRENT_TIMESTAMP - INTERVAL '25 days');

-- 3. Diário de saúde
INSERT INTO health_diary (
  user_id,
  date,
  mood_rating,
  energy_level,
  sleep_hours,
  water_intake,
  exercise_minutes,
  notes,
  user_name
) VALUES
('cc294798-5eff-44b2-b88a-af96627e600b', CURRENT_DATE - INTERVAL '1 day', 8, 8, 7.5, 2.2, 45, 'Dia produtivo! Treino de força na academia.', 'Rafael Ferreira'),
('cc294798-5eff-44b2-b88a-af96627e600b', CURRENT_DATE - INTERVAL '2 days', 7, 7, 7.0, 2.0, 30, 'Caminhada no parque. Me senti bem.', 'Rafael Ferreira'),
('cc294798-5eff-44b2-b88a-af96627e600b', CURRENT_DATE - INTERVAL '3 days', 9, 9, 8.0, 2.5, 60, 'Excelente dia! Treino completo e boa alimentação.', 'Rafael Ferreira'),
('cc294798-5eff-44b2-b88a-af96627e600b', CURRENT_DATE - INTERVAL '5 days', 8, 8, 7.5, 2.1, 40, 'Yoga pela manhã. Muito relaxante.', 'Rafael Ferreira'),
('cc294798-5eff-44b2-b88a-af96627e600b', CURRENT_DATE - INTERVAL '8 days', 7, 7, 7.0, 2.0, 35, 'Treino leve. Foco na consistência.', 'Rafael Ferreira'),
('cc294798-5eff-44b2-b88a-af96627e600b', CURRENT_DATE - INTERVAL '10 days', 8, 8, 8.0, 2.3, 50, 'Dia muito bom! Energia alta o dia todo.', 'Rafael Ferreira'),
('cc294798-5eff-44b2-b88a-af96627e600b', CURRENT_DATE - INTERVAL '15 days', 7, 7, 7.5, 2.0, 45, 'Retomando o ritmo dos exercícios.', 'Rafael Ferreira'),
('cc294798-5eff-44b2-b88a-af96627e600b', CURRENT_DATE - INTERVAL '18 days', 8, 8, 7.0, 2.2, 55, 'Ótimo treino! Me sentindo mais forte.', 'Rafael Ferreira'),
('cc294798-5eff-44b2-b88a-af96627e600b', CURRENT_DATE - INTERVAL '25 days', 6, 6, 7.0, 1.8, 25, 'Progresso lento mas constante.', 'Rafael Ferreira');

-- Atualizar email do usuário para teste
UPDATE user_profiles 
SET email = 'tvmensal2025@gmail.com' 
WHERE user_id = 'cc294798-5eff-44b2-b88a-af96627e600b';