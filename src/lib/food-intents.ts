export type MealLine = {
  food: string;
  homemade: string;
  kcal: number;
  unit?: 'g' | 'ml' | 'un';
  notes?: string;
};

export type IntentInfo = {
  displayName: string;
  suggestions: string[];
  ask?: string;
  tip?: string;
};

const FRUITS_KCAL_100G: Record<string, number> = {
  banana: 89,
  maçã: 52,
  maca: 52,
  laranja: 47,
  manga: 60,
  uva: 69,
  morango: 33,
  abacaxi: 50,
  pera: 57,
  melancia: 30,
  kiwi: 61,
};

function normalize(text: string): string {
  return text.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '');
}

export function detectFoodIntent(foodName: string): IntentInfo {
  const name = normalize(foodName);

  // Ovo → sugestões + pergunta omelete
  if (name.includes('ovo')) {
    return {
      displayName: 'Ovo',
      suggestions: ['Ovo cozido', 'Ovo mexido'],
      ask: 'Quer que eu sugira uma omelete?'
    };
  }

  // Frango → vários cortes/preparos
  if (name.includes('frango')) {
    return {
      displayName: 'Frango',
      suggestions: ['Frango assado', 'Frango cozido', 'Asa de frango', 'Coxa de frango', 'Sobrecoxa de frango']
    };
  }

  // Fruta genérica ou específicas
  const fruitEntries = Object.keys(FRUITS_KCAL_100G);
  const isFrutaGenerica = name.includes('fruta');
  const fruitMatch = fruitEntries.find(f => name.includes(f));
  if (isFrutaGenerica || fruitMatch) {
    const fruit = fruitMatch || 'fruta';
    const kcal = FRUITS_KCAL_100G[fruitMatch || 'banana'] || 60;
    return {
      displayName: `${capitalize(fruit)} (kcal/100g)`,
      suggestions: [],
      tip: `Porção de 100 g ≈ ${kcal} kcal. Pode adicionar canela. Prefere em salada de frutas?`
    };
  }

  return { displayName: capitalize(foodName), suggestions: [] };
}

export function sumBlockKcal(lines: MealLine[]): number {
  return lines.reduce((acc, l) => acc + (Number(l.kcal) || 0), 0);
}

export function avoidRepetition(lines: MealLine[]): MealLine[] {
  const seen: Record<string, number> = {};
  return lines.map((l) => {
    const key = normalize(l.food);
    seen[key] = (seen[key] || 0) + 1;
    if (seen[key] > 1) {
      return { ...l, food: `${l.food} (var.)` };
    }
    return l;
  });
}

export function estimateSuggestionLine(suggestion: string): MealLine {
  const n = normalize(suggestion);
  if (n.includes('ovo')) {
    return { food: suggestion, homemade: '2 unidades', kcal: 150, unit: 'un' };
  }
  if (n.includes('frango')) {
    return { food: suggestion, homemade: '1 filé (150 g)', kcal: 230, unit: 'g' };
  }
  // frutas genéricas
  const fruit = Object.keys(FRUITS_KCAL_100G).find(f => n.includes(f));
  if (n.includes('fruta') || fruit) {
    const kc = FRUITS_KCAL_100G[fruit || 'banana'] || 60;
    return { food: capitalize(fruit || 'Fruta'), homemade: '1 porção (100 g)', kcal: kc, unit: 'g' };
  }
  return { food: capitalize(suggestion), homemade: '—', kcal: 0 };
}

export function capitalize(text: string): string {
  if (!text) return text;
  return text.charAt(0).toUpperCase() + text.slice(1);
}










