import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EvolutionHistory } from '@/components/user-history/EvolutionHistory';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, TrendingUp, User } from 'lucide-react';

export default function EvolutionPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/login');
        return;
      }

      setUser(user);

      // Carregar perfil do usuário
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      setProfile(profileData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate('/dashboard')}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar ao Dashboard
              </Button>
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-6 w-6 text-primary" />
                <h1 className="text-2xl font-bold">Minha Evolução</h1>
              </div>
            </div>
            
            {profile && (
              <div className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span className="text-sm text-muted-foreground">
                  {profile.full_name || user.email}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Acompanhe Sua Jornada de Crescimento
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Aqui você pode visualizar todo o histórico das suas respostas e atividades. 
                Cada registro é mantido para que você possa acompanhar sua evolução ao longo do tempo.
                Use os filtros para explorar suas respostas por seção ou data específica.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Componente de Histórico */}
        <EvolutionHistory userId={user.id} />
      </div>
    </div>
  );
}