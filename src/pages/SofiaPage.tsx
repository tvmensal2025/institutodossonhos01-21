import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import SofiaChat from '@/components/sofia/SofiaChat';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bot, LogIn } from 'lucide-react';
import sofiaAvatar from '@/assets/sofia-avatar.png';

const SofiaPage: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Get current user
  useEffect(() => {
    const getCurrentUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setCurrentUser(user);
      } catch (error) {
        console.error('Erro ao buscar usuário:', error);
      } finally {
        setLoading(false);
      }
    };
    getCurrentUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setCurrentUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const handleLogin = () => {
    window.location.href = '/auth';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando Sofia...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <img 
              src={sofiaAvatar} 
              alt="Sofia"
              className="w-16 h-16 rounded-full object-cover shadow-lg"
            />
            <CardTitle className="text-2xl font-bold">Sofia</CardTitle>
            <p className="text-muted-foreground">Sua Assistente Nutricional Virtual</p>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-sm text-muted-foreground">
              Para conversar com a Sofia e receber orientações nutricionais personalizadas, 
              você precisa fazer login na sua conta.
            </p>
            <Button onClick={handleLogin} className="w-full">
              <LogIn className="w-4 h-4 mr-2" />
              Fazer Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <div className="h-screen">
        <SofiaChat user={currentUser} />
      </div>
    </div>
  );
};

export default SofiaPage;