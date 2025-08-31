// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Trophy, Users, Calendar, Target, Dumbbell, 
  Droplets, Brain, Apple, Moon, Scale, Timer, ArrowLeft, 
  Star, Zap, CheckCircle, Plus, Flame
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import { UpdateDesafioProgressModal } from '@/components/gamification/UpdateDesafioProgressModal';
import { User } from '@supabase/supabase-js';
import { VisualEffectsManager } from '@/components/gamification/VisualEffectsManager';
import { useCelebrationEffects } from '@/hooks/useCelebrationEffects';
import { useNavigate } from 'react-router-dom';

interface Desafio {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  duration_days: number;
  points_reward: number;
  badge_icon: string;
  badge_name: string;
  instructions: string;
  tips: string[];
  is_active: boolean;
  is_featured: boolean;
  is_group_challenge: boolean;
  daily_log_target: number;
  daily_log_unit: string;
  user_participation?: {
    id: string;
    progress: number;
    is_completed: boolean;
    started_at: string;
  };
}

interface DesafiosSectionProps {
  user: User | null;
}

const DesafiosSection: React.FC<DesafiosSectionProps> = ({ user }) => {
  const [desafios, setDesafios] = useState<Desafio[]>([]);
  const [selectedDesafio, setSelectedDesafio] = useState<Desafio | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const { toast } = useToast();
  const { activeCelebration, celebrateDesafioCompletion } = useCelebrationEffects();
  const navigate = useNavigate();

  useEffect(() => {
    fetchDesafios();
  }, []);

  const fetchDesafios = async () => {
    try {
      setLoading(true);
      // const supabase = supabase;
      
      // Buscar desafios do banco de dados
      const { data: desafiosData, error } = await supabase
        .from('challenges')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar desafios:', error);
        throw error;
      }

      // Buscar participações do usuário
      const { data: participationsData, error: participationsError } = await supabase
        .from('challenge_participations')
        .select('*')
        .eq('user_id', user?.id);

      if (participationsError) {
        console.error('Erro ao buscar participações:', participationsError);
      }

      // Transformar dados
      const transformedDesafios = desafiosData?.map(desafio => {
        const userParticipation = participationsData?.find(p => p.challenge_id === desafio.id);
        
        return {
          id: desafio.id,
          title: desafio.title,
          description: desafio.description,
          category: desafio.category || 'exercicio',
          difficulty: desafio.difficulty || 'medio',
          duration_days: desafio.duration_days || 7,
          points_reward: desafio.points_reward || 100,
          badge_icon: desafio.badge_icon || '🏆',
          badge_name: desafio.badge_name || desafio.title,
          instructions: desafio.instructions || desafio.description,
          tips: desafio.tips || ['Complete diariamente', 'Mantenha a consistência'],
          is_active: desafio.is_active ?? true,
          is_featured: desafio.is_featured ?? false,
          is_group_challenge: desafio.is_group_challenge ?? false,
          daily_log_target: desafio.daily_log_target || 1,
          daily_log_unit: desafio.daily_log_unit || 'unidade',
          user_participation: userParticipation ? {
            id: userParticipation.id,
            progress: userParticipation.progress || 0,
            is_completed: userParticipation.is_completed || false,
            started_at: userParticipation.started_at
          } : null
        };
      }) || [];
      
      setDesafios(transformedDesafios);
    } catch (error) {
      console.error('Erro ao carregar desafios:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os desafios",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'exercicio': return <Dumbbell className="h-5 w-5" />;
      case 'hidratacao': return <Droplets className="h-5 w-5" />;
      case 'nutricao': return <Apple className="h-5 w-5" />;
      case 'sono': return <Moon className="h-5 w-5" />;
      case 'mindfulness': return <Brain className="h-5 w-5" />;
      default: return <Target className="h-5 w-5" />;
    }
  };

  const getDifficultyGradient = (difficulty: string) => {
    switch (difficulty) {
      case 'facil': return 'from-green-500 to-green-600';
      case 'medio': return 'from-yellow-500 to-orange-500';
      case 'dificil': return 'from-orange-500 to-red-500';
      case 'extremo': return 'from-red-500 to-pink-500';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case 'facil': return 'Fácil';
      case 'medio': return 'Médio';
      case 'dificil': return 'Difícil';
      case 'extremo': return 'Extremo';
      default: return 'Médio';
    }
  };

  const handleDesafioClick = (desafio: Desafio) => {
    // Se o usuário já está participando, abrir modal de progresso
    if (desafio.user_participation) {
      setSelectedDesafio(desafio);
      setShowUpdateModal(true);
    } else {
      // Se não está participando, só selecionar o desafio
      setSelectedDesafio(desafio);
    }
  };

  const participarDesafio = async (desafioId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Proteção contra duplo clique
    if (isLoading) return;
    
    if (!user) {
      toast({
        title: "Login necessário",
        description: "Faça login para participar dos desafios",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsLoading(true);
      // const supabase = supabase;
      
      console.log('🔍 Usuário logado:', user.email, 'ID:', user.id);
      
      // Buscar o desafio para obter informações
      const desafio = desafios.find(d => d.id === desafioId);
      if (!desafio) {
        throw new Error("Desafio não encontrado");
      }

      // Verificar se já está participando
      const { data: existingParticipation, error: checkError } = await supabase
        .from('challenge_participations')
        .select('id, progress, is_completed, started_at')
        .eq('user_id', user.id)
        .eq('challenge_id', desafioId)
        .maybeSingle();

      if (checkError) {
        console.error('Erro ao verificar participação:', checkError);
        throw checkError;
      }

      if (existingParticipation) {
        toast({
          title: "Já participando",
          description: `Você já está participando deste desafio (${existingParticipation.progress}% concluído)`,
        });
        
        // Atualizar estado local para mostrar que já está participando
        setDesafios(prev => prev.map(d => 
          d.id === desafioId 
            ? {
                ...d,
                user_participation: {
                  id: existingParticipation.id,
                  progress: existingParticipation.progress,
                  is_completed: existingParticipation.is_completed,
                  started_at: existingParticipation.started_at
                }
              }
            : d
        ));
        
        return;
      }

      // Inserir participação diretamente na tabela
      const { data: joinResult, error } = await supabase
        .from('challenge_participations')
        .insert({
          user_id: user.id,
          challenge_id: desafioId,
          target_value: desafio.daily_log_target || 1,
          progress: 0,
          started_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('Erro ao inserir participação:', error);
        
        // Se for erro de chave duplicada, buscar a participação existente
        if (error.code === '23505' && error.message.includes('challenge_participations_challenge_id_user_id_key')) {
          console.log('🔄 Erro de chave duplicada detectado, buscando participação existente...');
          
          const { data: existingParticipation, error: fetchError } = await supabase
            .from('challenge_participations')
            .select('id, progress, is_completed, started_at')
            .eq('user_id', user.id)
            .eq('challenge_id', desafioId)
            .single();

          if (!fetchError && existingParticipation) {
            toast({
              title: "Já participando",
              description: `Você já está participando deste desafio (${existingParticipation.progress}% concluído)`,
            });
            
            // Atualizar estado local
            setDesafios(prev => prev.map(d => 
              d.id === desafioId 
                ? {
                    ...d,
                    user_participation: {
                      id: existingParticipation.id,
                      progress: existingParticipation.progress,
                      is_completed: existingParticipation.is_completed,
                      started_at: existingParticipation.started_at
                    }
                  }
                : d
            ));
            
            // Recarregar para sincronizar com o banco
            fetchDesafios();
            return;
          }
        }
        
        throw error;
      }

      toast({
        title: "Participação confirmada!",
        description: "Você agora está participando do desafio!",
      });

      // Efeito de celebração
      celebrateDesafioCompletion();

      // Recarregar desafios
      fetchDesafios();
    } catch (error: any) {
      console.error('❌ Erro ao participar do desafio:', error);
      
      // Mensagem de erro mais amigável
      let errorMessage = 'Erro ao participar do desafio';
      
      if (error.code === '23505') {
        errorMessage = 'Você já está participando deste desafio';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Erro ao participar do desafio",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateProgress = (desafio: Desafio) => {
    setSelectedDesafio(desafio);
    setShowUpdateModal(true);
  };

  const handleProgressUpdate = (newProgress: number) => {
    if (selectedDesafio) {
      // Atualizar estado local
      setDesafios(prev => prev.map(desafio => 
        desafio.id === selectedDesafio.id 
          ? {
              ...desafio,
              user_participation: desafio.user_participation ? {
                ...desafio.user_participation,
                progress: newProgress,
                is_completed: newProgress >= 100
              } : desafio.user_participation
            }
          : desafio
      ));

      // Atualizar desafio selecionado
      setSelectedDesafio(prev => prev ? {
        ...prev,
        user_participation: prev.user_participation ? {
          ...prev.user_participation,
          progress: newProgress,
          is_completed: newProgress >= 100
        } : prev.user_participation
      } : null);
    }
    setShowUpdateModal(false);
  };

  const renderDesafiosList = (desafiosToRender: Desafio[] = desafios) => {
    if (loading) {
      return (
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      );
    }

    if (desafiosToRender.length === 0) {
      return (
        <div className="text-center p-8 text-muted-foreground">
          Nenhum desafio disponível no momento.
        </div>
      );
    }

    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {desafiosToRender.map((desafio) => {
          const isParticipating = desafio.user_participation !== null;
          const progress = desafio.user_participation?.progress || 0;
          const isCompleted = desafio.user_participation?.is_completed || false;

          return (
            <motion.div
              key={desafio.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card 
                className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${
                  isCompleted ? 'border-green-500 bg-green-50 dark:bg-green-950' : ''
                }`}
                onClick={() => handleDesafioClick(desafio)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{desafio.badge_icon}</span>
                      <div>
                        <CardTitle className="text-lg">{desafio.title}</CardTitle>
                        <CardDescription className="text-sm">
                          {desafio.description}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <Badge 
                        variant={isCompleted ? "default" : "secondary"}
                        className={`${
                          isCompleted ? 'bg-green-500' : ''
                        }`}
                      >
                        {isCompleted ? 'Concluído' : getDifficultyText(desafio.difficulty)}
                      </Badge>
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${
                          desafio.is_group_challenge 
                            ? 'border-blue-500 text-blue-600' 
                            : 'border-orange-500 text-orange-600'
                        }`}
                      >
                        {desafio.is_group_challenge ? 'Público' : 'Individual'}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>🎯 {desafio.daily_log_target} {desafio.daily_log_unit}/dia</span>
                    <span>⏱️ {desafio.duration_days} dias</span>
                  </div>

                  {isParticipating && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progresso</span>
                        <span>{Math.round(progress)}%</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Trophy className="h-4 w-4" />
                      <span>{desafio.points_reward} pontos</span>
                    </div>
                    
                    {isParticipating ? (
                      <Button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUpdateProgress(desafio);
                        }}
                        size="sm"
                        className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                      >
                        Atualizar Progresso
                      </Button>
                    ) : (
                      <Button 
                        onClick={(e) => participarDesafio(desafio.id, e)}
                        size="sm"
                        className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700"
                      >
                        Participar do Desafio
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Todos os Desafios Disponíveis</h2>
          <p className="text-muted-foreground">
            Participe dos desafios individuais e públicos para ganhar pontos e melhorar sua saúde
          </p>
        </div>
      </div>

      {/* Todos os Desafios */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Trophy className="h-5 w-5" />
          Todos os Desafios
        </h3>
        {renderDesafiosList(desafios)}
      </div>

      {selectedDesafio && (
        <UpdateDesafioProgressModal
          desafio={selectedDesafio}
          isOpen={showUpdateModal}
          onClose={() => setShowUpdateModal(false)}
          onProgressUpdate={handleProgressUpdate}
        />
      )}

      <VisualEffectsManager 
        trigger={activeCelebration} 
        effectType="celebration"
        duration={3000}
      />
    </div>
  );
};

export default DesafiosSection; 