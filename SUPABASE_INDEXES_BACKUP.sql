-- =================================================================
-- BACKUP COMPLETO DOS ÍNDICES - HEALTH NEXUS
-- Data: 19 de Janeiro de 2025
-- =================================================================

-- Índices para achievements
CREATE UNIQUE INDEX IF NOT EXISTS achievements_pkey ON public.achievements USING btree (id);

-- Índices para activity_categories
CREATE UNIQUE INDEX IF NOT EXISTS activity_categories_pkey ON public.activity_categories USING btree (id);
CREATE INDEX IF NOT EXISTS idx_activity_categories_user ON public.activity_categories USING btree (user_id);

-- Índices para activity_sessions
CREATE UNIQUE INDEX IF NOT EXISTS activity_sessions_pkey ON public.activity_sessions USING btree (id);
CREATE INDEX IF NOT EXISTS idx_activity_sessions_user_date ON public.activity_sessions USING btree (user_id, session_date DESC);

-- Índices para admin_logs
CREATE UNIQUE INDEX IF NOT EXISTS admin_logs_pkey ON public.admin_logs USING btree (id);
CREATE INDEX IF NOT EXISTS idx_admin_logs_created_at ON public.admin_logs USING btree (created_at DESC);

-- Índices para ai_configurations
CREATE UNIQUE INDEX IF NOT EXISTS ai_configurations_pkey ON public.ai_configurations USING btree (id);
CREATE UNIQUE INDEX IF NOT EXISTS ai_configurations_functionality_unique ON public.ai_configurations USING btree (functionality);

-- Índices para ai_presets
CREATE UNIQUE INDEX IF NOT EXISTS ai_presets_pkey ON public.ai_presets USING btree (id);

-- Índices para ai_usage_logs
CREATE UNIQUE INDEX IF NOT EXISTS ai_usage_logs_pkey ON public.ai_usage_logs USING btree (id);

-- Índices para alimentos
CREATE UNIQUE INDEX IF NOT EXISTS alimentos_pkey ON public.alimentos USING btree (id);

-- Índices para alimentos_doencas
CREATE UNIQUE INDEX IF NOT EXISTS alimentos_doencas_pkey ON public.alimentos_doencas USING btree (id);
CREATE INDEX IF NOT EXISTS idx_alimentos_doencas_alimento_id ON public.alimentos_doencas USING btree (alimento_id);
CREATE INDEX IF NOT EXISTS idx_alimentos_doencas_doenca_id ON public.alimentos_doencas USING btree (doenca_id);
CREATE INDEX IF NOT EXISTS idx_alimentos_doencas_tipo_relacao ON public.alimentos_doencas USING btree (tipo_relacao);

-- Índices para alimentos_principios_ativos
CREATE UNIQUE INDEX IF NOT EXISTS alimentos_principios_ativos_pkey ON public.alimentos_principios_ativos USING btree (id);
CREATE INDEX IF NOT EXISTS idx_alimentos_principios_alimento_id ON public.alimentos_principios_ativos USING btree (alimento_id);
CREATE INDEX IF NOT EXISTS idx_alimentos_principios_principio_id ON public.alimentos_principios_ativos USING btree (principio_ativo_id);

-- Índices para allergies
CREATE UNIQUE INDEX IF NOT EXISTS allergies_pkey ON public.allergies USING btree (id);

-- Índices para app_feedback
CREATE UNIQUE INDEX IF NOT EXISTS app_feedback_pkey ON public.app_feedback USING btree (id);

-- Índices para appointments
CREATE UNIQUE INDEX IF NOT EXISTS appointments_pkey ON public.appointments USING btree (id);

-- Índices para audit_logs
CREATE UNIQUE INDEX IF NOT EXISTS audit_logs_pkey ON public.audit_logs USING btree (id);

-- Índices para badges
CREATE UNIQUE INDEX IF NOT EXISTS badges_pkey ON public.badges USING btree (id);

-- Índices para bioimpedance_analysis
CREATE UNIQUE INDEX IF NOT EXISTS bioimpedance_analysis_pkey ON public.bioimpedance_analysis USING btree (id);
CREATE INDEX IF NOT EXISTS idx_bioimpedance_analysis_user_id ON public.bioimpedance_analysis USING btree (user_id);

-- Índices para challenge_daily_logs
CREATE UNIQUE INDEX IF NOT EXISTS challenge_daily_logs_pkey ON public.challenge_daily_logs USING btree (id);
CREATE INDEX IF NOT EXISTS idx_challenge_daily_logs_participation_date ON public.challenge_daily_logs USING btree (participation_id, log_date DESC);

-- Índices para challenge_group_messages
CREATE UNIQUE INDEX IF NOT EXISTS challenge_group_messages_pkey ON public.challenge_group_messages USING btree (id);
CREATE INDEX IF NOT EXISTS idx_challenge_group_messages_challenge_date ON public.challenge_group_messages USING btree (challenge_id, created_at DESC);

-- Índices para challenge_participations
CREATE UNIQUE INDEX IF NOT EXISTS challenge_participations_pkey ON public.challenge_participations USING btree (id);
CREATE INDEX IF NOT EXISTS idx_challenge_participations_user_id ON public.challenge_participations USING btree (user_id);
CREATE INDEX IF NOT EXISTS idx_challenge_participations_challenge_id ON public.challenge_participations USING btree (challenge_id);

-- Índices para challenges
CREATE UNIQUE INDEX IF NOT EXISTS challenges_pkey ON public.challenges USING btree (id);
CREATE INDEX IF NOT EXISTS idx_challenges_status_active ON public.challenges USING btree (status, is_active);
CREATE INDEX IF NOT EXISTS idx_challenges_start_end_date ON public.challenges USING btree (start_date, end_date);

-- Índices para chat_configurations
CREATE UNIQUE INDEX IF NOT EXISTS chat_configurations_pkey ON public.chat_configurations USING btree (id);

-- Índices para chat_conversations
CREATE UNIQUE INDEX IF NOT EXISTS chat_conversations_pkey ON public.chat_conversations USING btree (id);
CREATE INDEX IF NOT EXISTS idx_chat_conversations_user_id ON public.chat_conversations USING btree (user_id);

-- Índices para chat_emotional_analysis
CREATE UNIQUE INDEX IF NOT EXISTS chat_emotional_analysis_pkey ON public.chat_emotional_analysis USING btree (id);
CREATE INDEX IF NOT EXISTS idx_chat_emotional_analysis_user_week ON public.chat_emotional_analysis USING btree (user_id, week_start);

-- Índices para chat_messages
CREATE UNIQUE INDEX IF NOT EXISTS chat_messages_pkey ON public.chat_messages USING btree (id);

-- Índices para comments
CREATE UNIQUE INDEX IF NOT EXISTS comments_pkey ON public.comments USING btree (id);

-- Índices para company_configurations
CREATE UNIQUE INDEX IF NOT EXISTS company_configurations_pkey ON public.company_configurations USING btree (id);

-- Índices para company_data
CREATE UNIQUE INDEX IF NOT EXISTS company_data_pkey ON public.company_data USING btree (id);

-- Índices para courses
CREATE UNIQUE INDEX IF NOT EXISTS courses_pkey ON public.courses USING btree (id);

-- Índices para course_modules
CREATE UNIQUE INDEX IF NOT EXISTS course_modules_pkey ON public.course_modules USING btree (id);

-- Índices para course_lessons
CREATE UNIQUE INDEX IF NOT EXISTS course_lessons_pkey ON public.course_lessons USING btree (id);

-- Índices para daily_mission_sessions
CREATE UNIQUE INDEX IF NOT EXISTS daily_mission_sessions_pkey ON public.daily_mission_sessions USING btree (id);
CREATE UNIQUE INDEX IF NOT EXISTS daily_mission_sessions_user_date_unique ON public.daily_mission_sessions USING btree (user_id, date);
CREATE INDEX IF NOT EXISTS idx_daily_mission_sessions_user_completed ON public.daily_mission_sessions USING btree (user_id, is_completed, date DESC);

-- Índices para daily_responses
CREATE UNIQUE INDEX IF NOT EXISTS daily_responses_pkey ON public.daily_responses USING btree (id);
CREATE INDEX IF NOT EXISTS idx_daily_responses_user_date ON public.daily_responses USING btree (user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_daily_responses_question_id ON public.daily_responses USING btree (question_id);

-- Índices para goal_updates
CREATE UNIQUE INDEX IF NOT EXISTS goal_updates_pkey ON public.goal_updates USING btree (id);
CREATE INDEX IF NOT EXISTS idx_goal_updates_user_id ON public.goal_updates USING btree (user_id);
CREATE INDEX IF NOT EXISTS idx_goal_updates_goal_id ON public.goal_updates USING btree (goal_id);

-- Índices para profiles
CREATE UNIQUE INDEX IF NOT EXISTS profiles_pkey ON public.profiles USING btree (id);
CREATE UNIQUE INDEX IF NOT EXISTS profiles_user_id_unique ON public.profiles USING btree (user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles USING btree (email);

-- Índices para user_roles
CREATE UNIQUE INDEX IF NOT EXISTS user_roles_pkey ON public.user_roles USING btree (id);
CREATE UNIQUE INDEX IF NOT EXISTS user_roles_user_id_role_unique ON public.user_roles USING btree (user_id, role);

-- Índices para weight_measurements
CREATE UNIQUE INDEX IF NOT EXISTS weight_measurements_pkey ON public.weight_measurements USING btree (id);
CREATE INDEX IF NOT EXISTS idx_weight_measurements_user_date ON public.weight_measurements USING btree (user_id, measurement_date DESC);

-- Índices para weekly_analyses
CREATE UNIQUE INDEX IF NOT EXISTS weekly_analyses_pkey ON public.weekly_analyses USING btree (id);
CREATE UNIQUE INDEX IF NOT EXISTS weekly_analyses_user_week_unique ON public.weekly_analyses USING btree (user_id, semana_inicio);

-- Índices para weekly_insights
CREATE UNIQUE INDEX IF NOT EXISTS weekly_insights_pkey ON public.weekly_insights USING btree (id);
CREATE UNIQUE INDEX IF NOT EXISTS weekly_insights_user_week_unique ON public.weekly_insights USING btree (user_id, week_start_date);

-- Índices para smart_notifications
CREATE UNIQUE INDEX IF NOT EXISTS smart_notifications_pkey ON public.smart_notifications USING btree (id);
CREATE INDEX IF NOT EXISTS idx_smart_notifications_user_active ON public.smart_notifications USING btree (user_id, is_active, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_smart_notifications_type ON public.smart_notifications USING btree (type);

-- =================================================================
-- ÍNDICES DE PERFORMANCE ADICIONAIS
-- =================================================================

-- Índices compostos para queries complexas
CREATE INDEX IF NOT EXISTS idx_challenges_featured_active ON public.challenges USING btree (is_featured, is_active, start_date);
CREATE INDEX IF NOT EXISTS idx_daily_responses_user_question_date ON public.daily_responses USING btree (user_id, question_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_challenge_participations_user_completed ON public.challenge_participations USING btree (user_id, is_completed, created_at DESC);

-- Índices para análises e relatórios
CREATE INDEX IF NOT EXISTS idx_weight_measurements_user_month ON public.weight_measurements USING btree (user_id, DATE_TRUNC('month', measurement_date));
CREATE INDEX IF NOT EXISTS idx_daily_mission_sessions_streak ON public.daily_mission_sessions USING btree (user_id, streak_days DESC);

-- Índices para ordenação de feeds
CREATE INDEX IF NOT EXISTS idx_chat_conversations_user_updated ON public.chat_conversations USING btree (user_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_smart_notifications_priority_date ON public.smart_notifications USING btree (priority, created_at DESC);