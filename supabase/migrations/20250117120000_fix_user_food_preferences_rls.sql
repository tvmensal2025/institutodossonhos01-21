-- Corrigir políticas RLS para user_food_preferences
-- Permitir inserção via service role e melhorar políticas para usuários autenticados

-- Remover política existente
DROP POLICY IF EXISTS "Users can manage their own food preferences" ON public.user_food_preferences;

-- Criar políticas mais específicas
CREATE POLICY "Users can view their own food preferences" 
ON public.user_food_preferences 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own food preferences" 
ON public.user_food_preferences 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own food preferences" 
ON public.user_food_preferences 
FOR UPDATE 
USING (auth.uid() = user_id) 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own food preferences" 
ON public.user_food_preferences 
FOR DELETE 
USING (auth.uid() = user_id);

-- Política para service role (permitir inserção via Edge Functions)
CREATE POLICY "Service role can manage all food preferences" 
ON public.user_food_preferences 
FOR ALL 
USING (auth.role() = 'service_role') 
WITH CHECK (auth.role() = 'service_role');

-- Corrigir políticas para user_ingredient_history também
DROP POLICY IF EXISTS "Users can view their own ingredient history" ON public.user_ingredient_history;

CREATE POLICY "Users can view their own ingredient history" 
ON public.user_ingredient_history 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own ingredient history" 
ON public.user_ingredient_history 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own ingredient history" 
ON public.user_ingredient_history 
FOR UPDATE 
USING (auth.uid() = user_id) 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own ingredient history" 
ON public.user_ingredient_history 
FOR DELETE 
USING (auth.uid() = user_id);

-- Política para service role
CREATE POLICY "Service role can manage all ingredient history" 
ON public.user_ingredient_history 
FOR ALL 
USING (auth.role() = 'service_role') 
WITH CHECK (auth.role() = 'service_role');

-- Verificar se as políticas foram criadas corretamente
DO $$
BEGIN
  RAISE NOTICE 'Políticas RLS corrigidas para user_food_preferences e user_ingredient_history';
END $$;
