import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Sparkles, ChefHat } from 'lucide-react';
import { generateDetailedInstructions, OllamaDetailedInstructionsParams } from '@/utils/ollamaMealPlanGenerator';
import { toast } from 'sonner';

interface DetailedInstructionsButtonProps {
  recipeName: string;
  ingredients: string;
  basicInstructions: string;
  prepTime: string;
  cookTime: string;
  mealType: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  onInstructionsGenerated: (detailedInstructions: string) => void;
}

export const DetailedInstructionsButton: React.FC<DetailedInstructionsButtonProps> = ({
  recipeName,
  ingredients,
  basicInstructions,
  prepTime,
  cookTime,
  mealType,
  calories,
  protein,
  carbs,
  fat,
  onInstructionsGenerated
}) => {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateDetailedInstructions = async () => {
    setIsGenerating(true);
    
    try {
      const params: OllamaDetailedInstructionsParams = {
        recipeName,
        ingredients,
        basicInstructions,
        prepTime,
        cookTime,
        mealType,
        calories,
        protein,
        carbs,
        fat
      };

      const detailedInstructions = await generateDetailedInstructions(params);
      
      if (detailedInstructions && detailedInstructions !== basicInstructions) {
        onInstructionsGenerated(detailedInstructions);
        toast.success('Instruções detalhadas geradas com sucesso!');
      } else {
        toast.error('Não foi possível gerar instruções detalhadas');
      }
      
    } catch (error) {
      console.error('❌ Erro ao gerar instruções detalhadas:', error);
      toast.error('Erro ao gerar instruções detalhadas');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button
      onClick={handleGenerateDetailedInstructions}
      disabled={isGenerating}
      variant="outline"
      size="sm"
      className="gap-2 hover:bg-gradient-to-r hover:from-purple-50 hover:to-blue-50 hover:border-purple-300"
    >
      {isGenerating ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          Detalhando...
        </>
      ) : (
        <>
          <Sparkles className="w-4 h-4" />
          Detalhar com IA
        </>
      )}
    </Button>
  );
};
