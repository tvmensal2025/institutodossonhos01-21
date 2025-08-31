import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Brain, 
  TrendingUp, 
  Target, 
  AlertTriangle, 
  Lightbulb, 
  Award,
  Sparkles,
  Zap,
  Heart,
  Activity,
  Flame
} from 'lucide-react';

export const NutritionAIAnalytics = () => {
  return (
    <div className="space-y-6">
      {/* Score Principal */}
      <Card className="bg-gradient-to-r from-purple-600 via-pink-600 to-red-500 text-white border-0 overflow-hidden">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2 mb-2">
                <Brain className="w-8 h-8" />
                IA Nutricional Sofia
              </h2>
              <p className="text-white/90 mb-4">Análise personalizada em tempo real</p>
              <Badge className="bg-white/20 text-white border-white/30">
                📈 Melhorando esta semana
              </Badge>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold">87</div>
              <div className="text-white/80">Score Geral</div>
            </div>
          </div>
          <Progress value={87} className="mt-4 bg-white/20" />
        </CardContent>
      </Card>

      {/* Métricas Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-2 border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-green-800">Proteínas</span>
              <TrendingUp className="w-4 h-4 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-green-900">95%</div>
            <div className="text-sm text-green-600">Meta atingida!</div>
          </CardContent>
        </Card>

        <Card className="border-2 border-yellow-200 bg-yellow-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-yellow-800">Hidratação</span>
              <Activity className="w-4 h-4 text-yellow-600" />
            </div>
            <div className="text-2xl font-bold text-yellow-900">60%</div>
            <div className="text-sm text-yellow-600">Precisa melhorar</div>
          </CardContent>
        </Card>

        <Card className="border-2 border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-blue-800">Variedade</span>
              <Target className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-blue-900">78%</div>
            <div className="text-sm text-blue-600">Bom progresso</div>
          </CardContent>
        </Card>

        <Card className="border-2 border-purple-200 bg-purple-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-purple-800">Qualidade</span>
              <Award className="w-4 h-4 text-purple-600" />
            </div>
            <div className="text-2xl font-bold text-purple-900">85%</div>
            <div className="text-sm text-purple-600">Excelente!</div>
          </CardContent>
        </Card>
      </div>

      {/* Insights da IA */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-purple-500" />
              Insights Personalizados
            </div>
            <Button variant="outline" size="sm">
              <Brain className="w-4 h-4 mr-2" />
              Nova Análise
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 rounded-lg border border-green-200 bg-green-50">
            <div className="flex items-start gap-3">
              <Award className="w-5 h-5 text-green-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-green-800 mb-1">Parabéns! Meta de proteína atingida 💪</h4>
                <p className="text-sm text-green-700">Você está consumindo a quantidade ideal de proteínas. Isso ajuda na recuperação muscular e controle da saciedade.</p>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-lg border border-yellow-200 bg-yellow-50">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-yellow-800 mb-1">Atenção: Hidratação baixa</h4>
                <p className="text-sm text-yellow-700">Você precisa beber mais água. Tente adicionar 2-3 copos extras hoje para melhorar sua performance.</p>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-lg border border-blue-200 bg-blue-50">
            <div className="flex items-start gap-3">
              <Lightbulb className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-blue-800 mb-1">Dica personalizada</h4>
                <p className="text-sm text-blue-700">Baseado no seu perfil, adicione abacate no lanche da tarde para melhorar a absorção de vitaminas lipossolúveis.</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ações Recomendadas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-6 h-6 text-green-500" />
            Ações Para Hoje
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
            <Flame className="w-5 h-5 text-green-600" />
            <div className="flex-1">
              <h5 className="font-medium text-green-800">Beber 500ml de água agora</h5>
              <p className="text-sm text-green-600">Para atingir sua meta de hidratação</p>
            </div>
            <Button size="sm" className="bg-green-600 hover:bg-green-700">
              Feito!
            </Button>
          </div>

          <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <Heart className="w-5 h-5 text-blue-600" />
            <div className="flex-1">
              <h5 className="font-medium text-blue-800">Incluir vegetais no jantar</h5>
              <p className="text-sm text-blue-600">Para aumentar variedade nutricional</p>
            </div>
            <Button size="sm" variant="outline" className="border-blue-300 text-blue-700">
              Planejar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NutritionAIAnalytics;