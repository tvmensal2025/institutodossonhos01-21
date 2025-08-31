import React from 'react';
import { FoodAnalysisSystem } from '@/components/FoodAnalysisSystem';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  BookOpen, 
  TrendingUp, 
  Award,
  Lightbulb,
  Users
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getCharacterImageUrl } from '@/lib/character-images';

export const FoodAnalysisPage: React.FC = () => {
  const navigate = useNavigate();
  const sofiaImage = getCharacterImageUrl('sofia');

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(-1)}
                className="text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
              <div className="flex items-center space-x-3">
                <img 
                  src={sofiaImage} 
                  alt="Sofia" 
                  className="w-10 h-10 rounded-full"
                />
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Análise de Comida</h1>
                  <p className="text-sm text-gray-600">Sofia analisa suas refeições com IA</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                <Lightbulb className="w-3 h-3 mr-1" />
                IA Avançada
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Features Overview */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center space-x-2 text-green-800">
                <BookOpen className="w-5 h-5" />
                <span className="text-lg">Análise Nutricional</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-green-700">
                Análise completa de macronutrientes, vitaminas, minerais e score de saúde
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center space-x-2 text-purple-800">
                <TrendingUp className="w-5 h-5" />
                <span className="text-lg">IA da Sofia</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-purple-700">
                Insights personalizados e recomendações baseadas em IA avançada
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center space-x-2 text-blue-800">
                <Award className="w-5 h-5" />
                <span className="text-lg">Padrões Inteligentes</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-blue-700">
                Detecção automática de padrões alimentares e hábitos saudáveis
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Sistema Principal */}
        <FoodAnalysisSystem />
      </div>

      {/* Footer com informações */}
      <div className="bg-white border-t mt-12">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Como funciona a análise da Sofia?
              </h3>
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p>Adicione os alimentos que você consumiu na refeição</p>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p>A Sofia analisa a composição nutricional completa</p>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p>Receba insights personalizados e recomendações</p>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p>Acompanhe seus padrões alimentares ao longo do tempo</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Benefícios da análise inteligente
              </h3>
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4 text-green-600" />
                  <span>Educação nutricional personalizada</span>
                </div>
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-4 h-4 text-blue-600" />
                  <span>Detecção de padrões alimentares</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Award className="w-4 h-4 text-purple-600" />
                  <span>Motivação para escolhas saudáveis</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Lightbulb className="w-4 h-4 text-orange-600" />
                  <span>Insights baseados em IA avançada</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 