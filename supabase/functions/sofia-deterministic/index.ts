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

// Normalização de texto para busca (igual ao nutrition-calc.ts)
function normalizeText(text: string): string {
  return text.toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .replace(/[^a-z0-9\s]/g, ' ') // Remove caracteres especiais
    .replace(/\s+/g, ' ') // Remove espaços múltiplos
    .trim();
}

// Base de dados será carregada dinamicamente da tabela taco_foods
let TACO_FOODS: any[] = [];

// Função para carregar dados da TACO
async function loadTacoFoods(supabase: any) {
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

// Buscar alimento na TACO por nome (busca flexível)
function findTacoFood(name: string): any | null {
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

async function calculateDeterministicNutrition(supabase: any, foods: DetectedFood[]): Promise<NutritionCalculation> {
  // Carregar dados da TACO
  await loadTacoFoods(supabase);
  
  let totals = { kcal: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sodium: 0 };
  let details: Array<{name: string; grams: number; tacoFood: any | null; contrib: any}> = [];
  let missing: string[] = [];
  let gramsTotal = 0;

  console.log(`🔥 CÁLCULO NUTRICIONAL CORRETO - TACO FOODS - Processando ${foods.length} alimentos`);

  for (const item of foods) {
    const tacoFood = findTacoFood(item.name);
    const g = Number(item.grams) || 100;
    
    console.log(`🔍 Buscando: ${item.name} (${g}g)`);
    
    if (!tacoFood || g <= 0) { 
      missing.push(item.name);
      console.warn(`❌ NÃO ENCONTRADO: ${item.name}`);
      continue; 
    }

    const factor = g / 100.0;
    const c = {
      protein: (tacoFood.proteina_g || 0) * factor,
      carbs: (tacoFood.carboidratos_g || 0) * factor,
      fat: (tacoFood.lipidios_g || 0) * factor,
      fiber: (tacoFood.fibra_alimentar_g || 0) * factor,
      sodium: (tacoFood.sodio_mg || 0) * factor
    };

    // Somar macros (kcal será calculado depois usando a fórmula 4×P + 4×C + 9×G)
    totals.protein += c.protein;
    totals.carbs   += c.carbs;
    totals.fat     += c.fat;
    totals.fiber   += c.fiber;
    totals.sodium  += c.sodium;
    gramsTotal     += g;

    details.push({ name: item.name, grams: g, tacoFood, contrib: c });
    
    console.log(`✅ TACO: ${tacoFood.nome_alimento}`);
    console.log(`   ${g}g = ${c.protein.toFixed(1)}g prot, ${c.carbs.toFixed(1)}g carb, ${c.fat.toFixed(1)}g gord`);
  }

  // ✅ CALCULAR KCAL USANDO A FÓRMULA CORRETA: 4×P + 4×C + 9×G
  totals.kcal = 4 * totals.protein + 4 * totals.carbs + 9 * totals.fat;

  // Preparar resultado final
  const result: NutritionCalculation = {
    total_kcal: Math.round(totals.kcal),
    total_proteina: Math.round(totals.protein * 10) / 10,
    total_carbo: Math.round(totals.carbs * 10) / 10,
    total_gordura: Math.round(totals.fat * 10) / 10,
    total_fibras: Math.round(totals.fiber * 10) / 10,
    total_sodio: Math.round(totals.sodium),
    matched_count: details.length,
    total_count: foods.length,
    unmatched_items: missing
  };

  console.log(`✅ RESUMO FINAL (Fórmula 4×P + 4×C + 9×G):`);
  console.log(`   🔥 ${result.total_kcal} kcal`);
  console.log(`   💪 ${result.total_proteina}g proteínas`);
  console.log(`   🍞 ${result.total_carbo}g carboidratos`);
  console.log(`   🥑 ${result.total_gordura}g gorduras`);
  console.log(`   ✅ ${result.matched_count}/${result.total_count} alimentos encontrados`);
  
  return result;
}

function generateSofiaResponse(userName: string, nutrition: NutritionCalculation, foods: DetectedFood[]): string {  
  return `💪 Proteínas: ${nutrition.total_proteina.toFixed(1)} g
🍞 Carboidratos: ${nutrition.total_carbo.toFixed(1)} g
🥑 Gorduras: ${nutrition.total_gordura.toFixed(1)} g
🔥 Estimativa calórica: ${nutrition.total_kcal} kcal

✅ Dados salvos com sucesso!`;
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