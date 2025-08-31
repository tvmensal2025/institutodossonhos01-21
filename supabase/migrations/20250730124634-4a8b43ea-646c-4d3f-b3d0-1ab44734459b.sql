-- CRIAR TABELA USER_GOALS E CORRIGIR POLÍTICAS RLS

-- 1. Criar tabela user_goals
CREATE TABLE IF NOT EXISTS public.user_goals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  target_value DECIMAL(10,2) NOT NULL DEFAULT 1,
  current_value DECIMAL(10,2) NOT NULL DEFAULT 0,
  unit TEXT NOT NULL DEFAULT 'unidade',
  difficulty TEXT NOT NULL DEFAULT 'medio',
  target_date DATE,
  status TEXT NOT NULL DEFAULT 'pendente',
  estimated_points INTEGER NOT NULL DEFAULT 100,
  challenge_id UUID REFERENCES public.challenges(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- 2. Habilitar RLS
ALTER TABLE public.user_goals ENABLE ROW LEVEL SECURITY;

-- 3. Criar políticas RLS
CREATE POLICY "Users can view their own goals" 
ON public.user_goals 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own goals" 
ON public.user_goals 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own goals" 
ON public.user_goals 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own goals" 
ON public.user_goals 
FOR DELETE 
USING (auth.uid() = user_id);

-- 4. Criar trigger para updated_at
CREATE TRIGGER update_user_goals_updated_at
  BEFORE UPDATE ON public.user_goals
  FOR EACH ROW
  EXECUTE FUNCTION public.update_user_goals_updated_at();

-- 5. Corrigir políticas da tabela course_lessons para permitir operações CRUD
DROP POLICY IF EXISTS "Admins can manage course lessons" ON public.course_lessons;

CREATE POLICY "Admins can manage course lessons" 
ON public.course_lessons 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE users.id = auth.uid() 
    AND (
      users.email = 'admin@institutodossonhos.com.br' 
      OR users.email = 'teste@institutodossonhos.com'
      OR users.email = 'contato@rafael-dias.com'
      OR users.raw_user_meta_data->>'role' = 'admin'
    )
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE users.id = auth.uid() 
    AND (
      users.email = 'admin@institutodossonhos.com.br' 
      OR users.email = 'teste@institutodossonhos.com'
      OR users.email = 'contato@rafael-dias.com'
      OR users.raw_user_meta_data->>'role' = 'admin'
    )
  )
);

-- 6. Permitir que todos vejam course_lessons
CREATE POLICY "Everyone can view course lessons" 
ON public.course_lessons 
FOR SELECT 
USING (true);