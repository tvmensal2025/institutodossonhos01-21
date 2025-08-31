import React, { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Slider } from '@/components/ui/slider';
import { Camera, FileText, TrendingUp, Target, Award, Share2, Users, Heart, Upload, X, Image as ImageIcon, Video, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCommunityShare } from '@/hooks/useCommunityShare';
import { useConfetti, ConfettiAnimation } from '@/components/gamification/ConfettiAnimation';
import { useAlternatingEffects, VisualEffectsManager } from '@/components/gamification/VisualEffectsManager';
import { useBalloonFireworks, BalloonFireworksEffect } from '@/components/gamification/BalloonFireworksEffect';

interface Goal {
  id: string;
  title: string;
  target_value: number;
  current_value: number;
  unit: string;
  status: string;
}

interface UpdateProgressModalProps {
  goal: Goal;
  onUpdate?: () => void;
  children: React.ReactNode;
}

export const UpdateProgressModal = ({ goal, onUpdate, children }: UpdateProgressModalProps) => {
  const [open, setOpen] = useState(false);
  const [newValue, setNewValue] = useState(goal.current_value);
  const [notes, setNotes] = useState('');
  const [mediaFiles, setMediaFiles] = useState<string[]>([]);
  const [shareToFeed, setShareToFeed] = useState(false);
  const [customMessage, setCustomMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { shareToHealthFeed, generateProgressMessage, suggestTags, isSharing } = useCommunityShare();
  const { trigger, celebrate } = useConfetti();
  const { trigger: effectTrigger, currentEffect, celebrateWithEffects } = useAlternatingEffects();
  const { trigger: balloonTrigger, celebrate: celebrateBalloon } = useBalloonFireworks();


  const calculateProgress = (value: number) => {
    if (!goal.target_value || goal.target_value === 0) return 0;
    return Math.min((value / goal.target_value) * 100, 100);
  };

  const currentProgress = calculateProgress(newValue);
  const isCompleted = newValue >= goal.target_value;

  // Upload de arquivo
  const uploadFile = async (file: File): Promise<string | null> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const fileExt = file.name.split('.').pop();
      const fileName = `progress/${user.id}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      return publicUrl;
    } catch (error) {
      console.error('Erro no upload:', error);
      toast({
        title: "Erro no upload",
        description: "Não foi possível fazer upload do arquivo",
        variant: "destructive"
      });
      return null;
    }
  };

  // Seleção de arquivos
  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    if (files.length === 0) return;
    
    if (mediaFiles.length + files.length > 3) {
      toast({
        title: "Limite excedido",
        description: "Você pode enviar no máximo 3 arquivos",
        variant: "destructive"
      });
      return;
    }

    setUploading(true);
    
    try {
      const uploadPromises = files.map(uploadFile);
      const uploadedUrls = await Promise.all(uploadPromises);
      
      const successfulUploads = uploadedUrls.filter(url => url !== null) as string[];
      
      if (successfulUploads.length > 0) {
        setMediaFiles(prev => [...prev, ...successfulUploads]);
        toast({
          title: "Upload concluído",
          description: `${successfulUploads.length} arquivo(s) enviado(s) com sucesso`
        });
      }
    } catch (error) {
      toast({
        title: "Erro no upload",
        description: "Não foi possível fazer upload dos arquivos",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveFile = (indexToRemove: number) => {
    setMediaFiles(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  const isImage = (url: string) => {
    return /\.(jpg|jpeg|png|gif|webp)$/i.test(url);
  };

  const isVideo = (url: string) => {
    return /\.(mp4|webm|ogg|mov)$/i.test(url);
  };

  // Ativar câmera/galeria do dispositivo
  const openCamera = () => {
    if (fileInputRef.current) {
      fileInputRef.current.setAttribute('capture', 'environment');
      fileInputRef.current.click();
    }
  };

  const openGallery = () => {
    if (fileInputRef.current) {
      fileInputRef.current.removeAttribute('capture');
      fileInputRef.current.click();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Atualizar a meta
      const { error: goalError } = await supabase
        .from('user_goals')
        .update({ 
          current_value: newValue,
          status: isCompleted ? 'concluida' : 'em_progresso'
        })
        .eq('id', goal.id);

      if (goalError) throw goalError;

      // Registrar a atualização no histórico
      const { error: updateError } = await supabase
        .from('goal_updates')
        .insert({
          goal_id: goal.id,
          user_id: (await supabase.auth.getUser()).data.user?.id,
          previous_value: goal.current_value,
          new_value: newValue,
          notes: notes || null
        });

      if (updateError) throw updateError;

      // Compartilhar na comunidade se solicitado
      if (shareToFeed && (mediaFiles.length > 0 || customMessage || isCompleted)) {
        const achievementType: 'goal_completed' | 'milestone_reached' | 'progress_update' = 
          isCompleted ? 'goal_completed' : 
          currentProgress >= 80 ? 'milestone_reached' : 'progress_update';
        
        const achievementData = {
          goalTitle: goal.title,
          progressValue: newValue,
          targetValue: goal.target_value,
          unit: goal.unit,
          category: 'meta'
        };

        const shareData = {
          content: customMessage || generateProgressMessage({
            content: '', // placeholder necessário para o tipo
            achievementType,
            achievementData
          }),
          mediaUrls: mediaFiles.length > 0 ? mediaFiles : undefined,
          achievementType,
          achievementData,
          tags: suggestTags({ 
            content: '',
            achievementType,
            achievementData
          }),
          visibility: 'public' as const
        };

        await shareToHealthFeed(shareData);
      }

      // Efeitos de celebração - SEMPRE aparecem quando atualizar meta
      // Efeitos de celebração - SEMPRE aparecem quando atualizar meta
      celebrateWithEffects();
      celebrate();
      celebrateBalloon(); // Efeito de balão e fogos
      
      if (isCompleted) {
        toast({
          title: "🎉 Meta Concluída!",
          description: `Parabéns! Você completou: ${goal.title}`,
        });
      } else {
        toast({
          title: "✅ Progresso Atualizado!",
          description: `Progresso atualizado para ${newValue} ${goal.unit}`,
        });
      }

      setOpen(false);
      onUpdate?.();
    } catch (error) {
      console.error('Erro ao atualizar progresso:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o progresso.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAdd = (increment: number) => {
    const newVal = Math.min(newValue + increment, goal.target_value);
    setNewValue(newVal);
  };

  const handleSliderChange = (value: number[]) => {
    setNewValue(value[0]);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      
      <DialogContent className="w-[95vw] max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Atualizar Progresso
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Header da meta */}
          <div className="text-center space-y-2">
            <h3 className="font-semibold text-lg">{goal.title}</h3>
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Target className="w-4 h-4" />
              Meta: {goal.target_value} {goal.unit}
            </div>
          </div>

          {/* Progresso visual */}
          <div className="space-y-4">
            <div className="text-center">
              <motion.div
                className="text-4xl font-bold mb-2"
                animate={{ scale: currentProgress > calculateProgress(goal.current_value) ? [1, 1.1, 1] : 1 }}
                transition={{ duration: 0.3 }}
              >
                {Math.round(currentProgress)}%
              </motion.div>
              <Progress 
                value={currentProgress} 
                className="h-3 mb-2" 
              />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Atual: {goal.current_value} {goal.unit}</span>
                <span>Novo: {newValue} {goal.unit}</span>
              </div>
            </div>

            {isCompleted && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center p-4 bg-green-50 rounded-lg border border-green-200"
              >
                <Award className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <p className="text-green-800 font-semibold">Meta Concluída! 🎉</p>
                <p className="text-green-600 text-sm">Parabéns pelo seu progresso!</p>
              </motion.div>
            )}
          </div>

          {/* Controles de valor */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="progress-value">Novo Valor</Label>
              <div className="flex items-center gap-2 mt-1">
                <Input
                  id="progress-value"
                  type="number"
                  min="0"
                  max={goal.target_value}
                  value={newValue}
                  onChange={(e) => setNewValue(Number(e.target.value))}
                  className="flex-1"
                />
                <span className="text-sm text-muted-foreground min-w-fit">
                  {goal.unit}
                </span>
              </div>
            </div>

            {/* Slider para controle visual */}
            <div>
              <Label>Ajuste Visual</Label>
              <div className="px-2 mt-2">
                <Slider
                  value={[newValue]}
                  onValueChange={handleSliderChange}
                  max={goal.target_value}
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
                  disabled={newValue >= goal.target_value}
                >
                  +1
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickAdd(5)}
                  disabled={newValue >= goal.target_value}
                >
                  +5
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickAdd(10)}
                  disabled={newValue >= goal.target_value}
                >
                  +10
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setNewValue(goal.target_value)}
                  disabled={newValue >= goal.target_value}
                >
                  Max
                </Button>
              </div>
            </div>
          </div>

          {/* Notas opcionais */}
          <div>
            <Label htmlFor="notes">Notas (opcional)</Label>
            <Textarea
              id="notes"
              placeholder="Adicione observações sobre seu progresso..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="mt-1"
              rows={3}
            />
          </div>

          {/* Upload de foto/vídeo */}
          <div className="space-y-3">
            <Label>Foto de Comprovação (opcional)</Label>
            
            {/* Botões de upload */}
            <div className="flex gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*"
                multiple
                onChange={handleFileSelect}
                className="hidden"
              />
              
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={openCamera}
                disabled={uploading || mediaFiles.length >= 3}
                className="flex-1"
              >
                <Camera className="w-4 h-4 mr-2" />
                {uploading ? 'Enviando...' : 'Câmera'}
              </Button>
              
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={openGallery}
                disabled={uploading || mediaFiles.length >= 3}
                className="flex-1"
              >
                <ImageIcon className="w-4 h-4 mr-2" />
                Galeria
              </Button>
            </div>

            {/* Preview dos arquivos */}
            {mediaFiles.length > 0 && (
              <div className="grid grid-cols-3 gap-2">
                {mediaFiles.map((url, index) => (
                  <div key={index} className="relative group">
                    <div className="aspect-square rounded-lg overflow-hidden bg-muted border">
                      {isImage(url) ? (
                        <img
                          src={url}
                          alt={`Upload ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      ) : isVideo(url) ? (
                        <video
                          src={url}
                          className="w-full h-full object-cover"
                          controls={false}
                          muted
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ImageIcon className="w-8 h-8 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    
                    {/* Botão de remover */}
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute -top-2 -right-2 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleRemoveFile(index)}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                    
                    {/* Indicador de vídeo */}
                    {isVideo(url) && (
                      <div className="absolute bottom-1 left-1">
                        <div className="bg-black/50 rounded px-1 py-0.5">
                          <Video className="w-3 h-3 text-white" />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            <p className="text-xs text-muted-foreground">
              Máximo 3 arquivos. Tire foto direto da câmera ou escolha da galeria/Google Photos.
            </p>
          </div>

          {/* Compartilhamento na Comunidade */}
          <div className="space-y-4 p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Share2 className="w-5 h-5 text-blue-600" />
                <Label htmlFor="share-feed" className="text-blue-800 font-medium">
                  Compartilhar na Comunidade
                </Label>
              </div>
              <Checkbox 
                id="share-feed"
                checked={shareToFeed}
                onCheckedChange={(checked) => setShareToFeed(checked as boolean)}
              />
            </div>
            
            <div className="text-sm text-muted-foreground">
              {isCompleted 
                ? "🎉 Mostre sua conquista para inspirar outros!" 
                : mediaFiles.length > 0
                ? "📸 Você tem fotos! Que tal compartilhar seu progresso?"
                : currentProgress >= 80
                ? "🔥 Você está quase lá! Compartilhe sua jornada!"
                : "📈 Compartilhe para motivar outros e receber apoio!"}
            </div>

            <AnimatePresence>
              {shareToFeed && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-3"
                >
                  <div>
                    <Label htmlFor="custom-message">Mensagem Personalizada (opcional)</Label>
                    <Textarea
                      id="custom-message"
                      placeholder={generateProgressMessage({
                        content: '',
                        achievementType: isCompleted ? 'goal_completed' : 
                                        currentProgress >= 80 ? 'milestone_reached' : 'progress_update',
                        achievementData: {
                          goalTitle: goal.title,
                          progressValue: newValue,
                          targetValue: goal.target_value,
                          unit: goal.unit
                        }
                      })}
                      value={customMessage}
                      onChange={(e) => setCustomMessage(e.target.value)}
                      className="mt-1"
                      rows={3}
                    />
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-blue-600 bg-white/50 p-2 rounded">
                    <Users className="w-4 h-4" />
                    <span>Será compartilhado publicamente no HealthFeed</span>
                    <Heart className="w-4 h-4" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Ações */}
          <div className="sticky bottom-0 bg-background pt-4 pb-2 flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading || newValue === goal.current_value}
              className="flex-1"
            >
              {isLoading ? "Salvando..." : isCompleted ? "🏆 Concluir Meta!" : "✅ Atualizar Progresso"}
            </Button>
          </div>
        </form>
        
        {/* Efeitos Visuais */}
        <ConfettiAnimation trigger={trigger} duration={3000} />
        <VisualEffectsManager 
          trigger={effectTrigger} 
          effectType={currentEffect} 
          duration={3000} 
        />
        <BalloonFireworksEffect trigger={balloonTrigger} duration={4000} />
      </DialogContent>
    </Dialog>
  );
};