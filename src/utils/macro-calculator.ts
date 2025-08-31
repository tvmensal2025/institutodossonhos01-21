/**
 * Utilitário para cálculo de macronutrientes e TDEE baseado em objetivos
 */

// Enums para objetivos
export enum NutritionObjective {
  LOSE = 'perder peso',
  MAINTAIN = 'manter peso',
  GAIN = 'ganhar peso',
  LEAN_MASS = 'ganhar massa muscular'
}

// Interface para dados físicos do usuário
export interface PhysicalData {
  peso_kg: number;
  altura_cm?: number;
  idade?: number;
  sexo?: string;
  nivel_atividade?: string;
}

// Interface para metas nutricionais
export interface NutritionalGoals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
}

// Constantes para cálculos de macros (g/kg)
const MACRO_CONSTANTS = {
  // Proteína por objetivo (g/kg)
  PROTEIN: {
    [NutritionObjective.LOSE]: 2.2,      // Perder peso: 2.2g/kg
    [NutritionObjective.MAINTAIN]: 1.8,  // Manter peso: 1.8g/kg
    [NutritionObjective.GAIN]: 1.6,      // Ganhar peso: 1.6g/kg
    [NutritionObjective.LEAN_MASS]: 2.0  // Ganhar massa muscular: 2.0g/kg
  },
  // Gordura por objetivo (g/kg)
  FAT: {
    [NutritionObjective.LOSE]: 0.8,      // Perder peso: 0.8g/kg (mínimo 0.6g/kg)
    [NutritionObjective.MAINTAIN]: 0.8,  // Manter peso: 0.8g/kg
    [NutritionObjective.GAIN]: 0.9,      // Ganhar peso: 0.9g/kg
    [NutritionObjective.LEAN_MASS]: 0.8  // Ganhar massa muscular: 0.8g/kg
  },
  // Ajuste calórico por objetivo (% do TDEE)
  CALORIE_ADJUSTMENT: {
    [NutritionObjective.LOSE]: 0.8,      // Perder peso: -20% do TDEE
    [NutritionObjective.MAINTAIN]: 1.0,  // Manter peso: 100% do TDEE
    [NutritionObjective.GAIN]: 1.1,      // Ganhar peso: +10% do TDEE
    [NutritionObjective.LEAN_MASS]: 1.15 // Ganhar massa muscular: +15% do TDEE
  },
  // Mínimo de carboidratos (g)
  MIN_CARBS: 50,
  // Mínimo de gordura (g/kg) para ajuste
  MIN_FAT: 0.6
};

/**
 * Calcula o BMR (Metabolismo Basal) usando a fórmula Mifflin-St Jeor
 * @param weight Peso em kg
 * @param height Altura em cm
 * @param age Idade em anos
 * @param sex Sexo ('M'/'F' ou string que comece com 'm'/'f')
 * @returns BMR em kcal/dia
 */
export function calculateBMR(weight: number, height: number, age: number, sex: string): number {
  const isFemale = sex.toLowerCase().startsWith('f');
  
  // Mifflin-St Jeor: homem: 10*w + 6.25*h − 5*a + 5 ; mulher: 10*w + 6.25*h − 5*a − 161
  const bmr = isFemale
    ? 10 * weight + 6.25 * height - 5 * age - 161
    : 10 * weight + 6.25 * height - 5 * age + 5;
    
  return Math.round(bmr);
}

/**
 * Converte o nível de atividade em fator multiplicador para TDEE
 * @param activityLevel String descrevendo nível de atividade
 * @returns Fator multiplicador para TDEE
 */
export function getActivityFactor(activityLevel?: string): number {
  if (!activityLevel) return 1.5; // Valor padrão
  
  const level = activityLevel.toLowerCase();
  
  if (level.includes('sedent') || level.includes('baixo')) return 1.2;
  if (level.includes('leve')) return 1.375;
  if (level.includes('moder')) return 1.55;
  if (level.includes('alto') || level.includes('intenso')) return 1.725;
  if (level.includes('atleta') || level.includes('muito')) return 1.9;
  
  return 1.5; // Valor padrão (moderado)
}

/**
 * Calcula o TDEE (Gasto Energético Diário Total)
 * @param physicalData Dados físicos do usuário
 * @returns TDEE em kcal/dia
 */
export function calculateTDEE(physicalData: PhysicalData): number {
  const { peso_kg, altura_cm, idade, sexo, nivel_atividade } = physicalData;
  
  // Peso limítrofe para aplicar correção para pessoas com obesidade
  const LIMITE_OBESIDADE = 120; // kg
  
  // Fallback se faltar altura/idade/sexo
  if (!altura_cm || !idade || !sexo) {
    // Ajuste especial para pessoas com peso elevado: usar base de 30 kcal/kg para os primeiros 120kg
    // e 22 kcal/kg para o peso acima disso
    if (peso_kg > LIMITE_OBESIDADE) {
      const baseTDEE = 30 * LIMITE_OBESIDADE;
      const excessTDEE = 22 * (peso_kg - LIMITE_OBESIDADE);
      return Math.round(baseTDEE + excessTDEE);
    }
    
    return Math.round(30 * peso_kg);
  }
  
  // Cálculo mais preciso usando Mifflin-St Jeor
  const bmr = calculateBMR(peso_kg, altura_cm, idade, sexo);
  const activityFactor = getActivityFactor(nivel_atividade);
  
  // Para pessoas com obesidade severa, aplicar um fator de correção
  // A equação de Mifflin-St Jeor tende a superestimar em casos de IMC muito alto
  if (peso_kg > LIMITE_OBESIDADE) {
    // Calculando IMC
    const heightM = altura_cm / 100;
    const imc = peso_kg / (heightM * heightM);
    
    // Fator de correção que diminui linearmente com o aumento do IMC acima de 40
    const correcao = imc > 40 ? 0.85 : 0.95;
    
    return Math.round(bmr * activityFactor * correcao);
  }
  
  return Math.round(bmr * activityFactor);
}

/**
 * Arredonda um valor para o múltiplo mais próximo
 * @param value Valor a ser arredondado
 * @param multiple Múltiplo para arredondamento
 * @returns Valor arredondado
 */
export function roundToNearest(value: number, multiple: number): number {
  return Math.round(value / multiple) * multiple;
}

/**
 * Calcula as metas nutricionais com base no objetivo e dados físicos
 * @param objective Objetivo nutricional
 * @param physicalData Dados físicos do usuário
 * @param currentGoals Metas atuais (opcional)
 * @param proteinLocked Se a proteína está travada pelo objetivo
 * @returns Metas nutricionais calculadas
 */
export function calculateNutritionalGoals(
  objective: NutritionObjective,
  physicalData: PhysicalData,
  currentGoals?: Partial<NutritionalGoals>,
  proteinLocked = true
): NutritionalGoals {
  const { peso_kg } = physicalData;
  
  // Calcular TDEE
  const tdee = calculateTDEE(physicalData);
  
  // Ajustar calorias com base no objetivo
  const targetCalories = Math.round(tdee * MACRO_CONSTANTS.CALORIE_ADJUSTMENT[objective]);
  
  // Calcular proteína com base no objetivo (ou manter valor atual se destravado)
  const proteinPerKg = MACRO_CONSTANTS.PROTEIN[objective];
  const protein = proteinLocked 
    ? Math.round(proteinPerKg * peso_kg) 
    : (currentGoals?.protein || Math.round(proteinPerKg * peso_kg));
  
  // Calcular gordura com base no objetivo
  const fatPerKg = MACRO_CONSTANTS.FAT[objective];
  const fat = roundToNearest(fatPerKg * peso_kg, 5);
  
  // Calcular calorias de proteína e gordura
  const proteinCalories = protein * 4;
  const fatCalories = fat * 9;
  
  // Calcular carboidratos para fechar calorias
  let carbs = Math.floor((targetCalories - proteinCalories - fatCalories) / 4);
  
  // Se carboidratos < 50g, reduzir gordura para 0.6g/kg e recalcular
  if (carbs < MACRO_CONSTANTS.MIN_CARBS) {
    const reducedFat = roundToNearest(MACRO_CONSTANTS.MIN_FAT * peso_kg, 5);
    const reducedFatCalories = reducedFat * 9;
    carbs = Math.floor((targetCalories - proteinCalories - reducedFatCalories) / 4);
    
    // Se ainda < 50g, forçar mínimo de 50g
    if (carbs < MACRO_CONSTANTS.MIN_CARBS) {
      carbs = MACRO_CONSTANTS.MIN_CARBS;
    }
  }
  
  // Arredondar carboidratos para múltiplo de 5
  carbs = roundToNearest(carbs, 5);
  
  // Recalcular calorias totais após ajustes
  const totalCalories = (protein * 4) + (carbs * 4) + (fat * 9);
  const roundedCalories = roundToNearest(totalCalories, 50);
  
  // Manter fibras do valor atual ou usar padrão
  const fiber = currentGoals?.fiber || 25;
  
  return {
    calories: roundedCalories,
    protein: protein,
    carbs: carbs,
    fat: fat,
    fiber: fiber
  };
}

/**
 * Verifica se a proteína deve ser travada com base no objetivo
 * @param objective Objetivo nutricional
 * @returns Verdadeiro se a proteína deve ser travada
 */
export function shouldLockProtein(objective: NutritionObjective): boolean {
  return objective === NutritionObjective.LOSE || objective === NutritionObjective.LEAN_MASS;
}
