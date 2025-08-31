-- Create profiles table for user data
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  height DECIMAL(5,2), -- Height in cm
  target_weight DECIMAL(5,2), -- Target weight in kg
  current_weight DECIMAL(5,2), -- Current weight in kg
  age INTEGER,
  gender TEXT CHECK (gender IN ('male', 'female', 'other')),
  activity_level TEXT CHECK (activity_level IN ('sedentary', 'light', 'moderate', 'active', 'very_active')),
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create weighings table for weight measurements
CREATE TABLE public.weighings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  weight DECIMAL(5,2) NOT NULL, -- Weight in kg
  body_fat DECIMAL(5,2), -- Body fat percentage
  muscle_mass DECIMAL(5,2), -- Muscle mass in kg
  body_water DECIMAL(5,2), -- Body water percentage
  bone_mass DECIMAL(5,2), -- Bone mass in kg
  basal_metabolism INTEGER, -- Basal metabolism in kcal
  metabolic_age INTEGER, -- Metabolic age in years
  bmi DECIMAL(5,2), -- BMI calculated
  device_type TEXT DEFAULT 'xiaomi_scale', -- Device used for measurement
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create missions table for daily tasks
CREATE TABLE public.missions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  points INTEGER DEFAULT 0,
  category TEXT CHECK (category IN ('exercise', 'nutrition', 'mindset', 'hydration', 'sleep')),
  difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_missions table for tracking user mission progress
CREATE TABLE public.user_missions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mission_id UUID NOT NULL REFERENCES public.missions(id) ON DELETE CASCADE,
  completed_at TIMESTAMP WITH TIME ZONE,
  is_completed BOOLEAN DEFAULT false,
  date_assigned DATE NOT NULL DEFAULT CURRENT_DATE,
  UNIQUE(user_id, mission_id, date_assigned)
);

-- Create courses table for Netflix-style course platform
CREATE TABLE public.courses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  category TEXT,
  difficulty_level TEXT CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
  duration_minutes INTEGER,
  price DECIMAL(10,2) DEFAULT 0,
  is_premium BOOLEAN DEFAULT false,
  is_published BOOLEAN DEFAULT true,
  instructor_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create course_modules table for course structure
CREATE TABLE public.course_modules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create lessons table for individual lessons
CREATE TABLE public.lessons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  module_id UUID NOT NULL REFERENCES public.course_modules(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  video_url TEXT,
  duration_minutes INTEGER,
  order_index INTEGER NOT NULL,
  is_free BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_progress table for tracking course progress
CREATE TABLE public.user_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  completed_at TIMESTAMP WITH TIME ZONE,
  watch_time_seconds INTEGER DEFAULT 0,
  is_completed BOOLEAN DEFAULT false,
  UNIQUE(user_id, lesson_id)
);

-- Create health_diary table for daily health tracking
CREATE TABLE public.health_diary (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  mood_rating INTEGER CHECK (mood_rating >= 1 AND mood_rating <= 10),
  energy_level INTEGER CHECK (energy_level >= 1 AND energy_level <= 10),
  sleep_hours DECIMAL(3,1),
  water_intake DECIMAL(4,1), -- Water intake in liters
  exercise_minutes INTEGER,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, date)
);

-- Create assessments table for weekly evaluations
CREATE TABLE public.assessments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  week_start_date DATE NOT NULL,
  weight_change DECIMAL(5,2),
  goal_achievement_rating INTEGER CHECK (goal_achievement_rating >= 1 AND goal_achievement_rating <= 10),
  satisfaction_rating INTEGER CHECK (satisfaction_rating >= 1 AND satisfaction_rating <= 10),
  challenges_faced TEXT,
  improvements_noted TEXT,
  next_week_goals TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, week_start_date)
);

-- Enable Row Level Security on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weighings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_diary ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

-- Create RLS policies for weighings
CREATE POLICY "Users can view their own weighings" ON public.weighings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own weighings" ON public.weighings FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for missions (public read, admin write)
CREATE POLICY "Everyone can view missions" ON public.missions FOR SELECT USING (true);

-- Create RLS policies for user_missions
CREATE POLICY "Users can view their own missions" ON public.user_missions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own mission progress" ON public.user_missions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own mission progress" ON public.user_missions FOR UPDATE USING (auth.uid() = user_id);

-- Create RLS policies for courses (public read)
CREATE POLICY "Everyone can view published courses" ON public.courses FOR SELECT USING (is_published = true);
CREATE POLICY "Everyone can view course modules" ON public.course_modules FOR SELECT USING (true);
CREATE POLICY "Everyone can view lessons" ON public.lessons FOR SELECT USING (true);

-- Create RLS policies for user_progress
CREATE POLICY "Users can view their own progress" ON public.user_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own progress" ON public.user_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own progress" ON public.user_progress FOR UPDATE USING (auth.uid() = user_id);

-- Create RLS policies for health_diary
CREATE POLICY "Users can view their own diary" ON public.health_diary FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own diary entries" ON public.health_diary FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own diary entries" ON public.health_diary FOR UPDATE USING (auth.uid() = user_id);

-- Create RLS policies for assessments
CREATE POLICY "Users can view their own assessments" ON public.assessments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own assessments" ON public.assessments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own assessments" ON public.assessments FOR UPDATE USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for timestamp updates
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON public.courses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample missions
INSERT INTO public.missions (title, description, points, category, difficulty) VALUES
('Beber 2 litros de água', 'Hidrate-se adequadamente ao longo do dia', 10, 'hydration', 'easy'),
('Caminhar 30 minutos', 'Faça uma caminhada de pelo menos 30 minutos', 20, 'exercise', 'medium'),
('Meditar por 10 minutos', 'Pratique mindfulness por 10 minutos', 15, 'mindset', 'easy'),
('Comer 5 porções de frutas/vegetais', 'Consuma pelo menos 5 porções de frutas e vegetais', 25, 'nutrition', 'medium'),
('Dormir 8 horas', 'Tenha uma noite de sono reparador', 30, 'sleep', 'hard'),
('Fazer exercício de força', 'Realize exercícios de musculação ou resistência', 35, 'exercise', 'hard'),
('Evitar açúcar refinado', 'Não consuma açúcar refinado durante o dia', 20, 'nutrition', 'medium');

-- Insert sample courses
INSERT INTO public.courses (title, description, category, difficulty_level, duration_minutes, instructor_name) VALUES
('Fundamentos da Nutrição Saudável', 'Aprenda os princípios básicos de uma alimentação equilibrada', 'Nutrição', 'beginner', 180, 'Dra. Ana Nutricionista'),
('Exercícios para Iniciantes', 'Comece sua jornada fitness com exercícios simples e eficazes', 'Exercício', 'beginner', 120, 'Prof. João Personal'),
('Mindfulness e Emagrecimento', 'Desenvolva uma relação saudável com a comida através da atenção plena', 'Mindset', 'intermediate', 90, 'Psic. Maria Terapia'),
('Receitas Fit Deliciosas', 'Aprenda a preparar refeições saudáveis e saborosas', 'Nutrição', 'intermediate', 150, 'Chef Carlos Fitness');