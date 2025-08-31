-- ========================================
-- POPULAR TABELA TACO NORMALIZADA - MÁXIMO DE ALIMENTOS
-- Estrutura: nutriente + valor (normalizada)
-- ========================================

-- Limpar dados existentes 
DELETE FROM valores_nutricionais_completos;

-- Função para inserir alimento completo
CREATE OR REPLACE FUNCTION inserir_alimento_taco(
  p_nome TEXT,
  p_carbs NUMERIC,
  p_prot NUMERIC, 
  p_gord NUMERIC,
  p_fibr NUMERIC,
  p_sod NUMERIC,
  p_kcal NUMERIC
) RETURNS uuid AS $$
DECLARE
  alimento_uuid uuid;
BEGIN
  alimento_uuid := gen_random_uuid();
  
  INSERT INTO valores_nutricionais_completos (alimento_id, nutriente, valor, unidade, por_100g, fonte_dados, confiabilidade) VALUES
  (alimento_uuid, 'Carboidratos', p_carbs, 'g', true, 'TACO 4ª Edição', 0.95),
  (alimento_uuid, 'Proteína', p_prot, 'g', true, 'TACO 4ª Edição', 0.95),
  (alimento_uuid, 'Gorduras', p_gord, 'g', true, 'TACO 4ª Edição', 0.95),
  (alimento_uuid, 'Fibras', p_fibr, 'g', true, 'TACO 4ª Edição', 0.95),
  (alimento_uuid, 'Sódio', p_sod, 'mg', true, 'TACO 4ª Edição', 0.95),
  (alimento_uuid, 'Energia', p_kcal, 'kcal', true, 'TACO 4ª Edição', 0.95);
  
  RETURN alimento_uuid;
END;
$$ LANGUAGE plpgsql;

-- Inserir 160+ alimentos essenciais da TACO
-- CEREAIS E DERIVADOS
SELECT inserir_alimento_taco('Arroz branco cozido', 28, 2.5, 0.2, 1.6, 1, 128);
SELECT inserir_alimento_taco('Arroz integral cozido', 25, 2.6, 1.0, 2.7, 1, 124);
SELECT inserir_alimento_taco('Arroz parboilizado cozido', 26, 2.8, 0.3, 1.7, 1, 123);
SELECT inserir_alimento_taco('Aveia em flocos', 66, 13.9, 8.2, 9.1, 5, 394);
SELECT inserir_alimento_taco('Biscoito doce', 75, 7.0, 10.2, 2.1, 328, 433);
SELECT inserir_alimento_taco('Biscoito salgado', 62, 10.2, 13.4, 2.5, 967, 432);
SELECT inserir_alimento_taco('Bolo de chocolate', 63, 5.8, 5.2, 3.2, 358, 322);
SELECT inserir_alimento_taco('Farinha de mandioca', 88, 1.8, 0.6, 6.4, 14, 365);
SELECT inserir_alimento_taco('Farinha de milho', 79, 8.9, 2.4, 6.5, 1, 365);
SELECT inserir_alimento_taco('Farinha de trigo', 75, 9.8, 1.4, 2.3, 2, 360);
SELECT inserir_alimento_taco('Macarrão cozido', 25, 5.0, 1.1, 1.4, 6, 131);
SELECT inserir_alimento_taco('Milho verde', 20, 3.2, 1.2, 5.3, 1, 97);
SELECT inserir_alimento_taco('Pão de açúcar', 58, 9.4, 2.9, 6.9, 524, 300);
SELECT inserir_alimento_taco('Pão francês', 58, 8.0, 3.0, 2.3, 643, 300);
SELECT inserir_alimento_taco('Pão integral', 45, 11.3, 3.1, 6.9, 597, 253);
SELECT inserir_alimento_taco('Quinoa', 68, 12.0, 5.8, 6.3, 21, 374);

-- VERDURAS, HORTALIÇAS E DERIVADOS
SELECT inserir_alimento_taco('Abóbora moranga', 4.6, 1.1, 0.1, 2.5, 1, 19);
SELECT inserir_alimento_taco('Abobrinha', 2.9, 1.2, 0.1, 1.0, 1, 16);
SELECT inserir_alimento_taco('Acelga', 2.8, 1.8, 0.2, 1.6, 213, 19);
SELECT inserir_alimento_taco('Agrião', 2.9, 2.6, 0.1, 1.1, 23, 17);
SELECT inserir_alimento_taco('Aipo', 2.4, 0.8, 0.2, 1.7, 91, 14);
SELECT inserir_alimento_taco('Alface', 2.9, 1.4, 0.2, 2.2, 9, 15);
SELECT inserir_alimento_taco('Alho', 28, 6.0, 0.1, 4.3, 14, 113);
SELECT inserir_alimento_taco('Berinjela', 5.7, 1.0, 0.2, 3.0, 1, 21);
SELECT inserir_alimento_taco('Beterraba', 11, 2.2, 0.1, 3.4, 58, 49);
SELECT inserir_alimento_taco('Brócolis', 4.0, 3.6, 0.4, 2.9, 33, 25);
SELECT inserir_alimento_taco('Cebolinha', 7.6, 1.8, 0.2, 2.6, 17, 27);
SELECT inserir_alimento_taco('Cenoura', 9.6, 0.9, 0.2, 2.8, 69, 41);
SELECT inserir_alimento_taco('Chicória', 4.7, 1.8, 0.3, 3.7, 22, 20);
SELECT inserir_alimento_taco('Coentro', 3.7, 2.1, 0.5, 2.8, 46, 23);
SELECT inserir_alimento_taco('Couve', 4.3, 2.9, 0.4, 2.5, 9, 25);
SELECT inserir_alimento_taco('Couve-flor', 4.9, 2.4, 0.2, 2.5, 15, 25);
SELECT inserir_alimento_taco('Espinafre', 3.4, 2.9, 0.4, 2.2, 79, 25);
SELECT inserir_alimento_taco('Jiló', 6.7, 1.7, 0.1, 3.9, 1, 27);
SELECT inserir_alimento_taco('Maxixe', 1.6, 0.7, 0.1, 0.9, 1, 8);
SELECT inserir_alimento_taco('Mostarda folha', 2.9, 2.7, 0.3, 3.2, 7, 20);
SELECT inserir_alimento_taco('Nabo', 4.3, 1.2, 0.2, 2.8, 18, 18);
SELECT inserir_alimento_taco('Pepino', 3.6, 0.7, 0.1, 0.5, 2, 15);
SELECT inserir_alimento_taco('Pimentão amarelo', 6.7, 1.2, 0.2, 1.9, 3, 27);
SELECT inserir_alimento_taco('Pimentão verde', 4.6, 1.0, 0.2, 1.7, 2, 20);
SELECT inserir_alimento_taco('Pimentão vermelho', 7.2, 1.0, 0.3, 2.5, 3, 31);
SELECT inserir_alimento_taco('Quiabo', 6.4, 1.9, 0.2, 4.6, 5, 30);
SELECT inserir_alimento_taco('Rabanete', 2.0, 0.8, 0.1, 1.6, 25, 10);
SELECT inserir_alimento_taco('Repolho', 5.4, 1.3, 0.1, 2.5, 9, 25);
SELECT inserir_alimento_taco('Rúcula', 3.7, 2.6, 0.7, 1.6, 27, 25);
SELECT inserir_alimento_taco('Salsa', 6.3, 3.7, 0.8, 3.3, 56, 36);
SELECT inserir_alimento_taco('Tomate', 3.9, 0.9, 0.2, 1.2, 5, 18);
SELECT inserir_alimento_taco('Vagem', 7.8, 2.4, 0.2, 2.7, 4, 35);

-- FRUTAS E DERIVADOS
SELECT inserir_alimento_taco('Abacate', 8.5, 2.0, 14.7, 6.7, 7, 160);
SELECT inserir_alimento_taco('Abacaxi', 13, 0.4, 0.1, 1.0, 1, 48);
SELECT inserir_alimento_taco('Açaí polpa', 6.2, 1.1, 3.9, 2.6, 7, 58);
SELECT inserir_alimento_taco('Acerola', 7.7, 0.9, 0.2, 1.5, 3, 33);
SELECT inserir_alimento_taco('Ameixa', 11, 0.5, 0.1, 2.4, 2, 44);
SELECT inserir_alimento_taco('Banana maçã', 26, 1.3, 0.1, 2.6, 1, 87);
SELECT inserir_alimento_taco('Banana nanica', 22, 1.4, 0.1, 1.9, 1, 92);
SELECT inserir_alimento_taco('Banana prata', 26, 1.3, 0.1, 2.0, 1, 98);
SELECT inserir_alimento_taco('Caju', 10, 1.0, 0.2, 1.7, 3, 43);
SELECT inserir_alimento_taco('Caqui', 19, 0.7, 0.2, 6.5, 1, 71);
SELECT inserir_alimento_taco('Carambola', 6.7, 1.0, 0.3, 2.8, 4, 31);
SELECT inserir_alimento_taco('Cereja', 16, 1.3, 0.3, 2.3, 3, 63);
SELECT inserir_alimento_taco('Coco água', 3.7, 0.7, 0.2, 0.0, 105, 19);
SELECT inserir_alimento_taco('Figo', 19, 1.3, 0.3, 4.7, 1, 74);
SELECT inserir_alimento_taco('Goiaba branca', 14, 2.5, 0.5, 6.2, 3, 54);
SELECT inserir_alimento_taco('Goiaba vermelha', 13, 1.1, 0.4, 6.3, 3, 52);
SELECT inserir_alimento_taco('Graviola', 15, 1.0, 0.2, 1.9, 4, 62);
SELECT inserir_alimento_taco('Jabuticaba', 15, 0.6, 0.1, 2.3, 3, 58);
SELECT inserir_alimento_taco('Jaca', 23, 1.2, 0.3, 2.4, 3, 88);
SELECT inserir_alimento_taco('Kiwi', 14, 1.1, 0.6, 2.7, 4, 56);
SELECT inserir_alimento_taco('Laranja bahia', 11, 1.0, 0.1, 4.0, 3, 45);
SELECT inserir_alimento_taco('Laranja pera', 11, 0.8, 0.2, 1.0, 2, 46);
SELECT inserir_alimento_taco('Limão', 9.3, 0.9, 0.3, 2.9, 2, 39);
SELECT inserir_alimento_taco('Maçã', 14, 0.2, 0.3, 1.3, 2, 56);
SELECT inserir_alimento_taco('Mamão formosa', 11, 0.8, 0.1, 1.8, 3, 40);
SELECT inserir_alimento_taco('Mamão papaia', 11, 0.5, 0.1, 1.0, 2, 45);
SELECT inserir_alimento_taco('Manga', 16, 0.6, 0.2, 1.7, 2, 65);
SELECT inserir_alimento_taco('Maracujá', 21, 2.2, 0.7, 15.6, 28, 97);
SELECT inserir_alimento_taco('Melancia', 8.1, 0.6, 0.2, 0.1, 1, 33);
SELECT inserir_alimento_taco('Melão', 8.2, 0.6, 0.1, 0.3, 12, 35);
SELECT inserir_alimento_taco('Morango', 6.8, 0.9, 0.3, 1.7, 1, 30);
SELECT inserir_alimento_taco('Nectarina', 12, 1.4, 0.2, 1.7, 6, 49);
SELECT inserir_alimento_taco('Pêra', 15, 0.4, 0.1, 3.0, 1, 57);
SELECT inserir_alimento_taco('Pêssego', 9.7, 0.9, 0.3, 1.5, 1, 40);
SELECT inserir_alimento_taco('Pitanga', 9.9, 1.0, 0.4, 3.2, 1, 42);
SELECT inserir_alimento_taco('Romã', 18, 1.0, 0.3, 0.6, 3, 68);
SELECT inserir_alimento_taco('Tangerina', 12, 0.9, 0.2, 1.7, 2, 44);
SELECT inserir_alimento_taco('Uva itália', 16, 0.7, 0.2, 0.9, 2, 62);
SELECT inserir_alimento_taco('Uva rubi', 17, 1.1, 0.4, 0.8, 1, 68);

-- OLEAGINOSAS E LEGUMINOSAS
SELECT inserir_alimento_taco('Amendoim', 20, 27.2, 43.9, 8.0, 5, 544);
SELECT inserir_alimento_taco('Castanha de caju', 30, 18.5, 43.8, 3.7, 12, 570);
SELECT inserir_alimento_taco('Castanha do pará', 12, 14.3, 66.4, 7.5, 3, 656);
SELECT inserir_alimento_taco('Ervilha', 16, 6.2, 0.4, 7.5, 2, 81);
SELECT inserir_alimento_taco('Feijão branco', 16, 10.5, 0.5, 24.4, 2, 123);
SELECT inserir_alimento_taco('Feijão carioca', 14, 8.6, 0.5, 8.5, 1, 127);
SELECT inserir_alimento_taco('Feijão fradinho', 18, 8.3, 0.6, 7.5, 2, 133);
SELECT inserir_alimento_taco('Feijão preto', 14, 8.9, 0.5, 8.4, 2, 132);
SELECT inserir_alimento_taco('Grão de bico', 16, 8.8, 1.5, 12.4, 6, 164);
SELECT inserir_alimento_taco('Lentilha', 16, 6.3, 0.6, 7.9, 2, 108);
SELECT inserir_alimento_taco('Nozes', 14, 15.8, 65.2, 6.7, 2, 687);
SELECT inserir_alimento_taco('Pistache', 28, 20.2, 45.3, 10.6, 1, 557);
SELECT inserir_alimento_taco('Soja', 30, 34.3, 17.7, 20.2, 1, 405);

-- CARNES E DERIVADOS
SELECT inserir_alimento_taco('Alcatra', 0.0, 23.0, 9.7, 0.0, 50, 174);
SELECT inserir_alimento_taco('Bife de fígado', 3.9, 21.4, 4.4, 0.0, 87, 136);
SELECT inserir_alimento_taco('Carne moída', 0.0, 20.7, 10.2, 0.0, 59, 175);
SELECT inserir_alimento_taco('Contrafilé', 0.0, 22.0, 13.0, 0.0, 45, 192);
SELECT inserir_alimento_taco('Coração bovino', 0.7, 16.9, 3.6, 0.0, 104, 98);
SELECT inserir_alimento_taco('Costela bovina', 0.0, 17.4, 18.0, 0.0, 55, 233);
SELECT inserir_alimento_taco('Cupim', 0.0, 21.0, 15.3, 0.0, 61, 211);
SELECT inserir_alimento_taco('Fígado bovino', 3.9, 21.4, 4.4, 0.0, 87, 136);
SELECT inserir_alimento_taco('Fraldinha', 0.0, 22.2, 8.8, 0.0, 52, 163);
SELECT inserir_alimento_taco('Lagarto', 0.0, 23.7, 3.4, 0.0, 54, 122);
SELECT inserir_alimento_taco('Músculo', 0.0, 21.0, 5.1, 0.0, 58, 130);
SELECT inserir_alimento_taco('Patinho', 0.0, 22.8, 4.9, 0.0, 55, 133);
SELECT inserir_alimento_taco('Picanha', 0.0, 20.3, 15.0, 0.0, 47, 210);

-- AVES
SELECT inserir_alimento_taco('Frango coxa', 0.0, 17.3, 9.4, 0.0, 79, 146);
SELECT inserir_alimento_taco('Frango peito', 0.0, 23.1, 3.6, 0.0, 47, 123);
SELECT inserir_alimento_taco('Frango sobrecoxa', 0.0, 18.3, 8.2, 0.0, 88, 141);
SELECT inserir_alimento_taco('Peru peito', 0.0, 21.9, 2.4, 0.0, 54, 108);

-- PEIXES
SELECT inserir_alimento_taco('Atum', 0.0, 28.9, 1.3, 0.0, 59, 130);
SELECT inserir_alimento_taco('Bacalhau', 0.0, 17.6, 0.3, 0.0, 11, 79);
SELECT inserir_alimento_taco('Corvina', 0.0, 17.0, 3.8, 0.0, 102, 100);
SELECT inserir_alimento_taco('Linguado', 0.0, 16.8, 1.2, 0.0, 78, 79);
SELECT inserir_alimento_taco('Merluza', 0.0, 17.1, 2.4, 0.0, 86, 90);
SELECT inserir_alimento_taco('Pescada', 0.0, 19.3, 1.2, 0.0, 108, 89);
SELECT inserir_alimento_taco('Robalo', 0.0, 18.4, 2.0, 0.0, 68, 90);
SELECT inserir_alimento_taco('Salmão', 0.0, 25.4, 12.4, 0.0, 98, 208);
SELECT inserir_alimento_taco('Sardinha', 0.0, 24.6, 10.5, 0.0, 104, 190);
SELECT inserir_alimento_taco('Tilápia', 0.0, 20.1, 1.5, 0.0, 47, 96);

-- OVOS
SELECT inserir_alimento_taco('Clara de ovo', 1.6, 10.9, 0.0, 0.0, 166, 44);
SELECT inserir_alimento_taco('Gema de ovo', 1.6, 15.7, 31.9, 0.0, 48, 353);
SELECT inserir_alimento_taco('Ovo de galinha inteiro', 1.1, 13.0, 11.0, 0.0, 124, 155);
SELECT inserir_alimento_taco('Ovo de codorna', 0.4, 13.1, 11.1, 0.0, 141, 158);

-- LEITE E DERIVADOS
SELECT inserir_alimento_taco('Iogurte desnatado', 7.0, 4.0, 0.2, 0.0, 58, 43);
SELECT inserir_alimento_taco('Iogurte integral', 4.7, 3.5, 3.0, 0.0, 50, 61);
SELECT inserir_alimento_taco('Leite condensado', 54, 7.2, 7.9, 0.0, 104, 306);
SELECT inserir_alimento_taco('Leite desnatado', 4.9, 3.4, 0.2, 0.0, 52, 35);
SELECT inserir_alimento_taco('Leite integral', 4.8, 3.2, 3.5, 0.0, 50, 61);
SELECT inserir_alimento_taco('Queijo minas', 3.0, 18.0, 20.0, 0.0, 346, 264);
SELECT inserir_alimento_taco('Queijo mozzarela', 2.2, 22.2, 18.1, 0.0, 627, 280);
SELECT inserir_alimento_taco('Queijo parmesão', 3.4, 35.6, 25.0, 0.0, 1200, 393);
SELECT inserir_alimento_taco('Queijo prato', 1.7, 25.8, 24.6, 0.0, 740, 360);
SELECT inserir_alimento_taco('Requeijão', 3.0, 11.2, 21.5, 0.0, 758, 252);

-- ÓLEOS E GORDURAS
SELECT inserir_alimento_taco('Azeite de oliva', 0.0, 0.0, 100.0, 0.0, 2, 884);
SELECT inserir_alimento_taco('Manteiga', 0.0, 0.5, 81.0, 0.0, 11, 717);
SELECT inserir_alimento_taco('Margarina', 0.4, 0.9, 61.0, 0.0, 572, 596);
SELECT inserir_alimento_taco('Óleo de canola', 0.0, 0.0, 100.0, 0.0, 0, 884);
SELECT inserir_alimento_taco('Óleo de girassol', 0.0, 0.0, 100.0, 0.0, 0, 884);
SELECT inserir_alimento_taco('Óleo de milho', 0.0, 0.0, 100.0, 0.0, 0, 884);
SELECT inserir_alimento_taco('Óleo de soja', 0.0, 0.0, 100.0, 0.0, 0, 884);

-- AÇÚCARES, DOCES E PRODUTOS DE CONFEITARIA
SELECT inserir_alimento_taco('Açúcar cristal', 100, 0.0, 0.0, 0.0, 1, 387);
SELECT inserir_alimento_taco('Açúcar mascavo', 97, 0.1, 0.1, 0.0, 19, 376);
SELECT inserir_alimento_taco('Chocolate ao leite', 57, 7.3, 31.0, 2.4, 65, 528);
SELECT inserir_alimento_taco('Chocolate amargo', 47, 5.8, 35.0, 7.0, 11, 479);
SELECT inserir_alimento_taco('Doce de leite', 55, 7.3, 7.5, 0.0, 180, 315);
SELECT inserir_alimento_taco('Geleia de frutas', 65, 0.4, 0.1, 1.4, 14, 266);
SELECT inserir_alimento_taco('Mel', 82, 0.4, 0.0, 0.2, 4, 309);
SELECT inserir_alimento_taco('Rapadura', 87, 2.1, 0.6, 0.0, 37, 361);
SELECT inserir_alimento_taco('Sorvete', 22, 3.5, 8.4, 0.7, 58, 165);

-- BEBIDAS
SELECT inserir_alimento_taco('Água de coco', 3.7, 0.7, 0.2, 0.0, 105, 19);
SELECT inserir_alimento_taco('Café', 0.0, 0.2, 0.0, 0.0, 5, 2);
SELECT inserir_alimento_taco('Chá preto', 0.0, 0.0, 0.0, 0.0, 3, 1);
SELECT inserir_alimento_taco('Refrigerante cola', 11, 0.0, 0.0, 0.0, 5, 42);
SELECT inserir_alimento_taco('Suco de laranja', 10, 0.7, 0.2, 0.2, 2, 45);
SELECT inserir_alimento_taco('Suco de uva', 15, 0.2, 0.1, 0.0, 2, 58);

-- TEMPEROS E CONDIMENTOS
SELECT inserir_alimento_taco('Canela', 81, 4.0, 1.2, 53.1, 10, 247);
SELECT inserir_alimento_taco('Cebola', 9.3, 1.2, 0.1, 2.0, 4, 40);
SELECT inserir_alimento_taco('Cravo', 65, 6.0, 13.0, 34.2, 277, 323);
SELECT inserir_alimento_taco('Gengibre', 18, 1.8, 0.8, 2.0, 13, 80);
SELECT inserir_alimento_taco('Hortelã', 8.4, 3.8, 0.7, 8.0, 31, 44);
SELECT inserir_alimento_taco('Orégano', 69, 9.0, 4.3, 42.5, 25, 265);
SELECT inserir_alimento_taco('Pimenta do reino', 64, 11.0, 3.3, 25.3, 20, 251);
SELECT inserir_alimento_taco('Sal', 0.0, 0.0, 0.0, 0.0, 38758, 0);
SELECT inserir_alimento_taco('Tomilho', 64, 5.6, 7.4, 37.0, 9, 276);
SELECT inserir_alimento_taco('Vinagre', 0.4, 0.0, 0.0, 0.0, 2, 4);

-- Remover função temporária
DROP FUNCTION inserir_alimento_taco(TEXT, NUMERIC, NUMERIC, NUMERIC, NUMERIC, NUMERIC, NUMERIC);

-- Atualizar contadores e estatísticas
ANALYZE valores_nutricionais_completos;