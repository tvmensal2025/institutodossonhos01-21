import { useState, useEffect, useCallback } from 'react';
import { useEnhancedGamification } from '@/hooks/useEnhancedGamification';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  DailyResponse, 
  DailyMissionSession, 
  SectionType 
} from '@/types/daily-missions';
import { dailyQuestions, getQuestionsBySection } from '@/data/daily-questions';

interface UseDailyMissionsProps {
  user: User | null;
}

export const useDailyMissions = ({ user }: UseDailyMissionsProps) => {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<DailyMissionSession | null>(null);
  const [answers, setAnswers] = useState<Record<string, string | number>>({});
  const [textResponses, setTextResponses] = useState<Record<string, string>>({});
  const [expandedSections, setExpandedSections] = useState<SectionType[]>(['morning']);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { updateChallengeProgress, completeChallenge } = useEnhancedGamification();

  const today = new Date().toISOString().split('T')[0];

  // Carregar sessão do dia
  const loadTodaysSession = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      const { data: existingSession, error: sessionError } = await supabase
        .from('daily_mission_sessions')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', today)
        .single();

      if (sessionError && sessionError.code !== 'PGRST116') {
        console.error('Error loading session:', sessionError);
      }

      if (existingSession) {
        setSession({
          ...existingSession,
          completed_sections: existingSession.completed_sections as SectionType[]
        });
        
        // Carregar respostas existentes
        const { data: responses, error: responsesError } = await supabase
          .from('daily_responses')
          .select('*')
          .eq('user_id', user.id)
          .eq('date', today);

        if (responsesError) {
          console.error('Error loading responses:', responsesError);
        } else if (responses) {
          const newAnswers: Record<string, string | number> = {};
          const newTextResponses: Record<string, string> = {};

          responses.forEach(response => {
            if (response.text_response) {
              newTextResponses[response.question_id] = response.text_response;
            } else {
              newAnswers[response.question_id] = response.answer;
            }
          });

          setAnswers(newAnswers);
          setTextResponses(newTextResponses);
        }
      } else {
        // Criar nova sessão
        const newSession: Omit<DailyMissionSession, 'id' | 'created_at' | 'updated_at'> = {
          user_id: user.id,
          date: today,
          completed_sections: [],
          total_points: 0,
          streak_days: 0,
          is_completed: false
        };

        const { data: createdSession, error: createError } = await supabase
          .from('daily_mission_sessions')
          .insert(newSession)
          .select()
          .single();

        if (createError) {
          console.error('Error creating session:', createError);
        } else if (createdSession) {
          setSession({
            ...createdSession,
            completed_sections: createdSession.completed_sections as SectionType[]
          });
        }
      }
    } catch (error) {
      console.error('Error in loadTodaysSession:', error);
    } finally {
      setLoading(false);
    }
  }, [user, today]);

  useEffect(() => {
    loadTodaysSession();
  }, [loadTodaysSession]);

  // Salvar resposta
  const saveAnswer = useCallback(async (
    questionId: string, 
    answer: string | number, 
    textResponse?: string
  ) => {
    if (!user || !session) return;

    try {
      const question = dailyQuestions.find(q => q.id === questionId);
      if (!question) return;

      const responseData = {
        user_id: user.id,
        date: today,
        section: question.section,
        question_id: questionId,
        answer: answer.toString(),
        text_response: textResponse,
        points_earned: question.points
      };

      // Salvar no banco
      const { error: saveError } = await supabase
        .from('daily_responses')
        .upsert(responseData, {
          onConflict: 'user_id,date,question_id'
        });

      if (saveError) {
        console.error('Error saving answer:', saveError);
        toast({
          title: "Erro",
          description: "Não foi possível salvar sua resposta",
          variant: "destructive"
        });
        return;
      }

      // Atualizar estado local
      if (textResponse) {
        setTextResponses(prev => ({ ...prev, [questionId]: textResponse }));
      } else {
        setAnswers(prev => ({ ...prev, [questionId]: answer }));
      }

      // Verificar se a seção foi completada
      const sectionQuestions = getQuestionsBySection(question.section);
      const sectionAnswers = sectionQuestions.filter(q => 
        answers[q.id] !== undefined || textResponses[q.id] !== undefined || q.id === questionId
      );

      if (sectionAnswers.length === sectionQuestions.length) {
        // Seção completada
        const updatedCompletedSections = [...(session.completed_sections || [])];
        if (!updatedCompletedSections.includes(question.section)) {
          updatedCompletedSections.push(question.section);
        }

        // Atualizar sessão
        const { error: updateError } = await supabase
          .from('daily_mission_sessions')
          .update({
            completed_sections: updatedCompletedSections,
            total_points: session.total_points + question.points
          })
          .eq('id', session.id);

        if (!updateError) {
          setSession(prev => prev ? {
            ...prev,
            completed_sections: updatedCompletedSections,
            total_points: prev.total_points + question.points
          } : null);
        }

        const getSectionTitle = (section: string) => {
          switch (section) {
            case 'morning': return 'Manhã';
            case 'habits': return 'Hábitos';
            case 'mindset': return 'Mindset';
            default: return section;
          }
        };

        toast({
          title: "Seção Completa! 🎉",
          description: `Você completou ${getSectionTitle(question.section)}`,
        });
      }

      toast({
        title: "Resposta Salva! ✅",
        description: `+${question.points} pontos`,
      });

    } catch (error) {
      console.error('Error in saveAnswer:', error);
    }
  }, [user, session, today, answers, textResponses, toast]);

  // Alternar seção expandida
  const toggleSection = useCallback((section: SectionType) => {
    setExpandedSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  }, []);

  // Completar missão do dia
  const completeDailyMission = useCallback(async () => {
    if (!user || !session || isSubmitting) return;

    try {
      setIsSubmitting(true);

      const totalQuestions = dailyQuestions.length;
      const answeredQuestions = Object.keys(answers).length + Object.keys(textResponses).length;

      if (answeredQuestions < totalQuestions) {
        toast({
          title: "Missão Incompleta",
          description: "Complete todas as perguntas para finalizar",
          variant: "destructive"
        });
        return;
      }

      // Calcular pontos totais
      const totalPoints = dailyQuestions.reduce((sum, q) => {
        if (answers[q.id] !== undefined || textResponses[q.id] !== undefined) {
          return sum + q.points;
        }
        return sum;
      }, 0);

      // Atualizar sessão como completa
      const { error: updateError } = await supabase
        .from('daily_mission_sessions')
        .update({
          is_completed: true,
          total_points: totalPoints,
          completed_sections: ['morning', 'habits', 'mindset']
        })
        .eq('id', session.id);

      if (updateError) {
        console.error('Error completing mission:', updateError);
        return;
      }

      setSession(prev => prev ? { ...prev, is_completed: true, total_points: totalPoints } : null);

      toast({
        title: "Missão do Dia Completa! 🎉",
        description: `Parabéns! Você ganhou ${totalPoints} pontos hoje!`,
      });

      // UI otimista de gamificação removida: evitar erro 400 por challenge_id mock
      console.debug('[DailyMissions] Missão completa - gamificação adiada (sem challenge_id válido)');

      // Recarregar página após 3 segundos
      setTimeout(() => {
        window.location.reload();
      }, 3000);

    } catch (error) {
      console.error('Error in completeDailyMission:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [user, session, answers, textResponses, isSubmitting, toast]);

  // Calcular estatísticas
  const stats = {
    totalQuestions: dailyQuestions.length,
    answeredQuestions: Object.keys(answers).length + Object.keys(textResponses).length,
    totalPoints: dailyQuestions.reduce((sum, q) => {
      if (answers[q.id] !== undefined || textResponses[q.id] !== undefined) {
        return sum + q.points;
      }
      return sum;
    }, 0),
    progressPercentage: dailyQuestions.length > 0 
      ? ((Object.keys(answers).length + Object.keys(textResponses).length) / dailyQuestions.length) * 100 
      : 0,
    completedSections: session?.completed_sections?.length || 0
  };

  return {
    loading,
    session,
    answers,
    textResponses,
    expandedSections,
    isSubmitting,
    stats,
    saveAnswer,
    toggleSection,
    completeDailyMission,
    reloadSession: loadTodaysSession
  };
}; 