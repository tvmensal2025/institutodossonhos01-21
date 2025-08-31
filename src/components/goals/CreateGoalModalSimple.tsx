import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface CreateGoalModalSimpleProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateGoalModalSimple({ open, onOpenChange }: CreateGoalModalSimpleProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    target_value: 1,
    unit: 'unidade',
    difficulty: 'facil',
    target_date: ''
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const { error } = await supabase.from("user_goals").insert({
        ...formData,
        user_id: user.id,
        status: "pendente",
        current_value: 0,
        estimated_points: 100,
      });

      if (error) throw error;

      toast({
        title: "Meta criada com sucesso!",
        description: "Sua meta foi enviada para aprovação administrativa.",
      });
      
      onOpenChange(false);
      setFormData({
        title: '',
        description: '',
        category: '',
        target_value: 1,
        unit: 'unidade',
        difficulty: 'facil',
        target_date: ''
      });
    } catch (error: any) {
      toast({
        title: "Erro ao criar meta",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="w-[95vw] max-w-[425px] mx-4 sm:mx-auto" aria-describedby="create-goal-simple-description">
        <DialogHeader>
          <DialogTitle>Criar Nova Meta</DialogTitle>
          <p id="create-goal-simple-description" className="sr-only">
            Formulário simplificado para criar uma nova meta
          </p>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            placeholder="Título da meta"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            required
          />
          
          <Textarea
            placeholder="Descrição da meta"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          />
          
          <Select
            value={formData.category}
            onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
            required
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione uma categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="saude">Saúde</SelectItem>
              <SelectItem value="exercicio">Exercício</SelectItem>
              <SelectItem value="alimentacao">Alimentação</SelectItem>
              <SelectItem value="bem-estar">Bem-estar</SelectItem>
            </SelectContent>
          </Select>
          
          <div className="grid grid-cols-2 gap-2">
            <Input
              type="number"
              placeholder="Valor alvo"
              value={formData.target_value}
              onChange={(e) => setFormData(prev => ({ ...prev, target_value: parseInt(e.target.value) || 1 }))}
              min="1"
            />
            <Input
              placeholder="Unidade"
              value={formData.unit}
              onChange={(e) => setFormData(prev => ({ ...prev, unit: e.target.value }))}
            />
          </div>
          
          <Select
            value={formData.difficulty}
            onValueChange={(value) => setFormData(prev => ({ ...prev, difficulty: value }))}
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
          
          <Input
            type="date"
            value={formData.target_date}
            onChange={(e) => setFormData(prev => ({ ...prev, target_date: e.target.value }))}
          />
          
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancelar
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Criando...' : 'Criar Meta'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}