-- ========================================
-- SOFIA - DADOS FALTANTES PARA IMPLEMENTAÇÃO COMPLETA
-- "FAÇA DE SEU ALIMENTO SEU REMÉDIO"
-- IMPLANTAR DADOS NAS TABELAS VAZIAS
-- ========================================

-- 1. ALIMENTOS FUNCIONAIS
INSERT INTO alimentos_funcionais (alimento, categoria_funcional, principio_ativo, beneficio_funcional, dosagem_recomendada, forma_consumo, contraindicacoes, evidencia_cientifica, nivel_evidencia) VALUES
('Cúrcuma', 'Anti-inflamatório', 'Curcumina', 'Reduz inflamação e dor articular', '500-1000mg/dia', 'Cápsulas ou pó', ARRAY['Gravidez', 'Doenças hepáticas'], 'Meta-análise', 5),
('Gengibre', 'Digestivo', 'Gingerol', 'Alivia náusea e indigestão', '1-3g/dia', 'Chá ou pó', ARRAY['Gravidez', 'Doenças cardíacas'], 'Estudos clínicos', 4),
('Alho', 'Cardiovascular', 'Alicina', 'Reduz pressão arterial e colesterol', '2-4 dentes/dia', 'Cru ou cozido', ARRAY['Cirurgia', 'Anticoagulantes'], 'Meta-análise', 5),
('Chá Verde', 'Antioxidante', 'EGCG', 'Acelera metabolismo e queima gordura', '3-5 xícaras/dia', 'Infusão', ARRAY['Insônia', 'Hipertensão'], 'Estudos clínicos', 4),
('Ômega 3', 'Cardiovascular', 'EPA/DHA', 'Reduz inflamação e melhora cognição', '1000-2000mg/dia', 'Cápsulas', ARRAY['Anticoagulantes'], 'Meta-análise', 5),
('Probióticos', 'Digestivo', 'Bactérias benéficas', 'Melhora saúde intestinal', '10-50 bilhões UFC/dia', 'Cápsulas ou alimentos', ARRAY['Imunossupressão'], 'Estudos clínicos', 4),
('Magnésio', 'Neuromuscular', 'Magnésio', 'Relaxa músculos e melhora sono', '200-400mg/dia', 'Cápsulas', ARRAY['Insuficiência renal'], 'Estudos clínicos', 4),
('Vitamina D', 'Imunológico', 'Vitamina D3', 'Fortalece ossos e imunidade', '1000-4000 UI/dia', 'Cápsulas', ARRAY['Hipercalcemia'], 'Meta-análise', 5),
('Zinco', 'Imunológico', 'Zinco', 'Fortalece sistema imunológico', '15-30mg/dia', 'Cápsulas', ARRAY['Excesso de cobre'], 'Estudos clínicos', 4),
('Ashwagandha', 'Adaptógeno', 'Withanolides', 'Reduz stress e ansiedade', '300-600mg/dia', 'Cápsulas', ARRAY['Gravidez', 'Doenças autoimunes'], 'Estudos clínicos', 4);

-- 2. SUPERALIMENTOS
INSERT INTO superalimentos (alimento, categoria_superalimento, nutrientes_principais, beneficios_unicos, dosagem_recomendada, forma_consumo, contraindicacoes, evidencia_cientifica, nivel_evidencia) VALUES
('Spirulina', 'Proteína completa', ARRAY['Proteína', 'Vitamina B12', 'Ferro'], ARRAY['Detox natural', 'Energia sustentada', 'Imunidade'], '1-3g/dia', 'Pó ou cápsulas', ARRAY['Doenças autoimunes'], 'Estudos clínicos', 4),
('Chlorella', 'Detox', ARRAY['Clorofila', 'Proteína', 'Vitamina B12'], ARRAY['Detox de metais pesados', 'Alcalinização', 'Energia'], '2-5g/dia', 'Pó ou cápsulas', ARRAY['Sensibilidade'], 'Estudos clínicos', 4),
('Maca', 'Hormonal', ARRAY['Proteína', 'Vitaminas B', 'Minerais'], ARRAY['Equilíbrio hormonal', 'Energia', 'Libido'], '1-3g/dia', 'Pó ou cápsulas', ARRAY['Hipertensão'], 'Estudos clínicos', 4),
('Goji Berry', 'Antioxidante', ARRAY['Vitamina C', 'Carotenoides', 'Polissacarídeos'], ARRAY['Imunidade', 'Visão', 'Energia'], '10-30g/dia', 'Secas ou pó', ARRAY['Anticoagulantes'], 'Estudos clínicos', 4),
('Açaí', 'Antioxidante', ARRAY['Antocianinas', 'Ômega 3', 'Fibras'], ARRAY['Antioxidante potente', 'Energia', 'Saúde cardiovascular'], '100-200g/dia', 'Polpa ou pó', ARRAY['Alergias'], 'Estudos clínicos', 4),
('Cacau', 'Cardiovascular', ARRAY['Flavonoides', 'Magnésio', 'Ferro'], ARRAY['Saúde cardiovascular', 'Humor', 'Antioxidante'], '20-50g/dia', 'Pó ou nibs', ARRAY['Cafeína'], 'Estudos clínicos', 4),
('Quinoa', 'Proteína completa', ARRAY['Proteína', 'Fibras', 'Minerais'], ARRAY['Proteína completa', 'Sem glúten', 'Baixo IG'], '50-100g/dia', 'Grãos cozidos', ARRAY['Sensibilidade'], 'Estudos clínicos', 4),
('Chia', 'Ômega 3', ARRAY['Ômega 3', 'Fibras', 'Proteína'], ARRAY['Ômega 3 vegetal', 'Saciedade', 'Energia sustentada'], '15-30g/dia', 'Sementes ou pó', ARRAY['Diverticulite'], 'Estudos clínicos', 4),
('Linhaça', 'Ômega 3', ARRAY['Ômega 3', 'Lignanas', 'Fibras'], ARRAY['Hormônios femininos', 'Saúde cardiovascular', 'Digestão'], '15-30g/dia', 'Sementes ou pó', ARRAY['Diverticulite'], 'Estudos clínicos', 4),
('Hemp', 'Proteína', ARRAY['Proteína', 'Ômega 3', 'Magnésio'], ARRAY['Proteína completa', 'Relaxamento', 'Recuperação'], '20-40g/dia', 'Sementes ou pó', ARRAY['Sensibilidade'], 'Estudos clínicos', 4);

-- 3. ALIMENTOS FERMENTADOS
INSERT INTO alimentos_fermentados (alimento, tipo_fermentacao, bacterias_envolvidas, beneficios_fermentacao, forma_consumo, contraindicacoes, evidencia_cientifica, nivel_evidencia) VALUES
('Kefir', 'Láctea', ARRAY['Lactobacillus', 'Bifidobacterium'], ARRAY['Probióticos', 'Digestão', 'Imunidade'], '100-200ml/dia', ARRAY['Intolerância à lactose'], 'Estudos clínicos', 4),
('Iogurte', 'Láctea', ARRAY['Lactobacillus', 'Streptococcus'], ARRAY['Probióticos', 'Cálcio', 'Proteína'], '100-200g/dia', ARRAY['Intolerância à lactose'], 'Estudos clínicos', 4),
('Kombucha', 'Chá', ARRAY['Saccharomyces', 'Acetobacter'], ARRAY['Detox', 'Energia', 'Digestão'], '100-200ml/dia', ARRAY['Gravidez', 'Álcool'], 'Estudos clínicos', 4),
('Chucrute', 'Vegetal', ARRAY['Lactobacillus'], ARRAY['Probióticos', 'Vitamina C', 'Digestão'], '50-100g/dia', ARRAY['Sensibilidade'], 'Estudos clínicos', 4),
('Kimchi', 'Vegetal', ARRAY['Lactobacillus'], ARRAY['Probióticos', 'Antioxidantes', 'Digestão'], '50-100g/dia', ARRAY['Sensibilidade'], 'Estudos clínicos', 4),
('Miso', 'Soja', ARRAY['Aspergillus'], ARRAY['Probióticos', 'Proteína', 'Digestão'], '10-20g/dia', ARRAY['Sensibilidade à soja'], 'Estudos clínicos', 4),
('Tempeh', 'Soja', ARRAY['Rhizopus'], ARRAY['Proteína', 'Probióticos', 'Digestão'], '50-100g/dia', ARRAY['Sensibilidade à soja'], 'Estudos clínicos', 4),
('Natto', 'Soja', ARRAY['Bacillus subtilis'], ARRAY['Vitamina K2', 'Proteína', 'Digestão'], '30-50g/dia', ARRAY['Sensibilidade à soja'], 'Estudos clínicos', 4),
('Vinagre de Maçã', 'Frutas', ARRAY['Acetobacter'], ARRAY['Controle glicêmico', 'Digestão', 'Detox'], '15-30ml/dia', ARRAY['Gastrite'], 'Estudos clínicos', 4),
('Pepino em Conserva', 'Vegetal', ARRAY['Lactobacillus'], ARRAY['Probióticos', 'Hidratação', 'Digestão'], '50-100g/dia', ARRAY['Sensibilidade'], 'Estudos clínicos', 4);

-- 4. ALIMENTOS ORGÂNICOS
INSERT INTO alimentos_organicos (alimento, certificacao_organica, beneficios_organicos, diferencas_nutricionais, impacto_ambiental, custo_beneficio, evidencia_cientifica, nivel_evidencia) VALUES
('Frutas Orgânicas', 'USDA Organic', ARRAY['Sem pesticidas', 'Mais antioxidantes', 'Melhor sabor'], ARRAY['Mais vitamina C', 'Mais polifenois', 'Menos resíduos'], 'Reduz poluição', 'Custo-benefício alto', 'Estudos clínicos', 4),
('Vegetais Orgânicos', 'USDA Organic', ARRAY['Sem pesticidas', 'Mais minerais', 'Melhor sabor'], ARRAY['Mais ferro', 'Mais magnésio', 'Menos nitratos'], 'Protege solo', 'Custo-benefício alto', 'Estudos clínicos', 4),
('Grãos Orgânicos', 'USDA Organic', ARRAY['Sem pesticidas', 'Mais fibras', 'Melhor digestão'], ARRAY['Mais proteína', 'Mais minerais', 'Menos resíduos'], 'Protege biodiversidade', 'Custo-benefício médio', 'Estudos clínicos', 4),
('Carnes Orgânicas', 'USDA Organic', ARRAY['Sem hormônios', 'Sem antibióticos', 'Melhor perfil lipídico'], ARRAY['Mais ômega 3', 'Menos gordura saturada', 'Mais proteína'], 'Reduz poluição', 'Custo-benefício alto', 'Estudos clínicos', 4),
('Laticínios Orgânicos', 'USDA Organic', ARRAY['Sem hormônios', 'Sem antibióticos', 'Melhor perfil lipídico'], ARRAY['Mais ômega 3', 'Mais vitamina E', 'Menos resíduos'], 'Protege animais', 'Custo-benefício alto', 'Estudos clínicos', 4),
('Ovos Orgânicos', 'USDA Organic', ARRAY['Sem hormônios', 'Sem antibióticos', 'Melhor perfil lipídico'], ARRAY['Mais ômega 3', 'Mais vitamina E', 'Menos colesterol'], 'Protege galinhas', 'Custo-benefício alto', 'Estudos clínicos', 4),
('Mel Orgânico', 'USDA Organic', ARRAY['Sem pesticidas', 'Mais antioxidantes', 'Melhor sabor'], ARRAY['Mais antioxidantes', 'Mais minerais', 'Menos resíduos'], 'Protege abelhas', 'Custo-benefício alto', 'Estudos clínicos', 4),
('Chá Orgânico', 'USDA Organic', ARRAY['Sem pesticidas', 'Mais antioxidantes', 'Melhor sabor'], ARRAY['Mais polifenois', 'Mais minerais', 'Menos resíduos'], 'Protege solo', 'Custo-benefício médio', 'Estudos clínicos', 4),
('Café Orgânico', 'USDA Organic', ARRAY['Sem pesticidas', 'Mais antioxidantes', 'Melhor sabor'], ARRAY['Mais polifenois', 'Mais minerais', 'Menos resíduos'], 'Protege biodiversidade', 'Custo-benefício médio', 'Estudos clínicos', 4),
('Chocolate Orgânico', 'USDA Organic', ARRAY['Sem pesticidas', 'Mais antioxidantes', 'Melhor sabor'], ARRAY['Mais flavonoides', 'Mais minerais', 'Menos resíduos'], 'Protege biodiversidade', 'Custo-benefício médio', 'Estudos clínicos', 4);

-- 5. ALIMENTOS LOCAIS
INSERT INTO alimentos_locais (alimento, regiao_origem, epoca_colheita, beneficios_locais, impacto_sustentabilidade, disponibilidade_local, evidencia_cientifica, nivel_evidencia) VALUES
('Açaí', 'Amazônia', 'Dezembro a Março', ARRAY['Frescor', 'Mais nutrientes', 'Menor custo'], 'Reduz transporte', 'Alta na região', 'Estudos clínicos', 4),
('Cupuaçu', 'Amazônia', 'Janeiro a Abril', ARRAY['Frescor', 'Mais nutrientes', 'Menor custo'], 'Reduz transporte', 'Alta na região', 'Estudos clínicos', 4),
('Bacuri', 'Amazônia', 'Dezembro a Março', ARRAY['Frescor', 'Mais nutrientes', 'Menor custo'], 'Reduz transporte', 'Alta na região', 'Estudos clínicos', 4),
('Tucumã', 'Amazônia', 'Janeiro a Abril', ARRAY['Frescor', 'Mais nutrientes', 'Menor custo'], 'Reduz transporte', 'Alta na região', 'Estudos clínicos', 4),
('Buriti', 'Cerrado', 'Dezembro a Março', ARRAY['Frescor', 'Mais nutrientes', 'Menor custo'], 'Reduz transporte', 'Alta na região', 'Estudos clínicos', 4),
('Pequi', 'Cerrado', 'Novembro a Março', ARRAY['Frescor', 'Mais nutrientes', 'Menor custo'], 'Reduz transporte', 'Alta na região', 'Estudos clínicos', 4),
('Cagaita', 'Cerrado', 'Outubro a Dezembro', ARRAY['Frescor', 'Mais nutrientes', 'Menor custo'], 'Reduz transporte', 'Alta na região', 'Estudos clínicos', 4),
('Mangaba', 'Cerrado', 'Novembro a Março', ARRAY['Frescor', 'Mais nutrientes', 'Menor custo'], 'Reduz transporte', 'Alta na região', 'Estudos clínicos', 4),
('Araticum', 'Caatinga', 'Dezembro a Março', ARRAY['Frescor', 'Mais nutrientes', 'Menor custo'], 'Reduz transporte', 'Alta na região', 'Estudos clínicos', 4),
('Umbu', 'Caatinga', 'Dezembro a Março', ARRAY['Frescor', 'Mais nutrientes', 'Menor custo'], 'Reduz transporte', 'Alta na região', 'Estudos clínicos', 4);

-- 6. ALIMENTOS TRADICIONAIS
INSERT INTO alimentos_tradicionais (alimento, cultura_origem, historia_tradicional, beneficios_tradicionais, preparacao_tradicional, significado_cultural, evidencia_cientifica, nivel_evidencia) VALUES
('Feijão com Arroz', 'Brasil', 'Base da alimentação brasileira há séculos', ARRAY['Proteína completa', 'Energia sustentada', 'Cultura'], 'Cozimento tradicional', 'Símbolo da culinária brasileira', 'Estudos clínicos', 4),
('Moqueca', 'Bahia', 'Prato tradicional indígena e africano', ARRAY['Ômega 3', 'Proteína', 'Cultura'], 'Cozimento em panela de barro', 'Fusão de culturas', 'Estudos clínicos', 4),
('Acarajé', 'Bahia', 'Prato sagrado do candomblé', ARRAY['Proteína', 'Energia', 'Cultura'], 'Fritura em azeite de dendê', 'Religiosidade e cultura', 'Estudos clínicos', 4),
('Vatapá', 'Bahia', 'Prato africano adaptado', ARRAY['Proteína', 'Gorduras boas', 'Cultura'], 'Cozimento com azeite de dendê', 'Herança africana', 'Estudos clínicos', 4),
('Caruru', 'Bahia', 'Prato tradicional africano', ARRAY['Proteína', 'Vitaminas', 'Cultura'], 'Cozimento com quiabo', 'Tradição familiar', 'Estudos clínicos', 4),
('Bobó de Camarão', 'Bahia', 'Prato indígena e africano', ARRAY['Proteína', 'Carboidratos', 'Cultura'], 'Cozimento com azeite de dendê', 'Fusão cultural', 'Estudos clínicos', 4),
('Xinxim de Galinha', 'Bahia', 'Prato africano tradicional', ARRAY['Proteína', 'Gorduras boas', 'Cultura'], 'Cozimento com amendoim', 'Herança africana', 'Estudos clínicos', 4),
('Sarapatel', 'Goa', 'Prato português-indiano', ARRAY['Proteína', 'Vitaminas', 'Cultura'], 'Cozimento com vinagre', 'Fusão luso-indiana', 'Estudos clínicos', 4),
('Vindaloo', 'Goa', 'Prato português-indiano', ARRAY['Proteína', 'Antioxidantes', 'Cultura'], 'Cozimento com especiarias', 'Fusão luso-indiana', 'Estudos clínicos', 4),
('Carne de Sol', 'Nordeste', 'Técnica de conservação tradicional', ARRAY['Proteína', 'Minerais', 'Cultura'], 'Salga e secagem', 'Sobrevivência no sertão', 'Estudos clínicos', 4);

-- 7. ALIMENTOS MODERNOS
INSERT INTO alimentos_modernos (alimento, categoria_moderna, tecnologia_producao, beneficios_modernos, diferencas_tradicionais, sustentabilidade_moderna, evidencia_cientifica, nivel_evidencia) VALUES
('Proteína Vegetal', 'Proteína alternativa', 'Extrusão e fermentação', ARRAY['Sustentável', 'Sem colesterol', 'Menos impacto ambiental'], ARRAY['Sem hormônios', 'Menos recursos hídricos', 'Mais eficiente'], 'Reduz emissões de CO2', 'Estudos clínicos', 4),
('Leite de Amêndoas', 'Alternativa láctea', 'Processamento hidráulico', ARRAY['Sem lactose', 'Menos calorias', 'Sustentável'], ARRAY['Menos recursos hídricos', 'Sem hormônios', 'Vegano'], 'Reduz impacto ambiental', 'Estudos clínicos', 4),
('Carne Cultivada', 'Proteína alternativa', 'Cultura celular', ARRAY['Sem abate', 'Menos antibióticos', 'Sustentável'], ARRAY['Sem hormônios', 'Menos recursos', 'Controle total'], 'Reduz emissões de CO2', 'Estudos clínicos', 4),
('Algas Comestíveis', 'Superalimento', 'Cultivo aquático', ARRAY['Ricas em ômega 3', 'Sustentáveis', 'Proteína completa'], ARRAY['Menos recursos terrestres', 'Mais eficientes', 'Renováveis'], 'Reduz pressão sobre oceanos', 'Estudos clínicos', 4),
('Insetos Comestíveis', 'Proteína alternativa', 'Criação controlada', ARRAY['Alta proteína', 'Sustentável', 'Eficiente'], ARRAY['Menos recursos', 'Menos emissões', 'Mais eficiente'], 'Reduz impacto ambiental', 'Estudos clínicos', 4),
('Alimentos Funcionais', 'Nutracêuticos', 'Biotecnologia', ARRAY['Benefícios específicos', 'Prevenção', 'Tratamento'], ARRAY['Foco em saúde', 'Evidência científica', 'Personalização'], 'Melhora saúde populacional', 'Estudos clínicos', 4),
('Alimentos Fortificados', 'Nutrição pública', 'Fortificação industrial', ARRAY['Prevenção de deficiências', 'Acesso universal', 'Custo-benefício'], ARRAY['Controle de qualidade', 'Distribuição massiva', 'Monitoramento'], 'Reduz desnutrição', 'Estudos clínicos', 4),
('Alimentos Irradiados', 'Conservação', 'Irradiação ionizante', ARRAY['Maior durabilidade', 'Segurança alimentar', 'Reduz desperdício'], ARRAY['Sem alteração nutricional', 'Seguro', 'Eficiente'], 'Reduz desperdício alimentar', 'Estudos clínicos', 4),
('Alimentos Liofilizados', 'Conservação', 'Liofilização', ARRAY['Preserva nutrientes', 'Longa durabilidade', 'Leve'], ARRAY['Mantém sabor', 'Preserva vitaminas', 'Fácil transporte'], 'Reduz desperdício', 'Estudos clínicos', 4),
('Alimentos Hidropônicos', 'Agricultura urbana', 'Cultivo sem solo', ARRAY['Controle total', 'Menos pesticidas', 'Eficiente'], ARRAY['Menos água', 'Menos espaço', 'Controle climático'], 'Agricultura urbana sustentável', 'Estudos clínicos', 4);

-- 8. ALIMENTOS SUSTENTÁVEIS
INSERT INTO alimentos_sustentaveis (alimento, categoria_sustentavel, impacto_ambiental, beneficios_sustentabilidade, certificacoes_sustentaveis, custo_beneficio_ambiental, evidencia_cientifica, nivel_evidencia) VALUES
('Alimentos Orgânicos', 'Agricultura sustentável', 'Reduz poluição', ARRAY['Sem pesticidas', 'Protege solo', 'Biodiversidade'], ARRAY['USDA Organic', 'EU Organic'], 'Alto custo-benefício', 'Estudos clínicos', 4),
('Alimentos Locais', 'Reduz transporte', 'Menos emissões CO2', ARRAY['Frescor', 'Menos transporte', 'Economia local'], ARRAY['Certificação local'], 'Alto custo-benefício', 'Estudos clínicos', 4),
('Alimentos Sazonais', 'Agricultura natural', 'Menos energia', ARRAY['Frescor', 'Menos energia', 'Preço menor'], ARRAY['Certificação sazonal'], 'Alto custo-benefício', 'Estudos clínicos', 4),
('Alimentos Veganos', 'Menos impacto animal', 'Reduz emissões', ARRAY['Sem crueldade', 'Menos recursos', 'Sustentável'], ARRAY['Certificação vegana'], 'Alto custo-benefício', 'Estudos clínicos', 4),
('Alimentos Zero Waste', 'Reduz desperdício', 'Menos lixo', ARRAY['Sem embalagem', 'Aproveitamento total', 'Sustentável'], ARRAY['Certificação zero waste'], 'Alto custo-benefício', 'Estudos clínicos', 4),
('Alimentos Biodinâmicos', 'Agricultura holística', 'Harmonia com natureza', ARRAY['Solo saudável', 'Biodiversidade', 'Sustentável'], ARRAY['Certificação biodinâmica'], 'Alto custo-benefício', 'Estudos clínicos', 4),
('Alimentos Permacultura', 'Design sustentável', 'Sistema fechado', ARRAY['Autossuficiência', 'Biodiversidade', 'Sustentável'], ARRAY['Certificação permacultura'], 'Alto custo-benefício', 'Estudos clínicos', 4),
('Alimentos Agroflorestais', 'Sistema integrado', 'Floresta produtiva', ARRAY['Biodiversidade', 'Solo fértil', 'Sustentável'], ARRAY['Certificação agroflorestal'], 'Alto custo-benefício', 'Estudos clínicos', 4),
('Alimentos Aquapônicos', 'Sistema integrado', 'Reciclagem de água', ARRAY['Eficiência hídrica', 'Proteína sustentável', 'Sistema fechado'], ARRAY['Certificação aquapônica'], 'Alto custo-benefício', 'Estudos clínicos', 4),
('Alimentos Compostáveis', 'Ciclo fechado', 'Retorna ao solo', ARRAY['Fertiliza solo', 'Reduz lixo', 'Sustentável'], ARRAY['Certificação compostável'], 'Alto custo-benefício', 'Estudos clínicos', 4);

-- 9. DETOX
INSERT INTO detox_alimentos (tipo_detox, descricao_detox, alimentos_detox, alimentos_evitar, suplementos_detox, protocolo_detox, duracao_recomendada, contraindicacoes, evidencia_cientifica, nivel_evidencia) VALUES
('Detox Hepático', 'Limpeza do fígado', ARRAY['Beterraba', 'Alcachofra', 'Dente de leão'], ARRAY['Álcool', 'Frituras', 'Açúcares'], ARRAY['Silimarina', 'NAC', 'Glutationa'], 'Eliminar toxinas do fígado', '7-21 dias', ARRAY['Gravidez', 'Doenças hepáticas'], 'Estudos clínicos', 4),
('Detox Intestinal', 'Limpeza do intestino', ARRAY['Fibras', 'Probióticos', 'Água'], ARRAY['Alimentos processados', 'Glúten', 'Laticínios'], ARRAY['Psyllium', 'Probióticos', 'Magnésio'], 'Restaurar microbiota', '7-14 dias', ARRAY['Doenças intestinais'], 'Estudos clínicos', 4),
('Detox Renal', 'Limpeza dos rins', ARRAY['Água', 'Suco de cranberry', 'Pepino'], ARRAY['Sal', 'Proteínas excessivas', 'Cafeína'], ARRAY['Vitamina C', 'Magnésio', 'Potássio'], 'Eliminar toxinas dos rins', '7-14 dias', ARRAY['Doenças renais'], 'Estudos clínicos', 4),
('Detox Metálico', 'Eliminação de metais', ARRAY['Cilantro', 'Alho', 'Clorela'], ARRAY['Peixes grandes', 'Alimentos processados'], ARRAY['Clorela', 'NAC', 'Glutationa'], 'Eliminar metais pesados', '21-30 dias', ARRAY['Gravidez', 'Doenças hepáticas'], 'Estudos clínicos', 4),
('Detox Glicêmico', 'Controle de açúcar', ARRAY['Vegetais verdes', 'Proteínas magras', 'Gorduras boas'], ARRAY['Açúcares', 'Carboidratos refinados'], ARRAY['Cromo', 'Magnésio', 'Ômega 3'], 'Estabilizar glicemia', '14-21 dias', ARRAY['Diabetes'], 'Estudos clínicos', 4);

-- 10. JEJUM
INSERT INTO jejum_alimentos (tipo_jejum, descricao_jejum, duracao_jejum, alimentos_permitidos, alimentos_proibidos, protocolo_quebra_jejum, beneficios_esperados, contraindicacoes, evidencia_cientifica, nivel_evidencia) VALUES
('Jejum Intermitente 16:8', '16 horas de jejum, 8 horas de alimentação', '16 horas', ARRAY['Água', 'Chá', 'Café sem açúcar'], ARRAY['Alimentos sólidos', 'Bebidas calóricas'], 'Quebrar com proteína e gorduras boas', ARRAY['Autofagia', 'Controle glicêmico', 'Perda de peso'], ARRAY['Gravidez', 'Diabetes'], 'Estudos clínicos', 4),
('Jejum Intermitente 18:6', '18 horas de jejum, 6 horas de alimentação', '18 horas', ARRAY['Água', 'Chá', 'Café sem açúcar'], ARRAY['Alimentos sólidos', 'Bebidas calóricas'], 'Quebrar com proteína e gorduras boas', ARRAY['Autofagia', 'Controle glicêmico', 'Perda de peso'], ARRAY['Gravidez', 'Diabetes'], 'Estudos clínicos', 4),
('Jejum Intermitente 20:4', '20 horas de jejum, 4 horas de alimentação', '20 horas', ARRAY['Água', 'Chá', 'Café sem açúcar'], ARRAY['Alimentos sólidos', 'Bebidas calóricas'], 'Quebrar com proteína e gorduras boas', ARRAY['Autofagia', 'Controle glicêmico', 'Perda de peso'], ARRAY['Gravidez', 'Diabetes'], 'Estudos clínicos', 4),
('Jejum de 24 horas', 'Jejum completo por 24 horas', '24 horas', ARRAY['Água', 'Chá', 'Café sem açúcar'], ARRAY['Alimentos sólidos', 'Bebidas calóricas'], 'Quebrar com caldo de ossos', ARRAY['Autofagia', 'Controle glicêmico', 'Perda de peso'], ARRAY['Gravidez', 'Diabetes'], 'Estudos clínicos', 4),
('Jejum de 48 horas', 'Jejum completo por 48 horas', '48 horas', ARRAY['Água', 'Chá', 'Café sem açúcar'], ARRAY['Alimentos sólidos', 'Bebidas calóricas'], 'Quebrar com caldo de ossos', ARRAY['Autofagia', 'Controle glicêmico', 'Perda de peso'], ARRAY['Gravidez', 'Diabetes'], 'Estudos clínicos', 4);

-- 11. MICROBIOMA
INSERT INTO microbioma_alimentos (tipo_bacteria, funcao_bacteria, alimentos_prebioticos, alimentos_probioticos, alimentos_evitar, beneficios_esperados, tempo_adaptacao, evidencia_cientifica, nivel_evidencia) VALUES
('Lactobacillus', 'Digestão e imunidade', ARRAY['Fibras', 'Inulina', 'Amido resistente'], ARRAY['Iogurte', 'Kefir', 'Chucrute'], ARRAY['Açúcares', 'Alimentos processados'], ARRAY['Digestão', 'Imunidade', 'Humor'], '2-4 semanas', 'Estudos clínicos', 4),
('Bifidobacterium', 'Saúde intestinal', ARRAY['Fibras', 'Inulina', 'Amido resistente'], ARRAY['Iogurte', 'Kefir', 'Probióticos'], ARRAY['Açúcares', 'Alimentos processados'], ARRAY['Digestão', 'Imunidade', 'Humor'], '2-4 semanas', 'Estudos clínicos', 4),
('Akkermansia', 'Barreira intestinal', ARRAY['Polifenois', 'Fibras', 'Amido resistente'], ARRAY['Probióticos', 'Alimentos fermentados'], ARRAY['Açúcares', 'Alimentos processados'], ARRAY['Barreira intestinal', 'Metabolismo', 'Imunidade'], '4-6 semanas', 'Estudos clínicos', 4),
('Faecalibacterium', 'Produção de butirato', ARRAY['Fibras', 'Amido resistente', 'Polifenois'], ARRAY['Probióticos', 'Alimentos fermentados'], ARRAY['Açúcares', 'Alimentos processados'], ARRAY['Energia', 'Anti-inflamação', 'Digestão'], '4-6 semanas', 'Estudos clínicos', 4),
('Roseburia', 'Produção de butirato', ARRAY['Fibras', 'Amido resistente', 'Polifenois'], ARRAY['Probióticos', 'Alimentos fermentados'], ARRAY['Açúcares', 'Alimentos processados'], ARRAY['Energia', 'Anti-inflamação', 'Digestão'], '4-6 semanas', 'Estudos clínicos', 4);

-- 12. ALERGIAS
INSERT INTO alergias_intolerancias (tipo, descricao, sintomas, alimentos_proibidos, alimentos_substitutos, exames_diagnostico, tratamento_nutricional, evidencia_cientifica, nivel_evidencia) VALUES
('Alergia ao Glúten', 'Doença celíaca', ARRAY['Diarréia', 'Dor abdominal', 'Fadiga'], ARRAY['Trigo', 'Cevada', 'Centeno'], ARRAY['Arroz', 'Quinoa', 'Amaranto'], ARRAY['Exame de sangue', 'Biopsia intestinal'], 'Dieta sem glúten rigorosa', 'Estudos clínicos', 4),
('Alergia à Lactose', 'Intolerância à lactose', ARRAY['Gases', 'Diarréia', 'Dor abdominal'], ARRAY['Leite', 'Queijo', 'Iogurte'], ARRAY['Leite de amêndoas', 'Leite de coco', 'Queijo vegano'], ARRAY['Teste de tolerância', 'Exame de sangue'], 'Dieta sem lactose', 'Estudos clínicos', 4),
('Alergia ao Ovo', 'Alergia alimentar', ARRAY['Urticária', 'Anafilaxia', 'Vômitos'], ARRAY['Ovos', 'Maionese', 'Bolos'], ARRAY['Semente de chia', 'Linhaça', 'Banana'], ARRAY['Teste cutâneo', 'Exame de sangue'], 'Dieta sem ovo', 'Estudos clínicos', 4),
('Alergia ao Amendoim', 'Alergia alimentar', ARRAY['Anafilaxia', 'Urticária', 'Dificuldade respiratória'], ARRAY['Amendoim', 'Manteiga de amendoim'], ARRAY['Semente de girassol', 'Tahini', 'Manteiga de amêndoas'], ARRAY['Teste cutâneo', 'Exame de sangue'], 'Dieta sem amendoim', 'Estudos clínicos', 4),
('Alergia à Soja', 'Alergia alimentar', ARRAY['Urticária', 'Anafilaxia', 'Vômitos'], ARRAY['Soja', 'Tofu', 'Tempeh'], ARRAY['Grão de bico', 'Lentilha', 'Feijão'], ARRAY['Teste cutâneo', 'Exame de sangue'], 'Dieta sem soja', 'Estudos clínicos', 4);

-- 13. MEDICAMENTOS
INSERT INTO medicamentos_interacoes (medicamento, categoria_medicamento, principio_ativo, alimentos_evitar, alimentos_beneficos, suplementos_contraindicados, suplementos_recomendados, mecanismo_interacao, evidencia_cientifica, nivel_evidencia) VALUES
('Warfarina', 'Anticoagulante', 'Varfarina', ARRAY['Couve', 'Espinafre', 'Brócolis'], ARRAY['Proteínas magras', 'Fibras'], ARRAY['Vitamina K', 'Ômega 3'], ARRAY['Vitamina D', 'Cálcio'], 'Vitamina K antagoniza efeito', 'Estudos clínicos', 4),
('Digoxina', 'Cardiotônico', 'Digoxina', ARRAY['Alcaçuz', 'Café', 'Chá'], ARRAY['Potássio', 'Magnésio'], ARRAY['Cálcio', 'Magnésio'], ARRAY['Potássio', 'Magnésio'], 'Alcaçuz aumenta toxicidade', 'Estudos clínicos', 4),
('Levotiroxina', 'Hormônio tireoidiano', 'Levotiroxina', ARRAY['Soja', 'Fibras', 'Cálcio'], ARRAY['Proteínas magras'], ARRAY['Cálcio', 'Ferro'], ARRAY['Selênio', 'Zinco'], 'Fibras reduzem absorção', 'Estudos clínicos', 4),
('Metformina', 'Antidiabético', 'Metformina', ARRAY['Álcool', 'Açúcares'], ARRAY['Fibras', 'Proteínas magras'], ARRAY['Vitamina B12'], ARRAY['Magnésio', 'Cromo'], 'Álcool aumenta efeito', 'Estudos clínicos', 4),
('Omeprazol', 'Protetor gástrico', 'Omeprazol', ARRAY['Alimentos ácidos', 'Cafeína'], ARRAY['Proteínas magras', 'Fibras'], ARRAY['Cálcio', 'Ferro'], ARRAY['Probióticos', 'Vitamina B12'], 'Reduz absorção de minerais', 'Estudos clínicos', 4);

-- 14. SAZONALIDADE
INSERT INTO sazonalidade_alimentos (estacao, mes_inicio, mes_fim, alimentos_sazonais, beneficios_sazonais, preparacoes_recomendadas, consideracoes_climaticas, evidencia_cientifica, nivel_evidencia) VALUES
('Verão', 12, 3, ARRAY['Manga', 'Abacaxi', 'Melancia'], ARRAY['Hidratação', 'Vitaminas', 'Frescor'], ARRAY['Sucos', 'Saladas', 'Sorvetes'], ARRAY['Calor', 'Umidade'], 'Estudos clínicos', 4),
('Outono', 3, 6, ARRAY['Maçã', 'Pera', 'Uva'], ARRAY['Antioxidantes', 'Fibras', 'Vitaminas'], ARRAY['Compotas', 'Sucos', 'Saladas'], ARRAY['Temperatura amena'], 'Estudos clínicos', 4),
('Inverno', 6, 9, ARRAY['Laranja', 'Tangerina', 'Kiwi'], ARRAY['Vitamina C', 'Imunidade', 'Antioxidantes'], ARRAY['Sucos', 'Saladas', 'Chás'], ARRAY['Frio', 'Umidade'], 'Estudos clínicos', 4),
('Primavera', 9, 12, ARRAY['Morango', 'Cereja', 'Pêssego'], ARRAY['Antioxidantes', 'Vitaminas', 'Fibras'], ARRAY['Saladas', 'Sucos', 'Sobremesas'], ARRAY['Temperatura amena'], 'Estudos clínicos', 4); 