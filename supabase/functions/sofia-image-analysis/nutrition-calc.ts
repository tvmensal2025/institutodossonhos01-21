// nutrition-calc.ts
export type Macros100g = { kcal:number; protein:number; carbs:number; fat:number; fiber?:number; sodium?:number };
export type PlateItem = { name: string; grams: number };
export type TacoFood = {
  id: number;
  nome_alimento: string;
  proteina_g: number;
  carboidratos_g: number;
  lipidios_g: number;
  fibra_alimentar_g?: number;
  sodio_mg?: number;
  categoria?: string;
};

// Base de dados será carregada dinamicamente da tabela taco_foods
let TACO_FOODS: TacoFood[] = [];

// Função para carregar dados da TACO
export async function loadTacoFoods(supabase: any) {
  if (TACO_FOODS.length > 0) return; // Já carregado

  const { data, error } = await supabase
    .from('taco_foods')
    .select('id, nome_alimento, proteina_g, carboidratos_g, lipidios_g, fibra_alimentar_g, sodio_mg, categoria');
  
  if (error) {
    console.error('Erro ao carregar TACO foods:', error);
    return;
  }
  
  TACO_FOODS = data || [];
  console.log(`🍽️ Carregados ${TACO_FOODS.length} alimentos da TACO`);
}

// Normalização de texto para busca
function normalizeText(text: string): string {
  return text.toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .replace(/[^a-z0-9\s]/g, ' ') // Remove caracteres especiais
    .replace(/\s+/g, ' ') // Remove espaços múltiplos
    .trim();
}

// Buscar alimento na TACO por nome (busca flexível)
function findTacoFood(name: string): TacoFood | null {
  if (TACO_FOODS.length === 0) return null;
  
  const normalizedName = normalizeText(name);
  
  // Busca exata primeiro
  let found = TACO_FOODS.find(food => 
    normalizeText(food.nome_alimento) === normalizedName
  );
  
  if (found) return found;
  
  // Busca por palavras-chave
  const keywords = normalizedName.split(' ').filter(w => w.length > 2);
  
  found = TACO_FOODS.find(food => {
    const foodName = normalizeText(food.nome_alimento);
    return keywords.every(keyword => foodName.includes(keyword));
  });
  
  if (found) return found;
  
  // Busca parcial (pelo menos uma palavra)
  found = TACO_FOODS.find(food => {
    const foodName = normalizeText(food.nome_alimento);
    return keywords.some(keyword => foodName.includes(keyword));
  });
  
  return found || null;
}

// Função para resolver alimento da TACO
function resolveTacoFood(name: string): TacoFood | null {
  return findTacoFood(name);
}

export function calcNutrition(items: PlateItem[]) {
  let totals = { kcal:0, protein:0, carbs:0, fat:0, fiber:0, sodium:0 };
  let details: Array<{name:string; grams:number; tacoFood:TacoFood|null; contrib:any}> = [];
  let missing: string[] = [];
  let gramsTotal = 0;

  for (const it of items) {
    const tacoFood = resolveTacoFood(it.name);
    const g = Number(it.grams) || 0;
    
    if (!tacoFood || g <= 0) { 
      missing.push(it.name); 
      continue; 
    }

    const factor = g / 100.0;
    const c = {
      protein: tacoFood.proteina_g * factor,
      carbs: tacoFood.carboidratos_g * factor,
      fat: tacoFood.lipidios_g * factor,
      fiber: (tacoFood.fibra_alimentar_g ?? 0) * factor,
      sodium: (tacoFood.sodio_mg ?? 0) * factor
    };

    // Somar macros (kcal será calculado depois)
    totals.protein += c.protein;
    totals.carbs   += c.carbs;
    totals.fat     += c.fat;
    totals.fiber   += c.fiber;
    totals.sodium  += c.sodium;
    gramsTotal     += g;

    details.push({ name: it.name, grams: g, tacoFood, contrib: c });
  }

  // ✅ NOVA REGRA: Calcular kcal usando APENAS 4×P + 4×C + 9×G
  totals.kcal = 4 * totals.protein + 4 * totals.carbs + 9 * totals.fat;

  // Sanity check de densidade baseado na TACO
  const density = gramsTotal > 0 ? totals.kcal / gramsTotal : 0;
  const flags:string[] = [];
  if (gramsTotal === 0) flags.push("grams_total_zero");
  if (density < 0.35) flags.push("density_too_low_generic");

  const r1 = (n:number)=> Math.round(n*10)/10;
  const r2 = (n:number)=> Math.round(n*100)/100;
  const r3 = (n:number)=> Math.round(n*1000)/1000;

  const perGram = gramsTotal>0 ? {
    kcal: r2(totals.kcal/gramsTotal),
    protein: r3(totals.protein/gramsTotal),
    carbs:   r3(totals.carbs/gramsTotal),
    fat:     r3(totals.fat/gramsTotal),
  } : { kcal:0, protein:0, carbs:0, fat:0 };

  return {
    grams_total: gramsTotal,
    totals: {
      kcal: Math.round(totals.kcal),
      protein: r1(totals.protein),
      carbs:   r1(totals.carbs),
      fat:     r1(totals.fat),
      fiber:   r1(totals.fiber),
      sodium:  Math.round(totals.sodium)
    },
    per_gram: perGram,
    per_100g: {
      kcal: Math.round(perGram.kcal * 100),
      protein: r1(perGram.protein * 100),
      carbs:   r1(perGram.carbs * 100),
      fat:     r1(perGram.fat * 100),
    },
    flags,
    details,
    missing
  };
}


