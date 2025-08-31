-- Permitir que a service role insira registros em sofia_conversations (fluxos de funções sem JWT do usuário)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname='public' AND tablename='sofia_conversations' AND policyname='sofia_conversations_service_insert'
  ) THEN
    CREATE POLICY sofia_conversations_service_insert ON public.sofia_conversations
      FOR INSERT TO anon, authenticated
      WITH CHECK (
        current_setting('request.jwt.claims', true)::jsonb ->> 'role' = 'service_role'
      );
  END IF;
END $$;


