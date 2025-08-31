// @ts-nocheck
import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Users, Clock, Target, Brain, DollarSign, Star, Zap, Send, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { UserSelector } from './UserSelector';
import { SessionSender } from './SessionSender';
interface Template {
  id: string;
  title: string;
  description: string;
  duration: string;
  category: string;
  icon: React.ReactNode;
  features: string[];
  color: string;
  questions?: number;
  areas?: number;
}
const SessionTemplates: React.FC = () => {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState<string | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const {
    toast
  } = useToast();
  const templates: Template[] = [{
    id: '12-areas',
    title: '12 Áreas',
    description: 'Avalie o equilíbrio das 12 áreas fundamentais da vida através de uma interface interativa com emojis. Receba análises personalizadas e um plano de ação para melhorar seu bem-estar geral.',
    duration: '10-15 minutos',
    category: 'Avaliação Geral',
    icon: <Target className="w-6 h-6" />,
    features: ['Seleção por Emojis', 'Roda Radar Visual', 'Plano de Ação'],
    color: 'bg-blue-500',
    areas: 12
  }, {
    id: '147-perguntas',
    title: '147 Perguntas',
    description: 'Mapeamento completo de sintomas em 12 sistemas corporais com avaliação de frequência e intensidade. Sistema adaptativo que coleta dados para visualização em roda e evolução temporal.',
    duration: '12-15 minutos',
    category: 'Sintomas',
    icon: <Brain className="w-6 h-6" />,
    features: ['Frequência + Intensidade', 'Roda Visual de Resultados', 'Evolução Temporal'],
    color: 'bg-purple-500',
    questions: 147
  }, {
    id: '8-pilares',
    title: '8 Pilares',
    description: 'Avaliação dos 8 pilares fundamentais da prosperidade financeira. Interface interativa com análise personalizada e plano de ação para impulsionar sua abundância.',
    duration: '10-15 minutos',
    category: 'Financeiro',
    icon: <DollarSign className="w-6 h-6" />,
    features: ['8 Pilares Financeiros', 'Roda Visual de Resultados', 'Plano de Ação Personalizado'],
    color: 'bg-yellow-500',
    areas: 8
  }, {
    id: '8-competencias',
    title: '8 Competências',
    description: 'Avaliação das 8 competências profissionais fundamentais. Interface interativa com análise personalizada e plano de desenvolvimento para impulsionar sua carreira.',
    duration: '9-15 minutos',
    category: 'Profissional',
    icon: <Star className="w-6 h-6" />,
    features: ['8 Competências Profissionais', 'Roda Visual de Resultados', 'Plano de Desenvolvimento'],
    color: 'bg-red-500',
    areas: 8
  }];
  const buildSessionPayload = useMemo(() => {
    return (templateId: string) => {
      switch (templateId) {
        case '12-areas':
          {
            const emojiOptions = [{
              value: 1,
              emoji: '😟',
              label: 'Muito baixa'
            }, {
              value: 2,
              emoji: '😕',
              label: 'Baixa'
            }, {
              value: 3,
              emoji: '😐',
              label: 'Média'
            }, {
              value: 4,
              emoji: '🙂',
              label: 'Boa'
            }, {
              value: 5,
              emoji: '😄',
              label: 'Excelente'
            }];
            const areas = [{
              id: 'saude',
              name: 'Saúde',
              icon: '🏥',
              color: '#0ea5e9'
            }, {
              id: 'familia',
              name: 'Família',
              icon: '👨‍👩‍👧‍👦',
              color: '#22c55e'
            }, {
              id: 'carreira',
              name: 'Carreira',
              icon: '💼',
              color: '#6366f1'
            }, {
              id: 'financas',
              name: 'Finanças',
              icon: '💰',
              color: '#f59e0b'
            }, {
              id: 'relacionamentos',
              name: 'Relacionamentos',
              icon: '🤝',
              color: '#ec4899'
            }, {
              id: 'diversao',
              name: 'Diversão',
              icon: '🎉',
              color: '#a78bfa'
            }, {
              id: 'crescimento',
              name: 'Crescimento',
              icon: '📈',
              color: '#10b981'
            }, {
              id: 'espiritual',
              name: 'Espiritual',
              icon: '🧘‍♀️',
              color: '#14b8a6'
            }, {
              id: 'ambiente',
              name: 'Ambiente',
              icon: '🏡',
              color: '#84cc16'
            }, {
              id: 'proposito',
              name: 'Propósito',
              icon: '🎯',
              color: '#ef4444'
            }, {
              id: 'contribuicao',
              name: 'Contribuição',
              icon: '🙌',
              color: '#06b6d4'
            }, {
              id: 'autoconhecimento',
              name: 'Autoconhecimento',
              icon: '🧠',
              color: '#8b5cf6'
            }].map(area => ({
              ...area,
              question: {
                id: `${area.id}_q1`,
                text: `Como você avalia sua área de ${area.name} hoje?`,
                type: 'emoji_scale'
              },
              emoji_options: emojiOptions
            }));
            return {
              title: 'Avaliação das 12 Áreas da Vida',
              description: 'Avaliação do equilíbrio nas 12 áreas fundamentais com perguntas e visual final em roda.',
              type: 'life_wheel_assessment',
              content: {
                areas
              },
              target_saboteurs: [],
              difficulty: 'beginner',
              estimated_time: 15,
              tools_data: {}
            } as const;
          }
        case '147-perguntas':
          return {
            title: 'Mapeamento de Sintomas (147 Perguntas)',
            description: 'Questionário adaptativo de sintomas com frequência e intensidade em 12 sistemas.',
            type: 'symptoms_assessment',
            content: {
              systems: [{
                system: 'Digestivo',
                icon: '🍽️',
                color: '#f59e0b',
                questions: ['Sente azia?', 'Inchaço frequente?', 'Refluxo?']
              }, {
                system: 'Respiratório',
                icon: '🫁',
                color: '#60a5fa',
                questions: ['Falta de ar?', 'Tosse frequente?', 'Chiado no peito?']
              }, {
                system: 'Cardiovascular',
                icon: '❤️',
                color: '#ef4444',
                questions: ['Palpitações?', 'Pressão alta?', 'Cansaço fácil?']
              }, {
                system: 'Neurológico',
                icon: '🧠',
                color: '#a78bfa',
                questions: ['Dores de cabeça?', 'Tonturas?', 'Insônia?']
              }, {
                system: 'Musculoesquelético',
                icon: '💪',
                color: '#22c55e',
                questions: ['Dores musculares?', 'Rigidez?', 'Cãibras?']
              }, {
                system: 'Imunológico',
                icon: '🛡️',
                color: '#10b981',
                questions: ['Infecções recorrentes?', 'Alergias?', 'Cansaço prolongado?']
              }]
            },
            target_saboteurs: [],
            difficulty: 'intermediate',
            estimated_time: 15,
            tools_data: {}
          } as const;
        case '8-pilares':
          return {
            title: '8 Pilares Financeiros',
            description: 'Avaliação dos 8 pilares da prosperidade com pergunta por pilar e visual em roda.',
            type: 'life_wheel_assessment',
            content: {
              areas: [{
                id: 'mindset',
                name: 'Mindset',
                icon: '🧭',
                color: '#8b5cf6'
              }, {
                id: 'planejamento',
                name: 'Planejamento',
                icon: '🗂️',
                color: '#0ea5e9'
              }, {
                id: 'investimentos',
                name: 'Investimentos',
                icon: '📈',
                color: '#22c55e'
              }, {
                id: 'renda',
                name: 'Renda',
                icon: '💼',
                color: '#f59e0b'
              }, {
                id: 'gastos',
                name: 'Gastos',
                icon: '🧾',
                color: '#ef4444'
              }, {
                id: 'protecao',
                name: 'Proteção',
                icon: '🛡️',
                color: '#10b981'
              }, {
                id: 'impostos',
                name: 'Impostos',
                icon: '🏛️',
                color: '#06b6d4'
              }, {
                id: 'reserva',
                name: 'Reserva',
                icon: '🏦',
                color: '#84cc16'
              }].map(area => ({
                ...area,
                question: {
                  id: `${area.id}_q1`,
                  text: `Como está seu pilar de ${area.name}?`,
                  type: 'emoji_scale'
                },
                emoji_options: [{
                  value: 1,
                  emoji: '😟',
                  label: 'Muito baixa'
                }, {
                  value: 2,
                  emoji: '😕',
                  label: 'Baixa'
                }, {
                  value: 3,
                  emoji: '😐',
                  label: 'Média'
                }, {
                  value: 4,
                  emoji: '🙂',
                  label: 'Boa'
                }, {
                  value: 5,
                  emoji: '😄',
                  label: 'Excelente'
                }]
              }))
            },
            target_saboteurs: [],
            difficulty: 'beginner',
            estimated_time: 15,
            tools_data: {}
          } as const;
        case '8-competencias':
          return {
            title: 'Roda das 8 Competências',
            description: 'Avaliação de competências profissionais com pergunta por competência e visual final em roda.',
            type: 'life_wheel_assessment',
            content: {
              areas: [{
                id: 'lideranca',
                name: 'Liderança',
                icon: '👑',
                color: '#f59e0b'
              }, {
                id: 'comunicacao',
                name: 'Comunicação',
                icon: '💬',
                color: '#22c55e'
              }, {
                id: 'inovacao',
                name: 'Inovação',
                icon: '💡',
                color: '#a78bfa'
              }, {
                id: 'estrategia',
                name: 'Estratégia',
                icon: '🎯',
                color: '#ef4444'
              }, {
                id: 'execucao',
                name: 'Execução',
                icon: '🏃‍♂️',
                color: '#0ea5e9'
              }, {
                id: 'relacionamento',
                name: 'Relacionamento',
                icon: '🤝',
                color: '#ec4899'
              }, {
                id: 'adaptabilidade',
                name: 'Adaptabilidade',
                icon: '🔄',
                color: '#06b6d4'
              }, {
                id: 'aprendizado',
                name: 'Aprendizado',
                icon: '📚',
                color: '#84cc16'
              }].map(area => ({
                ...area,
                question: {
                  id: `${area.id}_q1`,
                  text: `Como você avalia sua competência de ${area.name}?`,
                  type: 'emoji_scale'
                },
                emoji_options: [{
                  value: 1,
                  emoji: '😟',
                  label: 'Muito baixa'
                }, {
                  value: 2,
                  emoji: '😕',
                  label: 'Baixa'
                }, {
                  value: 3,
                  emoji: '😐',
                  label: 'Média'
                }, {
                  value: 4,
                  emoji: '🙂',
                  label: 'Boa'
                }, {
                  value: 5,
                  emoji: '😄',
                  label: 'Excelente'
                }]
              }))
            },
            target_saboteurs: [],
            difficulty: 'beginner',
            estimated_time: 12,
            tools_data: {}
          } as const;
        default:
          return null;
      }
    };
  }, []);
  const createSessionAndAssignToCurrentUser = async (templateId: string) => {
    try {
      setIsCreating(templateId);
      setSelectedTemplate(templateId);
      const {
        data: auth
      } = await supabase.auth.getUser();
      const currentUser = auth?.user;
      if (!currentUser) {
        toast({
          title: 'Autenticação necessária',
          description: 'Faça login para criar a sessão.',
          variant: 'destructive'
        });
        return;
      }
      const payload = buildSessionPayload(templateId);
      if (!payload) {
        toast({
          title: 'Template inválido',
          description: 'Template não encontrado.',
          variant: 'destructive'
        });
        return;
      }
      const sessionInsert = {
        ...payload,
        created_by: currentUser.id,
        is_active: true
      } as any;
      const {
        data: createdSession,
        error: createError
      } = await supabase.from('sessions').insert(sessionInsert).select().single();
      if (createError) {
        throw createError;
      }
      const assignment = {
        user_id: currentUser.id,
        session_id: createdSession.id,
        status: 'pending',
        progress: 0,
        assigned_at: new Date().toISOString()
      };
      const {
        error: assignError
      } = await supabase.from('user_sessions').upsert([assignment], {
        onConflict: 'user_id,session_id'
      });
      if (assignError) {
        throw assignError;
      }
      toast({
        title: 'Sessão criada!',
        description: 'Template aplicado e sessão atribuída a você.'
      });
    } catch (error: any) {
      console.error('Erro ao usar template:', error);
      toast({
        title: 'Erro ao criar sessão',
        description: error?.message || 'Tente novamente.',
        variant: 'destructive'
      });
    } finally {
      setIsCreating(null);
    }
  };
  const handleUseTemplate = (templateId: string) => {
    void createSessionAndAssignToCurrentUser(templateId);
  };
  const handleSendToAll = async (templateId: string) => {
    try {
      setIsCreating(templateId);

      // 1) Criar a sessão a partir do template
      const {
        data: auth
      } = await supabase.auth.getUser();
      const currentUser = auth?.user;
      if (!currentUser) {
        toast({
          title: 'Autenticação necessária',
          description: 'Faça login como admin.',
          variant: 'destructive'
        });
        return;
      }
      const payload = buildSessionPayload(templateId);
      if (!payload) return;
      const {
        data: createdSession,
        error: createError
      } = await supabase.from('sessions').insert({
        ...payload,
        created_by: currentUser.id,
        is_active: true
      } as any).select().single();
      if (createError) throw createError;

      // 2) Tentar usar a função RPC (se existir) para atribuição em massa
      const {
        error: rpcError
      } = await supabase.rpc('assign_session_to_users', {
        session_id_param: createdSession.id,
        user_ids_param: null,
        admin_user_id: currentUser.id
      });
      if (rpcError) {
        // Fallback: apenas informa que é necessário configurar função/credenciais
        console.warn('RPC assign_session_to_users falhou:', rpcError);
        toast({
          title: 'Sessão criada',
          description: 'Para enviar a todos, habilite a função assign_session_to_users no banco.'
        });
        return;
      }
      toast({
        title: 'Sessão enviada!',
        description: 'Template aplicado e enviado para todos os usuários.'
      });
    } catch (error: any) {
      console.error('Erro ao enviar para todos:', error);
      toast({
        title: 'Erro ao enviar',
        description: error?.message || 'Tente novamente.',
        variant: 'destructive'
      });
    } finally {
      setIsCreating(null);
    }
  };
  return <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Templates de Sessão Prontos</h2>
          <p className="text-muted-foreground mt-2">
            Modelos pré-configurados para diferentes tipos de avaliação
          </p>
        </div>
      </div>

      <div className="grid gap-6">
        {templates.map((template, index) => <motion.div key={template.id} initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        delay: index * 0.1
      }}>
            <Card className="bg-gradient-card border border-border/50 hover:shadow-lg transition-all duration-300">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-full ${template.color} text-white`}>
                      {template.icon}
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <CardTitle className="text-xl text-foreground">
                          {template.title}
                        </CardTitle>
                        <Badge variant="secondary" className="bg-primary/20 text-primary border-primary/30">
                          {template.questions && `${template.questions} Perguntas`}
                          {template.areas && `${template.areas} ${template.areas === 12 ? 'Áreas' : template.areas === 8 && template.category === 'Financeiro' ? 'Pilares' : 'Competências'}`}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground text-sm max-w-3xl">
                        {template.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={() => handleUseTemplate(template.id)} className="bg-primary hover:bg-primary/90 text-primary-foreground" disabled={isCreating === template.id}>
                      <Zap className="w-4 h-4 mr-2" />
                      {isCreating === template.id ? 'Criando...' : 'Usar Template'}
                    </Button>
                    <Button onClick={() => setSelectedTemplate(template.id)} variant="outline" disabled={isCreating === template.id} className="border-secondary hover:bg-secondary text-zinc-800">
                      <Users className="w-4 h-4 mr-2" />
                      Enviar p/ Selecionados
                    </Button>
                    <Button onClick={() => handleSendToAll(template.id)} variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground" disabled={isCreating === template.id}>
                      <Send className="w-4 h-4 mr-2" />
                      {isCreating === template.id ? 'Enviando...' : 'Enviar p/ Todos'}
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      <span className="text-sm">{template.duration}</span>
                    </div>
                    <div className="flex gap-2">
                      {template.features.map((feature, idx) => <div key={idx} className="flex items-center gap-1">
                          <CheckCircle className="w-3 h-3 text-success" />
                          <span className="text-xs text-muted-foreground">{feature}</span>
                        </div>)}
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {template.category}
                  </Badge>
                </div>

                {/* Preview de tags/categorias */}
                <div className="flex gap-2 mt-4">
                  {template.id === '12-areas' && <div className="flex gap-1">
                      {['Saúde', 'Família', 'Carreira', 'Finanças', 'Relacionamentos', 'Diversão', 'Crescimento'].map((tag, idx) => <Badge key={idx} variant="secondary" className="text-xs bg-blue-100 text-blue-800">
                          {tag}
                        </Badge>)}
                    </div>}
                  {template.id === '147-perguntas' && <div className="flex gap-1">
                      {['Digestivo', 'Respiratório', 'Cardiovascular', 'Neurológico', 'Musculoesquelético', 'Imunológico'].map((tag, idx) => <Badge key={idx} variant="secondary" className="text-xs bg-purple-100 text-purple-800">
                          {tag}
                        </Badge>)}
                    </div>}
                  {template.id === '8-pilares' && <div className="flex gap-1">
                      {['Mindset', 'Planejamento', 'Investimentos', 'Renda', 'Gastos', 'Proteção', 'Impostos'].map((tag, idx) => <Badge key={idx} variant="secondary" className="text-xs bg-yellow-100 text-yellow-800">
                          {tag}
                        </Badge>)}
                    </div>}
                  {template.id === '8-competencias' && <div className="flex gap-1">
                      {['Liderança', 'Comunicação', 'Inovação', 'Estratégia', 'Execução', 'Relacionamento', 'Adaptabilidade'].map((tag, idx) => <Badge key={idx} variant="secondary" className="text-xs bg-red-100 text-red-800">
                          {tag}
                        </Badge>)}
                    </div>}
                </div>
              </CardContent>
            </Card>
          </motion.div>)}
      </div>

      {/* Ação de Atribuição em Massa */}
      <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-primary text-primary-foreground">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">Atribuição em Massa</h3>
                <p className="text-muted-foreground text-sm">
                  Atribua todas as sessões disponíveis para todos os usuários de uma só vez
                </p>
              </div>
            </div>
            <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg">
              <Send className="w-5 h-5 mr-2" />
              Atribuir Todas as Sessões a Todos os Usuários
            </Button>
          </div>
          
          <div className="mt-4 p-4 bg-warning/10 border border-warning/20 rounded-lg">
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 rounded-full bg-warning mt-2"></div>
              <div className="text-sm">
                <p className="font-medium mb-1 text-gray-900">O que esta ação faz:</p>
                <ul className="text-muted-foreground space-y-1">
                  <li>• Atribui TODAS as sessões disponíveis a TODOS os usuários</li>
                  <li>• Usuários poderão ver e completar todas as sessões</li>
                  <li>• Não duplica atribuições já existentes</li>
                  <li>• Status inicial: "pending" (pendente)</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modal para seleção de usuários */}
      <Dialog open={!!selectedTemplate} onOpenChange={() => setSelectedTemplate(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Enviar Template: {templates.find(t => t.id === selectedTemplate)?.title}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {selectedTemplate && <div className="grid gap-6 lg:grid-cols-2">
                <UserSelector selectedUsers={selectedUsers} onSelectionChange={setSelectedUsers} />
                
                <SessionSender sessionId={selectedTemplate} sessionTitle={templates.find(t => t.id === selectedTemplate)?.title || ''} userIds={selectedUsers} isTemplate={true} onSuccess={() => {
              setSelectedTemplate(null);
              setSelectedUsers([]);
              toast({
                title: "✅ Sucesso!",
                description: "Template enviado com sucesso!"
              });
            }} />
              </div>}
          </div>
        </DialogContent>
      </Dialog>
    </div>;
};
export default SessionTemplates;