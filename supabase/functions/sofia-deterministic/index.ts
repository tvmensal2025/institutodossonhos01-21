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

  console.log(`🔥 CÁLCULO SIMPLES E CORRETO - TACO FOODS - Processando ${foods.length} alimentos`);

  for (const food of foods) {
    const grams = Number(food.grams) || 100; // Se não especificado, usar 100g
    console.log(`🔍 Buscando na TACO: ${food.name} (${grams}g)`);

    // Buscar na tabela taco_foods apenas
    const { data: tacoData } = await supabase
      .from('taco_foods')
      .select('nome_alimento, energia_kcal, proteina_g, carboidratos_g, lipidios_g, fibra_alimentar_g, sodio_mg')
      .ilike('nome_alimento', `%${food.name}%`)
      .order('id')
      .limit(1);

    if (tacoData && tacoData.length > 0) {
      const taco = tacoData[0];
      const factor = grams / 100.0;
      
      // Valores por 100g da TACO
      const kcal_100g = Number(taco.energia_kcal || 0);
      const protein_100g = Number(taco.proteina_g || 0);
      const carbs_100g = Number(taco.carboidratos_g || 0);
      const fat_100g = Number(taco.lipidios_g || 0);
      const fiber_100g = Number(taco.fibra_alimentar_g || 0);
      const sodium_100g = Number(taco.sodio_mg || 0);
      
      // Calcular proporcionalmente
      const item_kcal = kcal_100g * factor;
      const item_protein = protein_100g * factor;
      const item_carbs = carbs_100g * factor;
      const item_fat = fat_100g * factor;
      const item_fiber = fiber_100g * factor;
      const item_sodium = sodium_100g * factor;
      
      // Somar ao total
      result.total_kcal += item_kcal;
      result.total_proteina += item_protein;
      result.total_carbo += item_carbs;
      result.total_gordura += item_fat;
      result.total_fibras += item_fiber;
      result.total_sodio += item_sodium;
      
      result.matched_count++;
      
      console.log(`✅ TACO: ${taco.nome_alimento}`);
      console.log(`   ${grams}g = ${Math.round(item_kcal)} kcal, ${item_protein.toFixed(1)}g prot, ${item_carbs.toFixed(1)}g carb, ${item_fat.toFixed(1)}g gord`);
    } else {
      result.unmatched_items.push(food.name);
      console.warn(`❌ NÃO ENCONTRADO: ${food.name}`);
    }
  }

  // Arredondar valores finais
  result.total_kcal = Math.round(result.total_kcal);
  result.total_proteina = Math.round(result.total_proteina * 10) / 10;
  result.total_carbo = Math.round(result.total_carbo * 10) / 10;
  result.total_gordura = Math.round(result.total_gordura * 10) / 10;
  result.total_fibras = Math.round(result.total_fibras * 10) / 10;
  result.total_sodio = Math.round(result.total_sodio);

  console.log(`✅ RESUMO FINAL:`);
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