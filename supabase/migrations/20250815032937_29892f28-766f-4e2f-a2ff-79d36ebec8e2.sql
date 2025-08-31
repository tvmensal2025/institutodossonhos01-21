-- Popular tabela taco_foods com dados da base TACO
-- Inserir dados de exemplo da TACO 4ª edição

INSERT INTO taco_foods (
  numero_alimento, nome_alimento, descricao, categoria,
  umidade, energia_kcal, energia_kj, proteina_g, lipidios_g, colesterol_mg,
  carboidratos_g, fibra_alimentar_g, cinzas_g,
  calcio_mg, magnesio_mg, manganes_mg, fosforo_mg, ferro_mg, sodio_mg, potassio_mg, cobre_mg, zinco_mg,
  retinol_mcg, re_mcg, rae_mcg, tiamina_mg, riboflavina_mg, piridoxina_mg, niacina_mg, vitamina_c_mg
) VALUES
-- Cereais e derivados
(1, 'Arroz, integral, cozido', 'Arroz integral cozido em água', 'Cereais e derivados', 70.1, 124, 518, 2.6, 1.0, 0, 25.8, 2.7, 0.5, 5, 59, 1.228, 106, 0.3, 1, 75, 0.020, 0.7, 0, 0, 0, 0.17, 0.01, 0.164, 1.5, 0),
(2, 'Arroz, branco, polido, cozido', 'Arroz branco polido cozido em água', 'Cereais e derivados', 69.1, 128, 536, 2.5, 0.1, 0, 28.1, 1.6, 0.2, 4, 3, 0.318, 12, 0.1, 1, 16, 0.006, 0.7, 0, 0, 0, 0.04, 0.02, 0.015, 0.4, 0),
(3, 'Aveia, flocos', 'Aveia em flocos', 'Cereais e derivados', 9.1, 394, 1649, 13.9, 8.5, 0, 67.0, 9.1, 1.4, 48, 119, 5.807, 153, 4.4, 5, 336, 0.192, 2.3, 0, 0, 0, 0.55, 0.05, 0.100, 1.1, 0),
(4, 'Pão francês', 'Pão francês tradicional', 'Cereais e derivados', 28.0, 300, 1255, 8.0, 3.0, 0, 58.0, 2.3, 3.0, 40, 22, 0.550, 72, 2.3, 643, 117, 0.167, 0.7, 0, 0, 0, 0.28, 0.06, 0.050, 1.4, 0),
(5, 'Macarrão, cru', 'Massa de macarrão crua', 'Cereais e derivados', 13.0, 371, 1552, 13.0, 1.4, 0, 71.2, 2.9, 1.4, 17, 58, 0.902, 126, 1.8, 6, 192, 0.289, 1.1, 0, 0, 0, 0.04, 0.03, 0.050, 1.1, 0),

-- Verduras, hortaliças e derivados
(100, 'Alface, crespa', 'Alface crespa crua', 'Verduras, hortaliças e derivados', 94.9, 15, 63, 1.4, 0.2, 0, 2.9, 2.2, 0.4, 40, 11, 0.280, 25, 0.4, 10, 192, 0.029, 0.2, 112, 136, 68, 0.04, 0.07, 0.059, 0.3, 9.2),
(101, 'Tomate, salada', 'Tomate para salada', 'Verduras, hortaliças e derivados', 94.1, 18, 75, 0.9, 0.2, 0, 3.9, 1.2, 0.9, 13, 11, 0.114, 21, 0.3, 5, 237, 0.061, 0.2, 21, 35, 18, 0.06, 0.04, 0.061, 0.6, 21.2),
(102, 'Cebola', 'Cebola crua', 'Verduras, hortaliças e derivados', 89.1, 40, 167, 1.2, 0.1, 0, 9.3, 2.0, 0.3, 25, 10, 0.129, 29, 0.2, 4, 134, 0.039, 0.2, 0, 0, 0, 0.05, 0.04, 0.116, 0.4, 7.4),
(103, 'Cenoura, crua', 'Cenoura crua', 'Verduras, hortaliças e derivados', 88.3, 41, 172, 0.9, 0.2, 0, 9.6, 2.8, 1.0, 35, 12, 0.259, 35, 0.3, 69, 323, 0.045, 0.4, 1098, 1346, 673, 0.07, 0.05, 0.138, 0.9, 5.1),
(104, 'Brócolis, cozido', 'Brócolis cozido no vapor', 'Verduras, hortaliças e derivados', 89.3, 25, 105, 2.8, 0.4, 0, 4.0, 3.4, 3.5, 400, 86, 1.024, 293, 0.7, 41, 507, 0.049, 0.4, 78, 154, 77, 0.09, 0.18, 0.175, 0.9, 78.9),

-- Frutas e derivados
(200, 'Banana, nanica', 'Banana nanica crua', 'Frutas e derivados', 75.3, 87, 364, 1.4, 0.1, 0, 22.3, 2.0, 0.9, 3, 28, 0.142, 22, 0.4, 1, 376, 0.086, 0.2, 36, 81, 15, 0.04, 0.06, 0.299, 0.7, 5.9),
(201, 'Maçã, gala', 'Maçã gala com casca', 'Frutas e derivados', 84.6, 56, 234, 0.3, 0.1, 0, 14.7, 1.3, 0.3, 3, 5, 0.128, 9, 0.1, 1, 120, 0.021, 0.1, 5, 5, 3, 0.02, 0.02, 0.041, 0.1, 2.4),
(202, 'Laranja, pera', 'Laranja pera crua', 'Frutas e derivados', 87.1, 46, 192, 0.9, 0.1, 0, 11.5, 1.0, 0.4, 40, 9, 0.024, 20, 0.1, 1, 181, 0.045, 0.1, 8, 20, 10, 0.08, 0.04, 0.059, 0.4, 56.9),
(203, 'Mamão, formosa', 'Mamão formosa cru', 'Frutas e derivados', 90.8, 40, 167, 0.5, 0.1, 0, 8.3, 1.8, 0.3, 18, 15, 0.020, 5, 0.1, 3, 197, 0.023, 0.1, 75, 135, 68, 0.03, 0.04, 0.015, 0.4, 82.2),

-- Leguminosas e derivados
(300, 'Feijão, carioca, cozido', 'Feijão carioca cozido', 'Leguminosas e derivados', 80.0, 76, 318, 4.8, 0.5, 0, 13.6, 8.5, 1.1, 27, 40, 0.505, 88, 1.3, 2, 256, 0.189, 1.2, 0, 0, 0, 0.11, 0.06, 0.069, 0.5, 1.2),
(301, 'Soja, grão', 'Grão de soja seco', 'Leguminosas e derivados', 12.5, 405, 1695, 36.0, 20.0, 0, 29.1, 20.2, 2.4, 206, 280, 1.658, 704, 8.8, 5, 1797, 1.650, 4.5, 0, 17, 9, 0.87, 0.87, 0.700, 1.6, 6.0),

-- Carnes e derivados
(400, 'Carne, bovina, alcatra, crua', 'Alcatra bovina crua', 'Carnes e derivados', 74.5, 163, 682, 21.4, 8.2, 59, 0, 0, 1.0, 4, 22, 0.013, 195, 2.8, 66, 318, 0.064, 4.0, 0, 0, 0, 0.07, 0.16, 0.360, 4.6, 0),
(401, 'Frango, peito, sem pele, cru', 'Peito de frango sem pele cru', 'Carnes e derivados', 74.4, 159, 665, 23.1, 6.2, 58, 0, 0, 1.0, 15, 29, 0.016, 210, 0.4, 77, 371, 0.043, 0.9, 6, 6, 2, 0.07, 0.10, 0.560, 11.2, 0),

-- Ovos e derivados
(500, 'Ovo, galinha, inteiro, cru', 'Ovo de galinha inteiro cru', 'Ovos e derivados', 75.3, 155, 649, 13.0, 11.1, 356, 1.1, 0, 1.0, 56, 12, 0.030, 180, 1.8, 124, 131, 0.072, 1.1, 140, 184, 92, 0.07, 0.37, 0.170, 0.1, 0),

-- Laticínios
(600, 'Leite, vaca, integral', 'Leite de vaca integral', 'Laticínios', 87.4, 61, 255, 3.2, 3.5, 10, 4.8, 0, 0.7, 113, 10, 0.004, 84, 0.1, 50, 150, 0.010, 0.4, 34, 58, 29, 0.04, 0.15, 0.050, 0.9, 0.9),
(601, 'Queijo, minas, frescal', 'Queijo minas frescal', 'Laticínios', 58.0, 264, 1105, 17.4, 20.2, 60, 3.0, 0, 1.4, 579, 21, 0.024, 202, 0.4, 346, 56, 0.027, 2.8, 165, 241, 121, 0.03, 0.31, 0.080, 0.2, 0);

-- Permitir leitura pública da tabela
CREATE POLICY IF NOT EXISTS "Permitir leitura pública da tabela taco_foods"
ON taco_foods FOR SELECT
USING (true);

-- Permitir inserção apenas para administradores
CREATE POLICY IF NOT EXISTS "Permitir inserção apenas para admins"
ON taco_foods FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
);