import React, { useMemo, useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import SofiaChat from '@/components/sofia/SofiaChat';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { useToast } from '@/hooks/use-toast';

export type BudgetLevel = 'baixo' | 'médio' | 'alto';

export interface MealItemInput {
  description: string; // o que quer comer
  ingredients: string; // lista separada por vírgula
  restrictions: string; // chips/texto
  prepTimeMin: number; // por refeição
}

export interface MealIngredient { name: string; quantity: number; unit: 'g' | 'ml' | 'un'; }
export interface MealOption { category: 'proteina' | 'carboidrato' | 'vegetal' | 'outros'; name: string; quantity_g?: number; homemade_measure?: string; calories_kcal?: number }
export interface MealEntry { name: string; calories_kcal: number; ingredients: MealIngredient[]; homemade_measure?: string; notes?: string; options?: MealOption[] }
export interface MealPlanGenerated {
  type: 'dia' | 'semana';
  score?: number;
  tags?: string[];
  target_calories_kcal?: number;
  days: Record<string, {
    breakfast?: MealEntry;
    lunch?: MealEntry;
    afternoon_snack?: MealEntry;
    dinner?: MealEntry;
    supper?: MealEntry;
  }>;
}

interface SofiaMealSuggestionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
  onPlanGenerated: (plan: MealPlanGenerated) => void;
  targetCaloriesKcal?: number;
  intakeAnswers?: any;
}

export const SofiaMealSuggestionModal: React.FC<SofiaMealSuggestionModalProps> = ({ open, onOpenChange, user, onPlanGenerated, targetCaloriesKcal, intakeAnswers }) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [legalAccepted, setLegalAccepted] = useState(false);
  // Plano fixo de 1 dia (semana será projetada pela IA a partir do dia)
  const [budget, setBudget] = useState<BudgetLevel>('médio');
  const [maxPrepTime, setMaxPrepTime] = useState<number>(30);
  const [utensils, setUtensils] = useState<string>('');

  const [breakfast, setBreakfast] = useState<MealItemInput>({ description: '', ingredients: '', restrictions: '', prepTimeMin: 10 });
  const [lunch, setLunch] = useState<MealItemInput>({ description: '', ingredients: '', restrictions: '', prepTimeMin: 20 });
  const [afternoonSnack, setAfternoonSnack] = useState<MealItemInput>({ description: '', ingredients: '', restrictions: '', prepTimeMin: 10 });
  const [dinner, setDinner] = useState<MealItemInput>({ description: '', ingredients: '', restrictions: '', prepTimeMin: 20 });
  const [supper, setSupper] = useState<MealItemInput>({ description: '', ingredients: '', restrictions: '', prepTimeMin: 5 });

  const globalContext = useMemo(() => ({ budget, maxPrepTime, utensils }), [budget, maxPrepTime, utensils]);

  // Prefill com respostas do Q&A
  React.useEffect(() => {
    if (!intakeAnswers) return;
    const qna = (intakeAnswers as any).qna || intakeAnswers;
    if (qna?.breakfast?.description) setBreakfast(v => ({ ...v, description: qna.breakfast.description }));
    if (qna?.lunch?.description) setLunch(v => ({ ...v, description: qna.lunch.description }));
    if (qna?.afternoon_snack?.description) setAfternoonSnack(v => ({ ...v, description: qna.afternoon_snack.description }));
    if (qna?.dinner?.description) setDinner(v => ({ ...v, description: qna.dinner.description }));
    if (qna?.supper?.description) setSupper(v => ({ ...v, description: qna.supper.description }));
  }, [intakeAnswers]);

  const buildPrompt = (): string => {
    const obj = {
      context: {
        budget,
        max_prep_time_min: maxPrepTime,
        utensils,
        plan_type: 'dia',
        target_calories_kcal: targetCaloriesKcal || null,
      },
      meals: {
        breakfast,
        lunch,
        afternoon_snack: afternoonSnack,
        dinner,
        supper,
      },
      intake_answers: intakeAnswers || null
    };
    return `Você é a Sofia, IA nutricional. Gere um plano de 1 dia com 5 refeições (Café da Manhã, Almoço, Café da Tarde, Jantar, Ceia), considerando o INPUT do usuário em JSON. Responda APENAS com JSON no schema exato abaixo, preenchendo calorias por refeição e padronizando ingredientes em objetos {name, quantity, unit} com unidades g, ml ou un. Inclua também "homemade_measure" (medida caseira) e "notes" (observações) por refeição. Para cada refeição, inclua um array "options" com 2-4 alternativas práticas e categorizadas (proteína, carboidrato, vegetal, outros), com quantidade em gramas e medida caseira.

INPUT:
${JSON.stringify(obj, null, 2)}

SCHEMA:
{
  "type": "dia",
  "score": number,
  "tags": string[],
  "target_calories_kcal": number,
  "days": {
    "hoje": {
      "breakfast": {"name": string, "calories_kcal": number, "homemade_measure": string, "notes": string, "ingredients": [{"name": string, "quantity": number, "unit": "g"|"ml"|"un"}], "options": [{"category": "proteina"|"carboidrato"|"vegetal"|"outros", "name": string, "quantity_g": number, "homemade_measure": string, "calories_kcal": number}]},
      "lunch": {"name": string, "calories_kcal": number, "homemade_measure": string, "notes": string, "ingredients": [{"name": string, "quantity": number, "unit": "g"|"ml"|"un"}], "options": [{"category": "proteina"|"carboidrato"|"vegetal"|"outros", "name": string, "quantity_g": number, "homemade_measure": string, "calories_kcal": number}]},
      "afternoon_snack": {"name": string, "calories_kcal": number, "homemade_measure": string, "notes": string, "ingredients": [{"name": string, "quantity": number, "unit": "g"|"ml"|"un"}], "options": [{"category": "proteina"|"carboidrato"|"vegetal"|"outros", "name": string, "quantity_g": number, "homemade_measure": string, "calories_kcal": number}]},
      "dinner": {"name": string, "calories_kcal": number, "homemade_measure": string, "notes": string, "ingredients": [{"name": string, "quantity": number, "unit": "g"|"ml"|"un"}], "options": [{"category": "proteina"|"carboidrato"|"vegetal"|"outros", "name": string, "quantity_g": number, "homemade_measure": string, "calories_kcal": number}]},
      "supper": {"name": string, "calories_kcal": number, "homemade_measure": string, "notes": string, "ingredients": [{"name": string, "quantity": number, "unit": "g"|"ml"|"un"}], "options": [{"category": "proteina"|"carboidrato"|"vegetal"|"outros", "name": string, "quantity_g": number, "homemade_measure": string, "calories_kcal": number}]}
    }
  }
}

IMPORTANTE: Não inclua texto fora do JSON. Não use markdown.`;
  };

  const tryParseJson = (text: string): any | null => {
    try { return JSON.parse(text); } catch {}
    // tenta extrair o maior bloco JSON
    const start = text.indexOf('{');
    const end = text.lastIndexOf('}');
    if (start >= 0 && end > start) {
      const sub = text.slice(start, end + 1);
      try { return JSON.parse(sub); } catch {}
    }
    return null;
  };

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const prompt = buildPrompt();
      const result = await supabase.functions.invoke('health-chat-bot', {
        body: { message: prompt, userId: user?.id || 'guest' }
      });
      const responseText: string = (result.data?.response as string) || '';
      let parsed = tryParseJson(responseText);
      if (!parsed) {
        // fallback simples baseado no input do usuário
        parsed = {
          type: 'dia',
          score: 60,
          target_calories_kcal: 2000,
          tags: ['Rascunho'],
          days: { hoje: {} }
        } as MealPlanGenerated;
        (parsed as MealPlanGenerated).days['hoje'] = {
          breakfast: { name: breakfast.description || 'Café da manhã sugerido', calories_kcal: 350, ingredients: breakfast.ingredients.split(',').map(s => s.trim()).filter(Boolean).map(n => ({ name: n, quantity: 100, unit: 'g' as const })) },
          lunch: { name: lunch.description || 'Almoço sugerido', calories_kcal: 600, ingredients: lunch.ingredients.split(',').map(s => s.trim()).filter(Boolean).map(n => ({ name: n, quantity: 150, unit: 'g' as const })) },
          afternoon_snack: { name: afternoonSnack.description || 'Café da tarde sugerido', calories_kcal: 250, ingredients: afternoonSnack.ingredients.split(',').map(s => s.trim()).filter(Boolean).map(n => ({ name: n, quantity: 100, unit: 'g' as const })) },
          dinner: { name: dinner.description || 'Jantar sugerido', calories_kcal: 550, ingredients: dinner.ingredients.split(',').map(s => s.trim()).filter(Boolean).map(n => ({ name: n, quantity: 150, unit: 'g' as const })) },
          supper: { name: supper.description || 'Ceia sugerida', calories_kcal: 200, ingredients: supper.ingredients.split(',').map(s => s.trim()).filter(Boolean).map(n => ({ name: n, quantity: 100, unit: 'g' as const })) },
        };
      }
      onPlanGenerated(parsed as MealPlanGenerated);
      onOpenChange(false);
      toast({ title: 'Plano gerado', description: 'Sugerimos um cardápio com base nas suas preferências.' });
    } catch (err: any) {
      console.error(err);
      toast({ title: 'Erro ao gerar', description: 'Não foi possível gerar o cardápio agora.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-3xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">Nova Sugestão • <Badge variant="secondary">Sugestão de IA</Badge></SheetTitle>
        </SheetHeader>

        <div className="mt-4 space-y-6">
          {/* Preferências globais */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="space-y-1">
              <Label>Orçamento</Label>
              <div className="flex gap-2">
                {(['baixo','médio','alto'] as BudgetLevel[]).map(level => (
                  <Button key={level} type="button" variant={level === budget ? 'default' : 'outline'} size="sm" onClick={() => setBudget(level)} className="capitalize">{level}</Button>
                ))}
              </div>
            </div>
            <div className="space-y-1">
              <Label>Tempo máx. de preparo (min)</Label>
              <Input type="number" min={5} max={240} value={maxPrepTime} onChange={e => setMaxPrepTime(Number(e.target.value || 0))} />
            </div>
            <div className="space-y-1">
              <Label>Utensílios disponíveis</Label>
              <Input placeholder="Ex.: airfryer, micro-ondas" value={utensils} onChange={e => setUtensils(e.target.value)} />
            </div>
          </div>

          <Separator />

          {/* Refeições */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Café da manhã */}
            <div className="space-y-2">
              <Label>Café da manhã • o que quer comer?</Label>
              <Textarea value={breakfast.description} onChange={e => setBreakfast(v => ({ ...v, description: e.target.value }))} placeholder="Ex.: algo com ovos e fruta" />
              <Input value={breakfast.ingredients} onChange={e => setBreakfast(v => ({ ...v, ingredients: e.target.value }))} placeholder="Ingredientes que tem (separe por vírgula)" />
              <Input value={breakfast.restrictions} onChange={e => setBreakfast(v => ({ ...v, restrictions: e.target.value }))} placeholder="Restrições (ex.: sem lactose)" />
            </div>

            {/* Almoço */}
            <div className="space-y-2">
              <Label>Almoço • o que quer comer?</Label>
              <Textarea value={lunch.description} onChange={e => setLunch(v => ({ ...v, description: e.target.value }))} placeholder="Ex.: frango + arroz + salada" />
              <Input value={lunch.ingredients} onChange={e => setLunch(v => ({ ...v, ingredients: e.target.value }))} placeholder="Ingredientes que tem (vírgulas)" />
              <Input value={lunch.restrictions} onChange={e => setLunch(v => ({ ...v, restrictions: e.target.value }))} placeholder="Restrições (ex.: sem glúten)" />
            </div>

            {/* Café da tarde */}
            <div className="space-y-2">
              <Label>Café da tarde • o que quer comer?</Label>
              <Textarea value={afternoonSnack.description} onChange={e => setAfternoonSnack(v => ({ ...v, description: e.target.value }))} placeholder="Ex.: iogurte + fruta" />
              <Input value={afternoonSnack.ingredients} onChange={e => setAfternoonSnack(v => ({ ...v, ingredients: e.target.value }))} placeholder="Ingredientes que tem (vírgulas)" />
              <Input value={afternoonSnack.restrictions} onChange={e => setAfternoonSnack(v => ({ ...v, restrictions: e.target.value }))} placeholder="Restrições" />
            </div>

            {/* Jantar */}
            <div className="space-y-2">
              <Label>Jantar • o que quer comer?</Label>
              <Textarea value={dinner.description} onChange={e => setDinner(v => ({ ...v, description: e.target.value }))} placeholder="Ex.: peixe + legumes" />
              <Input value={dinner.ingredients} onChange={e => setDinner(v => ({ ...v, ingredients: e.target.value }))} placeholder="Ingredientes que tem (vírgulas)" />
              <Input value={dinner.restrictions} onChange={e => setDinner(v => ({ ...v, restrictions: e.target.value }))} placeholder="Restrições" />
            </div>

            {/* Ceia */}
            <div className="space-y-2 md:col-span-2">
              <Label>Ceia • o que quer comer?</Label>
              <Textarea value={supper.description} onChange={e => setSupper(v => ({ ...v, description: e.target.value }))} placeholder="Ex.: chá + fruta" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <Input value={supper.ingredients} onChange={e => setSupper(v => ({ ...v, ingredients: e.target.value }))} placeholder="Ingredientes que tem (vírgulas)" />
                <Input value={supper.restrictions} onChange={e => setSupper(v => ({ ...v, restrictions: e.target.value }))} placeholder="Restrições" />
              </div>
            </div>
          </div>

          <Separator />

          {/* Aviso legal */}
          <div className="flex items-start gap-2 bg-muted/40 p-3 rounded">
            <Checkbox id="legal" checked={legalAccepted} onCheckedChange={(v) => setLegalAccepted(Boolean(v))} />
            <Label htmlFor="legal" className="text-xs leading-relaxed">
              Este material constitui <strong>SUGESTÃO DE CARDÁPIO</strong> gerada por IA para fins informativos. Não substitui avaliação profissional. Valores nutricionais são estimativas e podem variar conforme preparo e marcas. Em caso de alergias/intolerâncias, confirme os rótulos dos produtos.
            </Label>
          </div>

          {/* Ações */}
          <div className="flex items-center justify-between">
            <div className="text-xs text-muted-foreground">Contexto: orçamento {budget}, até {maxPrepTime} min, utensílios: {utensils || '—'}</div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => { setBudget('médio'); setMaxPrepTime(30); setUtensils(''); setBreakfast({ description: '', ingredients: '', restrictions: '', prepTimeMin: 10 }); setLunch({ description: '', ingredients: '', restrictions: '', prepTimeMin: 20 }); setAfternoonSnack({ description: '', ingredients: '', restrictions: '', prepTimeMin: 10 }); setDinner({ description: '', ingredients: '', restrictions: '', prepTimeMin: 20 }); setSupper({ description: '', ingredients: '', restrictions: '', prepTimeMin: 5 }); }}>Limpar</Button>
              <Button disabled={loading} onClick={handleGenerate}>
                {loading ? 'Gerando...' : 'Gerar plano com a Sofia'}
              </Button>
            </div>
          </div>

          {/* Chat compacto */}
          <div className="mt-2 border rounded-md overflow-hidden">
            <div className="px-3 py-2 text-xs font-medium bg-muted/50">Ajustes rápidos com a Sofia</div>
            <div className="h-64">
              <SofiaChat user={user} />
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default SofiaMealSuggestionModal;


