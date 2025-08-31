// Adaptador para normalizar dados de cardápio entre diferentes formatos
import { debugMealPlan, logRestrictionDebug } from './debug-helper';

export interface StandardMeal {
  title: string;
  description: string;
  ingredients: string[];
  practicalSuggestion?: string;
  modoPreparoElegante?: string; // Instruções elegantes para a seção "Modo de Preparo"
  macros: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber?: number;
    sodium?: number;
    sugar?: number;
    saturatedFat?: number;
    cholesterol?: number;
    potassium?: number;
    calcium?: number;
    iron?: number;
    vitaminA?: number;
    vitaminC?: number;
    vitaminD?: number;
    vitaminE?: number;
    vitaminK?: number;
    vitaminB6?: number;
    vitaminB12?: number;
    magnesium?: number;
    zinc?: number;
  };
}

export interface StandardDayPlan {
  day: number;
  meals: {
    breakfast?: StandardMeal;
    lunch?: StandardMeal;
    snack?: StandardMeal;
    dinner?: StandardMeal;
    supper?: StandardMeal;
  };
  dailyTotals?: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber?: number;
    sodium?: number;
    sugar?: number;
    saturatedFat?: number;
    cholesterol?: number;
    potassium?: number;
    calcium?: number;
    iron?: number;
    vitaminA?: number;
    vitaminC?: number;
    vitaminD?: number;
    vitaminE?: number;
    vitaminK?: number;
    vitaminB6?: number;
    vitaminB12?: number;
    magnesium?: number;
    zinc?: number;
  };
  nutritionalSummary?: {
    totalCalories: number;
    macronutrients: {
      protein: number;
      carbs: number;
      fat: number;
    };
    micronutrients: {
      fiber: number;
      sodium: number;
      calcium: number;
      iron: number;
      vitaminC: number;
    };
  };
  metadata?: {
    variacaoGarantida: number;
    receitasUnicas: string[];
    source: string;
  };
}

// Adapta dados da Edge Function GPT-4 para formato padrão com verificação de restrições
export function adaptGPT4ToStandard(gpt4Data: any): StandardDayPlan[] {
  console.log('🤖 Adaptando dados do GPT-4:', gpt4Data);
  
  if (!gpt4Data) {
    console.warn('⚠️ Dados GPT-4 inválidos para adaptação');
    return [];
  }

  // Verificar se há metadados com restrições
  if (gpt4Data.metadata?.restricoes_aplicadas?.length > 0) {
    console.log('🔍 Verificando restrições nos dados do GPT-4:', gpt4Data.metadata.restricoes_aplicadas);
    logRestrictionDebug(gpt4Data.metadata.restricoes_aplicadas, 'GPT-4 Adapter');
  }

  // Detectar estrutura dos dados GPT-4
  let cardapio;
  
  if (gpt4Data.cardapio?.cardapio) {
    // Estrutura: data.cardapio.cardapio
    console.log('📊 Estrutura GPT-4 detectada: data.cardapio.cardapio');
    cardapio = gpt4Data.cardapio.cardapio;
  } else if (gpt4Data.cardapio) {
    // Estrutura: data.cardapio
    console.log('📊 Estrutura GPT-4 detectada: data.cardapio');
    cardapio = gpt4Data.cardapio;
  } else if (gpt4Data.dia1) {
    // Estrutura: data.dia1, data.dia2 (dados diretos)
    console.log('📊 Estrutura GPT-4 detectada: dados diretos');
    cardapio = gpt4Data;
  } else {
    console.warn('⚠️ Estrutura GPT-4 não reconhecida:', Object.keys(gpt4Data));
    return [];
  }

  const adaptedDays: StandardDayPlan[] = [];

  // Processar cada dia
  for (let dayNum = 1; dayNum <= 7; dayNum++) {
    const diaKey = `dia${dayNum}`;
    const diaData = cardapio[diaKey];
    
    if (!diaData) continue;

    const adaptedDay: StandardDayPlan = {
      day: dayNum,
      meals: {}
    };

    // Mapear refeições do GPT-4 para formato padrão
    const mealMappings = {
      'cafe_manha': 'breakfast',
      'café da manhã': 'breakfast',
      'almoco': 'lunch', 
      'almoço': 'lunch',
      'cafe_tarde': 'snack',
      'lanche': 'snack',
      'jantar': 'dinner',
      'ceia': 'supper'
    };

    Object.entries(mealMappings).forEach(([gpt4Key, standardKey]) => {
      const mealData = diaData[gpt4Key];
      if (mealData) {
        (adaptedDay.meals as any)[standardKey] = adaptGPT4Meal(mealData);
      }
    });

    // Adaptar totais do dia
    if (diaData.totais_do_dia) {
      adaptedDay.dailyTotals = {
        calories: diaData.totais_do_dia.calorias || 0,
        protein: diaData.totais_do_dia.proteinas || 0,
        carbs: diaData.totais_do_dia.carboidratos || 0,
        fat: diaData.totais_do_dia.gorduras || 0,
        fiber: diaData.totais_do_dia.fibras || 0
      };
    }

    adaptedDays.push(adaptedDay);
  }

  // Verificação final de restrições no cardápio adaptado
  if (gpt4Data.metadata?.restricoes_aplicadas?.length > 0 && adaptedDays.length > 0) {
    console.log('🔍 Verificação final de restrições no cardápio adaptado');
    const validation = debugMealPlan(adaptedDays, gpt4Data.metadata.restricoes_aplicadas);
    if (!validation.isValid) {
      console.error('❌ Cardápio adaptado violou restrições:', validation.violations);
      // Retornar vazio para forçar nova geração
      return [];
    } else {
      console.log('✅ Cardápio adaptado respeitou todas as restrições!');
    }
  }

  console.log('✅ Dados GPT-4 adaptados com sucesso!', adaptedDays.length, 'dias encontrados');
  console.log('🔄 Dados adaptados para visualização:', adaptedDays);
  return adaptedDays;
}

// Adapta dados da Edge Function Ultra Safe para formato padrão
export function adaptUltraSafeToStandard(edgeFunctionData: any): StandardDayPlan[] {
  console.log('🔄 Adaptando dados da Edge Function:', edgeFunctionData);
  
  if (!edgeFunctionData) {
    console.warn('⚠️ Dados inválidos para adaptação');
    return [];
  }

  // Detectar estrutura dos dados
  let cardapio;
  
  if (edgeFunctionData.cardapio?.cardapio) {
    // Estrutura: data.cardapio.cardapio
    console.log('📊 Estrutura detectada: data.cardapio.cardapio');
    cardapio = edgeFunctionData.cardapio.cardapio;
  } else if (edgeFunctionData.cardapio) {
    // Estrutura: data.cardapio
    console.log('📊 Estrutura detectada: data.cardapio');
    cardapio = edgeFunctionData.cardapio;
  } else if (edgeFunctionData.dia1) {
    // Estrutura: data.dia1, data.dia2 (dados diretos)
    console.log('📊 Estrutura detectada: dados diretos');
    cardapio = edgeFunctionData;
  } else {
    console.warn('⚠️ Estrutura de dados não reconhecida:', Object.keys(edgeFunctionData));
    return [];
  }
  const adaptedDays: StandardDayPlan[] = [];

  // Processar cada dia
  for (let dayNum = 1; dayNum <= 7; dayNum++) {
    const diaKey = `dia${dayNum}`;
    const diaData = cardapio[diaKey];
    
    if (!diaData) continue;

    const adaptedDay: StandardDayPlan = {
      day: dayNum,
      meals: {}
    };

    // Adaptar cada refeição
    const mealMappings = {
      'cafe_manha': 'breakfast',
      'almoco': 'lunch', 
      'lanche': 'snack',
      'jantar': 'dinner',
      'ceia': 'supper'
    };

    Object.entries(mealMappings).forEach(([edgeKey, standardKey]) => {
      const mealData = diaData[edgeKey];
      if (mealData) {
        (adaptedDay.meals as any)[standardKey] = adaptMeal(mealData);
      }
    });

    // Adaptar totais do dia
    if (diaData.totais_do_dia) {
      adaptedDay.dailyTotals = {
        calories: diaData.totais_do_dia.calorias || 0,
        protein: diaData.totais_do_dia.proteinas || 0,
        carbs: diaData.totais_do_dia.carboidratos || 0,
        fat: diaData.totais_do_dia.gorduras || 0,
        fiber: diaData.totais_do_dia.fibras || 0
      };
    } else {
      // Calcular totais se não existirem
      const dailyTotals = {
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        fiber: 0
      };

      Object.values(adaptedDay.meals).forEach((meal: any) => {
        if (meal?.macros) {
          dailyTotals.calories += meal.macros.calories || 0;
          dailyTotals.protein += meal.macros.protein || 0;
          dailyTotals.carbs += meal.macros.carbs || 0;
          dailyTotals.fat += meal.macros.fat || 0;
          dailyTotals.fiber += meal.macros.fiber || 0;
        }
      });

      adaptedDay.dailyTotals = dailyTotals;
      console.log(`📊 Totais calculados para dia ${dayNum}:`, dailyTotals);
    }

    adaptedDays.push(adaptedDay);
  }

  console.log('✅ Dados adaptados:', adaptedDays);
  return adaptedDays;
}

// Adapta uma refeição individual do GPT-4
function adaptGPT4Meal(mealData: any): StandardMeal {
  const ingredients = Array.isArray(mealData.ingredientes) 
    ? mealData.ingredientes.map((ing: any) => 
        typeof ing === 'string' ? ing : `${ing.nome} (${ing.quantidade})`
      )
    : [];

  // Calcular macros da refeição
  const macros = {
    calories: mealData.calorias_totais || 0,
    protein: mealData.proteinas_totais || 0,
    carbs: mealData.carboidratos_totais || 0,
    fat: mealData.gorduras_totais || 0,
    fiber: mealData.fibras_totais || 0
  };

  return {
    title: mealData.nome || 'Refeição',
    description: mealData.preparo || '1. Organizar todos os ingredientes na bancada de trabalho\n2. Verificar se todos os utensílios estão limpos\n3. Seguir as instruções de preparo específicas\n4. Temperar adequadamente com sal e especiarias\n5. Verificar o ponto de cozimento dos alimentos\n6. Servir na temperatura adequada para cada alimento\n7. Consumir com moderação e atenção\n8. Acompanhar com bebidas adequadas\n9. Limpar a área de preparo após o consumo\n10. Guardar sobras adequadamente\n11. Verificar se todos os nutrientes estão presentes\n12. Aproveitar a refeição com calma e atenção',
    ingredients,
    practicalSuggestion: mealData.tempo_preparo || '',
    macros
  };
}

// Adapta uma refeição individual
function adaptMeal(mealData: any): StandardMeal {
  const ingredients = Array.isArray(mealData.ingredientes) 
    ? mealData.ingredientes.map((ing: any) => 
        typeof ing === 'string' ? ing : `${ing.nome || 'Ingrediente'} (${ing.quantidade || ''})`
      )
    : [];

  // Calcular macros da refeição com valores reais
  const macros = {
    calories: mealData.calorias_totais || 0,
    protein: mealData.proteinas_totais || 0,
    carbs: mealData.carboidratos_totais || 0,
    fat: mealData.gorduras_totais || 0,
    fiber: mealData.fibras_totais || 0
  };

  // Se não temos valores calculados, calcular a partir dos ingredientes
  if (macros.calories === 0 && Array.isArray(mealData.ingredientes)) {
    mealData.ingredientes.forEach((ing: any) => {
      if (typeof ing === 'object' && ing.calorias) {
        macros.calories += ing.calorias || 0;
        macros.protein += ing.proteinas || 0;
        macros.carbs += ing.carboidratos || 0;
        macros.fat += ing.gorduras || 0;
        macros.fiber += ing.fibras || 0;
      }
    });
  }

  console.log(`🍽️ Refeição adaptada: ${mealData.nome}`, macros);

  return {
    title: mealData.nome || 'Refeição',
    description: mealData.preparo || '1. Organizar todos os ingredientes na bancada de trabalho\n2. Verificar se todos os utensílios estão limpos\n3. Seguir as instruções de preparo específicas\n4. Temperar adequadamente com sal e especiarias\n5. Verificar o ponto de cozimento dos alimentos\n6. Servir na temperatura adequada para cada alimento\n7. Consumir com moderação e atenção\n8. Acompanhar com bebidas adequadas\n9. Limpar a área de preparo após o consumo\n10. Guardar sobras adequadamente\n11. Verificar se todos os nutrientes estão presentes\n12. Aproveitar a refeição com calma e atenção',
    ingredients,
    practicalSuggestion: mealData.dica_nutricional || mealData.tempo_preparo || '',
    macros
  };
}

// Adapta dados salvos do histórico
export function adaptHistoryData(historyItem: any): StandardDayPlan[] {
  console.log('📚 Adaptando dados do histórico:', historyItem);
  
  const mealPlanData = historyItem.meal_plan_data;
  
  if (!mealPlanData) {
    console.warn('⚠️ Nenhum dado de meal_plan_data encontrado');
    return [];
  }

  // Se já está no formato padrão
  if (Array.isArray(mealPlanData) && mealPlanData[0]?.day) {
    console.log('📋 Dados já estão no formato padrão');
    return mealPlanData;
  }
  
  if (Array.isArray(mealPlanData.plan) && mealPlanData.plan[0]?.day) {
    console.log('📋 Dados no formato padrão dentro de plan');
    return mealPlanData.plan;
  }

  // Se é dados da Edge Function GPT-4
  if (mealPlanData.plan?.cardapio) {
    console.log('🤖 Adaptando dados GPT-4 do histórico');
    return adaptGPT4ToStandard(mealPlanData.plan);
  }

  // Se é dados da Edge Function Ultra Safe
  if (mealPlanData.cardapio) {
    console.log('🔧 Adaptando dados Ultra Safe do histórico');
    return adaptUltraSafeToStandard(mealPlanData);
  }

  console.warn('⚠️ Formato de dados do histórico não reconhecido:', Object.keys(mealPlanData));
  return [];
}

// Adapta dados do Mealie para formato padrão com verificação de restrições
export function adaptMealieToStandard(mealieData: any): StandardDayPlan[] {
  console.log('🍽️ Adaptando dados do Mealie:', mealieData);
  
  let processedData: any[] = [];
  
  // Verificar se os dados estão na estrutura correta
  if (mealieData?.cardapio && Array.isArray(mealieData.cardapio)) {
    console.log('📊 Estrutura detectada: data.cardapio (array)');
    processedData = mealieData.cardapio;
  } else if (mealieData?.cardapio && typeof mealieData.cardapio === 'object' && mealieData.cardapio.dia1) {
    console.log('📊 Estrutura detectada: data.cardapio (objeto com dias)');
    // Converter objeto com dias para array
    const cardapioObj = mealieData.cardapio;
    processedData = Object.keys(cardapioObj)
      .filter(key => key.startsWith('dia'))
      .sort()
      .map((key, index) => ({
        day: index + 1,
        meals: convertMealieObjectToMealsArray(cardapioObj[key])
      }));
  } else if (mealieData?.dia1) {
    console.log('📊 Estrutura detectada: objeto direto com dias');
    // Converter objeto direto com dias para array
    processedData = Object.keys(mealieData)
      .filter(key => key.startsWith('dia'))
      .sort()
      .map((key, index) => ({
        day: index + 1,
        meals: convertMealieObjectToMealsArray(mealieData[key])
      }));
  } else if (Array.isArray(mealieData)) {
    console.log('📊 Estrutura detectada: array direto');
    processedData = mealieData;
  } else {
    console.warn('⚠️ Estrutura de dados do Mealie não reconhecida:', Object.keys(mealieData || {}));
    return [];
  }

  // Debug das restrições se existirem
  if (processedData.length > 0) {
    const firstDay = processedData[0];
    if (firstDay?.restrictions) {
      logRestrictionDebug(firstDay.restrictions, 'Mealie');
      const validation = debugMealPlan(processedData, firstDay.restrictions);
      if (!validation.isValid) {
        console.error('❌ Mealie violou restrições:', validation.violations);
        return [];
      }
    }
  }

  const adaptedDays: StandardDayPlan[] = [];

  processedData.forEach((dayData: any) => {
    if (!dayData || !dayData.meals || !Array.isArray(dayData.meals)) {
      console.warn('⚠️ Dia sem refeições válidas:', dayData);
      return;
    }

    // Verificar apenas as refeições que foram realmente solicitadas
    const dayMealTypes = dayData.meals.map((m: any) => m.meal_type || m.category);
    console.log(`📋 Dia ${dayData.day} tem refeições:`, dayMealTypes);
    
    // Respeitar exatamente o que foi gerado
    console.log(`✅ Respeitando seleção do usuário: ${dayMealTypes.length} refeições`);

    const adaptedDay: StandardDayPlan = {
      day: dayData.day || 1,
      meals: {}
    };

    // Mapear refeições do Mealie para formato padrão
    dayData.meals.forEach((meal: any) => {
      // Detectar tipo de refeição de múltiplas fontes
      const mealType = (meal.meal_type || meal.category || meal.tag || '').toLowerCase().trim();
      
      console.log(`🔍 Processando refeição: "${mealType}" -> Recipe: "${meal.recipe_name || meal.name}"`);
      
      // Mapear tipos de refeição para formato padrão com todas as variações do Mealie
      let standardKey: keyof StandardDayPlan['meals'];
      
      switch (mealType) {
        // Café da manhã - breakfast
        case 'café da manhã':
        case 'cafe da manha':
        case 'coffee morning':
        case 'breakfast':
        case 'desjejum':
        case 'morning':
        case 'manhã':
          standardKey = 'breakfast';
          console.log(`✅ Mapeado ${mealType} -> breakfast`);
          break;
        
        // Almoço - lunch  
        case 'almoço':
        case 'almoco':
        case 'lunch':
        case 'main meal':
        case 'midday':
        case 'meio-dia':
        case 'tarde':
          standardKey = 'lunch';
          console.log(`✅ Mapeado ${mealType} -> lunch`);
          break;
        
        // Lanche - snack
        case 'lanche':
        case 'lanche da tarde':
        case 'café da tarde':
        case 'cafe da tarde':
        case 'snack':
        case 'merenda':
        case 'colação':
        case 'afternoon snack':
        case 'teatime':
        case 'mid-afternoon':
          standardKey = 'snack';
          console.log(`✅ Mapeado ${mealType} -> snack`);
          break;
        
        // Jantar - dinner
        case 'jantar':
        case 'janta':
        case 'dinner':
        case 'evening meal':
        case 'noite':
        case 'night':
          standardKey = 'dinner';
          console.log(`✅ Mapeado ${mealType} -> dinner`);
          break;
        
        // Ceia - late snack
        case 'ceia':
        case 'lanche da noite':
        case 'late snack':
        case 'lanche noturno':
        case 'bedtime snack':
        case 'evening snack':
        case 'madrugada':
        case 'supper':
          standardKey = 'supper';
          console.log(`✅ Mapeado ${mealType} -> supper`);
          break;
        
        default:
          console.warn(`⚠️ Tipo de refeição desconhecido: "${mealType}", usando como lanche`);
          standardKey = 'snack'; // Default para lanche ao invés de pular
          break;
      }
      
      // Gerar instruções de preparo ULTRA DETALHADAS baseadas no nome da receita
      const gerarInstrucoesPreparo = (nome: string, tipo: string) => {
        const nomeLower = nome.toLowerCase();
        
        if (nomeLower.includes('aveia') || nomeLower.includes('oat')) {
          return '1. Organizar todos os ingredientes: aveia, leite, banana, mel, canela\n2. Medir 45g de aveia e colocar em uma panela\n3. Adicionar 150ml de leite desnatado à panela\n4. Aquecer em fogo médio até o leite quase ferver\n5. Reduzir o fogo para baixo e adicionar a aveia\n6. Mexer constantemente por 4-6 minutos até engrossar\n7. Cortar a banana em rodelas de 1cm\n8. Adicionar a banana e 5g de mel à panela\n9. Misturar suavemente para não amassar a banana\n10. Polvilhar 1g de canela em pó por cima\n11. Cozinhar por mais 1-2 minutos para apurar o sabor\n12. Transferir para uma tigela e servir quente imediatamente';
        }
        
        if (nomeLower.includes('frango') || nomeLower.includes('chicken')) {
          return '1. Organizar todos os ingredientes: frango, sal, pimenta, ervas, azeite\n2. Lavar o frango em água corrente e secar com papel toalha\n3. Temperar o frango com sal, pimenta-do-reino, alho picado e ervas\n4. Deixar marinar por 15-20 minutos na geladeira\n5. Retirar o frango da geladeira 10 minutos antes de cozinhar\n6. Aquecer uma frigideira antiaderente em fogo médio-alto\n7. Adicionar 1 colher de sopa de azeite e aguardar esquentar\n8. Colocar o frango na frigideira e grelhar por 6-8 minutos de cada lado\n9. Verificar se está cozido: temperatura interna deve ser 74°C\n10. Deixar descansar por 5-7 minutos antes de cortar\n11. Cortar em fatias diagonais para melhor apresentação\n12. Servir quente com molho ou acompanhamentos';
        }
        
        if (nomeLower.includes('iogurte') || nomeLower.includes('yogurt')) {
          return '1. Organizar todos os ingredientes: iogurte, granola, frutas (opcional)\n2. Verificar se o iogurte está na temperatura adequada\n3. Medir a porção de iogurte desejada (aproximadamente 150g)\n4. Colocar o iogurte em uma tigela ou copo\n5. Adicionar granola por cima (aproximadamente 30g)\n6. Opcional: adicionar frutas frescas picadas\n7. Misturar suavemente se desejar\n8. Polvilhar canela ou mel a gosto\n9. Servir imediatamente para manter a crocância da granola\n10. Consumir em até 30 minutos para melhor sabor\n11. Guardar sobras na geladeira por até 2 dias\n12. Acompanhar com água ou chá para hidratação';
        }
        
        if (nomeLower.includes('overnight') || nomeLower.includes('chia')) {
          return '1. Organizar todos os ingredientes: aveia, chia, leite, frutas, mel\n2. Medir 50g de aveia e colocar em um pote com tampa\n3. Adicionar 1 colher de sopa de sementes de chia\n4. Adicionar 200ml de leite (pode ser vegetal)\n5. Adicionar 1 colher de chá de mel ou adoçante\n6. Misturar bem todos os ingredientes\n7. Fechar o pote e deixar na geladeira por 8-12 horas\n8. Na manhã seguinte, retirar da geladeira\n9. Adicionar frutas frescas picadas por cima\n10. Misturar suavemente para distribuir as frutas\n11. Servir frio ou aquecer por 30 segundos no microondas\n12. Consumir imediatamente para melhor textura';
        }
        
        // Instruções padrão baseadas no tipo de refeição
        switch (tipo) {
          case 'café da manhã':
          case 'cafe da manha':
            return '1. Organizar todos os ingredientes na bancada de trabalho\n2. Verificar se todos os utensílios estão limpos e disponíveis\n3. Preparar conforme receita específica de cada ingrediente\n4. Aquecer os alimentos que precisam ser servidos quentes\n5. Montar o prato de forma atrativa e organizada\n6. Acompanhar com café, chá ou suco natural\n7. Consumir em até 30 minutos para manter a qualidade\n8. Guardar sobras adequadamente na geladeira\n9. Limpar a bancada após o preparo\n10. Verificar se todos os ingredientes foram utilizados corretamente';
          
          case 'almoço':
          case 'almoco':
            return '1. Organizar todos os ingredientes por categoria: proteínas, carboidratos, vegetais\n2. Preparar os ingredientes principais em ordem de cozimento\n3. Cozinhar primeiro a proteína (carne, frango, peixe, etc.)\n4. Em seguida, preparar o carboidrato (arroz, batata, etc.)\n5. Por último, preparar os vegetais para manter a frescura\n6. Temperar adequadamente cada componente\n7. Verificar o ponto de cozimento de cada item\n8. Montar o prato de forma atrativa e balanceada\n9. Servir quente e com apresentação adequada\n10. Acompanhar com salada ou legumes frescos\n11. Verificar se as porções estão adequadas\n12. Guardar sobras para refeições posteriores';
          
          case 'lanche':
          case 'café da tarde':
          case 'cafe da tarde':
            return '1. Organizar todos os ingredientes na bancada\n2. Verificar se os ingredientes estão frescos e adequados\n3. Preparar de forma simples e rápida para consumo imediato\n4. Medir porções adequadas para um lanche\n5. Combinar diferentes grupos alimentares\n6. Servir em porção adequada para o momento\n7. Consumir entre as refeições principais\n8. Manter hidratação com água ou chá\n9. Evitar exageros para não comprometer a próxima refeição\n10. Limpar a área de preparo após o consumo';
          
          case 'jantar':
            return '1. Organizar todos os ingredientes para uma refeição mais leve\n2. Preparar uma refeição com menos calorias que o almoço\n3. Cozinhar com pouco óleo para facilitar a digestão\n4. Incluir vegetais frescos e proteínas magras\n5. Evitar carboidratos complexos em excesso\n6. Servir em porção moderada para não sobrecarregar\n7. Consumir pelo menos 2 horas antes de dormir\n8. Incluir alimentos que facilitem o sono\n9. Evitar alimentos muito pesados ou gordurosos\n10. Acompanhar com chá ou água\n11. Verificar se a refeição está balanceada\n12. Guardar adequadamente para o dia seguinte';
          
          default:
            return '1. Organizar todos os ingredientes na bancada de trabalho\n2. Verificar se todos os utensílios estão limpos\n3. Seguir as instruções de preparo específicas\n4. Temperar adequadamente com sal e especiarias\n5. Verificar o ponto de cozimento dos alimentos\n6. Servir na temperatura adequada para cada alimento\n7. Consumir com moderação e atenção\n8. Acompanhar com bebidas adequadas\n9. Limpar a área de preparo após o consumo\n10. Guardar sobras adequadamente\n11. Verificar se todos os nutrientes estão presentes\n12. Aproveitar a refeição com calma e atenção';
        }
      };

      // Mapear dados nutricionais do Mealie com múltiplas fontes de dados
      const nutritionData = meal.nutrition || meal.nutritionInfo || meal.nutritionalInfo || {};
      
      adaptedDay.meals[standardKey] = {
        title: meal.recipe_name || meal.name || meal.title || 'Refeição',
        description: gerarInstrucoesPreparo(meal.recipe_name || meal.name || meal.title || '', mealType),
        ingredients: Array.isArray(meal.ingredients) 
          ? meal.ingredients.map((ing: any) => {
              if (typeof ing === 'string') return ing;
              if (typeof ing === 'object' && ing !== null) {
                return ing.nome || ing.name || ing.food || ing.note || `${ing.quantidade || ing.quantity || ''}${ing.unit ? ' ' + ing.unit : ''} de ${ing.alimento || ing.ingredient || 'ingrediente'}`.trim();
              }
              return 'Ingrediente não identificado';
            })
          : meal.ingredients 
            ? meal.ingredients.split(',').map((ing: string) => ing.trim()) 
            : meal.ingredientes && Array.isArray(meal.ingredientes)
              ? meal.ingredientes.map((ing: any) => {
                  if (typeof ing === 'string') return ing;
                  if (typeof ing === 'object' && ing !== null) {
                    return ing.nome || ing.name || ing.food || ing.note || `${ing.quantidade || ing.quantity || ''}${ing.unit ? ' ' + ing.unit : ''} de ${ing.alimento || ing.ingredient || 'ingrediente'}`.trim();
                  }
                  return 'Ingrediente não identificado';
                })
              : meal.recipeIngredient && Array.isArray(meal.recipeIngredient)
                ? meal.recipeIngredient.map((ing: any) => {
                    if (typeof ing === 'string') return ing;
                    if (typeof ing === 'object' && ing !== null) {
                      return ing.nome || ing.name || ing.food || ing.note || `${ing.quantidade || ing.quantity || ''}${ing.unit ? ' ' + ing.unit : ''} de ${ing.alimento || ing.ingredient || 'ingrediente'}`.trim();
                    }
                    return 'Ingrediente não identificado';
                  })
                : [],
        practicalSuggestion: meal.prep_time 
          ? `Tempo de preparo: ${meal.prep_time}` 
          : meal.tempo_preparo 
            ? `Tempo de preparo: ${meal.tempo_preparo}` 
            : meal.totalTime
              ? `Tempo total: ${meal.totalTime}`
              : meal.prepTime
                ? `Tempo de preparo: ${meal.prepTime}`
                : 'Tempo de preparo não informado',
        macros: {
          // Calorias - priorizar dados diretos do edge function atualizado
          calories: Number(meal.calories) || 
                   Number(meal.nutrition?.calories) ||
                   Number(meal.calorias) || 
                   Number(nutritionData.calories) ||
                   Number(nutritionData.kcal) ||
                   0,
          
          // Proteínas - priorizar dados diretos do edge function atualizado
          protein: Number(meal.protein) || 
                  Number(meal.nutrition?.protein) ||
                  Number(meal.proteinas) || 
                  Number(nutritionData.protein) ||
                  Number(nutritionData.proteinContent) ||
                  0,
          
          // Carboidratos - priorizar dados diretos do edge function atualizado
          carbs: Number(meal.carbohydrates) ||
                Number(meal.nutrition?.carbohydrates) ||
                Number(meal.carbs) || 
                Number(meal.carboidratos) || 
                Number(nutritionData.carbs) ||
                Number(nutritionData.carbohydrateContent) ||
                0,
          
          // Gorduras - priorizar dados diretos do edge function atualizado
          fat: Number(meal.fat) || 
              Number(meal.nutrition?.fat) ||
              Number(meal.gorduras) || 
              Number(meal.fats) ||
              Number(nutritionData.fat) ||
              Number(nutritionData.fatContent) ||
              0,
          
          // Fibras - priorizar dados diretos do edge function atualizado
          fiber: Number(meal.fiber) || 
                Number(meal.nutrition?.fiber) ||
                Number(meal.fibras) || 
                Number(nutritionData.fiber) ||
                Number(nutritionData.fiberContent) ||
                0
        }
      };

      // Log detalhado do mapeamento para debug
      console.log(`🍽️ Mapeado ${mealType} → ${standardKey}:`, {
        nome: meal.recipe_name || meal.name || meal.title,
        ingredientes: adaptedDay.meals[standardKey]?.ingredients?.length || 0,
        macros: adaptedDay.meals[standardKey]?.macros
      });
    });

    // Calcular totais do dia baseado nas refeições adaptadas
    let dailyTotals = {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      fiber: 0
    };

    Object.values(adaptedDay.meals).forEach((meal: any) => {
      if (meal?.macros) {
        dailyTotals.calories += meal.macros.calories || 0;
        dailyTotals.protein += meal.macros.protein || 0;
        dailyTotals.carbs += meal.macros.carbs || 0;
        dailyTotals.fat += meal.macros.fat || 0;
        dailyTotals.fiber += meal.macros.fiber || 0;
      }
    });

    adaptedDay.dailyTotals = dailyTotals;
    adaptedDays.push(adaptedDay);
  });

  console.log('✅ Dados do Mealie adaptados:', adaptedDays);
  return adaptedDays;
}

// Função auxiliar para converter objeto do Mealie para array de refeições
function convertMealieObjectToMealsArray(dayObj: any): any[] {
  const meals: any[] = [];
  const mealTypes = ['cafe_manha', 'almoco', 'lanche', 'jantar', 'ceia'];
  
  mealTypes.forEach(mealType => {
    if (dayObj[mealType]) {
      const meal = dayObj[mealType];
      meals.push({
        meal_type: getMealTypeDisplayName(mealType),
        recipe_name: meal.nome || 'Refeição personalizada',
        recipe_description: meal.preparo || '',
        ingredients: meal.ingredientes || [],
        calories: meal.calorias_totais || 0,
        protein: meal.proteinas_totais || 0,
        carbs: meal.carboidratos_totais || 0,
        fat: meal.gorduras_totais || 0,
        fiber: meal.fibras_totais || 0,
        source: 'personalizada',
        nutrition_source: 'taco_calculated'
      });
    }
  });
  
  return meals;
}

// Função auxiliar para converter tipo de refeição
function getMealTypeDisplayName(mealType: string): string {
  const mappings: { [key: string]: string } = {
    'cafe_manha': 'café da manhã',
    'almoco': 'almoço',
    'lanche': 'lanche',
    'jantar': 'jantar',
    'ceia': 'ceia'
  };
  
  return mappings[mealType] || mealType;
}

// Adapta uma refeição individual do Mealie
function adaptMealieMeal(mealData: any): StandardMeal {
  const ingredients = Array.isArray(mealData.ingredientes) 
    ? mealData.ingredientes
    : [];

  const macros = {
    calories: mealData.calorias || 0,
    protein: mealData.proteinas || 0,
    carbs: mealData.carboidratos || 0,
    fat: mealData.gorduras || 0,
    fiber: mealData.fibras || 0
  };

  return {
    title: mealData.nome || 'Receita do Mealie',
    description: mealData.preparo || '1. Organizar todos os ingredientes na bancada de trabalho\n2. Verificar se todos os utensílios estão limpos\n3. Seguir as instruções de preparo específicas\n4. Temperar adequadamente com sal e especiarias\n5. Verificar o ponto de cozimento dos alimentos\n6. Servir na temperatura adequada para cada alimento\n7. Consumir com moderação e atenção\n8. Acompanhar com bebidas adequadas\n9. Limpar a área de preparo após o consumo\n10. Guardar sobras adequadamente\n11. Verificar se todos os nutrientes estão presentes\n12. Aproveitar a refeição com calma e atenção',
    ingredients,
    practicalSuggestion: mealData.tempo_preparo ? `Tempo de preparo: ${mealData.tempo_preparo} min` : '',
    macros
  };
}

// Adapta dados do Mealie Real (formato específico da Edge Function) para formato padrão
export function adaptMealieRealToStandard(mealieData: any): StandardDayPlan[] {
  console.log('🍽️ Adaptando dados do Mealie Real:', mealieData);
  
  if (!mealieData || typeof mealieData !== 'object') {
    console.warn('⚠️ Dados inválidos para adaptação');
    return [];
  }
  
  const adaptedDays: StandardDayPlan[] = [];
  const dayKeys = Object.keys(mealieData).filter(key => key.startsWith('dia'));
  dayKeys.sort();
  
  dayKeys.forEach((dayKey, index) => {
    const dayNumber = index + 1;
    const dayData = mealieData[dayKey];
    
    if (!dayData || typeof dayData !== 'object') {
      console.warn(`⚠️ Dados do dia ${dayNumber} inválidos`);
      return;
    }
    
    console.log(`📅 Processando dia ${dayNumber}`);
    
    const adaptedDay: StandardDayPlan = {
      day: dayNumber,
      meals: {}
    };
    
    const mealMappings = {
      'cafe_manha': 'breakfast',
      'almoco': 'lunch', 
      'lanche': 'snack',
      'jantar': 'dinner',
      'ceia': 'supper'
    };
    
    Object.keys(mealMappings).forEach(mealieKey => {
      const standardKey = mealMappings[mealieKey as keyof typeof mealMappings];
      const mealData = dayData[mealieKey];
      
      if (mealData && typeof mealData === 'object') {
        console.log(`🍽️ Adaptando ${mealieKey} -> ${standardKey}: ${mealData.nome}`);
        
        // Adaptar ingredientes para formato string[]
        const ingredients = (mealData.ingredientes || []).map((ing: any) => {
          const nome = ing.nome || 'Ingrediente';
          const quantidade = ing.quantidade || '1 unidade';
          const observacao = ing.observacao ? ` (${ing.observacao})` : '';
          return `${quantidade} de ${nome}${observacao}`;
        });
        
        // Usar preparo compacto simples para exibição principal
        const practicalSuggestion = mealData.preparo_compacto || 
                                   mealData.preparo_display || 
                                   mealData.descricao || 
                                   `${mealData.nome} - ${mealData.porcoes || '1 porção'} - ${mealData.tempo_total || '30 min'}`;
        
        // Usar instruções elegantes para a seção "Modo de Preparo"
        const modoPreparoElegante = mealData.preparo_elegante || mealData.preparo || practicalSuggestion;
        
        adaptedDay.meals[standardKey as keyof StandardDayPlan['meals']] = {
          title: mealData.nome || 'Refeição',
          description: mealData.descricao || '',
          ingredients,
          practicalSuggestion: practicalSuggestion,
          modoPreparoElegante: modoPreparoElegante, // Instruções elegantes para a seção "Modo de Preparo"
          macros: {
            calories: mealData.nutricao?.calorias || 0,
            protein: mealData.nutricao?.proteinas || 0,
            carbs: mealData.nutricao?.carboidratos || 0,
            fat: mealData.nutricao?.gorduras || 0,
            fiber: mealData.nutricao?.fibras || 0,
            sodium: mealData.nutricao?.sodio || 0
          }
        };
      }
    });
    
    // Adicionar totais do dia se disponíveis
    if (dayData.totais_nutricionais) {
      adaptedDay.dailyTotals = {
        calories: dayData.totais_nutricionais.calorias || 0,
        protein: dayData.totais_nutricionais.proteinas || 0,
        carbs: dayData.totais_nutricionais.carboidratos || 0,
        fat: dayData.totais_nutricionais.gorduras || 0,
        fiber: dayData.totais_nutricionais.fibras || 0,
        sodium: dayData.totais_nutricionais.sodio || 0
      };
    }
    
    adaptedDays.push(adaptedDay);
    console.log(`✅ Dia ${dayNumber} adaptado com sucesso`);
  });
  
  console.log(`🎉 Total adaptado: ${adaptedDays.length} dias`);
  return adaptedDays;
}
