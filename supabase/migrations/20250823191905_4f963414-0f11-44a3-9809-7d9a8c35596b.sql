-- Atualizar base de conhecimento da empresa para Sofia e Dr. Vital
UPDATE company_knowledge_base SET
  content = 'Instituto dos Sonhos: transformação integral de saúde física e emocional. Fundado por Rafael Ferreira e Sirlene Freitas. Foco em perda de peso sustentável, autoestima e bem-estar. Oferece programas de emagrecimento (Desafio 7D, Limpeza Hepática, Detox), coaching, inteligência emocional, psicoterapia, hipnose, acompanhamento nutricional. Atendimento humanizado com equipe multidisciplinar (nutricionistas, biomédicos, fisioterapeutas). Filosofia: saúde = pequenos hábitos diários, alimentação natural, movimento prazeroso, gestão emocional.'
WHERE category = 'company_info' AND title = 'Instituto dos Sonhos';

-- Inserir dados atualizados da empresa se não existir
INSERT INTO company_knowledge_base (category, title, content, priority, is_active) VALUES
('company_info', 'Fundadores Detalhado', 
'Rafael Ferreira: coach, hipnoterapeuta, psicoterapeuta e master coach especialista em transformação pessoal. Sirlene Freitas: certificações em coaching, hipnose, psicoterapia e inteligência emocional, estudante de nutrição. Ambos direcionam o cliente para o profissional correto quando necessário.', 1, true),

('services_detailed', 'Programas Específicos', 
'Desafio 7D: programa intensivo de 7 dias. Limpeza Hepática: detoxificação do fígado. Detox: programa de desintoxicação. Coaching individual e em grupo. Psicoterapia e hipnose clínica. Acompanhamento nutricional personalizado. Método exclusivo de emagrecimento sustentável.', 1, true),

('differentiators_detailed', 'Diferenciais Completos', 
'Atendimento humanizado personalizado com Rafael e Sirlene. Equipe multidisciplinar completa: nutricionistas especializados, biomédicos, fisioterapeutas, psicólogos. Cuidado 360° integrado corpo-mente. Métodos cientificamente comprovados. Acompanhamento contínuo e suporte emocional.', 1, true),

('philosophy_detailed', 'Filosofia Completa', 
'Acreditamos que saúde é resultado de pequenos hábitos diários consistentes. Foco em alimentação natural e equilibrada, movimento e atividade física prazerosa, gestão emocional eficaz. Transformação real não apenas estética. Sustentabilidade a longo prazo. Autocuidado e amor próprio como base.', 1, true)

ON CONFLICT (category, title) DO UPDATE SET
  content = EXCLUDED.content,
  updated_at = NOW();