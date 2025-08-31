-- Criar tabela tests se não existir
CREATE TABLE IF NOT EXISTS public.tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  is_public BOOLEAN DEFAULT false,
  questions JSONB NOT NULL DEFAULT '[]',
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Criar tabela test_responses se não existir
CREATE TABLE IF NOT EXISTS public.test_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id UUID NOT NULL REFERENCES public.tests(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  responses JSONB NOT NULL DEFAULT '{}',
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(test_id, user_id)
);

-- Habilitar RLS
ALTER TABLE public.tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_responses ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para tests
CREATE POLICY "Everyone can view public tests"
ON public.tests
FOR SELECT
USING (is_public = true);

CREATE POLICY "Admins can manage all tests"
ON public.tests
FOR ALL
USING (is_admin(auth.uid()));

-- Políticas RLS para test_responses
CREATE POLICY "Users can view their own test responses"
ON public.test_responses
FOR SELECT
USING (user_id IN (
  SELECT id FROM profiles WHERE user_id = auth.uid()
));

CREATE POLICY "Users can create their own test responses"
ON public.test_responses
FOR INSERT
WITH CHECK (user_id IN (
  SELECT id FROM profiles WHERE user_id = auth.uid()
));

CREATE POLICY "Users can update their own test responses"
ON public.test_responses
FOR UPDATE
USING (user_id IN (
  SELECT id FROM profiles WHERE user_id = auth.uid()
));

CREATE POLICY "Admins can view all test responses"
ON public.test_responses
FOR SELECT
USING (is_admin(auth.uid()));

-- Verificar e ajustar políticas RLS para permitir que usuários autenticados criem testes públicos
-- ou buscar teste existente "Teste dos Sabotadores"

-- Primeiro, vamos inserir o teste como administrador se ele não existir
INSERT INTO tests (title, description, is_public, questions, created_by) 
SELECT 
  'Teste dos Sabotadores',
  'Teste para identificar padrões comportamentais que sabotam o emagrecimento',
  true,
  '[
    {"id": 1, "pergunta": "Eu sempre escolho roupas que mais disfarçam meu excesso de peso.", "opcoes": [{"value": 5, "label": "Concordo Fortemente"}, {"value": 4, "label": "Concordo"}, {"value": 3, "label": "Às Vezes"}, {"value": 2, "label": "Discordo"}, {"value": 1, "label": "Discordo Fortemente"}]},
    {"id": 2, "pergunta": "Tenho peças que disfarçam meu corpo, e por isso prefiro até lavar mais vezes essas mesmas peças roupa do que ir às compras e me sentir frustrado(a).", "opcoes": [{"value": 5, "label": "Concordo Fortemente"}, {"value": 4, "label": "Concordo"}, {"value": 3, "label": "Às Vezes"}, {"value": 2, "label": "Discordo"}, {"value": 1, "label": "Discordo Fortemente"}]}
  ]'::jsonb,
  (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1)
WHERE NOT EXISTS (
  SELECT 1 FROM tests WHERE title = 'Teste dos Sabotadores' AND is_public = true
);

-- Verificar se temos o teste criado
SELECT id, title, is_public FROM tests WHERE title = 'Teste dos Sabotadores';