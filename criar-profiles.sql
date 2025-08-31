-- ========================================
-- CRIAR TABELA PROFILES
-- ========================================

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name VARCHAR(255),
  email VARCHAR(255),
  role VARCHAR(50) DEFAULT 'user',
  points INTEGER DEFAULT 0,
  avatar_url TEXT,
  phone VARCHAR(20),
  birth_date DATE,
  city VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- HABILITAR RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- CRIAR POLÍTICAS RLS
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- INSERIR PERFIL DO USUÁRIO DE TESTE
INSERT INTO public.profiles (
  user_id,
  full_name,
  email,
  role,
  points
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  'Usuário Teste',
  'teste@institutodossonhos.com',
  'user',
  0
) ON CONFLICT (user_id) DO NOTHING;

SELECT '✅ TABELA PROFILES CRIADA!' as status;
SELECT COUNT(*) as total_profiles FROM public.profiles; 