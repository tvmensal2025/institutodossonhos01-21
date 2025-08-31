import React, { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { GoalManagement } from './GoalManagement';
import { CreateGoalModal } from './CreateGoalModal';
import {
  Plus, Edit, Trash2, Trophy, Users, Calendar, 
  Target, CheckCircle, AlertCircle, Search, 
  Filter, BarChart3, Activity, Settings, Bell
} from 'lucide-react';

interface Challenge {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  duration_days: number;
  points_reward: number;
  badge_icon: string;
  badge_name: string;
  instructions: string;
  tips: string[];
  daily_log_type: string;
  daily_log_target: number;
  daily_log_unit: string;
  is_active: boolean;
  is_featured: boolean;
  is_group_challenge: boolean;
  max_participants?: number;
  start_date?: string;
  end_date?: string;
  created_at: string;
  updated_at: string;
}

interface ChallengeParticipation {
  id: string;
  challenge_id: string;
  user_id: string;
  current_streak: number;
  progress: number;
  is_completed: boolean;
  started_at: string;
  completed_at?: string;
  challenges: Challenge;
}

interface ChallengeManagementProps {
  user: User | null;
}

export default function ChallengeManagement({ user }: ChallengeManagementProps) {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [participations, setParticipations] = useState<ChallengeParticipation[]>([]);
  const [pendingGoals, setPendingGoals] = useState(0);
  const [isCreateGoalModalOpen, setIsCreateGoalModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [stats, setStats] = useState({
    totalChallenges: 0,
    activeChallenges: 0,
    totalParticipations: 0,
    completedParticipations: 0
  });
  const { toast } = useToast();

  // Form states
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'exercicio',
    difficulty: 'medio',
    duration_days: 7,
    points_reward: 100,
    badge_icon: '🏆',
    badge_name: '',
    instructions: '',
    tips: [''],
    daily_log_type: 'boolean',
    daily_log_target: 1,
    daily_log_unit: 'dia',
    is_featured: false,
    is_group_challenge: false,
    max_participants: undefined as number | undefined
  });

  const categories = [
    { value: 'exercicio', label: 'Exercício', icon: '🏃' },
    { value: 'nutricao', label: 'Nutrição', icon: '🥗' },
    { value: 'hidratacao', label: 'Hidratação', icon: '💧' },
    { value: 'sono', label: 'Sono', icon: '😴' },
    { value: 'mindfulness', label: 'Mindfulness', icon: '🧘' },
    { value: 'jejum', label: 'Jejum', icon: '⏰' },
    { value: 'medicao', label: 'Medição', icon: '📏' }
  ];

  const difficulties = [
    { value: 'facil', label: 'Fácil', color: 'bg-green-100 text-green-800' },
    { value: 'medio', label: 'Médio', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'dificil', label: 'Difícil', color: 'bg-orange-100 text-orange-800' },
    { value: 'extremo', label: 'Extremo', color: 'bg-red-100 text-red-800' }
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      await Promise.all([loadChallenges(), loadParticipations(), loadPendingGoals()]);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPendingGoals = async () => {
    try {
      const { count } = await supabase
        .from('user_goals')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pendente');
      
      setPendingGoals(count || 0);
    } catch (error) {
      console.error('Error loading pending goals:', error);
    }
  };

  const loadChallenges = async () => {
    try {
      const { data: challengesData, error } = await supabase
        .from('challenges')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar desafios:', error);
        throw error;
      }

      const transformedChallenges = challengesData?.map(challenge => ({
        id: challenge.id,
        title: challenge.title,
        description: challenge.description,
        category: challenge.challenge_type || 'exercicio',
        difficulty: challenge.difficulty || 'medio',
        duration_days: challenge.duration_days || 7,
        points_reward: challenge.xp_reward || 100,
        badge_icon: getCategoryIcon(challenge.challenge_type || 'exercicio'),
        badge_name: challenge.title,
        instructions: challenge.description,
        tips: ['Complete diariamente', 'Mantenha a consistência'],
        daily_log_type: 'boolean',
        daily_log_target: 1,
        daily_log_unit: 'dia',
        is_active: challenge.is_active ?? true,
        is_featured: false,
        is_group_challenge: false,
        created_at: challenge.created_at,
        updated_at: challenge.updated_at || challenge.created_at
      })) || [];
      
      setChallenges(transformedChallenges);
      const activeCount = transformedChallenges.filter(c => c.is_active).length;
      setStats(prev => ({ 
        ...prev, 
        totalChallenges: transformedChallenges.length, 
        activeChallenges: activeCount 
      }));
    } catch (error) {
      console.error('Erro ao carregar desafios:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os desafios",
        variant: "destructive"
      });
    }
  };

  const loadParticipations = async () => {
    try {
      const mockParticipations: ChallengeParticipation[] = [];
      setParticipations(mockParticipations);
      setStats(prev => ({ ...prev, totalParticipations: 0, completedParticipations: 0 }));
    } catch (error) {
      console.error('Erro ao carregar participações:', error);
    }
  };

  const createChallenge = async () => {
    if (!formData.title.trim()) {
      toast({
        title: "Erro",
        description: "O título do desafio é obrigatório",
        variant: "destructive"
      });
      return;
    }

    if (!formData.description.trim()) {
      toast({
        title: "Erro",
        description: "A descrição do desafio é obrigatória",
        variant: "destructive"
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('challenges')
        .insert([{
          title: formData.title,
          description: formData.description,
          challenge_type: formData.category || 'personal',
          difficulty: formData.difficulty,
          duration_days: formData.duration_days,
          xp_reward: formData.points_reward,
          is_active: true,
          created_by: (await supabase.auth.getUser()).data.user?.id || '',
          start_date: new Date().toISOString().split('T')[0],
          end_date: new Date(Date.now() + (formData.duration_days || 7) * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        }])
        .select()
        .single();

      if (error) throw error;

      const challengeType = formData.is_group_challenge ? "Público" : "Individual";
      toast({
        title: "Desafio Criado! ✅", 
        description: `"${formData.title}" (${challengeType}) foi criado com sucesso!`
      });

      setIsCreateModalOpen(false);
      resetForm();
      loadChallenges();
    } catch (error) {
      console.error('Error creating challenge:', error);
      toast({
        title: "Erro",
        description: "Não foi possível criar o desafio",
        variant: "destructive"
      });
    }
  };

  const updateChallenge = async () => {
    if (!selectedChallenge) return;

    try {
      const { error } = await supabase
        .from('challenges')
        .update({
          title: formData.title,
          description: formData.description,
          category: formData.category,
          difficulty: formData.difficulty,
          duration_days: formData.duration_days,
          xp_reward: formData.points_reward,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedChallenge.id);

      if (error) throw error;

      toast({
        title: "Desafio Atualizado! ✅",
        description: `"${formData.title}" foi atualizado com sucesso!`
      });

      setIsEditModalOpen(false);
      setSelectedChallenge(null);
      resetForm();
      loadChallenges();
    } catch (error) {
      console.error('Error updating challenge:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o desafio",
        variant: "destructive"
      });
    }
  };

  const toggleChallengeStatus = async (challengeId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('challenges')
        .update({
          is_active: !currentStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', challengeId);

      if (error) throw error;

      toast({
        title: !currentStatus ? "Desafio Ativado ✅" : "Desafio Desativado 🔴",
        description: !currentStatus ? "Desafio está ativo e visível para usuários" : "Desafio foi desativado"
      });

      loadChallenges();
    } catch (error) {
      console.error('Error toggling challenge:', error);
      toast({
        title: "Erro",
        description: "Não foi possível alterar status do desafio",
        variant: "destructive"
      });
    }
  };

  const deleteChallenge = async (challengeId: string) => {
    const { data: profile } = await supabase
      .from('profiles')
      .select('display_name')
      .eq('user_id', user?.id)
      .single();

    // Admin check disabled - profiles table doesn't have role/admin_level columns
    console.log('Admin check disabled for challenge deletion');

    try {
      const { error } = await supabase
        .from('challenges')
        .delete()
        .eq('id', challengeId);

      if (error) throw error;

      toast({
        title: "Desafio Excluído ✅",
        description: "Desafio foi permanentemente removido"
      });

      loadChallenges();
    } catch (error) {
      console.error('Error deleting challenge:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o desafio",
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      category: 'exercicio',
      difficulty: 'medio',
      duration_days: 7,
      points_reward: 100,
      badge_icon: '🏆',
      badge_name: '',
      instructions: '',
      tips: [''],
      daily_log_type: 'boolean',
      daily_log_target: 1,
      daily_log_unit: 'dia',
      is_featured: false,
      is_group_challenge: false,
      max_participants: undefined
    });
  };

  const openEditModal = (challenge: Challenge) => {
    setSelectedChallenge(challenge);
    setFormData({
      title: challenge.title,
      description: challenge.description,
      category: challenge.category,
      difficulty: challenge.difficulty,
      duration_days: challenge.duration_days,
      points_reward: challenge.points_reward,
      badge_icon: challenge.badge_icon,
      badge_name: challenge.badge_name,
      instructions: challenge.instructions,
      tips: challenge.tips.length > 0 ? challenge.tips : [''],
      daily_log_type: challenge.daily_log_type,
      daily_log_target: challenge.daily_log_target,
      daily_log_unit: challenge.daily_log_unit,
      is_featured: challenge.is_featured,
      is_group_challenge: challenge.is_group_challenge,
      max_participants: challenge.max_participants
    });
    setIsEditModalOpen(true);
  };

  const getCategoryIcon = (category: string) => {
    return categories.find(c => c.value === category)?.icon || '🏆';
  };

  const getDifficultyColor = (difficulty: string) => {
    return difficulties.find(d => d.value === difficulty)?.color || 'bg-gray-100 text-gray-800';
  };

  const filteredChallenges = challenges.filter(challenge => {
    const matchesSearch = challenge.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         challenge.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || challenge.category === filterCategory;
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'active' && challenge.is_active) ||
                         (filterStatus === 'inactive' && !challenge.is_active);
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const renderModal = (isEdit: boolean) => (
    <DialogContent className="w-[95vw] max-w-2xl max-h-[80vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5" />
          {isEdit ? 'Editar' : 'Criar'} Desafio
        </DialogTitle>
        <DialogDescription>
          Crie um desafio individual para um usuário ou um desafio público para a comunidade
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="title">Título</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Ex: 10.000 passos por dia"
            />
          </div>
          <div>
            <Label htmlFor="badge_name">Nome do Badge</Label>
            <Input
              id="badge_name"
              value={formData.badge_name}
              onChange={(e) => setFormData(prev => ({ ...prev, badge_name: e.target.value }))}
              placeholder="Ex: Caminhante Dedicado"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="description">Descrição</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Descreva o desafio..."
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label htmlFor="category">Categoria</Label>
            <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.icon} {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="difficulty">Dificuldade</Label>
            <Select value={formData.difficulty} onValueChange={(value) => setFormData(prev => ({ ...prev, difficulty: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {difficulties.map((difficulty) => (
                  <SelectItem key={difficulty.value} value={difficulty.value}>
                    {difficulty.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="duration">Duração (dias)</Label>
            <Input
              id="duration"
              type="number"
              value={formData.duration_days}
              onChange={(e) => setFormData(prev => ({ ...prev, duration_days: parseInt(e.target.value) || 7 }))}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="points">Pontos de Recompensa</Label>
            <Input
              id="points"
              type="number"
              value={formData.points_reward}
              onChange={(e) => setFormData(prev => ({ ...prev, points_reward: parseInt(e.target.value) || 100 }))}
            />
          </div>
          <div>
            <Label htmlFor="icon">Ícone do Badge</Label>
            <Input
              id="icon"
              value={formData.badge_icon}
              onChange={(e) => setFormData(prev => ({ ...prev, badge_icon: e.target.value }))}
              placeholder="🏆"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => isEdit ? setIsEditModalOpen(false) : setIsCreateModalOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={isEdit ? updateChallenge : createChallenge}>
            {isEdit ? 'Atualizar' : 'Criar'} Desafio
          </Button>
        </div>
      </div>
    </DialogContent>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Trophy className="h-12 w-12 text-primary mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground">Carregando desafios...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestão de Metas e Desafios</h1>
          <p className="text-muted-foreground">Crie e gerencie metas e desafios de saúde para os usuários</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => setIsCreateGoalModalOpen(true)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Nova Meta
          </Button>
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Novo Desafio
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-4 w-4" />
              Total de Desafios
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalChallenges}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-green-500" />
              Desafios Ativos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.activeChallenges}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-500" />
              Participações
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.totalParticipations}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-purple-500" />
              Completados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats.completedParticipations}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="challenges" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="challenges" className="flex items-center gap-2">
            <Trophy className="h-4 w-4" />
            Desafios
          </TabsTrigger>
          <TabsTrigger value="goals" className="flex items-center gap-2 relative">
            <Target className="h-4 w-4" />
            Metas
            {pendingGoals > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                {pendingGoals}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="participations">Participações</TabsTrigger>
        </TabsList>

        <TabsContent value="challenges" className="space-y-4">
          {/* Filtros */}
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Buscar desafios..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as categorias</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.icon} {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                <SelectItem value="active">Ativos</SelectItem>
                <SelectItem value="inactive">Inativos</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Lista de Desafios */}
          <div className="grid gap-4">
            {filteredChallenges.map((challenge) => (
              <Card key={challenge.id} className="transition-all hover:shadow-md">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="text-3xl">{challenge.badge_icon}</div>
                      <div className="flex-1">
                        <CardTitle className="text-xl">{challenge.title}</CardTitle>
                        <p className="text-muted-foreground text-sm mt-1">
                          {challenge.description}
                        </p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          <Badge variant="outline">
                            {getCategoryIcon(challenge.category)} {challenge.category}
                          </Badge>
                          <Badge className={getDifficultyColor(challenge.difficulty)}>
                            {challenge.difficulty}
                          </Badge>
                          <Badge variant="outline">
                            <Calendar className="w-3 h-3 mr-1" />
                            {challenge.duration_days} dias
                          </Badge>
                          <Badge variant="outline">
                            <Trophy className="w-3 h-3 mr-1" />
                            {challenge.points_reward} pts
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {challenge.is_active ? (
                        <Badge className="bg-green-50 text-green-700">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Ativo
                        </Badge>
                      ) : (
                        <Badge variant="secondary">Inativo</Badge>
                      )}
                      {challenge.is_featured && (
                        <Badge className="bg-yellow-50 text-yellow-700">Destacado</Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-muted-foreground">
                      Criado em {new Date(challenge.created_at).toLocaleDateString()}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditModal(challenge)}
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Editar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleChallengeStatus(challenge.id, challenge.is_active)}
                      >
                        {challenge.is_active ? 'Desativar' : 'Ativar'}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteChallenge(challenge.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="goals" className="space-y-4">
          <GoalManagement />
        </TabsContent>

        <TabsContent value="participations" className="space-y-4">
          {/* Lista de Participações */}
          <div className="grid gap-4">
            {participations.map((participation) => (
              <Card key={participation.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{participation.challenges?.title}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        Usuário: {participation.user_id}
                      </p>
                    </div>
                    <Badge className={participation.is_completed ? 'bg-green-50 text-green-700' : 'bg-blue-50 text-blue-700'}>
                      {participation.is_completed ? 'Completo' : 'Em progresso'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Progresso:</span>
                      <span className="text-sm font-medium">{Math.round(participation.progress)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Sequência atual:</span>
                      <span className="text-sm font-medium">{participation.current_streak} dias</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Iniciado em:</span>
                      <span className="text-sm">{new Date(participation.started_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {participations.length === 0 && (
              <Card>
                <CardContent className="py-8 text-center">
                  <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Nenhuma participação encontrada</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        {renderModal(false)}
      </Dialog>

      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        {renderModal(true)}
      </Dialog>

      <CreateGoalModal 
        open={isCreateGoalModalOpen} 
        onOpenChange={setIsCreateGoalModalOpen}
      />
    </div>
  );
}