import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};

const MEALIE_BASE_URL = 'https://ids-mealie.ifrhb3.easypanel.host';
const MEALIE_API_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJsb25nX3Rva2VuIjp0cnVlLCJpZCI6IjdmZTQxYmFjLWQ4NTUtNDg0Yy1hODMyLTU4NzAyMTE2MmQ1OSIsIm5hbWUiOiJtZWxhaWVvZmljaWFsc2EiLCJpbnRlZ3JhdGlvbl9pZCI6ImdlbmVyaWMiLCJleHAiOjE5MTM0NzU5NTN9.ry_UNZ6l2DIXvQeAKA8IXOmD2H3xkr7rmgcZWaqWRTQ';

let recipeCache: any[] = [];
let cacheTimestamp = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

async function fetchMealieRecipes() {
  console.log('🍽️ Buscando receitas do Mealie...');
  
  // Verificar cache
  const now = Date.now();
  if (recipeCache.length > 0 && (now - cacheTimestamp) < CACHE_DURATION) {
    console.log(`✅ Cache: ${recipeCache.length} receitas`);
    return recipeCache;
  }
  
  try {
    // Buscar lista de receitas
    const response = await fetch(`${MEALIE_BASE_URL}/api/recipes?limit=50`, {
      headers: {
        'Authorization': `Bearer ${MEALIE_API_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Erro na API: ${response.status} - ${response.statusText}`);
    }
    
    const data = await response.json();
    const basicRecipes = data.items || [];
    console.log(`✅ ${basicRecipes.length} receitas básicas encontradas`);
    
    // Buscar detalhes completos de cada receita
    const detailedRecipes = [];
    for (let i = 0; i < basicRecipes.length; i++) {
      try {
        const detailResponse = await fetch(`${MEALIE_BASE_URL}/api/recipes/${basicRecipes[i].id}`, {
          headers: {
            'Authorization': `Bearer ${MEALIE_API_TOKEN}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (detailResponse.ok) {
          const fullRecipe = await detailResponse.json();
          detailedRecipes.push(fullRecipe);
          console.log(`✅ Dados completos: ${fullRecipe.name}`);
        }
        
        // Rate limiting para não sobrecarregar
        if (i % 5 === 0 && i > 0) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      } catch (error) {
        console.log(`⚠️ Erro na receita: ${error.message}`);
      }
    }
    
    // Atualizar cache
    recipeCache = detailedRecipes;
    cacheTimestamp = now;
    console.log(`✅ Cache atualizado: ${detailedRecipes.length} receitas completas`);
    
    return detailedRecipes;
  } catch (error) {
    console.error('❌ Erro ao buscar receitas:', error);
    // Retornar cache se disponível
    return recipeCache;
  }
}

function normalizeText(text: string): string {
  return text.toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function getRecipeFullText(recipe: any): string {
  const parts = [
    recipe.name || '',
    recipe.description || '',
    (recipe.recipeIngredient || []).join(' '),
    (recipe.tags || []).map((t: any) => t.name || t.slug || t).join(' '),
    (recipe.recipeCategory || []).map((c: any) => c.name || c.slug || c).join(' ')
  ];
  
  return normalizeText(parts.join(' '));
}

function filterByRestrictions(recipes: any[], restrictions: string[]): any[] {
  if (!restrictions || restrictions.length === 0) {
    console.log('📝 Nenhuma restrição aplicada');
    return recipes;
  }
  
  console.log(`🚫 Aplicando ${restrictions.length} restrições:`, restrictions);
  
  const restrictionKeywords: { [key: string]: string[] } = {
    'gluten': ['gluten', 'trigo', 'farinha', 'pao', 'macarrao', 'aveia', 'cevada', 'centeio', 'pizza', 'bolo', 'biscoito'],
    'lactose': ['leite', 'queijo', 'iogurte', 'laticinio', 'manteiga', 'creme', 'nata', 'ricota', 'mussarela', 'requeijao'],
    'peixe': ['peixe', 'salmao', 'atum', 'tilapia', 'bacalhau', 'sardinha', 'merluza', 'pescado', 'frutos do mar'],
    'carne': ['carne', 'boi', 'porco', 'suino', 'bovino', 'costela', 'picanha', 'alcatra', 'file', 'hamburguer'],
    'frango': ['frango', 'galinha', 'ave', 'peito de frango', 'coxa', 'sobrecoxa', 'asa'],
    'ovo': ['ovo', 'clara', 'gema', 'ovos', 'omelete', 'ovinho'],
    'nozes': ['nozes', 'amendoim', 'castanha', 'amendo', 'pistache', 'macadamia', 'pecã'],
    'soja': ['soja', 'tofu', 'shoyu', 'molho de soja', 'edamame'],
    'vegetariano': ['carne', 'peixe', 'frango', 'porco', 'boi', 'ave', 'pescado', 'bacon'],
    'vegano': ['carne', 'peixe', 'frango', 'leite', 'queijo', 'ovo', 'mel', 'manteiga', 'iogurte', 'bacon']
  };
  
  let filteredRecipes = recipes;
  let removedCount = 0;
  
  for (const restriction of restrictions) {
    const normalizedRestriction = normalizeText(restriction);
    const keywords = restrictionKeywords[normalizedRestriction] || [normalizedRestriction];
    
    console.log(`🔍 Processando restrição "${restriction}" com palavras-chave:`, keywords);
    
    const beforeCount = filteredRecipes.length;
    filteredRecipes = filteredRecipes.filter(recipe => {
      const recipeText = getRecipeFullText(recipe);
      
      // Verificar se alguma palavra-chave da restrição está presente
      const hasRestrictedIngredient = keywords.some(keyword => 
        recipeText.includes(normalizeText(keyword))
      );
      
      if (hasRestrictedIngredient) {
        console.log(`❌ Removendo "${recipe.name}" por restrição "${restriction}"`);
        removedCount++;
        return false;
      }
      
      return true;
    });
    
    const afterCount = filteredRecipes.length;
    console.log(`📊 Restrição "${restriction}": ${beforeCount} → ${afterCount} receitas (${beforeCount - afterCount} removidas)`);
  }
  
  console.log(`🚫 Total removido por restrições: ${removedCount} receitas`);
  console.log(`✅ Receitas restantes após filtros: ${filteredRecipes.length}`);
  
  return filteredRecipes;
}

function prioritizeByPreferences(recipes: any[], preferences: string[]): any[] {
  if (!preferences || preferences.length === 0) {
    console.log('📝 Nenhuma preferência aplicada');
    return recipes;
  }
  
  console.log(`❤️ Aplicando ${preferences.length} preferências:`, preferences);
  
  const preferenceKeywords: { [key: string]: string[] } = {
    'vegetariano': ['vegetariano', 'vegetal', 'verdura', 'legume', 'salada'],
    'vegano': ['vegano', 'plant based', 'vegetal'],
    'proteina': ['proteina', 'frango', 'peixe', 'ovo', 'leguminosa', 'feijao', 'lentilha'],
    'carboidrato': ['arroz', 'batata', 'macarrao', 'quinoa', 'aveia', 'pao'],
    'saudavel': ['light', 'diet', 'saudavel', 'natural', 'integral', 'organico'],
    'rapido': ['rapido', 'facil', 'simples', '15 min', '10 min', 'pratico'],
    'doce': ['doce', 'sobremesa', 'bolo', 'pudim', 'mousse', 'fruta'],
    'salgado': ['salgado', 'sal', 'tempero', 'especiaria']
  };
  
  const scoredRecipes = recipes.map(recipe => {
    let score = 0;
    const recipeText = getRecipeFullText(recipe);
    const matchedPreferences: string[] = [];
    
    for (const preference of preferences) {
      const normalizedPreference = normalizeText(preference);
      const keywords = preferenceKeywords[normalizedPreference] || [normalizedPreference];
      
      const hasPreference = keywords.some(keyword => 
        recipeText.includes(normalizeText(keyword))
      );
      
      if (hasPreference) {
        score += 10;
        matchedPreferences.push(preference);
      }
    }
    
    if (matchedPreferences.length > 0) {
      console.log(`✅ "${recipe.name}" ganhou ${score} pontos por: ${matchedPreferences.join(', ')}`);
    }
    
    return { ...recipe, preferenceScore: score, matchedPreferences };
  });
  
  // Ordenar por pontuação (maior primeiro)
  const sortedRecipes = scoredRecipes.sort((a, b) => b.preferenceScore - a.preferenceScore);
  
  const topScorers = sortedRecipes.filter(r => r.preferenceScore > 0);
  console.log(`❤️ ${topScorers.length} receitas corresponderam às preferências`);
  
  return sortedRecipes;
}

function selectRecipeForMeal(recipes: any[], mealType: string, usedRecipes: Set<string>): any {
  // Filtrar por tipo de refeição baseado no nome/descrição
  const mealKeywords = {
    'cafe_manha': ['cafe da manha', 'breakfast', 'manha', 'cafe', 'matinal', 'pao', 'aveia', 'fruta', 'iogurte'],
    'almoco': ['almoco', 'lunch', 'principal', 'prato principal', 'arroz', 'feijao'],
    'lanche': ['lanche', 'snack', 'biscoito', 'bolo', 'sanduiche', 'vitamina'],
    'jantar': ['jantar', 'dinner', 'noite', 'sopa', 'salada'],
    'ceia': ['ceia', 'supper', 'leve', 'light', 'fruta', 'cha']
  };
  
  const keywords = mealKeywords[mealType] || [];
  console.log(`🍽️ Buscando receita para ${mealType} com palavras-chave:`, keywords);
  
  // Primeiro, tentar receitas não usadas
  let availableRecipes = recipes.filter(recipe => !usedRecipes.has(recipe.id));
  if (availableRecipes.length === 0) {
    console.log('⚠️ Todas as receitas já foram usadas, reutilizando...');
    availableRecipes = recipes;
  }
  
  // Filtrar por tipo de refeição
  let suitableRecipes = availableRecipes.filter(recipe => {
    const recipeText = getRecipeFullText(recipe);
    return keywords.some(keyword => recipeText.includes(normalizeText(keyword)));
  });
  
  // Se não encontrar receitas específicas para a refeição, usar receitas disponíveis
  if (suitableRecipes.length === 0) {
    console.log(`⚠️ Nenhuma receita específica para ${mealType}, usando receitas disponíveis`);
    suitableRecipes = availableRecipes;
  }
  
  // Priorizar receitas com maior pontuação de preferência
  suitableRecipes.sort((a, b) => (b.preferenceScore || 0) - (a.preferenceScore || 0));
  
  // Selecionar entre as top 3 para adicionar variedade
  const topRecipes = suitableRecipes.slice(0, Math.min(3, suitableRecipes.length));
  const selected = topRecipes[Math.floor(Math.random() * topRecipes.length)];
  
  console.log(`✅ Selecionada para ${mealType}: "${selected.name}" (Score: ${selected.preferenceScore || 0})`);
  
  return selected;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  
  try {
    const requestData = await req.json();
    console.log('🚀 Mealie Real Improved - Iniciando geração');
    console.log('📥 Parâmetros recebidos:', requestData);
    
    const calorias = requestData.calorias || 2000;
    const dias = requestData.dias || 7;
    const restricoes = requestData.restricoes || [];
    const preferencias = requestData.preferencias || [];
    
    console.log('✅ Parâmetros normalizados:', { calorias, dias, restricoes, preferencias });
    
    // Buscar receitas reais do Mealie
    const allRecipes = await fetchMealieRecipes();
    
    if (allRecipes.length === 0) {
      throw new Error('Nenhuma receita encontrada no Mealie');
    }
    
    console.log(`🍽️ ${allRecipes.length} receitas reais carregadas do Mealie`);
    
    // Aplicar filtros do usuário com logs detalhados
    console.log('\n🔍 APLICANDO FILTROS DE USUÁRIO:');
    console.log('='.repeat(50));
    
    const filteredRecipes = filterByRestrictions(allRecipes, restricoes);
    const prioritizedRecipes = prioritizeByPreferences(filteredRecipes, preferencias);
    
    console.log(`\n📊 RESULTADO DOS FILTROS:`);
    console.log(`- Receitas originais: ${allRecipes.length}`);
    console.log(`- Após restrições: ${filteredRecipes.length}`);
    console.log(`- Com preferências aplicadas: ${prioritizedRecipes.length}`);
    console.log('='.repeat(50));
    
    if (prioritizedRecipes.length === 0) {
      throw new Error('Nenhuma receita disponível após aplicar filtros. Tente relaxar as restrições.');
    }
    
    // Gerar cardápio com receitas reais
    const mealPlan: any = {};
    const usedRecipes = new Set<string>();
    
    for (let day = 1; day <= dias; day++) {
      console.log(`\n📅 Gerando dia ${day}`);
      
      const dayMeals: any = {};
      let dailyTotals = { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 };
      
      const mealTypes = ['cafe_manha', 'almoco', 'lanche', 'jantar', 'ceia'];
      
      mealTypes.forEach(mealType => {
        const selectedRecipe = selectRecipeForMeal(prioritizedRecipes, mealType, usedRecipes);
        
        if (selectedRecipe) {
          usedRecipes.add(selectedRecipe.id);
          
          // Normalizar categoria
          let categoria = '';
          if (selectedRecipe.recipeCategory && Array.isArray(selectedRecipe.recipeCategory)) {
            categoria = selectedRecipe.recipeCategory.map(c => c.name || c.slug || c).join(', ');
          } else if (selectedRecipe.recipeCategory) {
            categoria = selectedRecipe.recipeCategory.name || selectedRecipe.recipeCategory.slug || selectedRecipe.recipeCategory;
          }
          
          // Normalizar tags
          let tags: string[] = [];
          if (selectedRecipe.tags && Array.isArray(selectedRecipe.tags)) {
            tags = selectedRecipe.tags.map(t => t.name || t.slug || t).filter(Boolean);
          }
          
          // Normalizar ingredientes
          const ingredientes = (selectedRecipe.recipeIngredient || []).map((ing: any) => ({
            nome: ing.food?.name || ing.title || ing.note || 'Ingrediente',
            quantidade: ing.quantity ? `${ing.quantity} ${ing.unit || ''}`.trim() : '1 unidade',
            observacao: ing.note || ing.food?.description || ''
          }));
          
          // Normalizar instruções
          const preparo = (selectedRecipe.recipeInstructions || [])
            .map((inst: any, index: number) => {
              if (inst.title) {
                return `\n## ${inst.title}\n${index + 1}. ${inst.text || ''}`;
              }
              return `${index + 1}. ${inst.text || ''}`;
            })
            .filter(Boolean)
            .join('\n') || 'Instruções não disponíveis';
          
          // Extrair nutrição
          const description = selectedRecipe.description || '';
          const caloriesMatch = description.match(/~?(\d+)\s*kcal/i);
          const proteinMatch = description.match(/(\d+)\s*g\s*proteína/i);
          
          let nutricao = {
            calorias: caloriesMatch ? parseInt(caloriesMatch[1]) : 300,
            proteinas: proteinMatch ? parseInt(proteinMatch[1]) : 20,
            carboidratos: 30,
            gorduras: 10,
            fibras: 5,
            sodio: 200
          };
          
          // Se tem dados nutricionais estruturados, usar eles
          if (selectedRecipe.nutrition) {
            const n = selectedRecipe.nutrition;
            nutricao = {
              calorias: parseFloat(n.calories || n.calorieContent || nutricao.calorias) || nutricao.calorias,
              proteinas: parseFloat(n.proteinContent || n.protein || nutricao.proteinas) || nutricao.proteinas,
              carboidratos: parseFloat(n.carbohydrateContent || n.carbs || nutricao.carboidratos) || nutricao.carboidratos,
              gorduras: parseFloat(n.fatContent || n.fat || nutricao.gorduras) || nutricao.gorduras,
              fibras: parseFloat(n.fiberContent || n.fiber || nutricao.fibras) || nutricao.fibras,
              sodio: parseFloat(n.sodiumContent || n.sodium || nutricao.sodio) || nutricao.sodio
            };
          }
          
          dayMeals[mealType] = {
            nome: selectedRecipe.name,
            mealie_id: selectedRecipe.id,
            descricao: selectedRecipe.description || '',
            categoria,
            tags,
            ingredientes,
            preparo,
            tempo_preparo: selectedRecipe.prepTime || '30 minutos',
            tempo_cozimento: selectedRecipe.cookTime || '0 minutos',
            tempo_total: selectedRecipe.totalTime || '30 minutos',
            porcoes: selectedRecipe.recipeYield || '1 porção',
            nutricao,
            image: selectedRecipe.image || null,
            slug: selectedRecipe.slug || null,
            source: 'mealie_real_improved',
            tipo_refeicao: mealType,
            preference_score: selectedRecipe.preferenceScore || 0,
            matched_preferences: selectedRecipe.matchedPreferences || []
          };
          
          // Somar totais do dia
          dailyTotals.calories += nutricao.calorias;
          dailyTotals.protein += nutricao.proteinas;
          dailyTotals.carbs += nutricao.carboidratos;
          dailyTotals.fat += nutricao.gorduras;
          dailyTotals.fiber += nutricao.fibras;
        }
      });
      
      mealPlan[`dia${day}`] = {
        ...dayMeals,
        totais_nutricionais: {
          calorias: Math.round(dailyTotals.calories),
          proteinas: Math.round(dailyTotals.protein * 10) / 10,
          carboidratos: Math.round(dailyTotals.carbs * 10) / 10,
          gorduras: Math.round(dailyTotals.fat * 10) / 10,
          fibras: Math.round(dailyTotals.fiber * 10) / 10
        }
      };
      
      console.log(`✅ Dia ${day} gerado: ${dailyTotals.calories} kcal, ${dailyTotals.protein}g proteína`);
    }
    
    const response = {
      success: true,
      data: {
        cardapio: mealPlan,
        resumo_nutricional: {
          calorias_media: calorias,
          proteinas_media: Math.round(calorias * 0.15 / 4),
          fonte: 'MEALIE_REAL_IMPROVED'
        }
      },
      metadata: {
        modelo_usado: 'MEALIE_REAL_IMPROVED',
        restricoes_aplicadas: restricoes,
        preferencias_aplicadas: preferencias,
        receitas_disponiveis: allRecipes.length,
        receitas_filtradas: filteredRecipes.length,
        receitas_usadas: usedRecipes.size,
        dias_gerados: dias,
        filtros_aplicados: {
          restricoes_removeram: allRecipes.length - filteredRecipes.length,
          preferencias_pontuaram: prioritizedRecipes.filter(r => r.preferenceScore > 0).length
        },
        timestamp: new Date().toISOString()
      }
    };
    
    console.log('\n✅ SUCESSO - Cardápio gerado com receitas reais do Mealie e filtros aplicados');
    console.log(`📊 Estatísticas finais:`);
    console.log(`- Receitas usadas: ${usedRecipes.size} de ${allRecipes.length} disponíveis`);
    console.log(`- Restrições removeram: ${allRecipes.length - filteredRecipes.length} receitas`);
    console.log(`- Preferências aplicadas em: ${prioritizedRecipes.filter(r => r.preferenceScore > 0).length} receitas`);
    
    return new Response(JSON.stringify(response), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
    
  } catch (error) {
    console.error('💥 ERRO CRÍTICO:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Erro na integração com Mealie',
      details: error.message,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  }
});