import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { 
  CheckCircle, 
  X, 
  Save, 
  AlertCircle,
  Plus,
  Trash2,
  Clock,
  Target,
  HelpCircle,
  FileText
} from "lucide-react";

interface QuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (quizData: QuizFormData) => void;
  lessons: Array<{ id: string; title: string; courseId: string }>;
}

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  points: number;
}

interface QuizFormData {
  title: string;
  description: string;
  lessonId: string;
  timeLimit: number;
  minimumScore: number;
  questions: QuizQuestion[];
}

export const QuizModal = ({ isOpen, onClose, onSubmit, lessons }: QuizModalProps) => {
  const [formData, setFormData] = useState<QuizFormData>({
    title: "",
    description: "",
    lessonId: "",
    timeLimit: 30,
    minimumScore: 70,
    questions: []
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: keyof QuizFormData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ""
      }));
    }
  };

  const handleQuestionChange = (questionId: string, field: keyof QuizQuestion, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.map(question => 
        question.id === questionId 
          ? { ...question, [field]: value }
          : question
      )
    }));
  };

  const handleOptionChange = (questionId: string, optionIndex: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.map(question => 
        question.id === questionId 
          ? { 
              ...question, 
              options: question.options.map((option, index) => 
                index === optionIndex ? value : option
              )
            }
          : question
      )
    }));
  };

  const addQuestion = () => {
    const newQuestion: QuizQuestion = {
      id: Date.now().toString(),
      question: "",
      options: ["", "", "", ""],
      correctAnswer: 0,
      explanation: "",
      points: 10
    };

    setFormData(prev => ({
      ...prev,
      questions: [...prev.questions, newQuestion]
    }));
  };

  const removeQuestion = (questionId: string) => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.filter(question => question.id !== questionId)
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = "Título é obrigatório";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Descrição é obrigatória";
    }

    if (!formData.lessonId) {
      newErrors.lessonId = "Aula é obrigatória";
    }

    if (formData.timeLimit < 1) {
      newErrors.timeLimit = "Tempo limite deve ser pelo menos 1 minuto";
    }

    if (formData.minimumScore < 0 || formData.minimumScore > 100) {
      newErrors.minimumScore = "Pontuação mínima deve estar entre 0 e 100%";
    }

    // Validar questões
    formData.questions.forEach((question, index) => {
      if (!question.question.trim()) {
        newErrors[`question-${index}-question`] = `Pergunta ${index + 1} é obrigatória`;
      }
      
      question.options.forEach((option, optionIndex) => {
        if (!option.trim()) {
          newErrors[`question-${index}-option-${optionIndex}`] = `Opção ${String.fromCharCode(65 + optionIndex)} da questão ${index + 1} é obrigatória`;
        }
      });

      if (!question.explanation.trim()) {
        newErrors[`question-${index}-explanation`] = `Explicação da questão ${index + 1} é obrigatória`;
      }

      if (question.points < 1) {
        newErrors[`question-${index}-points`] = `Pontos da questão ${index + 1} deve ser pelo menos 1`;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      await onSubmit(formData);
      
      // Reset form
      setFormData({
        title: "",
        description: "",
        lessonId: "",
        timeLimit: 30,
        minimumScore: 70,
        questions: []
      });
      setErrors({});
      onClose();
    } catch (error) {
      console.error("Erro ao criar quiz:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setFormData({
        title: "",
        description: "",
        lessonId: "",
        timeLimit: 30,
        minimumScore: 70,
        questions: []
      });
      setErrors({});
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="w-[95vw] bg-gray-900 border-gray-700 text-white max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold">
            <CheckCircle className="h-6 w-6 text-purple-500" />
            CRIAR NOVO QUIZ
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informações Básicas */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-sm font-medium text-gray-300">
                📝 Título do Quiz
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                placeholder="Digite o título do quiz..."
                className="bg-gray-800 border-gray-600 text-white placeholder-gray-400"
              />
              {errors.title && (
                <div className="flex items-center gap-1 text-red-400 text-sm">
                  <AlertCircle className="h-4 w-4" />
                  {errors.title}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium text-gray-300">
                📄 Descrição
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                placeholder="Descreva o conteúdo do quiz..."
                rows={3}
                className="bg-gray-800 border-gray-600 text-white placeholder-gray-400"
              />
              {errors.description && (
                <div className="flex items-center gap-1 text-red-400 text-sm">
                  <AlertCircle className="h-4 w-4" />
                  {errors.description}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="lessonId" className="text-sm font-medium text-gray-300">
                  📚 Aula
                </Label>
                <Select value={formData.lessonId} onValueChange={(value) => handleInputChange("lessonId", value)}>
                  <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                    <SelectValue placeholder="Selecione uma aula" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-600">
                    {lessons.map((lesson) => (
                      <SelectItem key={lesson.id} value={lesson.id} className="text-white hover:bg-gray-700">
                        {lesson.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.lessonId && (
                  <div className="flex items-center gap-1 text-red-400 text-sm">
                    <AlertCircle className="h-4 w-4" />
                    {errors.lessonId}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="timeLimit" className="text-sm font-medium text-gray-300">
                  ⏱️ Tempo Limite (minutos)
                </Label>
                <Input
                  id="timeLimit"
                  type="number"
                  value={formData.timeLimit}
                  onChange={(e) => handleInputChange("timeLimit", parseInt(e.target.value) || 0)}
                  placeholder="30"
                  min="1"
                  className="bg-gray-800 border-gray-600 text-white"
                />
                {errors.timeLimit && (
                  <div className="flex items-center gap-1 text-red-400 text-sm">
                    <AlertCircle className="h-4 w-4" />
                    {errors.timeLimit}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="minimumScore" className="text-sm font-medium text-gray-300">
                  🎯 Pontuação Mínima (%)
                </Label>
                <Input
                  id="minimumScore"
                  type="number"
                  value={formData.minimumScore}
                  onChange={(e) => handleInputChange("minimumScore", parseInt(e.target.value) || 0)}
                  placeholder="70"
                  min="0"
                  max="100"
                  className="bg-gray-800 border-gray-600 text-white"
                />
                {errors.minimumScore && (
                  <div className="flex items-center gap-1 text-red-400 text-sm">
                    <AlertCircle className="h-4 w-4" />
                    {errors.minimumScore}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Questões */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium text-gray-300">
                📋 QUESTÕES
              </Label>
              <Button 
                onClick={addQuestion} 
                size="sm" 
                className="bg-purple-500 hover:bg-purple-600"
              >
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Questão
              </Button>
            </div>

            {formData.questions.length === 0 && (
              <div className="text-center py-8 text-gray-400 border-2 border-dashed border-gray-600 rounded-lg">
                <HelpCircle className="h-12 w-12 mx-auto mb-2 text-gray-500" />
                <p>Nenhuma questão adicionada ainda</p>
                <p className="text-sm">Clique em "Adicionar Questão" para começar</p>
              </div>
            )}

            {formData.questions.map((question, index) => (
              <div key={question.id} className="border border-gray-600 rounded-lg p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-gray-300">
                    ❓ Pergunta {index + 1}
                  </h4>
                  <Button
                    onClick={() => removeQuestion(question.id)}
                    variant="outline"
                    size="sm"
                    className="border-red-600 text-red-400 hover:bg-red-600 hover:text-white"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-4">
                  {/* Pergunta */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-300">
                      Pergunta
                    </Label>
                    <Textarea
                      value={question.question}
                      onChange={(e) => handleQuestionChange(question.id, "question", e.target.value)}
                      placeholder="Digite a pergunta..."
                      rows={2}
                      className="bg-gray-800 border-gray-600 text-white placeholder-gray-400"
                    />
                    {errors[`question-${index}-question`] && (
                      <div className="flex items-center gap-1 text-red-400 text-sm">
                        <AlertCircle className="h-4 w-4" />
                        {errors[`question-${index}-question`]}
                      </div>
                    )}
                  </div>

                  {/* Opções */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium text-gray-300">
                      Opções
                    </Label>
                    {question.options.map((option, optionIndex) => (
                      <div key={optionIndex} className="flex items-center gap-3">
                        <div className="flex items-center space-x-2">
                          <RadioGroup
                            value={question.correctAnswer.toString()}
                            onValueChange={(value) => handleQuestionChange(question.id, "correctAnswer", parseInt(value))}
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value={optionIndex.toString()} id={`correct-${question.id}-${optionIndex}`} />
                              <Label htmlFor={`correct-${question.id}-${optionIndex}`} className="text-sm text-gray-300">
                                {String.fromCharCode(65 + optionIndex)}
                              </Label>
                            </div>
                          </RadioGroup>
                        </div>
                        <Input
                          value={option}
                          onChange={(e) => handleOptionChange(question.id, optionIndex, e.target.value)}
                          placeholder={`Opção ${String.fromCharCode(65 + optionIndex)}`}
                          className="bg-gray-800 border-gray-600 text-white placeholder-gray-400 flex-1"
                        />
                        {errors[`question-${index}-option-${optionIndex}`] && (
                          <div className="flex items-center gap-1 text-red-400 text-sm">
                            <AlertCircle className="h-4 w-4" />
                            {errors[`question-${index}-option-${optionIndex}`]}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Explicação */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-300">
                      📝 Explicação
                    </Label>
                    <Textarea
                      value={question.explanation}
                      onChange={(e) => handleQuestionChange(question.id, "explanation", e.target.value)}
                      placeholder="Explique por que esta é a resposta correta..."
                      rows={2}
                      className="bg-gray-800 border-gray-600 text-white placeholder-gray-400"
                    />
                    {errors[`question-${index}-explanation`] && (
                      <div className="flex items-center gap-1 text-red-400 text-sm">
                        <AlertCircle className="h-4 w-4" />
                        {errors[`question-${index}-explanation`]}
                      </div>
                    )}
                  </div>

                  {/* Pontos */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-300">
                      🎯 Pontos
                    </Label>
                    <Input
                      type="number"
                      value={question.points}
                      onChange={(e) => handleQuestionChange(question.id, "points", parseInt(e.target.value) || 0)}
                      placeholder="10"
                      min="1"
                      className="bg-gray-800 border-gray-600 text-white w-24"
                    />
                    {errors[`question-${index}-points`] && (
                      <div className="flex items-center gap-1 text-red-400 text-sm">
                        <AlertCircle className="h-4 w-4" />
                        {errors[`question-${index}-points`]}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <DialogFooter className="flex gap-3">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isLoading}
            className="border-gray-600 text-white hover:bg-gray-800"
          >
            <X className="h-4 w-4 mr-2" />
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isLoading}
            className="bg-purple-500 hover:bg-purple-600"
          >
            <Save className="h-4 w-4 mr-2" />
            {isLoading ? "Salvando..." : "💾 Salvar Quiz"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}; 