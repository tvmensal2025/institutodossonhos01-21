-- Expand TACO foods database with comprehensive Brazilian food data
-- Add much more foods to taco_foods table

INSERT INTO taco_foods (nome, codigo, categoria, subcategoria, energia_kcal, proteina_g, carboidrato_g, fibra_g, lipidios_g, calcio_mg, ferro_mg, sodio_mg, vitamina_c_mg) VALUES

-- Mais cereais e derivados
('Canjica cozida', 108, 'cereais', 'milho', 87, 2.0, 18.7, 1.1, 0.6, 3, 0.4, 1, 0),
('Canjiquinha cozida', 109, 'cereais', 'milho', 85, 2.1, 18.2, 1.2, 0.5, 4, 0.5, 2, 0),
('Cuscuz paulista', 110, 'cereais', 'milho', 112, 2.6, 23.1, 1.8, 0.8, 7, 0.6, 3, 0),
('Farinha de milho', 111, 'cereais', 'farinha', 365, 7.3, 77.5, 7.3, 2.4, 12, 2.1, 1, 0),
('Farinha de mandioca', 112, 'cereais', 'farinha', 361, 1.2, 88.0, 6.0, 0.6, 37, 1.6, 14, 1.9),
('Tapioca', 113, 'cereais', 'mandioca', 352, 0.6, 86.0, 0.1, 0.1, 4, 0.3, 1, 0),
('Biscoito cream cracker', 114, 'cereais', 'biscoito', 432, 9.4, 70.7, 2.5, 12.6, 120, 3.5, 967, 0),
('Biscoito doce', 115, 'cereais', 'biscoito', 443, 6.5, 74.8, 2.0, 13.8, 57, 2.8, 323, 0),

-- Mais verduras e hortaliças
('Abobrinha cozida', 206, 'vegetais', 'abobora', 19, 1.2, 4.0, 1.4, 0.2, 23, 0.4, 2, 17.8),
('Acelga cozida', 207, 'vegetais', 'folhosas', 20, 2.2, 3.3, 1.8, 0.3, 58, 2.0, 179, 18.2),
('Agrião cru', 208, 'vegetais', 'folhosas', 17, 2.9, 2.9, 1.5, 0.2, 133, 2.6, 27, 64.6),
('Aipo cru', 209, 'vegetais', 'talos', 14, 0.8, 3.0, 1.7, 0.1, 35, 0.4, 126, 7.0),
('Berinjela cozida', 210, 'vegetais', 'frutos', 20, 0.8, 4.6, 2.2, 0.1, 15, 0.3, 1, 1.8),
('Beterraba cozida', 211, 'vegetais', 'raizes', 32, 1.9, 7.2, 3.4, 0.1, 18, 0.3, 77, 3.6),
('Cebola crua', 212, 'vegetais', 'bulbos', 43, 1.8, 10.1, 1.8, 0.2, 25, 0.2, 3, 7.4),
('Chuchu cozido', 213, 'vegetais', 'cucurbitaceas', 17, 0.9, 4.0, 1.3, 0.1, 15, 0.3, 2, 7.7),
('Couve crua', 214, 'vegetais', 'folhosas', 29, 3.3, 5.1, 3.1, 0.5, 145, 0.5, 9, 96.0),
('Couve refogada', 215, 'vegetais', 'folhosas', 31, 2.9, 4.7, 2.8, 0.8, 131, 0.4, 8, 86.4),
('Maxixe cozido', 216, 'vegetais', 'cucurbitaceas', 18, 1.7, 3.5, 4.6, 0.1, 47, 1.5, 3, 13.6),
('Pepino cru', 217, 'vegetais', 'cucurbitaceas', 13, 0.9, 2.9, 0.7, 0.1, 14, 0.1, 3, 1.8),
('Pimentão amarelo cru', 218, 'vegetais', 'frutos', 22, 1.2, 5.1, 1.7, 0.2, 11, 0.4, 2, 201.4),
('Pimentão verde cru', 219, 'vegetais', 'frutos', 21, 1.0, 4.6, 1.7, 0.3, 9, 0.3, 3, 101.0),
('Quiabo cozido', 220, 'vegetais', 'frutos', 23, 1.8, 4.5, 4.6, 0.3, 112, 0.8, 4, 9.4),
('Rabanete cru', 221, 'vegetais', 'raizes', 12, 1.0, 2.0, 1.6, 0.1, 27, 0.3, 19, 14.8),
('Repolho cru', 222, 'vegetais', 'folhosas', 22, 1.3, 4.9, 2.0, 0.2, 37, 0.4, 7, 34.4),
('Rúcula crua', 223, 'vegetais', 'folhosas', 17, 2.1, 2.9, 1.6, 0.4, 309, 5.2, 20, 110.0),

-- Mais frutas
('Açaí polpa', 306, 'frutas', 'palmaceas', 58, 1.0, 6.2, 2.6, 3.9, 35, 0.4, 7, 9.0),
('Acerola', 307, 'frutas', 'tropicais', 33, 0.4, 8.0, 1.5, 0.3, 12, 0.2, 7, 1677.8),
('Água de coco', 308, 'frutas', 'liquidas', 22, 0.1, 5.5, 0, 0.1, 18, 0.1, 4, 1.2),
('Ameixa fresca', 309, 'frutas', 'caroço', 53, 0.8, 13.0, 1.5, 0.1, 5, 0.1, 0, 7.0),
('Amora', 310, 'frutas', 'vermelhas', 35, 1.3, 8.1, 6.6, 0.4, 35, 0.9, 1, 13.0),
('Atemóia', 311, 'frutas', 'tropicais', 90, 1.4, 22.4, 1.9, 0.1, 30, 0.3, 4, 19.0),
('Caju', 312, 'frutas', 'tropicais', 36, 1.0, 8.4, 1.7, 0.3, 4, 0.5, 5, 219.7),
('Caqui', 313, 'frutas', 'orientais', 71, 0.8, 19.3, 6.5, 0.1, 6, 0.1, 1, 29.6),
('Carambola', 314, 'frutas', 'tropicais', 26, 1.0, 6.0, 1.7, 0.2, 5, 0.4, 4, 57.0),
('Coco seco', 315, 'frutas', 'oleaginosas', 406, 13.6, 4.8, 21.6, 29.5, 160, 2.4, 58, 1.0),
('Figo', 316, 'frutas', 'mediterráneas', 41, 1.2, 9.1, 1.8, 0.4, 49, 0.4, 2, 1.3),
('Goiaba vermelha', 317, 'frutas', 'tropicais', 52, 1.1, 12.4, 6.2, 0.4, 5, 0.3, 3, 80.6),
('Goiaba branca', 318, 'frutas', 'tropicais', 46, 1.0, 11.4, 6.3, 0.1, 3, 0.2, 3, 99.2),
('Graviola', 319, 'frutas', 'tropicais', 62, 1.0, 15.8, 1.9, 0.2, 40, 0.2, 4, 19.8),
('Jabuticaba', 320, 'frutas', 'brasileiras', 58, 0.6, 15.3, 2.3, 0.1, 8, 0.3, 3, 12.8),
('Jaca', 321, 'frutas', 'tropicais', 88, 1.2, 22.4, 1.6, 0.3, 35, 0.6, 3, 13.7),
('Jambo', 322, 'frutas', 'tropicais', 27, 0.7, 6.6, 5.1, 0.2, 5, 0.1, 14, 22.3),
('Kiwi', 323, 'frutas', 'temperadas', 56, 1.6, 11.5, 2.7, 0.6, 25, 0.2, 4, 70.8),
('Limão', 324, 'frutas', 'citricas', 22, 0.8, 7.1, 4.6, 0.2, 9, 0.1, 1, 38.2),
('Manga Palmer', 325, 'frutas', 'tropicais', 64, 0.5, 16.7, 1.6, 0.2, 15, 0.1, 2, 17.0),
('Maracujá polpa', 326, 'frutas', 'tropicais', 68, 2.0, 15.0, 1.9, 0.7, 5, 0.6, 6, 19.8),
('Melancia', 327, 'frutas', 'cucurbitaceas', 33, 0.8, 8.1, 0.1, 0.2, 8, 0.2, 1, 6.1),
('Melão', 328, 'frutas', 'cucurbitaceas', 29, 0.6, 7.5, 0.3, 0.1, 6, 0.2, 11, 18.4),
('Morango', 329, 'frutas', 'vermelhas', 30, 0.9, 6.8, 1.7, 0.3, 12, 0.3, 1, 63.6),
('Pêra', 330, 'frutas', 'pomaceas', 53, 0.2, 14.2, 3.0, 0.1, 8, 0.2, 1, 3.0),
('Pêssego', 331, 'frutas', 'caroço', 36, 0.7, 9.1, 1.5, 0.1, 3, 0.2, 0, 7.9),

-- Mais leguminosas
('Amendoim cru', 405, 'leguminosas', 'oleaginosa', 567, 27.0, 18.8, 8.0, 43.9, 76, 2.2, 5, 0),
('Ervilha em vagem', 406, 'leguminosas', 'vagem', 88, 7.5, 15.6, 7.0, 0.2, 43, 1.6, 3, 67.0),
('Ervilha seca cozida', 407, 'leguminosas', 'ervilha', 63, 4.5, 10.0, 8.3, 0.2, 11, 1.0, 2, 1.8),
('Fava cozida', 408, 'leguminosas', 'fava', 76, 5.5, 13.2, 5.1, 0.6, 25, 1.8, 25, 1.2),

-- Carnes, peixes e ovos
('Carne de porco (lombo)', 504, 'carnes', 'suina', 263, 27.3, 0, 0, 17.2, 4, 0.8, 53, 0),
('Linguiça de porco', 505, 'carnes', 'embutidos', 296, 17.4, 1.4, 0, 25.4, 8, 1.1, 1213, 0),
('Mortadela', 506, 'carnes', 'embutidos', 330, 14.2, 2.6, 0, 29.4, 34, 1.4, 1329, 0),
('Presunto', 507, 'carnes', 'embutidos', 289, 20.4, 0, 0, 22.8, 8, 2.2, 1203, 0),
('Salsicha', 508, 'carnes', 'embutidos', 326, 11.5, 1.6, 0, 30.4, 21, 1.2, 1156, 0),
('Sardinha enlatada', 509, 'carnes', 'peixe', 130, 24.2, 0, 0, 2.9, 380, 2.1, 397, 0),
('Atum enlatado', 510, 'carnes', 'peixe', 194, 23.0, 0, 0, 10.6, 7, 0.8, 225, 0),
('Camarão cozido', 511, 'carnes', 'crustaceo', 91, 20.5, 0, 0, 1.2, 117, 0.4, 370, 0),
('Carne seca', 512, 'carnes', 'bovina', 459, 49.3, 0, 0, 26.6, 43, 8.8, 6213, 0),

-- Leites e derivados
('Leite desnatado', 603, 'laticinios', 'leite', 36, 3.1, 4.9, 0, 0.2, 123, 0.1, 44, 1.0),
('Leite condensado', 604, 'laticinios', 'doce', 321, 8.5, 54.3, 0, 8.6, 284, 0.2, 129, 2.8),
('Creme de leite', 605, 'laticinios', 'creme', 292, 2.4, 3.2, 0, 30.9, 66, 0.1, 38, 0.6),
('Manteiga', 606, 'laticinios', 'gordura', 760, 0.6, 0.1, 0, 84.0, 19, 0.1, 4, 0),
('Queijo prato', 607, 'laticinios', 'queijo', 360, 26.6, 2.9, 0, 26.6, 579, 0.4, 1110, 0),
('Queijo parmesão', 608, 'laticinios', 'queijo', 453, 42.2, 0, 0, 30.0, 1340, 0.8, 1696, 0),
('Requeijão', 609, 'laticinios', 'queijo', 264, 11.1, 3.0, 0, 23.3, 321, 0.2, 880, 0),

-- Oleaginosas e sementes
('Castanha de caju', 1002, 'oleaginosas', 'castanha', 570, 18.5, 28.7, 3.7, 46.3, 30, 5.2, 16, 0.5),
('Castanha do Pará', 1003, 'oleaginosas', 'castanha', 643, 14.5, 12.8, 7.9, 63.5, 146, 2.8, 1, 0.7),
('Noz', 1004, 'oleaginosas', 'noz', 654, 14.4, 18.5, 7.5, 60.3, 61, 2.9, 7, 0.8),
('Amêndoa', 1005, 'oleaginosas', 'amendoa', 640, 19.5, 19.5, 11.6, 53.4, 237, 4.2, 14, 0),
('Avelã', 1006, 'oleaginosas', 'avela', 679, 12.6, 6.1, 8.2, 66.6, 123, 3.3, 3, 1.2),
('Pistache', 1007, 'oleaginosas', 'pistache', 571, 21.4, 16.6, 10.3, 45.8, 854, 4.2, 6, 1.6),
('Semente de girassol', 1008, 'oleaginosas', 'semente', 584, 19.3, 18.8, 11.1, 53.4, 70, 6.4, 116, 1.2),
('Semente de abóbora', 1009, 'oleaginosas', 'semente', 559, 30.2, 10.7, 6.0, 49.1, 46, 8.8, 7, 1.9),

-- Temperos e condimentos
('Alho', 1100, 'temperos', 'bulbo', 113, 7.3, 23.9, 4.1, 0.2, 14, 0.2, 9, 7.0),
('Cebolinha', 1101, 'temperos', 'folhosas', 26, 1.8, 5.1, 2.2, 0.2, 42, 1.0, 3, 18.8),
('Coentro', 1102, 'temperos', 'folhosas', 23, 2.1, 3.7, 2.8, 0.5, 67, 1.8, 46, 27.0),
('Hortelã', 1103, 'temperos', 'folhosas', 44, 3.8, 8.4, 8.0, 0.7, 243, 5.1, 31, 13.3),
('Manjericão', 1104, 'temperos', 'folhosas', 23, 3.2, 2.6, 1.6, 0.6, 177, 3.2, 4, 18.0),
('Orégano seco', 1105, 'temperos', 'seco', 306, 11.0, 64.4, 42.8, 10.3, 1576, 44.0, 15, 0.5),
('Pimenta do reino', 1106, 'temperos', 'especiaria', 255, 10.4, 38.3, 26.5, 3.3, 437, 28.9, 44, 21.0),
('Salsa', 1107, 'temperos', 'folhosas', 36, 3.0, 6.3, 3.3, 0.8, 138, 6.2, 56, 133.0),

-- Doces e açúcares
('Chocolate ao leite', 802, 'acucares', 'chocolate', 549, 7.3, 56.9, 3.4, 32.3, 214, 2.4, 79, 0),
('Chocolate amargo 70%', 803, 'acucares', 'chocolate', 479, 12.9, 28.4, 16.8, 42.6, 62, 17.4, 6, 0),
('Doce de leite', 804, 'acucares', 'doce', 315, 6.9, 55.5, 0, 7.4, 251, 0.4, 195, 2.1),
('Geléia de frutas', 805, 'acucares', 'geleia', 271, 0.4, 69.5, 0.8, 0.1, 15, 0.4, 5, 9.1),
('Rapadura', 806, 'acucares', 'natural', 376, 0.1, 93.8, 0, 0.1, 13, 1.2, 19, 0),

-- Bebidas
('Café coado', 902, 'bebidas', 'cafe', 4, 0.2, 0.6, 0, 0, 2, 0, 1, 0),
('Chá preto', 903, 'bebidas', 'cha', 1, 0, 0.3, 0, 0, 0, 0, 1, 0),
('Guaraná natural', 904, 'bebidas', 'refrigerante', 94, 0, 24.1, 0, 0, 1, 0, 7, 0),
('Suco de acerola', 905, 'bebidas', 'suco', 19, 0.5, 4.0, 0.9, 0.1, 7, 0.1, 2, 931.0),
('Suco de caju', 906, 'bebidas', 'suco', 36, 0.2, 9.4, 0.5, 0.1, 8, 0.2, 2, 185.8),
('Suco de goiaba', 907, 'bebidas', 'suco', 43, 0.2, 11.2, 2.5, 0.1, 4, 0.1, 2, 67.0),
('Vinho tinto', 908, 'bebidas', 'alcoolica', 69, 0.1, 3.8, 0, 0, 9, 0.3, 6, 0),

-- Produtos industrializados
('Biscoito recheado', 116, 'industrializados', 'biscoito', 472, 5.6, 66.0, 2.3, 20.9, 84, 3.1, 368, 0),
('Bolo de chocolate', 117, 'industrializados', 'bolo', 410, 5.1, 53.9, 2.5, 19.7, 28, 1.9, 331, 0.5),
('Salgadinho de milho', 118, 'industrializados', 'snack', 568, 6.0, 53.0, 4.0, 38.0, 40, 1.5, 1067, 0),
('Refrigerante cola', 909, 'industrializados', 'refrigerante', 37, 0, 9.7, 0, 0, 4, 0.1, 1, 0),
('Sorvete de creme', 119, 'industrializados', 'gelado', 207, 3.8, 23.2, 0.5, 11.0, 100, 0.2, 59, 0.8);

-- Update table statistics for better query performance
ANALYZE taco_foods;

-- Create indexes for better search performance
CREATE INDEX IF NOT EXISTS idx_taco_foods_categoria ON taco_foods(categoria);
CREATE INDEX IF NOT EXISTS idx_taco_foods_nome_text ON taco_foods USING GIN (to_tsvector('portuguese', nome));
CREATE INDEX IF NOT EXISTS idx_taco_foods_energia_kcal ON taco_foods(energia_kcal);