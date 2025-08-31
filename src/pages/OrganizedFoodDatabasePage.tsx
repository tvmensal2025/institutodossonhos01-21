import React from 'react';
import OrganizedFoodDatabase from '@/components/nutrition-tracking/OrganizedFoodDatabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Database, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const OrganizedFoodDatabasePage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(-1)}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Voltar
              </Button>
              <div className="flex items-center gap-2">
                <Database className="h-6 w-6 text-primary" />
                <h1 className="text-2xl font-bold">Base de Alimentos Organizados</h1>
                <Badge variant="secondary" className="ml-2">
                  <Sparkles className="h-3 w-3 mr-1" />
                  IA Classificada
                </Badge>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={() => navigate('/sofia-nutricional')}
                className="flex items-center gap-2"
              >
                <Sparkles className="h-4 w-4" />
                Chat com Sofia
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Info Cards */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Database className="h-5 w-5 text-blue-500" />
                Sistema Inteligente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Alimentos classificados automaticamente pela IA Sofia com pontuação nutricional, 
                categorização e análise metabólica completa.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-500" />
                Análise Metabólica
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Cada alimento possui análise de como afeta seu metabolismo: 
                acelerar (quente), acalmar (frio) ou equilibrar.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Badge className="h-5 w-5 bg-green-500" />
                Superalimentos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Identificação automática de superalimentos com base em densidade nutricional, 
                benefícios e qualidade dos macronutrientes.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Componente Principal */}
        <Card className="shadow-lg">
          <CardContent className="p-6">
            <OrganizedFoodDatabase />
          </CardContent>
        </Card>

        {/* Footer Info */}
        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground">
            💡 <strong>Dica:</strong> Use esta base de dados para entender melhor os alimentos 
            antes de conversar com a Sofia sobre seus cardápios personalizados.
          </p>
        </div>
      </div>
    </div>
  );
};

export default OrganizedFoodDatabasePage;
