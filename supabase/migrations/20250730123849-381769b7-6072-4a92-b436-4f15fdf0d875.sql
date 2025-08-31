-- CORRIGIR TODOS OS PROBLEMAS DE CURSOS, DESAFIOS E METAS

-- 1. ADICIONAR COLUNAS FALTANTES EM CHALLENGES
ALTER TABLE challenges ADD COLUMN IF NOT EXISTS duration_days INTEGER DEFAULT 30;
ALTER TABLE challenges ADD COLUMN IF NOT EXISTS points_reward INTEGER DEFAULT 0;
ALTER TABLE challenges ADD COLUMN IF NOT EXISTS badge_icon TEXT DEFAULT '🏆';
ALTER TABLE challenges ADD COLUMN IF NOT EXISTS badge_name TEXT;
ALTER TABLE challenges ADD COLUMN IF NOT EXISTS instructions TEXT;
ALTER TABLE challenges ADD COLUMN IF NOT EXISTS tips TEXT[];
ALTER TABLE challenges ADD COLUMN IF NOT EXISTS daily_log_type TEXT DEFAULT 'simple';
ALTER TABLE challenges ADD COLUMN IF NOT EXISTS daily_log_target NUMERIC;
ALTER TABLE challenges ADD COLUMN IF NOT EXISTS daily_log_unit TEXT;
ALTER TABLE challenges ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;
ALTER TABLE challenges ADD COLUMN IF NOT EXISTS is_group_challenge BOOLEAN DEFAULT false;
ALTER TABLE challenges ADD COLUMN IF NOT EXISTS start_date DATE DEFAULT CURRENT_DATE;
ALTER TABLE challenges ADD COLUMN IF NOT EXISTS end_date DATE;
ALTER TABLE challenges ADD COLUMN IF NOT EXISTS max_participants INTEGER;
ALTER TABLE challenges ADD COLUMN IF NOT EXISTS entry_fee NUMERIC DEFAULT 0;

-- 2. ADICIONAR COLUNAS FALTANTES EM COURSES
ALTER TABLE courses ADD COLUMN IF NOT EXISTS tags TEXT[];
ALTER TABLE courses ADD COLUMN IF NOT EXISTS prerequisites TEXT[];
ALTER TABLE courses ADD COLUMN IF NOT EXISTS learning_outcomes TEXT[];
ALTER TABLE courses ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'draft';
ALTER TABLE courses ADD COLUMN IF NOT EXISTS enrollment_count INTEGER DEFAULT 0;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS rating NUMERIC DEFAULT 0;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS total_lessons INTEGER DEFAULT 0;

-- 3. ADICIONAR COLUNAS FALTANTES EM COURSE_LESSONS  
ALTER TABLE course_lessons ADD COLUMN IF NOT EXISTS lesson_type TEXT DEFAULT 'video';
ALTER TABLE course_lessons ADD COLUMN IF NOT EXISTS resources JSONB DEFAULT '[]';
ALTER TABLE course_lessons ADD COLUMN IF NOT EXISTS quiz_questions JSONB DEFAULT '[]';
ALTER TABLE course_lessons ADD COLUMN IF NOT EXISTS prerequisites TEXT[];

-- 4. CRIAR TABELA DE PROGRESSO DE CURSO SE NÃO EXISTIR
CREATE TABLE IF NOT EXISTS course_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    lesson_id UUID REFERENCES course_lessons(id) ON DELETE CASCADE,
    progress_percentage NUMERIC DEFAULT 0,
    completed BOOLEAN DEFAULT false,
    last_accessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, course_id, lesson_id)
);

-- 5. CRIAR TABELA DE CHALLENGE_DAILY_LOGS SE AS COLUNAS ESTÃO CORRETAS
ALTER TABLE challenge_daily_logs ADD COLUMN IF NOT EXISTS challenge_name TEXT;
ALTER TABLE challenge_daily_logs ADD COLUMN IF NOT EXISTS points_earned INTEGER DEFAULT 0;

-- 6. HABILITAR RLS NAS NOVAS TABELAS
ALTER TABLE course_progress ENABLE ROW LEVEL SECURITY;

-- 7. CRIAR POLÍTICAS RLS PARA COURSE_PROGRESS
CREATE POLICY "Users can view own course progress" ON course_progress
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own course progress" ON course_progress
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own course progress" ON course_progress
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all course progress" ON course_progress
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM auth.users 
        WHERE id = auth.uid() 
        AND (
            email = 'admin@institutodossonhos.com.br' OR
            email = 'teste@institutodossonhos.com' OR
            email = 'contato@rafael-dias.com' OR
            raw_user_meta_data->>'role' = 'admin'
        )
    )
);

-- 8. ADICIONAR FOREIGN KEYS FALTANTES
ALTER TABLE course_progress 
ADD CONSTRAINT fk_course_progress_user 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;