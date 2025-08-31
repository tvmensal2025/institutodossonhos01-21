import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-requested-with, Authorization, X-Client-Info, Content-Type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Max-Age': '86400',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { detectedFoods, userProfile } = await req.json();
    
    console.log('🔍 Enriquecendo dados nutricionais:', { detectedFoods, userProfile });

    // Inicializar cliente Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 1. BUSCAR DADOS NUTRICIONAIS COMPLETOS
    const enrichedFoods = [];
    
    for (const food of detectedFoods) {
      const foodName = typeof food === 'object' ? food.nome : food;
      
      // Buscar na tabela alimentos_completos
      const { data: alimentoCompleto } = await supabase
        .from('alimentos_completos')
        .select(`
          *,
          valores_nutricionais_completos (*)
        `)
        .ilike('nome', `%${foodName}%`)
        .limit(1);

      if (alimentoCompleto && alimentoCompleto.length > 0) {
        const alimento = alimentoCompleto[0];
        const valoresNutricionais = alimento.valores_nutricionais_completos;
        
        enrichedFoods.push({
          nome: alimento.nome,
          quantidade: typeof food === 'object' ? food.quantidade : 100,
          categoria: alimento.categoria,
          propriedades_medicinais: alimento.propriedades_medicinais,
          principios_ativos: alimento.principios_ativos,
          indicacoes_terapeuticas: alimento.indicacoes_terapeuticas,
          valores_nutricionais: valoresNutricionais,
          calorias: valoresNutricionais?.calorias || 0,
          proteinas: valoresNutricionais?.proteina || 0,
          carboidratos: valoresNutricionais?.carboidrato || 0,
          gorduras: valoresNutricionais?.gordura || 0,
          fibras: valoresNutricionais?.fibras || 0,
          indice_glicemico: valoresNutricionais?.indice_glicemico || 0
        });
      } else {
        // Fallback para dados básicos
        enrichedFoods.push({
          nome: foodName,
          quantidade: typeof food === 'object' ? food.quantidade : 100,
          categoria: 'alimento',
          propriedades_medicinais: null,
          principios_ativos: null,
          indicacoes_terapeuticas: null,
          valores_nutricionais: null,
          calorias: 0,
          proteinas: 0,
          carboidratos: 0,
          gorduras: 0,
          fibras: 0,
          indice_glicemico: 0
        });
      }
    }

    // 2. BUSCAR SUBSTITUIÇÕES INTELIGENTES (se houver perfil do usuário)
    let substituicoes = [];
    if (userProfile && userProfile.conditions) {
      const { data: substituicoesData } = await supabase
        .from('substituicoes_inteligentes')
        .select(`
          *,
          alimento_original:alimentos_completos!alimento_original_id(nome),
          alimento_substituto:alimentos_completos!alimento_substituto_id(nome)
        `)
        .in('motivo_substituicao', userProfile.conditions);

      substituicoes = substituicoesData || [];
    }

    // 3. BUSCAR COMBINAÇÕES TERAPÊUTICAS
    const combinacoes = [];
    for (const food of enrichedFoods) {
      const { data: combinacoesData } = await supabase
        .from('combinacoes_terapeuticas')
        .select(`
          *,
          alimento1:alimentos_completos!alimento1_id(nome),
          alimento2:alimentos_completos!alimento2_id(nome)
        `)
        .or(`alimento1_id.eq.${food.id},alimento2_id.eq.${food.id}`)
        .limit(3);

      if (combinacoesData) {
        combinacoes.push(...combinacoesData);
      }
    }

    // 4. CALCULAR ANÁLISE NUTRICIONAL ENRIQUECIDA
    const totalCalorias = enrichedFoods.reduce((sum, food) => sum + (food.calorias * food.quantidade / 100), 0);
    const totalProteinas = enrichedFoods.reduce((sum, food) => sum + (food.proteinas * food.quantidade / 100), 0);
    const totalCarboidratos = enrichedFoods.reduce((sum, food) => sum + (food.carboidratos * food.quantidade / 100), 0);
    const totalGorduras = enrichedFoods.reduce((sum, food) => sum + (food.gorduras * food.quantidade / 100), 0);
    const totalFibras = enrichedFoods.reduce((sum, food) => sum + (food.fibras * food.quantidade / 100), 0);

    // 5. GERAR RECOMENDAÇÕES PERSONALIZADAS
    const recomendacoes = [];
    
    // Recomendações baseadas no índice glicêmico
    const alimentosAltoGlicemico = enrichedFoods.filter(food => food.indice_glicemico > 70);
    if (alimentosAltoGlicemico.length > 0) {
      recomendacoes.push({
        tipo: 'glicemia',
        mensagem: 'Alguns alimentos têm alto índice glicêmico. Considere combinar com fibras.',
        alimentos: alimentosAltoGlicemico.map(f => f.nome)
      });
    }

    // Recomendações baseadas em propriedades medicinais
    const alimentosMedicinais = enrichedFoods.filter(food => food.propriedades_medicinais);
    if (alimentosMedicinais.length > 0) {
      recomendacoes.push({
        tipo: 'medicinal',
        mensagem: 'Excelente! Você incluiu alimentos com propriedades medicinais.',
        alimentos: alimentosMedicinais.map(f => f.nome)
      });
    }

    // 6. RETORNAR DADOS ENRIQUECIDOS
    return new Response(JSON.stringify({
      success: true,
      enriched_foods: enrichedFoods,
      substituicoes: substituicoes,
      combinacoes: combinacoes,
      analise_nutricional: {
        total_calorias: Math.round(totalCalorias),
        total_proteinas: Math.round(totalProteinas),
        total_carboidratos: Math.round(totalCarboidratos),
        total_gorduras: Math.round(totalGorduras),
        total_fibras: Math.round(totalFibras),
        balanceamento: {
          proteinas_percent: totalCalorias > 0 ? Math.round((totalProteinas * 4 / totalCalorias) * 100) : 0,
          carboidratos_percent: totalCalorias > 0 ? Math.round((totalCarboidratos * 4 / totalCalorias) * 100) : 0,
          gorduras_percent: totalCalorias > 0 ? Math.round((totalGorduras * 9 / totalCalorias) * 100) : 0
        }
      },
      recomendacoes: recomendacoes,
      base_conhecimento_utilizada: true
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Erro ao enriquecer dados:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      enriched_foods: [],
      substituicoes: [],
      combinacoes: [],
      analise_nutricional: null,
      recomendacoes: [],
      base_conhecimento_utilizada: false
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});





