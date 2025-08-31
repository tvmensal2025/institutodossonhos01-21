import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Users, TrendingUp, MessageCircle, Heart, Trophy, Flame, Target } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function CommunityButton() {
  const navigate = useNavigate();

  return (
    <Card className="border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-secondary/5">
      <CardContent className="mobile-padding">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              <h3 className="font-semibold mobile-text-lg">Comunidade dos Sonhos</h3>
            </div>
            <p className="text-sm lg:text-base text-muted-foreground">
              Compartilhe suas conquistas, progresso e inspire outras pessoas na sua jornada de saúde
            </p>
            <div className="hidden lg:flex items-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Trophy className="w-3 h-3" />
                <span>Conquistas</span>
              </div>
              <div className="flex items-center gap-1">
                <Flame className="w-3 h-3" />
                <span>Progresso</span>
              </div>
              <div className="flex items-center gap-1">
                <Target className="w-3 h-3" />
                <span>Metas</span>
              </div>
              <div className="flex items-center gap-1">
                <MessageCircle className="w-3 h-3" />
                <span>Interações</span>
              </div>
            </div>
          </div>
          
          <Button 
            onClick={() => navigate('/health-feed')}
            className="bg-primary hover:bg-primary/90 mobile-button-lg w-full lg:w-auto"
          >
            <Users className="w-4 h-4 mr-2" />
            Entrar na Comunidade
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}