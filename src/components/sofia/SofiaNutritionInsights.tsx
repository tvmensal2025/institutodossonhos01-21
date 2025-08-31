import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lightbulb, RefreshCw, Pill, Salad } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useSofiaAnalysis } from '@/hooks/useSofiaAnalysis';

export const SofiaNutritionInsights: React.FC = () => {
  const { isAnalyzing, currentAnalysis, performAnalysis } = useSofiaAnalysis();

  const loadInsights = async () => {
    const { data: auth } = await supabase.auth.getUser();
    const uid = auth.user?.id;
    if (!uid) return;
    await performAnalysis(uid, 'complete');
  };

  useEffect(() => {
    loadInsights();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const supplementKeywords = ['suplement', 'vitamina', 'vitamin', 'miner', 'ômega', 'omega', 'magnésio', 'zinco', 'ferro', 'creatina', 'whey'];
  const foodKeywords = ['alimenta', 'refei', 'comer', 'ingira', 'prato', 'dieta'];

  const recommendations = currentAnalysis?.recommendations || [];
  const tips = currentAnalysis?.personalized_tips || [];

  const supplementRecs = recommendations.filter(r =>
    supplementKeywords.some(k => r.toLowerCase().includes(k))
  );

  const foodSuggestions = [
    ...tips,
    ...recommendations.filter(r => foodKeywords.some(k => r.toLowerCase().includes(k)))
  ];

  return (
    <Card className="bg-white shadow-sm border-0">
      <CardHeader className="flex items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-emerald-600" />
          Insights da Sofia
        </CardTitle>
        <Button size="sm" variant="outline" onClick={loadInsights} disabled={isAnalyzing}>
          <RefreshCw className={`w-4 h-4 mr-2 ${isAnalyzing ? 'animate-spin' : ''}`} />
          {isAnalyzing ? 'Gerando...' : 'Regerar'}
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        {currentAnalysis ? (
          <div className="space-y-6">
            {currentAnalysis.insights?.length > 0 && (
              <section>
                <h3 className="text-sm font-semibold text-gray-900 mb-2">Principais insights</h3>
                <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
                  {currentAnalysis.insights.slice(0, 6).map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </section>
            )}

            <section>
              <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-2">
                <Pill className="w-4 h-4 text-emerald-600" /> Recomendações de suplementos
              </h3>
              {supplementRecs.length > 0 ? (
                <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
                  {supplementRecs.map((rec, i) => (
                    <li key={i}>{rec}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">Nenhuma recomendação de suplemento no momento.</p>
              )}
            </section>

            <section>
              <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-2">
                <Salad className="w-4 h-4 text-emerald-600" /> Sugestões de alimentação
              </h3>
              {foodSuggestions.length > 0 ? (
                <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
                  {foodSuggestions.slice(0, 8).map((rec, i) => (
                    <li key={i}>{rec}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">Sem sugestões no momento — registre suas refeições para análises mais precisas.</p>
              )}
            </section>

            {currentAnalysis.predictions && (
              <section>
                <h3 className="text-sm font-semibold text-gray-900 mb-2">Tendências previstas</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm text-gray-700">
                  <div className="p-3 rounded-md bg-emerald-50/50">
                    <span className="font-medium">Peso:</span> {currentAnalysis.predictions.weight_trend}
                  </div>
                  <div className="p-3 rounded-md bg-emerald-50/50">
                    <span className="font-medium">Energia:</span> {currentAnalysis.predictions.energy_forecast}
                  </div>
                  <div className="p-3 rounded-md bg-emerald-50/50">
                    <span className="font-medium">Metas:</span> {currentAnalysis.predictions.goal_likelihood}
                  </div>
                </div>
              </section>
            )}

            <p className="text-xs text-muted-foreground">
              As recomendações são informativas e não substituem orientação profissional.
            </p>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Sem insights ainda. Clique em Regerar para iniciar uma análise.</p>
        )}
      </CardContent>
    </Card>
  );
};

export default SofiaNutritionInsights;
