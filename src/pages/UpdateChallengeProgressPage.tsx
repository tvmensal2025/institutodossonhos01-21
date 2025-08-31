import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Slider } from '@/components/ui/slider';
import { Camera, Plus, Zap, Trophy, Target, Award, Star, Clock, Flame, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { ProgressRing } from '@/components/gamification/ProgressRing';
import { ConfettiAnimation, useConfetti } from '@/components/gamification/ConfettiAnimation';
import { VisualEffectsManager, useAlternatingEffects } from '@/components/gamification/VisualEffectsManager';

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
  daily_log_target: number;
  daily_log_unit: string;
  is_group_challenge: boolean;
  user_participation?: {
    id: string;
    progress: number;
    is_completed: boolean;
    started_at: string;
  };
}

const difficultyColors = {
  facil: 'from-green-500 to-green-600',
  medio: 'from-yellow-500 to-orange-500',
  dificil: 'from-orange-500 to-red-500',
  extremo: 'from-red-500 to-pink-500'
};

const difficultyIcons = {
  facil: Star,
  medio: Target,
  dificil: Trophy,
  extremo: Flame
};

export default function UpdateChallengeProgressPage({ user }: { user: User | null }) {
  const { challengeId } = useParams<{ challengeId: string }>();
  const navigate = useNavigate();
  const [desafio, setDesafio] = useState<Desafio | null>(null);
  const [newValue, setNewValue] = useState(0);
  const [notes, setNotes] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [shareToFeed, setShareToFeed] = useState(false);
  const [customMessage, setCustomMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { trigger, celebrate } = useConfetti();
  const { trigger: effectTrigger, currentEffect, celebrateWithEffects } = useAlternatingEffects();

  useEffect(() => {
    if (challengeId) {
      loadDesafio();
    }
  }, [challengeId]);

  const loadDesafio = async () => {
    if (!challengeId || !user) {
      console.log('ChallengeId ou user não encontrado:', { challengeId, userId: user?.id });
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      // Buscar desafio
      const { data: desafioData, error: desafioError } = await supabase
        .from('challenges')
        .select('*')
        .eq('id', challengeId)
        .single();

      if (desafioError) throw desafioError;

      // Buscar participação do usuário
      const { data: participacaoData, error: participacaoError } = await supabase
        .from('challenge_participations')
        .select('*')
        .eq('challenge_id', challengeId)
        .eq('user_id', user.id)
        .single();

      if (participacaoError && participacaoError.code !== 'PGRST116') {
        console.error('Erro ao buscar participação:', participacaoError);
      }

      const desafioCompleto: Desafio = {
        ...desafioData,
        user_participation: participacaoData ? {
          id: participacaoData.id,
          progress: participacaoData.progress || 0,
          is_completed: participacaoData.is_completed || false,
          started_at: participacaoData.started_at
        } : undefined
      };

      setDesafio(desafioCompleto);
      setNewValue(participacaoData?.progress || 0);
    } catch (error) {
      console.error('Erro ao carregar desafio:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar o desafio",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateProgress = (value: number) => {
    if (!desafio?.daily_log_target || desafio.daily_log_target === 0) return 0;
    return Math.min((value / desafio.daily_log_target) * 100, 100);
  };

  const progressPercentage = calculateProgress(newValue);
  const isCompleted = newValue >= (desafio?.daily_log_target || 0);
  const isNearComplete = progressPercentage >= 80;
  const DifficultyIcon = desafio ? difficultyIcons[desafio.difficulty as keyof typeof difficultyIcons] || Target : Target;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!desafio || !user) return;
    
    // Proteção contra duplo clique
    if (isLoading) return;
    
    setIsLoading(true);

    try {
      // Verificar se usuário está participando
      if (!desafio.user_participation) {
        // Criar participação se não existir
        const { error: insertError } = await supabase
          .from('challenge_participations')
          .insert({
            challenge_id: desafio.id,
            user_id: user.id,
            progress: newValue,
            is_completed: isCompleted,
            started_at: new Date().toISOString()
          });

        if (insertError) throw insertError;
      } else {
        // Atualizar participação existente
        const { error: updateError } = await supabase
          .from('challenge_participations')
          .update({
            progress: newValue,
            is_completed: isCompleted,
            updated_at: new Date().toISOString()
          })
          .eq('id', desafio.user_participation.id);

        if (updateError) throw updateError;
      }

      // Adicionar pontos se completou
      if (isCompleted && !desafio.user_participation?.is_completed) {
        const { error: pointsError } = await supabase
          .from('profiles')
          .update({
            points: desafio.points_reward,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id);

        if (pointsError) {
          console.error('Erro ao adicionar pontos:', pointsError);
        }
      }

      // Log simples já que daily_tracking não existe
      if (notes) {
        console.log('Progress logged:', {
          user_id: user.id,
          challenge_id: desafio.id,
          value: newValue,
          notes: notes
        });
      }

      // Efeitos de celebração
      if (isCompleted) {
        celebrateWithEffects();
        celebrate();
        toast({
          title: "🎉 Desafio Concluído!",
          description: `Parabéns! Você ganhou ${desafio.points_reward} pontos!`,
        });
      } else {
        celebrateWithEffects();
        toast({
          title: "💪 Progresso Atualizado!",
          description: `${newValue} ${desafio.daily_log_unit} registrados`,
        });
      }

      // Voltar para a página anterior
      navigate(-1);
    } catch (error: any) {
      console.error('Erro ao atualizar progresso:', error);
      toast({
        title: "Erro",
        description: error.message || "Não foi possível atualizar o progresso.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAdd = (increment: number) => {
    if (!desafio) return;
    const newVal = Math.min(newValue + increment, desafio.daily_log_target);
    setNewValue(newVal);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando desafio...</p>
        </div>
      </div>
    );
  }

  if (!desafio) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4">Desafio não encontrado</h2>
        <Button onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Atualizar Progresso</h1>
          <p className="text-muted-foreground">{desafio.title}</p>
        </div>
      </div>

      {/* Efeitos Visuais */}
      <ConfettiAnimation trigger={trigger} />
      <VisualEffectsManager 
        trigger={effectTrigger} 
        effectType={currentEffect}
        duration={3000}
      />

      {/* Card Principal */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <motion.div
              className={`p-3 bg-gradient-to-br ${difficultyColors[desafio.difficulty as keyof typeof difficultyColors]} rounded-full`}
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <DifficultyIcon className="w-6 h-6 text-white" />
            </motion.div>
            <div>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">{desafio.badge_icon}</span>
                {desafio.title}
              </CardTitle>
              <p className="text-muted-foreground">{desafio.description}</p>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Progresso Atual */}
            <div className="space-y-2">
              <Label>Progresso Atual</Label>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <Input
                    type="number"
                    value={newValue}
                    onChange={(e) => setNewValue(Number(e.target.value))}
                    min={0}
                    max={desafio.daily_log_target}
                    step={0.1}
                    className="text-center"
                  />
                </div>
                <span className="text-sm text-muted-foreground">
                  / {desafio.daily_log_target} {desafio.daily_log_unit}
                </span>
              </div>
              
              {/* Slider */}
              <Slider
                value={[newValue]}
                onValueChange={(value) => setNewValue(value[0])}
                max={desafio.daily_log_target}
                step={0.1}
                className="w-full"
              />
            </div>

            {/* Barra de Progresso */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progresso</span>
                <span>{Math.round(progressPercentage)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className={`h-3 rounded-full transition-all duration-300 ${
                    isCompleted ? 'bg-green-500' : 
                    isNearComplete ? 'bg-yellow-500' : 'bg-blue-500'
                  }`}
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
            </div>

            {/* Botões Rápidos */}
            <div className="space-y-2">
              <Label>Adicionar Rápido</Label>
              <div className="flex gap-2 flex-wrap">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickAdd(0.5)}
                >
                  +0.5
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickAdd(1)}
                >
                  +1
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickAdd(2)}
                >
                  +2
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setNewValue(desafio.daily_log_target)}
                >
                  Completar
                </Button>
              </div>
            </div>

            {/* Notas (Opcional) */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notas (Opcional)</Label>
              <Textarea
                id="notes"
                placeholder="Como foi sua experiência hoje?"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>

            {/* Compartilhamento */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="share"
                  checked={shareToFeed}
                  onCheckedChange={(checked) => setShareToFeed(checked as boolean)}
                />
                <Label htmlFor="share">Compartilhar na comunidade</Label>
              </div>
              
              {shareToFeed && (
                <div className="space-y-2">
                  <Label htmlFor="message">Mensagem personalizada</Label>
                  <Textarea
                    id="message"
                    placeholder="Compartilhe sua conquista!"
                    value={customMessage}
                    onChange={(e) => setCustomMessage(e.target.value)}
                    rows={2}
                  />
                </div>
              )}
            </div>

            {/* Botão Salvar */}
            <Button 
              type="submit" 
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? 'Salvando...' : 'Salvar Progresso'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 