-- Migração corrigida - apenas adicionar o que não existe

-- 1. Verificar e criar tabela user_custom_saboteurs se não existir
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'user_custom_saboteurs') THEN
        CREATE TABLE public.user_custom_saboteurs (
          id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
          user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
          saboteur_id UUID NOT NULL REFERENCES public.custom_saboteurs(id) ON DELETE CASCADE,
          severity_level INTEGER DEFAULT 1 CHECK (severity_level >= 1 AND severity_level <= 10),
          identified_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
          strategies_used TEXT[],
          progress_notes TEXT,
          is_active BOOLEAN DEFAULT true,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
          UNIQUE(user_id, saboteur_id)
        );
        
        ALTER TABLE public.user_custom_saboteurs ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY "Users can view their own custom saboteurs" ON public.user_custom_saboteurs
          FOR SELECT USING (auth.uid() = user_id);
        CREATE POLICY "Users can create their own custom saboteur records" ON public.user_custom_saboteurs
          FOR INSERT WITH CHECK (auth.uid() = user_id);
        CREATE POLICY "Users can update their own custom saboteur records" ON public.user_custom_saboteurs
          FOR UPDATE USING (auth.uid() = user_id);
          
        CREATE INDEX idx_user_custom_saboteurs_user_id ON public.user_custom_saboteurs(user_id);
        
        CREATE TRIGGER update_user_custom_saboteurs_updated_at
          BEFORE UPDATE ON public.user_custom_saboteurs
          FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
    END IF;
END $$;

-- 2. Adicionar colunas faltantes na tabela sessions
ALTER TABLE public.sessions ADD COLUMN IF NOT EXISTS target_saboteurs TEXT[] DEFAULT '{}';
ALTER TABLE public.sessions ADD COLUMN IF NOT EXISTS tools TEXT[] DEFAULT '{}';
ALTER TABLE public.sessions ADD COLUMN IF NOT EXISTS difficulty TEXT DEFAULT 'beginner';
ALTER TABLE public.sessions ADD COLUMN IF NOT EXISTS estimated_time INTEGER DEFAULT 30;

-- 3. Adicionar colunas faltantes em user_goals para funcionalidade admin
ALTER TABLE public.user_goals ADD COLUMN IF NOT EXISTS admin_notes TEXT;
ALTER TABLE public.user_goals ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.user_goals ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES auth.users(id);
ALTER TABLE public.user_goals ADD COLUMN IF NOT EXISTS final_points INTEGER DEFAULT 0;

-- 4. Verificar e criar tabela course_progress se não existir  
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'course_progress') THEN
        CREATE TABLE public.course_progress (
          id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
          user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
          course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
          lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE,
          progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
          completed_at TIMESTAMP WITH TIME ZONE,
          started_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
          time_spent_minutes INTEGER DEFAULT 0,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
          UNIQUE(user_id, course_id, lesson_id)
        );
        
        ALTER TABLE public.course_progress ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY "Users can view their own course progress" ON public.course_progress
          FOR SELECT USING (auth.uid() = user_id);
        CREATE POLICY "Users can create their own course progress" ON public.course_progress
          FOR INSERT WITH CHECK (auth.uid() = user_id);
        CREATE POLICY "Users can update their own course progress" ON public.course_progress
          FOR UPDATE USING (auth.uid() = user_id);
          
        CREATE INDEX idx_course_progress_user_id ON public.course_progress(user_id);
        
        CREATE TRIGGER update_course_progress_updated_at
          BEFORE UPDATE ON public.course_progress
          FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
    END IF;
END $$;

-- 5. Verificar e criar tabela intelligent_notifications se não existir
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'intelligent_notifications') THEN
        CREATE TABLE public.intelligent_notifications (
          id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
          user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
          title TEXT NOT NULL,
          message TEXT NOT NULL,
          category TEXT DEFAULT 'general',
          priority INTEGER DEFAULT 1 CHECK (priority >= 1 AND priority <= 5),
          is_read BOOLEAN DEFAULT false,
          scheduled_for TIMESTAMP WITH TIME ZONE,
          sent_at TIMESTAMP WITH TIME ZONE,
          action_url TEXT,
          metadata JSONB DEFAULT '{}',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
        );
        
        ALTER TABLE public.intelligent_notifications ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY "Users can view their own notifications" ON public.intelligent_notifications
          FOR SELECT USING (auth.uid() = user_id);
        CREATE POLICY "System can create notifications for users" ON public.intelligent_notifications
          FOR INSERT WITH CHECK (true);
        CREATE POLICY "Users can update their own notifications" ON public.intelligent_notifications
          FOR UPDATE USING (auth.uid() = user_id);
          
        CREATE INDEX idx_intelligent_notifications_user_id ON public.intelligent_notifications(user_id);
        CREATE INDEX idx_intelligent_notifications_category ON public.intelligent_notifications(category);
        CREATE INDEX idx_intelligent_notifications_is_read ON public.intelligent_notifications(is_read);
    END IF;
END $$;