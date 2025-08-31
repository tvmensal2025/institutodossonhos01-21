
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Database, Bug, CheckCircle, XCircle, AlertTriangle, LineChart, BarChart3, Activity } from 'lucide-react';

interface VerificationResult {
  table: string;
  exists: boolean;
  hasData: boolean;
  error?: string;
  count?: number;
}

interface ChartTest {
  name: string;
  type: string;
  dataFields: string[];
  status: 'success' | 'warning' | 'error';
  message: string;
  sampleData?: any[];
}

const DebugDataVerification: React.FC = () => {
  const [results, setResults] = useState<VerificationResult[]>([]);
  const [chartTests, setChartTests] = useState<ChartTest[]>([]);
  const [loading, setLoading] = useState(false);
  const [testUser, setTestUser] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    checkCurrentUser();
    // Executar verificação automaticamente após 1 segundo
    setTimeout(() => {
      runVerification();
    }, 1000);
  }, []);

  const checkCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setTestUser(user);
  };

  const testChartData = async (user: any) => {
    const chartTestResults: ChartTest[] = [];

    try {
      // Buscar dados de medições
      const { data: measurements } = await supabase
        .from('weight_measurements')
        .select('*')
        .eq('user_id', user.id)
        .order('measurement_date', { ascending: false })
        .limit(10);

      // Buscar análises semanais
      const { data: weeklyAnalyses } = await supabase
        .from('weekly_analyses')
        .select('*')
        .eq('user_id', user.id)
        .order('week_start_date', { ascending: false })
        .limit(10);

      // Buscar dados físicos
      const { data: physicalData } = await supabase
        .from('user_physical_data')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      // Tentar buscar dados das novas tabelas (caso existam)
      let missions: any[] = [];
      let scores: any[] = [];
      let moodData: any[] = [];
      let lifeWheel: any[] = [];
      let categories: any[] = [];

      try {
        const { data: missionsData } = await supabase
          .from('daily_missions' as any)
          .select('*')
          .eq('user_id', user.id)
          .order('date_assigned', { ascending: false })
          .limit(10);
        missions = missionsData || [];
      } catch (e) {
        console.log('Tabela daily_missions ainda não existe');
      }

      try {
        const { data: scoresData } = await supabase
          .from('user_scores' as any)
          .select('*')
          .eq('user_id', user.id)
          .order('date', { ascending: false })
          .limit(10);
        scores = scoresData || [];
      } catch (e) {
        console.log('Tabela user_scores ainda não existe');
      }

      try {
        const { data: moodRawData } = await supabase
          .from('mood_tracking' as any)
          .select('*')
          .eq('user_id', user.id)
          .order('date', { ascending: false })
          .limit(10);
        moodData = moodRawData || [];
      } catch (e) {
        console.log('Tabela mood_tracking ainda não existe');
      }

      try {
        const { data: lifeWheelData } = await supabase
          .from('life_wheel' as any)
          .select('*')
          .eq('user_id', user.id)
          .order('evaluation_date', { ascending: false })
          .limit(1);
        lifeWheel = lifeWheelData || [];
      } catch (e) {
        console.log('Tabela life_wheel ainda não existe');
      }

      try {
        const { data: categoriesData } = await supabase
          .from('activity_categories' as any)
          .select('*')
          .eq('user_id', user.id);
        categories = categoriesData || [];
      } catch (e) {
        console.log('Tabela activity_categories ainda não existe');
      }

      // 1. Teste: Gráfico de Evolução do Peso
      const weightEvolutionTest = testWeightEvolution(measurements);
      chartTestResults.push(weightEvolutionTest);

      // 2. Teste: Gráfico de IMC (Índice de Massa Corporal)
      const imcTest = testIMCChart(measurements);
      chartTestResults.push(imcTest);

      // 3. Teste: Gráfico de Composição Corporal
      const bodyCompositionTest = testBodyComposition(measurements);
      chartTestResults.push(bodyCompositionTest);

      // 4. Teste: Gráfico de Idade Metabólica
      const metabolicAgeTest = testMetabolicAge(measurements, physicalData);
      chartTestResults.push(metabolicAgeTest);

      // 5. Teste: Gráfico de Pontuação Diária / Evolução de Missões
      const missionScoreTest = testMissionScore(missions, scores);
      chartTestResults.push(missionScoreTest);

      // 6. Teste: Gráfico de Benefícios Visuais / Humor
      const moodTest = testMoodChart(moodData);
      chartTestResults.push(moodTest);

      // 7. Teste: Gráfico de Radar (Roda da Vida)
      const radarTest = testRadarChart(lifeWheel);
      chartTestResults.push(radarTest);

      // 8. Teste: Gráfico de Gauge (Velocímetro)
      const gaugeTest = testGaugeChart(measurements);
      chartTestResults.push(gaugeTest);

      // 9. Teste: Gráfico de Barras por Categoria
      const categoryBarTest = testCategoryBarChart(categories);
      chartTestResults.push(categoryBarTest);

      // 10. Teste: Mini Gráficos de Progresso
      const progressTest = testProgressCharts(measurements);
      chartTestResults.push(progressTest);

    } catch (error) {
      console.error('Erro ao testar gráficos:', error);
    }

    setChartTests(chartTestResults);
  };

  const testWeightEvolution = (measurements: any[]): ChartTest => {
    const requiredFields = ['peso_kg', 'measurement_date'];
    const hasRequiredData = measurements && measurements.length > 0 && 
      measurements.every(m => m.peso_kg && m.measurement_date);

    return {
      name: 'Evolução do Peso',
      type: 'LineChart',
      dataFields: requiredFields,
      status: hasRequiredData ? 'success' : measurements?.length > 0 ? 'warning' : 'error',
      message: hasRequiredData 
        ? `✅ Dados completos para ${measurements.length} medições`
        : measurements?.length > 0 
          ? `⚠️ ${measurements.length} medições, mas algumas sem peso ou data`
          : '❌ Nenhuma medição de peso encontrada',
      sampleData: measurements?.slice(0, 3)
    };
  };

  const testIMCChart = (measurements: any[]): ChartTest => {
    const requiredFields = ['imc', 'measurement_date'];
    const hasIMCData = measurements && measurements.length > 0 && 
      measurements.some(m => m.imc);

    return {
      name: 'Evolução do IMC',
      type: 'LineChart',
      dataFields: requiredFields,
      status: hasIMCData ? 'success' : measurements?.length > 0 ? 'warning' : 'error',
      message: hasIMCData 
        ? `✅ IMC calculado para ${measurements.filter(m => m.imc).length} medições`
        : measurements?.length > 0 
          ? '⚠️ Medições existem, mas IMC não calculado'
          : '❌ Nenhum dado de IMC encontrado',
      sampleData: measurements?.filter(m => m.imc).slice(0, 3)
    };
  };

  const testBodyComposition = (measurements: any[]): ChartTest => {
    const requiredFields = ['gordura_corporal_percent', 'massa_muscular_kg', 'agua_corporal_percent'];
    const hasCompositionData = measurements && measurements.length > 0 && 
      measurements.some(m => m.gordura_corporal_percent || m.massa_muscular_kg || m.agua_corporal_percent);

    return {
      name: 'Composição Corporal',
      type: 'ComposedChart',
      dataFields: requiredFields,
      status: hasCompositionData ? 'success' : measurements?.length > 0 ? 'warning' : 'error',
      message: hasCompositionData 
        ? `✅ Dados de composição para ${measurements.filter(m => m.gordura_corporal_percent || m.massa_muscular_kg || m.agua_corporal_percent).length} medições`
        : measurements?.length > 0 
          ? '⚠️ Medições existem, mas sem dados de composição corporal'
          : '❌ Nenhum dado de composição corporal encontrado',
      sampleData: measurements?.filter(m => m.gordura_corporal_percent || m.massa_muscular_kg || m.agua_corporal_percent).slice(0, 3)
    };
  };

  const testMetabolicAge = (measurements: any[], physicalData: any): ChartTest => {
    const requiredFields = ['idade_metabolica', 'measurement_date'];
    const hasMetabolicAge = measurements && measurements.length > 0 && 
      measurements.some(m => m.idade_metabolica);
    const hasPhysicalData = physicalData && physicalData.idade;

    return {
      name: 'Idade Metabólica',
      type: 'LineChart',
      dataFields: requiredFields,
      status: hasMetabolicAge && hasPhysicalData ? 'success' : hasMetabolicAge || hasPhysicalData ? 'warning' : 'error',
      message: hasMetabolicAge && hasPhysicalData
        ? `✅ Idade metabólica para ${measurements.filter(m => m.idade_metabolica).length} medições + idade real (${physicalData.idade} anos)`
        : hasMetabolicAge 
          ? `⚠️ Idade metabólica disponível, mas falta idade real nos dados físicos`
          : hasPhysicalData
            ? `⚠️ Idade real disponível (${physicalData.idade} anos), mas falta idade metabólica nas medições`
            : '❌ Faltam dados de idade metabólica e idade real',
      sampleData: measurements?.filter(m => m.idade_metabolica).slice(0, 3)
    };
  };

  const testWeeklyAnalysis = (weeklyAnalyses: any[]): ChartTest => {
    const requiredFields = ['week_start_date', 'week_end_date', 'summary_data', 'overall_score'];
    const hasWeeklyData = weeklyAnalyses && weeklyAnalyses.length > 0;

    return {
      name: 'Análise Semanal',
      type: 'BarChart',
      dataFields: requiredFields,
      status: hasWeeklyData ? 'success' : 'error',
      message: hasWeeklyData 
        ? `✅ ${weeklyAnalyses.length} análises semanais disponíveis`
        : '❌ Nenhuma análise semanal encontrada',
      sampleData: weeklyAnalyses?.slice(0, 3)
    };
  };

  const testTrends = (measurements: any[]): ChartTest => {
    const requiredFields = ['peso_kg', 'measurement_date'];
    const hasTrendData = measurements && measurements.length >= 2;

    return {
      name: 'Tendências de Peso',
      type: 'AreaChart',
      dataFields: requiredFields,
      status: hasTrendData ? 'success' : measurements?.length > 0 ? 'warning' : 'error',
      message: hasTrendData 
        ? `✅ ${measurements.length} medições suficientes para calcular tendências`
        : measurements?.length > 0 
          ? `⚠️ Apenas ${measurements.length} medição(ões) - precisa de pelo menos 2 para tendências`
          : '❌ Nenhuma medição para calcular tendências',
      sampleData: measurements?.slice(0, 3)
    };
  };

  const testBasalMetabolism = (measurements: any[]): ChartTest => {
    const requiredFields = ['metabolismo_basal_kcal', 'measurement_date'];
    const hasMetabolismData = measurements && measurements.length > 0 && 
      measurements.some(m => m.metabolismo_basal_kcal);

    return {
      name: 'Metabolismo Basal',
      type: 'LineChart',
      dataFields: requiredFields,
      status: hasMetabolismData ? 'success' : measurements?.length > 0 ? 'warning' : 'error',
      message: hasMetabolismData 
        ? `✅ Metabolismo basal para ${measurements.filter(m => m.metabolismo_basal_kcal).length} medições`
        : measurements?.length > 0 
          ? '⚠️ Medições existem, mas sem dados de metabolismo basal'
          : '❌ Nenhum dado de metabolismo basal encontrado',
      sampleData: measurements?.filter(m => m.metabolismo_basal_kcal).slice(0, 3)
    };
  };

  const testMetabolicRisk = (measurements: any[]): ChartTest => {
    const requiredFields = ['risco_metabolico', 'measurement_date'];
    const hasRiskData = measurements && measurements.length > 0 && 
      measurements.some(m => m.risco_metabolico);

    return {
      name: 'Risco Metabólico',
      type: 'PieChart',
      dataFields: requiredFields,
      status: hasRiskData ? 'success' : measurements?.length > 0 ? 'warning' : 'error',
      message: hasRiskData 
        ? `✅ Risco metabólico para ${measurements.filter(m => m.risco_metabolico).length} medições`
        : measurements?.length > 0 
          ? '⚠️ Medições existem, mas sem classificação de risco metabólico'
          : '❌ Nenhum dado de risco metabólico encontrado',
      sampleData: measurements?.filter(m => m.risco_metabolico).slice(0, 3)
    };
  };

  const testCircumferences = (measurements: any[]): ChartTest => {
    const requiredFields = ['circunferencia_abdominal_cm', 'circunferencia_braco_cm', 'circunferencia_perna_cm'];
    const hasCircumferenceData = measurements && measurements.length > 0 && 
      measurements.some(m => m.circunferencia_abdominal_cm || m.circunferencia_braco_cm || m.circunferencia_perna_cm);

    return {
      name: 'Circunferências',
      type: 'LineChart',
      dataFields: requiredFields,
      status: hasCircumferenceData ? 'success' : measurements?.length > 0 ? 'warning' : 'error',
      message: hasCircumferenceData 
        ? `✅ Dados de circunferência para ${measurements.filter(m => m.circunferencia_abdominal_cm || m.circunferencia_braco_cm || m.circunferencia_perna_cm).length} medições`
        : measurements?.length > 0 
          ? '⚠️ Medições existem, mas sem dados de circunferência'
          : '❌ Nenhum dado de circunferência encontrado',
      sampleData: measurements?.filter(m => m.circunferencia_abdominal_cm || m.circunferencia_braco_cm || m.circunferencia_perna_cm).slice(0, 3)
    };
  };

  const testMissionScore = (missions: any[], scores: any[]): ChartTest => {
    const hasData = missions.length > 0 || scores.length > 0;
    
    return {
      name: 'Pontuação Diária / Evolução de Missões',
      type: 'LineChart',
      dataFields: ['date', 'score', 'mission_type'],
      status: hasData ? 'success' : 'warning',
      message: hasData 
        ? `✅ Dados de missões (${missions.length}) e pontuações (${scores.length}) disponíveis`
        : '⚠️ Sistema de missões não implementado ainda - dados simulados necessários',
      sampleData: [...missions.slice(0, 2), ...scores.slice(0, 1)]
    };
  };

  const testMoodChart = (moodData: any[]): ChartTest => {
    const hasData = moodData.length > 0;
    
    return {
      name: 'Benefícios Visuais / Humor',
      type: 'LineChart',
      dataFields: ['date', 'mood_score', 'mood_emoji'],
      status: hasData ? 'success' : 'warning',
      message: hasData 
        ? `✅ ${moodData.length} registros de humor disponíveis`
        : '⚠️ Sistema de humor não implementado ainda - dados simulados necessários',
      sampleData: moodData.slice(0, 3)
    };
  };

  const testRadarChart = (lifeWheel: any[]): ChartTest => {
    const hasData = lifeWheel.length > 0;
    
    return {
      name: 'Radar (Roda da Vida)',
      type: 'RadarChart',
      dataFields: ['area', 'score', 'max_score'],
      status: hasData ? 'success' : 'warning',
      message: hasData 
        ? `✅ ${lifeWheel.length} avaliações da roda da vida disponíveis`
        : '⚠️ Sistema de roda da vida não implementado ainda - dados simulados necessários',
      sampleData: lifeWheel.slice(0, 1)
    };
  };

  const testGaugeChart = (measurements: any[]): ChartTest => {
    const hasData = measurements && measurements.length > 0;
    const scoreData = hasData ? measurements.filter(m => m.imc || m.risco_metabolico) : [];

    return {
      name: 'Gauge (Velocímetro)',
      type: 'GaugeChart',
      dataFields: ['score', 'max_score', 'category'],
      status: scoreData.length > 0 ? 'success' : hasData ? 'warning' : 'error',
      message: scoreData.length > 0 
        ? `✅ Dados suficientes para gauge (${scoreData.length} medições com IMC/risco)`
        : hasData 
          ? '⚠️ Medições existem, mas faltam dados para calcular score geral'
          : '❌ Nenhum dado para gráfico gauge',
      sampleData: scoreData.slice(0, 3)
    };
  };

  const testCategoryBarChart = (categories: any[]): ChartTest => {
    const hasData = categories.length > 0;
    
    return {
      name: 'Barras por Categoria',
      type: 'BarChart',
      dataFields: ['category', 'value', 'percentage'],
      status: hasData ? 'success' : 'warning',
      message: hasData 
        ? `✅ ${categories.length} categorias de atividade disponíveis`
        : '⚠️ Sistema de categorias não implementado ainda - dados simulados necessários',
      sampleData: categories.slice(0, 3)
    };
  };

  const testProgressCharts = (measurements: any[]): ChartTest => {
    const requiredFields = ['peso_kg', 'gordura_corporal_percent', 'massa_muscular_kg', 'imc'];
    const hasProgressData = measurements && measurements.length >= 2;

    return {
      name: 'Mini Gráficos de Progresso',
      type: 'MiniCharts',
      dataFields: requiredFields,
      status: hasProgressData ? 'success' : measurements?.length > 0 ? 'warning' : 'error',
      message: hasProgressData 
        ? `✅ ${measurements.length} medições suficientes para mini gráficos de progresso`
        : measurements?.length > 0 
          ? `⚠️ Apenas ${measurements.length} medição - precisa de pelo menos 2 para mostrar progresso`
          : '❌ Nenhuma medição para mini gráficos de progresso',
      sampleData: measurements?.slice(0, 3)
    };
  };

  const runVerification = async () => {
    setLoading(true);
    const verificationResults: VerificationResult[] = [];

    try {
      // 1. Verificar se o usuário está autenticado
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Erro",
          description: "Usuário não autenticado",
          variant: "destructive",
        });
        return;
      }

      // Lista de todas as tabelas para verificar
      const tables = [
        'weight_measurements',
        'user_physical_data', 
        'profiles',
        'weekly_analyses',
        'user_goals',
        'daily_missions',
        'user_scores',
        'mood_tracking',
        'life_wheel',
        'activity_categories',
        'activity_sessions'
      ];

      // Verificar cada tabela
      for (const table of tables) {
        try {
          const { data, error } = await supabase
            .from(table as any)
            .select('*')
            .eq('user_id', user.id)
            .limit(1);

          verificationResults.push({
            table,
            exists: true,
            hasData: data && data.length > 0,
            count: data?.length || 0,
            error: error?.message
          });
        } catch (err: any) {
          verificationResults.push({
            table,
            exists: false,
            hasData: false,
            error: err.message
          });
        }
      }

      setResults(verificationResults);

      // Testar gráficos
      await testChartData(user);

      // Verificar se há problemas críticos
      const criticalIssues = verificationResults.filter(r => !r.exists || r.error);
      if (criticalIssues.length > 0) {
        toast({
          title: "Problemas encontrados",
          description: `${criticalIssues.length} problemas críticos detectados`,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Verificação concluída",
          description: "Todas as tabelas estão funcionando corretamente",
        });
      }

    } catch (error) {
      console.error('Erro na verificação:', error);
      toast({
        title: "Erro na verificação",
        description: "Erro ao executar verificação",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const testSaveMeasurement = async () => {
    if (!testUser) {
      toast({
        title: "Erro",
        description: "Usuário não autenticado",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);

      // Primeiro, garantir que temos dados físicos
      const { data: physicalData, error: physicalError } = await supabase
        .from('user_physical_data')
        .select('*')
        .eq('user_id', testUser.id)
        .maybeSingle();

      if (physicalError || !physicalData) {
        // Criar dados físicos de teste
        const { error: createPhysicalError } = await supabase
          .from('user_physical_data')
          .insert({
            user_id: testUser.id,
            altura_cm: 170,
            idade: 30,
            sexo: 'masculino',
            nivel_atividade: 'moderado'
          });

        if (createPhysicalError) {
          throw new Error(`Erro ao criar dados físicos: ${createPhysicalError.message}`);
        }
      }

      // Agora testar salvamento de medição
      const testMeasurement = {
        user_id: testUser.id,
        peso_kg: 75.5,
        gordura_corporal_percent: 15.2,
        massa_muscular_kg: 55.3,
        agua_corporal_percent: 58.7,
        device_type: 'manual',
        notes: 'Teste de verificação'
      };

      const { data: savedMeasurement, error: saveError } = await supabase
        .from('weight_measurements')
        .insert(testMeasurement)
        .select()
        .single();

      if (saveError) {
        throw new Error(`Erro ao salvar medição: ${saveError.message}`);
      }

      toast({
        title: "Teste de salvamento",
        description: `Medição salva com sucesso! Peso: ${savedMeasurement.peso_kg}kg`,
      });

      // Executar verificação novamente
      await runVerification();

    } catch (error: any) {
      console.error('Erro no teste de salvamento:', error);
      toast({
        title: "Erro no teste",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (result: VerificationResult) => {
    if (result.error) return <XCircle className="h-4 w-4 text-red-500" />;
    if (result.hasData) return <CheckCircle className="h-4 w-4 text-green-500" />;
    return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
  };

  const getStatusBadge = (result: VerificationResult) => {
    if (result.error) return <Badge variant="destructive">Erro</Badge>;
    if (result.hasData) return <Badge variant="default">OK</Badge>;
    return <Badge variant="secondary">Vazio</Badge>;
  };

  const getChartStatusIcon = (status: ChartTest['status']) => {
    switch (status) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'error': return <XCircle className="h-4 w-4 text-red-500" />;
    }
  };

  const getChartStatusBadge = (status: ChartTest['status']) => {
    switch (status) {
      case 'success': return <Badge variant="default" className="bg-green-100 text-green-800">OK</Badge>;
      case 'warning': return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Parcial</Badge>;
      case 'error': return <Badge variant="destructive">Erro</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bug className="h-5 w-5" />
            Verificação de Dados
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {testUser ? (
            <Alert>
              <AlertDescription>
                Usuário autenticado: <strong>{testUser.email}</strong>
              </AlertDescription>
            </Alert>
          ) : (
            <Alert variant="destructive">
              <AlertDescription>
                Nenhum usuário autenticado
              </AlertDescription>
            </Alert>
          )}

          <div className="flex gap-2">
            <Button 
              onClick={runVerification} 
              disabled={loading}
              variant="outline"
            >
              {loading ? 'Verificando...' : 'Verificar Tabelas'}
            </Button>
            
            <Button 
              onClick={testSaveMeasurement} 
              disabled={loading || !testUser}
              variant="outline"
            >
              {loading ? 'Testando...' : 'Testar Salvamento'}
            </Button>
          </div>

          {results.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold">Resultados da Verificação:</h3>
              {results.map((result, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(result)}
                    <span className="font-medium">{result.table}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(result)}
                    {result.count !== undefined && (
                      <span className="text-sm text-muted-foreground">
                        {result.count} registros
                      </span>
                    )}
                  </div>
                  {result.error && (
                    <div className="text-xs text-red-500 mt-1">
                      {result.error}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Testes de Gráficos */}
      {chartTests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Testes de Gráficos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {chartTests.map((test, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getChartStatusIcon(test.status)}
                      <span className="font-medium">{test.name}</span>
                    </div>
                    {getChartStatusBadge(test.status)}
                  </div>
                  
                  <div className="text-sm text-muted-foreground mb-2">
                    Tipo: {test.type}
                  </div>
                  
                  <div className="text-sm mb-2">
                    {test.message}
                  </div>
                  
                  <div className="text-xs text-muted-foreground">
                    Campos necessários: {test.dataFields.join(', ')}
                  </div>
                  
                  {test.sampleData && test.sampleData.length > 0 && (
                    <details className="mt-2">
                      <summary className="text-xs cursor-pointer text-blue-600 hover:text-blue-800">
                        Ver dados de exemplo
                      </summary>
                      <pre className="text-xs bg-gray-50 p-2 rounded mt-1 overflow-x-auto">
                        {JSON.stringify(test.sampleData, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DebugDataVerification;
