-- Criar políticas RLS adequadas para as tabelas da base de conhecimento Sofia
-- Estas tabelas devem ser públicas para consulta mas protegidas para modificação

-- 1. Tabelas de conhecimento nutricional (somente leitura para todos)
CREATE POLICY "Allow read access to nutritional knowledge" ON public.idade_alimentos
  FOR SELECT USING (true);

CREATE POLICY "Allow read access to gender nutrition" ON public.genero_alimentos
  FOR SELECT USING (true);

CREATE POLICY "Allow read access to emotional food data" ON public.estados_emocionais_alimentos
  FOR SELECT USING (true);

CREATE POLICY "Allow read access to fitness nutrition" ON public.objetivos_fitness_alimentos
  FOR SELECT USING (true);

CREATE POLICY "Allow read access to symptoms nutrition" ON public.sintomas_alimentos
  FOR SELECT USING (true);

CREATE POLICY "Allow read access to exercise nutrition" ON public.atividade_fisica_alimentos
  FOR SELECT USING (true);

-- 2. Verificar e corrigir tabelas críticas sem políticas RLS

-- Sofia conversation context - usuários acessam apenas seus próprios dados
CREATE POLICY "Users can manage their Sofia context" ON public.sofia_conversation_context
  FOR ALL USING (auth.uid() = user_id);

-- Sofia messages - usuários acessam apenas suas próprias mensagens  
CREATE POLICY "Users can manage their Sofia messages" ON public.sofia_messages
  FOR ALL USING (auth.uid() = user_id);

-- Sofia memory - usuários acessam apenas suas próprias memórias
CREATE POLICY "Users can manage their Sofia memory" ON public.sofia_memory
  FOR ALL USING (auth.uid() = user_id);

-- Health diary - usuários acessam apenas seus próprios dados
CREATE POLICY "Users can manage their health diary" ON public.health_diary
  FOR ALL USING (auth.uid() = user_id);

-- Nutrition goals - usuários acessam apenas suas próprias metas
CREATE POLICY "Users can manage their nutrition goals" ON public.nutrition_goals
  FOR ALL USING (auth.uid() = user_id);

-- User physical profiles - usuários acessam apenas seus próprios perfis
CREATE POLICY "Users can manage their physical profiles" ON public.user_physical_profiles
  FOR ALL USING (auth.uid() = user_id);

-- User subscriptions - usuários acessam apenas suas próprias assinaturas
CREATE POLICY "Users can view their subscriptions" ON public.user_subscriptions
  FOR SELECT USING (auth.uid() = user_id);

-- Session responses - usuários acessam apenas suas próprias respostas
CREATE POLICY "Users can manage their session responses" ON public.session_responses
  FOR ALL USING (auth.uid() = user_id);

-- Notification sent - sistema pode inserir, usuários podem ver as suas
CREATE POLICY "Users can view their notifications" ON public.notifications_sent
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications" ON public.notifications_sent
  FOR INSERT WITH CHECK (true);

-- Meal feedback - usuários acessam apenas seus próprios feedbacks
CREATE POLICY "Users can manage their meal feedback" ON public.meal_feedback
  FOR ALL USING (auth.uid() = user_id);

-- Google Fit analysis - usuários acessam apenas suas próprias análises
CREATE POLICY "Users can manage their Google Fit analysis" ON public.google_fit_analysis
  FOR ALL USING (auth.uid() = user_id);

-- Health integrations - usuários acessam apenas suas próprias integrações
CREATE POLICY "Users can manage their health integrations" ON public.health_integrations
  FOR ALL USING (auth.uid() = user_id);

-- Tracking achievements - usuários acessam apenas suas próprias conquistas
CREATE POLICY "Users can manage their tracking achievements" ON public.tracking_achievements
  FOR ALL USING (auth.uid() = user_id);

-- User custom saboteurs - usuários acessam apenas seus próprios sabotadores
CREATE POLICY "Users can manage their custom saboteurs" ON public.user_custom_saboteurs
  FOR ALL USING (auth.uid() = user_id);

-- User favorite foods - usuários acessam apenas seus próprios favoritos
CREATE POLICY "Users can manage their favorite foods" ON public.user_favorite_foods
  FOR ALL USING (auth.uid() = user_id);

-- User food profile - usuários acessam apenas seus próprios perfis alimentares
CREATE POLICY "Users can manage their food profile" ON public.user_food_profile
  FOR ALL USING (auth.uid() = user_id);

-- User scores - usuários acessam apenas suas próprias pontuações
CREATE POLICY "Users can manage their scores" ON public.user_scores
  FOR ALL USING (auth.uid() = user_id);

-- Health feed follows - usuários gerenciam seus próprios follows
CREATE POLICY "Users can manage their health feed follows" ON public.health_feed_follows
  FOR ALL USING (auth.uid() = follower_user_id);

-- Health feed reactions - usuários gerenciam suas próprias reações
CREATE POLICY "Users can manage their health feed reactions" ON public.health_feed_reactions
  FOR ALL USING (auth.uid() = user_id);

-- Nutrition daily summary - usuários acessam apenas seus próprios resumos
CREATE POLICY "Users can manage their nutrition daily summary" ON public.nutrition_daily_summary
  FOR ALL USING (auth.uid() = user_id);

-- Nutrition favorites - usuários acessam apenas seus próprios favoritos
CREATE POLICY "Users can manage their nutrition favorites" ON public.nutrition_favorites
  FOR ALL USING (auth.uid() = user_id);

-- Nutrition patterns - usuários acessam apenas seus próprios padrões
CREATE POLICY "Users can manage their nutrition patterns" ON public.nutrition_patterns
  FOR ALL USING (auth.uid() = user_id);

-- Nutrition recommendations - usuários acessam apenas suas próprias recomendações
CREATE POLICY "Users can manage their nutrition recommendations" ON public.nutrition_recommendations
  FOR ALL USING (auth.uid() = user_id);

-- Saboteur assessments - usuários acessam apenas suas próprias avaliações
CREATE POLICY "Users can manage their saboteur assessments" ON public.saboteur_assessments
  FOR ALL USING (auth.uid() = user_id);

-- Saboteur responses - usuários acessam apenas suas próprias respostas
CREATE POLICY "Users can manage their saboteur responses" ON public.saboteur_responses
  FOR ALL USING (auth.uid() = user_id);

-- Saboteur results - usuários acessam apenas seus próprios resultados
CREATE POLICY "Users can manage their saboteur results" ON public.saboteur_results
  FOR ALL USING (auth.uid() = user_id);

-- Sofia food analysis - usuários acessam apenas suas próprias análises
CREATE POLICY "Users can manage their Sofia food analysis" ON public.sofia_food_analysis
  FOR ALL USING (auth.uid() = user_id);

-- Sofia learning - usuários acessam apenas seus próprios dados de aprendizado
CREATE POLICY "Users can manage their Sofia learning" ON public.sofia_learning
  FOR ALL USING (auth.uid() = user_id);

-- Sofia knowledge base - dados públicos para consulta
CREATE POLICY "Public read access to Sofia knowledge base" ON public.sofia_knowledge_base
  FOR SELECT USING (true);

-- Admin can manage Sofia knowledge base
CREATE POLICY "Admins can manage Sofia knowledge base" ON public.sofia_knowledge_base
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Subscription plans - público para visualização
CREATE POLICY "Public read access to subscription plans" ON public.subscription_plans
  FOR SELECT USING (true);

-- Subscription invoices - usuários acessam apenas suas próprias faturas
CREATE POLICY "Users can view their subscription invoices" ON public.subscription_invoices
  FOR SELECT USING (auth.uid() = user_id);

-- Premium medical reports - usuários acessam apenas seus próprios relatórios
CREATE POLICY "Users can view their premium medical reports" ON public.premium_medical_reports
  FOR SELECT USING (auth.uid() = user_id);

-- Premium report events - usuários acessam apenas seus próprios eventos
CREATE POLICY "Users can manage their premium report events" ON public.premium_report_events
  FOR ALL USING (auth.uid() = user_id);

-- Meal plan items - usuários acessam apenas seus próprios itens
CREATE POLICY "Users can manage their meal plan items" ON public.meal_plan_items
  FOR ALL USING (auth.uid() = user_id);

-- Meal plan history - usuários acessam apenas seu próprio histórico
CREATE POLICY "Users can manage their meal plan history" ON public.meal_plan_history
  FOR ALL USING (auth.uid() = user_id);

-- Nutrition aliases pending - admins podem gerenciar
CREATE POLICY "Admins can manage nutrition aliases" ON public.nutrition_aliases_pending
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Nutrition foods - dados públicos para consulta
CREATE POLICY "Public read access to nutrition foods" ON public.nutrition_foods
  FOR SELECT USING (true);

-- Nutrition yields - dados públicos para consulta  
CREATE POLICY "Public read access to nutrition yields" ON public.nutrition_yields
  FOR SELECT USING (true);

-- Tabelas de pools de alimentos - dados públicos para consulta
CREATE POLICY "Public read access to carbo pool" ON public.pool_carbo
  FOR SELECT USING (true);

CREATE POLICY "Public read access to feijao pool" ON public.pool_feijao
  FOR SELECT USING (true);

CREATE POLICY "Public read access to fruta pool" ON public.pool_fruta
  FOR SELECT USING (true);

CREATE POLICY "Public read access to legume pool" ON public.pool_legume
  FOR SELECT USING (true);

CREATE POLICY "Public read access to padaria pool" ON public.pool_padaria
  FOR SELECT USING (true);

CREATE POLICY "Public read access to proteina pool" ON public.pool_proteina
  FOR SELECT USING (true);

-- Mock users - apenas para desenvolvimento/teste - acesso restrito
CREATE POLICY "Admins can manage mock users" ON public.mock_users
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- TACO stage - dados públicos para consulta
CREATE POLICY "Public read access to TACO stage" ON public.taco_stage
  FOR SELECT USING (true);

-- Sofia conversations backup - usuários acessam apenas suas próprias conversas
CREATE POLICY "Users can view their Sofia conversations backup" ON public.sofia_conversations_backup
  FOR SELECT USING (auth.uid() = user_id);

-- User goals backup - usuários acessam apenas suas próprias metas
CREATE POLICY "Users can view their goals backup" ON public.user_goals_backup
  FOR SELECT USING (auth.uid() = user_id);

-- Tabelas de conhecimento nutricional - dados públicos para consulta
CREATE POLICY "Public read access to impacto ambiental" ON public.impacto_ambiental
  FOR SELECT USING (true);

CREATE POLICY "Public read access to informacoes economicas" ON public.informacoes_economicas
  FOR SELECT USING (true);

CREATE POLICY "Public read access to nutricao demografica" ON public.nutricao_demografica
  FOR SELECT USING (true);

CREATE POLICY "Public read access to nutricao gestacao" ON public.nutricao_gestacao
  FOR SELECT USING (true);

CREATE POLICY "Public read access to preparo conservacao" ON public.preparo_conservacao
  FOR SELECT USING (true);

CREATE POLICY "Public read access to protocolos nutricionais" ON public.protocolos_nutricionais
  FOR SELECT USING (true);

CREATE POLICY "Public read access to receitas" ON public.receitas
  FOR SELECT USING (true);

CREATE POLICY "Public read access to receitas terapeuticas" ON public.receitas_terapeuticas
  FOR SELECT USING (true);

CREATE POLICY "Public read access to saude especifica" ON public.saude_especifica
  FOR SELECT USING (true);

CREATE POLICY "Public read access to seguranca alimentar" ON public.seguranca_alimentar
  FOR SELECT USING (true);

CREATE POLICY "Public read access to substituicoes" ON public.substituicoes
  FOR SELECT USING (true);

CREATE POLICY "Public read access to substituicoes inteligentes" ON public.substituicoes_inteligentes
  FOR SELECT USING (true);