import React, { useMemo, useRef, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';

export interface MealQnAResult {
  restrictions: string;
  breakfast: { description: string };
  lunch: { description: string };
  afternoon_snack: { description: string };
  dinner: { description: string };
  supper: { description: string };
}

interface SofiaMealQnAChatProps {
  onComplete: (result: MealQnAResult) => void;
  targetCaloriesKcal?: number;
  onPreviewUpdate?: (totals: NutrientTotals) => void;
}

type NutrientTotals = {
  kcal: number;
  protein_g: number;
  fat_g: number;
  carbs_g: number;
  fiber_g: number;
  sodium_mg: number;
};

type ChatMessage = { id: string; role: 'assistant' | 'user'; content: React.ReactNode };

export const SofiaMealQnAChat: React.FC<SofiaMealQnAChatProps> = ({ onComplete, targetCaloriesKcal, onPreviewUpdate }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([{
    id: 'm1', role: 'assistant', content: (
      <div>
        Oi! Sou a <strong>Sofia</strong>. Vou te fazer algumas perguntas rápidas para montar seu cardápio de hoje.
      </div>
    )
  }]);
  const [step, setStep] = useState<number>(0);
  const [input, setInput] = useState<string>('');
  const viewportRef = useRef<HTMLDivElement>(null);
  const [previewTotals, setPreviewTotals] = useState<NutrientTotals>({ kcal: 0, protein_g: 0, fat_g: 0, carbs_g: 0, fiber_g: 0, sodium_mg: 0 });

  const resultRef = useRef<MealQnAResult>({
    restrictions: '',
    breakfast: { description: '' },
    lunch: { description: '' },
    afternoon_snack: { description: '' },
    dinner: { description: '' },
    supper: { description: '' },
  });

  const questions = useMemo(() => [
    { key: 'restrictions', text: 'Você possui alguma alergia/intolerância ou restrição alimentar? (Ex.: lactose, glúten, vegan)', placeholder: 'Descreva aqui' },
    { key: 'breakfast.description', text: 'O que você quer no café da manhã?', placeholder: 'Ex.: ovos mexidos + fruta' },
    { key: 'lunch.description', text: 'O que você deseja no almoço?', placeholder: 'Ex.: frango + arroz + salada' },
    { key: 'afternoon_snack.description', text: 'O que prefere no café da tarde?', placeholder: 'Ex.: iogurte + fruta' },
    { key: 'dinner.description', text: 'O que deseja no jantar?', placeholder: 'Ex.: peixe + legumes' },
    { key: 'supper.description', text: 'E para a ceia, prefere o quê?', placeholder: 'Ex.: chá + fruta' },
  ], []);

  // ---- Estimativa local para preview dinâmico ----
  const gramsDefaults: Record<string, number> = {
    arroz: 120,
    frango: 150,
    peixe: 150,
    ovo: 50,
    ovos: 50,
    azeite: 5,
    molho: 40,
    salada: 120,
    legumes: 150,
    batata: 150,
    'batata doce': 150,
    aveia: 40,
    pao: 50,
    pão: 50,
    banana: 120,
    maçã: 130,
    maca: 130,
    iogurte: 170,
    leite: 200,
    queijo: 40,
    atum: 100,
    feijao: 100,
    feijão: 100,
  };

  const estimateFor = (nameRaw: string, grams?: number): NutrientTotals => {
    const name = (nameRaw || '').toLowerCase();
    const g = grams ?? gramsDefaults[name] ?? 0;
    if (name.includes('arroz')) return { kcal: g * 1.3, protein_g: g * 0.027, fat_g: g * 0.003, carbs_g: g * 0.28, fiber_g: g * 0.004, sodium_mg: g * 0.01 };
    if (name.includes('frango')) return { kcal: g * 1.1, protein_g: g * 0.206, fat_g: g * 0.036, carbs_g: 0, fiber_g: 0, sodium_mg: 0.74 * g };
    if (name.includes('peixe')) return { kcal: g * 1.0, protein_g: g * 0.22, fat_g: g * 0.02, carbs_g: 0, fiber_g: 0, sodium_mg: 0.6 * g };
    if (name.includes('ovo')) return { kcal: g * 1.56, protein_g: g * 0.126, fat_g: g * 0.106, carbs_g: g * 0.012, fiber_g: 0, sodium_mg: 1.24 * g };
    if (name.includes('azeite')) return { kcal: g * 8.84, protein_g: 0, fat_g: g * 1.0, carbs_g: 0, fiber_g: 0, sodium_mg: 0 };
    if (name.includes('molho')) return { kcal: g * 0.29, protein_g: g * 0.015, fat_g: g * 0.002, carbs_g: g * 0.05, fiber_g: g * 0.015, sodium_mg: 4 * g };
    if (name.includes('aveia')) return { kcal: g * 3.89, protein_g: g * 0.17, fat_g: g * 0.07, carbs_g: g * 0.66, fiber_g: g * 0.11, sodium_mg: 0.02 * g };
    if (name.includes('pão') || name.includes('pao')) return { kcal: g * 2.6, protein_g: g * 0.08, fat_g: g * 0.03, carbs_g: g * 0.49, fiber_g: g * 0.025, sodium_mg: 5 * g };
    if (name.includes('banana')) return { kcal: g * 0.89, protein_g: g * 0.011, fat_g: g * 0.003, carbs_g: g * 0.23, fiber_g: g * 0.026, sodium_mg: 0.001 * g };
    if (name.includes('maç') || name.includes('maca')) return { kcal: g * 0.52, protein_g: g * 0.003, fat_g: g * 0.002, carbs_g: g * 0.14, fiber_g: g * 0.024, sodium_mg: 0.001 * g };
    if (name.includes('iogurte')) return { kcal: g * 0.63, protein_g: g * 0.035, fat_g: g * 0.033, carbs_g: g * 0.049, fiber_g: 0, sodium_mg: 0.5 * g };
    if (name.includes('leite')) return { kcal: g * 0.64, protein_g: g * 0.033, fat_g: g * 0.036, carbs_g: g * 0.05, fiber_g: 0, sodium_mg: 0.44 * g };
    if (name.includes('queijo')) return { kcal: g * 4, protein_g: g * 0.25, fat_g: g * 0.33, carbs_g: g * 0.013, fiber_g: 0, sodium_mg: 6 * g };
    if (name.includes('atum')) return { kcal: g * 1.32, protein_g: g * 0.29, fat_g: g * 0.01, carbs_g: 0, fiber_g: 0, sodium_mg: 0.37 * g };
    if (name.includes('feij')) return { kcal: g * 1.27, protein_g: g * 0.086, fat_g: g * 0.005, carbs_g: g * 0.225, fiber_g: g * 0.065, sodium_mg: 0.24 * g };
    if (name.includes('batata doce')) return { kcal: g * 0.86, protein_g: g * 0.016, fat_g: g * 0.001, carbs_g: g * 0.20, fiber_g: g * 0.03, sodium_mg: 0.055 * g };
    if (name.includes('batata')) return { kcal: g * 0.77, protein_g: g * 0.02, fat_g: g * 0.001, carbs_g: g * 0.17, fiber_g: g * 0.026, sodium_mg: 0.005 * g };
    if (name.includes('salada') || name.includes('legume')) return { kcal: g * 0.25, protein_g: g * 0.012, fat_g: g * 0.003, carbs_g: g * 0.04, fiber_g: g * 0.02, sodium_mg: 0.01 * g };
    return { kcal: 0, protein_g: 0, fat_g: 0, carbs_g: 0, fiber_g: 0, sodium_mg: 0 };
  };

  const parseTokens = (text: string): Array<{ name: string; grams: number }> => {
    if (!text) return [];
    const cleaned = text.replace(/\./g, ' ').toLowerCase();
    const parts = cleaned.split(/\+|,| e | com /g).map(p => p.trim()).filter(Boolean);
    const items: Array<{ name: string; grams: number }> = [];
    for (const p of parts) {
      const matchG = p.match(/(\d{1,4})\s?g/);
      const matchMl = p.match(/(\d{1,4})\s?ml/);
      const matchUnits = p.match(/(\d{1,2})\s?(ovos|ovo|fatias|fatia|colheres|colher)/);
      let grams = 0;
      if (matchG) grams = Number(matchG[1]);
      else if (matchMl) grams = Number(matchMl[1]);
      else if (matchUnits) {
        const n = Number(matchUnits[1]);
        if (/ovo/.test(matchUnits[2])) grams = n * gramsDefaults['ovo'];
        else if (/fatia/.test(matchUnits[2])) grams = n * gramsDefaults['pão'];
        else if (/colher/.test(matchUnits[2])) grams = n * 5;
      } else {
        const key = Object.keys(gramsDefaults).find(k => p.includes(k));
        grams = key ? gramsDefaults[key] : 0;
      }
      const key = Object.keys(gramsDefaults).find(k => p.includes(k));
      const name = key || p.split(' ')[0];
      if (grams > 0 || key) items.push({ name, grams: grams || (key ? gramsDefaults[key] : 0) });
    }
    return items;
  };

  const recomputePreview = () => {
    const mealDescs = [
      resultRef.current.breakfast.description,
      resultRef.current.lunch.description,
      resultRef.current.afternoon_snack.description,
      resultRef.current.dinner.description,
      resultRef.current.supper.description,
    ];
    const pending = input ? [input] : [];
    const allTexts = [...mealDescs.filter(Boolean), ...pending];
    const items = allTexts.flatMap(parseTokens);
    const totals = items.reduce<NutrientTotals>((acc, it) => {
      const t = estimateFor(it.name, it.grams);
      return {
        kcal: acc.kcal + t.kcal,
        protein_g: acc.protein_g + t.protein_g,
        fat_g: acc.fat_g + t.fat_g,
        carbs_g: acc.carbs_g + t.carbs_g,
        fiber_g: acc.fiber_g + t.fiber_g,
        sodium_mg: acc.sodium_mg + t.sodium_mg,
      };
    }, { kcal: 0, protein_g: 0, fat_g: 0, carbs_g: 0, fiber_g: 0, sodium_mg: 0 });
    setPreviewTotals(totals);
    onPreviewUpdate?.(totals);
  };

  useEffect(() => {
    recomputePreview();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [input, step]);

  const askNext = (nextStep: number) => {
    if (nextStep >= questions.length) {
      onComplete(resultRef.current);
      return;
    }
    const q = questions[nextStep];
    setMessages(prev => [...prev, { id: `a${nextStep}`, role: 'assistant', content: <div>{q.text}</div> }]);
  };

  const updateResultByKey = (key: string, value: string) => {
    if (key === 'restrictions') {
      resultRef.current.restrictions = value;
      return;
    }
    const [meal] = key.split('.') as [keyof MealQnAResult];
    (resultRef.current[meal] as any).description = value;
  };

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    const q = questions[step];
    setMessages(prev => [
      ...prev,
      { id: `u${step}`, role: 'user', content: <div>{trimmed}</div> }
    ]);
    updateResultByKey(q.key, trimmed);
    setInput('');
    const next = step + 1;
    setStep(next);
    askNext(next);
    setTimeout(recomputePreview, 0);
  };

  React.useEffect(() => {
    askNext(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => {
    const el = viewportRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  const kcalTarget = targetCaloriesKcal || 0;
  const progress = kcalTarget > 0 ? Math.min(100, (previewTotals.kcal / kcalTarget) * 100) : 0;

  return (
    <div className="flex flex-col h-96 border rounded-md">
      <div ref={viewportRef} className="flex-1 overflow-y-auto p-3 space-y-2 bg-muted/20">
        {messages.map(m => (
          <div key={m.id} className={`max-w-[85%] rounded px-3 py-2 text-sm ${m.role === 'assistant' ? 'bg-white text-foreground' : 'bg-primary text-primary-foreground ml-auto'}`}>
            {m.content}
          </div>
        ))}
        <div className="mt-2 p-3 rounded-md bg-white border">
          <div className="flex items-center justify-between text-xs mb-1">
            <span>Estimativa parcial de hoje</span>
            {kcalTarget > 0 && <span>{Math.round(previewTotals.kcal)}/{kcalTarget} kcal</span>}
          </div>
          {kcalTarget > 0 && <Progress value={progress} className="h-2 mb-2" />}
          <div className="grid grid-cols-3 gap-2 text-[11px] text-muted-foreground">
            <div>Prot: {Math.round(previewTotals.protein_g)} g</div>
            <div>Carb: {Math.round(previewTotals.carbs_g)} g</div>
            <div>Gord: {Math.round(previewTotals.fat_g)} g</div>
          </div>
        </div>
      </div>
      <div className="p-2 flex gap-2 border-t bg-background">
        <Input value={input} onChange={e => setInput(e.target.value)} placeholder={questions[step]?.placeholder || 'Digite sua resposta'} onKeyDown={(e) => { if (e.key === 'Enter') handleSend(); }} />
        <Button onClick={handleSend}>Enviar</Button>
      </div>
    </div>
  );
};

export default SofiaMealQnAChat;


