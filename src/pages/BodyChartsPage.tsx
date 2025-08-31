import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BodyChart, BodyCompositionChart, BodyTrendChart } from '@/components/ui/body-chart';

const BodyChartsPage: React.FC = () => {
  // Dados de exemplo para o gráfico principal
  const bodyData = {
    imc: 33.9,
    idade: 43,
    tmb: 1459,
    peso: 90.1,
    altura: 163,
    circunferencia: 99.0
  };

  // Dados de exemplo para composição corporal
  const compositionData = {
    gordura: 44.1,
    musculo: 24.0,
    agua: 39.9,
    osso: 15.0
  };

  // Dados de exemplo para evolução temporal com dia e hora
  const trendData = [
    { date: '15/01', time: '08:30', value: 88.5, type: 'peso' as const },
    { date: '22/01', time: '09:15', value: 89.2, type: 'peso' as const },
    { date: '29/01', time: '08:45', value: 89.8, type: 'peso' as const },
    { date: '05/02', time: '09:00', value: 90.3, type: 'peso' as const },
    { date: '12/02', time: '08:30', value: 90.1, type: 'peso' as const }
  ];

  const imcTrendData = [
    { date: '15/01', time: '08:30', value: 33.2, type: 'imc' as const },
    { date: '22/01', time: '09:15', value: 33.5, type: 'imc' as const },
    { date: '29/01', time: '08:45', value: 33.8, type: 'imc' as const },
    { date: '05/02', time: '09:00', value: 34.1, type: 'imc' as const },
    { date: '12/02', time: '08:30', value: 33.9, type: 'imc' as const }
  ];

  const gorduraTrendData = [
    { date: '15/01', time: '08:30', value: 42.1, type: 'gordura' as const },
    { date: '22/01', time: '09:15', value: 42.8, type: 'gordura' as const },
    { date: '29/01', time: '08:45', value: 43.2, type: 'gordura' as const },
    { date: '05/02', time: '09:00', value: 43.8, type: 'gordura' as const },
    { date: '12/02', time: '08:30', value: 44.1, type: 'gordura' as const }
  ];

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Gráficos Dentro do Corpo
          </h1>
          <p className="text-muted-foreground text-lg">
            Visualização inovadora de dados de saúde representados dentro de silhuetas humanas, 
            criando uma experiência mais intuitiva e personalizada.
          </p>
        </div>

        {/* Gráfico Principal - Como na imagem */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h3 className="text-xl font-semibold mb-4">Gráfico Principal - Peso, Altura e TMB</h3>
            <BodyChart
              title="Peso, Altura e TMB"
              data={bodyData}
              showRisk={true}
              showSymptoms={true}
            />
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-4">Composição Corporal</h3>
            <BodyCompositionChart
              data={compositionData}
            />
          </div>
        </div>

        {/* Gráficos de Evolução */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div>
            <h3 className="text-xl font-semibold mb-4">Evolução do Peso</h3>
            <BodyTrendChart
              data={trendData}
            />
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-4">Evolução do IMC</h3>
            <BodyTrendChart
              data={imcTrendData}
            />
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-4">Evolução da Gordura Corporal</h3>
            <BodyTrendChart
              data={gorduraTrendData}
            />
          </div>
        </div>

        {/* Características dos Gráficos */}
        <Card>
          <CardHeader>
            <CardTitle>Características dos Gráficos Dentro do Corpo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">🎯 Visualização Intuitiva</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Dados representados dentro da silhueta humana</li>
                  <li>• Fácil compreensão da localização dos dados</li>
                  <li>• Conexão visual entre dados e corpo</li>
                  <li>• Medidas posicionadas corretamente</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">🎨 Design Moderno</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Tema escuro profissional</li>
                  <li>• Cores contrastantes e legíveis</li>
                  <li>• Interface limpa e organizada</li>
                  <li>• Gradientes coloridos para composição</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">📊 Dados Contextuais</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Linhas de referência na silhueta</li>
                  <li>• Informações complementares</li>
                  <li>• Botões de ação integrados</li>
                  <li>• Status de saúde em tempo real</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Como Implementar */}
        <Card>
          <CardHeader>
            <CardTitle>Como Implementar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">1. Importar Componentes</h3>
                <pre className="bg-muted p-3 rounded text-sm overflow-x-auto">
{`import { BodyChart, BodyCompositionChart, BodyTrendChart } from '@/components/ui/body-chart';`}
                </pre>
              </div>

              <div>
                <h3 className="font-semibold mb-2">2. Preparar Dados</h3>
                <pre className="bg-muted p-3 rounded text-sm overflow-x-auto">
{`const bodyData = {
  imc: 33.9,
  idade: 43,
  tmb: 1459,
  peso: 90.1,
  altura: 163,
  circunferencia: 99.0
};`}
                </pre>
              </div>

              <div>
                <h3 className="font-semibold mb-2">3. Usar Componente</h3>
                <pre className="bg-muted p-3 rounded text-sm overflow-x-auto">
{`<BodyChart 
  title="Peso, Altura e TMB" 
  data={bodyData} 
  showRisk={true} 
  showSymptoms={true} 
/>`}
                </pre>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Vantagens */}
        <Card>
          <CardHeader>
            <CardTitle>Vantagens dos Gráficos Dentro do Corpo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold">✅ Experiência Personalizada</h3>
                  <p className="text-sm text-muted-foreground">
                    Os dados são representados dentro de uma silhueta humana, criando uma conexão emocional e personalizada com o usuário.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold">✅ Compreensão Intuitiva</h3>
                  <p className="text-sm text-muted-foreground">
                    A localização dos dados dentro da silhueta facilita a compreensão da relação entre as medidas e o corpo.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold">✅ Design Inovador</h3>
                  <p className="text-sm text-muted-foreground">
                    Interface moderna com tema escuro e cores contrastantes, criando uma experiência visual única.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold">✅ Dados Contextuais</h3>
                  <p className="text-sm text-muted-foreground">
                    Medidas posicionadas corretamente na silhueta, com linhas de referência e informações complementares.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold">✅ Interatividade</h3>
                  <p className="text-sm text-muted-foreground">
                    Botões de ação integrados para análise de risco, sintomas e outras funcionalidades de saúde.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold">✅ Flexibilidade</h3>
                  <p className="text-sm text-muted-foreground">
                    Múltiplos tipos de gráficos (composição, tendências, medidas) que podem ser facilmente personalizados.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BodyChartsPage; 