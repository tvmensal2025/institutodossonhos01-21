// @ts-nocheck
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Slider } from '@/components/ui/slider';
import { Camera, Plus, Zap, Trophy, Target, Award, Star, Clock, Flame } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { ProgressRing } from '@/components/gamification/ProgressRing';
import { ConfettiAnimation, useConfetti } from '@/components/gamification/ConfettiAnimation';
import { VisualEffectsManager, useAlternatingEffects } from '@/components/gamification/VisualEffectsManager';
import { useCommunityShare } from '@/hooks/useCommunityShare';

interface Challenge {
  id: string;
  title: string;
  target_value: number;
  current: number;
  unit: string;
  difficulty: 'easy' | 'medium' | 'hard';
  xp_reward: number;
  type: 'individual' | 'community';
}

interface UpdateChallengeProgressModalProps {
  challenge?: Challenge;
  onUpdate?: () => void;
  children?: React.ReactNode;
  // Alternative props for external control
  isOpen?: boolean;
  onClose?: () => void;
  challengeId?: string;
  challengeTitle?: string;
  currentProgress?: number;
  onProgressUpdate?: (newProgress: number) => void;
}

const difficultyColors = {
  easy: 'from-green-500 to-green-600',
  medium: 'from-yellow-500 to-orange-500',
  hard: 'from-red-500 to-pink-500'
};

const difficultyIcons = {
  easy: Star,
  medium: Target,
  hard: Trophy
};

export const UpdateChallengeProgressModal = ({ 
  challenge, 
  onUpdate, 
  children,
  isOpen,
  onClose,
  challengeId,
  challengeTitle,
  currentProgress,
  onProgressUpdate
}: UpdateChallengeProgressModalProps) => {
  // Support both usage patterns
  const isExternallyControlled = isOpen !== undefined;
  const [open, setOpen] = useState(false);
  
  // Create mock challenge from props if not provided
  const effectiveChallenge = challenge || {
    id: challengeId || '',
    title: challengeTitle || '',
    target_value: 100,
    current: currentProgress || 0,
    unit: 'pontos',
    difficulty: 'medium' as const,
    xp_reward: 100,
    type: 'individual' as const
  };
  
  const [newValue, setNewValue] = useState(effectiveChallenge.current);
  const [notes, setNotes] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [shareToFeed, setShareToFeed] = useState(false);
  const [customMessage, setCustomMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { trigger, celebrate } = useConfetti();
  const { trigger: effectTrigger, currentEffect, celebrateWithEffects } = useAlternatingEffects();
  const { shareToHealthFeed, generateProgressMessage, suggestTags, isSharing } = useCommunityShare();

  const calculateProgress = (value: number) => {
    if (!effectiveChallenge.target_value || effectiveChallenge.target_value === 0) return 0;
    return Math.min((value / effectiveChallenge.target_value) * 100, 100);
  };

  const progressPercentage = calculateProgress(newValue);
  const isCompleted = newValue >= effectiveChallenge.target_value;
  const isNearComplete = progressPercentage >= 80;
  const DifficultyIcon = difficultyIcons[effectiveChallenge.difficulty];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Buscar participação do usuário no desafio
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      // For external control, use callback instead of database update
      if (onProgressUpdate) {
        onProgressUpdate(progressPercentage);
        onClose?.();
        
        if (isCompleted) {
          celebrateWithEffects();
          toast({
            title: "🎉 Desafio Concluído!",
            description: `Parabéns! Você ganhou ${effectiveChallenge.xp_reward} XP!`,
          });
        } else {
          celebrateWithEffects();
          toast({
            title: "💪 Progresso Atualizado!",
            description: `${newValue} ${effectiveChallenge.unit} registrados`,
          });
        }
        return;
      }

      // Buscar participação do usuário
      const { data: participationData, error: participationError } = await supabase
        .from('challenge_participations')
        .select('*')
        .eq('user_id', user.id)
        .eq('challenge_id', effectiveChallenge.id)
        .single();

      if (participationError) {
        throw new Error('Participação não encontrada. Participe do desafio primeiro.');
      }

      // Atualizar progresso diretamente na tabela
      const { data: updateResult, error: updateError } = await supabase
        .from('challenge_participations')
        .update({
          progress: newValue,
          current_streak: newValue > participationData.progress ? participationData.current_streak + 1 : participationData.current_streak,
          updated_at: new Date().toISOString()
        })
        .eq('id', participationData.id)
        .select();

      if (updateError) {
        throw updateError;
      }

      if (isCompleted) {
        celebrateWithEffects();
        toast({
          title: "🎉 Desafio Concluído!",
          description: `Parabéns! Você ganhou ${effectiveChallenge.xp_reward} XP!`,
        });
      } else {
        celebrateWithEffects();
        toast({
          title: "💪 Progresso Atualizado!",
          description: `${newValue} ${effectiveChallenge.unit} registrados`,
        });
      }

      setOpen(false);
      onUpdate?.();
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
    const newVal = Math.min(newValue + increment, effectiveChallenge.target_value);
    setNewValue(newVal);
  };

  return (
    <>
      <ConfettiAnimation trigger={trigger} />
      <VisualEffectsManager 
        trigger={effectTrigger} 
        effectType={currentEffect}
        duration={3000}
      />
      
      <Dialog open={isExternallyControlled ? isOpen : open} onOpenChange={isExternallyControlled ? onClose : setOpen}>
        <DialogTrigger asChild>
          {children}
        </DialogTrigger>
        
        <DialogContent className="w-[95vw] sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <motion.div
                className={`p-2 bg-gradient-to-br ${difficultyColors[effectiveChallenge.difficulty]} rounded-full`}
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <DifficultyIcon className="w-5 h-5 text-white" />
              </motion.div>
              Atualizar Desafio
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Header do desafio */}
            <div className="text-center space-y-3">
              <h3 className="font-semibold text-xl">{effectiveChallenge.title}</h3>
              
              <div className="flex items-center justify-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <Target className="w-4 h-4" />
                  <span>Meta: {effectiveChallenge.target_value} {effectiveChallenge.unit}</span>
                </div>
                <Badge className={`bg-gradient-to-r ${difficultyColors[effectiveChallenge.difficulty]} text-white border-0`}>
                  {effectiveChallenge.difficulty.toUpperCase()}
                </Badge>
                {effectiveChallenge.type === 'community' && (
                  <Badge variant="outline">Comunidade</Badge>
                )}
              </div>
            </div>

            {/* Progress Ring Central */}
            <div className="flex items-center justify-center py-6">
              <ProgressRing
                progress={progressPercentage}
                size={140}
                strokeWidth={8}
                gradientColors={[
                  effectiveChallenge.difficulty === 'easy' ? '#10B981' : 
                  effectiveChallenge.difficulty === 'medium' ? '#F59E0B' : '#EF4444',
                  isCompleted ? '#10B981' : '#3B82F6'
                ]}
                animated={true}
              >
                <div className="text-center">
                  <motion.div 
                    className="text-3xl font-bold mb-1"
                    animate={progressPercentage > calculateProgress(effectiveChallenge.current) ? { scale: [1, 1.2, 1] } : {}}
                  >
                    {Math.round(progressPercentage)}%
                  </motion.div>
                  <div className="text-sm text-muted-foreground">
                    {newValue}/{effectiveChallenge.target_value}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {effectiveChallenge.unit}
                  </div>
                </div>
              </ProgressRing>
            </div>

            {/* Celebração de conclusão */}
            <AnimatePresence>
              {isCompleted && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="text-center p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border-2 border-yellow-200"
                >
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 0.5, repeat: 3 }}
                  >
                    <Trophy className="w-12 h-12 text-yellow-600 mx-auto mb-2" />
                  </motion.div>
                  <p className="text-yellow-800 font-bold text-lg">Desafio Concluído! 🎉</p>
                  <p className="text-yellow-700">
                    Você ganhou <span className="font-semibold">{effectiveChallenge.xp_reward} XP</span>!
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Indicador "Quase lá" */}
            <AnimatePresence>
              {isNearComplete && !isCompleted && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-center p-3 bg-orange-50 rounded-lg border border-orange-200"
                >
                  <div className="flex items-center justify-center gap-2">
                    <Flame className="w-5 h-5 text-orange-500" />
                    <span className="text-orange-700 font-medium">Quase lá! Continue assim! 🔥</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Controles de valor */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="progress-value">Progresso Atual</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Input
                    id="progress-value"
                    type="number"
                    min="0"
                    max={effectiveChallenge.target_value}
                    value={newValue}
                    onChange={(e) => setNewValue(Number(e.target.value))}
                    className="flex-1"
                  />
                  <span className="text-sm text-muted-foreground min-w-fit">
                    {effectiveChallenge.unit}
                  </span>
                </div>
              </div>

              {/* Slider visual */}
              <div>
                <Label>Controle Visual</Label>
                <div className="px-2 mt-2">
                  <Slider
                    value={[newValue]}
                    onValueChange={(value) => setNewValue(value[0])}
                    max={effectiveChallenge.target_value}
                    min={0}
                    step={1}
                    className="w-full"
                  />
                </div>
              </div>

              {/* Botões de incremento rápido */}
              <div>
                <Label>Incremento Rápido</Label>
                <div className="grid grid-cols-4 gap-2 mt-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickAdd(1)}
                    disabled={newValue >= effectiveChallenge.target_value}
                    className="flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    +1
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickAdd(5)}
                    disabled={newValue >= effectiveChallenge.target_value}
                    className="flex items-center gap-1"
                  >
                    <Zap className="w-3 h-3" />
                    +5
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickAdd(10)}
                    disabled={newValue >= effectiveChallenge.target_value}
                    className="flex items-center gap-1"
                  >
                    <Star className="w-3 h-3" />
                    +10
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setNewValue(effectiveChallenge.target_value)}
                    disabled={newValue >= effectiveChallenge.target_value}
                    className="flex items-center gap-1"
                  >
                    <Trophy className="w-3 h-3" />
                    Max
                  </Button>
                </div>
              </div>
            </div>


            {/* Notas */}
            <div>
              <Label htmlFor="notes">Notas (opcional)</Label>
              <Textarea
                id="notes"
                placeholder="Adicione observações sobre seu progresso..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="mt-1"
                rows={2}
              />
            </div>

            {/* Foto de Comprovação */}
            <div>
              <Label>Foto de Comprovação (opcional)</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  className="flex items-center gap-2 h-20"
                >
                  <Camera className="w-5 h-5" />
                  <div className="text-left">
                    <div className="font-medium">Câmera</div>
                    <div className="text-xs text-muted-foreground">Tirar foto</div>
                  </div>
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  className="flex items-center gap-2 h-20"
                >
                  <div className="w-5 h-5 bg-muted rounded flex items-center justify-center">
                    📁
                  </div>
                  <div className="text-left">
                    <div className="font-medium">Galeria</div>
                    <div className="text-xs text-muted-foreground">Escolher foto</div>
                  </div>
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Máximo 3 arquivos. Tire foto direta da câmera ou escolha da galeria/Google Photos.
              </p>
            </div>

            {/* Compartilhar na Comunidade */}
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm">🤝</span>
                  </div>
                  <div>
                    <div className="font-medium text-blue-900">Compartilhar na Comunidade</div>
                    <div className="text-sm text-blue-700">Compartilhe para motivar outros e receber apoio!</div>
                  </div>
                </div>
                <Checkbox
                  checked={shareToFeed}
                  onCheckedChange={(checked) => setShareToFeed(checked as boolean)}
                />
              </div>
            </div>

            {/* Ações */}
            <div className="flex gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => isExternallyControlled ? onClose?.() : setOpen(false)}
                className="flex-1"
              >
                Cancelar
              </Button>
              <motion.div 
                className="flex-1"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  type="submit"
                  disabled={isLoading || newValue === effectiveChallenge.current}
                  className={`w-full ${isCompleted ? 'bg-green-600 hover:bg-green-700' : 'bg-orange-500 hover:bg-orange-600'}`}
                >
                  {isLoading ? "Salvando..." : 
                   isCompleted ? "🏆 Concluir Desafio!" : 
                   "✅ Atualizar Progresso"}
                </Button>
              </motion.div>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};