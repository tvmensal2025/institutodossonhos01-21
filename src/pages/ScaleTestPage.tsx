import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Scale, ArrowLeft, User as UserIcon } from 'lucide-react';
import CompleteWeighingSystem from '@/components/weighing/CompleteWeighingSystem';
import { supabase } from '@/integrations/supabase/client';
import { useUserGender } from '@/hooks/useUserGender';
import type { User } from '@supabase/supabase-js';

const ScaleTestPage = () => {
  const [user, setUser] = useState<User | null>(null);
  const { gender } = useUserGender(user);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, []);
  
  const userName = user?.user_metadata?.display_name || 
                   user?.user_metadata?.name || 
                   user?.email?.split('@')[0] || 
                   'Usuário';

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Elegant Header */}
      <header className="border-b border-border/10 bg-card/30 backdrop-blur-xl sticky top-0 z-40">
        <div className="container mx-auto px-6 py-6 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Scale className="h-10 w-10 text-primary drop-shadow-lg" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Central de Pesagem
              </h1>
              <p className="text-lg text-muted-foreground flex items-center gap-2">
                <UserIcon className="h-4 w-4" />
                Olá, {userName}
              </p>
            </div>
          </div>
          <Link to="/">
            <Button variant="outline" className="hover:scale-105 transition-transform">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        <CompleteWeighingSystem />
      </div>
    </div>
  );
};

export default ScaleTestPage;