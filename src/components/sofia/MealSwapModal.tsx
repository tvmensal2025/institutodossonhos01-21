import React, { useEffect, useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

export type SwapCategory = 'proteina' | 'carboidrato' | 'vegetal';

export interface MealIngredient { name: string; quantity: number; unit: string }
export interface MealEntry { name: string; calories_kcal?: number; ingredients?: MealIngredient[]; notes?: string; homemade_measure?: string }

type SwapSuggestion = { name: string; grams: number };

export interface MealSwapModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  meal: MealEntry | undefined;
  swapSuggestions: Record<SwapCategory, SwapSuggestion[]> | null;
  onApply: (updated: MealEntry) => void;
  targetCaloriesKcal?: number;
  currentDayTotals?: { kcal: number; protein_g: number; fat_g: number; carbs_g: number; };
}

const kcalPerGram = (name: string): number => {
  const n = name.toLowerCase();
  if (n.includes('arroz')) return 1.3;
  if (n.includes('frango')) return 1.1;
  if (n.includes('peixe')) return 1.0;
  if (n.includes('atum')) return 1.32;
  if (n.includes('ovo')) return 1.56;
  if (n.includes('aveia')) return 3.89;
  if (n.includes('pão') || n.includes('pao')) return 2.6;
  if (n.includes('batata doce')) return 0.86;
  if (n.includes('batata')) return 0.77;
  if (n.includes('salada') || n.includes('legume')) return 0.25;
  if (n.includes('azeite')) return 8.84;
  if (n.includes('molho')) return 0.29;
  return 1.0;
};

const classify = (name: string): SwapCategory | 'outros' => {
  const n = name.toLowerCase();
  if (/(frango|peixe|atum|ovo|ovos|carne)/.test(n)) return 'proteina';
  if (/(arroz|batata|aveia|pão|pao|massa|macarrão)/.test(n)) return 'carboidrato';
  if (/(salada|legume|couve|brócolis|brocolis|verdura|vegetal|tomate)/.test(n)) return 'vegetal';
  return 'outros';
};

export const MealSwapModal: React.FC<MealSwapModalProps> = ({ open, onOpenChange, meal, swapSuggestions, onApply, targetCaloriesKcal, currentDayTotals }) => {
  const initialCategory: SwapCategory = useMemo(() => {
    const ing = meal?.ingredients?.[0]?.name || meal?.name || '';
    const c = classify(ing);
    return (c === 'outros' ? 'proteina' : c) as SwapCategory;
  }, [meal]);

  const [category, setCategory] = useState<SwapCategory>(initialCategory);
  useEffect(() => setCategory(initialCategory), [initialCategory]);

  const currentIngredientIndex = useMemo(() => {
    if (!meal?.ingredients) return -1;
    return meal.ingredients.findIndex(i => classify(i.name) === category) ?? -1;
  }, [meal, category]);

  const currentIngredient = currentIngredientIndex >= 0 && meal?.ingredients ? meal.ingredients[currentIngredientIndex] : undefined;
  const currentKcal = currentIngredient ? kcalPerGram(currentIngredient.name) * (currentIngredient.quantity || 0) : (meal?.calories_kcal || 0) * 0.35;

  const list = (swapSuggestions?.[category] || []) as SwapSuggestion[];

  const applySwap = (s: SwapSuggestion) => {
    if (!meal) return;
    const targetKcal = currentKcal > 10 ? currentKcal : 300;
    const gramsNeeded = Math.max(30, Math.min(400, Math.round((targetKcal / kcalPerGram(s.name)) / 5) * 5));
    const updated: MealEntry = JSON.parse(JSON.stringify(meal));
    const newIng: MealIngredient = { name: s.name, quantity: gramsNeeded, unit: 'g' };
    if (currentIngredientIndex >= 0 && updated.ingredients) {
      updated.ingredients[currentIngredientIndex] = newIng;
    } else {
      (updated.ingredients ||= []).push(newIng);
    }
    // Mantém kcal do cardápio estável visualmente
    updated.calories_kcal = meal.calories_kcal || Math.round(targetKcal);
    onApply(updated);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Substituições Inteligentes</DialogTitle>
        </DialogHeader>

        {!meal ? (
          <div className="text-sm text-muted-foreground">Selecione uma refeição válida.</div>
        ) : (
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">Escolha uma categoria para trocar mantendo as calorias aproximadas.</div>
            <div className="flex gap-2">
              {(['proteina','carboidrato','vegetal'] as SwapCategory[]).map(cat => (
                <Button key={cat} variant={category === cat ? 'default' : 'outline'} size="sm" onClick={() => setCategory(cat)} className="capitalize">{cat}</Button>
              ))}
            </div>

            <Separator />

            <div className="rounded border p-3 bg-muted/30">
              <div className="text-xs text-muted-foreground mb-1">Componente atual</div>
              <div className="text-sm font-medium">
                {currentIngredient ? `${currentIngredient.name} • ${Math.round(currentIngredient.quantity)}g` : 'Não identificado — sugeriremos um equivalente'}
              </div>
              <div className="text-xs text-emerald-600">~{Math.round(currentKcal)} kcal</div>
            </div>

            <div className="space-y-2">
              <div className="text-sm font-semibold">Sugestões</div>
              {list.length === 0 ? (
                <div className="text-sm text-muted-foreground">Sem sugestões disponíveis para esta categoria.</div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {list.map((s, idx) => {
                    const gramsNeeded = Math.max(30, Math.min(400, Math.round(((currentKcal || 300) / kcalPerGram(s.name)) / 5) * 5));
                    // Preview de impacto
                    const newKcal = gramsNeeded * kcalPerGram(s.name);
                    const deltaKcal = Math.round(newKcal - currentKcal);
                    return (
                      <div key={idx} className="border rounded p-2 bg-background/60">
                        <div className="text-sm font-medium capitalize">{s.name}</div>
                        <div className="text-xs text-muted-foreground">Sugerido: {gramsNeeded}g • Δ {deltaKcal >= 0 ? '+' : ''}{deltaKcal} kcal</div>
                        {targetCaloriesKcal && currentDayTotals ? (
                          <div className="text-[11px] text-muted-foreground mt-1">
                            Meta diária: {targetCaloriesKcal} • Atual: {Math.round(currentDayTotals.kcal)} • Prev.: {Math.round(currentDayTotals.kcal + deltaKcal)}
                          </div>
                        ) : null}
                        <div className="pt-1">
                          <Button size="sm" className="w-full" onClick={() => applySwap(s)}>Usar</Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default MealSwapModal;


