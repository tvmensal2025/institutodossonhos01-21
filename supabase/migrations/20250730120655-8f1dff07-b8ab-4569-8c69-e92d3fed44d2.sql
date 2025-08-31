-- Corrigir funções com search_path inadequado para melhorar segurança

-- 1. Atualizar função calculate_imc com search_path
CREATE OR REPLACE FUNCTION public.calculate_imc()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
DECLARE
  user_altura DECIMAL(5,2);
BEGIN
  -- Buscar altura do usuário
  SELECT altura_cm INTO user_altura 
  FROM user_physical_data 
  WHERE user_id = NEW.user_id;
  
  -- Se não encontrou altura, não calcula IMC
  IF user_altura IS NULL THEN
    RETURN NEW;
  END IF;
  
  -- Calcular IMC: peso / (altura/100)²
  NEW.imc = NEW.peso_kg / POWER(user_altura / 100, 2);
  
  -- Calcular risco metabólico baseado no IMC
  IF NEW.imc < 18.5 THEN
    NEW.risco_metabolico = 'baixo_peso';
  ELSIF NEW.imc >= 18.5 AND NEW.imc < 25 THEN
    NEW.risco_metabolico = 'normal';
  ELSIF NEW.imc >= 25 AND NEW.imc < 30 THEN
    NEW.risco_metabolico = 'sobrepeso';
  ELSIF NEW.imc >= 30 AND NEW.imc < 35 THEN
    NEW.risco_metabolico = 'obesidade_grau1';
  ELSIF NEW.imc >= 35 AND NEW.imc < 40 THEN
    NEW.risco_metabolico = 'obesidade_grau2';
  ELSE
    NEW.risco_metabolico = 'obesidade_grau3';
  END IF;
  
  RETURN NEW;
END;
$function$;

-- 2. Atualizar função update_updated_at_column com search_path
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$;

-- 3. Atualizar função calculate_heart_rate_zones com search_path
CREATE OR REPLACE FUNCTION public.calculate_heart_rate_zones(age integer, resting_hr integer DEFAULT 60)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
DECLARE
  max_hr INTEGER;
  zone1_min INTEGER;
  zone1_max INTEGER;
  zone2_min INTEGER;
  zone2_max INTEGER;
  zone3_min INTEGER;
  zone3_max INTEGER;
  zone4_min INTEGER;
  zone4_max INTEGER;
  zone5_min INTEGER;
  zone5_max INTEGER;
BEGIN
  -- Calcular frequência cardíaca máxima
  max_hr := 220 - age;
  
  -- Calcular zonas usando método de Karvonen
  zone1_min := resting_hr + ((max_hr - resting_hr) * 0.50)::INTEGER;
  zone1_max := resting_hr + ((max_hr - resting_hr) * 0.60)::INTEGER;
  
  zone2_min := resting_hr + ((max_hr - resting_hr) * 0.60)::INTEGER;
  zone2_max := resting_hr + ((max_hr - resting_hr) * 0.70)::INTEGER;
  
  zone3_min := resting_hr + ((max_hr - resting_hr) * 0.70)::INTEGER;
  zone3_max := resting_hr + ((max_hr - resting_hr) * 0.80)::INTEGER;
  
  zone4_min := resting_hr + ((max_hr - resting_hr) * 0.80)::INTEGER;
  zone4_max := resting_hr + ((max_hr - resting_hr) * 0.90)::INTEGER;
  
  zone5_min := resting_hr + ((max_hr - resting_hr) * 0.90)::INTEGER;
  zone5_max := max_hr;
  
  RETURN jsonb_build_object(
    'max_hr', max_hr,
    'resting_hr', resting_hr,
    'zone1', jsonb_build_object('name', 'Recuperação', 'min', zone1_min, 'max', zone1_max, 'color', '#4CAF50'),
    'zone2', jsonb_build_object('name', 'Base Aeróbica', 'min', zone2_min, 'max', zone2_max, 'color', '#2196F3'),
    'zone3', jsonb_build_object('name', 'Aeróbico', 'min', zone3_min, 'max', zone3_max, 'color', '#FF9800'),
    'zone4', jsonb_build_object('name', 'Limiar', 'min', zone4_min, 'max', zone4_max, 'color', '#FF5722'),
    'zone5', jsonb_build_object('name', 'Neuromuscular', 'min', zone5_min, 'max', zone5_max, 'color', '#F44336')
  );
END;
$function$;

-- 4. Atualizar função auto_calculate_heart_zones com search_path
CREATE OR REPLACE FUNCTION public.auto_calculate_heart_zones()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
DECLARE
  user_age INTEGER;
  avg_resting_hr INTEGER;
  zones JSONB;
BEGIN
  -- Buscar idade do usuário
  SELECT age INTO user_age FROM public.profiles WHERE user_id = NEW.user_id;
  
  -- Calcular FC de repouso média dos últimos dados
  SELECT AVG(heart_rate_bpm)::INTEGER INTO avg_resting_hr
  FROM public.heart_rate_data 
  WHERE user_id = NEW.user_id 
    AND activity_type = 'rest' 
    AND recorded_at >= NOW() - INTERVAL '30 days';
  
  -- Se não tem dados de repouso, usar padrão
  IF avg_resting_hr IS NULL THEN
    avg_resting_hr := 60;
  END IF;
  
  -- Calcular zonas
  IF user_age IS NOT NULL THEN
    zones := calculate_heart_rate_zones(user_age, avg_resting_hr);
    NEW.zones := zones;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- 5. Atualizar função sync_device_data com search_path
CREATE OR REPLACE FUNCTION public.sync_device_data(p_user_id uuid, p_integration_name character varying, p_device_type character varying, p_data jsonb)
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
DECLARE
  records_inserted INTEGER := 0;
  data_record JSONB;
BEGIN
  -- Log início da sincronização
  INSERT INTO public.device_sync_log (user_id, integration_name, device_type, sync_type, sync_status)
  VALUES (p_user_id, p_integration_name, p_device_type, 'heart_rate', 'pending');
  
  -- Processar dados de frequência cardíaca
  IF p_data ? 'heart_rate_data' THEN
    FOR data_record IN SELECT * FROM jsonb_array_elements(p_data->'heart_rate_data')
    LOOP
      INSERT INTO public.heart_rate_data (
        user_id, heart_rate_bpm, device_type, device_model, activity_type, recorded_at
      ) VALUES (
        p_user_id,
        (data_record->>'heart_rate')::INTEGER,
        p_device_type,
        data_record->>'device_model',
        COALESCE(data_record->>'activity_type', 'activity'),
        (data_record->>'timestamp')::TIMESTAMP WITH TIME ZONE
      )
      ON CONFLICT DO NOTHING;
      
      records_inserted := records_inserted + 1;
    END LOOP;
  END IF;
  
  -- Atualizar log de sincronização
  UPDATE public.device_sync_log 
  SET records_synced = records_inserted, sync_status = 'success'
  WHERE user_id = p_user_id 
    AND integration_name = p_integration_name 
    AND synced_at = (SELECT MAX(synced_at) FROM public.device_sync_log WHERE user_id = p_user_id);
  
  RETURN records_inserted;
END;
$function$;

-- 6. Atualizar função generate_weekly_analysis com search_path
CREATE OR REPLACE FUNCTION public.generate_weekly_analysis()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
DECLARE
  v_semana_inicio DATE;
  v_semana_fim DATE;
  v_peso_inicial DECIMAL(5,2);
  v_peso_final DECIMAL(5,2);
  v_variacao_peso DECIMAL(5,2);
BEGIN
  -- Definir semana (segunda a domingo)
  v_semana_inicio = DATE_TRUNC('week', NEW.measurement_date)::DATE;
  v_semana_fim = v_semana_inicio + INTERVAL '6 days';
  
  -- Buscar primeira pesagem da semana
  SELECT peso_kg INTO v_peso_inicial
  FROM weight_measurements
  WHERE user_id = NEW.user_id 
    AND measurement_date >= v_semana_inicio 
    AND measurement_date <= v_semana_fim
  ORDER BY measurement_date ASC
  LIMIT 1;
  
  -- Última pesagem da semana
  v_peso_final = NEW.peso_kg;
  
  -- Calcular variação
  v_variacao_peso = v_peso_final - COALESCE(v_peso_inicial, v_peso_final);
  
  -- Inserir ou atualizar análise semanal
  INSERT INTO weekly_analyses (
    user_id, semana_inicio, semana_fim, 
    peso_inicial, peso_final, variacao_peso,
    tendencia
  ) VALUES (
    NEW.user_id, v_semana_inicio, v_semana_fim,
    v_peso_inicial, v_peso_final, v_variacao_peso,
    CASE 
      WHEN v_variacao_peso < -0.1 THEN 'diminuindo'
      WHEN v_variacao_peso > 0.1 THEN 'aumentando'
      ELSE 'estavel'
    END
  )
  ON CONFLICT (user_id, semana_inicio) 
  DO UPDATE SET
    peso_final = EXCLUDED.peso_final,
    variacao_peso = EXCLUDED.variacao_peso,
    tendencia = EXCLUDED.tendencia;
  
  RETURN NEW;
END;
$function$;