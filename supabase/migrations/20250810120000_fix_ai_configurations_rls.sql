-- Ajuste RLS: permitir INSERT/UPDATE/DELETE/SELECT para admins na tabela ai_configurations
-- Evita erro 42501: "new row violates row-level security policy for table ai_configurations"

-- Garantir RLS habilitado
ALTER TABLE public.ai_configurations ENABLE ROW LEVEL SECURITY;

-- Substituir a política para incluir WITH CHECK (necessário para INSERT/UPDATE)
DROP POLICY IF EXISTS "Admins manage AI configurations" ON public.ai_configurations;
CREATE POLICY "Admins manage AI configurations" ON public.ai_configurations
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.user_id = auth.uid()
        AND p.role IN ('admin','owner')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.user_id = auth.uid()
        AND p.role IN ('admin','owner')
    )
  );

-- Opcional: leitura pública (se necessário para telas somente leitura)
-- DROP POLICY IF EXISTS "Public read ai configurations" ON public.ai_configurations;
-- CREATE POLICY "Public read ai configurations" ON public.ai_configurations
--   FOR SELECT TO authenticated USING (true);





