-- ========================================
-- SOFIA - COMBINAÇÕES DE ALIMENTOS PARA ANÁLISE DE IMAGEM
-- "FAÇA DE SEU ALIMENTO SEU REMÉDIO"
-- FACILITAR LEITURA DE IMAGENS DE PRATOS
-- ========================================

-- TABELA DE COMBINAÇÕES VISUAIS PARA ANÁLISE DE IMAGEM
CREATE TABLE IF NOT EXISTS combinacoes_visuais_imagem (
  id SERIAL PRIMARY KEY,
  nome_combinacao VARCHAR(255) NOT NULL,
  categoria_prato VARCHAR(100),
  descricao_visual TEXT,
  alimentos_identificaveis TEXT[],
  cores_dominantes TEXT[],
  texturas_identificaveis TEXT[],
  formas_identificaveis TEXT[],
  tamanhos_relativos TEXT[],
  posicionamento_tipico TEXT,
  ingredientes_principais TEXT[],
  ingredientes_secundarios TEXT[],
  temperos_identificaveis TEXT[],
  molhos_sauces TEXT[],
  guarnicoes_tipicas TEXT[],
  apresentacao_visual TEXT,
  tamanho_porcao_estimada VARCHAR(100),
  calorias_estimadas INTEGER,
  macronutrientes_estimados JSONB,
  nivel_dificuldade_identificacao INTEGER CHECK (nivel_dificuldade_identificacao >= 1 AND nivel_dificuldade_identificacao <= 5),
  confiabilidade_identificacao DECIMAL(3,2) CHECK (confiabilidade_identificacao >= 0 AND confiabilidade_identificacao <= 1),
  dicas_identificacao TEXT[],
  variacoes_possiveis TEXT[],
  regioes_culinarias TEXT[],
  epocas_consumo TEXT[],
  created_at TIMESTAMP DEFAULT NOW()
);

-- INSERIR COMBINAÇÕES VISUAIS PARA ANÁLISE DE IMAGEM
INSERT INTO combinacoes_visuais_imagem (nome_combinacao, categoria_prato, descricao_visual, alimentos_identificaveis, cores_dominantes, texturas_identificaveis, formas_identificaveis, tamanhos_relativos, posicionamento_tipico, ingredientes_principais, ingredientes_secundarios, temperos_identificaveis, molhos_sauces, guarnicoes_tipicas, apresentacao_visual, tamanho_porcao_estimada, calorias_estimadas, macronutrientes_estimados, nivel_dificuldade_identificacao, confiabilidade_identificacao, dicas_identificacao, variacoes_possiveis, regioes_culinarias, epocas_consumo) VALUES

-- PRATOS PRINCIPAIS
('Arroz com Feijão', 'Prato Principal', 'Arroz branco com feijão preto ou carioca, geralmente servidos lado a lado', ARRAY['arroz', 'feijão'], ARRAY['branco', 'preto', 'marrom'], ARRAY['grãos', 'cremoso'], ARRAY['grãos pequenos', 'grãos médios'], ARRAY['metade do prato cada'], 'lado a lado', ARRAY['arroz', 'feijão'], ARRAY['cebola', 'alho'], ARRAY['sal', 'alho', 'cebola'], ARRAY['caldo do feijão'], ARRAY['farofa', 'couve'], 'Arroz branco soltinho com feijão cremoso', '1 xícara arroz + 1/2 xícara feijão', 350, '{"proteina": 12, "carboidrato": 65, "gordura": 2}', 2, 0.95, ARRAY['Arroz branco soltinho', 'Feijão cremoso', 'Cor contrastante'], ARRAY['arroz integral', 'feijão branco', 'lentilha'], ARRAY['brasileira'], ARRAY['almoço', 'jantar']),

('Salada Verde', 'Entrada', 'Mix de folhas verdes com legumes coloridos', ARRAY['alface', 'rúcula', 'tomate', 'cenoura'], ARRAY['verde', 'vermelho', 'laranja'], ARRAY['crocante', 'suave'], ARRAY['folhas', 'cubos', 'rondelas'], ARRAY['variados'], 'espalhados', ARRAY['alface', 'rúcula', 'espinafre'], ARRAY['tomate', 'cenoura', 'cebola'], ARRAY['azeite', 'vinagre', 'sal'], ARRAY['vinagrete'], ARRAY['azeitonas', 'queijo'], 'Folhas verdes frescas com legumes coloridos', '1 prato raso', 120, '{"proteina": 3, "carboidrato": 8, "gordura": 8}', 1, 0.98, ARRAY['Folhas verdes frescas', 'Legumes coloridos', 'Molho visível'], ARRAY['mix de folhas', 'legumes diferentes'], ARRAY['mediterrânea', 'brasileira'], ARRAY['almoço', 'jantar', 'ceia']),

('Frango Grelhado', 'Proteína', 'Peito de frango grelhado com marcas de grelha', ARRAY['frango'], ARRAY['dourado', 'marrom'], ARRAY['firme', 'suculento'], ARRAY['retangular', 'oval'], ARRAY['médio'], 'centralizado', ARRAY['frango'], ARRAY['alho', 'cebola'], ARRAY['sal', 'pimenta', 'alho'], ARRAY['molho de ervas'], ARRAY['legumes grelhados'], 'Peito de frango com marcas de grelha', '150g', 250, '{"proteina": 45, "carboidrato": 0, "gordura": 5}', 3, 0.90, ARRAY['Marcas de grelha', 'Cor dourada', 'Forma retangular'], ARRAY['sobrecoxa', 'asa', 'perna'], ARRAY['brasileira', 'mediterrânea'], ARRAY['almoço', 'jantar']),

('Peixe Assado', 'Proteína', 'Filé de peixe assado com ervas', ARRAY['peixe'], ARRAY['branco', 'dourado'], ARRAY['macio', 'firme'], ARRAY['retangular', 'oval'], ARRAY['médio'], 'centralizado', ARRAY['peixe'], ARRAY['limão', 'ervas'], ARRAY['sal', 'pimenta', 'limão'], ARRAY['molho de ervas'], ARRAY['legumes'], 'Filé de peixe com ervas', '150g', 200, '{"proteina": 35, "carboidrato": 0, "gordura": 8}', 3, 0.85, ARRAY['Cor branca do peixe', 'Ervas visíveis', 'Forma retangular'], ARRAY['salmão', 'atum', 'pescada'], ARRAY['mediterrânea', 'japonesa'], ARRAY['almoço', 'jantar']),

('Macarrão', 'Carboidrato', 'Massa cozida com molho', ARRAY['macarrão'], ARRAY['branco', 'amarelo', 'vermelho'], ARRAY['macio', 'al dente'], ARRAY['longo', 'curto'], ARRAY['médio'], 'centralizado', ARRAY['macarrão'], ARRAY['molho', 'queijo'], ARRAY['sal', 'azeite'], ARRAY['molho de tomate', 'molho branco'], ARRAY['queijo ralado'], 'Massa com molho', '200g', 400, '{"proteina": 12, "carboidrato": 75, "gordura": 8}', 2, 0.95, ARRAY['Forma da massa', 'Cor do molho', 'Queijo ralado'], ARRAY['espaguete', 'penne', 'fettuccine'], ARRAY['italiana', 'brasileira'], ARRAY['almoço', 'jantar']),

('Sopa', 'Entrada', 'Líquido quente com ingredientes', ARRAY['legumes', 'carne'], ARRAY['laranja', 'verde', 'marrom'], ARRAY['líquido', 'macio'], ARRAY['irregular'], ARRAY['variados'], 'misturados', ARRAY['caldo'], ARRAY['legumes', 'carne'], ARRAY['sal', 'pimenta'], ARRAY['caldo'], ARRAY['croutons'], 'Líquido quente com ingredientes', '300ml', 150, '{"proteina": 8, "carboidrato": 15, "gordura": 5}', 2, 0.90, ARRAY['Líquido visível', 'Ingredientes flutuando', 'Vapor'], ARRAY['sopa de legumes', 'sopa de carne'], ARRAY['brasileira', 'mediterrânea'], ARRAY['almoço', 'jantar', 'ceia']),

('Omelete', 'Proteína', 'Ovos batidos cozidos', ARRAY['ovo'], ARRAY['amarelo', 'dourado'], ARRAY['macio', 'fofo'], ARRAY['redondo', 'oval'], ARRAY['médio'], 'centralizado', ARRAY['ovo'], ARRAY['queijo', 'legumes'], ARRAY['sal', 'pimenta'], ARRAY['molho'], ARRAY['salada'], 'Ovos batidos cozidos', '2 ovos', 300, '{"proteina": 20, "carboidrato": 2, "gordura": 25}', 2, 0.95, ARRAY['Cor amarela', 'Forma redonda', 'Textura macia'], ARRAY['omelete simples', 'omelete recheado'], ARRAY['francesa', 'brasileira'], ARRAY['café da manhã', 'almoço']),

('Pizza', 'Prato Principal', 'Massa redonda com cobertura', ARRAY['massa', 'queijo'], ARRAY['dourado', 'vermelho', 'branco'], ARRAY['crocante', 'derretido'], ARRAY['redondo'], ARRAY['grande'], 'redondo', ARRAY['massa'], ARRAY['queijo', 'tomate'], ARRAY['sal', 'orégano'], ARRAY['molho de tomate'], ARRAY['queijo ralado'], 'Massa redonda com cobertura', '1 fatia', 300, '{"proteina": 12, "carboidrato": 45, "gordura": 12}', 1, 0.98, ARRAY['Forma redonda', 'Queijo derretido', 'Molho vermelho'], ARRAY['pizza margherita', 'pizza pepperoni'], ARRAY['italiana'], ARRAY['almoço', 'jantar', 'ceia']),

('Hambúrguer', 'Prato Principal', 'Pão com carne e ingredientes', ARRAY['pão', 'carne'], ARRAY['dourado', 'marrom'], ARRAY['macio', 'firme'], ARRAY['redondo'], ARRAY['médio'], 'empilhado', ARRAY['pão', 'carne'], ARRAY['alface', 'tomate'], ARRAY['sal', 'pimenta'], ARRAY['ketchup', 'mostarda'], ARRAY['batata frita'], 'Pão com carne e ingredientes', '1 unidade', 500, '{"proteina": 25, "carboidrato": 35, "gordura": 25}', 1, 0.98, ARRAY['Forma redonda', 'Pão dourado', 'Carne marrom'], ARRAY['hambúrguer simples', 'hambúrguer duplo'], ARRAY['americana', 'brasileira'], ARRAY['almoço', 'jantar', 'ceia']),

('Sushi', 'Prato Principal', 'Arroz com peixe cru', ARRAY['arroz', 'peixe'], ARRAY['branco', 'rosa', 'laranja'], ARRAY['macio', 'firme'], ARRAY['cilíndrico', 'oval'], ARRAY['pequeno'], 'organizado', ARRAY['arroz', 'peixe'], ARRAY['alga', 'pepino'], ARRAY['wasabi', 'gengibre'], ARRAY['molho de soja'], ARRAY['gengibre'], 'Arroz com peixe cru', '6 peças', 250, '{"proteina": 15, "carboidrato": 45, "gordura": 2}', 3, 0.85, ARRAY['Forma cilíndrica', 'Arroz branco', 'Peixe colorido'], ARRAY['sushi de salmão', 'sushi de atum'], ARRAY['japonesa'], ARRAY['almoço', 'jantar']),

('Taco', 'Prato Principal', 'Tortilla com recheio', ARRAY['tortilla', 'carne'], ARRAY['dourado', 'marrom'], ARRAY['crocante', 'macio'], ARRAY['em forma de U'], ARRAY['médio'], 'aberto', ARRAY['tortilla'], ARRAY['carne', 'legumes'], ARRAY['sal', 'pimenta'], ARRAY['molho'], ARRAY['salsa'], 'Tortilla com recheio', '2 unidades', 400, '{"proteina": 20, "carboidrato": 40, "gordura": 15}', 2, 0.90, ARRAY['Forma de U', 'Tortilla dourada', 'Recheio visível'], ARRAY['taco de carne', 'taco de frango'], ARRAY['mexicana'], ARRAY['almoço', 'jantar', 'ceia']),

('Cuscuz', 'Carboidrato', 'Sêmola de milho cozida', ARRAY['sêmola'], ARRAY['amarelo', 'dourado'], ARRAY['soltinho'], ARRAY['granulado'], ARRAY['médio'], 'centralizado', ARRAY['sêmola'], ARRAY['legumes', 'carne'], ARRAY['sal', 'azeite'], ARRAY['molho'], ARRAY['legumes'], 'Sêmola de milho cozida', '1 xícara', 200, '{"proteina": 5, "carboidrato": 40, "gordura": 2}', 3, 0.85, ARRAY['Cor amarela', 'Textura granulada', 'Forma solta'], ARRAY['cuscuz simples', 'cuscuz com legumes'], ARRAY['brasileira', 'mediterrânea'], ARRAY['café da manhã', 'almoço']),

('Quinoa', 'Carboidrato', 'Grãos pequenos cozidos', ARRAY['quinoa'], ARRAY['branco', 'amarelo'], ARRAY['soltinho'], ARRAY['grãos pequenos'], ARRAY['pequeno'], 'espalhado', ARRAY['quinoa'], ARRAY['legumes', 'ervas'], ARRAY['sal', 'azeite'], ARRAY['molho'], ARRAY['legumes'], 'Grãos pequenos cozidos', '1/2 xícara', 150, '{"proteina": 6, "carboidrato": 30, "gordura": 3}', 4, 0.80, ARRAY['Grãos pequenos', 'Cor clara', 'Textura solta'], ARRAY['quinoa branca', 'quinoa colorida'], ARRAY['andina', 'mediterrânea'], ARRAY['almoço', 'jantar']),

('Lentilha', 'Proteína', 'Grãos pequenos cozidos', ARRAY['lentilha'], ARRAY['marrom', 'verde', 'vermelho'], ARRAY['macio'], ARRAY['grãos pequenos'], ARRAY['pequeno'], 'espalhado', ARRAY['lentilha'], ARRAY['cebola', 'alho'], ARRAY['sal', 'pimenta'], ARRAY['caldo'], ARRAY['arroz'], 'Grãos pequenos cozidos', '1/2 xícara', 180, '{"proteina": 12, "carboidrato": 30, "gordura": 1}', 3, 0.85, ARRAY['Grãos pequenos', 'Cor variada', 'Textura macia'], ARRAY['lentilha marrom', 'lentilha vermelha'], ARRAY['indiana', 'mediterrânea'], ARRAY['almoço', 'jantar']),

('Grão de Bico', 'Proteína', 'Grãos médios cozidos', ARRAY['grão de bico'], ARRAY['bege', 'dourado'], ARRAY['macio'], ARRAY['grãos médios'], ARRAY['médio'], 'espalhado', ARRAY['grão de bico'], ARRAY['cebola', 'alho'], ARRAY['sal', 'pimenta'], ARRAY['molho'], ARRAY['salada'], 'Grãos médios cozidos', '1/2 xícara', 200, '{"proteina": 10, "carboidrato": 35, "gordura": 3}', 3, 0.85, ARRAY['Grãos médios', 'Cor bege', 'Forma redonda'], ARRAY['grão de bico simples', 'hummus'], ARRAY['mediterrânea', 'indiana'], ARRAY['almoço', 'jantar']),

('Batata', 'Carboidrato', 'Tubérculo cozido ou frito', ARRAY['batata'], ARRAY['amarelo', 'dourado'], ARRAY['macio', 'crocante'], ARRAY['irregular'], ARRAY['médio'], 'variado', ARRAY['batata'], ARRAY['sal', 'azeite'], ARRAY['sal', 'pimenta'], ARRAY['molho'], ARRAY['carne'], 'Tubérculo cozido ou frito', '200g', 250, '{"proteina": 5, "carboidrato": 55, "gordura": 3}', 1, 0.98, ARRAY['Forma irregular', 'Cor amarela', 'Tamanho médio'], ARRAY['batata cozida', 'batata frita'], ARRAY['brasileira', 'mediterrânea'], ARRAY['almoço', 'jantar']),

('Mandioca', 'Carboidrato', 'Tubérculo cozido', ARRAY['mandioca'], ARRAY['branco', 'amarelo'], ARRAY['macio'], ARRAY['irregular'], ARRAY['médio'], 'variado', ARRAY['mandioca'], ARRAY['sal', 'azeite'], ARRAY['sal', 'pimenta'], ARRAY['molho'], ARRAY['carne'], 'Tubérculo cozido', '200g', 200, '{"proteina": 2, "carboidrato": 50, "gordura": 1}', 2, 0.90, ARRAY['Forma irregular', 'Cor clara', 'Textura macia'], ARRAY['mandioca cozida', 'farofa'], ARRAY['brasileira'], ARRAY['almoço', 'jantar']),

('Inhame', 'Carboidrato', 'Tubérculo cozido', ARRAY['inhame'], ARRAY['branco', 'amarelo'], ARRAY['macio'], ARRAY['irregular'], ARRAY['médio'], 'variado', ARRAY['inhame'], ARRAY['sal', 'azeite'], ARRAY['sal', 'pimenta'], ARRAY['molho'], ARRAY['carne'], 'Tubérculo cozido', '200g', 220, '{"proteina": 3, "carboidrato": 52, "gordura": 1}', 3, 0.85, ARRAY['Forma irregular', 'Cor clara', 'Textura macia'], ARRAY['inhame cozido', 'purê de inhame'], ARRAY['brasileira', 'africana'], ARRAY['almoço', 'jantar']),

('Cará', 'Carboidrato', 'Tubérculo cozido', ARRAY['cará'], ARRAY['branco', 'amarelo'], ARRAY['macio'], ARRAY['irregular'], ARRAY['médio'], 'variado', ARRAY['cará'], ARRAY['sal', 'azeite'], ARRAY['sal', 'pimenta'], ARRAY['molho'], ARRAY['carne'], 'Tubérculo cozido', '200g', 210, '{"proteina": 2, "carboidrato": 50, "gordura": 1}', 3, 0.85, ARRAY['Forma irregular', 'Cor clara', 'Textura macia'], ARRAY['cará cozido', 'purê de cará'], ARRAY['brasileira'], ARRAY['almoço', 'jantar']),

('Aipim', 'Carboidrato', 'Tubérculo cozido', ARRAY['aipim'], ARRAY['branco', 'amarelo'], ARRAY['macio'], ARRAY['irregular'], ARRAY['médio'], 'variado', ARRAY['aipim'], ARRAY['sal', 'azeite'], ARRAY['sal', 'pimenta'], ARRAY['molho'], ARRAY['carne'], 'Tubérculo cozido', '200g', 200, '{"proteina": 2, "carboidrato": 48, "gordura": 1}', 3, 0.85, ARRAY['Forma irregular', 'Cor clara', 'Textura macia'], ARRAY['aipim cozido', 'farofa de aipim'], ARRAY['brasileira'], ARRAY['almoço', 'jantar']);

-- CRIAR ÍNDICES PARA PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_combinacoes_visuais_categoria ON combinacoes_visuais_imagem(categoria_prato);
CREATE INDEX IF NOT EXISTS idx_combinacoes_visuais_alimentos ON combinacoes_visuais_imagem USING GIN(alimentos_identificaveis);
CREATE INDEX IF NOT EXISTS idx_combinacoes_visuais_cores ON combinacoes_visuais_imagem USING GIN(cores_dominantes);

-- HABILITAR RLS
ALTER TABLE combinacoes_visuais_imagem ENABLE ROW LEVEL SECURITY;

-- POLÍTICA DE ACESSO PÚBLICO
CREATE POLICY "Public read access" ON combinacoes_visuais_imagem FOR SELECT USING (true);

-- COMENTÁRIO
COMMENT ON TABLE combinacoes_visuais_imagem IS 'Combinações visuais de alimentos para facilitar análise de imagens de pratos'; 