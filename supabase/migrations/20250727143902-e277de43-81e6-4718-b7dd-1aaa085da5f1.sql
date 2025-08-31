-- Corrigir problemas de segurança identificados pelo Supabase Linter

-- 1. Corrigir Function Search Path Mutable para todas as funções existentes
-- Atualizar função handle_new_user_profile
CREATE OR REPLACE FUNCTION public.handle_new_user_profile()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, email)
  VALUES (
    NEW.id, 
    NEW.raw_user_meta_data ->> 'full_name',
    NEW.email
  );
  RETURN NEW;
END;
$function$;

-- Atualizar função is_admin_user
CREATE OR REPLACE FUNCTION public.is_admin_user()
 RETURNS boolean
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path = 'public'
AS $function$
BEGIN
  -- Por enquanto, qualquer usuário autenticado pode criar desafios
  -- Em produção, adicionar lógica de verificação de role de admin
  RETURN auth.uid() IS NOT NULL;
END;
$function$;

-- Atualizar função get_user_display_name
CREATE OR REPLACE FUNCTION public.get_user_display_name(user_uuid uuid)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
DECLARE
    display_name TEXT;
BEGIN
    -- Tentar buscar da tabela user_profiles primeiro
    SELECT full_name INTO display_name 
    FROM user_profiles 
    WHERE user_id = user_uuid 
    AND full_name IS NOT NULL;
    
    -- Se não encontrou, tentar na tabela profiles
    IF display_name IS NULL THEN
        SELECT full_name INTO display_name 
        FROM profiles 
        WHERE user_id = user_uuid 
        AND full_name IS NOT NULL;
    END IF;
    
    -- Se ainda não encontrou, usar uma parte do UUID
    IF display_name IS NULL THEN
        display_name := 'Usuário ' || SUBSTRING(user_uuid::TEXT FROM 1 FOR 8);
    END IF;
    
    RETURN display_name;
END;
$function$;

-- Atualizar função auto_update_user_name
CREATE OR REPLACE FUNCTION public.auto_update_user_name()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = 'public'
AS $function$
BEGIN
    NEW.user_name := get_user_display_name(NEW.user_id);
    RETURN NEW;
END;
$function$;

-- Atualizar função notify_user_on_session_assignment
CREATE OR REPLACE FUNCTION public.notify_user_on_session_assignment()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = 'public'
AS $function$
BEGIN
  -- Inserir notificação inteligente quando uma sessão é atribuída
  INSERT INTO smart_notifications (
    user_id,
    title,
    message,
    type,
    category,
    priority,
    trigger_conditions,
    is_active
  ) VALUES (
    NEW.user_id,
    'Nova Sessão Disponível! 🎯',
    'Uma nova sessão foi atribuída para você. Clique para começar seu desenvolvimento pessoal.',
    'session_assignment',
    'sessions',
    'high',
    jsonb_build_object('session_id', NEW.session_id),
    true
  );
  
  RETURN NEW;
END;
$function$;

-- Atualizar função generate_weekly_analysis
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

-- Atualizar função notify_user_on_session_completion
CREATE OR REPLACE FUNCTION public.notify_user_on_session_completion()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = 'public'
AS $function$
BEGIN
  -- Verificar se o status mudou para completed
  IF OLD.status != 'completed' AND NEW.status = 'completed' THEN
    INSERT INTO smart_notifications (
      user_id,
      title,
      message,
      type,
      category,
      priority,
      trigger_conditions,
      is_active
    ) VALUES (
      NEW.user_id,
      'Sessão Completa! 🎉',
      'Parabéns! Você concluiu uma sessão e deu mais um passo no seu desenvolvimento pessoal.',
      'session_completion',
      'achievement',
      'medium',
      jsonb_build_object('session_id', NEW.session_id, 'completion_date', NEW.completed_at),
      true
    );
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Criar tabela para configurações de sistema (para credenciais admin)
CREATE TABLE IF NOT EXISTS public.system_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  config_key TEXT UNIQUE NOT NULL,
  config_value TEXT NOT NULL,
  is_encrypted BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Habilitar RLS na tabela system_config
ALTER TABLE public.system_config ENABLE ROW LEVEL SECURITY;

-- Política para admin acessar configurações
CREATE POLICY "Admins can manage system config" ON public.system_config
  FOR ALL
  USING (is_admin_user());

-- Inserir configuração de admin (temporária - deve ser movida para secrets)
INSERT INTO public.system_config (config_key, config_value, is_encrypted) 
VALUES 
  ('admin_email', 'admin@institutodossonhos.com.br', false),
  ('admin_password_hash', '$2b$10$dummy_hash_placeholder', true)
ON CONFLICT (config_key) DO NOTHING;