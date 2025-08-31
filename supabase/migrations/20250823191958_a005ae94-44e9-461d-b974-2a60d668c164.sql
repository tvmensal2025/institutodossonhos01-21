-- Criar tabela de base de conhecimento da empresa
CREATE TABLE IF NOT EXISTS company_knowledge_base (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  category VARCHAR(50) NOT NULL,
  title VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  priority INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT unique_category_title UNIQUE(category, title)
);

-- Habilitar RLS
ALTER TABLE company_knowledge_base ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso
CREATE POLICY "Public can read company knowledge" ON company_knowledge_base
FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage company knowledge" ON company_knowledge_base
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

-- Inserir dados do Instituto dos Sonhos
INSERT INTO company_knowledge_base (category, title, content, priority, is_active) VALUES
('company_info', 'Instituto dos Sonhos', 
'Instituto dos Sonhos: transformação integral de saúde física e emocional. Fundado por Rafael Ferreira e Sirlene Freitas. Foco em perda de peso sustentável, autoestima e bem-estar. Oferece programas de emagrecimento (Desafio 7D, Limpeza Hepática, Detox), coaching, inteligência emocional, psicoterapia, hipnose, acompanhamento nutricional. Atendimento humanizado com equipe multidisciplinar (nutricionistas, biomédicos, fisioterapeutas). Filosofia: saúde = pequenos hábitos diários, alimentação natural, movimento prazeroso, gestão emocional.', 1, true),

('founders', 'Rafael Ferreira', 
'Rafael Ferreira: coach, hipnoterapeuta, psicoterapeuta e master coach especialista em transformação pessoal. Direção e acompanhamento personalizado dos clientes.', 1, true),

('founders', 'Sirlene Freitas', 
'Sirlene Freitas: certificações em coaching, hipnose, psicoterapia e inteligência emocional, estudante de nutrição. Especialista em cuidado feminino e transformação.', 1, true),

('services', 'Programas Principais', 
'Desafio 7D: programa intensivo de 7 dias. Limpeza Hepática: detoxificação do fígado. Detox: programa de desintoxicação. Coaching individual e em grupo. Psicoterapia e hipnose clínica. Acompanhamento nutricional personalizado.', 1, true),

('differentiators', 'Diferenciais', 
'Atendimento humanizado personalizado com Rafael e Sirlene. Equipe multidisciplinar completa: nutricionistas especializados, biomédicos, fisioterapeutas, psicólogos. Cuidado 360° integrado corpo-mente. Métodos científicos comprovados.', 1, true),

('philosophy', 'Filosofia de Saúde', 
'Acreditamos que saúde é resultado de pequenos hábitos diários consistentes. Foco em alimentação natural e equilibrada, movimento e atividade física prazerosa, gestão emocional eficaz. Transformação real sustentável.', 1, true)

ON CONFLICT (category, title) DO UPDATE SET
  content = EXCLUDED.content,
  updated_at = NOW();