import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useSofiaIntegration } from '@/hooks/useSofiaIntegration';
import { 
  MessageCircle, 
  Trophy, 
  Target, 
  Award, 
  Heart, 
  Brain,
  Activity,
  CheckCircle
} from 'lucide-react';

interface SofiaIntegratedSystemProps {
  userPoints?: number;
  completedMissions?: number;
  activeGoals?: number;
  activeChallenges?: number;
}

export const SofiaIntegratedSystem: React.FC<SofiaIntegratedSystemProps> = ({
  userPoints = 0,
  completedMissions = 0,
  activeGoals = 0,
  activeChallenges = 0
}) => {
  const { isLoading } = useSofiaIntegration();

  return (
    <div className="space-y-6">
      {/* Header com Logo */}
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <img 
            src="https://hlrkoyywjpckdotimtik.supabase.co/storage/v1/object/sign/institutodossonhos/LOGO-IDS%202026.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV82YjhjMmVkMC1jOTFhLTQwMWQtOTNkNS02NDRlZDY0MWVkODMiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJpbnN0aXR1dG9kb3Nzb25ob3MvTE9HTy1JRFMgMjAyNi5wbmciLCJpYXQiOjE3NTQzNjkyMjQsImV4cCI6MjA2OTcyOTIyNH0.1VBl9bZ5qFlSVIEnxPqFq2lfi6CMb1oFlYGyGXaWm-8"
            alt="Instituto dos Sonhos 2026"
            className="h-16 w-auto"
          />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Sofia - Sua Nutricionista Virtual
          </h1>
          <p className="text-gray-600">
            Sistema Integrado do Instituto dos Sonhos
          </p>
        </div>
      </div>

      {/* Status do Sistema */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-purple-500" />
            Sistema Sofia Integrado
          </CardTitle>
          <CardDescription>
            Todas as suas interações são automaticamente sincronizadas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <Trophy className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-purple-600">{userPoints}</div>
              <div className="text-sm text-purple-600">Pontos</div>
            </div>
            
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-600">{completedMissions}</div>
              <div className="text-sm text-green-600">Missões</div>
            </div>
            
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <Target className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-blue-600">{activeGoals}</div>
              <div className="text-sm text-blue-600">Metas</div>
            </div>
            
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <Award className="h-8 w-8 text-orange-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-orange-600">{activeChallenges}</div>
              <div className="text-sm text-orange-600">Desafios</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Integrações Ativas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Missões do Dia */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-indigo-500" />
              Missões do Dia
            </CardTitle>
            <CardDescription>
              Integração automática com Sofia
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Ritual da Manhã</span>
                <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                  Ativo
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Hábitos do Dia</span>
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  Ativo
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Mente & Emoções</span>
                <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                  Ativo
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Metas e Desafios */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-red-500" />
              Metas & Desafios
            </CardTitle>
            <CardDescription>
              Progresso sincronizado automaticamente
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Metas de Peso</span>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  Sincronizado
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Desafios Ativos</span>
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                  Ativo
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Relatórios Dr. Vital</span>
                <Badge variant="secondary" className="bg-red-100 text-red-800">
                  Gerado
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Funcionalidades da Sofia */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-green-500" />
            Funcionalidades Integradas
          </CardTitle>
          <CardDescription>
            Tudo conectado e sincronizado automaticamente
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <MessageCircle className="h-4 w-4 text-blue-500" />
                <span className="font-medium">Chat Inteligente</span>
              </div>
              <p className="text-sm text-gray-600">
                Análise nutricional e conversas personalizadas
              </p>
            </div>
            
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Trophy className="h-4 w-4 text-yellow-500" />
                <span className="font-medium">Gamificação</span>
              </div>
              <p className="text-sm text-gray-600">
                Pontos e conquistas por atividades
              </p>
            </div>
            
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Target className="h-4 w-4 text-green-500" />
                <span className="font-medium">Acompanhamento</span>
              </div>
              <p className="text-sm text-gray-600">
                Progresso de metas e desafios
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Status de Sincronização */}
      <Card>
        <CardHeader>
          <CardTitle>Sincronização em Tempo Real</CardTitle>
          <CardDescription>
            Status das integrações do sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Mensagens da Sofia</span>
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                Sincronizado
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Missões do Dia</span>
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                Sincronizado
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Progresso de Metas</span>
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                Sincronizado
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Desafios Ativos</span>
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                Sincronizado
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Relatórios Dr. Vital</span>
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                Gerado
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Mensagem de Status */}
      {isLoading && (
        <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center justify-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span className="text-sm text-blue-600">Sincronizando com Sofia...</span>
          </div>
        </div>
      )}
    </div>
  );
}; 