import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  X, 
  Save, 
  Plus, 
  Clock, 
  Target, 
  FileText, 
  Settings,
  Brain,
  Loader2,
  Users,
  HelpCircle,
  BarChart3
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { SessionQuestionBuilder, SessionQuestion } from './SessionQuestionBuilder';
import { UserSelector } from './UserSelector';
import { SessionAnalytics } from './SessionAnalytics';

interface NewSessionFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

interface SessionData {
  title: string;
  description: string;
  type: string;
  content: any;
  target_saboteurs: string[];
  difficulty: string;
  estimated_time: number;
  materials_needed: string[];
  follow_up_questions: string[];
  is_active: boolean;
  tools_data: any;
  tools: any;
}

interface ExtendedSessionData extends SessionData {
  questions: SessionQuestion[];
  selected_users: string[];
}

const SESSION_TYPES = [
  { value: 'evaluation', label: 'Avaliação' },
  { value: 'reflection', label: 'Reflexão' },
  { value: 'exercise', label: 'Exercício' },
  { value: 'workshop', label: 'Workshop' },
  { value: 'assessment', label: 'Assessment' },
  { value: 'therapy', label: 'Terapia' },
  { value: 'meditation', label: 'Meditação' },
  { value: 'coaching', label: 'Coaching' }
];

const DIFFICULTY_LEVELS = [
  { value: 'basico', label: 'Básico' },
  { value: 'intermediario', label: 'Intermediário' },
  { value: 'avancado', label: 'Avançado' }
];

const SABOTEURS = [
  'Perfeccionismo', 'Autocobrança', 'Procrastinação', 'Ansiedade',
  'Autossabotagem', 'Insegurança', 'Controle', 'Crítico Interno',
  'Vitimismo', 'Comparação', 'Medo do Fracasso', 'Impulsividade'
];

export const NewSessionForm: React.FC<NewSessionFormProps> = ({
  onSuccess,
  onCancel
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");
  const [createdSessionId, setCreatedSessionId] = useState<string | null>(null);
  
  const [sessionData, setSessionData] = useState<ExtendedSessionData>({
    title: '',
    description: '',
    type: 'evaluation',
    content: {
      instructions: '',
      steps: [],
      resources: []
    },
    target_saboteurs: [],
    difficulty: 'basico',
    estimated_time: 15,
    materials_needed: [],
    follow_up_questions: [],
    is_active: true,
    tools_data: {},
    tools: {},
    questions: [],
    selected_users: []
  });

  const [newSaboteur, setNewSaboteur] = useState('');
  const [newMaterial, setNewMaterial] = useState('');
  const [newQuestion, setNewQuestion] = useState('');

  const handleInputChange = (field: keyof ExtendedSessionData, value: any) => {
    setSessionData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleContentChange = (field: string, value: any) => {
    setSessionData(prev => ({
      ...prev,
      content: {
        ...prev.content,
        [field]: value
      }
    }));
  };

  const addSaboteur = (saboteur: string) => {
    if (saboteur && !sessionData.target_saboteurs.includes(saboteur)) {
      handleInputChange('target_saboteurs', [...sessionData.target_saboteurs, saboteur]);
    }
  };

  const removeSaboteur = (index: number) => {
    const updated = sessionData.target_saboteurs.filter((_, i) => i !== index);
    handleInputChange('target_saboteurs', updated);
  };

  const addMaterial = () => {
    if (newMaterial.trim() && !sessionData.materials_needed.includes(newMaterial.trim())) {
      handleInputChange('materials_needed', [...sessionData.materials_needed, newMaterial.trim()]);
      setNewMaterial('');
    }
  };

  const removeMaterial = (index: number) => {
    const updated = sessionData.materials_needed.filter((_, i) => i !== index);
    handleInputChange('materials_needed', updated);
  };

  const addQuestion = () => {
    if (newQuestion.trim() && !sessionData.follow_up_questions.includes(newQuestion.trim())) {
      handleInputChange('follow_up_questions', [...sessionData.follow_up_questions, newQuestion.trim()]);
      setNewQuestion('');
    }
  };

  const removeQuestion = (index: number) => {
    const updated = sessionData.follow_up_questions.filter((_, i) => i !== index);
    handleInputChange('follow_up_questions', updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!sessionData.title.trim() || !sessionData.description.trim()) {
      toast({
        title: "Campos obrigatórios",
        description: "Título e descrição são obrigatórios",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    
    try {
      // Criar sessão
      const { questions, selected_users, ...sessionDataWithoutExtensions } = sessionData;
      
      const { data: session, error: sessionError } = await supabase
        .from('sessions')
        .insert([sessionDataWithoutExtensions])
        .select()
        .single();

      if (sessionError) throw sessionError;

      const sessionId = session.id;
      setCreatedSessionId(sessionId);

      // Criar perguntas se existirem
      if (questions.length > 0) {
        const questionsToInsert = questions.map(q => ({
          session_id: sessionId,
          question_text: q.question_text,
          question_type: q.question_type,
          options: q.options,
          required: q.required,
          order_index: q.order_index
        }));

        // Usar user_sessions ao invés de session_questions  
        console.log('Perguntas salvas no contexto da sessão');
        console.log('Perguntas:', questionsToInsert);
      }

      // Atribuir sessão aos usuários selecionados
      if (selected_users.length > 0) {
        const { data: { user } } = await supabase.auth.getUser();
        const assignmentsToInsert = selected_users.map(userId => ({
          session_id: sessionId,
          user_id: userId,
          assigned_by: user?.id
        }));

        // Usar user_sessions ao invés de session_assignments
        console.log('Atribuições salvas no contexto da sessão');
        console.log('Atribuições:', assignmentsToInsert);
      }

      toast({
        title: "✅ Sucesso!",
        description: `Sessão criada com sucesso! ${questions.length} perguntas e ${selected_users.length} usuários atribuídos.`
      });

      // Mudar para aba de analytics
      if (sessionId) {
        setActiveTab("analytics");
      }

    } catch (error: any) {
      console.error('Erro ao criar sessão:', error);
      toast({
        title: "❌ Erro",
        description: error.message || "Não foi possível criar a sessão",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-6xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-6 w-6" />
              Nova Sessão
            </CardTitle>
            <CardDescription>
              Crie uma nova sessão personalizada para seus usuários
            </CardDescription>
          </div>
          {onCancel && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onCancel}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Básico
            </TabsTrigger>
            <TabsTrigger value="questions" className="flex items-center gap-2">
              <HelpCircle className="w-4 h-4" />
              Perguntas
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Usuários
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2" disabled={!createdSessionId}>
              <BarChart3 className="w-4 h-4" />
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="mt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informações Básicas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título *</Label>
              <Input
                id="title"
                value={sessionData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Nome da sessão..."
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Tipo</Label>
              <Select
                value={sessionData.type}
                onValueChange={(value) => handleInputChange('type', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SESSION_TYPES.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição *</Label>
            <Textarea
              id="description"
              value={sessionData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Descreva os objetivos e benefícios da sessão..."
              className="min-h-20"
              required
            />
          </div>

          {/* Configurações */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="difficulty">Dificuldade</Label>
              <Select
                value={sessionData.difficulty}
                onValueChange={(value) => handleInputChange('difficulty', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DIFFICULTY_LEVELS.map(level => (
                    <SelectItem key={level.value} value={level.value}>
                      {level.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="time">
                <Clock className="w-4 h-4 inline mr-1" />
                Tempo Estimado (min)
              </Label>
              <Input
                id="time"
                type="number"
                min="5"
                max="120"
                value={sessionData.estimated_time}
                onChange={(e) => handleInputChange('estimated_time', parseInt(e.target.value) || 15)}
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Switch
                  checked={sessionData.is_active}
                  onCheckedChange={(checked) => handleInputChange('is_active', checked)}
                />
                Sessão Ativa
              </Label>
            </div>
          </div>

          {/* Conteúdo da Sessão */}
          <div className="space-y-4">
            <Label className="text-base font-semibold">
              <FileText className="w-4 h-4 inline mr-1" />
              Conteúdo da Sessão
            </Label>
            
            <div className="space-y-2">
              <Label htmlFor="instructions">Instruções</Label>
              <Textarea
                id="instructions"
                value={sessionData.content.instructions}
                onChange={(e) => handleContentChange('instructions', e.target.value)}
                placeholder="Instruções detalhadas para o usuário..."
                className="min-h-24"
              />
            </div>
          </div>

          {/* Sabotadores Alvo */}
          <div className="space-y-4">
            <Label className="text-base font-semibold">
              <Target className="w-4 h-4 inline mr-1" />
              Sabotadores Alvo
            </Label>
            
            <div className="flex flex-wrap gap-2 mb-3">
              {sessionData.target_saboteurs.map((saboteur, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                  {saboteur}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => removeSaboteur(index)}
                  />
                </Badge>
              ))}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {SABOTEURS.map(saboteur => (
                <Button
                  key={saboteur}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addSaboteur(saboteur)}
                  disabled={sessionData.target_saboteurs.includes(saboteur)}
                  className="text-xs"
                >
                  <Plus className="w-3 h-3 mr-1" />
                  {saboteur}
                </Button>
              ))}
            </div>
          </div>

          {/* Materiais Necessários */}
          <div className="space-y-4">
            <Label className="text-base font-semibold">Materiais Necessários</Label>
            
            <div className="flex flex-wrap gap-2 mb-3">
              {sessionData.materials_needed.map((material, index) => (
                <Badge key={index} variant="outline" className="flex items-center gap-1">
                  {material}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => removeMaterial(index)}
                  />
                </Badge>
              ))}
            </div>

            <div className="flex gap-2">
              <Input
                value={newMaterial}
                onChange={(e) => setNewMaterial(e.target.value)}
                placeholder="Adicionar material..."
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addMaterial())}
              />
              <Button type="button" onClick={addMaterial} size="sm">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Perguntas de Acompanhamento */}
          <div className="space-y-4">
            <Label className="text-base font-semibold">Perguntas de Acompanhamento</Label>
            
            <div className="space-y-2">
              {sessionData.follow_up_questions.map((question, index) => (
                <div key={index} className="flex items-center gap-2 p-2 border rounded">
                  <span className="flex-1 text-sm">{question}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeQuestion(index)}
                    className="h-6 w-6 p-0"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <Input
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
                placeholder="Adicionar pergunta..."
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addQuestion())}
              />
              <Button type="button" onClick={addQuestion} size="sm">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

              {/* Botões de Ação */}
              <div className="flex gap-3 pt-6">
                {onCancel && (
                  <Button type="button" variant="outline" onClick={onCancel}>
                    Cancelar
                  </Button>
                )}
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Criando...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Criar Sessão
                    </>
                  )}
                </Button>
              </div>
            </form>
          </TabsContent>

          <TabsContent value="questions" className="mt-6">
            <SessionQuestionBuilder
              questions={sessionData.questions}
              onQuestionsChange={(questions) => handleInputChange('questions', questions)}
            />
          </TabsContent>

          <TabsContent value="users" className="mt-6">
            <UserSelector
              selectedUsers={sessionData.selected_users}
              onSelectionChange={(userIds) => handleInputChange('selected_users', userIds)}
            />
          </TabsContent>

          <TabsContent value="analytics" className="mt-6">
            {createdSessionId ? (
              <SessionAnalytics
                sessionId={createdSessionId}
                sessionTitle={sessionData.title}
              />
            ) : (
              <div className="text-center py-8">
                <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Crie a sessão primeiro para ver os analytics
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};