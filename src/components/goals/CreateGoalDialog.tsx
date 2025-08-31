import { useState } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useToast } from '@/hooks/use-toast';
import { Target, Users, Share2, Trophy, Mail, MessageCircle, X, CalendarIcon, Sparkles, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useEffect } from 'react';

interface CreateGoalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

interface InviteContact {
  type: 'user' | 'email' | 'whatsapp';
  value: string;
  name?: string;
}

export function CreateGoalDialog({ open, onOpenChange, onSuccess }: CreateGoalDialogProps) {
  const [currentTab, setCurrentTab] = useState('goal');
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    challenge_id: '',
    target_value: '',
    unit: '',
    difficulty: 'medio' as 'facil' | 'medio' | 'dificil',
    target_date: '',
    is_group_goal: false,
    evidence_required: true,
    transform_to_challenge: false
  });

  const [invites, setInvites] = useState<InviteContact[]>([]);
  const [newInvite, setNewInvite] = useState({ type: 'email' as 'user' | 'email' | 'whatsapp', value: '', name: '' });

  // Templates pré-definidos para facilitar
  const metaTemplates = [
    {
      title: "Perder peso",
      description: "Meta focada em redução de peso de forma saudável",
      target_value: "5",
      unit: "kg",
      category: "saude",
      timeframe: "90 dias"
    },
    {
      title: "Ganhar massa muscular", 
      description: "Meta para aumento de massa magra através de exercícios",
      target_value: "3",
      unit: "kg",
      category: "exercicio",
      timeframe: "120 dias"
    },
    {
      title: "Correr distância",
      description: "Meta de corrida para melhorar resistência cardiovascular",
      target_value: "10",
      unit: "km",
      category: "exercicio", 
      timeframe: "60 dias"
    },
    {
      title: "Beber mais água",
      description: "Meta diária de hidratação para melhorar a saúde",
      target_value: "2",
      unit: "litros",
      category: "hidratacao",
      timeframe: "30 dias"
    },
    {
      title: "Dormir melhor",
      description: "Meta para melhoria da qualidade do sono",
      target_value: "8",
      unit: "horas",
      category: "sono",
      timeframe: "60 dias"
    }
  ];

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Categorias fixas já que não há tabela goal_categories
  const categories = [
    { id: 'peso', name: 'Peso', icon: '⚖️' },
    { id: 'exercicio', name: 'Exercício', icon: '🏃' },
    { id: 'alimentacao', name: 'Alimentação', icon: '🥗' },
    { id: 'habitos', name: 'Hábitos', icon: '📝' },
    { id: 'sono', name: 'Sono', icon: '😴' },
    { id: 'agua', name: 'Hidratação', icon: '💧' }
  ];

  // Buscar desafios - removido para evitar erro 403
  const { data: challenges } = useQuery({
    queryKey: ['available-challenges'],
    queryFn: async () => {
      return []; // Retorna array vazio por enquanto
    }
  });

  // Buscar usuários da plataforma para convites - DESABILITADO TEMPORARIAMENTE
  // const { data: platformUsers } = useQuery({
  //   queryKey: ['platform-users'],
  //   queryFn: async () => {
  //     const { data, error } = await supabase
  //       .from('profiles')
  //       .select('user_id, full_name, email')
  //       .not('user_id', 'is', null)
  //       .order('full_name');
  //     
  //     if (error) throw error;
  //     return data;
  //   }
  // });

  const calculateEstimatedPoints = () => {
    if (!formData.category) return 0;
    
    const category = categories?.find(c => c.name === formData.category);
    const basePoints = 10; // Fixed base points
    const difficultyMultipliers = { facil: 1.0, medio: 1.5, dificil: 2.0 };
    const multiplier = difficultyMultipliers[formData.difficulty] || 1.0;

    return Math.round(basePoints * multiplier);
  };

  const createGoalMutation = useMutation({
    mutationFn: async (goalData: typeof formData) => {
      console.log('🚀 Iniciando criação de meta...');
      
      // Verificar estado de autenticação detalhadamente
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      console.log('🔍 Auth data:', { user, authError });
      
      if (authError) {
        console.error('❌ Erro de autenticação:', authError);
        throw new Error(`Erro de autenticação: ${authError.message}`);
      }
      
      if (!user) {
        console.error('❌ Usuário não encontrado');
        // Tentar obter sessão atual
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        console.log('🔍 Session data:', { session, sessionError });
        throw new Error("Usuário não autenticado. Faça login novamente.");
      }
      
      console.log('👤 Usuário autenticado:', user.id);

      const estimatedPoints = calculateEstimatedPoints();
      console.log('📊 Pontos estimados:', estimatedPoints);

      const goalInsertData = {
        user_id: user.id,
        title: goalData.title,
        description: goalData.description,
        category: goalData.category || null,
        challenge_id: goalData.challenge_id || null,
        target_value: goalData.target_value ? parseFloat(goalData.target_value) : null,
        unit: goalData.unit || null,
        difficulty: goalData.difficulty,
        target_date: goalData.target_date || null,
        is_group_goal: goalData.is_group_goal,
        evidence_required: goalData.evidence_required,
        estimated_points: estimatedPoints,
        status: 'pendente',
        current_value: 0
      };
      
      console.log('📝 Dados para inserção:', goalInsertData);

      // Se meta em grupo e o usuário digitou um email/nome mas não clicou no resultado, tentar resolver
      if (goalData.is_group_goal && invites.length === 0 && userSearch.trim().length > 0) {
        const { data: found } = await supabase
          .from('profiles')
          .select('user_id, full_name, email')
          .or(`full_name.ilike.%${userSearch.trim()}%,email.ilike.%${userSearch.trim()}%`)
          .limit(1)
          .maybeSingle();
        if (!found) {
          throw new Error('Participante não encontrado. Verifique o nome/email e selecione na lista.');
        }
        invites.push({ type: 'user', value: found.user_id, name: found.full_name || found.email });
      }

      // Criar meta
      const { data: goal, error: goalError } = await supabase
        .from('user_goals')
        .insert(goalInsertData)
        .select()
        .single();

      if (goalError) {
        console.error('❌ Erro ao criar meta:', goalError);
        throw goalError;
      }
      
      console.log('✅ Meta criada com sucesso:', goal);

      // Inserir convites pendentes (aparecerão para o convidado somente após admin aprovar a meta)
      if (goalData.is_group_goal && invites.length > 0) {
        const rows = invites.map((inv) => {
          if (inv.type === 'user') {
            return { goal_id: goal.id, inviter_id: user.id, invitee_user_id: inv.value, invitee_name: inv.name, status: 'pending' };
          }
          if (inv.type === 'email') {
            return { goal_id: goal.id, inviter_id: user.id, invitee_email: inv.value, invitee_name: inv.name, status: 'pending' };
          }
          return null as any;
        }).filter(Boolean);
        const { error: invErr } = await (supabase as any).from('user_goal_invitations').insert(rows);
        if (invErr) {
          console.error('Erro ao inserir convites:', invErr);
          throw new Error('Meta criada, mas falhou ao enviar convites. Tente novamente.');
        }

        // Notificações para cada invite (resolução de contato feita no servidor)
        for (const inv of invites) {
          if (inv.type === 'email') {
            await supabase.functions.invoke('goal-notifications', {
              body: { type: 'email', recipient: inv.value, goalData: goal, template: 'goal_invite', senderName: user.email }
            });
          } else if (inv.type === 'user') {
            // Tenta e-mail e WhatsApp com lookup server-side via recipientUserId
            await supabase.functions.invoke('goal-notifications', {
              body: { type: 'email', recipientUserId: inv.value, goalData: goal, template: 'goal_invite', senderName: user.email }
            });
            await supabase.functions.invoke('goal-notifications', {
              body: { type: 'whatsapp', recipientUserId: inv.value, goalData: goal, template: 'goal_invite', senderName: user.email }
            });
          }
        }
      }

      return goal;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-goals'] });
      onSuccess();
      onOpenChange(false);
      resetForm();
      
      toast({
        title: "Meta criada com sucesso!",
        description: "Sua meta foi criada e está aguardando aprovação."
      });
    },
    onError: (error: any) => {
      console.error('❌ Erro na mutation:', error);
      toast({
        title: "Erro ao criar meta",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const processInvites = async (goalId: string, inviteList: InviteContact[]) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Buscar nome do usuário para usar nos convites - DESABILITADO TEMPORARIAMENTE
    // const { data: profile } = await supabase
    //   .from('profiles')
    //   .select('full_name')
    //   .eq('user_id', user.id)
    //   .maybeSingle();

    const senderName = 'Um usuário'; // DESABILITADO TEMPORARIAMENTE

    for (const invite of inviteList) {
      // Temporário - simular convites até tipos serem atualizados
      console.log('Creating invite for:', invite.value);

      if (invite.type === 'email') {
        // Enviar email via edge function
        await supabase.functions.invoke('goal-notifications', {
          body: {
            type: 'email',
            recipient: invite.value,
            goalData: formData,
            template: 'goal_invite',
            senderName
          }
        });
      } else if (invite.type === 'whatsapp') {
        // Enviar WhatsApp via edge function
        await supabase.functions.invoke('goal-notifications', {
          body: {
            type: 'whatsapp',
            recipient: invite.value,
            goalData: formData,
            template: 'goal_invite',
            senderName
          }
        });
      } else if (invite.type === 'user') {
        // Temporário - simular notificação até tipos serem atualizados
        console.log('Creating notification for user:', invite.value);
      }
    }
  };

  const addInvite = () => {
    if (!newInvite.value) return;
    
    setInvites(prev => [...prev, { ...newInvite }]);
    setNewInvite({ type: 'email', value: '', name: '' });
  };

  const removeInvite = (index: number) => {
    setInvites(prev => prev.filter((_, i) => i !== index));
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      category: '',
      challenge_id: '',
      target_value: '',
      unit: '',
      difficulty: 'medio',
      target_date: '',
      is_group_goal: false,
      evidence_required: true,
      transform_to_challenge: false
    });
    setInvites([]);
    setCurrentTab('goal');
  };

  const applyTemplate = (template: typeof metaTemplates[0]) => {
    const targetDate = new Date();
    const days = parseInt(template.timeframe.split(' ')[0]);
    targetDate.setDate(targetDate.getDate() + days);
    
    setFormData(prev => ({
      ...prev,
      title: template.title,
      description: template.description,
      target_value: template.target_value,
      unit: template.unit,
      target_date: targetDate.toISOString().split('T')[0]
    }));
    
    setSelectedDate(targetDate);
  };

  const generateAIDescription = async () => {
    if (!formData.title) {
      toast({
        title: "Adicione um título primeiro",
        description: "Para gerar uma descrição, primeiro adicione um título para sua meta.",
        variant: "destructive"
      });
      return;
    }

    setIsGeneratingDescription(true);
    
    try {
      const prompt = `Crie uma descrição motivacional e detalhada para a meta: "${formData.title}". A descrição deve:
      - Ser motivacional e inspiradora
      - Incluir benefícios específicos
      - Dar dicas práticas para alcançar a meta
      - Ter entre 100-200 caracteres
      - Usar linguagem positiva e encorajadora`;

      const { data, error } = await supabase.functions.invoke('gpt-chat', {
        body: { message: prompt }
      });

      if (error) throw error;

      setFormData(prev => ({
        ...prev,
        description: data.response || "Meta criada para melhorar sua qualidade de vida e bem-estar através de hábitos saudáveis e consistência no acompanhamento do progresso."
      }));

      toast({
        title: "Descrição gerada! ✨",
        description: "A IA criou uma descrição personalizada para sua meta."
      });
    } catch (error) {
      console.error('Erro ao gerar descrição:', error);
      toast({
        title: "Erro na geração",
        description: "Não foi possível gerar a descrição automaticamente. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingDescription(false);
    }
  };

  const handleSubmit = () => {
    if (!formData.title) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha o título da meta.",
        variant: "destructive"
      });
      return;
    }

    createGoalMutation.mutate(formData);
  };

  // Busca usuários por nome/email
  const [userSearch, setUserSearch] = useState('');
  const [userResults, setUserResults] = useState<{ user_id: string; full_name: string; email: string; phone?: string; city?: string }[]>([]);
  const [userSearchLoading, setUserSearchLoading] = useState(false);
  const [userSearchError, setUserSearchError] = useState<string | null>(null);

async function searchUsers(term: string) {
  if (!term || term.length < 2) { setUserResults([]); return; }
  setUserSearchError(null);
  setUserSearchLoading(true);
  try {
    // Usar Edge Function para obter usuários de múltiplas fontes com service role
    const { data, error } = await supabase.functions.invoke('search-users', { body: { term } });
    if (error) {
      console.error('Erro na função search-users:', error);
      setUserResults([]);
      setUserSearchError('Não foi possível carregar usuários.');
      return;
    }
    setUserResults((data?.data || []).slice(0,50));
  } catch (err: any) {
    console.error('Falha ao buscar usuários:', err);
    setUserResults([]);
    setUserSearchError('Falha de conexão ao buscar usuários.');
  } finally {
    setUserSearchLoading(false);
  }
}

  useEffect(() => { const t = setTimeout(() => searchUsers(userSearch), 250); return () => clearTimeout(t); }, [userSearch]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Criar Nova Meta
          </SheetTitle>
        </SheetHeader>

        <Tabs value={currentTab} onValueChange={setCurrentTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="goal">🎯 Meta</TabsTrigger>
            <TabsTrigger value="sharing">🤝 Compartilhar</TabsTrigger>
          </TabsList>

          <TabsContent value="goal" className="space-y-4">
            {/* Templates Rápidos (chips compactos) */}
            <div>
              <Label>Templates Rápidos 🚀</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {metaTemplates.slice(0,4).map((template, index) => (
                  <Button
                    key={index}
                    variant="secondary"
                    size="sm"
                    onClick={() => applyTemplate(template)}
                    className="h-7 px-3 rounded-full"
                  >
                    {template.title}
                  </Button>
                ))}
              </div>
            </div>

            {/* Título */}
            <div>
              <Label htmlFor="title">Título da Meta *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Ex: Perder 5kg em 3 meses"
              />
            </div>

            {/* Descrição com IA */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Label htmlFor="description">Descrição</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={generateAIDescription}
                  disabled={isGeneratingDescription || !formData.title}
                  className="h-6 px-2 text-xs"
                >
                  {isGeneratingDescription ? (
                    <>
                      <Clock className="w-3 h-3 mr-1 animate-spin" />
                      Gerando...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3 h-3 mr-1" />
                      IA
                    </>
                  )}
                </Button>
              </div>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Descreva sua meta em detalhes... (ou use a IA para gerar)"
                rows={3}
              />
            </div>

            {/* Categoria */}
            <div>
              <Label>Categoria</Label>
              <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categories?.map((category) => (
                    <SelectItem key={category.id} value={category.name}>
                      <span className="flex items-center gap-2">
                        <span>{category.icon}</span>
                        {category.name}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Valor e Unidade - Simplificado */}
            <div>
              <Label>Meta & Unidade</Label>
              <div className="grid grid-cols-3 gap-2">
                <Input
                  type="number"
                  step="0.1"
                  value={formData.target_value}
                  onChange={(e) => setFormData(prev => ({ ...prev, target_value: e.target.value }))}
                  placeholder="5"
                />
                <Select value={formData.unit} onValueChange={(value) => setFormData(prev => ({ ...prev, unit: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Unidade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="kg">kg (peso)</SelectItem>
                    <SelectItem value="litros">litros (água)</SelectItem>
                    <SelectItem value="km">km (distância)</SelectItem>
                    <SelectItem value="horas">horas (tempo)</SelectItem>
                    <SelectItem value="dias">dias (prazo)</SelectItem>
                    <SelectItem value="vezes">vezes (repetições)</SelectItem>
                    <SelectItem value="passos">passos (caminhada)</SelectItem>
                    <SelectItem value="%">% (percentual)</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={formData.difficulty} onValueChange={(value: any) => setFormData(prev => ({ ...prev, difficulty: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="facil">😊 Fácil</SelectItem>
                    <SelectItem value="medio">😐 Médio</SelectItem>
                    <SelectItem value="dificil">😤 Difícil</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Data Limite - Melhorada */}
            <div>
              <Label>Data Limite</Label>
              <div className="grid grid-cols-2 gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "justify-start text-left font-normal",
                        !selectedDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {selectedDate ? format(selectedDate, "dd/MM/yyyy") : "Escolher data"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={(date) => {
                        setSelectedDate(date);
                        if (date) {
                          setFormData(prev => ({ 
                            ...prev, 
                            target_date: date.toISOString().split('T')[0] 
                          }));
                        }
                      }}
                      disabled={(date) => date < new Date()}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
                
                <div className="grid grid-cols-3 gap-1">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      const date = new Date();
                      date.setDate(date.getDate() + 30);
                      setSelectedDate(date);
                      setFormData(prev => ({ ...prev, target_date: date.toISOString().split('T')[0] }));
                    }}
                    className="text-xs"
                  >
                    30d
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      const date = new Date();
                      date.setDate(date.getDate() + 60);
                      setSelectedDate(date);
                      setFormData(prev => ({ ...prev, target_date: date.toISOString().split('T')[0] }));
                    }}
                    className="text-xs"
                  >
                    60d
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      const date = new Date();
                      date.setDate(date.getDate() + 90);
                      setSelectedDate(date);
                      setFormData(prev => ({ ...prev, target_date: date.toISOString().split('T')[0] }));
                    }}
                    className="text-xs"
                  >
                    90d
                  </Button>
                </div>
              </div>
            </div>

            {/* Opções */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Meta em Grupo</Label>
                  <p className="text-sm text-muted-foreground">
                    Permite que outros usuários participem desta meta
                  </p>
                </div>
                <Switch
                  checked={formData.is_group_goal}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_group_goal: checked }))}
                />
              </div>

              {formData.is_group_goal && (
                <div className="space-y-2">
                  <Label>Adicionar participantes (nome completo ou email)</Label>
                  <Input value={userSearch} onChange={(e) => setUserSearch(e.target.value)} placeholder="Digite nome ou email" />
                  {(userResults.length > 0 || userSearchLoading || userSearchError) && (
                    <div className="max-h-60 overflow-y-auto border rounded p-1 space-y-1">
                      {userSearchLoading && (
                        <div className="px-2 py-3 text-sm text-muted-foreground">Carregando...</div>
                      )}
                      {userSearchError && !userSearchLoading && (
                        <div className="px-2 py-3 text-sm text-red-600">{userSearchError}</div>
                      )}
                      {userResults.map(u => {
                        const phoneFmt = u.phone ? u.phone.replace(/^(\+?55)?(\d{2})(\d{5})(\d{4})$/, '($2) $3-$4') : '';
                        return (
                          <Button key={u.user_id} variant="ghost" className="w-full justify-between px-2 py-2 text-left" onClick={() => {
                            setInvites(prev => [...prev, { type: 'user', value: u.user_id, name: u.full_name || u.email }]);
                            setUserResults([]); setUserSearch('');
                          }}>
                            <div className="flex flex-col items-start">
                              <span className="text-sm font-medium">{u.full_name}</span>
                              <span className="text-xs text-muted-foreground">
                                {u.email}
                                {u.phone ? ` • ${phoneFmt || u.phone}` : ''}
                                {u.city ? ` • ${u.city}` : ''}
                              </span>
                            </div>
                          </Button>
                        );
                      })}
                      {!userSearchLoading && !userSearchError && userResults.length === 0 && (
                        <div className="px-2 py-3 text-sm text-muted-foreground">Nenhum usuário encontrado.</div>
                      )}
                      {userResults.length >= 50 && (
                        <div className="text-xs text-muted-foreground px-2 pb-1">Mostrando os primeiros 50 resultados. Continue digitando para refinar.</div>
                      )}
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Evidências Obrigatórias</Label>
                  <p className="text-sm text-muted-foreground">
                    Exige envio de fotos ou documentos para comprovar progresso
                  </p>
                </div>
                <Switch
                  checked={formData.evidence_required}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, evidence_required: checked }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Enviar para Desafio</Label>
                  <p className="text-sm text-muted-foreground">
                    Requer aprovação do administrador antes de publicar
                  </p>
                </div>
                <Switch
                  checked={formData.transform_to_challenge}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, transform_to_challenge: checked }))}
                />
              </div>
            </div>

            {/* Pontos Estimados */}
            {formData.category && (
              <div className="bg-muted/50 p-4 rounded-lg">
                <p className="text-sm font-medium">Pontos Estimados: {calculateEstimatedPoints()} pts</p>
                <p className="text-xs text-muted-foreground">
                  Pontos finais serão definidos pelo administrador após aprovação
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="sharing" className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-4">Convide pessoas para acompanhar sua meta</h3>
              
              <div className="grid grid-cols-3 gap-2 mb-4">
                <Select value={newInvite.type} onValueChange={(value: 'user' | 'email' | 'whatsapp') => setNewInvite(prev => ({ ...prev, type: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user"><Users className="w-4 h-4 mr-2 inline" />Usuário</SelectItem>
                    <SelectItem value="email"><Mail className="w-4 h-4 mr-2 inline" />Email</SelectItem>
                    <SelectItem value="whatsapp"><MessageCircle className="w-4 h-4 mr-2 inline" />WhatsApp</SelectItem>
                  </SelectContent>
                </Select>
                
                {newInvite.type === 'user' ? (
                  <Select value={newInvite.value} onValueChange={(value) => {
                    // DESABILITADO TEMPORARIAMENTE
                    setNewInvite(prev => ({ ...prev, value, name: 'Usuário selecionado' }));
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione usuário" />
                    </SelectTrigger>
                    <SelectContent>
                      {/* DESABILITADO TEMPORARIAMENTE */}
                      <SelectItem value="user1">Usuário 1</SelectItem>
                      <SelectItem value="user2">Usuário 2</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    value={newInvite.value}
                    onChange={(e) => setNewInvite(prev => ({ ...prev, value: e.target.value }))}
                    placeholder={newInvite.type === 'email' ? 'email@exemplo.com' : '+5511999999999'}
                  />
                )}
                
                <Button onClick={addInvite} size="sm">
                  Adicionar
                </Button>
              </div>

              {invites.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Convites adicionados:</h4>
                  {invites.map((invite, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded">
                      <Badge variant="secondary">
                        {invite.type === 'user' && <Users className="w-3 h-3 mr-1" />}
                        {invite.type === 'email' && <Mail className="w-3 h-3 mr-1" />}
                        {invite.type === 'whatsapp' && <MessageCircle className="w-3 h-3 mr-1" />}
                        {invite.type}
                      </Badge>
                      <span className="text-sm">{invite.name || invite.value}</span>
                      <Button size="sm" variant="ghost" onClick={() => removeInvite(index)}>
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

        </Tabs>

        <div className="flex justify-end gap-3 pt-4 sticky bottom-0 bg-background py-3">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={createGoalMutation.isPending || !formData.title}
          >
            {createGoalMutation.isPending ? 'Criando...' : 'Criar Meta'}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}