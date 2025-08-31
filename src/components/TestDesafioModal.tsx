import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UpdateDesafioProgressModal } from '@/components/gamification/UpdateDesafioProgressModal';
import { Trophy, Target, Star, Flame } from 'lucide-react';

// Dados de teste para o desafio
const mockDesafio = {
  id: 'test-desafio-1',
  title: 'Beber 2L de Água Diariamente',
  daily_log_target: 2000,
  daily_log_unit: 'ml',
  difficulty: 'facil',
  points_reward: 50,
  badge_icon: '💧',
  user_participation: {
    id: 'participation-1',
    progress: 1200, // Progresso atual em ml
    is_completed: false,
    started_at: new Date().toISOString()
  }
};

export const TestDesafioModal = () => {
  const [showModal, setShowModal] = useState(false);
  const [currentProgress, setCurrentProgress] = useState(mockDesafio.user_participation.progress);

  const handleOpenModal = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleProgressUpdate = (newProgress: number) => {
    setCurrentProgress(newProgress);
    console.log('Progresso atualizado para:', newProgress);
  };

  const progressPercentage = (currentProgress / mockDesafio.daily_log_target) * 100;

  return (
    <div className="p-4 sm:p-6 space-y-4 min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950">
      <div className="max-w-2xl mx-auto">
        <h2 className="text-xl sm:text-2xl font-bold text-center mb-2">🧪 Teste do Modal de Desafio</h2>
        <p className="text-sm text-muted-foreground text-center mb-6">
          Versão otimizada para mobile - 98% dos usuários
        </p>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-2xl">{mockDesafio.badge_icon}</span>
            {mockDesafio.title}
          </CardTitle>
          <CardDescription>
            Meta: {mockDesafio.daily_log_target} {mockDesafio.daily_log_unit}/dia
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progresso Atual</span>
              <span>{currentProgress} / {mockDesafio.daily_log_target} {mockDesafio.daily_log_unit}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
              <div 
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" 
                style={{ width: `${Math.min(progressPercentage, 100)}%` }}
              ></div>
            </div>
            <div className="text-center text-sm text-muted-foreground">
              {Math.round(progressPercentage)}% completo
            </div>
          </div>

          <Button 
            onClick={handleOpenModal}
            className="w-full h-12 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 font-medium text-base touch-manipulation active:scale-95 transition-transform"
          >
            <Trophy className="h-5 w-5 mr-2" />
            Atualizar Progresso
          </Button>

          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex items-center gap-1">
              <Target className="h-4 w-4" />
              <span>Dificuldade: {mockDesafio.difficulty}</span>
            </div>
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4" />
              <span>{mockDesafio.points_reward} pontos</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modal de Progresso */}
      <UpdateDesafioProgressModal
        desafio={{
          ...mockDesafio,
          user_participation: {
            ...mockDesafio.user_participation,
            progress: currentProgress
          }
        }}
        isOpen={showModal}
        onClose={handleCloseModal}
        onProgressUpdate={handleProgressUpdate}
      />

      {/* Informações de Debug */}
      <Card className="bg-gray-50 dark:bg-gray-900">
        <CardHeader>
          <CardTitle className="text-lg">🔍 Debug Info</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm font-mono">
            <div>Modal Aberto: {showModal ? '✅ Sim' : '❌ Não'}</div>
            <div>Progresso Atual: {currentProgress} {mockDesafio.daily_log_unit}</div>
            <div>Progresso %: {Math.round(progressPercentage)}%</div>
            <div>Meta: {mockDesafio.daily_log_target} {mockDesafio.daily_log_unit}</div>
            <div>Completado: {currentProgress >= mockDesafio.daily_log_target ? '✅ Sim' : '❌ Não'}</div>
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  );
};