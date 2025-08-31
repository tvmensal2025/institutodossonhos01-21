-- Corrigir o foreign key incompatível
DROP TABLE IF EXISTS public.receita_itens;

-- Recriar tabela de itens com referência corrigida
CREATE TABLE public.receita_itens (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  receita_id uuid REFERENCES receitas(id) ON DELETE CASCADE,
  numero_taco integer NOT NULL, -- número do alimento na tabela TACO
  quantidade_gramas numeric NOT NULL,
  observacoes text,
  ordem integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- RLS para itens de receita
ALTER TABLE public.receita_itens ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Itens de receita são públicos para leitura" ON public.receita_itens FOR SELECT USING (true);
CREATE POLICY "Admins podem gerenciar itens de receita" ON public.receita_itens FOR ALL 
  USING (EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin'));

-- Inserir receitas brasileiras culturalmente corretas
INSERT INTO public.receitas (nome, refeicao, descricao, preparo, tempo_preparo_min, tags) VALUES 

-- CAFÉ DA MANHÃ (culturalmente brasileiro - sem arroz/feijão/carne)
('Ovos mexidos com tapioca', 'cafe_manha', 'Café da manhã proteico e sem glúten', 'Bata os ovos, tempere com sal e cheiro-verde. Aqueça a tapioca em frigideira antiaderente e sirva com os ovos mexidos.', 10, ARRAY['proteína', 'sem_gluten', 'rápido']),

('Vitamina de banana com aveia', 'cafe_manha', 'Bebida nutritiva e energética', 'Bata no liquidificador a banana, leite, aveia e mel. Sirva gelado.', 5, ARRAY['vitamina', 'carboidrato', 'frutas']),

('Pão integral com queijo e tomate', 'cafe_manha', 'Sanduíche simples e nutritivo', 'Torre o pão, adicione o queijo e fatias de tomate. Tempere com orégano e azeite.', 5, ARRAY['carboidrato', 'proteína', 'vegetais']),

('Mingau de aveia com frutas', 'cafe_manha', 'Mingau cremoso e saudável', 'Cozinhe a aveia no leite até cremoso. Adicione banana picada e canela.', 10, ARRAY['carboidrato', 'frutas', 'cremoso']),

-- ALMOÇO (PF brasileiro)
('Frango grelhado com arroz e feijão', 'almoco', 'Prato feito clássico brasileiro', 'Tempere o frango e grelhe. Cozinhe o arroz e o feijão. Refogue os legumes. Sirva com salada verde.', 45, ARRAY['proteína', 'carboidrato', 'prato_feito']),

('Peixe assado com purê de batata doce', 'almoco', 'Almoço com peixe e carboidrato saudável', 'Tempere o peixe e asse. Cozinhe a batata doce e faça purê. Sirva com brócolis refogado.', 40, ARRAY['peixe', 'carboidrato', 'saudável']),

('Carne magra com macarrão integral', 'almoco', 'Refeição rica em proteínas', 'Grelhe a carne. Cozinhe o macarrão integral. Refogue legumes. Sirva com molho de tomate caseiro.', 35, ARRAY['carne', 'massa', 'integral']),

-- LANCHE 
('Iogurte com granola e frutas', 'lanche', 'Lanche nutritivo e saboroso', 'Misture o iogurte natural com granola. Adicione frutas picadas por cima.', 3, ARRAY['proteína', 'frutas', 'prático']),

('Sanduíche natural de frango', 'lanche', 'Lanche leve e proteico', 'Desfie o peito de frango. Monte no pão com alface, tomate e cenoura ralada.', 10, ARRAY['proteína', 'vegetais', 'natural']),

-- JANTAR (versão mais leve do almoço)
('Omelete com legumes', 'jantar', 'Jantar leve e nutritivo', 'Bata os ovos, refogue os legumes e faça a omelete. Sirva com salada verde.', 15, ARRAY['ovos', 'vegetais', 'leve']),

('Sopa de legumes com frango', 'jantar', 'Jantar reconfortante e saudável', 'Cozinhe os legumes com frango desfiado. Tempere com ervas. Sirva quente.', 30, ARRAY['sopa', 'proteína', 'reconfortante']),

('Salada completa com proteína', 'jantar', 'Jantar fresco e balanceado', 'Monte a salada com folhas verdes, tomate, pepino. Adicione frango grelhado ou ovo cozido.', 15, ARRAY['salada', 'proteína', 'fresco']);

-- Agora inserir os itens das receitas usando números da TACO
-- Ovos mexidos com tapioca
INSERT INTO public.receita_itens (receita_id, numero_taco, quantidade_gramas, ordem)
SELECT r.id, 142, 100, 1 FROM receitas r WHERE r.nome = 'Ovos mexidos com tapioca'
UNION ALL
SELECT r.id, 352, 50, 2 FROM receitas r WHERE r.nome = 'Ovos mexidos com tapioca'; -- tapioca

-- Vitamina de banana com aveia  
INSERT INTO public.receita_itens (receita_id, numero_taco, quantidade_gramas, ordem)
SELECT r.id, 273, 100, 1 FROM receitas r WHERE r.nome = 'Vitamina de banana com aveia' -- banana
UNION ALL
SELECT r.id, 67, 200, 2 FROM receitas r WHERE r.nome = 'Vitamina de banana com aveia' -- leite
UNION ALL
SELECT r.id, 158, 30, 3 FROM receitas r WHERE r.nome = 'Vitamina de banana com aveia'; -- aveia

-- Pão integral com queijo e tomate
INSERT INTO public.receita_itens (receita_id, numero_taco, quantidade_gramas, ordem)
SELECT r.id, 180, 50, 1 FROM receitas r WHERE r.nome = 'Pão integral com queijo e tomate' -- pão integral
UNION ALL
SELECT r.id, 73, 30, 2 FROM receitas r WHERE r.nome = 'Pão integral com queijo e tomate' -- queijo
UNION ALL
SELECT r.id, 312, 50, 3 FROM receitas r WHERE r.nome = 'Pão integral com queijo e tomate'; -- tomate

-- Frango grelhado com arroz e feijão
INSERT INTO public.receita_itens (receita_id, numero_taco, quantidade_gramas, ordem)
SELECT r.id, 195, 120, 1 FROM receitas r WHERE r.nome = 'Frango grelhado com arroz e feijão' -- frango
UNION ALL
SELECT r.id, 158, 150, 2 FROM receitas r WHERE r.nome = 'Frango grelhado com arroz e feijão' -- arroz
UNION ALL
SELECT r.id, 219, 100, 3 FROM receitas r WHERE r.nome = 'Frango grelhado com arroz e feijão' -- feijão
UNION ALL
SELECT r.id, 278, 80, 4 FROM receitas r WHERE r.nome = 'Frango grelhado com arroz e feijão'; -- brócolis

-- Iogurte com granola e frutas
INSERT INTO public.receita_itens (receita_id, numero_taco, quantidade_gramas, ordem)
SELECT r.id, 71, 150, 1 FROM receitas r WHERE r.nome = 'Iogurte com granola e frutas' -- iogurte
UNION ALL
SELECT r.id, 373, 30, 2 FROM receitas r WHERE r.nome = 'Iogurte com granola e frutas' -- granola
UNION ALL
SELECT r.id, 273, 50, 3 FROM receitas r WHERE r.nome = 'Iogurte com granola e frutas'; -- banana