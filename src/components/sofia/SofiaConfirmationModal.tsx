import React, { useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Check, X, Edit2, Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface FoodItem {
  name: string;
  quantity: number;
  unit: string;
}

interface SofiaConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  analysisId: string;
  detectedFoods: string[] | Array<{nome: string, quantidade: number}>;
  userName: string;
  userId: string;
  onConfirmation: (response: string, calories?: number) => void;
}

const SofiaConfirmationModal: React.FC<SofiaConfirmationModalProps> = ({
  isOpen,
  onClose,
  analysisId,
  detectedFoods,
  userName,
  userId,
  onConfirmation
}) => {
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  
  // --- Pré-processamento/normalização dos alimentos detectados ---
  const normalizedInitialItems: FoodItem[] = useMemo(() => {
    const toArray = (detectedFoods || []).map((food) => {
      if (typeof food === 'object' && 'nome' in food) {
        return { name: String((food as any).nome), quantity: Number((food as any).quantidade) || undefined } as { name: string; quantity?: number };
      }
      return { name: String(food) } as { name: string; quantity?: number };
    });

    const removeAccents = (s: string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const baseNormalize = (s: string) => removeAccents(s).toLowerCase().trim();
    
    // Palavras-chave para agrupar como "Salada"
    const SALAD_WORDS = new Set([
      'salada','alface','tomate','rucula','rúcula','pepino','cenoura','agrião','agriao','mix de folhas','folhas','verdura','legumes'
    ]);
    
    // Condimentos/temperos para ignorar
    const IGNORE_WORDS = new Set([
      'sal','pimenta','tempero','ervas','oregano','orégano','alho','cebolinha','salsa','vinagre','vinagrete','molho','azeite'
    ]);
    
    // Regras de canônico (quase duplicados → um único nome)
    const CANONICAL_RULES: Array<{ test: RegExp; name: string }> = [
      { test: /(frango)/, name: 'Frango' },
      { test: /(bife|carne bovina|carne|contra-file|contrafile|alcatra|carne de panela|carne grelhada)/, name: 'Carne bovina' },
      { test: /(porco|lombo|pernil)/, name: 'Carne suína' },
      { test: /(peixe|tilapia|salm(o|ã)0|salmao)/, name: 'Peixe' },
      { test: /(arroz integral)/, name: 'Arroz integral' },
      { test: /(arroz branco|arroz)/, name: 'Arroz branco' },
      { test: /(feij(ao|ão))/, name: 'Feijão' },
      { test: /(batata frita)/, name: 'Batata frita' },
      { test: /(batata|mandioca|inhame)/, name: 'Batata' },
      { test: /(ovo|omelete)/, name: 'Ovo' },
      { test: /(pao|pão|torrada|pita|wrap)/, name: 'Pão' },
    ];

    const resultMap = new Map<string, { quantity?: number; unit: string }>();
    let hasSalad = false;

    for (const item of toArray) {
      const raw = item.name;
      const norm = baseNormalize(raw);

      // Ignorar condimentos mínimos
      if ([...IGNORE_WORDS].some(w => norm.includes(w))) continue;

      // Agrupar componentes salada
      if ([...SALAD_WORDS].some(w => norm.includes(w))) {
        hasSalad = true;
        continue;
      }

      // Encontrar canônico
      let canonical = raw.trim();
      const clean = norm.replace(/grelhado|assado|cozido|de panela|bovina|suina|suína|frita|cozida|grellhado/g, '').trim();
      for (const rule of CANONICAL_RULES) {
        if (rule.test.test(clean)) {
          canonical = rule.name;
          break;
        }
      }

      // MODO ESTRITO: não preencher quantidade por padrão; exigir confirmação do usuário
      const chosenQuantity = (typeof item.quantity === 'number' && item.quantity > 0)
        ? item.quantity
        : undefined;
      const unit = getUnit(canonical);

      if (!resultMap.has(canonical)) {
        resultMap.set(canonical, { quantity: chosenQuantity, unit });
      } else {
        // Se já existe, mantém a maior quantidade explícita
        const prev = resultMap.get(canonical)!;
        const nextQty = Math.max(prev.quantity || 0, chosenQuantity || 0) || chosenQuantity;
        resultMap.set(canonical, { quantity: nextQty, unit: prev.unit });
      }
    }

    if (hasSalad) {
      // Padrão solicitado: salada = 50g se IA não estimar
      resultMap.set('Salada', { quantity: 50, unit: 'g' });
    }

    // Converte para array ordenado por nome para estabilidade
    return Array.from(resultMap.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([name, v]) => ({ name, quantity: v.quantity ?? undefined, unit: v.unit }));
  }, [detectedFoods]);

  const [foodItems, setFoodItems] = useState<FoodItem[]>(normalizedInitialItems);
  // Sincronizar quando os itens detectados chegarem após abrir o modal
  React.useEffect(() => {
    setFoodItems(normalizedInitialItems);
  }, [normalizedInitialItems]);
  const [addName, setAddName] = useState('');
  const [addQty, setAddQty] = useState<string>('');
  const [addUnit, setAddUnit] = useState<'g' | 'ml'>('g');

  const canonicalizeName = (rawName: string): string | null => {
    const removeAccents = (s: string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const baseNormalize = (s: string) => removeAccents(s).toLowerCase().trim();
    const SALAD_WORDS = ['salada','alface','tomate','rucula','rúcula','pepino','cenoura','agrião','agriao','folhas','verdura','legumes'];
    const IGNORE_WORDS = ['sal','pimenta','tempero','ervas','oregano','orégano','alho','cebolinha','salsa','vinagre','vinagrete','molho','azeite'];
    const norm = baseNormalize(rawName);
    if (IGNORE_WORDS.some(w => norm.includes(w))) return null;
    if (SALAD_WORDS.some(w => norm.includes(w))) return 'Salada';
    const CANONICAL_RULES: Array<{ test: RegExp; name: string }> = [
      { test: /(frango)/, name: 'Frango' },
      { test: /(bife|carne bovina|carne|contra-file|contrafile|alcatra|carne de panela|carne grelhada)/, name: 'Carne bovina' },
      { test: /(porco|lombo|pernil)/, name: 'Carne suína' },
      { test: /(peixe|tilapia|salm(o|ã)o|salm[aã]o)/, name: 'Peixe' },
      { test: /(arroz integral)/, name: 'Arroz integral' },
      { test: /(arroz branco|arroz)/, name: 'Arroz branco' },
      { test: /(feij(ao|ão))/, name: 'Feijão' },
      { test: /(batata frita)/, name: 'Batata frita' },
      { test: /(batata|mandioca|inhame)/, name: 'Batata' },
      { test: /(ovo|omelete)/, name: 'Ovo' },
      { test: /(pao|pão|torrada|pita|wrap)/, name: 'Pão' },
    ];
    const clean = norm.replace(/grelhado|assado|cozido|de panela|bovina|suina|suína|frita|cozida|grellhado/g, '').trim();
    for (const rule of CANONICAL_RULES) {
      if (rule.test.test(clean)) return rule.name;
    }
    return rawName.trim();
  };

  const handleAddCustomItem = () => {
    const name = canonicalizeName(addName.trim());
    if (!name) {
      setAddName('');
      setAddQty('');
      return;
    }
    if (addQty === '') {
      toast.info('Informe a quantidade (g ou ml) para adicionar o item.');
      return;
    }
    const quantity = Math.max(0, Number(addQty));
    const unit = addUnit || getUnit(name);
    setFoodItems(prev => {
      const existsIndex = prev.findIndex(i => i.name.toLowerCase() === name.toLowerCase());
      if (existsIndex >= 0) {
        const updated = [...prev];
        updated[existsIndex] = { ...updated[existsIndex], quantity: Math.max(updated[existsIndex].quantity, quantity), unit };
        return updated;
      }
      return [...prev, { name, quantity, unit }];
    });
    setAddName('');
    setAddQty('');
  };
  const [newFood, setNewFood] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Função para estimar quantidade baseada no alimento
  function getEstimatedQuantity(food: string): number {
    const foodLower = food.toLowerCase();
    
    // Líquidos - estimativas em ml
    if (foodLower.includes('suco') || foodLower.includes('água') || 
        foodLower.includes('leite') || foodLower.includes('café') ||
        foodLower.includes('chá') || foodLower.includes('refrigerante')) {
      return 200;
    }
    
    // Carnes e proteínas
    if (foodLower.includes('frango') || foodLower.includes('carne') ||
        foodLower.includes('peixe') || foodLower.includes('porco') ||
        foodLower.includes('bife')) {
      return 100;
    }
    
    // Cereais e grãos
    if (foodLower.includes('arroz') || foodLower.includes('macarrão') ||
        foodLower.includes('massa') || foodLower.includes('quinoa')) {
      return 120;
    }
    
    // Leguminosas
    if (foodLower.includes('feijão') || foodLower.includes('lentilha') ||
        foodLower.includes('grão') || foodLower.includes('ervilha')) {
      return 90;
    }
    
    // Verduras e legumes
    if (foodLower.includes('salada') || foodLower.includes('alface') ||
        foodLower.includes('tomate') || foodLower.includes('cenoura') ||
        foodLower.includes('brócolis')) {
      return 80;
    }
    
    // Frutas
    if (foodLower.includes('banana') || foodLower.includes('maçã') ||
        foodLower.includes('laranja') || foodLower.includes('fruta')) {
      return 150;
    }
    
    // Batata e tubérculos
    if (foodLower.includes('batata') || foodLower.includes('mandioca') ||
        foodLower.includes('inhame')) {
      return 100;
    }
    
    // Pães e similares
    if (foodLower.includes('pão') || foodLower.includes('torrada') ||
        foodLower.includes('biscoito')) {
      return 50;
    }
    
    // Default para sólidos
    return 100;
  }

  // Função para determinar a unidade baseada no alimento
  function getUnit(food: string): string {
    const foodLower = food.toLowerCase();
    
    // Líquidos usam ml
    if (foodLower.includes('suco') || foodLower.includes('água') || 
        foodLower.includes('leite') || foodLower.includes('café') ||
        foodLower.includes('chá') || foodLower.includes('refrigerante')) {
      return 'ml';
    }
    
    // Sólidos usam g
    return 'g';
  }

  const handleAddFood = () => {
    if (newFood.trim()) {
      const newItem: FoodItem = {
        name: newFood.trim(),
        quantity: 0,
        unit: getUnit(newFood.trim())
      };
      setFoodItems([...foodItems, newItem]);
      setNewFood('');
    }
  };

  const handleRemoveFood = (index: number) => {
    setFoodItems(foodItems.filter((_, i) => i !== index));
  };

  const handleQuantityChange = (index: number, newQuantity: string) => {
    const quantity = parseFloat(newQuantity) || 0;
    if (quantity >= 0) {
      setFoodItems(prev => prev.map((item, i) => 
        i === index ? { ...item, quantity } : item
      ));
    }
  };

  function getLiquidDensity(name: string): number {
    const s = (name || '').toLowerCase();
    if (s.includes('leite')) return 1.03;
    if (s.includes('suco')) return 1.04;
    if (s.includes('café') || s.includes('cafe') || s.includes('chá') || s.includes('cha') || s.includes('água') || s.includes('agua') || s.includes('refrigerante')) return 1.0;
    return 1.0; // padrão
  }

  const handleConfirm = async (confirmed: boolean) => {
    setIsLoading(true);
    
    try {
      // Exigir que todas as quantidades estejam preenchidas (>0)
      const allFilled = foodItems.every(i => Number(i.quantity) > 0);
      if (!allFilled) {
        setIsLoading(false);
        toast.warning('Preencha as gramas/ml de todos os alimentos do seu prato.');
        return;
      }
      const requestBody = {
        analysisId,
        confirmed: confirmed && isCorrect !== false,
        userId,
        userCorrections: {
          alimentos: foodItems.map(item => item.name),
          quantities: foodItems.reduce((acc, item, index) => {
            acc[item.name] = { quantity: item.quantity, unit: item.unit };
            return acc;
          }, {} as Record<string, { quantity: number; unit: string }>)
        }
      };

      console.log('🔄 Enviando confirmação:', requestBody);

      const { data, error } = await supabase.functions.invoke('sofia-deterministic', {
        body: {
          detected_foods: foodItems.map(item => {
            const raw = (item.name || '').trim();
            const backendName = raw.toLowerCase() === 'salada' ? 'salada' : raw;
            const grams = item.unit === 'g' ? item.quantity : Math.round(Number(item.quantity) * getLiquidDensity(raw));
            return { name: backendName, grams };
          }),
          user_id: userId,
          analysis_type: 'nutritional_sum'
        }
      });

      if (error) {
        console.error('❌ Erro na confirmação:', error);
        toast.error('Erro ao processar confirmação');
        return;
      }

      console.log('✅ Confirmação processada:', data);

      if (data.success) {
        // Use the standardized Sofia response from deterministic calculation
        const nutrition = data.nutrition_data;
        const message = data.sofia_response || generateStandardResponse(nutrition);
        const calories = nutrition?.total_kcal || 0;

        onConfirmation(message, calories);
        toast.success('✅ Análise confirmada pela Sofia!');
        onClose();
      } else {
        toast.error('Erro na confirmação');
      }
    } catch (error) {
      console.error('❌ Erro geral:', error);
      toast.error('Erro ao processar confirmação');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="text-lg">🤔</span>
            Confirmação da Sofia
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-3">
              Oi {userName}! Identifiquei estes alimentos:
            </p>
          </div>

          <Card>
            <CardContent className="p-3 space-y-3">
              {foodItems.map((item, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <Badge variant="secondary" className="flex-1 justify-start min-w-0">
                      • {item.name}
                    </Badge>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <Input
                        type="number"
                        value={item.quantity || ''}
                        onChange={(e) => handleQuantityChange(index, e.target.value)}
                        placeholder={item.quantity ? '' : 'Digite a quantidade'}
                        className="w-16 h-8 text-xs text-center"
                        min="0"
                        step="0.1"
                      />
                      <span className="text-xs text-gray-500 min-w-[20px]">
                        {item.unit}
                      </span>
                    </div>
                    {isCorrect === false && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveFood(index)}
                        className="h-6 w-6 p-0"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                  {/* Chips de sugestão rápida */}
                  <div className="flex flex-wrap gap-1 pl-2">
                    {(['g','ml'].includes(item.unit) ? (item.unit === 'g' ? [30,50,80,100,150] : [50,100,150,200,250]) : []).map((v) => (
                      <Button
                        key={v}
                        variant="outline"
                        size="sm"
                        className="h-6 px-2 text-[10px]"
                        onClick={() => handleQuantityChange(index, String(v))}
                      >
                        {v}{item.unit}
                      </Button>
                    ))}
                  </div>
                </div>
              ))}
              {/* Adicionar item (sempre disponível antes de confirmar) */}
              <div className="mt-2 rounded-md border border-emerald-200 bg-emerald-50 p-2">
                <div className="mb-1 text-xs text-emerald-800">Adicionar item</div>
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="Alimento"
                    value={addName}
                    onChange={(e) => setAddName(e.target.value)}
                    className="text-sm"
                  />
                  <Input
                    type="number"
                    placeholder="Qtd"
                    value={addQty}
                    onChange={(e) => setAddQty(e.target.value)}
                    className="w-20 text-sm text-center"
                    min="0"
                    step="0.1"
                  />
                  <Select value={addUnit} onValueChange={(v: 'g' | 'ml') => setAddUnit(v)}>
                    <SelectTrigger className="w-20 h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="g">g</SelectItem>
                      <SelectItem value="ml">ml</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button size="sm" onClick={handleAddCustomItem} className="h-8 px-3">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              {isCorrect === false && (
                <div className="flex gap-2 mt-3">
                  <Input
                    placeholder="Adicionar alimento..."
                    value={newFood}
                    onChange={(e) => setNewFood(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddFood()}
                    className="text-sm"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleAddFood}
                    className="px-2"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="text-center">
            <p className="text-sm font-medium mb-3">
              Esses alimentos estão corretos?
            </p>
            
            <div className="flex gap-3 justify-center">
              <Button
                onClick={() => {
                  setIsCorrect(true);
                  handleConfirm(true);
                }}
                disabled={isLoading}
                className="bg-green-500 hover:bg-green-600 text-white flex items-center gap-2"
              >
                <Check className="h-4 w-4" />
                ✅ Está certo
              </Button>
              
              <Button
                onClick={() => {
                  if (isCorrect === false) {
                    handleConfirm(false);
                  } else {
                    setIsCorrect(false);
                  }
                }}
                disabled={isLoading}
                variant="outline"
                className="border-red-200 text-red-600 hover:bg-red-50 flex items-center gap-2"
              >
                {isCorrect === false ? (
                  <>
                    <Check className="h-4 w-4" />
                    Confirmar correções
                  </>
                ) : (
                  <>
                    <Edit2 className="h-4 w-4" />
                    ❌ Está errado
                  </>
                )}
              </Button>
            </div>
          </div>

          {isCorrect === false && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-xs text-yellow-800 text-center">
                💡 Edite a lista acima removendo alimentos incorretos ou adicionando os que faltam
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Standard response generator for consistency
function generateStandardResponse(nutrition: any): string {
  if (!nutrition) return 'Análise nutricional concluída.';
  
  return `💪 Proteínas: ${(nutrition.total_proteina || 0).toFixed(1)} g
🍞 Carboidratos: ${(nutrition.total_carbo || 0).toFixed(1)} g
🥑 Gorduras: ${(nutrition.total_gordura || 0).toFixed(1)} g
🔥 Estimativa calórica: ${Math.round(nutrition.total_kcal || 0)} kcal

✅ Obrigado! Seus dados estão salvos.`;
}

export default SofiaConfirmationModal;