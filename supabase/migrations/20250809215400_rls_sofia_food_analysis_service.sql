-- Permitir que a service role insira e atualize registros em sofia_food_analysis (fluxos de funções sem JWT do usuário)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname='public' AND tablename='sofia_food_analysis' AND policyname='sofia_food_analysis_service_insert'
  ) THEN
    CREATE POLICY sofia_food_analysis_service_insert ON public.sofia_food_analysis
      FOR INSERT TO anon, authenticated
      WITH CHECK (
        current_setting('request.jwt.claims', true)::jsonb ->> 'role' = 'service_role'
      );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname='public' AND tablename='sofia_food_analysis' AND policyname='sofia_food_analysis_service_update'
  ) THEN
    CREATE POLICY sofia_food_analysis_service_update ON public.sofia_food_analysis
      FOR UPDATE TO anon, authenticated
      USING (
        current_setting('request.jwt.claims', true)::jsonb ->> 'role' = 'service_role'
      );
  END IF;
END $$;
