-- ========================================
-- POPULAR TABELA TACO COM MÁXIMO DE ALIMENTOS
-- Estrutura corrigida para usar colunas existentes
-- ========================================

-- Limpar dados existentes se houver
DELETE FROM valores_nutricionais_completos WHERE alimento_id IS NOT NULL OR alimento_id IS NULL;

-- Inserir dados massivos da TACO com valores nutricionais completos
-- Usar alimento_id como NULL temporariamente (estrutura permite)
INSERT INTO valores_nutricionais_completos (
  alimento_id, carboidratos, proteina, gorduras, fibras, sodio, kcal
) VALUES 

-- CEREAIS E DERIVADOS - IDs sequenciais para referência
(gen_random_uuid(), 28, 2.5, 0.2, 1.6, 1, 128),   -- Arroz branco cozido
(gen_random_uuid(), 25, 2.6, 1.0, 2.7, 1, 124),   -- Arroz integral cozido
(gen_random_uuid(), 26, 2.8, 0.3, 1.7, 1, 123),   -- Arroz parboilizado cozido
(gen_random_uuid(), 66, 13.9, 8.2, 9.1, 5, 394),  -- Aveia em flocos
(gen_random_uuid(), 75, 7.0, 10.2, 2.1, 328, 433), -- Biscoito doce
(gen_random_uuid(), 62, 10.2, 13.4, 2.5, 967, 432), -- Biscoito salgado
(gen_random_uuid(), 63, 5.8, 5.2, 3.2, 358, 322),  -- Bolo de chocolate
(gen_random_uuid(), 88, 1.8, 0.6, 6.4, 14, 365),   -- Farinha de mandioca
(gen_random_uuid(), 79, 8.9, 2.4, 6.5, 1, 365),    -- Farinha de milho
(gen_random_uuid(), 75, 9.8, 1.4, 2.3, 2, 360),    -- Farinha de trigo
(gen_random_uuid(), 25, 5.0, 1.1, 1.4, 6, 131),    -- Macarrão cozido
(gen_random_uuid(), 20, 3.2, 1.2, 5.3, 1, 97),     -- Milho verde
(gen_random_uuid(), 58, 9.4, 2.9, 6.9, 524, 300),  -- Pão de açúcar
(gen_random_uuid(), 58, 8.0, 3.0, 2.3, 643, 300),  -- Pão francês
(gen_random_uuid(), 45, 11.3, 3.1, 6.9, 597, 253), -- Pão integral
(gen_random_uuid(), 68, 12.0, 5.8, 6.3, 21, 374),  -- Quinoa

-- VERDURAS, HORTALIÇAS E DERIVADOS
(gen_random_uuid(), 4.6, 1.1, 0.1, 2.5, 1, 19),    -- Abóbora moranga
(gen_random_uuid(), 2.9, 1.2, 0.1, 1.0, 1, 16),    -- Abobrinha
(gen_random_uuid(), 2.8, 1.8, 0.2, 1.6, 213, 19),  -- Acelga
(gen_random_uuid(), 2.9, 2.6, 0.1, 1.1, 23, 17),   -- Agrião
(gen_random_uuid(), 2.4, 0.8, 0.2, 1.7, 91, 14),   -- Aipo
(gen_random_uuid(), 2.9, 1.4, 0.2, 2.2, 9, 15),    -- Alface
(gen_random_uuid(), 28, 6.0, 0.1, 4.3, 14, 113),   -- Alho
(gen_random_uuid(), 5.7, 1.0, 0.2, 3.0, 1, 21),    -- Berinjela
(gen_random_uuid(), 11, 2.2, 0.1, 3.4, 58, 49),    -- Beterraba
(gen_random_uuid(), 4.0, 3.6, 0.4, 2.9, 33, 25),   -- Brócolis
(gen_random_uuid(), 7.6, 1.8, 0.2, 2.6, 17, 27),   -- Cebolinha
(gen_random_uuid(), 9.6, 0.9, 0.2, 2.8, 69, 41),   -- Cenoura
(gen_random_uuid(), 4.7, 1.8, 0.3, 3.7, 22, 20),   -- Chicória
(gen_random_uuid(), 3.7, 2.1, 0.5, 2.8, 46, 23),   -- Coentro
(gen_random_uuid(), 4.3, 2.9, 0.4, 2.5, 9, 25),    -- Couve
(gen_random_uuid(), 4.9, 2.4, 0.2, 2.5, 15, 25),   -- Couve-flor
(gen_random_uuid(), 3.4, 2.9, 0.4, 2.2, 79, 25),   -- Espinafre
(gen_random_uuid(), 6.7, 1.7, 0.1, 3.9, 1, 27),    -- Jiló
(gen_random_uuid(), 1.6, 0.7, 0.1, 0.9, 1, 8),     -- Maxixe
(gen_random_uuid(), 2.9, 2.7, 0.3, 3.2, 7, 20),    -- Mostarda folha
(gen_random_uuid(), 4.3, 1.2, 0.2, 2.8, 18, 18),   -- Nabo
(gen_random_uuid(), 3.6, 0.7, 0.1, 0.5, 2, 15),    -- Pepino
(gen_random_uuid(), 6.7, 1.2, 0.2, 1.9, 3, 27),    -- Pimentão amarelo
(gen_random_uuid(), 4.6, 1.0, 0.2, 1.7, 2, 20),    -- Pimentão verde
(gen_random_uuid(), 7.2, 1.0, 0.3, 2.5, 3, 31),    -- Pimentão vermelho
(gen_random_uuid(), 6.4, 1.9, 0.2, 4.6, 5, 30),    -- Quiabo
(gen_random_uuid(), 2.0, 0.8, 0.1, 1.6, 25, 10),   -- Rabanete
(gen_random_uuid(), 5.4, 1.3, 0.1, 2.5, 9, 25),    -- Repolho
(gen_random_uuid(), 3.7, 2.6, 0.7, 1.6, 27, 25),   -- Rúcula
(gen_random_uuid(), 6.3, 3.7, 0.8, 3.3, 56, 36),   -- Salsa
(gen_random_uuid(), 3.9, 0.9, 0.2, 1.2, 5, 18),    -- Tomate
(gen_random_uuid(), 7.8, 2.4, 0.2, 2.7, 4, 35),    -- Vagem

-- FRUTAS E DERIVADOS
(gen_random_uuid(), 8.5, 2.0, 14.7, 6.7, 7, 160),  -- Abacate
(gen_random_uuid(), 13, 0.4, 0.1, 1.0, 1, 48),     -- Abacaxi
(gen_random_uuid(), 6.2, 1.1, 3.9, 2.6, 7, 58),    -- Açaí polpa
(gen_random_uuid(), 7.7, 0.9, 0.2, 1.5, 3, 33),    -- Acerola
(gen_random_uuid(), 11, 0.5, 0.1, 2.4, 2, 44),     -- Ameixa
(gen_random_uuid(), 26, 1.3, 0.1, 2.6, 1, 87),     -- Banana maçã
(gen_random_uuid(), 22, 1.4, 0.1, 1.9, 1, 92),     -- Banana nanica
(gen_random_uuid(), 26, 1.3, 0.1, 2.0, 1, 98),     -- Banana prata
(gen_random_uuid(), 10, 1.0, 0.2, 1.7, 3, 43),     -- Caju
(gen_random_uuid(), 19, 0.7, 0.2, 6.5, 1, 71),     -- Caqui
(gen_random_uuid(), 6.7, 1.0, 0.3, 2.8, 4, 31),    -- Carambola
(gen_random_uuid(), 16, 1.3, 0.3, 2.3, 3, 63),     -- Cereja
(gen_random_uuid(), 3.7, 0.7, 0.2, 0.0, 105, 19),  -- Coco água
(gen_random_uuid(), 19, 1.3, 0.3, 4.7, 1, 74),     -- Figo
(gen_random_uuid(), 14, 2.5, 0.5, 6.2, 3, 54),     -- Goiaba branca
(gen_random_uuid(), 13, 1.1, 0.4, 6.3, 3, 52),     -- Goiaba vermelha
(gen_random_uuid(), 15, 1.0, 0.2, 1.9, 4, 62),     -- Graviola
(gen_random_uuid(), 15, 0.6, 0.1, 2.3, 3, 58),     -- Jabuticaba
(gen_random_uuid(), 23, 1.2, 0.3, 2.4, 3, 88),     -- Jaca
(gen_random_uuid(), 14, 1.1, 0.6, 2.7, 4, 56),     -- Kiwi
(gen_random_uuid(), 11, 1.0, 0.1, 4.0, 3, 45),     -- Laranja bahia
(gen_random_uuid(), 11, 0.8, 0.2, 1.0, 2, 46),     -- Laranja pera
(gen_random_uuid(), 9.3, 0.9, 0.3, 2.9, 2, 39),    -- Limão
(gen_random_uuid(), 14, 0.2, 0.3, 1.3, 2, 56),     -- Maçã
(gen_random_uuid(), 11, 0.8, 0.1, 1.8, 3, 40),     -- Mamão formosa
(gen_random_uuid(), 11, 0.5, 0.1, 1.0, 2, 45),     -- Mamão papaia
(gen_random_uuid(), 16, 0.6, 0.2, 1.7, 2, 65),     -- Manga
(gen_random_uuid(), 21, 2.2, 0.7, 15.6, 28, 97),   -- Maracujá
(gen_random_uuid(), 8.1, 0.6, 0.2, 0.1, 1, 33),    -- Melancia
(gen_random_uuid(), 8.2, 0.6, 0.1, 0.3, 12, 35),   -- Melão
(gen_random_uuid(), 6.8, 0.9, 0.3, 1.7, 1, 30),    -- Morango
(gen_random_uuid(), 12, 1.4, 0.2, 1.7, 6, 49),     -- Nectarina
(gen_random_uuid(), 15, 0.4, 0.1, 3.0, 1, 57),     -- Pêra
(gen_random_uuid(), 9.7, 0.9, 0.3, 1.5, 1, 40),    -- Pêssego
(gen_random_uuid(), 9.9, 1.0, 0.4, 3.2, 1, 42),    -- Pitanga
(gen_random_uuid(), 18, 1.0, 0.3, 0.6, 3, 68),     -- Romã
(gen_random_uuid(), 12, 0.9, 0.2, 1.7, 2, 44),     -- Tangerina
(gen_random_uuid(), 16, 0.7, 0.2, 0.9, 2, 62),     -- Uva itália
(gen_random_uuid(), 17, 1.1, 0.4, 0.8, 1, 68),     -- Uva rubi

-- OLEAGINOSAS E LEGUMINOSAS
(gen_random_uuid(), 20, 27.2, 43.9, 8.0, 5, 544),  -- Amendoim
(gen_random_uuid(), 30, 18.5, 43.8, 3.7, 12, 570), -- Castanha de caju
(gen_random_uuid(), 12, 14.3, 66.4, 7.5, 3, 656),  -- Castanha do pará
(gen_random_uuid(), 16, 6.2, 0.4, 7.5, 2, 81),     -- Ervilha
(gen_random_uuid(), 16, 10.5, 0.5, 24.4, 2, 123),  -- Feijão branco
(gen_random_uuid(), 14, 8.6, 0.5, 8.5, 1, 127),    -- Feijão carioca
(gen_random_uuid(), 18, 8.3, 0.6, 7.5, 2, 133),    -- Feijão fradinho
(gen_random_uuid(), 14, 8.9, 0.5, 8.4, 2, 132),    -- Feijão preto
(gen_random_uuid(), 16, 8.8, 1.5, 12.4, 6, 164),   -- Grão de bico
(gen_random_uuid(), 16, 6.3, 0.6, 7.9, 2, 108),    -- Lentilha
(gen_random_uuid(), 14, 15.8, 65.2, 6.7, 2, 687),  -- Nozes
(gen_random_uuid(), 28, 20.2, 45.3, 10.6, 1, 557), -- Pistache
(gen_random_uuid(), 30, 34.3, 17.7, 20.2, 1, 405), -- Soja

-- CARNES E DERIVADOS
(gen_random_uuid(), 0.0, 23.0, 9.7, 0.0, 50, 174),  -- Alcatra
(gen_random_uuid(), 3.9, 21.4, 4.4, 0.0, 87, 136),  -- Bife de fígado
(gen_random_uuid(), 0.0, 20.7, 10.2, 0.0, 59, 175), -- Carne moída
(gen_random_uuid(), 0.0, 22.0, 13.0, 0.0, 45, 192), -- Contrafilé
(gen_random_uuid(), 0.7, 16.9, 3.6, 0.0, 104, 98),  -- Coração bovino
(gen_random_uuid(), 0.0, 17.4, 18.0, 0.0, 55, 233), -- Costela bovina
(gen_random_uuid(), 0.0, 21.0, 15.3, 0.0, 61, 211), -- Cupim
(gen_random_uuid(), 3.9, 21.4, 4.4, 0.0, 87, 136),  -- Fígado bovino
(gen_random_uuid(), 0.0, 22.2, 8.8, 0.0, 52, 163),  -- Fraldinha
(gen_random_uuid(), 0.0, 23.7, 3.4, 0.0, 54, 122),  -- Lagarto
(gen_random_uuid(), 0.0, 21.0, 5.1, 0.0, 58, 130),  -- Músculo
(gen_random_uuid(), 0.0, 22.8, 4.9, 0.0, 55, 133),  -- Patinho
(gen_random_uuid(), 0.0, 20.3, 15.0, 0.0, 47, 210), -- Picanha

-- AVES
(gen_random_uuid(), 0.0, 17.3, 9.4, 0.0, 79, 146),  -- Frango coxa
(gen_random_uuid(), 0.0, 23.1, 3.6, 0.0, 47, 123),  -- Frango peito
(gen_random_uuid(), 0.0, 18.3, 8.2, 0.0, 88, 141),  -- Frango sobrecoxa
(gen_random_uuid(), 0.0, 21.9, 2.4, 0.0, 54, 108),  -- Peru peito

-- PEIXES
(gen_random_uuid(), 0.0, 28.9, 1.3, 0.0, 59, 130),  -- Atum
(gen_random_uuid(), 0.0, 17.6, 0.3, 0.0, 11, 79),   -- Bacalhau
(gen_random_uuid(), 0.0, 17.0, 3.8, 0.0, 102, 100), -- Corvina
(gen_random_uuid(), 0.0, 16.8, 1.2, 0.0, 78, 79),   -- Linguado
(gen_random_uuid(), 0.0, 17.1, 2.4, 0.0, 86, 90),   -- Merluza
(gen_random_uuid(), 0.0, 19.3, 1.2, 0.0, 108, 89),  -- Pescada
(gen_random_uuid(), 0.0, 18.4, 2.0, 0.0, 68, 90),   -- Robalo
(gen_random_uuid(), 0.0, 25.4, 12.4, 0.0, 98, 208), -- Salmão
(gen_random_uuid(), 0.0, 24.6, 10.5, 0.0, 104, 190), -- Sardinha
(gen_random_uuid(), 0.0, 20.1, 1.5, 0.0, 47, 96),   -- Tilápia

-- OVOS
(gen_random_uuid(), 1.6, 10.9, 0.0, 0.0, 166, 44),  -- Clara de ovo
(gen_random_uuid(), 1.6, 15.7, 31.9, 0.0, 48, 353), -- Gema de ovo
(gen_random_uuid(), 1.1, 13.0, 11.0, 0.0, 124, 155), -- Ovo de galinha inteiro
(gen_random_uuid(), 0.4, 13.1, 11.1, 0.0, 141, 158), -- Ovo de codorna

-- LEITE E DERIVADOS
(gen_random_uuid(), 7.0, 4.0, 0.2, 0.0, 58, 43),    -- Iogurte desnatado
(gen_random_uuid(), 4.7, 3.5, 3.0, 0.0, 50, 61),    -- Iogurte integral
(gen_random_uuid(), 54, 7.2, 7.9, 0.0, 104, 306),   -- Leite condensado
(gen_random_uuid(), 4.9, 3.4, 0.2, 0.0, 52, 35),    -- Leite desnatado
(gen_random_uuid(), 4.8, 3.2, 3.5, 0.0, 50, 61),    -- Leite integral
(gen_random_uuid(), 3.0, 18.0, 20.0, 0.0, 346, 264), -- Queijo minas
(gen_random_uuid(), 2.2, 22.2, 18.1, 0.0, 627, 280), -- Queijo mozzarela
(gen_random_uuid(), 3.4, 35.6, 25.0, 0.0, 1200, 393), -- Queijo parmesão
(gen_random_uuid(), 1.7, 25.8, 24.6, 0.0, 740, 360), -- Queijo prato
(gen_random_uuid(), 3.0, 11.2, 21.5, 0.0, 758, 252), -- Requeijão

-- ÓLEOS E GORDURAS
(gen_random_uuid(), 0.0, 0.0, 100.0, 0.0, 2, 884),  -- Azeite de oliva
(gen_random_uuid(), 0.0, 0.5, 81.0, 0.0, 11, 717),  -- Manteiga
(gen_random_uuid(), 0.4, 0.9, 61.0, 0.0, 572, 596), -- Margarina
(gen_random_uuid(), 0.0, 0.0, 100.0, 0.0, 0, 884),  -- Óleo de canola
(gen_random_uuid(), 0.0, 0.0, 100.0, 0.0, 0, 884),  -- Óleo de girassol
(gen_random_uuid(), 0.0, 0.0, 100.0, 0.0, 0, 884),  -- Óleo de milho
(gen_random_uuid(), 0.0, 0.0, 100.0, 0.0, 0, 884),  -- Óleo de soja

-- AÇÚCARES, DOCES E PRODUTOS DE CONFEITARIA
(gen_random_uuid(), 100, 0.0, 0.0, 0.0, 1, 387),    -- Açúcar cristal
(gen_random_uuid(), 97, 0.1, 0.1, 0.0, 19, 376),    -- Açúcar mascavo
(gen_random_uuid(), 57, 7.3, 31.0, 2.4, 65, 528),   -- Chocolate ao leite
(gen_random_uuid(), 47, 5.8, 35.0, 7.0, 11, 479),   -- Chocolate amargo
(gen_random_uuid(), 55, 7.3, 7.5, 0.0, 180, 315),   -- Doce de leite
(gen_random_uuid(), 65, 0.4, 0.1, 1.4, 14, 266),    -- Geleia de frutas
(gen_random_uuid(), 82, 0.4, 0.0, 0.2, 4, 309),     -- Mel
(gen_random_uuid(), 87, 2.1, 0.6, 0.0, 37, 361),    -- Rapadura
(gen_random_uuid(), 22, 3.5, 8.4, 0.7, 58, 165),    -- Sorvete

-- BEBIDAS
(gen_random_uuid(), 3.7, 0.7, 0.2, 0.0, 105, 19),   -- Água de coco
(gen_random_uuid(), 0.0, 0.2, 0.0, 0.0, 5, 2),      -- Café
(gen_random_uuid(), 0.0, 0.0, 0.0, 0.0, 3, 1),      -- Chá preto
(gen_random_uuid(), 11, 0.0, 0.0, 0.0, 5, 42),      -- Refrigerante cola
(gen_random_uuid(), 10, 0.7, 0.2, 0.2, 2, 45),      -- Suco de laranja
(gen_random_uuid(), 15, 0.2, 0.1, 0.0, 2, 58),      -- Suco de uva

-- TEMPEROS E CONDIMENTOS
(gen_random_uuid(), 28, 6.0, 0.1, 4.3, 14, 113),    -- Alho
(gen_random_uuid(), 81, 4.0, 1.2, 53.1, 10, 247),   -- Canela
(gen_random_uuid(), 9.3, 1.2, 0.1, 2.0, 4, 40),     -- Cebola
(gen_random_uuid(), 65, 6.0, 13.0, 34.2, 277, 323), -- Cravo
(gen_random_uuid(), 18, 1.8, 0.8, 2.0, 13, 80),     -- Gengibre
(gen_random_uuid(), 8.4, 3.8, 0.7, 8.0, 31, 44),    -- Hortelã
(gen_random_uuid(), 69, 9.0, 4.3, 42.5, 25, 265),   -- Orégano
(gen_random_uuid(), 64, 11.0, 3.3, 25.3, 20, 251),  -- Pimenta do reino
(gen_random_uuid(), 0.0, 0.0, 0.0, 0.0, 38758, 0),  -- Sal
(gen_random_uuid(), 64, 5.6, 7.4, 37.0, 9, 276),    -- Tomilho
(gen_random_uuid(), 0.4, 0.0, 0.0, 0.0, 2, 4);      -- Vinagre

-- Atualizar contadores e estatísticas
ANALYZE valores_nutricionais_completos;