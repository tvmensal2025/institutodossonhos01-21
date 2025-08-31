import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-requested-with, Authorization, X-Client-Info, Content-Type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Max-Age': '86400',
};

const NUTRITION_DEBUG = Deno.env.get('NUTRITION_DEBUG') === 'true';

// Normalizar texto
function normalize(text: string): string {
  if (!text) return '';
  return text.toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove acentos
    .replace(/[^a-z0-9 ]/g, ' ') // remove pontuação
    .trim()
    .replace(/\s+/g, ' '); // normaliza espaços
}

interface DetectedFood {
  name: string;
  grams?: number;
  ml?: number;
  state?: 'cru' | 'cozido' | 'grelhado' | 'frito';
}

interface NutritionCalculation {
  total_kcal: number;
  total_proteina: number;
  total_carbo: number;
  total_gordura: number;
  total_fibras: number;
  total_sodio: number;
  matched_count: number;
  total_count: number;
  unmatched_items: string[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { detected_foods, user_id, analysis_type = 'nutritional_sum', request_id } = await req.json();
    
    console.log('🔥 Sofia Deterministic - Cálculo nutricional exato');
    console.log(`📊 Processando ${detected_foods?.length || 0} alimentos`);
    if (request_id) {
      console.log(`🆔 Request ID: ${request_id}`);
    }

    if (!detected_foods || !Array.isArray(detected_foods)) {
      throw new Error('detected_foods deve ser um array');
    }

    // Buscar nome do usuário para resposta personalizada
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('user_id', user_id)
      .single();
    
    const userName = profile?.full_name?.split(' ')[0] || 'querido(a)';

    // Calcular nutrição determinística
    const nutrition = await calculateDeterministicNutrition(supabase, detected_foods);
    
    // Gerar resposta única formatada
    const response = generateSofiaResponse(userName, nutrition, detected_foods);
    
    // Salvar dados no banco antes de responder
    if (user_id && analysis_type === 'nutritional_sum') {
      await saveFoodAnalysis(supabase, user_id, detected_foods, nutrition);
    }

    return new Response(JSON.stringify({
      success: true,
      analysis_type: 'nutritional_sum',
      sofia_response: response,
      nutrition_data: nutrition
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Erro Sofia Deterministic:', error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message,
      sofia_response: 'Ops! Tive um problema ao analisar sua refeição. Tente novamente! 😅'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

// Buscar alimento na tabela TACO oficial (taco_foods) - NOVA LÓGICA
async function findNutritionDataFromTaco(supabase: any, foodName: string) {
  console.log(`🔍 Buscando TACO: ${foodName}`);
  
  const normalized = normalize(foodName);
  
  // Buscar todos os registros que fazem match com o nome
  const { data: allMatches } = await supabase
    .from('taco_foods')
    .select('*')
    .or(`nome_alimento.ilike.%${normalized}%,nome_alimento.ilike.%${foodName}%`)
    .order('codigo', { ascending: true }); // Ordenar por código (menor código tem prioridade)

  if (!allMatches || allMatches.length === 0) {
    console.log(`❌ Não encontrado na TACO: ${foodName}`);
    return null;
  }

  // Agrupar por nome normalizado para remover duplicatas
  const grouped = new Map();
  
  for (const food of allMatches) {
    const normalizedDesc = normalize(food.nome_alimento); // Corrigido: usar nome_alimento
    
    if (!grouped.has(normalizedDesc)) {
      grouped.set(normalizedDesc, []);
    }
    grouped.get(normalizedDesc).push(food);
  }

  // Encontrar o melhor match por grupo
  let bestFood = null;
  let bestScore = -1;
  let bestCompleteness = -1;
  let bestCode = Number.MAX_SAFE_INTEGER;

  for (const [groupName, foods] of grouped) {
    for (const food of foods) {
      // Calcular score de completude dos macros (priorizar quem tem macros completos)
      const protein = Number(food.proteina_g || 0);
      const carbs = Number(food.carboidratos_g || 0); // Corrigido: carboidratos_g com 's'
      const fat = Number(food.lipidios_g || 0); // Corrigido: lipidios_g com 'i'
      
      const completeness = (protein > 0 ? 1 : 0) + (carbs > 0 ? 1 : 0) + (fat > 0 ? 1 : 0);
      const code = Number(food.codigo || 9999);
      
      // Critério: 1º completude dos macros, 2º menor código
      const shouldReplace = completeness > bestCompleteness || 
                           (completeness === bestCompleteness && code < bestCode);
      
      if (shouldReplace) {
        bestFood = food;
        bestCompleteness = completeness;
        bestCode = code;
      }
    }
  }

  if (bestFood) {
    const protein = Number(bestFood.proteina_g || 0);
    const carbs = Number(bestFood.carboidratos_g || 0); // Corrigido: carboidratos_g com 's'
    const fat = Number(bestFood.lipidios_g || 0); // Corrigido: lipidios_g com 'i'
    
    // NOVA REGRA: Calcular calorias usando fórmula 4×P + 4×C + 9×G (ignorar energia_kcal)
    const calculatedKcal = (protein * 4) + (carbs * 4) + (fat * 9);
    
    console.log(`✅ TACO: ${bestFood.nome_alimento} (código: ${bestFood.codigo}, kcal calculada: ${Math.round(calculatedKcal)})`);
    
    return {
      kcal: calculatedKcal, // Usar valor calculado, não o energia_kcal da tabela
      protein: protein,
      carbs: carbs,
      fat: fat,
      fiber: Number(bestFood.fibra_alimentar_g || 0),
      sodium: Number(bestFood.sodio_mg || 0),
      source: 'TACO_calculated',
      codigo: bestFood.codigo,
      descricao: bestFood.nome_alimento // Corrigido: usar nome_alimento
    };
  }

  console.log(`❌ Nenhum match válido na TACO: ${foodName}`);
  return null;
}

async function calculateDeterministicNutrition(supabase: any, foods: DetectedFood[]): Promise<NutritionCalculation> {
  const result: NutritionCalculation = {
    total_kcal: 0,
    total_proteina: 0,
    total_carbo: 0,
    total_gordura: 0,
    total_fibras: 0,
    total_sodio: 0,
    matched_count: 0,
    total_count: foods.length,
    unmatched_items: []
  };

  console.log(`🔥 CÁLCULO USANDO TABELA TACO OFICIAL - Processando ${foods.length} alimentos`);

  for (const food of foods) {
    let grams = Number(food.grams || 100); // Default 100g se não especificado

    console.log(`🔍 Buscando na TACO: ${food.name} (${grams}g)`);

    // USAR APENAS TABELA TACO OFICIAL
    const foodData = await findNutritionDataFromTaco(supabase, food.name);

    if (foodData) {
      // Calcular nutrientes por grama
      const factor = grams / 100.0;
      
      // Não usar energia_kcal da tabela - calcular com fórmula
      result.total_proteina += (foodData.protein || 0) * factor;
      result.total_carbo += (foodData.carbs || 0) * factor;
      result.total_gordura += (foodData.fat || 0) * factor;
      result.total_fibras += (foodData.fiber || 0) * factor;
      result.total_sodio += (foodData.sodium || 0) * factor;
      
      result.matched_count++;
      console.log(`✅ TACO: ${food.name} - ${Math.round(foodData.kcal * factor)} kcal (código: ${foodData.codigo})`);
    } else {
      result.unmatched_items.push(food.name);
      console.warn(`⚠️ Alimento NÃO ENCONTRADO na TACO oficial: ${food.name}`);
    }
  }

  // Arredondar valores finais e calcular kcal com fórmula 4×P + 4×C + 9×G
  result.total_kcal = Math.round(4 * result.total_proteina + 4 * result.total_carbo + 9 * result.total_gordura);
  result.total_proteina = Math.round(result.total_proteina * 10) / 10;
  result.total_carbo = Math.round(result.total_carbo * 10) / 10;
  result.total_gordura = Math.round(result.total_gordura * 10) / 10;
  result.total_fibras = Math.round(result.total_fibras * 10) / 10;
  result.total_sodio = Math.round(result.total_sodio * 10) / 10;

  console.log(`✅ TACO OFICIAL - Cálculo concluído: ${result.matched_count}/${result.total_count} alimentos processados`);
  
  return result;
}

function generateSofiaResponse(userName: string, nutrition: NutritionCalculation, foods: DetectedFood[]): string {  
  // FORÇAR: Usar APENAS fórmula 4×P + 4×C + 9×G 
  const calculatedKcal = Math.round(4 * nutrition.total_proteina + 4 * nutrition.total_carbo + 9 * nutrition.total_gordura);
  
  // SOBRESCREVER o total_kcal com o valor calculado pela fórmula
  nutrition.total_kcal = calculatedKcal;
  
  return `💪 Proteínas: ${nutrition.total_proteina.toFixed(1)} g
🍞 Carboidratos: ${nutrition.total_carbo.toFixed(1)} g
🥑 Gorduras: ${nutrition.total_gordura.toFixed(1)} g
🔥 Estimativa calórica: ${calculatedKcal} kcal

✅ Obrigado! Seus dados estão salvos.`;
}

async function saveFoodAnalysis(supabase: any, user_id: string, foods: DetectedFood[], nutrition: NutritionCalculation) {
  try {
    // Validar user_id - não salvar se for 'guest'
    if (!user_id || user_id === 'guest') {
      console.log('⚠️ Usuário guest, não salvando no banco');
      return;
    }

    // Preparar dados dos alimentos conforme o schema da tabela food_analysis
    const foodItemsData = foods.map(food => ({
      name: food.name,
      quantity: food.grams || 100,
      unit: 'g',
      state: food.state || null
    }));

    const analysisData = {
      user_id,
      meal_type: 'refeicao',
      food_items: { alimentos: foodItemsData },
      nutrition_analysis: {
        total_calories: nutrition.total_kcal,
        total_protein: nutrition.total_proteina,
        total_carbs: nutrition.total_carbo,
        total_fat: nutrition.total_gordura,
        total_fiber: nutrition.total_fibras,
        total_sodium: nutrition.total_sodio,
        matched_count: nutrition.matched_count,
        total_count: nutrition.total_count,
        unmatched_items: nutrition.unmatched_items
      },
      sofia_analysis: {
        mensagem: `📊 Análise TACO Oficial: ${nutrition.total_kcal} kcal, Proteínas: ${nutrition.total_proteina}g, Carboidratos: ${nutrition.total_carbo}g, Gorduras: ${nutrition.total_gordura}g`,
        fonte: 'TACO Oficial',
        timestamp: new Date().toISOString()
      },
      analysis_text: `Análise nutricional completa: ${nutrition.total_kcal} kcal`
    };

    console.log('💾 Salvando análise completa:', {
      alimentos: foodItemsData.length,
      data: new Date().toISOString().split('T')[0],
      horario: new Date().toTimeString().split(' ')[0],
      calorias: nutrition.total_kcal
    });

    const { error } = await supabase
      .from('food_analysis')
      .insert(analysisData);
    
    if (error) {
      console.error('❌ Erro ao salvar food_analysis:', error);
    } else {
      console.log('✅ Dados salvos com sucesso no food_analysis');
    }
  } catch (error) {
    console.error('❌ Erro ao salvar dados:', error);
  }
}