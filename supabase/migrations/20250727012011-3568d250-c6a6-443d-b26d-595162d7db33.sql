-- Corrigir funções sem search_path fixo para segurança
ALTER FUNCTION public.is_admin_user() SET search_path = 'public';
ALTER FUNCTION public.get_user_display_name(uuid) SET search_path = 'public';
ALTER FUNCTION public.auto_update_user_name() SET search_path = 'public';
ALTER FUNCTION public.notify_user_on_session_assignment() SET search_path = 'public';
ALTER FUNCTION public.notify_user_on_session_completion() SET search_path = 'public';
ALTER FUNCTION public.notify_goal_approval() SET search_path = 'public';
ALTER FUNCTION public.calculate_user_level(integer) SET search_path = 'public';
ALTER FUNCTION public.update_user_streak() SET search_path = 'public';
ALTER FUNCTION public.generate_weekly_insights() SET search_path = 'public';
ALTER FUNCTION public.check_achievements() SET search_path = 'public';
ALTER FUNCTION public.calculate_imc() SET search_path = 'public';
ALTER FUNCTION public.update_updated_at_column() SET search_path = 'public';

-- Adicionar políticas RLS faltantes para tabelas sem política
-- Verificar se health_feed_group_members precisa de políticas
CREATE POLICY "Users can view group members" 
ON public.health_feed_group_members FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM health_feed_groups 
    WHERE health_feed_groups.id = health_feed_group_members.group_id 
    AND (health_feed_groups.is_private = false OR 
         EXISTS (SELECT 1 FROM health_feed_group_members gm2 
                WHERE gm2.group_id = health_feed_groups.id 
                AND gm2.user_id = auth.uid()))
  )
);

CREATE POLICY "Users can join groups" 
ON public.health_feed_group_members FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave groups" 
ON public.health_feed_group_members FOR DELETE 
USING (auth.uid() = user_id);

-- Verificar se health_feed_groups precisa de políticas
CREATE POLICY "Users can view public groups" 
ON public.health_feed_groups FOR SELECT 
USING (
  is_private = false OR 
  created_by = auth.uid() OR 
  EXISTS (
    SELECT 1 FROM health_feed_group_members 
    WHERE group_id = health_feed_groups.id 
    AND user_id = auth.uid()
  )
);

CREATE POLICY "Users can create groups" 
ON public.health_feed_groups FOR INSERT 
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Group creators can update their groups" 
ON public.health_feed_groups FOR UPDATE 
USING (auth.uid() = created_by);

CREATE POLICY "Group creators can delete their groups" 
ON public.health_feed_groups FOR DELETE 
USING (auth.uid() = created_by);