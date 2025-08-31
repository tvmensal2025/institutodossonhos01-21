// @ts-nocheck
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TestTube, Send, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const SessionTestUtils: React.FC = () => {
  const { toast } = useToast();
  const [testing, setTesting] = useState(false);

  const testAssignSession = async () => {
    setTesting(true);
    try {
      // Buscar primeira sessão ativa
      const { data: sessions, error: sessionError } = await supabase
        .from('sessions')
        .select('id, title')
        .eq('is_active', true)
        .limit(1);

      if (sessionError || !sessions || sessions.length === 0) {
        toast({
          title: "Erro",
          description: "Nenhuma sessão ativa encontrada",
          variant: "destructive"
        });
        return;
      }

      const session = sessions[0];

      // Buscar usuário atual
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Erro",
          description: "Usuário não autenticado",
          variant: "destructive"
        });
        return;
      }

      // Buscar alguns usuários para teste
      const { data: users, error: usersError } = await supabase
        .from('profiles')
        .select('user_id')
        .limit(3);

      if (usersError || !users || users.length === 0) {
        toast({
          title: "Erro",
          description: "Nenhum usuário encontrado",
          variant: "destructive"
        });
        return;
      }

      // Teste 1: Atribuir para usuários específicos
      const userIds = users.map(u => u.user_id);
      const { data: assignResult, error: assignError } = await supabase.rpc('assign_session_to_users', {
        session_id_param: session.id,
        user_ids_param: userIds,
        admin_user_id: user.id
      });

      if (assignError) {
        console.error('Erro no teste:', assignError);
        toast({
          title: "❌ Erro no Teste",
          description: assignError.message,
          variant: "destructive"
        });
        return;
      }

      const result = assignResult as { success: boolean; message?: string; error?: string };
      
      if (result?.success) {
        toast({
          title: "✅ Teste Bem-sucedido!",
          description: `Sessão "${session.title}" atribuída com sucesso!`,
        });
      } else {
        toast({
          title: "⚠️ Teste com Aviso",
          description: result?.error || "Resultado inesperado",
          variant: "destructive"
        });
      }

    } catch (error: any) {
      console.error('Erro no teste:', error);
      toast({
        title: "❌ Erro no Teste",
        description: error.message || "Erro inesperado",
        variant: "destructive"
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TestTube className="h-5 w-5" />
          Teste de Atribuição
        </CardTitle>
        <CardDescription>
          Teste rápido para verificar se a atribuição de sessões está funcionando
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button 
          onClick={testAssignSession}
          disabled={testing}
          className="w-full"
        >
          {testing ? (
            <div className="flex items-center gap-2">
              <TestTube className="w-4 h-4 animate-pulse" />
              Testando...
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Send className="w-4 h-4" />
              Executar Teste
            </div>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default SessionTestUtils;