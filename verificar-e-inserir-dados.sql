-- ========================================
-- VERIFICAR E INSERIR DADOS SEGUROS
-- EVITAR ERROS DE FOREIGN KEY
-- ========================================

-- 1. PRIMEIRO: VERIFICAR SE ALIMENTOS COMPLETOS EXISTEM
DO $$
DECLARE
    alimento_count INTEGER;
BEGIN
    -- Verificar quantos alimentos existem
    SELECT COUNT(*) INTO alimento_count FROM alimentos_completos;
    
    -- Se não existem alimentos, inserir
    IF alimento_count = 0 THEN
        RAISE NOTICE 'Inserindo 23 alimentos medicinais...';
        
        INSERT INTO alimentos_completos (nome, nome_cientifico, nome_ingles, categoria, subcategoria, propriedades_medicinais, principios_ativos, indicacoes_terapeuticas, contraindicacoes, dosagem_terapeutica) VALUES

        -- PROTEÍNAS ANIMAIS MEDICINAIS
        ('Frango', 'Gallus gallus domesticus', 'Chicken', 'Proteínas', 'Aves', 'Anti-inflamatório, rico em proteínas de alta qualidade, fonte de vitaminas B', ARRAY['Proteínas', 'Vitaminas B', 'Selênio'], ARRAY['Recuperação muscular', 'Sistema imunológico', 'Saúde da pele'], ARRAY['Alergia a frango'], '150-200g por refeição'),

        ('Peixe', 'Várias espécies', 'Fish', 'Proteínas', 'Peixes', 'Rico em ômega-3, anti-inflamatório, benéfico para coração e cérebro', ARRAY['Ômega-3', 'Proteínas', 'Vitamina D'], ARRAY['Saúde cardiovascular', 'Função cerebral', 'Anti-inflamação'], ARRAY['Alergia a peixe'], '150-200g por refeição'),

        ('Ovos', 'Gallus gallus', 'Eggs', 'Proteínas', 'Ovos', 'Proteína completa, colina para cérebro, luteína para olhos', ARRAY['Proteínas', 'Colina', 'Luteína', 'Vitaminas B'], ARRAY['Desenvolvimento cerebral', 'Saúde ocular', 'Músculos'], ARRAY['Alergia a ovo'], '2-3 ovos por dia'),

        -- LEGUMINOSAS MEDICINAIS
        ('Feijão', 'Phaseolus vulgaris', 'Beans', 'Leguminosas', 'Feijões', 'Rico em fibras, proteínas, ferro e antioxidantes', ARRAY['Fibras', 'Proteínas', 'Ferro', 'Antioxidantes'], ARRAY['Saúde digestiva', 'Controle glicêmico', 'Energia'], ARRAY['Gases excessivos'], '100-150g por refeição'),

        ('Lentilha', 'Lens culinaris', 'Lentils', 'Leguminosas', 'Lentilhas', 'Proteína vegetal, fibras, ferro e ácido fólico', ARRAY['Proteínas', 'Fibras', 'Ferro', 'Ácido fólico'], ARRAY['Saúde cardiovascular', 'Gravidez', 'Energia'], ARRAY['Gases excessivos'], '100-150g por refeição'),

        ('Grão de Bico', 'Cicer arietinum', 'Chickpeas', 'Leguminosas', 'Grãos', 'Proteína vegetal, fibras, antioxidantes e minerais', ARRAY['Proteínas', 'Fibras', 'Antioxidantes', 'Minerais'], ARRAY['Controle glicêmico', 'Saúde digestiva', 'Energia'], ARRAY['Gases excessivos'], '100-150g por refeição'),

        -- CEREAIS INTEGRAIS MEDICINAIS
        ('Arroz Integral', 'Oryza sativa', 'Brown Rice', 'Cereais', 'Arroz', 'Fibras, vitaminas B, minerais e antioxidantes', ARRAY['Fibras', 'Vitaminas B', 'Minerais', 'Antioxidantes'], ARRAY['Saúde digestiva', 'Energia sustentada', 'Controle glicêmico'], ARRAY['Alergia a arroz'], '100-150g por refeição'),

        ('Quinoa', 'Chenopodium quinoa', 'Quinoa', 'Cereais', 'Pseudocereais', 'Proteína completa, fibras, antioxidantes e minerais', ARRAY['Proteínas', 'Fibras', 'Antioxidantes', 'Minerais'], ARRAY['Saúde digestiva', 'Energia', 'Controle glicêmico'], ARRAY['Alergia a quinoa'], '100-150g por refeição'),

        ('Aveia', 'Avena sativa', 'Oats', 'Cereais', 'Aveia', 'Betaglucana, fibras, antioxidantes e minerais', ARRAY['Betaglucana', 'Fibras', 'Antioxidantes', 'Minerais'], ARRAY['Controle colesterol', 'Saúde digestiva', 'Energia sustentada'], ARRAY['Alergia a aveia'], '50-100g por refeição'),

        -- FRUTAS MEDICINAIS
        ('Maçã', 'Malus domestica', 'Apple', 'Frutas', 'Maçãs', 'Pectina, antioxidantes, vitaminas e minerais', ARRAY['Pectina', 'Antioxidantes', 'Vitaminas', 'Minerais'], ARRAY['Saúde digestiva', 'Controle glicêmico', 'Sistema imunológico'], ARRAY['Alergia a maçã'], '1-2 maçãs por dia'),

        ('Banana', 'Musa acuminata', 'Banana', 'Frutas', 'Bananas', 'Potássio, vitaminas B6, fibras e antioxidantes', ARRAY['Potássio', 'Vitamina B6', 'Fibras', 'Antioxidantes'], ARRAY['Saúde cardiovascular', 'Energia', 'Recuperação muscular'], ARRAY['Diabetes descontrolado'], '1-2 bananas por dia'),

        ('Laranja', 'Citrus sinensis', 'Orange', 'Frutas', 'Citros', 'Vitamina C, antioxidantes, fibras e minerais', ARRAY['Vitamina C', 'Antioxidantes', 'Fibras', 'Minerais'], ARRAY['Sistema imunológico', 'Saúde da pele', 'Absorção de ferro'], ARRAY['Alergia a citros'], '1-2 laranjas por dia'),

        -- LEGUMES MEDICINAIS
        ('Brócolis', 'Brassica oleracea', 'Broccoli', 'Legumes', 'Crucíferas', 'Sulforafano, antioxidantes, vitaminas e minerais', ARRAY['Sulforafano', 'Antioxidantes', 'Vitaminas', 'Minerais'], ARRAY['Prevenção câncer', 'Sistema imunológico', 'Saúde óssea'], ARRAY['Hipotireoidismo'], '100-200g por refeição'),

        ('Cenoura', 'Daucus carota', 'Carrot', 'Legumes', 'Cenouras', 'Betacaroteno, antioxidantes, fibras e vitaminas', ARRAY['Betacaroteno', 'Antioxidantes', 'Fibras', 'Vitaminas'], ARRAY['Saúde ocular', 'Sistema imunológico', 'Saúde da pele'], ARRAY['Excesso de vitamina A'], '100-200g por refeição'),

        ('Tomate', 'Solanum lycopersicum', 'Tomato', 'Legumes', 'Tomates', 'Licopeno, antioxidantes, vitaminas e minerais', ARRAY['Licopeno', 'Antioxidantes', 'Vitaminas', 'Minerais'], ARRAY['Prevenção câncer', 'Saúde cardiovascular', 'Saúde da pele'], ARRAY['Alergia a tomate'], '100-200g por refeição'),

        -- SEMENTES E OLEAGINOSAS MEDICINAIS
        ('Chia', 'Salvia hispanica', 'Chia Seeds', 'Sementes', 'Chia', 'Ômega-3, fibras, proteínas e antioxidantes', ARRAY['Ômega-3', 'Fibras', 'Proteínas', 'Antioxidantes'], ARRAY['Saúde cardiovascular', 'Controle glicêmico', 'Saúde digestiva'], ARRAY['Obstrução intestinal'], '1-2 colheres por dia'),

        ('Linhaça', 'Linum usitatissimum', 'Flaxseeds', 'Sementes', 'Linhaça', 'Ômega-3, lignanas, fibras e antioxidantes', ARRAY['Ômega-3', 'Lignanas', 'Fibras', 'Antioxidantes'], ARRAY['Saúde hormonal', 'Saúde cardiovascular', 'Controle glicêmico'], ARRAY['Obstrução intestinal'], '1-2 colheres por dia'),

        ('Amêndoas', 'Prunus dulcis', 'Almonds', 'Oleaginosas', 'Amêndoas', 'Vitamina E, gorduras boas, proteínas e minerais', ARRAY['Vitamina E', 'Gorduras boas', 'Proteínas', 'Minerais'], ARRAY['Saúde cardiovascular', 'Saúde da pele', 'Energia'], ARRAY['Alergia a amêndoas'], '30-50g por dia'),

        -- LATICÍNIOS MEDICINAIS
        ('Iogurte Natural', 'Fermentado', 'Natural Yogurt', 'Laticínios', 'Iogurtes', 'Probióticos, proteínas, cálcio e vitaminas', ARRAY['Probióticos', 'Proteínas', 'Cálcio', 'Vitaminas'], ARRAY['Saúde digestiva', 'Sistema imunológico', 'Saúde óssea'], ARRAY['Intolerância à lactose'], '200-300ml por dia'),

        ('Queijo Cottage', 'Fermentado', 'Cottage Cheese', 'Laticínios', 'Queijos', 'Proteínas, cálcio, probióticos e vitaminas', ARRAY['Proteínas', 'Cálcio', 'Probióticos', 'Vitaminas'], ARRAY['Recuperação muscular', 'Saúde óssea', 'Sistema imunológico'], ARRAY['Intolerância à lactose'], '100-150g por refeição'),

        -- ERVAS E TEMPEROS MEDICINAIS
        ('Gengibre', 'Zingiber officinale', 'Ginger', 'Ervas', 'Gengibre', 'Anti-inflamatório, digestivo, antioxidante', ARRAY['Gingerol', 'Anti-inflamatórios', 'Antioxidantes'], ARRAY['Náuseas', 'Anti-inflamação', 'Digestão'], ARRAY['Gastrite', 'Gravidez avançada'], '2-5g por dia'),

        ('Cúrcuma', 'Curcuma longa', 'Turmeric', 'Ervas', 'Cúrcuma', 'Curcumina, anti-inflamatório, antioxidante', ARRAY['Curcumina', 'Anti-inflamatórios', 'Antioxidantes'], ARRAY['Anti-inflamação', 'Saúde articular', 'Proteção hepática'], ARRAY['Pedras na vesícula'], '1-3g por dia'),

        ('Alho', 'Allium sativum', 'Garlic', 'Ervas', 'Alho', 'Alicina, anti-inflamatório, antimicrobiano', ARRAY['Alicina', 'Anti-inflamatórios', 'Antimicrobianos'], ARRAY['Sistema imunológico', 'Saúde cardiovascular', 'Anti-inflamação'], ARRAY['Gastrite', 'Alergia a alho'], '2-4 dentes por dia');

        RAISE NOTICE '✅ 23 alimentos medicinais inseridos com sucesso!';
    ELSE
        RAISE NOTICE '⚠️ Alimentos já existem (% registros encontrados)', alimento_count;
    END IF;
END $$;

-- 2. SEGUNDO: VERIFICAR E INSERIR VALORES NUTRICIONAIS
DO $$
DECLARE
    alimento_id INTEGER;
    valor_count INTEGER;
BEGIN
    -- Para cada alimento, verificar se já tem valores nutricionais
    FOR alimento_id IN SELECT id FROM alimentos_completos ORDER BY id LOOP
        SELECT COUNT(*) INTO valor_count FROM valores_nutricionais_completos WHERE alimento_id = alimento_id;
        
        IF valor_count = 0 THEN
            -- Inserir valores nutricionais baseados no nome do alimento
            INSERT INTO valores_nutricionais_completos (alimento_id, proteina, carboidrato, gordura, gordura_saturada, gordura_insaturada, fibras, calorias, indice_glicemico, vitamina_c, vitamina_b1, vitamina_b6, calcio, ferro, magnesio, potassio, zinco, omega_3, omega_6, pdcaas, valor_biologico)
            SELECT 
                ac.id,
                CASE 
                    WHEN ac.nome = 'Frango' THEN 23.0
                    WHEN ac.nome = 'Peixe' THEN 20.0
                    WHEN ac.nome = 'Ovos' THEN 12.5
                    WHEN ac.nome = 'Feijão' THEN 8.9
                    WHEN ac.nome = 'Lentilha' THEN 9.0
                    WHEN ac.nome = 'Grão de Bico' THEN 8.9
                    WHEN ac.nome = 'Arroz Integral' THEN 2.7
                    WHEN ac.nome = 'Quinoa' THEN 4.4
                    WHEN ac.nome = 'Aveia' THEN 2.4
                    WHEN ac.nome = 'Maçã' THEN 0.3
                    WHEN ac.nome = 'Banana' THEN 1.1
                    WHEN ac.nome = 'Laranja' THEN 0.9
                    WHEN ac.nome = 'Brócolis' THEN 2.8
                    WHEN ac.nome = 'Cenoura' THEN 0.9
                    WHEN ac.nome = 'Tomate' THEN 0.9
                    WHEN ac.nome = 'Chia' THEN 16.5
                    WHEN ac.nome = 'Linhaça' THEN 18.3
                    WHEN ac.nome = 'Amêndoas' THEN 21.2
                    WHEN ac.nome = 'Iogurte Natural' THEN 3.5
                    WHEN ac.nome = 'Queijo Cottage' THEN 11.1
                    WHEN ac.nome = 'Gengibre' THEN 1.8
                    WHEN ac.nome = 'Cúrcuma' THEN 8.0
                    WHEN ac.nome = 'Alho' THEN 6.4
                    ELSE 5.0
                END as proteina,
                CASE 
                    WHEN ac.nome = 'Frango' THEN 0.0
                    WHEN ac.nome = 'Peixe' THEN 0.0
                    WHEN ac.nome = 'Ovos' THEN 0.6
                    WHEN ac.nome = 'Feijão' THEN 23.7
                    WHEN ac.nome = 'Lentilha' THEN 20.1
                    WHEN ac.nome = 'Grão de Bico' THEN 27.4
                    WHEN ac.nome = 'Arroz Integral' THEN 23.5
                    WHEN ac.nome = 'Quinoa' THEN 21.3
                    WHEN ac.nome = 'Aveia' THEN 12.0
                    WHEN ac.nome = 'Maçã' THEN 13.8
                    WHEN ac.nome = 'Banana' THEN 22.8
                    WHEN ac.nome = 'Laranja' THEN 11.8
                    WHEN ac.nome = 'Brócolis' THEN 6.6
                    WHEN ac.nome = 'Cenoura' THEN 9.6
                    WHEN ac.nome = 'Tomate' THEN 3.9
                    WHEN ac.nome = 'Chia' THEN 42.1
                    WHEN ac.nome = 'Linhaça' THEN 28.9
                    WHEN ac.nome = 'Amêndoas' THEN 21.7
                    WHEN ac.nome = 'Iogurte Natural' THEN 4.7
                    WHEN ac.nome = 'Queijo Cottage' THEN 3.4
                    WHEN ac.nome = 'Gengibre' THEN 17.8
                    WHEN ac.nome = 'Cúrcuma' THEN 65.0
                    WHEN ac.nome = 'Alho' THEN 33.1
                    ELSE 15.0
                END as carboidrato,
                CASE 
                    WHEN ac.nome = 'Frango' THEN 3.6
                    WHEN ac.nome = 'Peixe' THEN 4.5
                    WHEN ac.nome = 'Ovos' THEN 9.7
                    WHEN ac.nome = 'Feijão' THEN 0.5
                    WHEN ac.nome = 'Lentilha' THEN 0.4
                    WHEN ac.nome = 'Grão de Bico' THEN 2.6
                    WHEN ac.nome = 'Arroz Integral' THEN 0.9
                    WHEN ac.nome = 'Quinoa' THEN 1.9
                    WHEN ac.nome = 'Aveia' THEN 2.0
                    WHEN ac.nome = 'Maçã' THEN 0.2
                    WHEN ac.nome = 'Banana' THEN 0.3
                    WHEN ac.nome = 'Laranja' THEN 0.1
                    WHEN ac.nome = 'Brócolis' THEN 0.4
                    WHEN ac.nome = 'Cenoura' THEN 0.2
                    WHEN ac.nome = 'Tomate' THEN 0.2
                    WHEN ac.nome = 'Chia' THEN 30.7
                    WHEN ac.nome = 'Linhaça' THEN 42.2
                    WHEN ac.nome = 'Amêndoas' THEN 49.9
                    WHEN ac.nome = 'Iogurte Natural' THEN 3.3
                    WHEN ac.nome = 'Queijo Cottage' THEN 4.3
                    WHEN ac.nome = 'Gengibre' THEN 0.8
                    WHEN ac.nome = 'Cúrcuma' THEN 10.0
                    WHEN ac.nome = 'Alho' THEN 0.5
                    ELSE 2.0
                END as gordura,
                1.0 as gordura_saturada,
                1.0 as gordura_insaturada,
                2.0 as fibras,
                100 as calorias,
                30 as indice_glicemico,
                5.0 as vitamina_c,
                0.1 as vitamina_b1,
                0.1 as vitamina_b6,
                50.0 as calcio,
                1.0 as ferro,
                25.0 as magnesio,
                200.0 as potassio,
                1.0 as zinco,
                0.1 as omega_3,
                0.5 as omega_6,
                0.75 as pdcaas,
                75 as valor_biologico
            FROM alimentos_completos ac
            WHERE ac.id = alimento_id;
            
            RAISE NOTICE '✅ Valores nutricionais inseridos para alimento ID %', alimento_id;
        ELSE
            RAISE NOTICE '⚠️ Valores nutricionais já existem para alimento ID %', alimento_id;
        END IF;
    END LOOP;
END $$;

-- 3. TERCEIRO: VERIFICAR E INSERIR DOENÇAS
DO $$
DECLARE
    doenca_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO doenca_count FROM doencas_condicoes;
    
    IF doenca_count = 0 THEN
        RAISE NOTICE 'Inserindo 10 doenças com abordagem nutricional...';
        
        INSERT INTO doencas_condicoes (nome, categoria, descricao, sintomas, causas, fatores_risco, abordagem_nutricional, alimentos_beneficos, alimentos_evitar) VALUES

        ('Diabetes Tipo 2', 'Metabólica', 'Distúrbio do metabolismo da glicose', ARRAY['Sede excessiva', 'Fome excessiva', 'Fadiga'], ARRAY['Resistência à insulina', 'Genética', 'Estilo de vida'], ARRAY['Obesidade', 'Sedentarismo', 'Histórico familiar'], 'Controle glicêmico com alimentos de baixo índice glicêmico', ARRAY['Aveia', 'Quinoa', 'Feijão', 'Brócolis'], ARRAY['Açúcar refinado', 'Farinhas brancas', 'Refrigerantes']),

        ('Hipertensão', 'Cardiovascular', 'Pressão arterial elevada', ARRAY['Dor de cabeça', 'Tontura', 'Falta de ar'], ARRAY['Estilo de vida', 'Genética', 'Estresse'], ARRAY['Obesidade', 'Sedentarismo', 'Consumo excessivo de sal'], 'Redução de sódio e aumento de potássio', ARRAY['Banana', 'Aveia', 'Peixe', 'Brócolis'], ARRAY['Sal em excesso', 'Alimentos processados', 'Queijos salgados']),

        ('Obesidade', 'Metabólica', 'Excesso de peso corporal', ARRAY['Ganho de peso', 'Fadiga', 'Dificuldade para se exercitar'], ARRAY['Desequilíbrio energético', 'Genética', 'Estilo de vida'], ARRAY['Sedentarismo', 'Alimentação inadequada', 'Estresse'], 'Déficit calórico controlado com alimentos saciantes', ARRAY['Aveia', 'Feijão', 'Brócolis', 'Amêndoas'], ARRAY['Açúcares', 'Frituras', 'Alimentos processados']),

        ('Colesterol Alto', 'Cardiovascular', 'Elevação do colesterol LDL', ARRAY['Geralmente assintomático'], ARRAY['Alimentação rica em gorduras saturadas', 'Genética', 'Sedentarismo'], ARRAY['Obesidade', 'Sedentarismo', 'Alimentação inadequada'], 'Redução de gorduras saturadas e aumento de fibras', ARRAY['Aveia', 'Peixe', 'Amêndoas', 'Brócolis'], ARRAY['Carnes gordas', 'Queijos gordos', 'Frituras']),

        ('Anemia', 'Hematológica', 'Deficiência de ferro', ARRAY['Fadiga', 'Palidez', 'Falta de ar'], ARRAY['Deficiência de ferro', 'Perda de sangue', 'Má absorção'], ARRAY['Gravidez', 'Menstruação abundante', 'Vegetarianismo'], 'Aumento de alimentos ricos em ferro com vitamina C', ARRAY['Feijão', 'Lentilha', 'Brócolis', 'Laranja'], ARRAY['Café', 'Chá', 'Leite durante refeições']),

        ('Constipação', 'Digestiva', 'Dificuldade para evacuar', ARRAY['Evacuação infrequente', 'Fezes duras', 'Inchaço'], ARRAY['Baixo consumo de fibras', 'Hidratação inadequada', 'Sedentarismo'], ARRAY['Sedentarismo', 'Baixo consumo de água', 'Alimentação pobre em fibras'], 'Aumento de fibras e hidratação', ARRAY['Aveia', 'Feijão', 'Brócolis', 'Maçã'], ARRAY['Alimentos refinados', 'Queijos', 'Carnes processadas']),

        ('Gastrite', 'Digestiva', 'Inflamação do estômago', ARRAY['Dor no estômago', 'Náusea', 'Queimação'], ARRAY['H. pylori', 'Uso de anti-inflamatórios', 'Estresse'], ARRAY['Estresse', 'Uso de medicamentos', 'Alimentação inadequada'], 'Alimentos anti-inflamatórios e digestivos', ARRAY['Gengibre', 'Iogurte', 'Brócolis', 'Aveia'], ARRAY['Café', 'Álcool', 'Alimentos picantes']),

        ('Artrite', 'Inflamatória', 'Inflamação das articulações', ARRAY['Dor nas articulações', 'Rigidez', 'Inchaço'], ARRAY['Autoimunidade', 'Desgaste articular', 'Genética'], ARRAY['Idade', 'Obesidade', 'Lesões articulares'], 'Alimentos anti-inflamatórios', ARRAY['Peixe', 'Cúrcuma', 'Gengibre', 'Brócolis'], ARRAY['Carnes processadas', 'Frituras', 'Açúcares']),

        ('Insônia', 'Neurológica', 'Dificuldade para dormir', ARRAY['Dificuldade para adormecer', 'Acordar durante a noite', 'Fadiga diurna'], ARRAY['Estresse', 'Ansiedade', 'Má higiene do sono'], ARRAY['Estresse', 'Uso de cafeína', 'Exposição a telas'], 'Alimentos que promovem o sono', ARRAY['Aveia', 'Banana', 'Iogurte', 'Amêndoas'], ARRAY['Café', 'Chá preto', 'Chocolate']),

        ('Ansiedade', 'Psicológica', 'Estado de preocupação excessiva', ARRAY['Preocupação excessiva', 'Irritabilidade', 'Tensão muscular'], ARRAY['Estresse', 'Genética', 'Traumas'], ARRAY['Estresse', 'Histórico familiar', 'Uso de substâncias'], 'Alimentos que promovem calma e serotonina', ARRAY['Aveia', 'Banana', 'Amêndoas', 'Iogurte'], ARRAY['Café', 'Açúcares', 'Álcool']);

        RAISE NOTICE '✅ 10 doenças inseridas com sucesso!';
    ELSE
        RAISE NOTICE '⚠️ Doenças já existem (% registros encontrados)', doenca_count;
    END IF;
END $$;

-- 4. QUARTO: VERIFICAR E INSERIR PRINCÍPIOS ATIVOS
DO $$
DECLARE
    principio_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO principio_count FROM principios_ativos;
    
    IF principio_count = 0 THEN
        RAISE NOTICE 'Inserindo 8 princípios ativos...';
        
        INSERT INTO principios_ativos (nome, categoria, descricao, mecanismo_acao, beneficios_terapeuticos, dosagem_segura) VALUES

        ('Betaglucana', 'Fibras', 'Fibra solúvel encontrada na aveia', 'Forma gel no intestino, reduz absorção de colesterol', ARRAY['Controle colesterol', 'Controle glicêmico', 'Saúde digestiva'], '3-10g por dia'),

        ('Ômega-3', 'Ácidos Graxos', 'Ácidos graxos essenciais', 'Anti-inflamatório, melhora função cerebral', ARRAY['Saúde cardiovascular', 'Anti-inflamação', 'Função cerebral'], '1-3g por dia'),

        ('Curcumina', 'Polifenois', 'Princípio ativo da cúrcuma', 'Anti-inflamatório, antioxidante', ARRAY['Anti-inflamação', 'Proteção hepática', 'Saúde articular'], '500-2000mg por dia'),

        ('Gingerol', 'Fenólicos', 'Princípio ativo do gengibre', 'Anti-inflamatório, digestivo', ARRAY['Náuseas', 'Anti-inflamação', 'Digestão'], '1-3g por dia'),

        ('Alicina', 'Sulfurados', 'Princípio ativo do alho', 'Antimicrobiano, cardiovascular', ARRAY['Sistema imunológico', 'Saúde cardiovascular', 'Anti-inflamação'], '2-4 dentes por dia'),

        ('Licopeno', 'Carotenoides', 'Antioxidante do tomate', 'Antioxidante, proteção celular', ARRAY['Prevenção câncer', 'Saúde cardiovascular', 'Proteção solar'], '5-30mg por dia'),

        ('Sulforafano', 'Isotiocianatos', 'Princípio ativo do brócolis', 'Antioxidante, detoxificante', ARRAY['Prevenção câncer', 'Detoxificação', 'Anti-inflamação'], '10-50mg por dia'),

        ('Pectina', 'Fibras', 'Fibra solúvel da maçã', 'Forma gel, reduz absorção', ARRAY['Controle glicêmico', 'Saúde digestiva', 'Saciedade'], '5-15g por dia');

        RAISE NOTICE '✅ 8 princípios ativos inseridos com sucesso!';
    ELSE
        RAISE NOTICE '⚠️ Princípios ativos já existem (% registros encontrados)', principio_count;
    END IF;
END $$;

-- ========================================
-- MENSAGEM DE CONFIRMAÇÃO FINAL
-- ========================================

SELECT '✅ VERIFICAÇÃO E INSERÇÃO CONCLUÍDA!' as status;
SELECT '🍎 Alimentos medicinais verificados e inseridos' as alimentos;
SELECT '🏥 Doenças com abordagem nutricional verificadas' as doencas;
SELECT '🧪 Princípios ativos documentados verificados' as principios;
SELECT '🎯 PRÓXIMO PASSO: INTEGRAR COM IA SOFIA' as proximo_passo;





