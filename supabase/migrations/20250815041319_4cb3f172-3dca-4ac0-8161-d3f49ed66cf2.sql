-- Corrigir a função para usar os nomes corretos das colunas da TACO
CREATE OR REPLACE FUNCTION public.fn_calcular_receita_nutricao(receita_uuid uuid)
RETURNS TABLE (
  total_kcal numeric,
  total_protein_g numeric,
  total_carbs_g numeric,
  total_fat_g numeric,
  total_fiber_g numeric,
  total_grams numeric
) LANGUAGE sql STABLE AS $$
  WITH receita_nutricao AS (
    SELECT 
      SUM((ri.quantidade_gramas / 100.0) * tf.energia_kcal) as kcal,
      SUM((ri.quantidade_gramas / 100.0) * tf.proteina_g) as protein_g,
      SUM((ri.quantidade_gramas / 100.0) * tf.carboidratos_g) as carbs_g,
      SUM((ri.quantidade_gramas / 100.0) * tf.lipidios_g) as fat_g,
      SUM((ri.quantidade_gramas / 100.0) * COALESCE(tf.fibra_alimentar_g, 0)) as fiber_g,
      SUM(ri.quantidade_gramas) as total_grams
    FROM receita_itens ri
    JOIN taco_foods tf ON tf.numero_alimento = ri.numero_taco
    WHERE ri.receita_id = receita_uuid
  )
  SELECT 
    COALESCE(rn.kcal, 0) as total_kcal,
    COALESCE(rn.protein_g, 0) as total_protein_g,
    COALESCE(rn.carbs_g, 0) as total_carbs_g,
    COALESCE(rn.fat_g, 0) as total_fat_g,
    COALESCE(rn.fiber_g, 0) as total_fiber_g,
    COALESCE(rn.total_grams, 0) as total_grams
  FROM receita_nutricao rn;
$$;