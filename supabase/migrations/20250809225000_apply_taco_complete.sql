-- ========================================
-- APLICAR BASE TACO COMPLETA
-- 63 alimentos principais
-- ========================================

-- Limpar dados existentes (opcional)
-- DELETE FROM valores_nutricionais_completos;

-- Inserir valores nutricionais diretamente (sem tabela alimentos_completos)
INSERT INTO valores_nutricionais_completos (alimento_nome, kcal, proteina, gorduras, carboidratos, fibras, sodio) VALUES
('Arroz integral cozido', 124, 3, 1, 26, 3, 1),
('Arroz integral cru', 360, 7, 2, 77, 5, 2),
('Arroz tipo 1 cozido', 128, 3, 0, 28, 2, 1),
('Arroz tipo 1 cru', 358, 7, 0, 79, 2, 1),
('Arroz tipo 2 cozido', 130, 3, 0, 28, 1, 2),
('Arroz tipo 2 cru', 358, 7, 0, 79, 2, 1),
('Aveia flocos crua', 394, 14, 8, 67, 9, 5),
('Biscoito doce maisena', 443, 8, 12, 75, 2, 352),
('Biscoito doce recheado chocolate', 472, 6, 20, 71, 3, 239),
('Biscoito doce recheado morango', 471, 6, 20, 71, 2, 230),
('Biscoito doce wafer chocolate', 502, 6, 25, 68, 2, 137),
('Biscoito doce wafer morango', 513, 5, 26, 67, 1, 120),
('Biscoito salgado cream cracker', 432, 10, 14, 69, 3, 854),
('Bolo mistura para', 419, 6, 6, 85, 2, 463),
('Bolo pronto aipim', 324, 4, 13, 48, 1, 111),
('Bolo pronto chocolate', 410, 6, 18, 55, 1, 283),
('Bolo pronto coco', 333, 6, 11, 52, 1, 190),
('Bolo pronto milho', 311, 5, 12, 45, 1, 134),
('Canjica branca crua', 358, 7, 1, 78, 5, 1),
('Canjica com leite integral', 112, 2, 1, 24, 1, 28),
('Cereais milho flocos com sal', 370, 7, 2, 81, 5, 272),
('Cereais milho flocos sem sal', 363, 7, 1, 80, 2, 31),
('Cereais mingau milho infantil', 394, 6, 1, 87, 3, 399),
('Cereais mistura vitamina trigo cevada aveia', 381, 9, 2, 82, 5, 1163),
('Cereal matinal milho', 365, 7, 1, 84, 4, 655),
('Cereal matinal milho açúcar', 377, 5, 1, 89, 2, 405),
('Creme de arroz pó', 386, 7, 1, 84, 1, 1),
('Creme de milho pó', 333, 5, 2, 86, 4, 594),
('Curau milho verde', 78, 2, 2, 14, 0, 21),
('Curau milho verde mistura para', 402, 2, 13, 80, 3, 223),
('Farinha de arroz enriquecida', 363, 1, 0, 86, 1, 17),
('Farinha de centeio integral', 336, 13, 2, 73, 15, 41),
('Farinha de milho amarela', 351, 7, 1, 79, 5, 45),
('Farinha de rosca', 371, 11, 1, 76, 5, 333),
('Farinha de trigo', 360, 10, 1, 75, 2, 1),
('Farinha láctea de cereais', 415, 12, 6, 78, 2, 125),
('Lasanha massa fresca cozida', 164, 6, 1, 33, 2, 207),
('Lasanha massa fresca crua', 220, 7, 1, 45, 2, 667),
('Macarrão instantâneo', 436, 9, 17, 62, 6, 1516),
('Macarrão trigo cru', 371, 10, 1, 78, 3, 7),
('Macarrão trigo cru com ovos', 371, 10, 2, 77, 2, 15),
('Milho amido cru', 361, 1, 0, 87, 1, 8),
('Milho fubá cru', 353, 7, 2, 79, 5, 0),
('Milho verde cru', 138, 7, 1, 29, 4, 1),
('Milho verde enlatado drenado', 98, 3, 2, 17, 5, 260),
('Mingau tradicional pó', 373, 1, 0, 89, 1, 15),
('Pamonha barra cozimento pré-cozida', 171, 3, 5, 31, 2, 132),
('Pão aveia forma', 343, 12, 6, 60, 6, 606),
('Pão de soja', 309, 11, 4, 57, 6, 663),
('Pão glúten forma', 253, 12, 3, 44, 2, 22),
('Pão milho forma', 292, 8, 3, 56, 4, 507),
('Pão trigo forma integral', 253, 9, 4, 50, 7, 506),
('Pão trigo francês', 300, 8, 3, 59, 2, 648),
('Pão trigo sovado', 311, 8, 3, 61, 2, 431),
('Pastel de carne cru', 289, 11, 9, 42, 1, 1309),
('Pastel de carne frito', 388, 10, 20, 44, 1, 1040),
('Pastel de queijo cru', 308, 10, 10, 46, 1, 985),
('Pastel de queijo frito', 422, 9, 23, 48, 1, 821),
('Pastel massa crua', 310, 7, 5, 57, 1, 1344),
('Pastel massa frita', 570, 6, 41, 49, 1, 1175),
('Pipoca com óleo soja sem sal', 448, 10, 16, 70, 14, 4),
('Polenta pré-cozida', 103, 2, 0, 23, 2, 442),
('Torrada pão francês', 377, 11, 3, 75, 3, 829);

-- ========================================
-- BASE TACO APLICADA COM SUCESSO
-- Total: 63 alimentos principais
-- ========================================
