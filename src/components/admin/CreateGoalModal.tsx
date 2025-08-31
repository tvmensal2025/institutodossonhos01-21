import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Target } from 'lucide-react';

interface User {
  user_id: string;
  full_name?: string;
  email: string;
}

interface CreateGoalModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateGoalModal({ open, onOpenChange }: CreateGoalModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    target_value: 0,
    unit: '',
    difficulty: 'medio' as 'facil' | 'medio' | 'dificil',
    estimated_points: 10,
    user_id: ''
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Buscar usuários reais do Supabase
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('user_id, full_name, email')
          .limit(10);
        
        if (error) throw error;
        setUsers(data || []);
      } catch (error) {
        console.error('Erro ao buscar usuários:', error);
        setUsers([]);
      }
    };
    
    fetchUsers();
  }, []);

  const createGoalMutation = useMutation({
    mutationFn: async (goalData: typeof formData) => {
      console.log('Creating goal with data:', goalData);
      
      const { error } = await supabase
        .from('user_goals')
        .insert({
          title: goalData.title,
          description: goalData.description,
          target_value: goalData.target_value,
          unit: goalData.unit,
          difficulty: goalData.difficulty,
          estimated_points: goalData.estimated_points,
          user_id: goalData.user_id,
          status: 'pendente',
          current_value: 0
        });

      if (error) {
        console.error('Database error:', error);
        throw error;
      }
      
      console.log('Goal created successfully');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-goals'] });
      onOpenChange(false);
      resetForm();
      toast({
        title: "Meta criada com sucesso!",
        description: "A meta foi criada e está pendente de aprovação."
      });
    },
    onError: (error: any) => {
      console.error('Mutation error:', error);
      toast({
        title: "Erro ao criar meta",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      target_value: 0,
      unit: '',
      difficulty: 'medio',
      estimated_points: 10,
      user_id: ''
    });
  };

  const handleSubmit = () => {
    console.log('Form data:', formData);
    
    if (!formData.title || !formData.user_id || !formData.target_value) {
      console.log('Validation failed:', {
        title: formData.title,
        user_id: formData.user_id,
        target_value: formData.target_value
      });
      toast({
        title: "Campos obrigatórios",
        description: "Preencha título, usuário e valor da meta.",
        variant: "destructive"
      });
      return;
    }

    console.log('Submitting goal:', formData);
    createGoalMutation.mutate(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
  <DialogContent className="max-w-lg" aria-describedby="admin-create-goal-description">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Nova Meta
          </DialogTitle>
          <p id="admin-create-goal-description" className="sr-only">
            Painel administrativo para criar metas para usuários específicos
          </p>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="user">Usuário</Label>
            <Select 
              value={formData.user_id} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, user_id: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione um usuário" />
              </SelectTrigger>
              <SelectContent>
                {users?.map((user) => (
                  <SelectItem key={user.user_id} value={user.user_id}>
                    {user.full_name || user.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="title">Título da Meta</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Ex: Perder 5kg em 2 meses"
            />
          </div>

          <div>
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Descreva a meta..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="target_value">Valor da Meta</Label>
              <Input
                id="target_value"
                type="number"
                value={formData.target_value}
                onChange={(e) => setFormData(prev => ({ ...prev, target_value: Number(e.target.value) }))}
                placeholder="5"
              />
            </div>
            <div>
              <Label htmlFor="unit">Unidade</Label>
              <Input
                id="unit"
                value={formData.unit}
                onChange={(e) => setFormData(prev => ({ ...prev, unit: e.target.value }))}
                placeholder="kg, dias, vezes..."
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Dificuldade</Label>
              <Select 
                value={formData.difficulty} 
                onValueChange={(value: 'facil' | 'medio' | 'dificil') => 
                  setFormData(prev => ({ ...prev, difficulty: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="facil">Fácil</SelectItem>
                  <SelectItem value="medio">Médio</SelectItem>
                  <SelectItem value="dificil">Difícil</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="points">Pontos Estimados</Label>
              <Input
                id="points"
                type="number"
                value={formData.estimated_points}
                onChange={(e) => setFormData(prev => ({ ...prev, estimated_points: Number(e.target.value) }))}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={createGoalMutation.isPending}
            >
              {createGoalMutation.isPending ? 'Criando...' : 'Criar Meta'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}