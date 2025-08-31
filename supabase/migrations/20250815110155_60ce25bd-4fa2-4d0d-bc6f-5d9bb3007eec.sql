-- ====================================================================
-- RECEITAS MODELO BRASILEIRAS PARA SOFIA NUTRI - CORRIGIDO
-- Baseado nos alimentos completos disponíveis
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

  -- índices para buscas rápidas
  EXECUTE 'CREATE INDEX IF NOT EXISTS ix_receitas_modelo_tipo ON public.receitas_modelo (tipo);';
  EXECUTE 'CREATE INDEX IF NOT EXISTS ix_receitas_modelo_kcal ON public.receitas_modelo (kcal_estimado);';
  EXECUTE 'CREATE INDEX IF NOT EXISTS ix_alimentos_completos_id ON public.alimentos_completos (id);';

  --------------------------------------------------------------------
  -- 1) FUNÇÃO UTILITÁRIA: HASH DE ITENS (para deduplicar)
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
  -- 2) VIEWS DE POOLS - ALIMENTOS BRASILEIROS
  --------------------------------------------------------------------
  
  -- Pool de Proteínas
  EXECUTE $SQL$
    CREATE OR REPLACE VIEW public.pool_proteina AS
    SELECT DISTINCT a.id, a.nome
      FROM public.alimentos_completos a
      LEFT JOIN public.valores_nutricionais_completos v ON a.id = v.id
     WHERE (
             (a.categoria ILIKE '%proteina%' OR a.categoria ILIKE '%carne%' OR 
              a.categoria ILIKE '%peixe%' OR a.categoria ILIKE '%frango%' OR
              a.nome ILIKE '%frango%' OR a.nome ILIKE '%carne%' OR a.nome ILIKE '%peixe%' OR
              a.nome ILIKE '%ovo%' OR a.nome ILIKE '%queijo%' OR a.nome ILIKE '%leite%')
           )
        OR (
             a.nome ILIKE '%feijão%' AND COALESCE(v.proteina, 0) >= 8
           )
     LIMIT 50;
  $SQL$;

  -- Pool de Carboidratos
  EXECUTE $SQL$
    CREATE OR REPLACE VIEW public.pool_carbo AS
    SELECT DISTINCT a.id, a.nome
      FROM public.alimentos_completos a
     WHERE a.categoria ILIKE '%carboidrato%' OR 
           a.nome ILIKE '%arroz%' OR a.nome ILIKE '%massa%' OR a.nome ILIKE '%batata%' OR
           a.nome ILIKE '%mandioca%' OR a.nome ILIKE '%pão%' OR a.nome ILIKE '%macarrão%'
     LIMIT 30;
  $SQL$;

  -- Pool de Feijões
  EXECUTE $SQL$
    CREATE OR REPLACE VIEW public.pool_feijao AS
    SELECT DISTINCT a.id, a.nome
      FROM public.alimentos_completos a
     WHERE a.nome ILIKE '%feijão%' OR
           a.nome ILIKE '%lentilha%' OR
           a.nome ILIKE '%grão%' OR
           a.nome ILIKE '%ervilha%'
     LIMIT 15;
  $SQL$;

  -- Pool de Legumes e Verduras
  EXECUTE $SQL$
    CREATE OR REPLACE VIEW public.pool_legume AS
    SELECT DISTINCT a.id, a.nome
      FROM public.alimentos_completos a
     WHERE a.categoria ILIKE '%vegetal%' OR
           a.nome ILIKE '%alface%' OR a.nome ILIKE '%tomate%' OR a.nome ILIKE '%cebola%' OR
           a.nome ILIKE '%cenoura%' OR a.nome ILIKE '%brócolis%' OR a.nome ILIKE '%couve%' OR
           a.nome ILIKE '%abobrinha%' OR a.nome ILIKE '%pepino%'
     LIMIT 25;
  $SQL$;

  -- Pool de Frutas
  EXECUTE $SQL$
    CREATE OR REPLACE VIEW public.pool_fruta AS
    SELECT DISTINCT a.id, a.nome
      FROM public.alimentos_completos a
     WHERE a.nome ILIKE '%banana%' OR a.nome ILIKE '%maçã%' OR a.nome ILIKE '%laranja%' OR
           a.nome ILIKE '%mamão%' OR a.nome ILIKE '%manga%' OR a.nome ILIKE '%abacaxi%' OR
           a.nome ILIKE '%uva%' OR a.nome ILIKE '%pera%' OR a.nome ILIKE '%melancia%'
     LIMIT 20;
  $SQL$;

  -- Pool de Padaria
  EXECUTE $SQL$
    CREATE OR REPLACE VIEW public.pool_padaria AS
    SELECT DISTINCT a.id, a.nome
      FROM public.alimentos_completos a
     WHERE a.nome ILIKE '%pão%' OR
           a.nome ILIKE '%tapioca%' OR
           a.nome ILIKE '%cuscuz%' OR
           a.nome ILIKE '%aveia%' OR
           a.nome ILIKE '%biscoito%' OR
           a.nome ILIKE '%torrada%'
     LIMIT 15;
  $SQL$;

  --------------------------------------------------------------------
  -- 3) INSERIR ALGUNS ALIMENTOS BÁSICOS SE NÃO EXISTIREM
  --------------------------------------------------------------------
  
  -- Inserir alimentos básicos brasileiros se não existirem
  EXECUTE $SQL$
    INSERT INTO public.alimentos_completos (nome, categoria, subcategoria)
    SELECT nome, categoria, subcategoria FROM (VALUES
      ('Arroz branco cozido', 'carboidrato', 'cereal'),
      ('Feijão carioca cozido', 'proteina', 'leguminosa'),
      ('Frango grelhado', 'proteina', 'carne'),
      ('Carne bovina grelhada', 'proteina', 'carne'),
      ('Ovo cozido', 'proteina', 'ave'),
      ('Batata cozida', 'carboidrato', 'tubérculo'),
      ('Alface', 'vegetal', 'folha'),
      ('Tomate', 'vegetal', 'fruto'),
      ('Banana', 'fruta', 'tropical'),
      ('Pão francês', 'carboidrato', 'padaria'),
      ('Leite integral', 'proteina', 'lácteo'),
      ('Queijo minas', 'proteina', 'lácteo'),
      ('Brócolis cozido', 'vegetal', 'crucífero'),
      ('Cenoura crua', 'vegetal', 'raiz'),
      ('Laranja', 'fruta', 'cítrica'),
      ('Aveia', 'carboidrato', 'cereal'),
      ('Macarrão cozido', 'carboidrato', 'massa'),
      ('Cebola', 'vegetal', 'bulbo'),
      ('Abobrinha', 'vegetal', 'fruto'),
      ('Mamão', 'fruta', 'tropical')
    ) AS novos(nome, categoria, subcategoria)
    WHERE NOT EXISTS (
      SELECT 1 FROM public.alimentos_completos a 
      WHERE a.nome ILIKE novos.nome
    );
  $SQL$;

  --------------------------------------------------------------------
  -- 4) GERAÇÃO DE RECEITAS MODELO
  --------------------------------------------------------------------
  
  -- ALMOÇOS (Prato Feito Brasileiro)
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
      650 AS kcal_estimado
    FROM generate_series(1,200) s
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
    FROM generate_series(1,150) s
    CROSS JOIN LATERAL (SELECT * FROM public.pool_proteina ORDER BY random() LIMIT 1) p
    CROSS JOIN LATERAL (SELECT * FROM public.pool_carbo    ORDER BY random() LIMIT 1) c
    CROSS JOIN LATERAL (SELECT * FROM public.pool_legume   ORDER BY random() LIMIT 1) l
    ON CONFLICT (hash) DO NOTHING;
  $SQL$;

  -- CAFÉS DA MANHÃ
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
      380 AS kcal_estimado
    FROM generate_series(1,100) s
    CROSS JOIN LATERAL (SELECT * FROM public.pool_padaria  ORDER BY random() LIMIT 1) pad
    CROSS JOIN LATERAL (SELECT * FROM public.pool_proteina ORDER BY random() LIMIT 1) prot
    CROSS JOIN LATERAL (SELECT * FROM public.pool_fruta    ORDER BY random() LIMIT 1) fru
    ON CONFLICT (hash) DO NOTHING;
  $SQL$;

  -- LANCHES
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
      280 AS kcal_estimado
    FROM generate_series(1,80) s
    CROSS JOIN LATERAL (SELECT * FROM public.pool_fruta    ORDER BY random() LIMIT 1) fru
    CROSS JOIN LATERAL (SELECT * FROM public.pool_proteina ORDER BY random() LIMIT 1) prot
    ON CONFLICT (hash) DO NOTHING;
  $SQL$;

  -- CEIAS
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
      220 AS kcal_estimado
    FROM generate_series(1,60) s
    CROSS JOIN LATERAL (SELECT * FROM public.pool_proteina ORDER BY random() LIMIT 1) prot
    CROSS JOIN LATERAL (SELECT * FROM public.pool_fruta    ORDER BY random() LIMIT 1) fru
    ON CONFLICT (hash) DO NOTHING;
  $SQL$;

  -- Enable RLS e Policy pública
  ALTER TABLE public.receitas_modelo ENABLE ROW LEVEL SECURITY;
  
  CREATE POLICY "receitas_modelo_select_all" ON public.receitas_modelo
    FOR SELECT USING (true);

  --------------------------------------------------------------------
  -- 5) LOG DE RESULTADO
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