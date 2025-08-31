// @ts-nocheck
import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Plus, Utensils } from 'lucide-react';
import Chart from 'react-apexcharts';
import { useDailyNutritionReport, MealSlot } from '@/hooks/useDailyNutritionReport';
import { supabase } from '@/integrations/supabase/client';

interface SofiaNutritionReportProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

export const SofiaNutritionReport: React.FC<SofiaNutritionReportProps> = ({ open, onOpenChange }) => {
  const [date, setDate] = useState<Date>(new Date());
  const [addOpen, setAddOpen] = useState<boolean>(false);
  const [newItem, setNewItem] = useState<{ meal: MealSlot; name: string; grams: number }>({ meal: 'breakfast', name: '', grams: 100 });
  const { aggregates, rows, loading } = useDailyNutritionReport(date);

  const categories = ['Café da manhã', 'Almoço', 'Café da tarde', 'Jantar'];
  const seriesKcal = [aggregates.byMeal.breakfast.kcal, aggregates.byMeal.lunch.kcal, aggregates.byMeal.snack.kcal, aggregates.byMeal.dinner.kcal];
  const seriesProt = [aggregates.byMeal.breakfast.protein_g, aggregates.byMeal.lunch.protein_g, aggregates.byMeal.snack.protein_g, aggregates.byMeal.dinner.protein_g];
  const seriesCarb = [aggregates.byMeal.breakfast.carbs_g, aggregates.byMeal.lunch.carbs_g, aggregates.byMeal.snack.carbs_g, aggregates.byMeal.dinner.carbs_g];
  const seriesFat  = [aggregates.byMeal.breakfast.fat_g, aggregates.byMeal.lunch.fat_g, aggregates.byMeal.snack.fat_g, aggregates.byMeal.dinner.fat_g];

  const baseBarOpts = useMemo(() => ({
    chart: { type: 'bar' as const, toolbar: { show: false }, animations: { enabled: true } },
    plotOptions: { bar: { columnWidth: '40%', borderRadius: 6 } },
    xaxis: { categories },
    dataLabels: { enabled: false },
    grid: { strokeDashArray: 4 },
    colors: ['#f97316'],
  }), [categories]);

  const makeSeries = (name: string, data: number[]) => [{ name, data: data.map(v => Math.round(v)) }];

  const todayLabel = useMemo(() => {
    try { return date.toLocaleDateString('pt-BR'); } catch { return ''; }
  }, [date]);

  const handleAddItem = async () => {
    if (!newItem.name || !newItem.grams) return;
    // Usar a edge function nutrition-calc para resolver macros de forma determinística
    const { data: session } = await supabase.auth.getSession();
    const userId = session.session?.user?.id;
    if (!userId) return;

    const { data, error } = await supabase.functions.invoke('nutrition-calc', {
      body: {
        items: [{ name: newItem.name, grams: Number(newItem.grams) }],
        locale: 'pt-BR',
      }
    });
    if (error || !data?.success) return;
    const totals = data.totals as { kcal: number; protein_g: number; fat_g: number; carbs_g: number };

    // Salvar em food_analysis como uma análise simples
    await supabase.from('food_analysis').insert({
      user_id: userId,
      meal_type: newItem.meal,
      food_items: [{ name: newItem.name, quantity: Number(newItem.grams), calories: totals.kcal, protein: totals.protein_g, fat: totals.fat_g, carbs: totals.carbs_g }],
      nutrition_analysis: {
        totalCalories: totals.kcal,
        totalProtein: totals.protein_g,
        totalCarbs: totals.carbs_g,
        totalFat: totals.fat_g,
      },
      sofia_analysis: { analysis: 'Item adicionado manualmente' },
    });

    setAddOpen(false);
    // Forçar recarregar hook alterando a data (toggle dia +1 e volta)
    const d = new Date(date);
    setDate(new Date(d.getTime() + 1000));
    setTimeout(() => setDate(d), 0);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><Utensils className="h-5 w-5" /> Relatório Diário de Consumo</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>{todayLabel}</span>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setAddOpen(true)}><Plus className="h-4 w-4 mr-1" /> Adicionar item</Button>
            </div>
          </div>

          <Tabs defaultValue="kcal" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="kcal">Calorias</TabsTrigger>
              <TabsTrigger value="prot">Proteínas</TabsTrigger>
              <TabsTrigger value="carb">Carboidratos</TabsTrigger>
              <TabsTrigger value="fat">Gorduras</TabsTrigger>
            </TabsList>
            <TabsContent value="kcal">
              <Card><CardHeader className="pb-2"><CardTitle className="text-base">Calorias por refeição</CardTitle></CardHeader><CardContent>
                <Chart options={baseBarOpts as any} series={makeSeries('kcal', seriesKcal)} type="bar" height={260} />
              </CardContent></Card>
            </TabsContent>
            <TabsContent value="prot">
              <Card><CardHeader className="pb-2"><CardTitle className="text-base">Proteínas (g)</CardTitle></CardHeader><CardContent>
                <Chart options={{ ...baseBarOpts, colors: ['#22c55e'] } as any} series={makeSeries('g', seriesProt)} type="bar" height={260} />
              </CardContent></Card>
            </TabsContent>
            <TabsContent value="carb">
              <Card><CardHeader className="pb-2"><CardTitle className="text-base">Carboidratos (g)</CardTitle></CardHeader><CardContent>
                <Chart options={{ ...baseBarOpts, colors: ['#3b82f6'] } as any} series={makeSeries('g', seriesCarb)} type="bar" height={260} />
              </CardContent></Card>
            </TabsContent>
            <TabsContent value="fat">
              <Card><CardHeader className="pb-2"><CardTitle className="text-base">Gorduras (g)</CardTitle></CardHeader><CardContent>
                <Chart options={{ ...baseBarOpts, colors: ['#f59e0b'] } as any} series={makeSeries('g', seriesFat)} type="bar" height={260} />
              </CardContent></Card>
            </TabsContent>
          </Tabs>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {(['breakfast','lunch','snack','dinner'] as MealSlot[]).map((slot) => {
              const label = slot === 'breakfast' ? 'Café da manhã' : slot === 'lunch' ? 'Almoço' : slot === 'snack' ? 'Café da tarde' : 'Jantar';
              const macro = aggregates.byMeal[slot];
              const items = rows.filter(r => r.meal_type === slot).flatMap(r => (r.items || [])).slice(0, 6);
              return (
                <Card key={slot}>
                  <CardHeader className="pb-2"><CardTitle className="text-base">{label}</CardTitle></CardHeader>
                  <CardContent className="text-sm text-muted-foreground space-y-2">
                    <div>kcal {Math.round(macro.kcal)} • Prot {Math.round(macro.protein_g)} g • Carb {Math.round(macro.carbs_g)} g • Gord {Math.round(macro.fat_g)} g</div>
                    {items.length > 0 && (
                      <div className="text-xs text-foreground/80">
                        {items.map((it, idx) => (
                          <span key={idx} className="inline-block mr-2 mb-1 px-2 py-0.5 rounded border bg-muted/40">
                            {(it.name || 'item')} {it.quantity ? `• ${Math.round(it.quantity)}g` : ''}
                          </span>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <Dialog open={addOpen} onOpenChange={setAddOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Adicionar item consumido</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <Label>Refeição</Label>
                  <select className="w-full border rounded h-9 px-2" value={newItem.meal} onChange={(e) => setNewItem(prev => ({ ...prev, meal: e.target.value as MealSlot }))}>
                    <option value="breakfast">Café da manhã</option>
                    <option value="lunch">Almoço</option>
                    <option value="snack">Café da tarde</option>
                    <option value="dinner">Jantar</option>
                  </select>
                </div>
                <div>
                  <Label>Item</Label>
                  <Input placeholder="Ex.: arroz, frango, salada" value={newItem.name} onChange={(e) => setNewItem(prev => ({ ...prev, name: e.target.value }))} />
                </div>
                <div>
                  <Label>Quantidade (g)</Label>
                  <Input type="number" min={1} value={newItem.grams} onChange={(e) => setNewItem(prev => ({ ...prev, grams: Number(e.target.value || 0) }))} />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setAddOpen(false)}>Cancelar</Button>
                  <Button onClick={handleAddItem}>Adicionar</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SofiaNutritionReport;


