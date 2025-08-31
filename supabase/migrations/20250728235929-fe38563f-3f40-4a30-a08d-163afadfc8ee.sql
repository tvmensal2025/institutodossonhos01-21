-- Inserir aulas para os módulos
INSERT INTO course_lessons (module_id, title, description, content, duration_minutes, order_index, is_premium) VALUES
-- Aulas para "Introdução à Nutrição"
((SELECT id FROM course_modules WHERE title = 'Introdução à Nutrição'), 'O que é Nutrição?', 'Conceitos fundamentais sobre nutrição e saúde', 'Nesta aula você aprenderá os conceitos básicos da nutrição e sua importância para a saúde.', 15, 1, false),
((SELECT id FROM course_modules WHERE title = 'Introdução à Nutrição'), 'Pirâmide Alimentar', 'Entendendo a pirâmide alimentar brasileira', 'Aprenda como usar a pirâmide alimentar para organizar sua alimentação.', 20, 2, false),

-- Aulas para "Macronutrientes"
((SELECT id FROM course_modules WHERE title = 'Macronutrientes'), 'Carboidratos', 'Tipos e funções dos carboidratos', 'Entenda os diferentes tipos de carboidratos e suas funções no organismo.', 25, 1, false),
((SELECT id FROM course_modules WHERE title = 'Macronutrientes'), 'Proteínas', 'Importância das proteínas na alimentação', 'Descubra como as proteínas ajudam na construção muscular e saciedade.', 25, 2, false),
((SELECT id FROM course_modules WHERE title = 'Macronutrientes'), 'Gorduras Saudáveis', 'Identificando gorduras boas e ruins', 'Aprenda a diferença entre gorduras saudáveis e prejudiciais.', 20, 3, false),

-- Aulas para "Planejamento de Refeições"
((SELECT id FROM course_modules WHERE title = 'Planejamento de Refeições'), 'Montando seu Prato', 'Como equilibrar nutrientes no prato', 'Aprenda a montar pratos balanceados para cada refeição.', 30, 1, false),
((SELECT id FROM course_modules WHERE title = 'Planejamento de Refeições'), 'Meal Prep Básico', 'Preparação de refeições para a semana', 'Técnicas simples para preparar suas refeições com antecedência.', 35, 2, true),

-- Aulas para "Preparação Física"
((SELECT id FROM course_modules WHERE title = 'Preparação Física'), 'Aquecimento Dinâmico', 'Exercícios de aquecimento antes do treino', 'Aprenda a preparar seu corpo para o exercício de forma segura.', 10, 1, false),
((SELECT id FROM course_modules WHERE title = 'Preparação Física'), 'Alongamento Básico', 'Principais alongamentos para iniciantes', 'Exercícios de alongamento essenciais para flexibilidade.', 15, 2, false),

-- Aulas para "Exercícios Cardiovasculares"
((SELECT id FROM course_modules WHERE title = 'Exercícios Cardiovasculares'), 'Caminhada Eficiente', 'Como tornar a caminhada mais eficaz', 'Técnicas para maximizar os benefícios da caminhada.', 20, 1, false),
((SELECT id FROM course_modules WHERE title = 'Exercícios Cardiovasculares'), 'Treino HIIT Iniciante', 'Introdução ao treino intervalado', 'Aprenda os fundamentos do treino intervalado de alta intensidade.', 25, 2, true),

-- Aulas para "Fortalecimento Muscular"
((SELECT id FROM course_modules WHERE title = 'Fortalecimento Muscular'), 'Exercícios com Peso Corporal', 'Fortalecimento sem equipamentos', 'Exercícios eficazes usando apenas o peso do corpo.', 30, 1, false),
((SELECT id FROM course_modules WHERE title = 'Fortalecimento Muscular'), 'Core e Abdômen', 'Fortalecendo o centro do corpo', 'Exercícios específicos para fortalecer o core e abdômen.', 20, 2, false),

-- Aulas para "Introdução ao Mindfulness"
((SELECT id FROM course_modules WHERE title = 'Introdução ao Mindfulness'), 'O que é Mindfulness?', 'Conceitos básicos de atenção plena', 'Introdução aos princípios fundamentais do mindfulness.', 15, 1, false),
((SELECT id FROM course_modules WHERE title = 'Introdução ao Mindfulness'), 'Respiração Consciente', 'Técnicas de respiração para relaxamento', 'Aprenda técnicas de respiração para reduzir stress e ansiedade.', 20, 2, false),

-- Aulas para "Técnicas de Meditação"
((SELECT id FROM course_modules WHERE title = 'Técnicas de Meditação'), 'Meditação Guiada', 'Sua primeira experiência com meditação', 'Sessão prática de meditação guiada para iniciantes.', 15, 1, false),
((SELECT id FROM course_modules WHERE title = 'Técnicas de Meditação'), 'Mindfulness no Dia a Dia', 'Aplicando atenção plena na rotina', 'Como integrar práticas de mindfulness na vida cotidiana.', 25, 2, true),

-- Aulas para "Alimentação Consciente"
((SELECT id FROM course_modules WHERE title = 'Alimentação Consciente'), 'Fome vs. Vontade', 'Distinguindo sinais do corpo', 'Aprenda a diferenciar fome física de fome emocional.', 20, 1, false),
((SELECT id FROM course_modules WHERE title = 'Alimentação Consciente'), 'Mastigação Consciente', 'A importância de comer devagar', 'Técnicas para comer de forma mais consciente e saborosa.', 15, 2, false),

-- Aulas para "Café da Manhã Saudável"
((SELECT id FROM course_modules WHERE title = 'Café da Manhã Saudável'), 'Smoothies Nutritivos', 'Receitas de vitaminas saudáveis', 'Aprenda a fazer smoothies deliciosos e nutritivos.', 20, 1, false),
((SELECT id FROM course_modules WHERE title = 'Café da Manhã Saudável'), 'Panquecas Fit', 'Versões saudáveis de panquecas', 'Receitas de panquecas proteicas e nutritivas.', 25, 2, false),

-- Aulas para "Almoços Balanceados"
((SELECT id FROM course_modules WHERE title = 'Almoços Balanceados'), 'Saladas Completas', 'Saladas que saciam e nutrem', 'Como fazer saladas balanceadas e saborosas.', 30, 1, false),
((SELECT id FROM course_modules WHERE title = 'Almoços Balanceados'), 'Pratos Únicos Saudáveis', 'Refeições completas em um prato', 'Receitas de pratos únicos nutritivos e práticos.', 35, 2, true),

-- Aulas para "Lanches e Sobremesas Fit"
((SELECT id FROM course_modules WHERE title = 'Lanches e Sobremesas Fit'), 'Snacks Proteicos', 'Lanches ricos em proteína', 'Opções de lanches saudáveis para qualquer hora.', 15, 1, false),
((SELECT id FROM course_modules WHERE title = 'Lanches e Sobremesas Fit'), 'Doces Sem Culpa', 'Sobremesas saudáveis e gostosas', 'Receitas de sobremesas fit que não comprometem a dieta.', 25, 2, true);