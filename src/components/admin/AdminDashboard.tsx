import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Users,
  Target,
  BookOpen,
  BarChart3,
  Shield,
  Crown,
  TrendingUp,
  Trophy,
  Brain,
  Award,
  Activity,
  Calendar
} from 'lucide-react';
import { motion } from 'framer-motion';

interface AdminDashboardProps {
  userRole?: 'admin' | 'super_admin';
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ 
  userRole = 'admin' 
}) => {
  const isSuperAdmin = userRole === 'super_admin';

  const stats = [
    { 
      title: 'Usuários Totais', 
      value: '248', 
      change: '+18 este mês',
      icon: <Users className="w-4 h-4" />,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    { 
      title: 'Sessões Ativas', 
      value: '12', 
      change: '+2 esta semana',
      icon: <Brain className="w-4 h-4" />,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    { 
      title: 'Desafios Ativos', 
      value: '8', 
      change: '+3 este mês',
      icon: <Target className="w-4 h-4" />,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    { 
      title: 'Taxa de Conclusão', 
      value: '87%', 
      change: '+5% vs mês anterior',
      icon: <Trophy className="w-4 h-4" />,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    },
    { 
      title: 'Cursos Publicados', 
      value: '15', 
      change: '+1 esta semana',
      icon: <BookOpen className="w-4 h-4" />,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100'
    },
    { 
      title: 'Metas Aprovadas', 
      value: '45', 
      change: '+12 este mês',
      icon: <Award className="w-4 h-4" />,
      color: 'text-pink-600',
      bgColor: 'bg-pink-100'
    }
  ];

  const recentActivity = [
    {
      type: 'user',
      message: 'Novo usuário registrado: João Silva',
      time: '5 min atrás',
      icon: <Users className="w-4 h-4 text-blue-500" />
    },
    {
      type: 'session',
      message: 'Sessão "Avaliação Completa" criada',
      time: '12 min atrás',
      icon: <Brain className="w-4 h-4 text-green-500" />
    },
    {
      type: 'challenge',
      message: 'Desafio "30 Dias Saudáveis" completado por 3 usuários',
      time: '1 hora atrás',
      icon: <Target className="w-4 h-4 text-purple-500" />
    },
    {
      type: 'goal',
      message: 'Meta de peso aprovada para Maria Santos',
      time: '2 horas atrás',
      icon: <Award className="w-4 h-4 text-orange-500" />
    }
  ];

  const quickStats = [
    {
      label: 'Usuários Online',
      value: '24',
      trend: 'up',
      color: 'text-green-600'
    },
    {
      label: 'Sessões Hoje',
      value: '6',
      trend: 'up', 
      color: 'text-blue-600'
    },
    {
      label: 'Metas Pendentes',
      value: '3',
      trend: 'down',
      color: 'text-orange-600'
    },
    {
      label: 'Sistema Status',
      value: '100%',
      trend: 'stable',
      color: 'text-green-600'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <img 
              src="/images/instituto-logo.png" 
              alt="Instituto dos Sonhos" 
              className="h-8 w-8 object-contain"
            />
            <h1 className="text-3xl font-bold text-foreground">
              Visão Geral Administrativa
            </h1>
            <Badge 
              variant={isSuperAdmin ? "default" : "secondary"}
              className={isSuperAdmin ? "bg-yellow-500 text-yellow-900" : ""}
            >
              {isSuperAdmin ? (
                <>
                  <Crown className="w-3 h-3 mr-1" />
                  Super Admin
                </>
              ) : (
                <>
                  <Shield className="w-3 h-3 mr-1" />
                  Admin
                </>
              )}
            </Badge>
          </div>
          <p className="text-muted-foreground mt-2">
            {isSuperAdmin 
              ? 'Acompanhe métricas gerais e atividade do sistema'
              : 'Visão geral das suas responsabilidades administrativas'
            }
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Activity className="w-4 h-4" />
          <span>Última atualização: agora</span>
        </div>
      </div>

      {/* Quick Stats Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {quickStats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                    <p className={`text-lg font-bold ${stat.color}`}>
                      {stat.value}
                    </p>
                  </div>
                  <div className="flex items-center">
                    {stat.trend === 'up' && <TrendingUp className="w-4 h-4 text-green-500" />}
                    {stat.trend === 'down' && <TrendingUp className="w-4 h-4 text-red-500 rotate-180" />}
                    {stat.trend === 'stable' && <BarChart3 className="w-4 h-4 text-blue-500" />}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                        <div className={stat.color}>
                          {stat.icon}
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          {stat.title}
                        </p>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-foreground mb-1">
                        {stat.value}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {stat.change}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Atividades Recentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-shrink-0 mt-1">
                    {activity.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground">
                      {activity.message}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {activity.time}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Resumo do Sistema
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                <span className="text-sm font-medium">Status do Servidor</span>
                <Badge variant="default" className="bg-green-500">
                  <div className="w-2 h-2 bg-white rounded-full mr-2"></div>
                  Online
                </Badge>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                <span className="text-sm font-medium">Banco de Dados</span>
                <Badge variant="default" className="bg-green-500">
                  <div className="w-2 h-2 bg-white rounded-full mr-2"></div>
                  Conectado
                </Badge>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                <span className="text-sm font-medium">APIs Externas</span>
                <Badge variant="secondary">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
                  Parcial
                </Badge>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                <span className="text-sm font-medium">Última Manutenção</span>
                <span className="text-sm text-muted-foreground">Há 2 dias</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Navigation Helper */}
      <Card className="border-dashed">
        <CardContent className="p-6">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">
              Use o menu lateral para acessar todas as funcionalidades
            </h3>
            <p className="text-muted-foreground text-sm mb-4">
              Todas as ferramentas administrativas estão organizadas no menu à esquerda para fácil navegação.
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              <Badge variant="outline">Gestão de Usuários</Badge>
              <Badge variant="outline">Sessões</Badge>
              <Badge variant="outline">Desafios</Badge>
              <Badge variant="outline">Cursos</Badge>
              <Badge variant="outline">Relatórios</Badge>
              <Badge variant="outline">Configurações</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};