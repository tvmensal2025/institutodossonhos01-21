import React from 'react';
import { DrVitalEnhancedChat } from '@/components/dr-vital/DrVitalEnhancedChat';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Stethoscope, Brain, Database, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const DrVitalEnhancedPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar ao Dashboard
            </Button>
          </div>
          
          <div className="flex items-center gap-2">
            <Stethoscope className="w-6 h-6 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">Dr. Vital Enhanced</h1>
          </div>
        </div>

        {/* Informações sobre capacidades */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Database className="w-4 h-4 text-green-600" />
                Dados Completos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Acesso total: anamnese, peso, nutrição, exercícios, sono, metas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Brain className="w-4 h-4 text-purple-600" />
                IA Avançada
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Análises personalizadas baseadas no seu perfil único
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-600" />
                Insights Precisos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Recomendações médicas precisas e contextualizadas
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Chat Component */}
        <DrVitalEnhancedChat />
      </div>
    </div>
  );
};

export default DrVitalEnhancedPage;