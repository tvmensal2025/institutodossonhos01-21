-- Inserir uma sessão de exemplo com ferramentas
INSERT INTO sessions (
  title, 
  description, 
  type, 
  content, 
  difficulty, 
  estimated_time, 
  materials_needed, 
  target_saboteurs,
  follow_up_questions,
  tools,
  is_active,
  created_by
) VALUES (
  '🧠 Sessão de Autoconhecimento Profundo',
  'Sessão completa com múltiplas ferramentas para mapeamento de crenças limitantes, traumas emocionais e avaliação da pirâmide de saúde.',
  'multi_tool_session',
  '{"introduction": "Esta sessão utiliza várias ferramentas integradas para um autoconhecimento profundo.", "objective": "Identificar padrões limitantes e criar estratégias de transformação"}',
  'intermediate',
  90,
  ARRAY['Local tranquilo', 'Tempo disponível', 'Concentração', 'Honestidade consigo mesmo'],
  ARRAY['Autossabotagem', 'Crenças limitantes', 'Traumas emocionais', 'Desequilíbrio'],
  ARRAY[
    'Quais crenças limitantes mais impactam sua vida?',
    'Como seus traumas emocionais afetam suas decisões?',
    'Que áreas da sua saúde precisam de mais atenção?',
    'Qual seria o primeiro passo para sua transformação?'
  ],
  '["limiting-beliefs", "health-pyramid", "trauma-mapping", "anamnesis"]'::jsonb,
  true,
  (SELECT id FROM auth.users WHERE email = 'admin@institutodossonhos.com.br' LIMIT 1)
);

-- Inserir outra sessão focada em crenças limitantes
INSERT INTO sessions (
  title, 
  description, 
  type, 
  content, 
  difficulty, 
  estimated_time, 
  materials_needed, 
  target_saboteurs,
  follow_up_questions,
  tools,
  is_active,
  created_by
) VALUES (
  '💭 Mapeamento de Crenças Limitantes',
  'Sessão focada na identificação e transformação de crenças que limitam seu potencial.',
  'belief_transformation',
  '{"introduction": "Vamos mapear e transformar as crenças que estão limitando seu crescimento.", "focus": "Identificação de padrões de pensamento limitantes"}',
  'beginner',
  30,
  ARRAY['Reflexão', 'Abertura mental', 'Local tranquilo'],
  ARRAY['Crenças limitantes', 'Autossabotagem', 'Medo do sucesso'],
  ARRAY[
    'Quais crenças você identificou como mais limitantes?',
    'Como essas crenças se manifestam no seu dia a dia?',
    'Que estratégias você pode usar para transformá-las?'
  ],
  '["limiting-beliefs"]'::jsonb,
  true,
  (SELECT id FROM auth.users WHERE email = 'admin@institutodossonhos.com.br' LIMIT 1)
);

-- Inserir sessão de avaliação de saúde
INSERT INTO sessions (
  title, 
  description, 
  type, 
  content, 
  difficulty, 
  estimated_time, 
  materials_needed, 
  target_saboteurs,
  follow_up_questions,
  tools,
  is_active,
  created_by
) VALUES (
  '🏥 Avaliação Completa de Saúde',
  'Avaliação abrangente utilizando anamnese sistêmica e mapeamento da pirâmide de saúde.',
  'health_assessment',
  '{"introduction": "Avaliação completa da sua saúde física, emocional, mental e espiritual.", "focus": "Mapeamento holístico da saúde"}',
  'intermediate',
  60,
  ARRAY['Histórico médico', 'Informações familiares', 'Concentração'],
  ARRAY['Negligência com a saúde', 'Negação de sintomas'],
  ARRAY[
    'Que áreas da sua saúde estão mais desequilibradas?',
    'Que fatores familiares podem influenciar sua saúde?',
    'Qual seria seu plano de cuidados prioritários?'
  ],
  '["health-pyramid", "anamnesis"]'::jsonb,
  true,
  (SELECT id FROM auth.users WHERE email = 'admin@institutodossonhos.com.br' LIMIT 1)
);