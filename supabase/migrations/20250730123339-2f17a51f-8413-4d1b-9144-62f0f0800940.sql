-- RECUPERAÇÃO COMPLETA - TODOS OS TRIGGERS E FUNCIONALIDADES PERDIDAS DESDE 16:00 ONTEM
-- DESCOBERTA: TODOS OS TRIGGERS FORAM APAGADOS!

-- 1. RECRIAR TRIGGER PARA NOVOS USUÁRIOS (CRÍTICO!)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 2. RECRIAR TRIGGER PARA STREAK DE MISSÕES DIÁRIAS
DROP TRIGGER IF EXISTS update_user_streak_trigger ON daily_mission_sessions;
CREATE TRIGGER update_user_streak_trigger
  BEFORE INSERT ON daily_mission_sessions
  FOR EACH ROW EXECUTE FUNCTION public.update_user_streak();

-- 3. RECRIAR TRIGGER PARA ANÁLISE SEMANAL DE PESO
DROP TRIGGER IF EXISTS generate_weekly_analysis_trigger ON weight_measurements;
CREATE TRIGGER generate_weekly_analysis_trigger
  AFTER INSERT OR UPDATE ON weight_measurements
  FOR EACH ROW EXECUTE FUNCTION public.generate_weekly_analysis();

-- 4. RECRIAR TRIGGER PARA INSIGHTS SEMANAIS
DROP TRIGGER IF EXISTS generate_weekly_insights_trigger ON daily_responses;
CREATE TRIGGER generate_weekly_insights_trigger
  AFTER INSERT OR UPDATE ON daily_responses
  FOR EACH ROW EXECUTE FUNCTION public.generate_weekly_insights();

-- 5. RECRIAR TRIGGER PARA CONQUISTAS
DROP TRIGGER IF EXISTS check_achievements_trigger ON daily_responses;
CREATE TRIGGER check_achievements_trigger
  AFTER INSERT OR UPDATE ON daily_responses
  FOR EACH ROW EXECUTE FUNCTION public.check_achievements();

-- 6. RECRIAR TRIGGER PARA CÁLCULO DE IMC
DROP TRIGGER IF EXISTS calculate_imc_trigger ON weight_measurements;
CREATE TRIGGER calculate_imc_trigger
  BEFORE INSERT OR UPDATE ON weight_measurements
  FOR EACH ROW EXECUTE FUNCTION public.calculate_imc();

-- 7. RECRIAR TRIGGER PARA ZONAS CARDÍACAS
DROP TRIGGER IF EXISTS auto_calculate_heart_zones_trigger ON heart_rate_data;
CREATE TRIGGER auto_calculate_heart_zones_trigger
  AFTER INSERT ON heart_rate_data
  FOR EACH ROW EXECUTE FUNCTION public.auto_calculate_heart_zones();

-- 8. RECRIAR TRIGGER PARA ATUALIZAÇÃO DE FOOD ANALYSIS
DROP TRIGGER IF EXISTS update_food_analysis_updated_at_trigger ON food_analysis;
CREATE TRIGGER update_food_analysis_updated_at_trigger
  BEFORE UPDATE ON food_analysis
  FOR EACH ROW EXECUTE FUNCTION public.update_food_analysis_updated_at();

-- 9. GARANTIR QUE TABELAS TENHAM TRIGGERS DE updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_courses_updated_at ON courses;
CREATE TRIGGER update_courses_updated_at
  BEFORE UPDATE ON courses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_course_modules_updated_at ON course_modules;
CREATE TRIGGER update_course_modules_updated_at
  BEFORE UPDATE ON course_modules
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_course_lessons_updated_at ON course_lessons;
CREATE TRIGGER update_course_lessons_updated_at
  BEFORE UPDATE ON course_lessons
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();