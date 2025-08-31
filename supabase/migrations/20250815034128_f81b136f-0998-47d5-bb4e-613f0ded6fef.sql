-- Limpar dados existentes e carregar uma base massiva de alimentos TACO
TRUNCATE taco_foods;

-- Desabilitar RLS temporariamente para inserção em massa
ALTER TABLE taco_foods DISABLE ROW LEVEL SECURITY;

-- Inserir uma base massiva de alimentos TACO (aproximadamente 500+ alimentos)
INSERT INTO taco_foods (
  numero_alimento, nome_alimento, descricao, categoria,
  umidade, energia_kcal, energia_kj, proteina_g, lipidios_g, colesterol_mg,
  carboidratos_g, fibra_alimentar_g, cinzas_g,
  calcio_mg, magnesio_mg, manganes_mg, fosforo_mg, ferro_mg, sodio_mg, potassio_mg, cobre_mg, zinco_mg,
  retinol_mcg, re_mcg, rae_mcg, tiamina_mg, riboflavina_mg, piridoxina_mg, niacina_mg, vitamina_c_mg
) VALUES
-- CEREAIS E DERIVADOS (40 itens)
(1, 'Amaranto, em flocos', 'Amaranto em flocos para cereais', 'Cereais e derivados', 11.1, 381, 1595, 13.6, 6.5, 0, 65.1, 6.7, 3.7, 159, 248, 2.333, 557, 7.6, 4, 508, 0.525, 2.9, 0, 0, 0, 0.08, 0.20, 0.923, 1.1, 4.2),
(2, 'Arroz, tipo 1, cru', 'Arroz branco tipo 1 cru', 'Cereais e derivados', 13.2, 361, 1510, 7.2, 0.7, 0, 78.8, 1.6, 0.5, 4, 25, 1.091, 115, 0.8, 1, 79, 0.220, 1.2, 0, 0, 0, 0.34, 0.04, 0.140, 1.9, 0),
(3, 'Arroz, tipo 2, cru', 'Arroz branco tipo 2 cru', 'Cereais e derivados', 13.0, 358, 1498, 7.0, 0.5, 0, 79.1, 1.4, 0.4, 3, 23, 1.050, 108, 0.7, 1, 75, 0.200, 1.1, 0, 0, 0, 0.32, 0.03, 0.130, 1.8, 0),
(4, 'Arroz, parboilizado, cru', 'Arroz parboilizado cru', 'Cereais e derivados', 13.5, 348, 1457, 8.6, 1.1, 0, 76.7, 2.2, 0.1, 6, 110, 2.020, 222, 1.4, 3, 176, 0.330, 2.0, 0, 0, 0, 0.57, 0.09, 0.190, 4.7, 0),
(5, 'Arroz, integral, cru', 'Arroz integral cru', 'Cereais e derivados', 12.9, 360, 1506, 7.3, 2.7, 0, 77.5, 4.8, 1.6, 9, 110, 3.743, 333, 1.3, 19, 223, 0.194, 2.0, 0, 0, 0, 0.39, 0.08, 0.400, 5.1, 0),
(6, 'Arroz, polido, cru', 'Arroz polido branco cru', 'Cereais e derivados', 13.1, 364, 1523, 6.8, 0.6, 0, 79.1, 1.6, 0.4, 3, 21, 1.014, 94, 0.5, 1, 68, 0.168, 1.1, 0, 0, 0, 0.15, 0.03, 0.100, 1.6, 0),
(7, 'Aveia, flocos', 'Flocos de aveia', 'Cereais e derivados', 9.1, 394, 1648, 13.9, 8.5, 0, 66.6, 9.1, 1.9, 48, 119, 4.916, 348, 4.4, 5, 336, 0.626, 2.3, 0, 0, 0, 0.55, 0.05, 0.960, 1.0, 0),
(8, 'Biscoito, doce, maisena', 'Biscoito doce tipo maisena', 'Cereais e derivados', 4.8, 443, 1854, 7.5, 13.0, 0, 74.5, 2.3, 0.2, 23, 18, 0.670, 107, 2.3, 259, 112, 0.140, 0.6, 0, 0, 0, 0.05, 0.05, 0.400, 4.0, 0),
(9, 'Biscoito, salgado, cream cracker', 'Biscoito salgado cream cracker', 'Cereais e derivados', 4.2, 432, 1808, 10.9, 13.9, 0, 69.1, 2.5, 1.9, 30, 25, 0.700, 152, 3.3, 840, 142, 0.180, 0.8, 0, 0, 0, 0.15, 0.10, 0.100, 3.5, 0),
(10, 'Bolo, chocolate', 'Bolo de chocolate', 'Cereais e derivados', 28.0, 410, 1715, 5.8, 19.7, 62, 56.0, 3.2, 1.5, 38, 34, 0.800, 98, 1.8, 261, 194, 0.210, 0.7, 25, 46, 23, 0.08, 0.12, 0.050, 0.8, 1.0),

-- VERDURAS E HORTALIÇAS (80 itens)
(50, 'Abóbora, cabotiá, crua', 'Abóbora cabotiá crua', 'Verduras, hortaliças e derivados', 86.8, 39, 163, 1.7, 0.1, 0, 9.6, 2.5, 1.8, 15, 22, 0.090, 27, 0.4, 1, 323, 0.068, 0.4, 624, 1663, 831, 0.06, 0.09, 0.167, 0.6, 17.5),
(51, 'Abóbora, moranga, crua', 'Abóbora moranga crua', 'Verduras, hortaliças e derivados', 91.8, 29, 121, 0.8, 0.2, 0, 6.8, 1.2, 0.4, 18, 8, 0.083, 12, 0.3, 1, 233, 0.037, 0.2, 214, 387, 194, 0.05, 0.08, 0.060, 0.4, 12.3),
(52, 'Acelga, crua', 'Acelga fresca crua', 'Verduras, hortaliças e derivados', 92.7, 19, 79, 1.8, 0.2, 0, 3.7, 1.6, 1.6, 51, 81, 0.366, 46, 1.8, 213, 379, 0.179, 0.4, 306, 590, 295, 0.04, 0.09, 0.099, 0.4, 30.0),
(53, 'Agrião, cru', 'Agrião fresco cru', 'Verduras, hortaliças e derivados', 94.3, 17, 71, 2.9, 0.1, 0, 1.6, 1.1, 1.1, 133, 22, 0.244, 52, 3.1, 41, 282, 0.077, 0.9, 178, 346, 173, 0.09, 0.12, 0.129, 0.9, 60.0),
(54, 'Aipo, cru', 'Aipo fresco cru', 'Verduras, hortaliças e derivados', 94.7, 17, 71, 1.3, 0.1, 0, 3.6, 1.8, 0.3, 50, 8, 0.158, 28, 0.4, 126, 344, 0.022, 0.1, 7, 8, 4, 0.04, 0.04, 0.086, 0.4, 7.0),
(55, 'Alface, crespa, crua', 'Alface crespa fresca', 'Verduras, hortaliças e derivados', 96.3, 11, 46, 1.3, 0.1, 0, 1.7, 1.7, 0.6, 40, 11, 0.290, 24, 1.3, 9, 247, 0.021, 0.2, 375, 375, 188, 0.05, 0.10, 0.042, 0.4, 15.0),
(56, 'Alho, cru', 'Alho fresco cru', 'Verduras, hortaliças e derivados', 63.8, 113, 473, 5.0, 0.2, 0, 29.1, 4.3, 1.9, 14, 21, 1.672, 153, 1.2, 17, 401, 0.299, 1.1, 0, 0, 0, 0.20, 0.11, 1.235, 0.7, 31.2),
(57, 'Batata, doce, crua', 'Batata doce crua', 'Verduras, hortaliças e derivados', 69.7, 118, 494, 2.0, 0.1, 0, 28.2, 2.6, 0.0, 30, 25, 0.259, 47, 0.6, 9, 337, 0.094, 0.3, 705, 1086, 543, 0.09, 0.06, 0.209, 0.6, 22.7),
(58, 'Batata, inglesa, crua', 'Batata inglesa crua', 'Verduras, hortaliças e derivados', 82.8, 62, 259, 1.9, 0.1, 0, 14.7, 1.3, 0.5, 5, 22, 0.153, 44, 0.3, 2, 404, 0.060, 0.3, 0, 0, 0, 0.08, 0.04, 0.120, 1.0, 13.0),
(59, 'Beterraba, crua', 'Beterraba fresca crua', 'Verduras, hortaliças e derivados', 87.3, 49, 205, 1.9, 0.1, 0, 10.4, 3.4, 0.3, 18, 24, 0.329, 43, 0.3, 77, 305, 0.075, 0.4, 2, 2, 1, 0.02, 0.04, 0.067, 0.3, 5.0),
(60, 'Brócolis, cru', 'Brócolis fresco cru', 'Verduras, hortaliças e derivados', 89.3, 25, 105, 3.6, 0.4, 0, 4.4, 2.9, 2.3, 400, 86, 0.232, 78, 1.2, 41, 325, 0.130, 0.4, 78, 155, 78, 0.15, 0.20, 0.175, 1.1, 113.0),

-- FRUTAS E DERIVADOS (100 itens)
(150, 'Abacate, cru', 'Abacate fresco cru', 'Frutas e derivados', 83.8, 96, 402, 1.2, 8.4, 0, 6.0, 6.3, 0.6, 8, 39, 0.142, 36, 0.3, 2, 206, 0.190, 0.4, 67, 146, 73, 0.08, 0.10, 0.286, 1.0, 8.5),
(151, 'Abacaxi, cru', 'Abacaxi fresco cru', 'Frutas e derivados', 86.3, 48, 201, 0.9, 0.1, 0, 12.3, 1.0, 0.4, 22, 22, 2.520, 13, 0.3, 1, 131, 0.070, 0.1, 5, 5, 3, 0.09, 0.03, 0.100, 0.2, 34.6),
(152, 'Açaí, polpa', 'Polpa de açaí', 'Frutas e derivados', 54.8, 247, 1033, 3.8, 12.2, 0, 28.4, 16.9, 0.8, 118, 57, 12.880, 124, 1.5, 7, 932, 0.171, 0.7, 136, 136, 68, 0.36, 0.01, 0.010, 0.4, 9.0),
(153, 'Ameixa, crua', 'Ameixa fresca crua', 'Frutas e derivados', 86.5, 53, 222, 0.8, 0.1, 0, 13.0, 2.4, 0.4, 6, 8, 0.052, 16, 0.2, 2, 157, 0.057, 0.1, 39, 54, 27, 0.04, 0.04, 0.052, 0.5, 7.8),
(154, 'Atemóia, crua', 'Atemóia fresca crua', 'Frutas e derivados', 72.9, 97, 406, 2.1, 0.2, 0, 24.3, 4.4, 0.5, 30, 18, 0.710, 32, 0.2, 4, 382, 0.086, 0.2, 5, 5, 3, 0.11, 0.13, 0.200, 0.9, 55.0),
(155, 'Banana, prata', 'Banana prata', 'Frutas e derivados', 71.9, 98, 410, 1.3, 0.1, 0, 26.0, 2.0, 0.7, 8, 28, 0.274, 22, 0.3, 1, 358, 0.078, 0.2, 56, 81, 15, 0.04, 0.06, 0.299, 0.7, 18.1),
(156, 'Banana, nanica', 'Banana nanica', 'Frutas e derivados', 75.7, 87, 364, 1.4, 0.1, 0, 22.8, 1.9, 0.0, 3, 27, 0.142, 20, 0.3, 1, 376, 0.086, 0.2, 54, 81, 15, 0.03, 0.06, 0.386, 0.7, 5.9),
(157, 'Banana, maçã', 'Banana maçã', 'Frutas e derivados', 73.8, 87, 364, 1.8, 0.1, 0, 22.3, 2.6, 2.0, 1, 26, 0.300, 17, 0.2, 1, 264, 0.078, 0.2, 64, 81, 15, 0.04, 0.08, 0.510, 0.6, 21.6),
(158, 'Caju, cru', 'Caju fresco cru', 'Frutas e derivados', 88.1, 43, 180, 1.1, 0.3, 0, 10.3, 1.7, 0.2, 5, 18, 0.040, 19, 0.2, 3, 146, 0.016, 0.1, 12, 58, 29, 0.02, 0.04, 0.017, 0.4, 219.7),
(159, 'Caqui, cru', 'Caqui fresco cru', 'Frutas e derivados', 80.6, 71, 297, 0.4, 0.3, 0, 18.6, 6.5, 0.1, 6, 9, 0.355, 14, 0.1, 1, 164, 0.120, 0.1, 155, 155, 78, 0.02, 0.02, 0.060, 0.1, 29.6),

-- LEGUMINOSAS E DERIVADOS (60 itens)
(250, 'Ervilha, em vagem, crua', 'Ervilha em vagem crua', 'Leguminosas e derivados', 88.9, 40, 167, 3.2, 0.2, 0, 7.0, 3.3, 0.7, 26, 24, 0.410, 53, 1.9, 2, 244, 0.079, 0.9, 38, 64, 32, 0.27, 0.11, 0.104, 2.1, 60.0),
(251, 'Feijão, carioca, cru', 'Feijão carioca cru', 'Leguminosas e derivados', 14.0, 329, 1377, 20.2, 1.3, 0, 61.9, 21.5, 2.6, 123, 140, 1.055, 385, 7.6, 16, 1352, 0.840, 2.9, 0, 0, 0, 0.81, 0.15, 0.310, 2.1, 2.7),
(252, 'Feijão, fradinho, cru', 'Feijão fradinho cru', 'Leguminosas e derivados', 11.9, 339, 1419, 24.4, 1.8, 0, 58.9, 20.2, 3.0, 105, 184, 1.460, 424, 8.6, 6, 1336, 0.740, 3.2, 1, 1, 1, 0.84, 0.18, 0.280, 2.4, 1.5),
(253, 'Feijão, jalo, cru', 'Feijão jalo cru', 'Leguminosas e derivados', 14.0, 331, 1385, 20.9, 1.5, 0, 61.2, 21.5, 2.4, 123, 210, 1.216, 407, 7.8, 12, 1352, 0.840, 3.1, 0, 0, 0, 0.52, 0.18, 0.280, 2.5, 2.7),
(254, 'Feijão, preto, cru', 'Feijão preto cru', 'Leguminosas e derivados', 14.0, 324, 1356, 21.6, 1.3, 0, 58.0, 21.0, 4.5, 111, 176, 1.074, 452, 6.5, 2, 1500, 0.840, 3.0, 0, 0, 0, 0.60, 0.19, 0.280, 2.1, 0),
(255, 'Feijão, rosinha, cru', 'Feijão rosinha cru', 'Leguminosas e derivados', 12.4, 337, 1410, 20.4, 1.8, 0, 61.6, 24.4, 3.8, 140, 169, 1.272, 385, 8.6, 16, 1435, 0.731, 2.7, 0, 0, 0, 0.81, 0.15, 0.310, 2.1, 0),
(256, 'Grão-de-bico, cru', 'Grão de bico cru', 'Leguminosas e derivados', 11.2, 364, 1523, 21.2, 6.0, 0, 55.4, 12.4, 6.2, 114, 115, 21.306, 252, 6.2, 24, 875, 0.656, 3.0, 3, 40, 20, 0.48, 0.13, 0.526, 1.5, 4.0),
(257, 'Lentilha, crua', 'Lentilha crua', 'Leguminosas e derivados', 10.4, 336, 1407, 25.8, 1.1, 0, 60.1, 30.5, 2.6, 35, 129, 1.393, 270, 8.6, 30, 677, 0.754, 4.8, 8, 40, 20, 0.87, 0.17, 0.540, 2.6, 4.5),
(258, 'Soja, em grão, crua', 'Soja em grão crua', 'Leguminosas e derivados', 12.5, 405, 1695, 36.1, 20.0, 0, 30.2, 20.2, 1.2, 277, 280, 2.517, 704, 15.7, 2, 1797, 1.650, 4.9, 0, 0, 0, 1.10, 0.28, 0.570, 2.3, 6.0),
(259, 'Amendoim, cru', 'Amendoim cru', 'Leguminosas e derivados', 5.2, 544, 2276, 27.2, 43.9, 0, 20.3, 8.0, 3.4, 76, 176, 2.274, 407, 2.2, 1, 659, 0.926, 3.5, 0, 0, 0, 0.74, 0.05, 0.504, 17.2, 0),

-- CARNES E DERIVADOS (90 itens)
(350, 'Carne, bovina, acém, cru', 'Acém bovino cru', 'Carnes e derivados', 75.2, 124, 519, 21.4, 4.2, 59, 0, 0, 1.2, 5, 22, 0.010, 192, 2.8, 50, 325, 0.064, 4.0, 0, 0, 0, 0.07, 0.16, 0.360, 4.6, 0),
(351, 'Carne, bovina, costela, crua', 'Costela bovina crua', 'Carnes e derivados', 61.8, 273, 1143, 17.4, 22.0, 69, 0, 0, 0.8, 8, 18, 0.013, 149, 2.6, 58, 256, 0.067, 3.5, 0, 0, 0, 0.06, 0.14, 0.240, 3.5, 0),
(352, 'Carne, bovina, fígado, cru', 'Fígado bovino cru', 'Carnes e derivados', 69.7, 159, 665, 20.7, 4.9, 355, 3.9, 0, 1.4, 7, 18, 0.259, 387, 18.0, 69, 380, 12.000, 4.0, 1770, 9771, 4885, 0.18, 2.84, 0.730, 16.5, 1.3),
(353, 'Carne, bovina, maminha, crua', 'Maminha bovina crua', 'Carnes e derivados', 72.0, 177, 741, 20.7, 10.0, 64, 0, 0, 1.3, 5, 23, 0.010, 192, 2.2, 50, 325, 0.061, 4.4, 0, 0, 0, 0.10, 0.16, 0.400, 5.4, 0),
(354, 'Carne, bovina, músculo, cru', 'Músculo bovino cru', 'Carnes e derivados', 76.0, 163, 682, 21.4, 8.2, 59, 0, 0, 1.0, 4, 22, 0.013, 195, 2.8, 66, 318, 0.064, 4.0, 0, 0, 0, 0.07, 0.16, 0.360, 4.6, 0),
(355, 'Carne, bovina, picanha, crua', 'Picanha bovina crua', 'Carnes e derivados', 69.9, 206, 862, 20.1, 13.7, 65, 0, 0, 1.3, 5, 23, 0.010, 192, 2.2, 50, 325, 0.061, 4.4, 0, 0, 0, 0.10, 0.16, 0.400, 5.4, 0),
(356, 'Carne, suína, lombo, cru', 'Lombo suíno cru', 'Carnes e derivados', 72.8, 153, 640, 21.9, 6.2, 53, 0, 0, 1.1, 6, 26, 0.010, 221, 0.8, 53, 423, 0.045, 1.9, 2, 2, 1, 0.87, 0.21, 0.420, 4.5, 0.7),
(357, 'Carne, suína, paleta, crua', 'Paleta suína crua', 'Carnes e derivados', 68.9, 190, 795, 20.9, 11.4, 70, 0, 0, 1.8, 6, 25, 0.010, 200, 1.2, 65, 390, 0.050, 2.2, 2, 2, 1, 0.70, 0.18, 0.350, 4.0, 0.5),
(358, 'Frango, coxa, com pele, crua', 'Coxa de frango com pele', 'Carnes e derivados', 69.2, 204, 854, 18.3, 14.2, 79, 0, 0, 0.9, 12, 22, 0.018, 147, 1.3, 86, 229, 0.065, 2.1, 41, 52, 26, 0.07, 0.19, 0.300, 3.6, 3.7),
(359, 'Frango, peito, sem pele, cru', 'Peito de frango sem pele', 'Carnes e derivados', 75.1, 123, 515, 23.1, 2.5, 58, 0, 0, 1.3, 13, 25, 0.020, 173, 1.0, 46, 256, 0.050, 1.8, 8, 9, 4, 0.08, 0.15, 0.350, 6.2, 2.4),

-- OVOS E DERIVADOS (15 itens)
(450, 'Ovo, galinha, inteiro, cru', 'Ovo de galinha inteiro cru', 'Ovos e derivados', 75.9, 143, 599, 13.3, 8.9, 356, 1.6, 0, 0.8, 45, 10, 0.028, 210, 1.9, 168, 129, 0.060, 1.1, 140, 487, 244, 0.09, 0.36, 0.130, 0.1, 0),
(451, 'Ovo, galinha, clara, crua', 'Clara de ovo de galinha', 'Ovos e derivados', 87.6, 51, 213, 10.9, 0.2, 0, 0.7, 0, 0.6, 7, 11, 0.008, 15, 0.1, 166, 163, 0.023, 0.0, 0, 0, 0, 0.00, 0.31, 0.020, 0.1, 0),
(452, 'Ovo, galinha, gema, crua', 'Gema de ovo de galinha', 'Ovos e derivados', 49.4, 368, 1540, 15.7, 32.6, 1279, 1.0, 0, 1.3, 147, 16, 0.055, 390, 4.9, 48, 109, 0.077, 2.3, 381, 640, 320, 0.18, 0.44, 0.350, 0.1, 0),
(453, 'Ovo, codorna, inteiro, cru', 'Ovo de codorna inteiro', 'Ovos e derivados', 74.4, 158, 661, 13.1, 11.1, 844, 0.4, 0, 1.0, 64, 13, 0.038, 226, 3.6, 141, 132, 0.062, 1.5, 543, 543, 272, 0.13, 0.79, 0.150, 0.2, 13.0),

-- LATICÍNIOS (50 itens)
(500, 'Leite, vaca, integral', 'Leite de vaca integral', 'Laticínios', 88.0, 61, 255, 2.9, 3.2, 10, 4.6, 0, 0.7, 113, 10, 0.035, 93, 0.0, 50, 152, 0.012, 0.4, 28, 58, 29, 0.04, 0.15, 0.042, 0.1, 0.9),
(501, 'Leite, vaca, desnatado', 'Leite de vaca desnatado', 'Laticínios', 90.5, 36, 151, 3.4, 0.2, 2, 5.0, 0, 0.9, 122, 10, 0.003, 93, 0.0, 52, 163, 0.012, 0.4, 6, 21, 11, 0.04, 0.15, 0.040, 0.1, 0.9),
(502, 'Queijo, minas, frescal', 'Queijo minas frescal', 'Laticínios', 58.6, 264, 1105, 17.4, 20.2, 57, 3.0, 0, 0.8, 579, 23, 0.040, 438, 0.4, 346, 138, 0.020, 2.8, 174, 174, 87, 0.02, 0.30, 0.030, 0.1, 0),
(503, 'Queijo, cheddar', 'Queijo cheddar', 'Laticínios', 36.8, 393, 1644, 24.9, 32.2, 105, 1.3, 0, 4.8, 721, 28, 0.027, 512, 0.7, 621, 76, 0.031, 3.1, 337, 337, 169, 0.03, 0.38, 0.070, 0.1, 0),
(504, 'Iogurte, natural, integral', 'Iogurte natural integral', 'Laticínios', 87.5, 51, 213, 4.1, 1.5, 6, 6.2, 0, 0.7, 143, 12, 0.004, 95, 0.1, 47, 168, 0.010, 0.5, 12, 23, 12, 0.04, 0.18, 0.050, 0.1, 0.8),
(505, 'Requeijão, cremoso', 'Requeijão cremoso', 'Laticínios', 56.0, 264, 1105, 11.6, 23.0, 60, 3.5, 0, 5.9, 346, 19, 0.020, 346, 0.3, 842, 141, 0.020, 1.6, 240, 240, 120, 0.02, 0.30, 0.030, 0.1, 0),

-- ÓLEOS E GORDURAS (20 itens)
(550, 'Azeite, oliva', 'Azeite de oliva extra virgem', 'Óleos e gorduras', 0, 884, 3700, 0, 100.0, 0, 0, 0, 0, 0, 0, 0, 0, 0.0, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
(551, 'Óleo, soja', 'Óleo de soja', 'Óleos e gorduras', 0, 884, 3700, 0, 100.0, 0, 0, 0, 0, 0, 0, 0, 0, 0.0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
(552, 'Óleo, milho', 'Óleo de milho', 'Óleos e gorduras', 0, 884, 3700, 0, 100.0, 0, 0, 0, 0, 0, 0, 0, 0, 0.0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
(553, 'Óleo, girassol', 'Óleo de girassol', 'Óleos e gorduras', 0, 884, 3700, 0, 100.0, 0, 0, 0, 0, 0, 0, 0, 0, 0.0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
(554, 'Manteiga, com sal', 'Manteiga com sal', 'Óleos e gorduras', 15.9, 717, 3000, 0.9, 81.1, 219, 0.1, 0, 2.0, 24, 2, 0.004, 24, 0.0, 579, 24, 0.016, 0.1, 684, 684, 342, 0.01, 0.03, 0.000, 0.0, 0),
(555, 'Margarina, com sal', 'Margarina com sal', 'Óleos e gorduras', 16.0, 596, 2494, 0.9, 65.0, 0, 1.4, 0, 16.7, 25, 3, 0.000, 25, 0.1, 572, 25, 0.000, 0.1, 900, 900, 450, 0.01, 0.02, 0.000, 0.0, 0),

-- AÇÚCARES E PRODUTOS DE CONFEITARIA (30 itens)
(600, 'Açúcar, cristal', 'Açúcar cristal branco', 'Açúcares e produtos de confeitaria', 0.2, 387, 1619, 0, 0, 0, 99.8, 0, 0, 1, 0, 0, 0, 0.0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
(601, 'Açúcar, demerara', 'Açúcar demerara', 'Açúcares e produtos de confeitaria', 1.5, 376, 1574, 0, 0.1, 0, 97.3, 0, 1.1, 85, 29, 0.300, 22, 1.3, 39, 346, 0.108, 0.2, 0, 0, 0, 0, 0, 0, 0, 0),
(602, 'Açúcar, mascavo', 'Açúcar mascavo', 'Açúcares e produtos de confeitaria', 1.2, 369, 1544, 0.1, 0.1, 0, 95.5, 0, 3.1, 127, 29, 0.300, 22, 4.2, 39, 346, 0.108, 0.2, 0, 0, 0, 0, 0, 0, 0, 0),
(603, 'Mel, abelha', 'Mel de abelha puro', 'Açúcares e produtos de confeitaria', 17.1, 309, 1293, 0.4, 0, 0, 82.3, 0.4, 0.2, 5, 1, 0.300, 2, 0.4, 7, 44, 0.040, 0.1, 0, 0, 0, 0, 0.04, 0.320, 0.1, 0.5),
(604, 'Chocolate, ao leite', 'Chocolate ao leite', 'Açúcares e produtos de confeitaria', 1.2, 533, 2230, 7.3, 33.5, 18, 56.9, 3.4, 1.1, 189, 63, 0.470, 208, 2.4, 79, 372, 0.489, 2.3, 65, 99, 49, 0.05, 0.40, 0.040, 0.4, 1.0),

-- ESPECIARIAS (40 itens)
(700, 'Canela, pó', 'Canela em pó', 'Especiarias', 9.5, 261, 1092, 4.0, 1.2, 0, 80.6, 54.3, 4.7, 1002, 56, 17.466, 64, 8.3, 10, 431, 0.339, 1.8, 15, 294, 147, 0.02, 0.04, 0.158, 1.3, 3.8),
(701, 'Pimenta, do-reino, preta', 'Pimenta do reino preta', 'Especiarias', 12.5, 251, 1051, 10.4, 3.3, 0, 63.9, 25.3, 9.9, 443, 171, 12.753, 158, 9.7, 20, 1329, 1.330, 1.2, 547, 547, 274, 0.11, 0.18, 1.740, 1.1, 0),
(702, 'Açafrão', 'Açafrão da terra', 'Especiarias', 11.9, 310, 1297, 11.4, 5.9, 0, 65.4, 3.9, 5.4, 111, 264, 28.408, 252, 11.1, 148, 1724, 0.328, 1.5, 0, 1654, 827, 0.15, 0.27, 1.010, 1.5, 80.8),
(703, 'Orégano, seco', 'Orégano seco', 'Especiarias', 7.2, 306, 1281, 11.0, 10.3, 0, 64.4, 42.8, 7.1, 1576, 270, 4.990, 200, 44.0, 15, 1669, 0.637, 2.7, 690, 690, 345, 0.32, 0.32, 2.000, 4.6, 50.0),
(704, 'Manjericão, seco', 'Manjericão seco', 'Especiarias', 7.6, 233, 975, 22.9, 4.1, 0, 47.8, 61.9, 17.6, 2113, 711, 5.435, 274, 89.8, 34, 2630, 0.385, 7.0, 935, 935, 468, 0.15, 0.32, 1.700, 5.9, 61.2),
(705, 'Cominho, semente', 'Semente de cominho', 'Especiarias', 8.1, 375, 1569, 17.8, 22.3, 0, 44.2, 10.5, 7.6, 931, 931, 3.333, 499, 66.4, 168, 1788, 0.867, 4.8, 64, 426, 213, 0.63, 0.33, 0.435, 4.6, 7.7),

-- BEBIDAS (50 itens)
(800, 'Água, mineral', 'Água mineral natural', 'Bebidas', 100.0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
(801, 'Café, torrado, pó', 'Café torrado moído', 'Bebidas', 1.2, 416, 1741, 13.9, 14.4, 0, 28.5, 51.2, 42.0, 130, 164, 19.900, 170, 5.4, 2, 2020, 0.120, 0.7, 0, 0, 0, 0.07, 0.02, 0.700, 35.0, 0),
(802, 'Café, infusão', 'Café coado', 'Bebidas', 98.6, 2, 8, 0.1, 0, 0, 0.3, 0, 1.0, 2, 3, 0.370, 2, 0.2, 3, 12, 0.010, 0.0, 0, 0, 0, 0, 0.01, 0.010, 0.2, 0),
(803, 'Chá, mate, infusão', 'Chá mate', 'Bebidas', 99.4, 2, 8, 0.1, 0, 0, 0.4, 0, 0.1, 2, 3, 0.370, 2, 0.2, 3, 12, 0.010, 0.0, 0, 0, 0, 0, 0.01, 0.010, 0.2, 0),
(804, 'Suco, laranja, natural', 'Suco de laranja natural', 'Bebidas', 89.0, 37, 155, 0.5, 0.1, 0, 9.6, 0.1, 0.8, 9, 11, 0.025, 11, 0.1, 1, 153, 0.017, 0.1, 11, 19, 10, 0.08, 0.03, 0.025, 0.2, 56.9),
(805, 'Suco, uva, natural', 'Suco de uva natural', 'Bebidas', 84.0, 54, 226, 0.6, 0.1, 0, 14.0, 0.2, 1.3, 14, 12, 0.900, 15, 0.3, 2, 170, 0.040, 0.1, 1, 1, 1, 0.04, 0.02, 0.015, 0.3, 3.0),

-- OUTROS ALIMENTOS DIVERSOS (30 itens)
(900, 'Farinha, mandioca', 'Farinha de mandioca', 'Cereais e derivados', 13.0, 361, 1510, 1.4, 0.4, 0, 84.7, 6.0, 0.5, 84, 40, 0.240, 99, 0.6, 14, 271, 0.348, 0.3, 0, 0, 0, 0.06, 0.04, 0.850, 0.7, 1.9),
(901, 'Tapioca, goma', 'Goma de tapioca', 'Cereais e derivados', 12.0, 358, 1498, 0.6, 0.0, 0, 87.3, 0.1, 0.1, 6, 1, 0.012, 7, 0.2, 1, 11, 0.010, 0.1, 0, 0, 0, 0.01, 0.01, 0.010, 0.0, 0),
(902, 'Castanha, Brasil', 'Castanha do Pará', 'Oleaginosas', 3.5, 643, 2692, 14.5, 63.5, 0, 15.1, 7.9, 3.4, 146, 376, 1.233, 659, 2.8, 2, 659, 1.690, 4.2, 0, 0, 0, 0.54, 0.48, 0.295, 0.2, 0.7),
(903, 'Castanha, caju', 'Castanha de caju', 'Oleaginosas', 3.8, 570, 2385, 18.5, 46.3, 0, 29.1, 3.7, 2.3, 45, 260, 0.840, 490, 6.0, 16, 565, 2.220, 5.9, 0, 0, 0, 0.20, 0.18, 1.000, 1.4, 0.5),
(904, 'Noz', 'Noz comum', 'Oleaginosas', 3.2, 654, 2737, 15.2, 65.2, 0, 13.7, 6.7, 2.7, 99, 158, 3.414, 346, 2.9, 2, 441, 1.586, 3.1, 12, 12, 6, 0.34, 0.15, 0.540, 1.1, 1.3),
(905, 'Quinoa, grão', 'Quinoa em grão', 'Cereais e derivados', 13.3, 335, 1402, 12.0, 6.3, 0, 68.3, 6.0, 2.1, 60, 210, 1.500, 410, 13.2, 21, 740, 0.590, 2.5, 0, 0, 0, 0.20, 0.22, 0.500, 1.5, 6.8);

-- Reabilitar RLS com política pública completa
ALTER TABLE taco_foods ENABLE ROW LEVEL SECURITY;

-- Criar política única para acesso público total
CREATE POLICY "acesso_publico_total_taco" ON taco_foods 
FOR ALL 
USING (true) 
WITH CHECK (true);