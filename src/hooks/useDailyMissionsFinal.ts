import { useState, useEffect, useCallback } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useEnhancedGamification } from '@/hooks/useEnhancedGamification';
import { dailyQuestionsFinal } from '@/data/daily-questions-final';
import { calculateWaterIntake, calculateSleepHours } from '@/data/daily-questions-final';
import { DailyQuestion, DailyResponse, DailyMissionSession } from '@/types/daily-missions';

interface UseDailyMissionsFinalProps {
  user: User | null;
}

export const useDailyMissionsFinal = ({ user }: UseDailyMissionsFinalProps) => {
  const [answers, setAnswers] = useState<Record<string, string | number>>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [session, setSession] = useState<DailyMissionSession | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const { updateChallengeProgress, completeChallenge } = useEnhancedGamification();

  const allQuestions = dailyQuestionsFinal.sort((a, b) => a.order - b.order);
  const currentQuestion = allQuestions[currentQuestionIndex];
  const progress = (currentQuestionIndex / allQuestions.length) * 100;

  // Carregar sessão existente
  useEffect(() => {
    if (!user) return;

    const loadSession = async () => {
      const today = new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('daily_mission_sessions')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', today)
        .maybeSingle();

      if (data && !error) {
        setSession({
          ...data,
          completed_sections: data.completed_sections as any[]
        });
        setIsCompleted(data.is_completed);
        
        // Carregar respostas existentes
        const { data: responses } = await supabase
          .from('daily_responses')
          .select('*')
          .eq('user_id', user.id)
          .eq('date', today);

        if (responses) {
          const answersMap: Record<string, string | number> = {};
          responses.forEach(response => {
            answersMap[response.question_id] = response.answer;
          });
          setAnswers(answersMap);
        }
      }
    };

    loadSession();
  }, [user]);

  // Salvar resposta individual
  const saveAnswer = useCallback(async (questionId: string, answer: string | number) => {
    if (!user) return;

    setIsLoading(true);
    const today = new Date().toISOString().split('T')[0];
    const question = allQuestions.find(q => q.id === questionId);
    
    if (!question) {
      setIsLoading(false);
      return;
    }

    try {
      // Sempre inserir nova resposta para manter histórico completo de evolução
      const { error: responseError } = await supabase
        .from('daily_responses')
        .insert({
          user_id: user.id,
          date: today,
          section: question.section,
          question_id: questionId,
          answer: answer.toString(),
          points_earned: question.points,
          created_at: new Date().toISOString()
        });
      
      if (responseError) throw responseError;

      // Salvar dados de tracking específicos
      if (question.tracking) {
        await saveTrackingData(question.tracking, answer);
      }

      console.log(`Resposta salva: ${questionId} = ${answer}`);
    } catch (error) {
      console.error('Erro ao salvar resposta:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user, allQuestions]);

  // Salvar dados de tracking específicos
  const saveTrackingData = async (trackingType: string, answer: string | number) => {
    if (!user) return;

    const today = new Date().toISOString().split('T')[0];
    
    try {
      switch (trackingType) {
        case 'water_intake':
          const waterAmount = calculateWaterIntake(answer.toString());
          
          // Verificar se já existe entrada para hoje
          const { data: existingDiary } = await supabase
            .from('health_diary')
            .select('id')
            .eq('user_id', user.id)
            .eq('date', today)
            .maybeSingle();

          if (existingDiary) {
            // Atualizar entrada existente
            await supabase
              .from('health_diary')
              .update({
                water_intake: waterAmount,
                notes: `Água: ${waterAmount}L`
              })
              .eq('id', existingDiary.id);
          } else {
            // Criar nova entrada
            await supabase
              .from('health_diary')
              .insert({
                user_id: user.id,
                date: today,
                water_intake: waterAmount,
                notes: `Água: ${waterAmount}L`
              });
          }
          break;

        case 'sleep_hours':
          const sleepHours = calculateSleepHours(answer.toString());
          
          const { data: existingSleep } = await supabase
            .from('health_diary')
            .select('id')
            .eq('user_id', user.id)
            .eq('date', today)
            .maybeSingle();

          if (existingSleep) {
            await supabase
              .from('health_diary')
              .update({
                sleep_hours: sleepHours,
                notes: `Sono: ${sleepHours} horas`
              })
              .eq('id', existingSleep.id);
          } else {
            await supabase
              .from('health_diary')
              .insert({
                user_id: user.id,
                date: today,
                sleep_hours: sleepHours,
                notes: `Sono: ${sleepHours} horas`
              });
          }
          break;

        case 'energy_level':
        case 'stress_level':
        case 'day_rating':
          const { data: existingRating } = await supabase
            .from('health_diary')
            .select('id')
            .eq('user_id', user.id)
            .eq('date', today)
            .maybeSingle();

          const updateData: any = {
            notes: `${trackingType}: ${answer}`
          };
          
          if (trackingType === 'energy_level') updateData.energy_level = answer as number;
          if (trackingType === 'day_rating') updateData.mood_rating = answer as number;

          if (existingRating) {
            await supabase
              .from('health_diary')
              .update(updateData)
              .eq('id', existingRating.id);
          } else {
            await supabase
              .from('health_diary')
              .insert({
                user_id: user.id,
                date: today,
                ...updateData
              });
          }
          break;

        case 'small_victory':
          const { data: existingVictory } = await supabase
            .from('health_diary')
            .select('id')
            .eq('user_id', user.id)
            .eq('date', today)
            .maybeSingle();

          if (existingVictory) {
            await supabase
              .from('health_diary')
              .update({
                notes: answer.toString(),
                mood_rating: 5
              })
              .eq('id', existingVictory.id);
          } else {
            await supabase
              .from('health_diary')
              .insert({
                user_id: user.id,
                date: today,
                notes: answer.toString(),
                mood_rating: 5
              });
          }
          break;
      }
    } catch (error) {
      console.error(`Erro ao salvar tracking ${trackingType}:`, error);
    }
  };

  // Completar missão
  const completeMission = useCallback(async () => {
    if (!user) return;

    setIsLoading(true);
    const today = new Date().toISOString().split('T')[0];
    const totalPoints = allQuestions.reduce((sum, q) => {
      return answers[q.id] !== undefined ? sum + q.points : sum;
    }, 0);

    try {
      // Verificar se sessão já existe
      const { data: existingSession } = await supabase
        .from('daily_mission_sessions')
        .select('id')
        .eq('user_id', user.id)
        .eq('date', today)
        .maybeSingle();

      if (existingSession) {
        // Atualizar sessão existente
        const { error: sessionError } = await supabase
          .from('daily_mission_sessions')
          .update({
            completed_sections: ['morning', 'habits', 'mindset'],
            total_points: totalPoints,
            is_completed: true,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingSession.id);
        
        if (sessionError) throw sessionError;
      } else {
        // Criar nova sessão
        const { error: sessionError } = await supabase
          .from('daily_mission_sessions')
          .insert({
            user_id: user.id,
            date: today,
            completed_sections: ['morning', 'habits', 'mindset'],
            total_points: totalPoints,
            is_completed: true,
            updated_at: new Date().toISOString()
          });
        
        if (sessionError) throw sessionError;
      }

      setIsCompleted(true);
      console.log('Missão completa!', { totalPoints, answers });

      // Gamificação mock removida para evitar erro 400 por challenge_id inválido
      console.debug('[DailyMissionsFinal] Gamificação adiada (sem challenge_id válido)');
    } catch (error) {
      console.error('Erro ao completar missão:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user, answers, allQuestions]);

  // Handlers para diferentes tipos de resposta
  const handleAnswer = useCallback(async (answer: string | number) => {
    setAnswers(prev => ({ ...prev, [currentQuestion.id]: answer }));
    
    // Salvar resposta
    await saveAnswer(currentQuestion.id, answer);
    
    // Avançar para próxima pergunta
    if (currentQuestionIndex < allQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      // Última pergunta - completar missão
      await completeMission();
    }
  }, [currentQuestion, currentQuestionIndex, allQuestions.length, saveAnswer, completeMission]);

  const handleScaleAnswer = useCallback((value: number) => {
    handleAnswer(value);
  }, [handleAnswer]);

  const handleMultipleChoice = useCallback((option: string) => {
    handleAnswer(option);
  }, [handleAnswer]);

  const handleYesNo = useCallback((answer: boolean) => {
    handleAnswer(answer ? 'Sim' : 'Não');
  }, [handleAnswer]);

  const handleTextInput = useCallback((text: string) => {
    handleAnswer(text);
  }, [handleAnswer]);

  const handleStarRating = useCallback((rating: number) => {
    console.log('Star rating selected:', rating);
    handleAnswer(rating);
  }, [handleAnswer]);

  return {
    currentQuestion,
    currentQuestionIndex,
    progress,
    answers,
    isLoading,
    isCompleted,
    session,
    handleScaleAnswer,
    handleMultipleChoice,
    handleYesNo,
    handleTextInput,
    handleStarRating,
    allQuestions
  };
}; 