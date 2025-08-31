import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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
import { useCelebrationEffects } from '@/hooks/useCelebrationEffects';

interface Desafio {
  id: string;
  title: string;
  daily_log_target: number;
  daily_log_unit: string;
  difficulty: string;
  points_reward: number;
  badge_icon: string;
  user_participation?: {
    id: string;
    progress: number;
    is_completed: boolean;
    started_at: string;
  };
}

interface UpdateDesafioProgressModalProps {
  desafio?: Desafio;
  isOpen?: boolean;
  onClose?: () => void;
  onProgressUpdate?: (newProgress: number) => void;
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

export const UpdateDesafioProgressModal = ({ 
  desafio, 
  isOpen,
  onClose,
  onProgressUpdate
}: UpdateDesafioProgressModalProps) => {
  const [newValue, setNewValue] = useState(desafio?.user_participation?.progress || 0);
  const [notes, setNotes] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [shareToFeed, setShareToFeed] = useState(false);
  const [customMessage, setCustomMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { trigger, celebrate } = useConfetti();
  const { trigger: effectTrigger, currentEffect, celebrateWithEffects } = useAlternatingEffects();
  const { shareToHealthFeed, generateProgressMessage, suggestTags, isSharing } = useCommunityShare();
  const { celebrateDesafioCompletion } = useCelebrationEffects();

  const effectiveDesafio = desafio || {
    id: '',
    title: '',
    daily_log_target: 100,
    daily_log_unit: 'unidade',
    difficulty: 'medio',
    points_reward: 100,
    badge_icon: '🏆'
  };

  const calculateProgress = (value: number) => {
    if (!effectiveDesafio.daily_log_target || effectiveDesafio.daily_log_target === 0) return 0;
    return Math.min((value / effectiveDesafio.daily_log_target) * 100, 100);
  };

  const progressPercentage = calculateProgress(newValue);
  const isCompleted = newValue >= effectiveDesafio.daily_log_target;
  const isNearComplete = progressPercentage >= 80;
  const DifficultyIcon = difficultyIcons[effectiveDesafio.difficulty as keyof typeof difficultyIcons] || Target;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Proteção contra duplo clique
    if (isLoading) return;
    
    setIsLoading(true);

    try {
      // Chamar callback se fornecido (delegar para o componente pai)
      if (onProgressUpdate) {
        onProgressUpdate(newValue);
      }

      // Efeitos de celebração
      if (isCompleted) {
        celebrateWithEffects();
        celebrateDesafioCompletion();
        toast({
          title: "🎉 Desafio Concluído!",
          description: `Parabéns! Você ganhou ${effectiveDesafio.points_reward} pontos!`,
        });
      } else {
        celebrateWithEffects();
        toast({
          title: "💪 Progresso Atualizado!",
          description: `${newValue} ${effectiveDesafio.daily_log_unit} registrados`,
        });
      }

      onClose?.();
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
    const newVal = Math.min(newValue + increment, effectiveDesafio.daily_log_target);
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
      
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="w-[95vw] sm:max-w-lg max-h-[90vh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
              <motion.div
                className={`p-1.5 sm:p-2 bg-gradient-to-br ${difficultyColors[effectiveDesafio.difficulty as keyof typeof difficultyColors]} rounded-full`}
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <DifficultyIcon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </motion.div>
              <div className="flex-1 min-w-0">
                <div className="text-sm text-muted-foreground">Atualizar Progresso</div>
                <div className="truncate">{effectiveDesafio.title}</div>
              </div>
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Progresso Atual */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Progresso Atual</Label>
              
              {/* Valor atual com visual destacado */}
              <div className="text-center bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 p-4 rounded-lg">
                <div className="text-2xl sm:text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {newValue.toFixed(1)}
                </div>
                <div className="text-sm text-muted-foreground">
                  de {effectiveDesafio.daily_log_target} {effectiveDesafio.daily_log_unit}
                </div>
              </div>
              
              {/* Input numérico mobile-friendly */}
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <Input
                    type="number"
                    value={newValue}
                    onChange={(e) => setNewValue(Number(e.target.value))}
                    min={0}
                    max={effectiveDesafio.daily_log_target}
                    step={0.1}
                    className="text-center text-lg h-12 sm:h-10"
                    inputMode="decimal"
                  />
                </div>
                <span className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap">
                  {effectiveDesafio.daily_log_unit}
                </span>
              </div>
              
              {/* Slider otimizado para mobile */}
              <div className="px-2">
                <Slider
                  value={[newValue]}
                  onValueChange={(value) => setNewValue(value[0])}
                  max={effectiveDesafio.daily_log_target}
                  step={0.1}
                  className="w-full touch-manipulation"
                />
              </div>
            </div>

            {/* Barra de Progresso */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progresso</span>
                <span>{Math.round(progressPercentage)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <motion.div
                  className={`h-2.5 rounded-full ${
                    isCompleted ? 'bg-green-500' : 
                    isNearComplete ? 'bg-yellow-500' : 'bg-blue-500'
                  }`}
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercentage}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>

            {/* Botões Rápidos - Otimizados para Mobile */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Ações Rápidas</Label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickAdd(0.5)}
                  disabled={newValue >= effectiveDesafio.daily_log_target}
                  className="h-12 sm:h-9 text-sm font-medium touch-manipulation active:scale-95 transition-transform"
                >
                  <Plus className="w-3 h-3 mr-1" />
                  0.5
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickAdd(1)}
                  disabled={newValue >= effectiveDesafio.daily_log_target}
                  className="h-12 sm:h-9 text-sm font-medium touch-manipulation active:scale-95 transition-transform"
                >
                  <Plus className="w-3 h-3 mr-1" />
                  1
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickAdd(2)}
                  disabled={newValue >= effectiveDesafio.daily_log_target}
                  className="h-12 sm:h-9 text-sm font-medium touch-manipulation active:scale-95 transition-transform"
                >
                  <Plus className="w-3 h-3 mr-1" />
                  2
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setNewValue(effectiveDesafio.daily_log_target)}
                  disabled={newValue >= effectiveDesafio.daily_log_target}
                  className="h-12 sm:h-9 bg-green-50 hover:bg-green-100 text-green-700 border-green-200 font-medium touch-manipulation active:scale-95 transition-transform"
                >
                  <Trophy className="w-3 h-3 mr-1" />
                  <span className="hidden sm:inline">Completar</span>
                  <span className="sm:hidden">✓</span>
                </Button>
              </div>
            </div>

            {/* Notas */}
            <div className="space-y-2">
              <Label htmlFor="notes" className="text-sm font-medium">Notas (opcional)</Label>
              <Textarea
                id="notes"
                placeholder="Como foi sua experiência hoje? 💪"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="resize-none text-sm"
              />
            </div>

            {/* Compartilhar - Mobile Optimized */}
            <div className="space-y-3 p-3 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950 dark:to-blue-950 rounded-lg">
              <div className="flex items-center space-x-3">
                <Checkbox
                  id="share"
                  checked={shareToFeed}
                  onCheckedChange={(checked) => setShareToFeed(checked as boolean)}
                  className="h-5 w-5"
                />
                <Label htmlFor="share" className="text-sm font-medium cursor-pointer">
                  Compartilhar na comunidade 🌟
                </Label>
              </div>

              {shareToFeed && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="space-y-2"
                >
                  <Label htmlFor="message" className="text-xs font-medium text-muted-foreground">
                    Mensagem personalizada
                  </Label>
                  <Textarea
                    id="message"
                    placeholder="Compartilhe sua conquista! 🎉"
                    value={customMessage}
                    onChange={(e) => setCustomMessage(e.target.value)}
                    rows={2}
                    className="resize-none text-sm"
                  />
                </motion.div>
              )}
            </div>

            {/* Botões de Ação - Mobile Optimized */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-2 pt-2">
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full sm:flex-1 h-12 sm:h-10 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 font-medium text-base sm:text-sm touch-manipulation active:scale-95 transition-transform"
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <>
                    <Zap className="w-4 h-4 mr-2" />
                    Salvar Progresso
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isLoading}
                className="w-full sm:w-auto h-12 sm:h-10 font-medium text-base sm:text-sm touch-manipulation active:scale-95 transition-transform"
              >
                Cancelar
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}; 