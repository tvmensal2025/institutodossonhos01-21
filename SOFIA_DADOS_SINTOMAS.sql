-- ========================================
-- SOFIA - DADOS DE SINTOMAS E ALIMENTOS
-- "FAÇA DE SEU ALIMENTO SEU REMÉDIO"
-- RELAÇÃO ENTRE SINTOMAS E ALIMENTOS
-- ========================================

-- INSERIR DADOS DE SINTOMAS E ALIMENTOS RELACIONADOS
INSERT INTO sintomas_alimentos (sintoma, categoria_sintoma, descricao_sintoma, alimentos_beneficos, alimentos_evitar, mecanismo_acao, evidencia_cientifica, nivel_evidencia) VALUES

-- SINTOMAS DIGESTIVOS
('Náusea', 'Digestivo', 'Sensação de enjoo e vontade de vomitar', ARRAY['Gengibre', 'Hortelã', 'Camomila', 'Limão'], ARRAY['Alimentos gordurosos', 'Cafeína', 'Álcool'], 'Gengibre contém gingerol que inibe receptores de serotonina no trato gastrointestinal', 'Estudos clínicos', 4),

('Azia', 'Digestivo', 'Queimação no estômago e esôfago', ARRAY['Aloe vera', 'Banana', 'Aveia', 'Gengibre'], ARRAY['Cafeína', 'Álcool', 'Alimentos picantes', 'Frituras'], 'Aloe vera contém polissacarídeos que protegem a mucosa gástrica', 'Estudos clínicos', 4),

('Constipação', 'Digestivo', 'Dificuldade para evacuar', ARRAY['Fibras', 'Ameixa', 'Kiwi', 'Psyllium'], ARRAY['Alimentos processados', 'Laticínios', 'Carnes vermelhas'], 'Fibras aumentam o volume fecal e estimulam o peristaltismo', 'Meta-análise', 5),

('Diarréia', 'Digestivo', 'Evacuações líquidas e frequentes', ARRAY['Arroz branco', 'Banana', 'Maçã', 'Iogurte'], ARRAY['Fibras insolúveis', 'Laticínios', 'Alimentos gordurosos'], 'Arroz branco e banana contêm amido resistente que absorve água', 'Estudos clínicos', 4),

('Gases', 'Digestivo', 'Inchaço e flatulência', ARRAY['Hortelã', 'Gengibre', 'Camomila', 'Probióticos'], ARRAY['FODMAPs', 'Feijão', 'Repolho'], 'Hortelã contém mentol que relaxa a musculatura intestinal', 'Estudos clínicos', 4),

-- SINTOMAS RESPIRATÓRIOS
('Tosse', 'Respiratório', 'Tosse seca ou produtiva', ARRAY['Mel', 'Gengibre', 'Limão', 'Própolis'], ARRAY['Laticínios', 'Alimentos frios', 'Álcool'], 'Mel contém propriedades antimicrobianas e anti-inflamatórias', 'Estudos clínicos', 4),

('Congestão Nasal', 'Respiratório', 'Nariz entupido', ARRAY['Alho', 'Cebola', 'Gengibre', 'Pimenta'], ARRAY['Laticínios', 'Açúcares', 'Alimentos processados'], 'Alho contém alicina com propriedades antimicrobianas', 'Estudos clínicos', 4),

('Dor de Garganta', 'Respiratório', 'Dor ao engolir', ARRAY['Mel', 'Própolis', 'Gengibre', 'Limão'], ARRAY['Alimentos ácidos', 'Alimentos quentes', 'Álcool'], 'Mel forma uma barreira protetora na mucosa', 'Estudos clínicos', 4),

-- SINTOMAS NEUROLÓGICOS
('Dor de Cabeça', 'Neurológico', 'Cefaleia de diferentes tipos', ARRAY['Gengibre', 'Café', 'Magnésio', 'Ômega 3'], ARRAY['Álcool', 'Nitratos', 'Glutamato'], 'Gengibre inibe prostaglandinas que causam inflamação', 'Estudos clínicos', 4),

('Enxaqueca', 'Neurológico', 'Dor de cabeça intensa e pulsátil', ARRAY['Gengibre', 'Magnésio', 'Riboflavina', 'Coenzima Q10'], ARRAY['Chocolate', 'Queijo', 'Vinho tinto', 'Nitratos'], 'Magnésio relaxa vasos sanguíneos e músculos', 'Meta-análise', 5),

('Insônia', 'Neurológico', 'Dificuldade para dormir', ARRAY['Camomila', 'Valeriana', 'Passiflora', 'Magnésio'], ARRAY['Cafeína', 'Álcool', 'Alimentos pesados'], 'Camomila contém apigenina que se liga a receptores GABA', 'Estudos clínicos', 4),

('Ansiedade', 'Neurológico', 'Preocupação excessiva e nervosismo', ARRAY['Ashwagandha', 'Magnésio', 'Ômega 3', 'Probióticos'], ARRAY['Cafeína', 'Açúcares', 'Álcool'], 'Ashwagandha modula cortisol e GABA', 'Estudos clínicos', 4),

('Depressão', 'Neurológico', 'Tristeza persistente e falta de energia', ARRAY['Ômega 3', 'Vitamina D', 'Probióticos', 'Triptofano'], ARRAY['Açúcares', 'Alimentos processados', 'Álcool'], 'Ômega 3 modula neurotransmissores e reduz inflamação', 'Meta-análise', 5),

-- SINTOMAS CARDIOVASCULARES
('Pressão Alta', 'Cardiovascular', 'Hipertensão arterial', ARRAY['Alho', 'Hawthorn', 'Ômega 3', 'Potássio'], ARRAY['Sal', 'Álcool', 'Cafeína'], 'Alho contém alicina que relaxa vasos sanguíneos', 'Estudos clínicos', 4),

('Colesterol Alto', 'Cardiovascular', 'Elevação do LDL', ARRAY['Ômega 3', 'Fibras', 'Fitoesteróis', 'Aveia'], ARRAY['Gorduras saturadas', 'Gorduras trans', 'Álcool'], 'Ômega 3 reduz triglicerídeos e aumenta HDL', 'Meta-análise', 5),

('Palpitações', 'Cardiovascular', 'Batimentos cardíacos irregulares', ARRAY['Magnésio', 'Potássio', 'Hawthorn', 'Ômega 3'], ARRAY['Cafeína', 'Álcool', 'Alimentos gordurosos'], 'Magnésio estabiliza ritmo cardíaco', 'Estudos clínicos', 4),

-- SINTOMAS MUSCULARES
('Cãibras', 'Muscular', 'Contração muscular involuntária', ARRAY['Magnésio', 'Potássio', 'Cálcio', 'Ômega 3'], ARRAY['Álcool', 'Cafeína', 'Alimentos processados'], 'Magnésio relaxa músculos e previne cãibras', 'Estudos clínicos', 4),

('Dores Musculares', 'Muscular', 'Dor e tensão muscular', ARRAY['Gengibre', 'Cúrcuma', 'Ômega 3', 'Magnésio'], ARRAY['Alimentos inflamatórios', 'Álcool'], 'Cúrcuma contém curcumina que reduz inflamação', 'Estudos clínicos', 4),

('Fadiga', 'Muscular', 'Cansaço excessivo', ARRAY['Vitamina B12', 'Ferro', 'Vitamina D', 'Ômega 3'], ARRAY['Açúcares', 'Cafeína', 'Álcool'], 'Vitamina B12 é essencial para produção de energia', 'Estudos clínicos', 4),

-- SINTOMAS IMUNOLÓGICOS
('Febre', 'Imunológico', 'Elevação da temperatura corporal', ARRAY['Gengibre', 'Alho', 'Própolis', 'Vitamina C'], ARRAY['Alimentos pesados', 'Álcool'], 'Gengibre tem propriedades antipiréticas', 'Estudos clínicos', 4),

('Resfriado', 'Imunológico', 'Infecção viral das vias aéreas', ARRAY['Vitamina C', 'Zinco', 'Própolis', 'Alho'], ARRAY['Açúcares', 'Laticínios', 'Alimentos processados'], 'Vitamina C fortalece sistema imunológico', 'Meta-análise', 5),

('Alergias', 'Imunológico', 'Reação alérgica a alérgenos', ARRAY['Ômega 3', 'Probióticos', 'Quercetina', 'Vitamina D'], ARRAY['Alimentos alergênicos', 'Glúten', 'Laticínios'], 'Ômega 3 modula resposta imunológica', 'Estudos clínicos', 4),

-- SINTOMAS METABÓLICOS
('Fome Excessiva', 'Metabólico', 'Apetite aumentado', ARRAY['Fibras', 'Proteínas', 'Gorduras boas', 'Chá verde'], ARRAY['Açúcares', 'Carboidratos refinados'], 'Fibras aumentam saciedade e reduzem fome', 'Estudos clínicos', 4),

('Sede Excessiva', 'Metabólico', 'Aumento da sede', ARRAY['Água', 'Chás', 'Sucos naturais'], ARRAY['Bebidas açucaradas', 'Álcool', 'Cafeína'], 'Hidratação adequada regula sede', 'Estudos clínicos', 4),

('Suor Excessivo', 'Metabólico', 'Hiperidrose', ARRAY['Sálvia', 'Chá verde', 'Magnésio'], ARRAY['Cafeína', 'Álcool', 'Alimentos picantes'], 'Sálvia contém ácido rosmarínico que reduz sudorese', 'Estudos clínicos', 4),

-- SINTOMAS HORMONAIS
('TPM', 'Hormonal', 'Síndrome pré-menstrual', ARRAY['Magnésio', 'Ômega 3', 'Vitamina B6', 'Cálcio'], ARRAY['Sal', 'Cafeína', 'Álcool'], 'Magnésio reduz cólicas e irritabilidade', 'Estudos clínicos', 4),

('Menopausa', 'Hormonal', 'Sintomas da menopausa', ARRAY['Isoflavonas', 'Cálcio', 'Vitamina D', 'Ômega 3'], ARRAY['Cafeína', 'Álcool', 'Alimentos picantes'], 'Isoflavonas simulam estrogênio', 'Estudos clínicos', 4),

('Andropausa', 'Hormonal', 'Sintomas da andropausa', ARRAY['Zinco', 'Vitamina D', 'Ômega 3', 'Magnésio'], ARRAY['Álcool', 'Alimentos processados'], 'Zinco é essencial para produção de testosterona', 'Estudos clínicos', 4),

-- SINTOMAS CUTÂNEOS
('Acne', 'Cutâneo', 'Espinhas e cravos', ARRAY['Zinco', 'Vitamina A', 'Ômega 3', 'Probióticos'], ARRAY['Laticínios', 'Açúcares', 'Alimentos processados'], 'Zinco reduz inflamação e produção de sebo', 'Estudos clínicos', 4),

('Eczema', 'Cutâneo', 'Inflamação da pele', ARRAY['Ômega 3', 'Probióticos', 'Vitamina D', 'Zinco'], ARRAY['Glúten', 'Laticínios', 'Ovos'], 'Ômega 3 reduz inflamação cutânea', 'Estudos clínicos', 4),

('Psoríase', 'Cutâneo', 'Doença inflamatória da pele', ARRAY['Ômega 3', 'Vitamina D', 'Probióticos', 'Cúrcuma'], ARRAY['Glúten', 'Laticínios', 'Álcool'], 'Ômega 3 modula resposta imunológica', 'Estudos clínicos', 4),

-- SINTOMAS OCULARES
('Olhos Secos', 'Ocular', 'Síndrome do olho seco', ARRAY['Ômega 3', 'Vitamina A', 'Zinco', 'Luteína'], ARRAY['Cafeína', 'Álcool'], 'Ômega 3 melhora produção de lágrimas', 'Estudos clínicos', 4),

('Vista Cansada', 'Ocular', 'Fadiga visual', ARRAY['Luteína', 'Zeaxantina', 'Vitamina A', 'Ômega 3'], ARRAY['Cafeína', 'Álcool'], 'Luteína protege retina de danos oxidativos', 'Estudos clínicos', 4),

('Conjuntivite', 'Ocular', 'Inflamação da conjuntiva', ARRAY['Própolis', 'Vitamina C', 'Zinco', 'Ômega 3'], ARRAY['Alimentos alergênicos'], 'Própolis tem propriedades antimicrobianas', 'Estudos clínicos', 4); 