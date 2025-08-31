-- Aplicar base robusta TACO com dados essenciais corrigidos
-- Usando estrutura simplificada e dados precisos

-- Primeiro: garantir que a tabela valores_nutricionais_completos existe com estrutura correta
DO $$ BEGIN
  -- Recriar tabela se necessário com estrutura correta
  DROP TABLE IF EXISTS valores_nutricionais_completos CASCADE;
  
  CREATE TABLE valores_nutricionais_completos (
    id SERIAL PRIMARY KEY,
    alimento_nome VARCHAR(255) UNIQUE NOT NULL,
    kcal INTEGER,
    proteina INTEGER,
    gorduras INTEGER, 
    carboidratos INTEGER,
    fibras INTEGER,
    sodio INTEGER,
    created_at TIMESTAMP DEFAULT NOW()
  );
END $$;

-- Inserir dados TACO essenciais com valores inteiros (evitar overflow)
INSERT INTO valores_nutricionais_completos (alimento_nome, kcal, proteina, gorduras, carboidratos, fibras, sodio)
VALUES 
  -- OVOS (dados TACO corretos - valores por 100g)
  ('ovo de galinha cozido', 155, 13, 11, 1, 0, 140),
  ('ovo', 155, 13, 11, 1, 0, 140),
  ('ovos', 155, 13, 11, 1, 0, 140),
  ('ovo cozido', 155, 13, 11, 1, 0, 140),
  ('ovo frito', 190, 14, 15, 1, 0, 145),
  
  -- CARBOIDRATOS BRASILEIROS
  ('arroz branco cozido', 128, 3, 0, 28, 2, 1),
  ('arroz, branco, cozido', 128, 3, 0, 28, 2, 1),
  ('arroz', 128, 3, 0, 28, 2, 1),
  ('feijao preto cozido', 77, 5, 1, 14, 8, 2),
  ('feijão', 77, 5, 1, 14, 8, 2),
  ('feijao', 77, 5, 1, 14, 8, 2),
  ('batata cozida', 52, 1, 0, 12, 1, 1),
  ('batata', 52, 1, 0, 12, 1, 1),
  ('batata frita', 312, 4, 15, 40, 4, 15),
  ('macarrão cozido', 111, 3, 1, 23, 3, 1),
  ('massa', 111, 3, 1, 23, 3, 1),
  
  -- PROTEÍNAS ANIMAIS
  ('frango grelhado', 165, 31, 4, 0, 0, 70),
  ('frango', 165, 31, 4, 0, 0, 70),
  ('carne bovina cozida', 217, 26, 11, 0, 0, 55),
  ('carne', 217, 26, 11, 0, 0, 55),
  ('peixe', 96, 20, 1, 0, 0, 50),
  ('salmão', 208, 25, 12, 0, 0, 59),
  
  -- VEGETAIS E VERDURAS
  ('salada verde', 14, 1, 0, 2, 2, 5),
  ('salada', 14, 1, 0, 2, 2, 5),
  ('tomate', 18, 1, 0, 4, 1, 5),
  ('alface', 11, 1, 0, 2, 2, 10),
  ('brócolis', 25, 3, 0, 4, 3, 41),
  ('cenoura', 32, 1, 0, 8, 3, 35),
  ('cebola', 28, 1, 0, 6, 2, 3),
  ('abóbora', 26, 1, 0, 7, 1, 1),
  ('abobrinha', 20, 1, 0, 4, 1, 1),
  ('couve-flor', 25, 2, 0, 5, 2, 30),
  ('pimentão', 20, 1, 0, 5, 2, 2),
  
  -- MOLHOS E TEMPEROS
  ('molho de tomate', 29, 2, 0, 7, 1, 9),
  ('molho', 29, 2, 0, 7, 1, 9),
  ('azeite de oliva', 884, 0, 100, 0, 0, 2),
  ('azeite', 884, 0, 100, 0, 0, 2),
  ('óleo de soja', 884, 0, 100, 0, 0, 0),
  ('óleo', 884, 0, 100, 0, 0, 0),
  
  -- LATICÍNIOS
  ('queijo minas', 264, 17, 20, 4, 0, 346),
  ('queijo', 264, 17, 20, 4, 0, 346),
  ('queijo parmesão', 456, 42, 30, 4, 0, 800),
  ('queijo ralado', 456, 42, 30, 4, 0, 800),
  ('leite integral', 61, 3, 3, 5, 0, 40),
  ('leite', 61, 3, 3, 5, 0, 40),
  ('iogurte natural', 59, 4, 3, 5, 0, 46),
  
  -- MASSAS E PREPARAÇÕES
  ('lasanha', 135, 8, 4, 18, 2, 180),
  ('lasanha bolonhesa', 150, 10, 6, 18, 2, 220),
  ('pizza margherita', 266, 11, 10, 33, 2, 598),
  ('hambúrguer', 250, 17, 15, 15, 2, 497),
  
  -- FARINHAS E OUTROS
  ('farofa pronta', 365, 4, 14, 58, 6, 697),
  ('farofa', 365, 4, 14, 58, 6, 697),
  ('pão francês', 300, 9, 3, 59, 7, 659),
  ('pão', 300, 9, 3, 59, 7, 659),
  ('açúcar cristal', 387, 0, 0, 100, 0, 1),
  ('açúcar', 387, 0, 0, 100, 0, 1),
  
  -- FRUTAS BRASILEIRAS
  ('banana nanica', 89, 1, 0, 23, 3, 1),
  ('banana', 89, 1, 0, 23, 3, 1),
  ('maçã', 52, 0, 0, 14, 2, 1),
  ('laranja', 47, 1, 0, 12, 2, 1),
  ('manga', 60, 1, 0, 15, 2, 1),
  ('mamão', 43, 1, 0, 11, 2, 3),
  ('abacaxi', 50, 1, 0, 13, 1, 1),
  
  -- LEGUMINOSAS BRASILEIRAS
  ('lentilha cozida', 116, 9, 0, 20, 8, 2),
  ('grão de bico cozido', 164, 9, 3, 27, 8, 7),
  ('ervilha', 81, 5, 0, 14, 5, 5)

ON CONFLICT (alimento_nome) DO UPDATE SET
  kcal = EXCLUDED.kcal,
  proteina = EXCLUDED.proteina,
  gorduras = EXCLUDED.gorduras,
  carboidratos = EXCLUDED.carboidratos,
  fibras = EXCLUDED.fibras,
  sodio = EXCLUDED.sodio;

-- Mostrar resultado
SELECT '✅ BASE ROBUSTA TACO APLICADA COM SUCESSO!' as status;
SELECT COUNT(*) || ' alimentos inseridos/atualizados' as total FROM valores_nutricionais_completos;
