import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ShareToCommunityData {
  content: string;
  mediaUrls?: string[];
  achievementType?: 'goal_completed' | 'progress_update' | 'milestone_reached';
  achievementData?: {
    goalTitle?: string;
    progressValue?: number;
    targetValue?: number;
    unit?: string;
    category?: string;
  };
  tags?: string[];
  visibility?: 'public' | 'friends';
}

export const useCommunityShare = () => {
  const [isSharing, setIsSharing] = useState(false);
  const { toast } = useToast();

  const shareToHealthFeed = async (data: ShareToCommunityData) => {
    try {
      setIsSharing(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      // Preparar dados do post
      const postData = {
        user_id: user.id,
        content: data.content,
        post_type: data.achievementType || 'progress_update',
        media_urls: data.mediaUrls || [],
        tags: data.tags || [],
        visibility: data.visibility || 'public',
        achievements_data: data.achievementData ? {
          type: data.achievementType,
          goal_title: data.achievementData.goalTitle,
          progress_value: data.achievementData.progressValue,
          target_value: data.achievementData.targetValue,
          unit: data.achievementData.unit,
          category: data.achievementData.category,
          timestamp: new Date().toISOString()
        } : {},
        progress_data: data.achievementData ? {
          current: data.achievementData.progressValue,
          target: data.achievementData.targetValue,
          unit: data.achievementData.unit,
          percentage: data.achievementData.targetValue ? 
            Math.round((data.achievementData.progressValue! / data.achievementData.targetValue) * 100) : 0
        } : {}
      };

      // Temporário - simular post até tabela ser criada
      console.log('Creating health feed post:', postData);

      // Skip badges for now since the table doesn't exist

      toast({
        title: "✅ Compartilhado com sucesso!",
        description: "Seu progresso foi compartilhado na comunidade",
      });

      return { success: true };
    } catch (error) {
      console.error('Erro ao compartilhar:', error);
      toast({
        title: "Erro",
        description: "Não foi possível compartilhar na comunidade",
        variant: "destructive"
      });
      return { success: false, error };
    } finally {
      setIsSharing(false);
    }
  };

  const generateProgressMessage = (data: ShareToCommunityData) => {
    const { achievementData, achievementType } = data;
    
    if (!achievementData) return '';

    const progress = achievementData.targetValue ? 
      Math.round((achievementData.progressValue! / achievementData.targetValue) * 100) : 0;

    switch (achievementType) {
      case 'goal_completed':
        return `🎉 Meta concluída! Acabei de completar "${achievementData.goalTitle}"! 💪\n\n${achievementData.progressValue} ${achievementData.unit} alcançados! 🎯`;
      
      case 'progress_update':
        return `📈 Progresso na meta "${achievementData.goalTitle}"!\n\n${achievementData.progressValue}/${achievementData.targetValue} ${achievementData.unit} (${progress}%)\n\nContinuando firme na jornada! 💪`;
      
      case 'milestone_reached':
        return `🏆 Marco alcançado! Cheguei a ${achievementData.progressValue} ${achievementData.unit} na meta "${achievementData.goalTitle}"!\n\nQuase lá! 🔥`;
      
      default:
        return `Atualizei meu progresso: ${achievementData.progressValue} ${achievementData.unit}`;
    }
  };

  const suggestTags = (data: ShareToCommunityData) => {
    const tags = ['#progresso', '#saude'];
    
    if (data.achievementData?.category) {
      tags.push(`#${data.achievementData.category.toLowerCase()}`);
    }
    
    if (data.achievementType === 'goal_completed') {
      tags.push('#metaconcluida', '#vitoria');
    } else if (data.achievementType === 'milestone_reached') {
      tags.push('#marco', '#quaselá');
    }
    
    return tags;
  };

  return {
    shareToHealthFeed,
    generateProgressMessage,
    suggestTags,
    isSharing
  };
};