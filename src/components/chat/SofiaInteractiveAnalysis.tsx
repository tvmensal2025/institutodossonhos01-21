// @ts-nocheck
import React, { useState } from 'react';
import { Check, X, Edit3, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useSofiaIntegration } from '@/hooks/useSofiaIntegration';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SofiaInteractiveAnalysisProps {
  imageUrl: string;
  detectedFoods: string[];
  analysisData: {
    calorias: number;
    proteinas: string;
    carboidratos: string;
    gorduras: string;
    comentario: string;
  };
  onConfirm: (confirmedFoods: string[]) => void;
  onReject: () => void;
}

export const SofiaInteractiveAnalysis: React.FC<SofiaInteractiveAnalysisProps> = ({
  imageUrl,
  detectedFoods,
  analysisData,
  onConfirm,
  onReject
}) => {
  const [step, setStep] = useState<'detection' | 'manual_options' | 'manual_input' | 'confirmed'>('detection');
  const [manualInput, setManualInput] = useState('');
  const [confirmedFoods, setConfirmedFoods] = useState<string[]>([]);
  const { saveSofiaChatMessage } = useSofiaIntegration();
  const { toast } = useToast();

  const handleConfirmFoods = async (foods: string[]) => {
    setConfirmedFoods(foods);
    setStep('confirmed');

    try {
      // Salvar análise confirmada no banco
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase
        .from('food_analysis')
        .insert({
          user_id: user.id,
          meal_type: 'refeicao',
          image_url: imageUrl,
          food_items: { alimentos: foods },
          nutrition_analysis: {
            calorias: analysisData.calorias,
            proteinas: analysisData.proteinas,
            carboidratos: analysisData.carboidratos,
            gorduras: analysisData.gorduras
          },
          sofia_analysis: {
            mensagem: analysisData.comentario,
            timestamp: new Date().toISOString(),
            imagem_confirmada: true
          },
          analysis_text: 'Análise confirmada pelo usuário'
        });

      // Salvar na conversa do chat
      await saveSofiaChatMessage(
        `✅ Refeição confirmada: ${foods.join(', ')}\n\n🔢 Estimativa nutricional:\n• Calorias: ${analysisData.calorias} kcal\n• Proteínas: ${analysisData.proteinas}\n• Carboidratos: ${analysisData.carboidratos}\n• Gorduras: ${analysisData.gorduras}\n\n💡 ${analysisData.comentario}`,
        { type: 'food_confirmation', confirmed: true }
      );

      onConfirm(foods);
      
      toast({
        title: "Refeição confirmada!",
        description: "Sua análise foi salva no histórico.",
      });
    } catch (error) {
      console.error('Erro ao salvar análise:', error);
      toast({
        title: "Erro ao salvar",
        description: "Houve um problema ao salvar sua análise.",
        variant: "destructive"
      });
    }
  };

  const handleManualOption = (foods: string[]) => {
    handleConfirmFoods(foods);
  };

  const handleManualSubmit = () => {
    if (manualInput.trim()) {
      const foods = manualInput.split(',').map(f => f.trim()).filter(f => f);
      handleConfirmFoods(foods);
    }
  };

  const handleReject = () => {
    setStep('manual_options');
    onReject();
  };

  if (step === 'confirmed') {
    return (
      <Card className="bg-green-50 border-green-200">
        <CardContent className="p-4">
          <div className="text-green-800">
            <h3 className="font-semibold mb-2">✅ Refeição confirmada!</h3>
            <p className="text-sm">
              <strong>Alimentos:</strong> {confirmedFoods.join(', ')}
            </p>
            <p className="text-sm mt-2">
              <strong>Calorias:</strong> {analysisData.calorias} kcal
            </p>
            <p className="text-sm italic mt-2">
              {analysisData.comentario}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (step === 'manual_input') {
    return (
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4 space-y-4">
          <div className="text-blue-800">
            <h3 className="font-semibold mb-2">📝 Digite os alimentos</h3>
            <p className="text-sm mb-3">
              Digite os alimentos presentes na imagem, separados por vírgula:
            </p>
          </div>
          
          <div className="flex space-x-2">
            <Input
              value={manualInput}
              onChange={(e) => setManualInput(e.target.value)}
              placeholder="Ex: Frango grelhado, arroz integral, brócolis"
              className="flex-1"
              onKeyPress={(e) => e.key === 'Enter' && handleManualSubmit()}
            />
            <Button 
              onClick={handleManualSubmit}
              disabled={!manualInput.trim()}
              size="sm"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          
          <Button 
            variant="outline" 
            onClick={() => setStep('manual_options')}
            className="w-full"
          >
            Voltar às opções
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (step === 'manual_options') {
    return (
      <Card className="bg-yellow-50 border-yellow-200">
        <CardContent className="p-4 space-y-4">
          <div className="text-yellow-800">
            <h3 className="font-semibold mb-2">🤔 Tudo bem, isso acontece!</h3>
            <p className="text-sm mb-3">
              Me diga então, o que tem no seu prato?
            </p>
            <p className="text-xs mb-3">
              👇 Ou escolha uma das opções mais comuns parecidas com a imagem:
            </p>
          </div>
          
          <div className="space-y-2">
            <Button 
              variant="outline" 
              onClick={() => handleManualOption(['Frango grelhado', 'Batata doce', 'Salada verde'])}
              className="w-full justify-start text-left"
            >
              🍗 Frango + batata doce + salada
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => handleManualOption(['Macarrão integral', 'Carne moída', 'Legumes refogados'])}
              className="w-full justify-start text-left"
            >
              🍝 Macarrão integral + carne moída + legumes
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => handleManualOption(['Ovos mexidos', 'Pão integral', 'Frutas'])}
              className="w-full justify-start text-left"
            >
              🥚 Ovos mexidos + pão integral + frutas
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => setStep('manual_input')}
              className="w-full justify-start text-left"
            >
              <Edit3 className="h-4 w-4 mr-2" />
              📝 Escrever manualmente
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-blue-50 border-blue-200">
      <CardContent className="p-4 space-y-4">
        <div className="text-blue-800">
          <h3 className="font-semibold mb-2">🍽️ Oi! Já analisei a imagem que você enviou.</h3>
          <p className="text-sm mb-3">
            📷 Aqui está o que identifiquei:
          </p>
          
          <div className="bg-white p-3 rounded-lg mb-3">
            <ul className="text-sm space-y-1">
              {detectedFoods.map((food, index) => (
                <li key={index} className="flex items-center">
                  <span className="text-green-600 mr-2">•</span>
                  {food}
                </li>
              ))}
            </ul>
          </div>
          
          <p className="text-sm font-medium mb-3">
            🔘 Esses alimentos estão corretos?
          </p>
          <p className="text-xs">
            👇 Toque para confirmar ou ajustar:
          </p>
        </div>
        
        <div className="flex space-x-3">
          <Button 
            onClick={() => handleConfirmFoods(detectedFoods)}
            className="flex-1 bg-green-600 hover:bg-green-700"
          >
            <Check className="h-4 w-4 mr-2" />
            ✅ Está certo
          </Button>
          
          <Button 
            variant="destructive"
            onClick={handleReject}
            className="flex-1"
          >
            <X className="h-4 w-4 mr-2" />
            ❌ Está errado
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};