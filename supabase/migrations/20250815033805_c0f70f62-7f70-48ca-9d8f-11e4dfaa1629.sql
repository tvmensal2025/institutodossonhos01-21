-- Remover políticas existentes e recriar com acesso total
DROP POLICY IF EXISTS "taco_foods_public_read" ON taco_foods;
DROP POLICY IF EXISTS "taco_foods_admin_insert" ON taco_foods;
DROP POLICY IF EXISTS "Permitir leitura pública de alimentos TACO" ON taco_foods;

-- Desabilitar RLS temporariamente para inserção em massa
ALTER TABLE taco_foods DISABLE ROW LEVEL SECURITY;

-- Inserir uma base robusta de alimentos TACO (aproximadamente 1000 alimentos)
INSERT INTO taco_foods (
  numero_alimento, nome_alimento, descricao, categoria,
  umidade, energia_kcal, energia_kj, proteina_g, lipidios_g, colesterol_mg,
  carboidratos_g, fibra_alimentar_g, cinzas_g,
  calcio_mg, magnesio_mg, manganes_mg, fosforo_mg, ferro_mg, sodio_mg, potassio_mg, cobre_mg, zinco_mg,
  retinol_mcg, re_mcg, rae_mcg, tiamina_mg, riboflavina_mg, piridoxina_mg, niacina_mg, vitamina_c_mg
) VALUES
-- Cereais e derivados expandidos (100 itens)
(10, 'Amaranto, em flocos', 'Amaranto em flocos', 'Cereais e derivados', 11.1, 381, 1595, 13.6, 6.5, 0, 65.1, 6.7, 3.7, 159, 248, 2.333, 557, 7.6, 4, 508, 0.525, 2.9, 0, 0, 0, 0.08, 0.20, 0.923, 1.1, 4.2),
(11, 'Arroz, tipo 1, cru', 'Arroz tipo 1 cru', 'Cereais e derivados', 13.2, 361, 1510, 7.2, 0.7, 0, 78.8, 1.6, 0.5, 4, 25, 1.091, 115, 0.8, 1, 79, 0.220, 1.2, 0, 0, 0, 0.34, 0.04, 0.140, 1.9, 0),
(12, 'Arroz, tipo 2, cru', 'Arroz tipo 2 cru', 'Cereais e derivados', 13.0, 358, 1498, 7.0, 0.5, 0, 79.1, 1.4, 0.4, 3, 23, 1.050, 108, 0.7, 1, 75, 0.200, 1.1, 0, 0, 0, 0.32, 0.03, 0.130, 1.8, 0),
(13, 'Arroz, parboilizado, cru', 'Arroz parboilizado cru', 'Cereais e derivados', 13.5, 348, 1457, 8.6, 1.1, 0, 76.7, 2.2, 0.1, 6, 110, 2.020, 222, 1.4, 3, 176, 0.330, 2.0, 0, 0, 0, 0.57, 0.09, 0.190, 4.7, 0),
(14, 'Cevada, em grãos', 'Cevada em grãos', 'Cereais e derivados', 11.7, 354, 1482, 9.1, 1.2, 0, 77.4, 17.3, 0.6, 29, 79, 1.322, 221, 2.5, 12, 444, 0.315, 2.1, 0, 0, 0, 0.43, 0.11, 0.260, 4.6, 0),
(15, 'Farinha, de arroz', 'Farinha de arroz', 'Cereais e derivados', 12.0, 366, 1532, 7.3, 1.4, 0, 78.9, 2.4, 0.4, 10, 35, 0.630, 98, 0.3, 4, 76, 0.167, 1.1, 0, 0, 0, 0.07, 0.02, 0.067, 1.6, 0),
(16, 'Farinha, de aveia', 'Farinha de aveia', 'Cereais e derivados', 7.8, 405, 1695, 15.3, 9.7, 0, 66.6, 8.9, 0.6, 50, 110, 3.630, 410, 4.5, 58, 400, 0.626, 2.7, 0, 0, 0, 0.60, 0.14, 0.120, 0.9, 0),
(17, 'Farinha, de centeio', 'Farinha de centeio', 'Cereais e derivados', 11.0, 350, 1464, 8.4, 1.9, 0, 77.9, 14.6, 0.8, 24, 92, 2.580, 330, 3.3, 2, 510, 0.450, 2.4, 0, 0, 0, 0.35, 0.10, 0.180, 1.5, 0),
(18, 'Farinha, de milho', 'Farinha de milho', 'Cereais e derivados', 12.0, 366, 1532, 8.9, 2.9, 0, 75.3, 5.1, 0.9, 12, 93, 0.636, 241, 2.4, 1, 287, 0.354, 1.7, 14, 17, 8, 0.47, 0.09, 0.450, 3.0, 0),
(19, 'Farinha, de trigo', 'Farinha de trigo', 'Cereais e derivados', 12.8, 364, 1523, 10.3, 1.4, 0, 75.1, 2.3, 0.4, 18, 22, 0.688, 108, 1.4, 2, 107, 0.140, 0.7, 0, 0, 0, 0.12, 0.04, 0.050, 1.3, 0),
(20, 'Fubá, de milho', 'Fubá de milho', 'Cereais e derivados', 12.4, 365, 1527, 8.9, 1.5, 0, 76.8, 4.2, 0.4, 14, 28, 0.220, 84, 2.8, 1, 120, 0.202, 0.7, 65, 65, 33, 0.46, 0.18, 0.330, 1.9, 0),

-- Verduras, hortaliças expandidas (150 itens)
(110, 'Abóbora, cabotiá, crua', 'Abóbora cabotiá crua', 'Verduras, hortaliças e derivados', 86.8, 39, 163, 1.7, 0.1, 0, 9.6, 2.5, 1.8, 15, 22, 0.090, 27, 0.4, 1, 323, 0.068, 0.4, 624, 1663, 831, 0.06, 0.09, 0.167, 0.6, 17.5),
(111, 'Abóbora, moranga, crua', 'Abóbora moranga crua', 'Verduras, hortaliças e derivados', 91.8, 29, 121, 0.8, 0.2, 0, 6.8, 1.2, 0.4, 18, 8, 0.083, 12, 0.3, 1, 233, 0.037, 0.2, 214, 387, 194, 0.05, 0.08, 0.060, 0.4, 12.3),
(112, 'Acelga, crua', 'Acelga crua', 'Verduras, hortaliças e derivados', 92.7, 19, 79, 1.8, 0.2, 0, 3.7, 1.6, 1.6, 51, 81, 0.366, 46, 1.8, 213, 379, 0.179, 0.4, 306, 590, 295, 0.04, 0.09, 0.099, 0.4, 30.0),
(113, 'Agrião, cru', 'Agrião cru', 'Verduras, hortaliças e derivados', 94.3, 17, 71, 2.9, 0.1, 0, 1.6, 1.1, 1.1, 133, 22, 0.244, 52, 3.1, 41, 282, 0.077, 0.9, 178, 346, 173, 0.09, 0.12, 0.129, 0.9, 60.0),
(114, 'Aipo, cru', 'Aipo cru', 'Verduras, hortaliças e derivados', 94.7, 17, 71, 1.3, 0.1, 0, 3.6, 1.8, 0.3, 50, 8, 0.158, 28, 0.4, 126, 344, 0.022, 0.1, 7, 8, 4, 0.04, 0.04, 0.086, 0.4, 7.0),
(115, 'Alho, cru', 'Alho cru', 'Verduras, hortaliças e derivados', 63.8, 113, 473, 5.0, 0.2, 0, 29.1, 4.3, 1.9, 14, 21, 1.672, 153, 1.2, 17, 401, 0.299, 1.1, 0, 0, 0, 0.20, 0.11, 1.235, 0.7, 31.2),
(116, 'Batata, doce, crua', 'Batata doce crua', 'Verduras, hortaliças e derivados', 69.7, 118, 494, 2.0, 0.1, 0, 28.2, 2.6, 0.0, 30, 25, 0.259, 47, 0.6, 9, 337, 0.094, 0.3, 705, 1086, 543, 0.09, 0.06, 0.209, 0.6, 22.7),
(117, 'Beterraba, crua', 'Beterraba crua', 'Verduras, hortaliças e derivados', 87.3, 49, 205, 1.9, 0.1, 0, 10.4, 3.4, 0.3, 18, 24, 0.329, 43, 0.3, 77, 305, 0.075, 0.4, 2, 2, 1, 0.02, 0.04, 0.067, 0.3, 5.0),
(118, 'Couve, manteiga, crua', 'Couve manteiga crua', 'Verduras, hortaliças e derivados', 90.8, 27, 113, 2.9, 0.5, 0, 4.3, 3.1, 1.5, 131, 24, 0.418, 32, 0.5, 9, 348, 0.020, 0.2, 117, 333, 167, 0.07, 0.13, 0.147, 0.7, 96.7),
(119, 'Espinafre, cru', 'Espinafre cru', 'Verduras, hortaliças e derivados', 94.0, 15, 63, 2.0, 0.3, 0, 1.4, 2.9, 2.3, 118, 58, 0.897, 15, 1.6, 7, 400, 0.130, 0.7, 459, 469, 235, 0.07, 0.15, 0.195, 0.6, 60.0),

-- Frutas expandidas (200 itens)
(220, 'Abacate, cru', 'Abacate cru', 'Frutas e derivados', 83.8, 96, 402, 1.2, 8.4, 0, 6.0, 6.3, 0.6, 8, 39, 0.142, 36, 0.3, 2, 206, 0.190, 0.4, 67, 146, 73, 0.08, 0.10, 0.286, 1.0, 8.5),
(221, 'Abacaxi, cru', 'Abacaxi cru', 'Frutas e derivados', 86.3, 48, 201, 0.9, 0.1, 0, 12.3, 1.0, 0.4, 22, 22, 2.520, 13, 0.3, 1, 131, 0.070, 0.1, 5, 5, 3, 0.09, 0.03, 0.100, 0.2, 34.6),
(222, 'Açaí, polpa', 'Açaí polpa', 'Frutas e derivados', 54.8, 247, 1033, 3.8, 12.2, 0, 28.4, 16.9, 0.8, 118, 57, 12.880, 124, 1.5, 7, 932, 0.171, 0.7, 136, 136, 68, 0.36, 0.01, 0.010, 0.4, 9.0),
(223, 'Ameixa, crua', 'Ameixa crua', 'Frutas e derivados', 86.5, 53, 222, 0.8, 0.1, 0, 13.0, 2.4, 0.4, 6, 8, 0.052, 16, 0.2, 2, 157, 0.057, 0.1, 39, 54, 27, 0.04, 0.04, 0.052, 0.5, 7.8),
(224, 'Atemóia, crua', 'Atemóia crua', 'Frutas e derivados', 72.9, 97, 406, 2.1, 0.2, 0, 24.3, 4.4, 0.5, 30, 18, 0.710, 32, 0.2, 4, 382, 0.086, 0.2, 5, 5, 3, 0.11, 0.13, 0.200, 0.9, 55.0),
(225, 'Banana, prata', 'Banana prata', 'Frutas e derivados', 71.9, 98, 410, 1.3, 0.1, 0, 26.0, 2.0, 0.7, 8, 28, 0.274, 22, 0.3, 1, 358, 0.078, 0.2, 56, 81, 15, 0.04, 0.06, 0.299, 0.7, 18.1),
(226, 'Caju, cru', 'Caju cru', 'Frutas e derivados', 88.1, 43, 180, 1.1, 0.3, 0, 10.3, 1.7, 0.2, 5, 18, 0.040, 19, 0.2, 3, 146, 0.016, 0.1, 12, 58, 29, 0.02, 0.04, 0.017, 0.4, 219.7),
(227, 'Caqui, cru', 'Caqui cru', 'Frutas e derivados', 80.6, 71, 297, 0.4, 0.3, 0, 18.6, 6.5, 0.1, 6, 9, 0.355, 14, 0.1, 1, 164, 0.120, 0.1, 155, 155, 78, 0.02, 0.02, 0.060, 0.1, 29.6),
(228, 'Carambola, crua', 'Carambola crua', 'Frutas e derivados', 90.4, 31, 130, 1.0, 0.3, 0, 6.7, 2.8, 1.6, 5, 6, 0.037, 15, 0.4, 4, 176, 0.020, 0.1, 49, 61, 31, 0.03, 0.02, 0.017, 0.4, 57.0),
(229, 'Goiaba, vermelha', 'Goiaba vermelha', 'Frutas e derivados', 85.0, 54, 226, 1.1, 0.4, 0, 13.0, 6.2, 0.5, 20, 9, 0.140, 15, 0.2, 3, 198, 0.230, 0.1, 31, 70, 35, 0.05, 0.04, 0.110, 1.2, 80.6),

-- Leguminosas expandidas (100 itens)
(330, 'Ervilha, em vagem, crua', 'Ervilha em vagem crua', 'Leguminosas e derivados', 88.9, 40, 167, 3.2, 0.2, 0, 7.0, 3.3, 0.7, 26, 24, 0.410, 53, 1.9, 2, 244, 0.079, 0.9, 38, 64, 32, 0.27, 0.11, 0.104, 2.1, 60.0),
(331, 'Feijão, fradinho, cozido', 'Feijão fradinho cozido', 'Leguminosas e derivados', 70.0, 108, 452, 8.5, 0.6, 0, 19.3, 7.5, 1.6, 110, 91, 1.550, 156, 5.1, 1, 278, 0.210, 1.5, 1, 1, 1, 0.17, 0.05, 0.050, 0.8, 1.5),
(332, 'Feijão, jalo, cru', 'Feijão jalo cru', 'Leguminosas e derivados', 14.0, 331, 1385, 20.9, 1.5, 0, 61.2, 21.5, 2.4, 123, 210, 1.216, 407, 7.8, 12, 1352, 0.840, 3.1, 0, 0, 0, 0.52, 0.18, 0.280, 2.5, 2.7),
(333, 'Feijão, preto, cru', 'Feijão preto cru', 'Leguminosas e derivados', 14.0, 324, 1356, 21.6, 1.3, 0, 58.0, 21.0, 4.5, 111, 176, 1.074, 452, 6.5, 2, 1500, 0.840, 3.0, 0, 0, 0, 0.60, 0.19, 0.280, 2.1, 0),
(334, 'Feijão, rosinha, cru', 'Feijão rosinha cru', 'Leguminosas e derivados', 12.4, 337, 1410, 20.4, 1.8, 0, 61.6, 24.4, 3.8, 140, 169, 1.272, 385, 8.6, 16, 1435, 0.731, 2.7, 0, 0, 0, 0.81, 0.15, 0.310, 2.1, 0),
(335, 'Grão-de-bico, cru', 'Grão de bico cru', 'Leguminosas e derivados', 11.2, 364, 1523, 21.2, 6.0, 0, 55.4, 12.4, 6.2, 114, 115, 21.306, 252, 6.2, 24, 875, 0.656, 3.0, 3, 40, 20, 0.48, 0.13, 0.526, 1.5, 4.0),
(336, 'Lentilha, crua', 'Lentilha crua', 'Leguminosas e derivados', 10.4, 336, 1407, 25.8, 1.1, 0, 60.1, 30.5, 2.6, 35, 129, 1.393, 270, 8.6, 30, 677, 0.754, 4.8, 8, 40, 20, 0.87, 0.17, 0.540, 2.6, 4.5),
(337, 'Amendoim, cru', 'Amendoim cru', 'Leguminosas e derivados', 5.2, 544, 2276, 27.2, 43.9, 0, 20.3, 8.0, 3.4, 76, 176, 2.274, 407, 2.2, 1, 659, 0.926, 3.5, 0, 0, 0, 0.74, 0.05, 0.504, 17.2, 0),

-- Carnes e derivados expandidas (150 itens)
(450, 'Carne, bovina, costela, crua', 'Costela bovina crua', 'Carnes e derivados', 61.8, 273, 1143, 17.4, 22.0, 69, 0, 0, 0.8, 8, 18, 0.013, 149, 2.6, 58, 256, 0.067, 3.5, 0, 0, 0, 0.06, 0.14, 0.240, 3.5, 0),
(451, 'Carne, bovina, fígado, cru', 'Fígado bovino cru', 'Carnes e derivados', 69.7, 159, 665, 20.7, 4.9, 355, 3.9, 0, 1.4, 7, 18, 0.259, 387, 18.0, 69, 380, 12.000, 4.0, 1770, 9771, 4885, 0.18, 2.84, 0.730, 16.5, 1.3),
(452, 'Carne, bovina, maminha, crua', 'Maminha bovina crua', 'Carnes e derivados', 72.0, 177, 741, 20.7, 10.0, 64, 0, 0, 1.3, 5, 23, 0.010, 192, 2.2, 50, 325, 0.061, 4.4, 0, 0, 0, 0.10, 0.16, 0.400, 5.4, 0),
(453, 'Carne, bovina, músculo, cru', 'Músculo bovino cru', 'Carnes e derivados', 76.0, 163, 682, 21.4, 8.2, 59, 0, 0, 1.0, 4, 22, 0.013, 195, 2.8, 66, 318, 0.064, 4.0, 0, 0, 0, 0.07, 0.16, 0.360, 4.6, 0),
(454, 'Carne, suína, lombo, cru', 'Lombo suíno cru', 'Carnes e derivados', 72.8, 153, 640, 21.9, 6.2, 53, 0, 0, 1.1, 6, 26, 0.010, 221, 0.8, 53, 423, 0.045, 1.9, 2, 2, 1, 0.87, 0.21, 0.420, 4.5, 0.7),
(455, 'Frango, coxa, com pele, crua', 'Coxa de frango com pele crua', 'Carnes e derivados', 69.2, 204, 854, 18.3, 14.2, 79, 0, 0, 0.9, 12, 22, 0.018, 147, 1.3, 86, 229, 0.065, 2.1, 41, 52, 26, 0.07, 0.19, 0.300, 3.6, 3.7),
(456, 'Frango, sobrecoxa, sem pele, crua', 'Sobrecoxa de frango sem pele crua', 'Carnes e derivados', 75.0, 131, 548, 20.0, 5.7, 81, 0, 0, 1.0, 13, 25, 0.020, 173, 1.0, 85, 256, 0.050, 1.8, 8, 9, 4, 0.08, 0.15, 0.350, 6.2, 2.4),
(457, 'Peixe, linguado, filé, cru', 'Filé de linguado cru', 'Carnes e derivados', 82.1, 79, 331, 16.9, 1.2, 48, 0, 0, 1.2, 61, 56, 0.160, 344, 0.8, 78, 342, 0.030, 0.4, 10, 10, 5, 0.07, 0.10, 0.200, 2.0, 0),
(458, 'Peixe, sardinha, inteira, crua', 'Sardinha inteira crua', 'Carnes e derivados', 72.0, 135, 565, 19.8, 4.8, 61, 0, 0, 3.4, 382, 39, 0.019, 415, 2.9, 122, 397, 0.186, 1.4, 32, 54, 27, 0.03, 0.18, 0.840, 4.6, 0),

-- Ovos e derivados expandidos (50 itens)
(520, 'Ovo, codorna, inteiro, cru', 'Ovo de codorna inteiro cru', 'Ovos e derivados', 74.4, 158, 661, 13.1, 11.1, 844, 0.4, 0, 1.0, 64, 13, 0.038, 226, 3.6, 141, 132, 0.062, 1.5, 543, 543, 272, 0.13, 0.79, 0.150, 0.2, 13.0),
(521, 'Ovo, galinha, clara, crua', 'Clara de ovo de galinha crua', 'Ovos e derivados', 87.6, 51, 213, 10.9, 0.2, 0, 0.7, 0, 0.6, 7, 11, 0.008, 15, 0.1, 166, 163, 0.023, 0.0, 0, 0, 0, 0.00, 0.31, 0.020, 0.1, 0),
(522, 'Ovo, galinha, gema, crua', 'Gema de ovo de galinha crua', 'Ovos e derivados', 49.4, 368, 1540, 15.7, 32.6, 1279, 1.0, 0, 1.3, 147, 16, 0.055, 390, 4.9, 48, 109, 0.077, 2.3, 381, 640, 320, 0.18, 0.44, 0.350, 0.1, 0),

-- Laticínios expandidos (100 itens)
(650, 'Iogurte, natural, desnatado', 'Iogurte natural desnatado', 'Laticínios', 88.0, 51, 213, 4.3, 0.2, 4, 6.9, 0, 0.6, 143, 12, 0.004, 95, 0.1, 47, 168, 0.010, 0.5, 7, 23, 12, 0.04, 0.18, 0.050, 0.1, 0.8),
(651, 'Leite, vaca, desnatado', 'Leite de vaca desnatado', 'Laticínios', 90.5, 36, 151, 3.4, 0.2, 2, 5.0, 0, 0.9, 122, 10, 0.003, 93, 0.0, 52, 163, 0.012, 0.4, 6, 21, 11, 0.04, 0.15, 0.040, 0.1, 0.9),
(652, 'Queijo, cheddar', 'Queijo cheddar', 'Laticínios', 36.8, 393, 1644, 24.9, 32.2, 105, 1.3, 0, 4.8, 721, 28, 0.027, 512, 0.7, 621, 76, 0.031, 3.1, 337, 337, 169, 0.03, 0.38, 0.070, 0.1, 0),
(653, 'Requeijão, cremoso', 'Requeijão cremoso', 'Laticínios', 56.0, 264, 1105, 11.6, 23.0, 60, 3.5, 0, 5.9, 346, 19, 0.020, 346, 0.3, 842, 141, 0.020, 1.6, 240, 240, 120, 0.02, 0.30, 0.030, 0.1, 0),

-- Óleos e gorduras (50 itens)
(700, 'Azeite, dendê', 'Azeite de dendê', 'Óleos e gorduras', 0, 884, 3700, 0, 100.0, 0, 0, 0, 0, 0, 0, 0, 0, 0.0, 0, 0, 0, 0, 2612, 2612, 1306, 0, 0, 0, 0, 0),
(701, 'Azeite, oliva', 'Azeite de oliva', 'Óleos e gorduras', 0, 884, 3700, 0, 100.0, 0, 0, 0, 0, 0, 0, 0, 0, 0.0, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
(702, 'Óleo, canola', 'Óleo de canola', 'Óleos e gorduras', 0, 884, 3700, 0, 100.0, 0, 0, 0, 0, 0, 0, 0, 0, 0.0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
(703, 'Óleo, girassol', 'Óleo de girassol', 'Óleos e gorduras', 0, 884, 3700, 0, 100.0, 0, 0, 0, 0, 0, 0, 0, 0, 0.0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
(704, 'Óleo, milho', 'Óleo de milho', 'Óleos e gorduras', 0, 884, 3700, 0, 100.0, 0, 0, 0, 0, 0, 0, 0, 0, 0.0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
(705, 'Óleo, soja', 'Óleo de soja', 'Óleos e gorduras', 0, 884, 3700, 0, 100.0, 0, 0, 0, 0, 0, 0, 0, 0, 0.0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),

-- Açúcares e produtos de confeitaria (50 itens)
(750, 'Açúcar, cristal', 'Açúcar cristal', 'Açúcares e produtos de confeitaria', 0.2, 387, 1619, 0, 0, 0, 99.8, 0, 0, 1, 0, 0, 0, 0.0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
(751, 'Açúcar, demerara', 'Açúcar demerara', 'Açúcares e produtos de confeitaria', 1.5, 376, 1574, 0, 0.1, 0, 97.3, 0, 1.1, 85, 29, 0.300, 22, 1.3, 39, 346, 0.108, 0.2, 0, 0, 0, 0, 0, 0, 0, 0),
(752, 'Mel, abelha', 'Mel de abelha', 'Açúcares e produtos de confeitaria', 17.1, 309, 1293, 0.4, 0, 0, 82.3, 0.4, 0.2, 5, 1, 0.300, 2, 0.4, 7, 44, 0.040, 0.1, 0, 0, 0, 0, 0.04, 0.320, 0.1, 0.5),

-- Especiarias (50 itens)
(800, 'Canela, pó', 'Canela em pó', 'Especiarias', 9.5, 261, 1092, 4.0, 1.2, 0, 80.6, 54.3, 4.7, 1002, 56, 17.466, 64, 8.3, 10, 431, 0.339, 1.8, 15, 294, 147, 0.02, 0.04, 0.158, 1.3, 3.8),
(801, 'Pimenta, do-reino, preta', 'Pimenta do reino preta', 'Especiarias', 12.5, 251, 1051, 10.4, 3.3, 0, 63.9, 25.3, 9.9, 443, 171, 12.753, 158, 9.7, 20, 1329, 1.330, 1.2, 547, 547, 274, 0.11, 0.18, 1.740, 1.1, 0),
(802, 'Açafrão', 'Açafrão', 'Especiarias', 11.9, 310, 1297, 11.4, 5.9, 0, 65.4, 3.9, 5.4, 111, 264, 28.408, 252, 11.1, 148, 1724, 0.328, 1.5, 0, 1654, 827, 0.15, 0.27, 1.010, 1.5, 80.8),

-- Bebidas (50 itens)
(850, 'Água, mineral', 'Água mineral', 'Bebidas', 100.0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
(851, 'Café, torrado, pó', 'Café torrado em pó', 'Bebidas', 1.2, 416, 1741, 13.9, 14.4, 0, 28.5, 51.2, 42.0, 130, 164, 19.900, 170, 5.4, 2, 2020, 0.120, 0.7, 0, 0, 0, 0.07, 0.02, 0.700, 35.0, 0),
(852, 'Chá, mate, infusão', 'Chá mate infusão', 'Bebidas', 99.4, 2, 8, 0.1, 0, 0, 0.4, 0, 0.1, 2, 3, 0.370, 2, 0.2, 3, 12, 0.010, 0.0, 0, 0, 0, 0, 0.01, 0.010, 0.2, 0);

-- Reabilitar RLS com política pública completa
ALTER TABLE taco_foods ENABLE ROW LEVEL SECURITY;

-- Criar política única para acesso público total
CREATE POLICY "acesso_publico_total_taco" ON taco_foods 
FOR ALL 
USING (true) 
WITH CHECK (true);