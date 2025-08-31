import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Calendar, 
  Clock, 
  Utensils, 
  Stethoscope, 
  Brain, 
  RefreshCw,
  Trash2,
  TrendingUp,
  Heart,
  Eye
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface UnifiedAnalysis {
  id: string;
  type: 'nutrition' | 'preventive' | 'sofia' | 'medical';
  title: string;
  description: string;
  created_at: string;
  data: any;
  user_id: string;
  meal_type?: string;
  analysis_text?: string;
  risk_level?: string;
  calories?: number;
}

export const UnifiedAnalysisHistory: React.FC = () => {
  const [analyses, setAnalyses] = useState<UnifiedAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<string>('all');
  const { toast } = useToast();

  useEffect(() => {
    loadAllAnalyses();
  }, []);

  const loadAllAnalyses = async () => {
    try {
      setLoading(true);
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      const userId = user.user.id;

      // Buscar análises nutricionais
      const { data: nutritionData } = await supabase
        .from('food_analysis')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      // Buscar análises preventivas
      const { data: preventiveData } = await supabase
        .from('preventive_health_analyses')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      // Buscar análises Sofia
      const { data: sofiaData } = await supabase
        .from('sofia_food_analysis')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      // Buscar documentos médicos analisados
      const { data: medicalData } = await supabase
        .from('medical_documents')
        .select('*')
        .eq('user_id', userId)
        .not('results', 'is', null)
        .order('created_at', { ascending: false });

      // Combinar todas as análises
      const unifiedAnalyses: UnifiedAnalysis[] = [];

      // Análises nutricionais
      nutritionData?.forEach(item => {
        const foodItems = Array.isArray(item.food_items) ? item.food_items : [];
        const nutritionAnalysis = typeof item.nutrition_analysis === 'object' ? item.nutrition_analysis as any : null;
        const calories = nutritionAnalysis?.calorias || nutritionAnalysis?.calories || 0;
        
        unifiedAnalyses.push({
          id: item.id,
          type: 'nutrition',
          title: `Análise Nutricional - ${getMealTypeLabel(item.meal_type || 'refeicao')}`,
          description: `${calories ? Math.round(calories) + ' kcal' : 'Análise nutricional'} • ${foodItems.length || 0} alimentos`,
          created_at: item.created_at,
          data: item,
          user_id: userId,
          meal_type: item.meal_type,
          calories: calories
        });
      });

      // Análises preventivas
      preventiveData?.forEach(item => {
        const riskLevel = 'BAIXO'; // Default value since risk_level doesn't exist in schema
        
        unifiedAnalyses.push({
          id: item.id,
          type: 'preventive',
          title: `Análise Preventiva - ${item.analysis_type === 'mensal' ? 'Mensal' : 'Quinzenal'}`,
          description: `Dr. Vital • Score: ${item.risk_score}/100 • Nível: ${riskLevel}`,
          created_at: item.created_at,
          data: item,
          user_id: userId,
          risk_level: riskLevel
        });
      });

      // Análises Sofia
      sofiaData?.forEach(item => {
        unifiedAnalyses.push({
          id: item.id,
          type: 'sofia',
          title: 'Análise Sofia',
          description: `IA Nutricional ${item.confirmed_by_user ? '• Confirmada pelo usuário' : '• Aguardando confirmação'}`,
          created_at: item.created_at,
          data: item,
          user_id: userId
        });
      });

      // Documentos médicos
      medicalData?.forEach(item => {
        unifiedAnalyses.push({
          id: item.id,
          type: 'medical',
          title: `Análise Médica - ${item.type || 'Documento'}`,
          description: `${item.doctor_name || 'Análise'} • ${item.status || 'Processado'}`,
          created_at: item.created_at,
          data: item,
          user_id: userId,
          analysis_text: item.results
        });
      });

      // Ordenar por data
      unifiedAnalyses.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      setAnalyses(unifiedAnalyses);
    } catch (error) {
      console.error('Erro ao carregar análises:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar histórico de análises",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getMealTypeLabel = (mealType: string) => {
    const labels: Record<string, string> = {
      breakfast: 'Café da Manhã',
      lunch: 'Almoço',
      dinner: 'Jantar',
      snack: 'Lanche',
      refeicao: 'Refeição'
    };
    return labels[mealType] || mealType;
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'nutrition': return <Utensils className="h-4 w-4" />;
      case 'preventive': return <Stethoscope className="h-4 w-4" />;
      case 'sofia': return <Brain className="h-4 w-4" />;
      case 'medical': return <Heart className="h-4 w-4" />;
      default: return <Calendar className="h-4 w-4" />;
    }
  };

  const getTypeBadge = (type: string) => {
    const variants = {
      nutrition: 'default',
      preventive: 'secondary',
      sofia: 'outline',
      medical: 'destructive'
    };
    return variants[type as keyof typeof variants] || 'default';
  };

  const getTypeLabel = (type: string) => {
    const labels = {
      nutrition: 'Nutricional',
      preventive: 'Preventiva',
      sofia: 'Sofia IA',
      medical: 'Médica'
    };
    return labels[type as keyof typeof labels] || type;
  };

  const deleteAnalysis = async (analysis: UnifiedAnalysis) => {
    if (window.confirm('Tem certeza que deseja excluir esta análise?')) {
      try {
        let tableName: 'food_analysis' | 'preventive_health_analyses' | 'sofia_food_analysis' | 'medical_documents' | null = null;
        
        switch (analysis.type) {
          case 'nutrition': 
            tableName = 'food_analysis'; 
            break;
          case 'preventive': 
            tableName = 'preventive_health_analyses'; 
            break;
          case 'sofia': 
            tableName = 'sofia_food_analysis'; 
            break;
          case 'medical': 
            tableName = 'medical_documents'; 
            break;
        }

        if (tableName) {
          const { error } = await supabase
            .from(tableName)
            .delete()
            .eq('id', analysis.id);

          if (error) throw error;

          setAnalyses(prev => prev.filter(a => a.id !== analysis.id));
          toast({
            title: "Análise excluída",
            description: "A análise foi removida com sucesso"
          });
        }
      } catch (error) {
        console.error('Erro ao excluir análise:', error);
        toast({
          title: "Erro",
          description: "Erro ao excluir análise",
          variant: "destructive"
        });
      }
    }
  };

  const filteredAnalyses = selectedType === 'all' 
    ? analyses 
    : analyses.filter(a => a.type === selectedType);

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy HH:mm', { locale: ptBR });
    } catch {
      return dateString;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Histórico de Análises
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={loadAllAnalyses}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Recarregar
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Todas as suas análises de saúde e nutrição em um só lugar
          </p>
        </CardHeader>
      </Card>

      <Tabs value={selectedType} onValueChange={setSelectedType}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">Todas ({analyses.length})</TabsTrigger>
          <TabsTrigger value="nutrition">
            Nutricional ({analyses.filter(a => a.type === 'nutrition').length})
          </TabsTrigger>
          <TabsTrigger value="preventive">
            Preventiva ({analyses.filter(a => a.type === 'preventive').length})
          </TabsTrigger>
          <TabsTrigger value="sofia">
            Sofia IA ({analyses.filter(a => a.type === 'sofia').length})
          </TabsTrigger>
          <TabsTrigger value="medical">
            Médica ({analyses.filter(a => a.type === 'medical').length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={selectedType} className="space-y-4">
          {filteredAnalyses.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <div className="flex flex-col items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                    {selectedType === 'all' ? <Calendar className="h-6 w-6" /> : getTypeIcon(selectedType)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Nenhuma análise encontrada</h3>
                    <p className="text-muted-foreground">
                      {selectedType === 'all' 
                        ? 'Suas análises de saúde aparecerão aqui' 
                        : `Nenhuma análise ${getTypeLabel(selectedType).toLowerCase()} encontrada`}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <ScrollArea className="h-[600px]">
              <div className="space-y-4">
                {filteredAnalyses.map((analysis) => (
                  <Card key={`${analysis.type}-${analysis.id}`} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-muted">
                            {getTypeIcon(analysis.type)}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold truncate">{analysis.title}</h3>
                              <Badge variant={getTypeBadge(analysis.type) as any}>
                                {getTypeLabel(analysis.type)}
                              </Badge>
                            </div>
                            
                            <p className="text-sm text-muted-foreground mb-2">
                              {analysis.description}
                            </p>
                            
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              {formatDate(analysis.created_at)}
                            </div>

                            {/* Conteúdo específico por tipo */}
                            {analysis.type === 'nutrition' && (() => {
                              const foodItems = Array.isArray(analysis.data.food_items) ? analysis.data.food_items : [];
                              return foodItems.length > 0 ? (
                                <div className="mt-3 pt-3 border-t">
                                  <div className="flex flex-wrap gap-1">
                                    {foodItems.slice(0, 3).map((food: any, idx: number) => (
                                      <Badge key={idx} variant="outline" className="text-xs">
                                        {typeof food === 'string' ? food : food.name || 'Alimento'}
                                      </Badge>
                                    ))}
                                    {foodItems.length > 3 && (
                                      <Badge variant="outline" className="text-xs">
                                        +{foodItems.length - 3} mais
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              ) : null;
                            })()}

                            {analysis.type === 'preventive' && (
                              <div className="mt-3 pt-3 border-t">
                                <div className="flex items-center gap-2">
                                  <TrendingUp className="h-4 w-4 text-blue-500" />
                                  <span className="text-sm">Score de Saúde: {analysis.data.risk_score}/100</span>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              // TODO: Implementar visualização detalhada
                              toast({
                                title: "Em breve",
                                description: "Visualização detalhada será implementada"
                              });
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteAnalysis(analysis)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};