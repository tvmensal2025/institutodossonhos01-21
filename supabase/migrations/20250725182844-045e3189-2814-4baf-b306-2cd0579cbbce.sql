-- Criar sistema completo de sessões e sabotadores customizados

-- Tabela de sabotadores customizados
CREATE TABLE public.custom_saboteurs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  characteristics TEXT[] DEFAULT '{}',
  impact TEXT,
  strategies TEXT[] DEFAULT '{}',
  color TEXT DEFAULT 'text-gray-600',
  icon TEXT DEFAULT 'User',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_active BOOLEAN DEFAULT true
);

-- Tabela de relacionamento usuário-sabotador
CREATE TABLE public.user_custom_saboteurs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  saboteur_id UUID REFERENCES public.custom_saboteurs(id) ON DELETE CASCADE,
  score INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de sessões criadas pelos admins
CREATE TABLE public.sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT DEFAULT 'saboteur_work',
  content JSONB DEFAULT '{}',
  target_saboteurs TEXT[] DEFAULT '{}',
  difficulty TEXT DEFAULT 'beginner',
  estimated_time INTEGER DEFAULT 30,
  materials_needed TEXT[] DEFAULT '{}',
  follow_up_questions TEXT[] DEFAULT '{}',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_active BOOLEAN DEFAULT true
);

-- Tabela de sessões atribuídas aos usuários
CREATE TABLE public.user_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES public.sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  status TEXT DEFAULT 'pending',
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  due_date TIMESTAMP WITH TIME ZONE,
  progress INTEGER DEFAULT 0,
  feedback TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.custom_saboteurs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_custom_saboteurs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;

-- Políticas para custom_saboteurs
CREATE POLICY "Admins can manage custom saboteurs" 
ON public.custom_saboteurs 
FOR ALL 
USING (is_admin_user());

CREATE POLICY "Users can view active custom saboteurs" 
ON public.custom_saboteurs 
FOR SELECT 
USING (is_active = true);

-- Políticas para user_custom_saboteurs
CREATE POLICY "Users can manage their own saboteur relationships" 
ON public.user_custom_saboteurs 
FOR ALL 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all saboteur relationships" 
ON public.user_custom_saboteurs 
FOR SELECT 
USING (is_admin_user());

-- Políticas para sessions
CREATE POLICY "Admins can manage sessions" 
ON public.sessions 
FOR ALL 
USING (is_admin_user());

CREATE POLICY "Users can view active sessions" 
ON public.sessions 
FOR SELECT 
USING (is_active = true);

-- Políticas para user_sessions
CREATE POLICY "Users can view their own sessions" 
ON public.user_sessions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own sessions" 
ON public.user_sessions 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all user sessions" 
ON public.user_sessions 
FOR ALL 
USING (is_admin_user());

-- Triggers para updated_at
CREATE TRIGGER update_custom_saboteurs_updated_at
BEFORE UPDATE ON public.custom_saboteurs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_sessions_updated_at
BEFORE UPDATE ON public.sessions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_sessions_updated_at
BEFORE UPDATE ON public.user_sessions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Índices para performance
CREATE INDEX idx_custom_saboteurs_active ON public.custom_saboteurs(is_active);
CREATE INDEX idx_custom_saboteurs_created_by ON public.custom_saboteurs(created_by);
CREATE INDEX idx_user_custom_saboteurs_user_id ON public.user_custom_saboteurs(user_id);
CREATE INDEX idx_sessions_active ON public.sessions(is_active);
CREATE INDEX idx_sessions_created_by ON public.sessions(created_by);
CREATE INDEX idx_user_sessions_user_id ON public.user_sessions(user_id);
CREATE INDEX idx_user_sessions_status ON public.user_sessions(status);