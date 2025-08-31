-- ========================================
-- SOFIA - ALIMENTOS MEDICINAIS
-- "FAÇA DE SEU ALIMENTO SEU REMÉDIO"
-- DADOS COMPLETOS DE ALIMENTOS TERAPÊUTICOS
-- ========================================

-- INSERIR ALIMENTOS COM PROPRIEDADES MEDICINAIS
INSERT INTO alimentos_completos (nome, nome_cientifico, nome_ingles, categoria, subcategoria, propriedades_medicinais, principios_ativos, indicacoes_terapeuticas, contraindicacoes, interacoes_medicamentosas, dosagem_terapeutica, forma_preparo_medicinal) VALUES

-- ANTI-INFLAMATÓRIOS
('Cúrcuma', 'Curcuma longa', 'Turmeric', 'condimento', 'especiaria', 'Anti-inflamatório, antioxidante, hepatoprotetor', ARRAY['Curcumina', 'Turmerona', 'Zingibereno'], ARRAY['Artrite', 'Inflamação', 'Proteção hepática', 'Câncer'], ARRAY['Gravidez', 'Pedras na vesícula'], ARRAY['Anticoagulantes', 'Antiácidos'], '500-2000mg/dia', 'Misturar com pimenta preta para absorção'),

('Gengibre', 'Zingiber officinale', 'Ginger', 'condimento', 'raiz', 'Anti-náusea, anti-inflamatório, digestivo', ARRAY['Gingerol', 'Shogaol', 'Zingibereno'], ARRAY['Náusea', 'Enjoo', 'Digestão', 'Artrite'], ARRAY['Gravidez avançada', 'Sangramento'], ARRAY['Anticoagulantes', 'Medicamentos para diabetes'], '1-4g/dia', 'Chá ou suco fresco'),

('Alho', 'Allium sativum', 'Garlic', 'condimento', 'bulbo', 'Antibacteriano, antiviral, cardioprotetor', ARRAY['Alicina', 'Ajoeno', 'Sulfetos'], ARRAY['Hipertensão', 'Colesterol alto', 'Infecções'], ARRAY['Gravidez', 'Úlcera'], ARRAY['Anticoagulantes', 'Medicamentos para HIV'], '2-4 dentes/dia', 'Cru ou cozido'),

-- IMUNOMODULADORES
('Própolis', 'Propolis', 'Propolis', 'suplemento', 'apicultura', 'Antibacteriano, antiviral, imunomodulador', ARRAY['Flavonoides', 'Ácidos fenólicos', 'Terpenos'], ARRAY['Infecções', 'Imunidade', 'Feridas'], ARRAY['Alergia a abelhas'], ARRAY['Anticoagulantes'], '500-1000mg/dia', 'Extrato ou mel'),

('Cogumelo Reishi', 'Ganoderma lucidum', 'Reishi mushroom', 'suplemento', 'fungo', 'Imunomodulador, adaptógeno, antitumoral', ARRAY['Beta-glucanos', 'Triterpenos', 'Polissacarídeos'], ARRAY['Imunidade', 'Stress', 'Câncer'], ARRAY['Gravidez', 'Doenças autoimunes'], ARRAY['Imunossupressores'], '1-3g/dia', 'Chá ou cápsula'),

-- HEPATOPROTETORES
('Cardo Mariano', 'Silybum marianum', 'Milk thistle', 'suplemento', 'planta', 'Hepatoprotetor, antioxidante, regenerador hepático', ARRAY['Silimarina', 'Silibina', 'Flavonoides'], ARRAY['Proteção hepática', 'Cirrose', 'Hepatite'], ARRAY['Gravidez', 'Alergia'], ARRAY['Medicamentos metabolizados pelo fígado'], '200-600mg/dia', 'Extrato padronizado'),

-- CARDIOVASCULARES
('Hawthorn', 'Crataegus monogyna', 'Hawthorn', 'suplemento', 'planta', 'Cardioprotetor, vasodilatador, antiarrítmico', ARRAY['Proantocianidinas', 'Flavonoides', 'Oligômeros'], ARRAY['Insuficiência cardíaca', 'Hipertensão', 'Arritmia'], ARRAY['Gravidez', 'Bradicardia'], ARRAY['Digoxina', 'Beta-bloqueadores'], '300-600mg/dia', 'Extrato padronizado'),

-- DIGESTIVOS
('Hortelã', 'Mentha piperita', 'Peppermint', 'condimento', 'erva', 'Digestivo, antiespasmódico, carminativo', ARRAY['Mentol', 'Mentona', 'Óleos essenciais'], ARRAY['Síndrome do intestino irritável', 'Náusea', 'Digestão'], ARRAY['Refluxo', 'Gravidez'], ARRAY['Medicamentos para azia'], '1-3 cápsulas/dia', 'Chá ou óleo essencial'),

-- ADAPTOGÊNICOS
('Ashwagandha', 'Withania somnifera', 'Ashwagandha', 'suplemento', 'planta', 'Adaptógeno, anti-stress, imunomodulador', ARRAY['Withanolides', 'Alcaloides', 'Saponinas'], ARRAY['Stress', 'Ansiedade', 'Imunidade'], ARRAY['Gravidez', 'Tireoide'], ARRAY['Imunossupressores', 'Sedativos'], '300-600mg/dia', 'Extrato padronizado'),

-- ANTIOXIDANTES
('Açaí', 'Euterpe oleracea', 'Acai berry', 'fruta', 'tropical', 'Antioxidante, anti-inflamatório, energético', ARRAY['Antocianinas', 'Polifenois', 'Ácidos graxos'], ARRAY['Envelhecimento', 'Inflamação', 'Energia'], ARRAY['Alergia'], ARRAY['Anticoagulantes'], '100-200g/dia', 'Polpa ou suco'),

('Mirtilo', 'Vaccinium myrtillus', 'Blueberry', 'fruta', 'temperada', 'Antioxidante, neuroprotetor, antidiabético', ARRAY['Antocianinas', 'Resveratrol', 'Vitamina C'], ARRAY['Memória', 'Diabetes', 'Visão'], ARRAY['Alergia'], ARRAY['Anticoagulantes'], '50-100g/dia', 'Fresco ou congelado'),

-- PROTEÍNAS FUNCIONAIS
('Whey Protein', 'Proteína do soro', 'Whey protein', 'suplemento', 'proteina', 'Anabólico, imunomodulador, antioxidante', ARRAY['BCAAs', 'Glutamina', 'Lactoferrina'], ARRAY['Hipertrofia', 'Recuperação', 'Imunidade'], ARRAY['Intolerância à lactose'], ARRAY['Medicamentos para diabetes'], '20-30g/dose', 'Shake pós-treino'),

-- PROBIÓTICOS
('Kefir', 'Kefir', 'Kefir', 'laticinio', 'fermentado', 'Probiótico, imunomodulador, digestivo', ARRAY['Lactobacilos', 'Bifidobactérias', 'Enzimas'], ARRAY['Microbioma', 'Digestão', 'Imunidade'], ARRAY['Intolerância à lactose'], ARRAY['Antibióticos'], '200-500ml/dia', 'Fresco ou fermentado'),

-- ÔMEGA 3
('Óleo de Peixe', 'Óleo de peixe', 'Fish oil', 'suplemento', 'gordura', 'Anti-inflamatório, cardioprotetor, neuroprotetor', ARRAY['EPA', 'DHA', 'Vitamina D'], ARRAY['Inflamação', 'Coração', 'Cérebro'], ARRAY['Alergia a peixes'], ARRAY['Anticoagulantes'], '1000-3000mg/dia', 'Cápsula com refeição'),

-- VITAMINAS
('Vitamina D3', 'Colecalciferol', 'Vitamin D3', 'suplemento', 'vitamina', 'Imunomodulador, osteoprotetor, cardioprotetor', ARRAY['Vitamina D3', 'Colecalciferol'], ARRAY['Imunidade', 'Ossos', 'Coração'], ARRAY['Hipercalcemia'], ARRAY['Corticoides'], '1000-4000 UI/dia', 'Cápsula com gordura'),

-- MINERAIS
('Magnésio', 'Magnésio', 'Magnesium', 'suplemento', 'mineral', 'Relaxante muscular, cardioprotetor, antistress', ARRAY['Magnésio', 'Citrato'], ARRAY['Cãibras', 'Stress', 'Coração'], ARRAY['Insuficiência renal'], ARRAY['Antibióticos'], '200-400mg/dia', 'Citrato ou quelato'),

-- FIBRAS FUNCIONAIS
('Psyllium', 'Plantago ovata', 'Psyllium', 'suplemento', 'fibra', 'Laxante, prebiótico, cardioprotetor', ARRAY['Fibras solúveis', 'Mucilagem'], ARRAY['Constipação', 'Colesterol', 'Diabetes'], ARRAY['Obstrução intestinal'], ARRAY['Medicamentos'], '5-10g/dia', 'Misturado em água'),

-- ENZIMAS
('Bromelina', 'Ananas comosus', 'Bromelain', 'suplemento', 'enzima', 'Anti-inflamatório, digestivo, cicatrizante', ARRAY['Bromelina', 'Proteases'], ARRAY['Inflamação', 'Digestão', 'Feridas'], ARRAY['Úlcera', 'Alergia'], ARRAY['Anticoagulantes'], '500-1000mg/dia', 'Cápsula entre refeições'),

-- ADAPTOGÊNICOS BRASILEIROS
('Jatobá', 'Hymenaea courbaril', 'Jatoba', 'suplemento', 'planta', 'Energético, tônico, digestivo', ARRAY['Taninos', 'Flavonoides', 'Óleos essenciais'], ARRAY['Energia', 'Digestão', 'Tônico'], ARRAY['Gravidez'], ARRAY['Medicamentos'], '1-3g/dia', 'Chá ou extrato'),

('Guaraná', 'Paullinia cupana', 'Guarana', 'suplemento', 'planta', 'Estimulante, termogênico, cognitivo', ARRAY['Cafeína', 'Teobromina', 'Taninos'], ARRAY['Energia', 'Foco', 'Termogênese'], ARRAY['Hipertensão', 'Insônia'], ARRAY['Estimulantes'], '200-400mg/dia', 'Pó ou cápsula'),

-- PLANTAS MEDICINAIS BRASILEIRAS
('Boldo', 'Peumus boldus', 'Boldo', 'suplemento', 'planta', 'Hepatoprotetor, digestivo, colerético', ARRAY['Boldina', 'Flavonoides', 'Óleos essenciais'], ARRAY['Digestão', 'Proteção hepática', 'Colesterol'], ARRAY['Gravidez', 'Obstrução biliar'], ARRAY['Medicamentos hepáticos'], '1-3g/dia', 'Chá ou extrato'),

('Espinheira Santa', 'Maytenus ilicifolia', 'Espinheira Santa', 'suplemento', 'planta', 'Gastoprotetor, anti-ulceroso, digestivo', ARRAY['Taninos', 'Flavonoides', 'Triterpenos'], ARRAY['Úlcera', 'Gastrite', 'Digestão'], ARRAY['Gravidez'], ARRAY['Antiácidos'], '1-3g/dia', 'Chá ou extrato'),

('Unha de Gato', 'Uncaria tomentosa', 'Cat''s claw', 'suplemento', 'planta', 'Imunomodulador, anti-inflamatório, antioxidante', ARRAY['Alcaloides oxindólicos', 'Glicosídeos', 'Taninos'], ARRAY['Imunidade', 'Inflamação', 'Artrite'], ARRAY['Gravidez', 'Doenças autoimunes'], ARRAY['Imunossupressores'], '250-500mg/dia', 'Extrato padronizado'),

-- FRUTAS MEDICINAIS
('Graviola', 'Annona muricata', 'Soursop', 'fruta', 'tropical', 'Anticancerígeno, antimicrobiano, antioxidante', ARRAY['Acetogeninas', 'Alcaloides', 'Flavonoides'], ARRAY['Câncer', 'Infecções', 'Stress'], ARRAY['Gravidez', 'Parkinson'], ARRAY['Medicamentos para pressão'], '100-200g/dia', 'Polpa ou suco'),

('Nonni', 'Morinda citrifolia', 'Noni', 'fruta', 'tropical', 'Imunomodulador, antioxidante, anti-inflamatório', ARRAY['Iridoides', 'Antraquinonas', 'Vitamina C'], ARRAY['Imunidade', 'Inflamação', 'Energia'], ARRAY['Gravidez', 'Doenças renais'], ARRAY['Medicamentos para pressão'], '30-60ml/dia', 'Suco ou cápsula'),

-- SEMENTES MEDICINAIS
('Chia', 'Salvia hispanica', 'Chia seeds', 'semente', 'oleaginosa', 'Ômega 3, fibras, antioxidante', ARRAY['Ômega 3', 'Fibras', 'Antioxidantes'], ARRAY['Coração', 'Digestão', 'Energia'], ARRAY['Alergia'], ARRAY['Anticoagulantes'], '15-30g/dia', 'Hidratada ou moída'),

('Linhaça', 'Linum usitatissimum', 'Flaxseed', 'semente', 'oleaginosa', 'Ômega 3, lignanas, fibras', ARRAY['Ômega 3', 'Lignanas', 'Fibras'], ARRAY['Coração', 'Hormônios', 'Digestão'], ARRAY['Obstrução intestinal'], ARRAY['Anticoagulantes'], '15-30g/dia', 'Moída ou germinada'),

-- ERVAS MEDICINAIS
('Camomila', 'Matricaria chamomilla', 'Chamomile', 'erva', 'floral', 'Calmante, digestivo, anti-inflamatório', ARRAY['Bisabolol', 'Camazuleno', 'Flavonoides'], ARRAY['Ansiedade', 'Insônia', 'Digestão'], ARRAY['Alergia'], ARRAY['Sedativos'], '1-3 xícaras/dia', 'Chá ou extrato'),

('Valeriana', 'Valeriana officinalis', 'Valerian', 'erva', 'raiz', 'Sedativo, ansiolítico, relaxante', ARRAY['Valepotriatos', 'Ácido valerênico', 'Óleos essenciais'], ARRAY['Insônia', 'Ansiedade', 'Stress'], ARRAY['Gravidez', 'Depressão'], ARRAY['Sedativos', 'Antidepressivos'], '300-600mg/dia', 'Extrato padronizado'),

-- COGUMELOS MEDICINAIS
('Shiitake', 'Lentinula edodes', 'Shiitake mushroom', 'cogumelo', 'medicinal', 'Imunomodulador, antiviral, cardioprotetor', ARRAY['Lentinan', 'Beta-glucanos', 'Ergosterol'], ARRAY['Imunidade', 'Coração', 'Câncer'], ARRAY['Alergia'], ARRAY['Imunossupressores'], '50-100g/dia', 'Fresco ou seco'),

('Maitake', 'Grifola frondosa', 'Maitake mushroom', 'cogumelo', 'medicinal', 'Imunomodulador, antidiabético, antitumoral', ARRAY['Beta-glucanos', 'Polissacarídeos', 'Vitamina D'], ARRAY['Imunidade', 'Diabetes', 'Câncer'], ARRAY['Alergia'], ARRAY['Imunossupressores'], '50-100g/dia', 'Fresco ou seco'),

-- ÓLEOS ESSENCIAIS MEDICINAIS
('Óleo de Coco', 'Cocos nucifera', 'Coconut oil', 'oleo', 'vegetal', 'Antimicrobiano, energético, cardioprotetor', ARRAY['Ácido láurico', 'MCTs', 'Vitamina E'], ARRAY['Energia', 'Imunidade', 'Coração'], ARRAY['Alergia'], ARRAY['Medicamentos para colesterol'], '15-30ml/dia', 'Cozinhar ou suplemento'),

('Óleo de Oliva', 'Olea europaea', 'Olive oil', 'oleo', 'vegetal', 'Cardioprotetor, antioxidante, anti-inflamatório', ARRAY['Ácido oleico', 'Polifenois', 'Vitamina E'], ARRAY['Coração', 'Inflamação', 'Envelhecimento'], ARRAY['Alergia'], ARRAY['Anticoagulantes'], '15-30ml/dia', 'Temperatura ambiente'),

-- MEL MEDICINAL
('Mel de Manuka', 'Mel de Manuka', 'Manuka honey', 'mel', 'medicinal', 'Antibacteriano, cicatrizante, imunomodulador', ARRAY['Metilglioxal', 'Peróxido de hidrogênio', 'Flavonoides'], ARRAY['Feridas', 'Infecções', 'Imunidade'], ARRAY['Diabetes', 'Alergia'], ARRAY['Medicamentos para diabetes'], '10-20g/dia', 'Puro ou diluído'),

('Própolis Verde', 'Própolis Verde', 'Green propolis', 'propolis', 'medicinal', 'Antibacteriano, antiviral, imunomodulador', ARRAY['Artepilina C', 'Flavonoides', 'Ácidos fenólicos'], ARRAY['Infecções', 'Imunidade', 'Câncer'], ARRAY['Alergia a abelhas'], ARRAY['Anticoagulantes'], '500-1000mg/dia', 'Extrato ou mel'); 