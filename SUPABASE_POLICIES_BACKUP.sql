-- =================================================================
-- BACKUP COMPLETO DAS POLÍTICAS RLS - HEALTH NEXUS
-- Data: 19 de Janeiro de 2025
-- =================================================================

-- Políticas para activity_categories
CREATE POLICY "Admins can manage activity categories" ON public.activity_categories
  FOR ALL USING (is_admin_user());

CREATE POLICY "Everyone can view activity categories" ON public.activity_categories
  FOR SELECT USING (true);

CREATE POLICY "Users can create their own activity categories" ON public.activity_categories
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own activity categories" ON public.activity_categories
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own activity categories" ON public.activity_categories
  FOR SELECT USING (auth.uid() = user_id);

-- Políticas para activity_sessions  
CREATE POLICY "Users can create their own activity sessions" ON public.activity_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their own activity sessions" ON public.activity_sessions
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own activity sessions" ON public.activity_sessions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own activity sessions" ON public.activity_sessions
  FOR SELECT USING (auth.uid() = user_id);

-- Políticas para admin_logs
CREATE POLICY "admin_logs_admin_select" ON public.admin_logs
  FOR SELECT USING ((auth.jwt() ->> 'role'::text) = 'admin'::text);

CREATE POLICY "admin_logs_user_insert" ON public.admin_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Políticas para ai_configurations
CREATE POLICY "Authenticated users can insert AI configurations" ON public.ai_configurations
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Authenticated users can update AI configurations" ON public.ai_configurations
  FOR UPDATE USING (true);

CREATE POLICY "Authenticated users can view AI configurations" ON public.ai_configurations
  FOR SELECT USING (true);

CREATE POLICY "Everyone can view AI configurations" ON public.ai_configurations
  FOR SELECT USING (true);

-- Políticas para ai_presets
CREATE POLICY "Authenticated users can view AI presets" ON public.ai_presets
  FOR SELECT USING (true);

-- Políticas para alimentos_doencas
CREATE POLICY "Public read access" ON public.alimentos_doencas
  FOR SELECT USING (true);

-- Políticas para alimentos_principios_ativos
CREATE POLICY "Public read access" ON public.alimentos_principios_ativos
  FOR SELECT USING (true);

-- Políticas para bioimpedance_analysis
CREATE POLICY "Users can insert own bioimpedance analysis" ON public.bioimpedance_analysis
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own bioimpedance analysis" ON public.bioimpedance_analysis
  FOR SELECT USING (auth.uid() = user_id);

-- Políticas para challenge_daily_logs
CREATE POLICY "Users can create own challenge logs" ON public.challenge_daily_logs
  FOR INSERT WITH CHECK (EXISTS (
    SELECT 1 FROM challenge_participations
    WHERE challenge_participations.id = challenge_daily_logs.participation_id 
      AND challenge_participations.user_id = auth.uid()
  ));

CREATE POLICY "Users can update own challenge logs" ON public.challenge_daily_logs
  FOR UPDATE USING (EXISTS (
    SELECT 1 FROM challenge_participations
    WHERE challenge_participations.id = challenge_daily_logs.participation_id 
      AND challenge_participations.user_id = auth.uid()
  ));

CREATE POLICY "Users can view own challenge logs" ON public.challenge_daily_logs
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM challenge_participations
    WHERE challenge_participations.id = challenge_daily_logs.participation_id 
      AND challenge_participations.user_id = auth.uid()
  ));

-- Políticas para challenge_group_messages
CREATE POLICY "Users can create group messages for their challenges" ON public.challenge_group_messages
  FOR INSERT WITH CHECK (
    (auth.uid() = user_id) AND 
    (EXISTS (
      SELECT 1 FROM challenge_participations
      WHERE challenge_participations.challenge_id = challenge_group_messages.challenge_id 
        AND challenge_participations.user_id = auth.uid()
    ))
  );

CREATE POLICY "Users can view group messages for their challenges" ON public.challenge_group_messages
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM challenge_participations
    WHERE challenge_participations.challenge_id = challenge_group_messages.challenge_id 
      AND challenge_participations.user_id = auth.uid()
  ));

-- Políticas para challenge_participations
CREATE POLICY "Users can create challenge participations" ON public.challenge_participations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update challenge participations" ON public.challenge_participations
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view challenge participations" ON public.challenge_participations
  FOR SELECT USING (auth.uid() = user_id);

-- Políticas para challenges
CREATE POLICY "Admins can create challenges" ON public.challenges
  FOR INSERT WITH CHECK (is_admin_user());

CREATE POLICY "Admins can delete challenges" ON public.challenges
  FOR DELETE USING (is_admin_user());

CREATE POLICY "Admins can manage challenges" ON public.challenges
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Admins can update challenges" ON public.challenges
  FOR UPDATE USING (is_admin_user());

CREATE POLICY "Authenticated users can create challenges" ON public.challenges
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Everyone can view challenges" ON public.challenges
  FOR SELECT USING (true);

CREATE POLICY "Users can delete own challenges" ON public.challenges
  FOR DELETE USING ((auth.uid() = created_by) OR (auth.uid() IS NOT NULL));

CREATE POLICY "Users can update own challenges" ON public.challenges
  FOR UPDATE USING ((auth.uid() = created_by) OR (auth.uid() IS NOT NULL));

-- Políticas para chat_configurations
CREATE POLICY "Only admins can manage chat configurations" ON public.chat_configurations
  FOR ALL USING ((auth.jwt() ->> 'email'::text) = 'admin@institutodossonhos.com.br'::text);

-- Políticas para chat_conversations
CREATE POLICY "Users can create their own conversations" ON public.chat_conversations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own conversations" ON public.chat_conversations
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own conversations" ON public.chat_conversations
  FOR SELECT USING (auth.uid() = user_id);

-- Políticas para chat_emotional_analysis
CREATE POLICY "System can create emotional analysis" ON public.chat_emotional_analysis
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view their own emotional analysis" ON public.chat_emotional_analysis
  FOR SELECT USING (auth.uid() = user_id);

-- Políticas para comments
CREATE POLICY "Users can delete their own comments" ON public.comments
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own comments" ON public.comments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments" ON public.comments
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view all comments" ON public.comments
  FOR SELECT USING (true);

-- Políticas para company_configurations
CREATE POLICY "Admins can manage company configurations" ON public.company_configurations
  FOR ALL USING (is_admin_user()) WITH CHECK (is_admin_user());

CREATE POLICY "Users can view company configurations" ON public.company_configurations
  FOR SELECT USING (true);

-- Políticas para company_data
CREATE POLICY "Admins can manage company data" ON public.company_data
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Everyone can view company data" ON public.company_data
  FOR SELECT USING (true);

CREATE POLICY "Public can view company data" ON public.company_data
  FOR SELECT USING (true);

-- Políticas para course_lessons
CREATE POLICY "Admins can manage course lessons" ON public.course_lessons
  FOR ALL USING (EXISTS (
    SELECT 1 FROM auth.users
    WHERE users.id = auth.uid() 
      AND (
        (users.email)::text = 'admin@institutodossonhos.com.br'::text OR
        (users.email)::text = 'teste@institutodossonhos.com'::text OR
        (users.email)::text = 'contato@rafael-dias.com'::text OR
        (users.raw_user_meta_data ->> 'role'::text) = 'admin'::text
      )
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM auth.users
    WHERE users.id = auth.uid() 
      AND (
        (users.email)::text = 'admin@institutodossonhos.com.br'::text OR
        (users.email)::text = 'teste@institutodossonhos.com'::text OR
        (users.email)::text = 'contato@rafael-dias.com'::text OR
        (users.raw_user_meta_data ->> 'role'::text) = 'admin'::text
      )
  ));

CREATE POLICY "Authenticated users can create lessons" ON public.course_lessons
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete lessons" ON public.course_lessons
  FOR DELETE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update lessons" ON public.course_lessons
  FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Everyone can view course lessons" ON public.course_lessons
  FOR SELECT USING (true);

-- Políticas para daily_mission_sessions
CREATE POLICY "Users can manage their own daily mission sessions" ON public.daily_mission_sessions
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Políticas para daily_responses
CREATE POLICY "Users can manage their own daily responses" ON public.daily_responses
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Políticas para goal_updates
CREATE POLICY "Users can create their own goal updates" ON public.goal_updates
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own goal updates" ON public.goal_updates
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own goal updates" ON public.goal_updates
  FOR UPDATE USING (auth.uid() = user_id);

-- Políticas para profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all profiles" ON public.profiles
  FOR ALL USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Políticas para user_roles
CREATE POLICY "Users can view their own roles" ON public.user_roles
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admins can manage user roles" ON public.user_roles
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Políticas para weight_measurements
CREATE POLICY "Users can manage their own weight measurements" ON public.weight_measurements
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Políticas para weekly_analyses
CREATE POLICY "Users can manage their own weekly analyses" ON public.weekly_analyses
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Políticas para weekly_insights
CREATE POLICY "Users can view their own weekly insights" ON public.weekly_insights
  FOR SELECT USING (auth.uid() = user_id);

-- Políticas para smart_notifications
CREATE POLICY "Users can view their own notifications" ON public.smart_notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" ON public.smart_notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- =================================================================
-- POLÍTICAS PARA STORAGE BUCKETS
-- =================================================================

-- Bucket: avatars
CREATE POLICY "Avatar images are publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own avatar" ON storage.objects
  FOR UPDATE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Bucket: chat-images
CREATE POLICY "Permitir upload de imagens" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'chat-images');

CREATE POLICY "Permitir visualização pública" ON storage.objects
  FOR SELECT USING (bucket_id = 'chat-images');

-- Bucket: course-thumbnails
CREATE POLICY "Course thumbnails are publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'course-thumbnails');

CREATE POLICY "Authenticated users can upload course thumbnails" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'course-thumbnails' AND auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage course thumbnails" ON storage.objects
  FOR ALL USING (bucket_id = 'course-thumbnails' AND is_admin_user());

-- Bucket: community-uploads
CREATE POLICY "Community uploads are publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'community-uploads');

CREATE POLICY "Authenticated users can upload community content" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'community-uploads' AND auth.uid() IS NOT NULL);

-- Bucket: medical-documents
CREATE POLICY "Users can view their own medical documents" ON storage.objects
  FOR SELECT USING (bucket_id = 'medical-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload their own medical documents" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'medical-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Bucket: medical-documents-reports
CREATE POLICY "Medical document reports are publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'medical-documents-reports');

CREATE POLICY "Users can upload medical document reports" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'medical-documents-reports' AND auth.uid() IS NOT NULL);