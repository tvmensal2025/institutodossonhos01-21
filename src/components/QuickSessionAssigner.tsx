import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Send } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const QuickSessionAssigner: React.FC = () => {
  const { toast } = useToast();

  const assignTestSession = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Erro",
          description: "Usuário não autenticado",
          variant: "destructive"
        });
        return;
      }

      // Buscar uma sessão ativa
      const { data: sessions, error: sessionError } = await supabase
        .from('sessions')
        .select('id')
        .limit(1);

      if (sessionError) {
        throw sessionError;
      }

      if (!sessions || sessions.length === 0) {
        toast({
          title: "Aviso",
          description: "Nenhuma sessão encontrada",
          variant: "destructive"
        });
        return;
      }

      const assignment = {
        user_id: user.id,
        session_id: sessions[0].id,
        status: 'pending',
        progress: 0,
        assigned_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('user_sessions')
        .upsert([assignment], { 
          onConflict: 'user_id,session_id',
          ignoreDuplicates: true 
        });

      if (error) {
        throw error;
      }

      toast({
        title: "✅ Sessão Atribuída!",
        description: "Sessão foi atribuída com sucesso",
      });

    } catch (error: any) {
      console.error('Erro:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro inesperado",
        variant: "destructive"
      });
    }
  };

  const assignAllSessions = async () => {
    try {
      toast({
        title: "Info",
        description: "Funcionalidade temporariamente desabilitada",
      });
    } catch (error: any) {
      console.error('Erro:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro inesperado",
        variant: "destructive"
      });
    }
  };

  return (
    <Card className="max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Send className="h-5 w-5" />
          Teste de Atribuição
        </CardTitle>
        <CardDescription>
          Atribuir sessões para teste
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button 
          onClick={assignTestSession}
          className="w-full"
          variant="outline"
        >
          Atribuir 1 Sessão
        </Button>
        
        <Button 
          onClick={assignAllSessions}
          className="w-full"
          disabled
        >
          Atribuir Todas as Sessões (Em breve)
        </Button>
      </CardContent>
    </Card>
  );
};