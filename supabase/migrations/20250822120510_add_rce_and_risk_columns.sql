-- Ensure columns RCE and risco_cardiometabolico exist on weight_measurements
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='weight_measurements' AND column_name='rce'
  ) THEN
    ALTER TABLE public.weight_measurements ADD COLUMN rce DECIMAL(6,3);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='weight_measurements' AND column_name='risco_cardiometabolico'
  ) THEN
    ALTER TABLE public.weight_measurements ADD COLUMN risco_cardiometabolico TEXT;
  END IF;
END $$;

-- CORREÇÃO: Aplicar limites realistas aos dados existentes
UPDATE public.weight_measurements 
SET gordura_corporal_percent = GREATEST(5, LEAST(50, gordura_corporal_percent))
WHERE gordura_corporal_percent IS NOT NULL 
  AND (gordura_corporal_percent < 5 OR gordura_corporal_percent > 50);

UPDATE public.weight_measurements 
SET agua_corporal_percent = GREATEST(40, LEAST(70, agua_corporal_percent))
WHERE agua_corporal_percent IS NOT NULL 
  AND (agua_corporal_percent < 40 OR agua_corporal_percent > 70);

-- CORREÇÃO: Verificar e corrigir dados de altura incorretos
UPDATE public.user_physical_data 
SET altura_cm = 165.0
WHERE altura_cm IS NOT NULL 
  AND (altura_cm < 100 OR altura_cm > 250);

-- CORREÇÃO: Recalcular IMC para garantir valores corretos
UPDATE public.weight_measurements wm
SET imc = (
  SELECT ROUND((wm.peso_kg / POWER(upd.altura_cm / 100, 2))::NUMERIC, 2)
  FROM public.user_physical_data upd
  WHERE upd.user_id = wm.user_id
)
WHERE EXISTS (
  SELECT 1 FROM public.user_physical_data upd
  WHERE upd.user_id = wm.user_id 
    AND upd.altura_cm IS NOT NULL 
    AND upd.altura_cm > 0
);

-- CORREÇÃO: Atualizar classificação de risco metabólico baseada no IMC corrigido
UPDATE public.weight_measurements 
SET risco_metabolico = CASE
  WHEN imc < 18.5 THEN 'baixo_peso'
  WHEN imc < 25 THEN 'normal'
  WHEN imc < 30 THEN 'sobrepeso'
  WHEN imc < 35 THEN 'obesidade_grau1'
  WHEN imc < 40 THEN 'obesidade_grau2'
  ELSE 'obesidade_grau3'
END
WHERE imc IS NOT NULL;


