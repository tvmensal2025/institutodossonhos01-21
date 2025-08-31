import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { 
  Award, 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  Clock, 
  Users, 
  Trophy,
  CheckCircle,
  AlertCircle,
  BarChart3
} from 'lucide-react';

interface Quiz {
  id: string;
  title: string;
  description: string;
  timeLimit: number; // em minutos
  passingScore: number; // porcentagem
  maxAttempts: number;
  hasCertificate: boolean;
  questions: Question[];
}

interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

interface QuizSystemProps {
  courseId: string;
  lessonId?: string;
}

export const QuizSystem = ({ courseId, lessonId }: QuizSystemProps) => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([
    {
      id: '1',
      title: 'Avaliação Final - 7 Chaves',
      description: 'Quiz final para testar o conhecimento sobre as 7 chaves',
      timeLimit: 30,
      passingScore: 70,
      maxAttempts: 3,
      hasCertificate: true,
      questions: [
        {
          id: '1',
          question: 'Qual é a primeira chave?',
          options: ['Paciência', 'Imaginação', 'Adaptação', 'Hábito'],
          correctAnswer: 0,
          explanation: 'A PACIÊNCIA é a primeira chave fundamental para o desenvolvimento pessoal.'
        },
        {
          id: '2',
          question: 'Como aplicar a imaginação no dia a dia?',
          options: ['Sonhando acordado', 'Visualizando objetivos', 'Lendo livros', 'Assistindo filmes'],
          correctAnswer: 1,
          explanation: 'Visualizar objetivos é a forma mais eficaz de aplicar a imaginação.'
        },
        {
          id: '3',
          question: 'Qual a importância da adaptação?',
          options: ['Seguir rotinas', 'Resistir mudanças', 'Aceitar mudanças', 'Evitar desafios'],
          correctAnswer: 2,
          explanation: 'Aceitar mudanças é essencial para a adaptação e crescimento.'
        }
      ]
    }
  ]);

  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newQuiz, setNewQuiz] = useState<Partial<Quiz>>({
    title: '',
    description: '',
    timeLimit: 30,
    passingScore: 70,
    maxAttempts: 3,
    hasCertificate: false,
    questions: []
  });

  const [newQuestion, setNewQuestion] = useState<Partial<Question>>({
    question: '',
    options: ['', '', '', ''],
    correctAnswer: 0,
    explanation: ''
  });

  const handleCreateQuiz = () => {
    const quiz: Quiz = {
      id: Date.now().toString(),
      title: newQuiz.title || '',
      description: newQuiz.description || '',
      timeLimit: newQuiz.timeLimit || 30,
      passingScore: newQuiz.passingScore || 70,
      maxAttempts: newQuiz.maxAttempts || 3,
      hasCertificate: newQuiz.hasCertificate || false,
      questions: newQuiz.questions || []
    };
    
    setQuizzes([...quizzes, quiz]);
    setNewQuiz({});
    setIsCreating(false);
  };

  const handleAddQuestion = () => {
    if (newQuestion.question && newQuestion.options?.every(opt => opt.trim())) {
      const question: Question = {
        id: Date.now().toString(),
        question: newQuestion.question,
        options: newQuestion.options,
        correctAnswer: newQuestion.correctAnswer || 0,
        explanation: newQuestion.explanation
      };

      setNewQuiz({
        ...newQuiz,
        questions: [...(newQuiz.questions || []), question]
      });

      setNewQuestion({
        question: '',
        options: ['', '', '', ''],
        correctAnswer: 0,
        explanation: ''
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Sistema de Quizzes</h2>
          <p className="text-gray-400">Gerencie quizzes e certificados do curso</p>
        </div>
        <Dialog open={isCreating} onOpenChange={setIsCreating}>
          <DialogTrigger asChild>
            <Button className="bg-green-600 hover:bg-green-700">
              <Plus className="h-4 w-4 mr-2" />
              Criar Quiz
            </Button>
          </DialogTrigger>
          <DialogContent className="w-[95vw] max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Criar Novo Quiz</DialogTitle>
            </DialogHeader>
            
            <div className="grid grid-cols-2 gap-6">
              {/* Configurações do Quiz */}
              <div className="space-y-4">
                <h3 className="font-semibold">Configurações Gerais</h3>
                
                <div>
                  <Label>Título do Quiz</Label>
                  <Input 
                    placeholder="Ex: Avaliação Final - 7 Chaves"
                    value={newQuiz.title}
                    onChange={(e) => setNewQuiz({...newQuiz, title: e.target.value})}
                  />
                </div>
                
                <div>
                  <Label>Descrição</Label>
                  <Textarea 
                    placeholder="Descrição do quiz..."
                    value={newQuiz.description}
                    onChange={(e) => setNewQuiz({...newQuiz, description: e.target.value})}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Tempo Limite (min)</Label>
                    <Input 
                      type="number"
                      value={newQuiz.timeLimit}
                      onChange={(e) => setNewQuiz({...newQuiz, timeLimit: parseInt(e.target.value)})}
                    />
                  </div>
                  <div>
                    <Label>Nota Mínima (%)</Label>
                    <Input 
                      type="number"
                      value={newQuiz.passingScore}
                      onChange={(e) => setNewQuiz({...newQuiz, passingScore: parseInt(e.target.value)})}
                    />
                  </div>
                </div>
                
                <div>
                  <Label>Tentativas Permitidas</Label>
                  <Input 
                    type="number"
                    value={newQuiz.maxAttempts}
                    onChange={(e) => setNewQuiz({...newQuiz, maxAttempts: parseInt(e.target.value)})}
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch 
                    checked={newQuiz.hasCertificate}
                    onCheckedChange={(checked) => setNewQuiz({...newQuiz, hasCertificate: checked})}
                  />
                  <Label>Gerar Certificado</Label>
                </div>
              </div>
              
              {/* Adicionar Questões */}
              <div className="space-y-4">
                <h3 className="font-semibold">Adicionar Questão</h3>
                
                <div>
                  <Label>Pergunta</Label>
                  <Textarea 
                    placeholder="Digite a pergunta..."
                    value={newQuestion.question}
                    onChange={(e) => setNewQuestion({...newQuestion, question: e.target.value})}
                  />
                </div>
                
                <div>
                  <Label>Opções de Resposta</Label>
                  <div className="space-y-2">
                    {newQuestion.options?.map((option, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <RadioGroup 
                          value={newQuestion.correctAnswer?.toString()}
                          onValueChange={(value) => setNewQuestion({...newQuestion, correctAnswer: parseInt(value)})}
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value={index.toString()} />
                          </div>
                        </RadioGroup>
                        <Input 
                          placeholder={`Opção ${index + 1}`}
                          value={option}
                          onChange={(e) => {
                            const newOptions = [...(newQuestion.options || [])];
                            newOptions[index] = e.target.value;
                            setNewQuestion({...newQuestion, options: newOptions});
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <Label>Explicação (opcional)</Label>
                  <Textarea 
                    placeholder="Explicação da resposta correta..."
                    value={newQuestion.explanation}
                    onChange={(e) => setNewQuestion({...newQuestion, explanation: e.target.value})}
                  />
                </div>
                
                <Button onClick={handleAddQuestion} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Questão
                </Button>
                
                {/* Lista de Questões Adicionadas */}
                {newQuiz.questions && newQuiz.questions.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Questões Adicionadas ({newQuiz.questions.length})</h4>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {newQuiz.questions.map((q, index) => (
                        <div key={q.id} className="p-2 bg-gray-100 rounded text-sm">
                          <strong>{index + 1}.</strong> {q.question.substring(0, 50)}...
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setIsCreating(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCreateQuiz} disabled={!newQuiz.title || !newQuiz.questions?.length}>
                <Save className="h-4 w-4 mr-2" />
                Criar Quiz
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      
      {/* Lista de Quizzes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {quizzes.map((quiz) => (
          <Card key={quiz.id} className="bg-gray-900 border-gray-700 text-white">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{quiz.title}</CardTitle>
                {quiz.hasCertificate && (
                  <Badge className="bg-yellow-600">
                    <Trophy className="h-3 w-3 mr-1" />
                    Certificado
                  </Badge>
                )}
              </div>
              <p className="text-sm text-gray-400">{quiz.description}</p>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-blue-400" />
                  <span>{quiz.timeLimit} min</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-400" />
                  <span>{quiz.passingScore}%</span>
                </div>
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-orange-400" />
                  <span>{quiz.maxAttempts} tentativas</span>
                </div>
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-purple-400" />
                  <span>{quiz.questions.length} questões</span>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button size="sm" className="flex-1 bg-blue-600 hover:bg-blue-700">
                  <Edit className="h-4 w-4 mr-2" />
                  Editar
                </Button>
                <Button size="sm" className="bg-green-600 hover:bg-green-700">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Resultados
                </Button>
                <Button size="sm" variant="destructive">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Estatísticas dos Quizzes */}
      <Card className="bg-gray-900 border-gray-700 text-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Estatísticas dos Quizzes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">1,247</div>
              <div className="text-sm text-gray-400">Tentativas Totais</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">67%</div>
              <div className="text-sm text-gray-400">Taxa de Aprovação</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-400">892</div>
              <div className="text-sm text-gray-400">Certificados Emitidos</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">18:30</div>
              <div className="text-sm text-gray-400">Tempo Médio</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Componente para visualizar certificado
export const CertificatePreview = ({ courseName, studentName, score, date }: {
  courseName: string;
  studentName: string;
  score: number;
  date: string;
}) => {
  return (
    <div className="bg-white text-gray-900 p-8 rounded-lg shadow-lg max-w-2xl mx-auto">
      <div className="text-center border-4 border-yellow-500 p-8">
        <div className="mb-4">
          <Trophy className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-800 mb-2">CERTIFICADO DE CONCLUSÃO</h1>
          <div className="w-24 h-1 bg-yellow-500 mx-auto"></div>
        </div>
        
        <div className="my-8">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">"{courseName}"</h2>
          <p className="text-lg text-gray-600 mb-4">Concedido a:</p>
          <h3 className="text-3xl font-bold text-gray-800 mb-4">{studentName}</h3>
        </div>
        
        <div className="flex justify-between items-center mt-8 pt-4 border-t border-gray-300">
          <div>
            <p className="text-sm text-gray-600">Data:</p>
            <p className="font-semibold">{date}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Pontuação:</p>
            <p className="font-semibold text-green-600">{score}%</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Instituto dos Sonhos</p>
            <p className="font-semibold">Certificação Oficial</p>
          </div>
        </div>
      </div>
    </div>
  );
}; 