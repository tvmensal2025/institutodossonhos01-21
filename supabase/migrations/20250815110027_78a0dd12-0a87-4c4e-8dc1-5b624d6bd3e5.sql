-- ====================================================================
-- RECEITAS MODELO BRASILEIRAS PARA SOFIA NUTRI
-- Baseado na TACO (Tabela Brasileira de Composição de Alimentos)
-- ====================================================================

DO $$
BEGIN
  --------------------------------------------------------------------
  -- 0) TABELA DE RECEITAS-MODELO + ÍNDICES
  --------------------------------------------------------------------
  EXECUTE $SQL$
    CREATE TABLE IF NOT EXISTS public.receitas_modelo (
      id     BIGSERIAL PRIMARY KEY,
      tipo   TEXT CHECK (tipo IN ('cafe','almoco','lanche','jantar','ceia')),
      nome   TEXT,
      itens  JSONB NOT NULL,      -- [{id:int, g:int}, ...] base em gramas
      hash   TEXT UNIQUE,
      kcal_estimado NUMERIC,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  $SQL$;

  -- índice por tipo (útil para buscas)
  EXECUTE 'CREATE INDEX IF NOT EXISTS ix_receitas_modelo_tipo ON public.receitas_modelo (tipo);';
  EXECUTE 'CREATE INDEX IF NOT EXISTS ix_receitas_modelo_kcal ON public.receitas_modelo (kcal_estimado);';

  -- índice útil nos alimentos para joins
  EXECUTE 'CREATE INDEX IF NOT EXISTS ix_alimentos_completos_id ON public.alimentos_completos (id);';
  EXECUTE 'CREATE INDEX IF NOT EXISTS ix_valores_nutricionais_alimento_id ON public.valores_nutricionais_completos (alimento_id);';

  --------------------------------------------------------------------
  -- 1) FUNÇÃO UTILITÁRIA: HASH DE ITENS (para deduplicar combinações)
  --------------------------------------------------------------------
  EXECUTE $SQL$
    CREATE OR REPLACE FUNCTION public.fn_hash_itens(tipo TEXT, itens JSONB)
    RETURNS TEXT
    LANGUAGE sql IMMUTABLE AS $FN$
      SELECT md5(
        coalesce($1,'') || '|' ||
        (
          SELECT string_agg(
                   (i->>'id')||':'||(i->>'g'),
                   ',' ORDER BY (i->>'id')::int, (i->>'g')::int
                 )
          FROM jsonb_array_elements($2) i
        )
      );
    $FN$;
  $SQL$;

  --------------------------------------------------------------------
  -- 2) VIEWS DE POOLS (baseados nos alimentos brasileiros)
  --------------------------------------------------------------------
  
  -- Pool de Proteínas (carnes, peixes, ovos, lácteos, leguminosas com alta proteína)
  EXECUTE $SQL$
    CREATE OR REPLACE VIEW public.pool_proteina AS
    SELECT a.id, a.nome
      FROM public.alimentos_completos a
      JOIN public.valores_nutricionais_completos v ON a.id = v.alimento_id
     WHERE (
             (a.categoria ILIKE '%carne%' OR a.categoria ILIKE '%peixe%' OR a.categoria ILIKE '%frango%')
             AND v.proteina >= 15
           )
        OR (
             (a.categoria ILIKE '%ovo%' OR a.categoria ILIKE '%leite%' OR a.categoria ILIKE '%queijo%')
             AND v.proteina >= 8
           )
        OR (
             a.categoria ILIKE '%feijão%' AND v.proteina >= 8
           );
  $SQL$;

  -- Pool de Carboidratos (arroz, massas, pães, tubérculos)
  EXECUTE $SQL$
    CREATE OR REPLACE VIEW public.pool_carbo AS
    SELECT a.id, a.nome
      FROM public.alimentos_completos a
      JOIN public.valores_nutricionais_completos v ON a.id = v.alimento_id
     WHERE (a.categoria ILIKE '%cereal%' OR a.categoria ILIKE '%tubérculo%' OR 
            a.nome ILIKE '%arroz%' OR a.nome ILIKE '%massa%' OR a.nome ILIKE '%batata%' OR
            a.nome ILIKE '%mandioca%' OR a.nome ILIKE '%inhame%')
       AND v.carboidrato >= 15;
  $SQL$;

  -- Pool de Feijões e Leguminosas
  EXECUTE $SQL$
    CREATE OR REPLACE VIEW public.pool_feijao AS
    SELECT a.id, a.nome
      FROM public.alimentos_completos a
     WHERE a.nome ILIKE '%feijão%' OR
           a.nome ILIKE '%lentilha%' OR
           a.nome ILIKE '%grão%' OR
           a.nome ILIKE '%ervilha%';
  $SQL$;

  -- Pool de Legumes e Verduras
  EXECUTE $SQL$
    CREATE OR REPLACE VIEW public.pool_legume AS
    SELECT a.id, a.nome
      FROM public.alimentos_completos a
     WHERE a.categoria ILIKE '%vegetal%' OR
           a.nome ILIKE '%alface%' OR a.nome ILIKE '%tomate%' OR a.nome ILIKE '%cebola%' OR
           a.nome ILIKE '%cenoura%' OR a.nome ILIKE '%brócolis%' OR a.nome ILIKE '%couve%';
  $SQL$;

  -- Pool de Frutas
  EXECUTE $SQL$
    CREATE OR REPLACE VIEW public.pool_fruta AS
    SELECT a.id, a.nome
      FROM public.alimentos_completos a
     WHERE a.categoria ILIKE '%fruta%' OR
           a.nome ILIKE '%banana%' OR a.nome ILIKE '%maçã%' OR a.nome ILIKE '%laranja%' OR
           a.nome ILIKE '%mamão%' OR a.nome ILIKE '%manga%' OR a.nome ILIKE '%abacaxi%';
  $SQL$;

  -- Pool de Padaria (pães, tapiocas, cuscuz, aveia)
  EXECUTE $SQL$
    CREATE OR REPLACE VIEW public.pool_padaria AS
    SELECT a.id, a.nome
      FROM public.alimentos_completos a
     WHERE a.nome ILIKE '%pão%' OR
           a.nome ILIKE '%tapioca%' OR
           a.nome ILIKE '%cuscuz%' OR
           a.nome ILIKE '%aveia%' OR
           a.nome ILIKE '%biscoito%';
  $SQL$;

  --------------------------------------------------------------------
  -- 3) GERAÇÃO EM MASSA DE RECEITAS MODELO BRASILEIRAS
  --------------------------------------------------------------------
  
  -- ALMOÇOS (Prato Feito Brasileiro: proteína + carbo + feijão + legume)
  EXECUTE $SQL$
    INSERT INTO public.receitas_modelo (tipo, nome, itens, hash, kcal_estimado)
    SELECT
      'almoco' AS tipo,
      format('PF: %s com %s, %s e %s',
             p.nome, c.nome, f.nome, l.nome) AS nome,
      jsonb_build_array(
        jsonb_build_object('id', p.id, 'g', 120),
        jsonb_build_object('id', c.id, 'g', 160),
        jsonb_build_object('id', f.id, 'g',  80),
        jsonb_build_object('id', l.id, 'g', 120)
      ) AS itens,
      fn_hash_itens('almoco',
        jsonb_build_array(
          jsonb_build_object('id', p.id, 'g', 120),
          jsonb_build_object('id', c.id, 'g', 160),
          jsonb_build_object('id', f.id, 'g',  80),
          jsonb_build_object('id', l.id, 'g', 120)
        )
      ) AS hash,
      600 AS kcal_estimado -- estimativa inicial
    FROM generate_series(1,5000) s
    CROSS JOIN LATERAL (SELECT * FROM public.pool_proteina ORDER BY random() LIMIT 1) p
    CROSS JOIN LATERAL (SELECT * FROM public.pool_carbo    ORDER BY random() LIMIT 1) c
    CROSS JOIN LATERAL (SELECT * FROM public.pool_feijao   ORDER BY random() LIMIT 1) f
    CROSS JOIN LATERAL (SELECT * FROM public.pool_legume   ORDER BY random() LIMIT 1) l
    ON CONFLICT (hash) DO NOTHING;
  $SQL$;

  -- JANTARES (versão mais leve)
  EXECUTE $SQL$
    INSERT INTO public.receitas_modelo (tipo, nome, itens, hash, kcal_estimado)
    SELECT
      'jantar',
      format('Jantar: %s com %s e %s', p.nome, c.nome, l.nome),
      jsonb_build_array(
        jsonb_build_object('id', p.id, 'g', 100),
        jsonb_build_object('id', c.id, 'g', 120),
        jsonb_build_object('id', l.id, 'g', 150)
      ),
      fn_hash_itens('jantar',
        jsonb_build_array(
          jsonb_build_object('id', p.id, 'g', 100),
          jsonb_build_object('id', c.id, 'g', 120),
          jsonb_build_object('id', l.id, 'g', 150)
        )
      ),
      450 AS kcal_estimado
    FROM generate_series(1,3000) s
    CROSS JOIN LATERAL (SELECT * FROM public.pool_proteina ORDER BY random() LIMIT 1) p
    CROSS JOIN LATERAL (SELECT * FROM public.pool_carbo    ORDER BY random() LIMIT 1) c
    CROSS JOIN LATERAL (SELECT * FROM public.pool_legume   ORDER BY random() LIMIT 1) l
    ON CONFLICT (hash) DO NOTHING;
  $SQL$;

  -- CAFÉS DA MANHÃ (padaria + proteína + fruta)
  EXECUTE $SQL$
    INSERT INTO public.receitas_modelo (tipo, nome, itens, hash, kcal_estimado)
    SELECT
      'cafe',
      format('Café: %s com %s e %s', pad.nome, prot.nome, fru.nome),
      jsonb_build_array(
        jsonb_build_object('id', pad.id,  'g',  60),
        jsonb_build_object('id', prot.id, 'g', 100),
        jsonb_build_object('id', fru.id,  'g', 150)
      ),
      fn_hash_itens('cafe',
        jsonb_build_array(
          jsonb_build_object('id', pad.id,  'g',  60),
          jsonb_build_object('id', prot.id, 'g', 100),
          jsonb_build_object('id', fru.id,  'g', 150)
        )
      ),
      350 AS kcal_estimado
    FROM generate_series(1,2000) s
    CROSS JOIN LATERAL (SELECT * FROM public.pool_padaria  ORDER BY random() LIMIT 1) pad
    CROSS JOIN LATERAL (SELECT * FROM public.pool_proteina ORDER BY random() LIMIT 1) prot
    CROSS JOIN LATERAL (SELECT * FROM public.pool_fruta    ORDER BY random() LIMIT 1) fru
    ON CONFLICT (hash) DO NOTHING;
  $SQL$;

  -- LANCHES (fruta + proteína láctea/vegetal)
  EXECUTE $SQL$
    INSERT INTO public.receitas_modelo (tipo, nome, itens, hash, kcal_estimado)
    SELECT
      'lanche',
      format('Lanche: %s com %s', fru.nome, prot.nome),
      jsonb_build_array(
        jsonb_build_object('id', fru.id,  'g', 160),
        jsonb_build_object('id', prot.id, 'g', 120)
      ),
      fn_hash_itens('lanche',
        jsonb_build_array(
          jsonb_build_object('id', fru.id,  'g', 160),
          jsonb_build_object('id', prot.id, 'g', 120)
        )
      ),
      250 AS kcal_estimado
    FROM generate_series(1,1000) s
    CROSS JOIN LATERAL (SELECT * FROM public.pool_fruta    ORDER BY random() LIMIT 1) fru
    CROSS JOIN LATERAL (SELECT * FROM public.pool_proteina ORDER BY random() LIMIT 1) prot
    ON CONFLICT (hash) DO NOTHING;
  $SQL$;

  -- CEIAS (bebida láctea/vegetal + fruta)
  EXECUTE $SQL$
    INSERT INTO public.receitas_modelo (tipo, nome, itens, hash, kcal_estimado)
    SELECT
      'ceia',
      format('Ceia: %s com %s', prot.nome, fru.nome),
      jsonb_build_array(
        jsonb_build_object('id', prot.id, 'g', 200),
        jsonb_build_object('id', fru.id,  'g', 120)
      ),
      fn_hash_itens('ceia',
        jsonb_build_array(
          jsonb_build_object('id', prot.id, 'g', 200),
          jsonb_build_object('id', fru.id,  'g', 120)
        )
      ),
      200 AS kcal_estimado
    FROM generate_series(1,800) s
    CROSS JOIN LATERAL (SELECT * FROM public.pool_proteina ORDER BY random() LIMIT 1) prot
    CROSS JOIN LATERAL (SELECT * FROM public.pool_fruta    ORDER BY random() LIMIT 1) fru
    ON CONFLICT (hash) DO NOTHING;
  $SQL$;

  -- Enable RLS
  ALTER TABLE public.receitas_modelo ENABLE ROW LEVEL SECURITY;
  
  -- Policy para leitura pública (Sofia Nutri pode acessar)
  CREATE POLICY "receitas_modelo_select_all" ON public.receitas_modelo
    FOR SELECT USING (true);

  --------------------------------------------------------------------
  -- 4) LOG DE CONTAGEM
  --------------------------------------------------------------------
  RAISE NOTICE '========================================';
  RAISE NOTICE 'RECEITAS MODELO BRASILEIRAS CRIADAS';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Total modelos: %', (SELECT COUNT(*) FROM public.receitas_modelo);
  RAISE NOTICE 'Café:   %', (SELECT COUNT(*) FROM public.receitas_modelo WHERE tipo='cafe');
  RAISE NOTICE 'Almoço: %', (SELECT COUNT(*) FROM public.receitas_modelo WHERE tipo='almoco');
  RAISE NOTICE 'Lanche: %', (SELECT COUNT(*) FROM public.receitas_modelo WHERE tipo='lanche');
  RAISE NOTICE 'Jantar: %', (SELECT COUNT(*) FROM public.receitas_modelo WHERE tipo='jantar');
  RAISE NOTICE 'Ceia:   %', (SELECT COUNT(*) FROM public.receitas_modelo WHERE tipo='ceia');
  RAISE NOTICE '========================================';
END
$$;