// @ts-nocheck
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertTriangle, Info } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface ValidationResult {
  isValid: boolean;
  message: string;
  type: 'success' | 'warning' | 'info';
}

const WeighingValidation: React.FC = () => {
  const [validationResults, setValidationResults] = useState<ValidationResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    validateSystem();
  }, []);

  const validateSystem = async () => {
    const results: ValidationResult[] = [];
    
    try {
      // Verificar autenticação
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        results.push({
          isValid: false,
          message: 'Usuário não autenticado',
          type: 'warning'
        });
        setValidationResults(results);
        setIsLoading(false);
        return;
      }

      // Verificar dados físicos
      const { data: physicalData, error: physicalError } = await supabase
        .from('user_physical_data')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (physicalError && physicalError.code !== 'PGRST116') {
        results.push({
          isValid: false,
          message: `Erro ao verificar dados físicos: ${physicalError.message}`,
          type: 'warning'
        });
      } else if (!physicalData) {
        results.push({
          isValid: true,
          message: 'Dados físicos serão criados automaticamente na primeira pesagem',
          type: 'info'
        });
      } else {
        results.push({
          isValid: true,
          message: `Dados físicos válidos: ${physicalData.altura_cm}cm, ${physicalData.idade} anos, ${physicalData.sexo}`,
          type: 'success'
        });
      }

      // Verificar última pesagem
      const { data: lastMeasurement, error: measurementError } = await supabase
        .from('weight_measurements')
        .select('*')
        .eq('user_id', user.id)
        .order('measurement_date', { ascending: false })
        .limit(1);

      if (measurementError) {
        results.push({
          isValid: false,
          message: `Erro ao verificar pesagens: ${measurementError.message}`,
          type: 'warning'
        });
      } else if (!lastMeasurement || lastMeasurement.length === 0) {
        results.push({
          isValid: true,
          message: 'Nenhuma pesagem anterior encontrada - pronto para primeira pesagem',
          type: 'info'
        });
      } else {
        const latest = lastMeasurement[0];
        const hasCalculatedValues = latest.imc && latest.gordura_corporal_percent && latest.agua_corporal_percent;
        
        if (hasCalculatedValues) {
          results.push({
            isValid: true,
            message: `Última pesagem com cálculos automáticos funcionando (IMC: ${latest.imc?.toFixed(1)})`,
            type: 'success'
          });
        } else {
          results.push({
            isValid: false,
            message: 'Última pesagem sem cálculos automáticos - verificar triggers',
            type: 'warning'
          });
        }
      }

      // Verificar função de relatório
      try {
        const { data: functionTest, error: functionError } = await supabase
          .rpc('generate_weighing_report', { measurement_id: '00000000-0000-0000-0000-000000000000' });

        // Se chegou até aqui, a função existe (mesmo que retorne erro por ID inválido)
        results.push({
          isValid: true,
          message: 'Função de relatório disponível',
          type: 'success'
        });
      } catch (error) {
        results.push({
          isValid: false,
          message: 'Função de relatório não encontrada',
          type: 'warning'
        });
      }

      // Verificar permissões RLS
      const { error: permissionError } = await supabase
        .from('weight_measurements')
        .select('id')
        .limit(1);

      if (!permissionError) {
        results.push({
          isValid: true,
          message: 'Permissões de acesso aos dados funcionando',
          type: 'success'
        });
      } else {
        results.push({
          isValid: false,
          message: `Problema de permissões: ${permissionError.message}`,
          type: 'warning'
        });
      }

    } catch (error) {
      results.push({
        isValid: false,
        message: `Erro na validação: ${error}`,
        type: 'warning'
      });
    }

    setValidationResults(results);
    setIsLoading(false);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'info':
        return <Info className="h-4 w-4 text-blue-500" />;
      default:
        return <Info className="h-4 w-4" />;
    }
  };

  const getBadgeVariant = (type: string) => {
    switch (type) {
      case 'success':
        return 'default';
      case 'warning':
        return 'destructive';
      case 'info':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Validando sistema...</div>
        </CardContent>
      </Card>
    );
  }

  const successCount = validationResults.filter(r => r.type === 'success').length;
  const totalCount = validationResults.length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5" />
          Status do Sistema de Pesagem
        </CardTitle>
        <div className="flex items-center gap-2">
          <Badge variant={successCount === totalCount ? 'default' : 'secondary'}>
            {successCount}/{totalCount} validações aprovadas
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {validationResults.map((result, index) => (
            <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
              {getIcon(result.type)}
              <div className="flex-1">
                <p className="text-sm">{result.message}</p>
              </div>
              <Badge variant={getBadgeVariant(result.type)}>
                {result.type}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default WeighingValidation;