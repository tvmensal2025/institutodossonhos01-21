import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { 
  X, 
  Plus, 
  GripVertical,
  Settings,
  HelpCircle,
  Check,
  List,
  BarChart3,
  ToggleLeft,
  Move,
  MinusCircle,
  PlusCircle,
  Percent,
  Type,
  FileText
} from 'lucide-react';

export interface SessionQuestion {
  id: string;
  question_text: string;
  question_type: 'single_choice' | 'multiple_choice' | 'numeric_scale' | 'boolean' | 'ranking' | 'numeric_range' | 'percentage' | 'short_text' | 'long_text';
  options?: any;
  required: boolean;
  order_index: number;
}

interface SessionQuestionBuilderProps {
  questions: SessionQuestion[];
  onQuestionsChange: (questions: SessionQuestion[]) => void;
}

const QUESTION_TYPES = [
  { 
    value: 'single_choice', 
    label: 'Seleção Única', 
    icon: <Check className="w-4 h-4" />,
    description: 'Radio buttons ou dropdown'
  },
  { 
    value: 'multiple_choice', 
    label: 'Múltipla Seleção', 
    icon: <List className="w-4 h-4" />,
    description: 'Checkboxes'
  },
  { 
    value: 'numeric_scale', 
    label: 'Escala Numérica', 
    icon: <BarChart3 className="w-4 h-4" />,
    description: 'Slider 0-10'
  },
  { 
    value: 'boolean', 
    label: 'Sim/Não', 
    icon: <ToggleLeft className="w-4 h-4" />,
    description: 'Toggle switch'
  },
  { 
    value: 'ranking', 
    label: 'Ranking', 
    icon: <Move className="w-4 h-4" />,
    description: 'Arrastar para priorizar'
  },
  { 
    value: 'numeric_range', 
    label: 'Intervalo Numérico', 
    icon: <MinusCircle className="w-4 h-4" />,
    description: 'Range slider min-max'
  },
  { 
    value: 'percentage', 
    label: 'Percentual', 
    icon: <Percent className="w-4 h-4" />,
    description: 'Slider 0-100%'
  },
  { 
    value: 'short_text', 
    label: 'Texto Curto', 
    icon: <Type className="w-4 h-4" />,
    description: 'Campo de texto simples'
  },
  { 
    value: 'long_text', 
    label: 'Texto Longo', 
    icon: <FileText className="w-4 h-4" />,
    description: 'Textarea para respostas longas'
  }
];

export const SessionQuestionBuilder: React.FC<SessionQuestionBuilderProps> = ({
  questions,
  onQuestionsChange
}) => {
  const [newQuestion, setNewQuestion] = useState<Partial<SessionQuestion>>({
    question_text: '',
    question_type: 'single_choice',
    required: true,
    options: {}
  });

  const generateId = () => `q_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  const addQuestion = () => {
    if (!newQuestion.question_text?.trim()) return;

    const question: SessionQuestion = {
      id: generateId(),
      question_text: newQuestion.question_text,
      question_type: newQuestion.question_type!,
      required: newQuestion.required!,
      order_index: questions.length,
      options: getDefaultOptions(newQuestion.question_type!)
    };

    onQuestionsChange([...questions, question]);
    setNewQuestion({
      question_text: '',
      question_type: 'single_choice',
      required: true,
      options: {}
    });
  };

  const getDefaultOptions = (type: string) => {
    switch (type) {
      case 'single_choice':
      case 'multiple_choice':
        return { choices: ['Opção 1', 'Opção 2'] };
      case 'ranking':
        return { items: ['Item 1', 'Item 2', 'Item 3'] };
      case 'numeric_scale':
        return { min: 0, max: 10, step: 1 };
      case 'numeric_range':
        return { min: 0, max: 100, step: 1 };
      case 'percentage':
        return { min: 0, max: 100, step: 5 };
      case 'short_text':
        return { max_length: 100 };
      case 'long_text':
        return { max_length: 1000 };
      default:
        return {};
    }
  };

  const updateQuestion = (id: string, updates: Partial<SessionQuestion>) => {
    const updated = questions.map(q => 
      q.id === id ? { ...q, ...updates } : q
    );
    onQuestionsChange(updated);
  };

  const removeQuestion = (id: string) => {
    const filtered = questions.filter(q => q.id !== id);
    const reordered = filtered.map((q, index) => ({ ...q, order_index: index }));
    onQuestionsChange(reordered);
  };

  const moveQuestion = (id: string, direction: 'up' | 'down') => {
    const index = questions.findIndex(q => q.id === id);
    if (
      (direction === 'up' && index <= 0) ||
      (direction === 'down' && index >= questions.length - 1)
    ) return;

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    const reordered = [...questions];
    [reordered[index], reordered[newIndex]] = [reordered[newIndex], reordered[index]];
    
    const updated = reordered.map((q, i) => ({ ...q, order_index: i }));
    onQuestionsChange(updated);
  };

  const updateQuestionOptions = (id: string, options: any) => {
    updateQuestion(id, { options });
  };

  const renderOptionsEditor = (question: SessionQuestion) => {
    const { question_type, options } = question;

    switch (question_type) {
      case 'single_choice':
      case 'multiple_choice':
        return (
          <div className="space-y-2">
            <Label className="text-sm font-medium">Opções</Label>
            {options?.choices?.map((choice: string, index: number) => (
              <div key={index} className="flex gap-2">
                <Input
                  value={choice}
                  onChange={(e) => {
                    const newChoices = [...(options.choices || [])];
                    newChoices[index] = e.target.value;
                    updateQuestionOptions(question.id, { choices: newChoices });
                  }}
                  placeholder={`Opção ${index + 1}`}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const newChoices = options.choices.filter((_: any, i: number) => i !== index);
                    updateQuestionOptions(question.id, { choices: newChoices });
                  }}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                const newChoices = [...(options.choices || []), `Opção ${(options.choices?.length || 0) + 1}`];
                updateQuestionOptions(question.id, { choices: newChoices });
              }}
            >
              <Plus className="w-4 h-4 mr-1" />
              Adicionar Opção
            </Button>
          </div>
        );

      case 'ranking':
        return (
          <div className="space-y-2">
            <Label className="text-sm font-medium">Itens para Ranking</Label>
            {options?.items?.map((item: string, index: number) => (
              <div key={index} className="flex gap-2">
                <GripVertical className="w-4 h-4 mt-2 text-muted-foreground" />
                <Input
                  value={item}
                  onChange={(e) => {
                    const newItems = [...(options.items || [])];
                    newItems[index] = e.target.value;
                    updateQuestionOptions(question.id, { items: newItems });
                  }}
                  placeholder={`Item ${index + 1}`}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const newItems = options.items.filter((_: any, i: number) => i !== index);
                    updateQuestionOptions(question.id, { items: newItems });
                  }}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                const newItems = [...(options.items || []), `Item ${(options.items?.length || 0) + 1}`];
                updateQuestionOptions(question.id, { items: newItems });
              }}
            >
              <Plus className="w-4 h-4 mr-1" />
              Adicionar Item
            </Button>
          </div>
        );

      case 'numeric_scale':
      case 'numeric_range':
      case 'percentage':
        return (
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label className="text-sm">Mínimo</Label>
              <Input
                type="number"
                value={options?.min || 0}
                onChange={(e) => {
                  updateQuestionOptions(question.id, { 
                    ...options, 
                    min: parseInt(e.target.value) || 0 
                  });
                }}
              />
            </div>
            <div>
              <Label className="text-sm">Máximo</Label>
              <Input
                type="number"
                value={options?.max || 10}
                onChange={(e) => {
                  updateQuestionOptions(question.id, { 
                    ...options, 
                    max: parseInt(e.target.value) || 10 
                  });
                }}
              />
            </div>
            <div>
              <Label className="text-sm">Passo</Label>
              <Input
                type="number"
                value={options?.step || 1}
                onChange={(e) => {
                  updateQuestionOptions(question.id, { 
                    ...options, 
                    step: parseInt(e.target.value) || 1 
                  });
                }}
              />
            </div>
          </div>
        );

      case 'short_text':
      case 'long_text':
        return (
          <div>
            <Label className="text-sm">Limite de Caracteres</Label>
            <Input
              type="number"
              value={options?.max_length || (question_type === 'short_text' ? 100 : 1000)}
              onChange={(e) => {
                updateQuestionOptions(question.id, { 
                  max_length: parseInt(e.target.value) || 100 
                });
              }}
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Perguntas da Sessão</h3>
          <p className="text-sm text-muted-foreground">
            Configure as perguntas que os usuários responderão
          </p>
        </div>
        <Badge variant="secondary">
          {questions.length} pergunta{questions.length !== 1 ? 's' : ''}
        </Badge>
      </div>

      {/* Adicionar Nova Pergunta */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Nova Pergunta
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="question-text">Texto da Pergunta *</Label>
            <Textarea
              id="question-text"
              value={newQuestion.question_text || ''}
              onChange={(e) => setNewQuestion(prev => ({ ...prev, question_text: e.target.value }))}
              placeholder="Digite sua pergunta aqui..."
              className="min-h-20"
            />
          </div>

          <div>
            <Label>Tipo de Pergunta</Label>
            <Select
              value={newQuestion.question_type}
              onValueChange={(value) => setNewQuestion(prev => ({ ...prev, question_type: value as any }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {QUESTION_TYPES.map(type => (
                  <SelectItem key={type.value} value={type.value}>
                    <div className="flex items-center gap-2">
                      {type.icon}
                      <div>
                        <div className="font-medium">{type.label}</div>
                        <div className="text-xs text-muted-foreground">{type.description}</div>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <Switch
              checked={newQuestion.required}
              onCheckedChange={(checked) => setNewQuestion(prev => ({ ...prev, required: checked }))}
            />
            <Label>Pergunta obrigatória</Label>
          </div>

          <Button type="button" onClick={addQuestion} className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Pergunta
          </Button>
        </CardContent>
      </Card>

      {/* Lista de Perguntas */}
      {questions.length > 0 && (
        <div className="space-y-4">
          <h4 className="font-medium">Perguntas Configuradas</h4>
          {questions
            .sort((a, b) => a.order_index - b.order_index)
            .map((question, index) => (
              <Card key={question.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline">#{index + 1}</Badge>
                        <Badge variant="secondary">
                          {QUESTION_TYPES.find(t => t.value === question.question_type)?.label}
                        </Badge>
                        {question.required && (
                          <Badge variant="destructive" className="text-xs">Obrigatória</Badge>
                        )}
                      </div>
                      <Input
                        value={question.question_text}
                        onChange={(e) => updateQuestion(question.id, { question_text: e.target.value })}
                        className="font-medium"
                      />
                    </div>
                    <div className="flex items-center gap-1 ml-4">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => moveQuestion(question.id, 'up')}
                        disabled={index === 0}
                      >
                        ↑
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => moveQuestion(question.id, 'down')}
                        disabled={index === questions.length - 1}
                      >
                        ↓
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeQuestion(question.id)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {renderOptionsEditor(question)}
                    
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={question.required}
                        onCheckedChange={(checked) => updateQuestion(question.id, { required: checked })}
                      />
                      <Label>Pergunta obrigatória</Label>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>
      )}
    </div>
  );
};