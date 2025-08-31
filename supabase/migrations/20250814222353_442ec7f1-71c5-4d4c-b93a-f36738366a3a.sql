
-- Criar tabela para o catálogo nutricional do Instituto dos Sonhos
CREATE TABLE public.instituto_catalogo_nutricional (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  version character varying NOT NULL DEFAULT '1.0.0',
  locale character varying NOT NULL DEFAULT 'pt-BR',
  app_name character varying NOT NULL DEFAULT 'Instituto dos Sonhos — Sofia Nutricional',
  purpose text,
  data_sources jsonb,
  calculation_policy jsonb,
  ui_policy jsonb,
  house_rules jsonb,
  measurement_map jsonb,
  schemas jsonb,
  templates jsonb,
  catalogo jsonb NOT NULL,
  generation_rules jsonb,
  menus_base_7_dias jsonb,
  disclaimer text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Inserir o catálogo fornecido
INSERT INTO public.instituto_catalogo_nutricional (
  version,
  locale,
  app_name,
  purpose,
  data_sources,
  calculation_policy,
  ui_policy,
  house_rules,
  measurement_map,
  schemas,
  templates,
  catalogo,
  generation_rules,
  menus_base_7_dias,
  disclaimer
) VALUES (
  '1.0.0',
  'pt-BR',
  'Instituto dos Sonhos — Sofia Nutricional',
  'Gerar cardápios e receitas com cálculo nutricional determinístico (TACO/USDA), sem ajustar valores para bater metas. Usar catálogo interno de alimentos e receitas do Instituto dos Sonhos.',
  '{"primary_table": "TACO", "secondary_table": "USDA", "documents": ["Cardápio Normal SEMPRE MAGRA-1.pdf"]}'::jsonb,
  '{"deterministic": true, "source_priority": ["TACO", "USDA"], "units": "g (cozido quando aplicável)", "default_state": "cozido", "sum_only": true, "never_force_target": true, "rounding": {"energy_kcal": 0, "macros_g": 1, "fiber_g": 1, "salt_g": 1}, "audit_trail": {"enabled": true, "show_per_item": true, "show_totals": true, "fields": ["alimento", "quantidade_g", "kcal", "proteina_g", "carbo_g", "gordura_g", "fibras_g", "fonte"]}}'::jsonb,
  '{"rename_fields": {"MEDIDA CASEIRA": "Sugestão prática"}, "show_macros": ["kcal", "proteina_g", "carbo_g", "gordura_g", "fibras_g"], "show_totals_day_header": true, "warnings": ["Se os totais não coincidirem com a meta, manter a soma real. Não ajustar artificialmente.", "Documento educativo — consulte sempre um nutricionista."]}'::jsonb,
  '{"sem_acucar_adicionado": true, "oils_policy": "Preferir vapor, forno, airfryer e frigideira antiaderente; usar azeite só no final (até 1 cchá/refeição).", "salt_policy": "Reduzir sal refinado; preferir sal grosso/Mossoró.", "water_intake_tip": "35 ml/kg/dia (exceto restrições médicas).", "food_safety": "Higienizar frutas, verduras e legumes."}'::jsonb,
  '{"colher_cha": {"ml": 5}, "colher_sopa": {"ml": 15}, "xicarachá": {"ml": 240}, "concha_media": {"ml": 120}, "unidade_ovo": {"g": 50}, "unidade_banana_prata": {"g": 90}, "palma_file": {"descricao": "filé do tamanho da palma da mão", "g_aprox": 120}}'::jsonb,
  '{"recipe": {"fields": ["titulo", "categoria", "ingredientes[] {nome, quantidade, unidade, g_cozido_aprox}", "modo_preparo[]", "sugestoes_substituicao[]", "porcao {descricao, g}", "nutricao {kcal, proteina_g, carbo_g, gordura_g, fibras_g, fonte}", "observacoes"]}, "menu": {"fields": ["dia_nome", "meta_diaria {kcal, proteina_g, carbo_g, gordura_g}", "refeicoes[] {nome, itens[] {alimento, quantidade_g, sugestao_pratica}, nutricao_totais, modo_preparo_curto[]}", "totais_do_dia {kcal, proteina_g, carbo_g, gordura_g, fibras_g}", "auditoria[]"]}}'::jsonb,
  '{"modo_preparo_curto": ["Organize os ingredientes; use frigideira antiaderente; ajuste sal e ervas.", "Cozinhe no vapor/forno/airfryer; finalize com suco de limão e ervas.", "Refogue com 3–5 colheres de sopa de água em vez de óleo; reduza e acerte os temperos."], "sugestoes_praticas": ["Proteína: filé do tamanho da palma da mão.", "Arroz/cozidos: 4–6 colheres de sopa.", "Iogurte: 1 pote (~170 g).", "Fruta: 1 unidade média ou 1/2 xícara picada."]}'::jsonb,
  '{"proteinas": ["Peito de frango (120 g)", "Coxa/sobrecoxa sem pele (120 g)", "Filé de tilápia (120 g)", "Sardinha grelhada (120 g)", "Salmão (120 g)", "Atum (lata em água 120 g ou fresco 150 g)", "Ovos (2 un)", "Carne bovina magra (patinho, coxão mole 120 g)", "Peru (120 g)", "Carne suína magra (lombo 120 g)", "Camarão grelhado (150 g)", "Tofu firme (150 g)", "Omelete de legumes (2 ovos + legumes)", "Frango desfiado temperado (120 g)"], "carboidratos": ["Arroz branco (120–180 g cozido)", "Arroz integral (120–180 g cozido)", "Feijão carioca/preto (60–120 g cozido)", "Quinoa cozida (100 g)", "Batata-doce cozida (80–150 g)", "Purê de couve-flor (120 g)", "Cuscuz marroquino (100 g cozido)", "Pão 100% integral (1 fatia 45 g)", "Aveia em flocos (40 g)", "Tapioca (50 g de goma)"], "legumes_verduras": ["Salada verde (alface, rúcula, agrião) à vontade", "Brócolis cozido (80 g)", "Abobrinha refogada (80 g)", "Berinjela assada (80 g)", "Couve-flor cozida (80 g)", "Cenoura cozida (60 g)", "Beterraba cozida (60 g)", "Pepino/tomate (80 g)", "Shimeji/cogumelos (100 g)", "Caponata de berinjela (60 g)", "Charuto de acelga (2 un)"], "laticinios_e_afins": ["Iogurte natural (170 g)", "Iogurte grego light (120 g)", "Queijo minas frescal (30 g)", "Leite desnatado (200 ml)", "Kefir (200 ml)"], "frutas_e_lanches": ["Banana prata (1 un ~90 g)", "Maçã (1 un ~130 g)", "Morangos (1/2 xíc ~70 g)", "Abacaxi (1 fatia 100 g)", "Mamão (1/2 un 150 g)", "Mix castanhas (10–15 g)", "Granola sem açúcar (15 g)", "Chia (5–10 g)", "Linhaça moída (10 g)"], "bebidas": ["Água", "Café sem açúcar", "Chás (camomila, erva-doce, chá verde)", "Suco de limão/maracujá (sem açúcar)"], "receitas_base": ["Frango grelhado ao limão e ervas", "Frango xadrez simples", "Moqueca leve de peixe", "Omelete colorida", "Panqueca de aveia (salgada ou doce)", "Wrap de atum", "Iogurte com frutas e chia", "Salada completa (proteína + folhas + legume + molho de limão)"]}'::jsonb,
  '{"menu_builder": {"refeicoes_padrao": ["Café da manhã", "Almoço", "Lanche", "Jantar"], "kcal_range_por_refeicao": {"Café da manhã": [300, 450], "Almoço": [450, 700], "Lanche": [150, 350], "Jantar": [350, 650]}, "equilibrio": ["Cada refeição deve ter proteína + (carbo ou legume).", "Adicionar salada/legume quando fibras < 5 g/refeição."], "retornar": ["lista_itens", "sugestao_pratica", "modo_preparo_curto", "nutricao", "auditoria"]}, "recipe_builder": {"usar_catalogo": true, "validar_fontes": true, "porcao_padrao_g": 200, "retornar": ["ingredientes", "passos", "variacoes", "nutricao", "auditoria"]}}'::jsonb,
  '[{"dia_nome": "Dia 1", "meta_diaria": {"kcal": 2000, "proteina_g": 150, "carbo_g": 250, "gordura_g": 44}, "refeicoes": [{"nome": "Café da manhã", "itens": [{"alimento": "Iogurte natural", "quantidade_g": 170, "sugestao_pratica": "1 pote (~170 g)"}, {"alimento": "Banana prata", "quantidade_g": 90, "sugestao_pratica": "1 unidade"}, {"alimento": "Granola sem açúcar", "quantidade_g": 15, "sugestao_pratica": "1 csopa"}]}, {"nome": "Almoço", "itens": [{"alimento": "Peito de frango", "quantidade_g": 120, "sugestao_pratica": "1 filé palma da mão"}, {"alimento": "Arroz integral", "quantidade_g": 150, "sugestao_pratica": "5–6 csopa"}, {"alimento": "Salada verde", "quantidade_g": 120, "sugestao_pratica": "à vontade"}]}, {"nome": "Lanche", "itens": [{"alimento": "Maçã", "quantidade_g": 130, "sugestao_pratica": "1 unidade"}, {"alimento": "Mix castanhas", "quantidade_g": 15, "sugestao_pratica": "1 csopa cheia"}]}, {"nome": "Jantar", "itens": [{"alimento": "Tilápia", "quantidade_g": 120, "sugestao_pratica": "1 filé"}, {"alimento": "Batata-doce cozida", "quantidade_g": 120, "sugestao_pratica": "4 csopa"}, {"alimento": "Brócolis cozido", "quantidade_g": 100, "sugestao_pratica": "1 xícara"}]}]}, {"dia_nome": "Dia 2", "meta_diaria": {"kcal": 1900, "proteina_g": 140, "carbo_g": 220, "gordura_g": 50}, "refeicoes": [{"nome": "Café da manhã", "itens": [{"alimento": "Aveia em flocos", "quantidade_g": 40, "sugestao_pratica": "1/2 xícara"}, {"alimento": "Leite desnatado", "quantidade_g": 200, "sugestao_pratica": "1 copo"}, {"alimento": "Morangos", "quantidade_g": 100, "sugestao_pratica": "1 xícara"}]}, {"nome": "Almoço", "itens": [{"alimento": "Carne bovina magra", "quantidade_g": 120, "sugestao_pratica": "1 bife"}, {"alimento": "Arroz branco", "quantidade_g": 150, "sugestao_pratica": "5–6 csopa"}, {"alimento": "Feijão preto", "quantidade_g": 80, "sugestao_pratica": "2 csopa"}, {"alimento": "Salada verde", "quantidade_g": 100, "sugestao_pratica": "à vontade"}]}, {"nome": "Lanche", "itens": [{"alimento": "Iogurte grego light", "quantidade_g": 120, "sugestao_pratica": "1 pote"}]}, {"nome": "Jantar", "itens": [{"alimento": "Omelete de legumes", "quantidade_g": 200, "sugestao_pratica": "2 ovos + legumes"}, {"alimento": "Abobrinha refogada", "quantidade_g": 100, "sugestao_pratica": "1 xícara"}]}]}, {"dia_nome": "Dia 3", "meta_diaria": {"kcal": 2000, "proteina_g": 150, "carbo_g": 240, "gordura_g": 55}, "refeicoes": [{"nome": "Café da manhã", "itens": [{"alimento": "Tapioca", "quantidade_g": 50, "sugestao_pratica": "1 disco médio"}, {"alimento": "Ovos", "quantidade_g": 100, "sugestao_pratica": "2 unidades"}]}, {"nome": "Almoço", "itens": [{"alimento": "Sardinha grelhada", "quantidade_g": 120}, {"alimento": "Quinoa cozida", "quantidade_g": 120}, {"alimento": "Couve-flor cozida", "quantidade_g": 100}]}, {"nome": "Lanche", "itens": [{"alimento": "Mamão", "quantidade_g": 150}, {"alimento": "Chia", "quantidade_g": 10}]}, {"nome": "Jantar", "itens": [{"alimento": "Peito de frango", "quantidade_g": 120}, {"alimento": "Arroz integral", "quantidade_g": 150}, {"alimento": "Salada verde", "quantidade_g": 120}]}]}, {"dia_nome": "Dia 4", "meta_diaria": {"kcal": 1900, "proteina_g": 140, "carbo_g": 230, "gordura_g": 50}, "refeicoes": [{"nome": "Café da manhã", "itens": [{"alimento": "Iogurte natural", "quantidade_g": 170}, {"alimento": "Morangos", "quantidade_g": 100}, {"alimento": "Linhaça moída", "quantidade_g": 10}]}, {"nome": "Almoço", "itens": [{"alimento": "Tilápia", "quantidade_g": 120}, {"alimento": "Arroz branco", "quantidade_g": 150}, {"alimento": "Brócolis cozido", "quantidade_g": 100}]}, {"nome": "Lanche", "itens": [{"alimento": "Maçã", "quantidade_g": 130}]}, {"nome": "Jantar", "itens": [{"alimento": "Omelete de legumes", "quantidade_g": 220}, {"alimento": "Salada verde", "quantidade_g": 120}]}]}, {"dia_nome": "Dia 5", "meta_diaria": {"kcal": 2000, "proteina_g": 150, "carbo_g": 250, "gordura_g": 44}, "refeicoes": [{"nome": "Café da manhã", "itens": [{"alimento": "Aveia em flocos", "quantidade_g": 40}, {"alimento": "Leite desnatado", "quantidade_g": 200}, {"alimento": "Banana prata", "quantidade_g": 90}]}, {"nome": "Almoço", "itens": [{"alimento": "Peito de frango", "quantidade_g": 120}, {"alimento": "Feijão carioca", "quantidade_g": 80}, {"alimento": "Arroz integral", "quantidade_g": 150}, {"alimento": "Salada verde", "quantidade_g": 100}]}, {"nome": "Lanche", "itens": [{"alimento": "Iogurte grego light", "quantidade_g": 120}]}, {"nome": "Jantar", "itens": [{"alimento": "Salmão", "quantidade_g": 120}, {"alimento": "Batata-doce cozida", "quantidade_g": 120}, {"alimento": "Abobrinha refogada", "quantidade_g": 100}]}]}, {"dia_nome": "Dia 6", "meta_diaria": {"kcal": 1850, "proteina_g": 140, "carbo_g": 220, "gordura_g": 50}, "refeicoes": [{"nome": "Café da manhã", "itens": [{"alimento": "Tapioca", "quantidade_g": 50}, {"alimento": "Ovos", "quantidade_g": 100}]}, {"nome": "Almoço", "itens": [{"alimento": "Carne suína magra (lombo)", "quantidade_g": 120}, {"alimento": "Arroz branco", "quantidade_g": 150}, {"alimento": "Cenoura cozida", "quantidade_g": 80}]}, {"nome": "Lanche", "itens": [{"alimento": "Kefir", "quantidade_g": 200}, {"alimento": "Morangos", "quantidade_g": 80}]}, {"nome": "Jantar", "itens": [{"alimento": "Tofu firme", "quantidade_g": 150}, {"alimento": "Quinoa cozida", "quantidade_g": 120}, {"alimento": "Couve-flor cozida", "quantidade_g": 100}]}]}, {"dia_nome": "Dia 7", "meta_diaria": {"kcal": 1950, "proteina_g": 145, "carbo_g": 235, "gordura_g": 52}, "refeicoes": [{"nome": "Café da manhã", "itens": [{"alimento": "Iogurte natural", "quantidade_g": 170}, {"alimento": "Mamão", "quantidade_g": 150}, {"alimento": "Chia", "quantidade_g": 10}]}, {"nome": "Almoço", "itens": [{"alimento": "Camarão grelhado", "quantidade_g": 150}, {"alimento": "Arroz integral", "quantidade_g": 150}, {"alimento": "Salada verde", "quantidade_g": 120}]}, {"nome": "Lanche", "itens": [{"alimento": "Banana prata", "quantidade_g": 90}, {"alimento": "Mix castanhas", "quantidade_g": 15}]}, {"nome": "Jantar", "itens": [{"alimento": "Peito de frango", "quantidade_g": 120}, {"alimento": "Purê de couve-flor", "quantidade_g": 150}, {"alimento": "Brócolis cozido", "quantidade_g": 100}]}]}]'::jsonb,
  'Documento educativo. Para planos clínicos individualizados, consulte nutricionista.'
);

-- Habilitar RLS
ALTER TABLE public.instituto_catalogo_nutricional ENABLE ROW LEVEL SECURITY;

-- Política para leitura pública
CREATE POLICY "Everyone can read catalogo nutricional" 
  ON public.instituto_catalogo_nutricional 
  FOR SELECT 
  USING (is_active = true);

-- Política para admins gerenciarem
CREATE POLICY "Admins can manage catalogo nutricional" 
  ON public.instituto_catalogo_nutricional 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.user_id = auth.uid() 
      AND p.role = ANY(ARRAY['admin', 'owner'])
    )
  ) 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.user_id = auth.uid() 
      AND p.role = ANY(ARRAY['admin', 'owner'])
    )
  );

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_instituto_catalogo_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_instituto_catalogo_updated_at_trigger
  BEFORE UPDATE ON public.instituto_catalogo_nutricional
  FOR EACH ROW
  EXECUTE FUNCTION update_instituto_catalogo_updated_at();
