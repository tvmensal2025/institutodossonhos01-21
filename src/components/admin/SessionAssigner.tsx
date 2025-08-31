import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, BookOpen, UserPlus, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface User {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
}

interface Session {
  id: string;
  title: string;
  type: string;
  description?: string;
}

export const SessionAssigner: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(false);
  const [assignmentStats, setAssignmentStats] = useState<{users: number, sessions: number, assignments: number}>({
    users: 0,
    sessions: 0,
    assignments: 0
  });
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Carregar usuários
      const { data: usersData, error: usersError } = await supabase
        .from('profiles')
        .select('id, user_id, full_name, email')
        .eq('role', 'user');

      if (usersError) throw usersError;

      // Carregar sessões disponíveis
      const { data: sessionsData, error: sessionsError } = await supabase
        .from('sessions')
        .select('id, title, type, description');

      if (sessionsError) throw sessionsError;

      // Carregar estatísticas de assignments
      const { data: assignmentsData, error: assignmentsError } = await supabase
        .from('user_sessions')
        .select('id');

      if (assignmentsError) throw assignmentsError;

      setUsers(usersData || []);
      setSessions(sessionsData || []);
      setAssignmentStats({
        users: usersData?.length || 0,
        sessions: sessionsData?.length || 0,
        assignments: assignmentsData?.length || 0
      });

    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados",
        variant: "destructive"
      });
    }
  };

  const assignAllSessionsToAllUsers = async () => {
    setLoading(true);
    try {
      console.log('🚀 Iniciando atribuição de sessões...');
      console.log(`📊 ${sessions.length} sessões para ${users.length} usuários`);

      const assignments = [];

      // Criar assignments para cada combinação usuário-sessão
      for (const user of users) {
        for (const session of sessions) {
          assignments.push({
            user_id: user.user_id,
            session_id: session.id,
            status: 'pending' as const,
            is_locked: false,
            progress: 0,
            completed_at: null
          });
        }
      }

      console.log(`📝 Criando ${assignments.length} assignments...`);

      // Inserir todos os assignments de uma vez (upsert para evitar duplicatas)
      const { data, error } = await supabase
        .from('user_sessions')
        .upsert(assignments, { 
          onConflict: 'user_id,session_id',
          ignoreDuplicates: true 
        });

      if (error) {
        console.error('❌ Erro ao inserir assignments:', error);
        throw error;
      }

      console.log('✅ Assignments criados com sucesso:', data);

      // Recarregar estatísticas
      await loadData();

      toast({
        title: "✅ Sucesso!",
        description: `${assignments.length} sessões foram atribuídas a todos os usuários!`,
      });

    } catch (error) {
      console.error('💥 Erro completo:', error);
      toast({
        title: "Erro",
        description: `Erro ao atribuir sessões: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserPlus className="h-5 w-5" />
          Atribuir Sessões aos Usuários
        </CardTitle>
        <CardDescription>
          Associar todas as sessões disponíveis a todos os usuários do sistema
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-4 w-4 text-blue-600" />
              <span className="font-medium text-blue-800">Usuários</span>
            </div>
            <div className="text-2xl font-bold text-blue-600">{assignmentStats.users}</div>
            <div className="text-sm text-blue-600">usuários registrados</div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <BookOpen className="h-4 w-4 text-green-600" />
              <span className="font-medium text-green-800">Sessões</span>
            </div>
            <div className="text-2xl font-bold text-green-600">{assignmentStats.sessions}</div>
            <div className="text-sm text-green-600">sessões disponíveis</div>
          </div>

          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="h-4 w-4 text-purple-600" />
              <span className="font-medium text-purple-800">Atribuições</span>
            </div>
            <div className="text-2xl font-bold text-purple-600">{assignmentStats.assignments}</div>
            <div className="text-sm text-purple-600">já atribuídas</div>
          </div>
        </div>

        {/* Aviso */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5" />
            <div className="text-sm text-yellow-800">
              <p className="font-medium">O que esta ação faz:</p>
              <ul className="mt-2 space-y-1 list-disc list-inside">
                <li>Atribui TODAS as sessões disponíveis a TODOS os usuários</li>
                <li>Usuários poderão ver e completar todas as sessões</li>
                <li>Não duplica atribuições já existentes</li>
                <li>Status inicial: "pending" (pendente)</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Preview das sessões */}
        {sessions.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium">📋 Sessões que serão atribuídas:</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-40 overflow-y-auto">
              {sessions.slice(0, 10).map((session) => (
                <div key={session.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded text-sm">
                  <Badge variant="outline" className="text-xs">
                    {session.type}
                  </Badge>
                  <span className="truncate">{session.title}</span>
                </div>
              ))}
              {sessions.length > 10 && (
                <div className="p-2 text-center text-gray-500 text-sm">
                  ... e mais {sessions.length - 10} sessões
                </div>
              )}
            </div>
          </div>
        )}

        {/* Botão de ação */}
        <div className="flex justify-center">
          <Button
            onClick={assignAllSessionsToAllUsers}
            disabled={loading || sessions.length === 0 || users.length === 0}
            size="lg"
            className="w-full md:w-auto"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Atribuindo sessões...
              </>
            ) : (
              <>
                <UserPlus className="h-4 w-4 mr-2" />
                Atribuir Todas as Sessões a Todos os Usuários
              </>
            )}
          </Button>
        </div>

        {/* Instruções */}
        <div className="text-center text-sm text-gray-600">
          <p>Após executar, todos os usuários verão as sessões em suas dashboards.</p>
          <p className="mt-1">Eles poderão começar e completar as avaliações livremente.</p>
        </div>
      </CardContent>
    </Card>
  );
};