import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const DebugData: React.FC = () => {
  const [data, setData] = useState<{
    user: string;
    physicalData: unknown[] | null;
    measurements: unknown[] | null;
    goals: unknown[] | null;
    weeklyAnalyses: unknown[] | null;
    errors: {
      physical: Error | null;
      measurements: Error | null;
      goals: Error | null;
      weekly: Error | null;
    };
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const checkAllData = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Erro",
          description: "Usuário não autenticado",
          variant: "destructive"
        });
        return;
      }

      console.log('=== DEBUG DATA ===');
      console.log('Usuário:', user.id);

      // Verificar dados físicos
      const { data: physicalData, error: physicalError } = await supabase
        .from('user_physical_data')
        .select('*')
        .eq('user_id', user.id);

      console.log('Dados físicos:', physicalData);
      console.log('Erro dados físicos:', physicalError);

      // Verificar pesagens
      const { data: measurements, error: measurementsError } = await supabase
        .from('weight_measurements')
        .select('*')
        .eq('user_id', user.id)
        .order('measurement_date', { ascending: false });

      console.log('Pesagens:', measurements);
      console.log('Erro pesagens:', measurementsError);

      // Verificar metas
      const { data: goals, error: goalsError } = await supabase
        .from('user_goals')
        .select('*')
        .eq('user_id', user.id);

      console.log('Metas:', goals);
      console.log('Erro metas:', goalsError);

      // Verificar análises semanais
      const { data: weeklyAnalyses, error: weeklyError } = await supabase
        .from('weekly_analyses')
        .select('id, user_id, week_start_date, week_end_date, summary_data, insights, recommendations, overall_score, created_at')
        .order('week_start_date', { ascending: false });

      console.log('Análises semanais:', weeklyAnalyses);
      console.log('Erro análises semanais:', weeklyError);

      setData({
        user: user.id,
        physicalData,
        measurements,
        goals,
        weeklyAnalyses,
        errors: {
          physical: physicalError,
          measurements: measurementsError,
          goals: goalsError,
          weekly: weeklyError
        }
      });

      toast({
        title: "Debug Concluído",
        description: "Verifique o console para detalhes",
      });

    } catch (error) {
      console.error('Erro no debug:', error);
      toast({
        title: "Erro",
        description: "Erro ao verificar dados",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createTestData = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Erro",
          description: "Usuário não autenticado",
          variant: "destructive"
        });
        return;
      }

      // Criar dados físicos
      const { data: physicalData, error: physicalError } = await supabase
        .from('user_physical_data')
        .upsert({
          user_id: user.id,
          altura_cm: 175,
          idade: 30,
          sexo: 'masculino',
          nivel_atividade: 'moderado'
        })
        .select()
        .single();

      if (physicalError) {
        console.error('Erro ao criar dados físicos:', physicalError);
        throw physicalError;
      }

      // Criar meta
      const { error: goalError } = await supabase
        .from('user_goals')
        .upsert({
          user_id: user.id,
          title: 'Meta de Peso',
          description: 'Atingir peso ideal',
          category: 'saude',
          target_value: 75,
          unit: 'kg',
          difficulty: 'medio',
          status: 'aprovada'
        });

      if (goalError) {
        console.error('Erro ao criar meta:', goalError);
        throw goalError;
      }

      // Criar pesagem de teste
      const { data: measurement, error: measurementError } = await supabase
        .from('weight_measurements')
        .insert({
          user_id: user.id,
          peso_kg: 80.5,
          gordura_corporal_percent: 20.5,
          massa_muscular_kg: 35.2,
          agua_corporal_percent: 60.5,
          osso_kg: 3.2,
          gordura_visceral: 8,
          metabolismo_basal_kcal: 1800,
          idade_metabolica: 28,
          circunferencia_abdominal_cm: 85.5,
          device_type: 'manual',
          notes: 'Dados de teste',
          measurement_date: new Date().toISOString()
        })
        .select()
        .single();

      if (measurementError) {
        console.error('Erro ao criar pesagem:', measurementError);
        throw measurementError;
      }

      console.log('Dados de teste criados com sucesso!');
      console.log('Dados físicos:', physicalData);
      console.log('Pesagem:', measurement);

      toast({
        title: "Sucesso!",
        description: "Dados de teste criados com sucesso!",
      });

      // Recarregar dados
      await checkAllData();

    } catch (error) {
      console.error('Erro ao criar dados de teste:', error);
      toast({
        title: "Erro",
        description: "Erro ao criar dados de teste",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Debug de Dados</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-4">
          <Button onClick={checkAllData} disabled={loading}>
            {loading ? 'Verificando...' : 'Verificar Dados'}
          </Button>
          <Button onClick={createTestData} disabled={loading} variant="outline">
            {loading ? 'Criando...' : 'Criar Dados de Teste'}
          </Button>
        </div>

        {data && (
          <div className="space-y-4">
            <h3 className="font-semibold">Resumo dos Dados:</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <strong>Dados Físicos:</strong> {data.physicalData?.length || 0}
              </div>
              <div>
                <strong>Pesagens:</strong> {data.measurements?.length || 0}
              </div>
              <div>
                <strong>Metas:</strong> {data.goals?.length || 0}
              </div>
              <div>
                <strong>Análises Semanais:</strong> {data.weeklyAnalyses?.length || 0}
              </div>
            </div>

            {Object.entries(data.errors).some(([key, error]) => error) && (
              <div className="mt-4">
                <h4 className="font-semibold text-red-500">Erros:</h4>
                {Object.entries(data.errors).map(([key, error]) => 
                  error && (
                    <div key={key} className="text-red-500 text-sm">
                      {key}: {JSON.stringify(error)}
                    </div>
                  )
                )}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DebugData; 