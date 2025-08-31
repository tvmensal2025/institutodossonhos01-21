// @ts-nocheck
import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, Target } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Switch } from "@/components/ui/switch";
import { VisualEffectsManager } from "@/components/gamification/VisualEffectsManager";
import { useCelebrationEffects } from "@/hooks/useCelebrationEffects";

interface CreateGoalModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CreateGoalModal = ({ open, onOpenChange }: CreateGoalModalProps) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category_id: "",
    challenge_id: "",
    target_value: "",
    unit: "",
    difficulty: "medio",
    target_date: "",
    is_group_goal: false,
    evidence_required: true,
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { activeCelebration, celebrateGoalCompletion } = useCelebrationEffects();

  // Categorias fixas já que não há tabela goal_categories
  const categories = [
    { id: 'peso', name: 'Peso', icon: '⚖️' },
    { id: 'exercicio', name: 'Exercício', icon: '🏃' },
    { id: 'alimentacao', name: 'Alimentação', icon: '🥗' },
    { id: 'habitos', name: 'Hábitos', icon: '📝' },
    { id: 'sono', name: 'Sono', icon: '😴' },
    { id: 'agua', name: 'Hidratação', icon: '💧' }
  ];

  // Buscar desafios ativos
  const { data: challenges } = useQuery({
    queryKey: ["active-challenges"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("challenges")
        .select("id, title, description, category")
        .eq("is_active", true)
        .order("title");

      if (error) throw error;
      return data;
    },
  });

  // Calcular pontos estimados
  const calculateEstimatedPoints = () => {
    const selectedCategory = categories?.find(c => c.id === formData.category_id);
    if (!selectedCategory) return 0;

    const basePoints = 10; // Fixed base points since the field doesn't exist in database  
    const multiplier = formData.difficulty === 'facil' ? 1 : formData.difficulty === 'medio' ? 1.5 : 2;
    
    return Math.round(basePoints * multiplier);
  };

  // Criar meta
  const createGoalMutation = useMutation({
    mutationFn: async (goalData: any) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const { error } = await supabase.from("user_goals").insert({
        ...goalData,
        user_id: user.id,
        estimated_points: calculateEstimatedPoints(),
        status: "pendente",
        current_value: 0,
        evidence_required: goalData.evidence_required || true,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Meta criada com sucesso!",
        description: "Sua meta foi enviada para aprovação administrativa.",
      });
      
      // Trigger celebration effect
      celebrateGoalCompletion();
      
      queryClient.invalidateQueries({ queryKey: ["user-goals"] });
      onOpenChange(false);
      resetForm();
    },
    onError: (error) => {
      toast({
        title: "Erro ao criar meta",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      category_id: "",
      challenge_id: "",
      target_value: "",
      unit: "",
      difficulty: "medio",
      target_date: "",
      is_group_goal: false,
      evidence_required: true,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.category_id) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha título e categoria.",
        variant: "destructive",
      });
      return;
    }

    createGoalMutation.mutate({
      ...formData,
      target_value: formData.target_value ? parseFloat(formData.target_value) : null,
      target_date: formData.target_date || null,
      challenge_id: formData.challenge_id || null,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
  <DialogContent className="w-[95vw] max-w-2xl max-h-[95vh] overflow-y-auto p-4 sm:p-6" aria-describedby="create-goal-description">
        <DialogHeader className="mb-4 sm:mb-6">
          <DialogTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <Target className="h-6 w-6 sm:h-7 sm:w-7" />
            Criar Nova Meta
          </DialogTitle>
          <p id="create-goal-description" className="sr-only">
            Formulário para criar uma nova meta pessoal com categorias, valores alvo e dificuldade
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
          {/* Título */}
          <div className="space-y-3">
            <Label htmlFor="title" className="text-base sm:text-lg font-semibold">Título da Meta *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Ex: Perder 5kg em 3 meses"
              className="h-12 sm:h-14 text-base sm:text-lg"
            />
          </div>

          {/* Descrição */}
          <div className="space-y-3">
            <Label htmlFor="description" className="text-base sm:text-lg font-semibold">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Descreva detalhes da sua meta..."
              rows={4}
              className="text-base sm:text-lg min-h-[120px] sm:min-h-[140px]"
            />
          </div>

          {/* Categoria */}
          <div className="space-y-3">
            <Label className="text-base sm:text-lg font-semibold">Categoria *</Label>
            <Select value={formData.category_id} onValueChange={(value) => setFormData({ ...formData, category_id: value })}>
              <SelectTrigger className="h-12 sm:h-14 text-base sm:text-lg">
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent>
                {categories?.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    <div className="flex items-center gap-2">
                      <span>{category.icon}</span>
                      <span>{category.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Desafio (opcional) */}
          <div className="space-y-3">
            <Label className="text-base sm:text-lg font-semibold">Vincular a Desafio (opcional)</Label>
            <Select value={formData.challenge_id} onValueChange={(value) => setFormData({ ...formData, challenge_id: value })}>
              <SelectTrigger className="h-12 sm:h-14 text-base sm:text-lg">
                <SelectValue placeholder="Selecione um desafio" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Nenhum desafio</SelectItem>
                {challenges?.map((challenge) => (
                  <SelectItem key={challenge.id} value={challenge.id}>
                    {challenge.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Valor alvo e unidade */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-3">
              <Label htmlFor="target_value" className="text-base sm:text-lg font-semibold">Valor Alvo</Label>
              <Input
                id="target_value"
                type="number"
                step="0.1"
                value={formData.target_value}
                onChange={(e) => setFormData({ ...formData, target_value: e.target.value })}
                placeholder="Ex: 5"
                className="h-12 sm:h-14 text-base sm:text-lg"
              />
            </div>
            <div className="space-y-3">
              <Label htmlFor="unit" className="text-base sm:text-lg font-semibold">Unidade</Label>
              <Input
                id="unit"
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                placeholder="Ex: kg, dias, vezes"
                className="h-12 sm:h-14 text-base sm:text-lg"
              />
            </div>
          </div>

          {/* Dificuldade */}
          <div className="space-y-3">
            <Label className="text-base sm:text-lg font-semibold">Dificuldade</Label>
            <Select value={formData.difficulty} onValueChange={(value) => setFormData({ ...formData, difficulty: value })}>
              <SelectTrigger className="h-12 sm:h-14 text-base sm:text-lg">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="facil">Fácil</SelectItem>
                <SelectItem value="medio">Médio</SelectItem>
                <SelectItem value="dificil">Difícil</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Data alvo */}
          <div className="space-y-3">
            <Label htmlFor="target_date" className="text-base sm:text-lg font-semibold">Data Alvo</Label>
            <Input
              id="target_date"
              type="date"
              value={formData.target_date}
              onChange={(e) => setFormData({ ...formData, target_date: e.target.value })}
              className="h-12 sm:h-14 text-base sm:text-lg"
            />
          </div>

          {/* Meta em Grupo */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-2">
              <Label className="text-base sm:text-lg font-semibold">Meta em Grupo</Label>
              <p className="text-sm sm:text-base text-muted-foreground">
                Permite que outros usuários participem desta meta
              </p>
            </div>
            <Switch
              checked={formData.is_group_goal}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_group_goal: checked }))}
              className="scale-125 sm:scale-150"
            />
          </div>

          {/* Evidências Obrigatórias */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-2">
              <Label className="text-base sm:text-lg font-semibold">Evidências Obrigatórias</Label>
              <p className="text-sm sm:text-base text-muted-foreground">
                Exige envio de fotos ou documentos para comprovar progresso
              </p>
            </div>
            <Switch
              checked={formData.evidence_required}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, evidence_required: checked }))}
              className="scale-125 sm:scale-150"
            />
          </div>

          {/* Pontos estimados */}
          {formData.category_id && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <span className="text-base sm:text-lg font-semibold">Pontos estimados:</span>
                  <Badge variant="secondary" className="text-lg sm:text-xl px-4 py-2">
                    {calculateEstimatedPoints()} pts
                  </Badge>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Botões */}
          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="h-12 sm:h-14 text-base sm:text-lg"
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={createGoalMutation.isPending}
              className="h-12 sm:h-14 text-base sm:text-lg"
            >
              {createGoalMutation.isPending ? "Criando..." : "Criar Meta"}
            </Button>
          </div>
        </form>
      </DialogContent>
      
      {/* Visual Effects */}
      {activeCelebration && (
        <VisualEffectsManager
          trigger={true}
          effectType="celebration"
          duration={3000}
        />
      )}
    </Dialog>
  );
};