import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, MessageSquare, Heart, Share2, Navigation } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface CommunityIntegrationProps {
  totalUsers: number;
  totalPoints: number;
  totalMissions: number;
}

export function CommunityIntegration({ totalUsers, totalPoints, totalMissions }: CommunityIntegrationProps) {
  const navigate = useNavigate();

  return (
    <Card className="border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-secondary/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-6 h-6 text-primary" />
          Comunidade HealthFeed
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-muted-foreground">
          Conecte-se com outros membros, compartilhe suas conquistas e inspire a comunidade!
        </p>
        
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 bg-white/50 rounded-lg">
            <div className="text-xl font-bold text-primary">{totalUsers}</div>
            <div className="text-xs text-muted-foreground">Membros</div>
          </div>
          
          <div className="text-center p-3 bg-white/50 rounded-lg">
            <div className="text-xl font-bold text-green-600">{totalMissions}</div>
            <div className="text-xs text-muted-foreground">Missões</div>
          </div>
          
          <div className="text-center p-3 bg-white/50 rounded-lg">
            <div className="text-xl font-bold text-yellow-600">{totalPoints.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">Pontos</div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <MessageSquare className="w-3 h-3" />
              <span>Posts & Comentários</span>
            </div>
            <div className="flex items-center gap-1">
              <Heart className="w-3 h-3" />
              <span>Reações</span>
            </div>
            <div className="flex items-center gap-1">
              <Share2 className="w-3 h-3" />
              <span>Compartilhamentos</span>
            </div>
          </div>
          
          <Button 
            onClick={() => navigate('/health-feed')}
            size="sm"
            className="bg-primary hover:bg-primary/90"
          >
            <Navigation className="w-4 h-4 mr-2" />
            Ir para Comunidade
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}