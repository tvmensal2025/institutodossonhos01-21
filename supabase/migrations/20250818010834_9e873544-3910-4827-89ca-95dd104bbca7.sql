-- Populate taco_foods table with essential TACO foods
-- Clear existing data first
DELETE FROM taco_foods;

-- Insert essential TACO foods with proper nutritional data
INSERT INTO taco_foods (nome, codigo, categoria, subcategoria, energia_kcal, proteina_g, carboidrato_g, fibra_g, lipidios_g, calcio_mg, ferro_mg, sodio_mg, vitamina_c_mg) VALUES
-- Cereais e derivados
('Arroz branco cozido', 100, 'cereais', 'arroz', 128, 2.5, 26.2, 1.6, 0.2, 4, 1.3, 1, 0),
('Arroz integral cozido', 101, 'cereais', 'arroz', 124, 2.6, 25.8, 2.7, 1.0, 5, 0.3, 1, 0),
('Aveia em flocos', 102, 'cereais', 'aveia', 394, 13.9, 66.6, 9.1, 8.5, 48, 4.4, 5, 0),
('Farinha de trigo', 103, 'cereais', 'farinha', 364, 10.3, 75.1, 2.3, 0.8, 18, 1.4, 2, 0),
('Macarrão cozido', 104, 'cereais', 'massa', 102, 3.4, 20.3, 1.8, 0.5, 5, 0.5, 1, 0),
('Pão francês', 105, 'cereais', 'pao', 300, 8.0, 58.6, 6.7, 3.1, 40, 2.3, 643, 0),
('Pão integral', 106, 'cereais', 'pao', 253, 9.4, 43.1, 6.9, 4.1, 57, 2.5, 454, 0),
('Quinoa cozida', 107, 'cereais', 'quinoa', 120, 4.4, 19.7, 2.8, 1.9, 17, 1.5, 2, 0),

-- Verduras, hortaliças e derivados  
('Alface', 200, 'vegetais', 'folhosas', 15, 1.4, 2.9, 2.0, 0.4, 40, 0.4, 9, 9.2),
('Brócolis cozido', 201, 'vegetais', 'cruciferas', 25, 2.6, 4.0, 3.4, 0.3, 400, 0.5, 8, 78.9),
('Cenoura crua', 202, 'vegetais', 'raizes', 43, 1.3, 10.2, 3.2, 0.2, 35, 0.2, 42, 2.6),
('Couve-flor cozida', 203, 'vegetais', 'cruciferas', 23, 1.9, 4.3, 2.4, 0.2, 26, 0.4, 15, 46.4),
('Espinafre cozido', 204, 'vegetais', 'folhosas', 25, 3.4, 3.8, 2.4, 0.3, 136, 2.4, 82, 9.6),
('Tomate cru', 205, 'vegetais', 'frutos', 15, 1.1, 3.1, 1.2, 0.3, 9, 0.3, 4, 21.2),

-- Frutas e derivados
('Banana prata', 300, 'frutas', 'tropicais', 98, 1.3, 26.0, 2.0, 0.1, 8, 0.3, 1, 17.5),
('Laranja pera', 301, 'frutas', 'citricas', 45, 1.0, 11.7, 4.0, 0.2, 34, 0.1, 6, 56.9),
('Maçã fuji', 302, 'frutas', 'pomaceas', 56, 0.3, 15.2, 1.3, 0.4, 3, 0.1, 0, 2.4),
('Mamão formosa', 303, 'frutas', 'tropicais', 45, 0.8, 11.6, 1.8, 0.1, 25, 0.1, 3, 82.2),
('Abacaxi', 304, 'frutas', 'tropicais', 48, 0.9, 12.3, 1.0, 0.1, 22, 0.3, 1, 34.6),
('Uva rubi', 305, 'frutas', 'videiras', 61, 0.6, 16.0, 0.9, 0.4, 15, 0.4, 9, 0.8),

-- Leguminosas e derivados
('Feijão preto cozido', 400, 'leguminosas', 'feijao', 77, 4.5, 14.0, 8.4, 0.5, 29, 1.5, 2, 0),
('Feijão carioca cozido', 401, 'leguminosas', 'feijao', 76, 4.8, 13.6, 8.5, 0.5, 27, 1.3, 2, 0),
('Lentilha cozida', 402, 'leguminosas', 'lentilha', 93, 6.3, 16.3, 7.9, 0.5, 19, 1.5, 2, 1.5),
('Grão de bico cozido', 403, 'leguminosas', 'grao_bico', 164, 8.9, 27.4, 7.6, 2.6, 49, 2.9, 24, 4.0),
('Soja cozida', 404, 'leguminosas', 'soja', 141, 12.5, 9.9, 6.0, 6.4, 125, 2.1, 1, 15.2),

-- Carnes e derivados
('Carne bovina (alcatra)', 500, 'carnes', 'bovina', 163, 23.0, 0, 0, 7.6, 4, 2.0, 53, 0),
('Frango (peito sem pele)', 501, 'carnes', 'ave', 159, 32.0, 0, 0, 3.0, 4, 0.4, 77, 0),
('Peixe (tilápia)', 502, 'carnes', 'peixe', 96, 20.1, 0, 0, 1.7, 14, 0.6, 59, 0),
('Ovo de galinha cozido', 503, 'carnes', 'ovos', 150, 13.3, 0.6, 0, 10.6, 49, 1.8, 294, 0),

-- Leite e derivados
('Leite integral', 600, 'laticinios', 'leite', 61, 2.9, 4.3, 0, 3.5, 113, 0.1, 41, 0.9),
('Iogurte natural', 601, 'laticinios', 'iogurte', 51, 4.1, 4.0, 0, 1.5, 143, 0.1, 44, 0.8),
('Queijo mussarela', 602, 'laticinios', 'queijo', 289, 25.0, 3.4, 0, 20.3, 875, 0.3, 682, 0),

-- Óleos e gorduras
('Óleo de soja', 700, 'oleos', 'vegetal', 884, 0, 0, 0, 100.0, 0, 0, 0, 0),
('Azeite de oliva', 701, 'oleos', 'vegetal', 884, 0, 0, 0, 100.0, 1, 0.6, 2, 0),

-- Açúcares e doces
('Açúcar cristal', 800, 'acucares', 'refinado', 387, 0, 99.5, 0, 0, 1, 0, 0, 0),
('Mel de abelha', 801, 'acucares', 'natural', 309, 0.4, 84.0, 0.2, 0, 3, 0.4, 7, 0.5),

-- Bebidas
('Água', 900, 'bebidas', 'agua', 0, 0, 0, 0, 0, 0, 0, 0, 0),
('Suco de laranja natural', 901, 'bebidas', 'suco', 37, 0.5, 9.1, 0.1, 0.1, 22, 0.1, 1, 53.7),

-- Oleaginosas
('Castanha do Pará', 1000, 'oleaginosas', 'castanha', 643, 14.5, 12.8, 7.9, 63.5, 146, 2.8, 1, 0.7),
('Amendoim torrado', 1001, 'oleaginosas', 'amendoim', 544, 27.2, 20.3, 8.0, 43.9, 72, 1.3, 6, 0);

-- Update statistics
ANALYZE taco_foods;