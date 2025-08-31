import { supabase } from '@/integrations/supabase/client';

export interface OllamaMealPlanParams {
  calorias: number;
  proteinas: number;
  carboidratos: number;
  gorduras: number;
  fibras: number;
  dias: number;
  objetivo: string;
  restricoes: string[];
  preferencias: string[];
  observacoes: string;
  peso_kg: number;
  refeicoes_selecionadas: string[];
  distribuicao_calorias: { [key: string]: number };
}

export interface OllamaDetailedInstructionsParams {
  recipeName: string;
  ingredients: string;
  basicInstructions: string;
  prepTime: string;
  cookTime: string;
  mealType: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

/**
 * Gera instruções detalhadas de preparo usando Ollama
 */
export async function generateDetailedInstructions(params: OllamaDetailedInstructionsParams): Promise<string> {
  try {
    console.log('🤖 Gerando instruções detalhadas com Ollama...');
    
    const prompt = `Você é um chef profissional especializado em culinária saudável. 

Receita: ${params.recipeName}
Tipo de refeição: ${params.mealType}
Ingredientes: ${params.ingredients}
Instruções básicas: ${params.basicInstructions}
Tempo de preparo: ${params.prepTime}
Tempo de cozimento: ${params.cookTime}
Informações nutricionais: ${params.calories} kcal, ${params.protein}g proteína, ${params.carbs}g carboidratos, ${params.fat}g gordura

Gere instruções de preparo DETALHADAS e PROFISSIONAIS seguindo estas regras:

1. **Estrutura clara**: Divida em passos numerados e bem organizados
2. **Detalhes técnicos**: Inclua temperaturas, tempos específicos, técnicas de cocção
3. **Dicas profissionais**: Adicione dicas de chef para melhor resultado
4. **Segurança**: Inclua cuidados de segurança quando necessário
5. **Apresentação**: Sugira como servir e decorar
6. **Substituições**: Sugira alternativas saudáveis quando possível
7. **Linguagem**: Use linguagem clara e acessível, mas profissional
8. **Formato**: Use parágrafos curtos e bem estruturados

Gere apenas as instruções detalhadas, sem introdução ou conclusão.`;

    const response = await supabase.functions.invoke('gpt-chat', {
      body: {
        messages: [
          {
            role: 'system',
            content: 'Você é um chef profissional especializado em culinária saudável e nutritiva.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        service: 'ollama',
        model: 'llama3.2:3b',
        temperature: 0.7,
        max_tokens: 800
      }
    });

    if (response.error) {
      console.error('❌ Erro ao gerar instruções detalhadas:', response.error);
      return params.basicInstructions; // Fallback para instruções básicas
    }

    const detailedInstructions = response.data?.choices?.[0]?.message?.content || params.basicInstructions;
    
    console.log('✅ Instruções detalhadas geradas com sucesso!');
    return detailedInstructions;

  } catch (error) {
    console.error('❌ Erro na geração de instruções detalhadas:', error);
    return params.basicInstructions; // Fallback para instruções básicas
  }
}

/**
 * Gera cardápio completo usando Ollama
 */
export async function generateMealPlanWithOllama(params: OllamaMealPlanParams): Promise<any> {
  try {
    console.log('🤖 Gerando cardápio com Ollama...');
    
    const prompt = `Gere um cardápio nutricional completo para ${params.dias} dias com as seguintes especificações:

OBJETIVO: ${params.objetivo}
CALORIAS DIÁRIAS: ${params.calorias} kcal
MACRONUTRIENTES: ${params.proteinas}g proteína, ${params.carboidratos}g carboidratos, ${params.gorduras}g gordura, ${params.fibras}g fibra
PESO: ${params.peso_kg} kg
REFEIÇÕES: ${params.refeicoes_selecionadas.join(', ')}
RESTRIÇÕES: ${params.restricoes.join(', ') || 'Nenhuma'}
PREFERÊNCIAS: ${params.preferencias.join(', ') || 'Nenhuma'}
OBSERVAÇÕES: ${params.observacoes}

Gere um cardápio JSON estruturado com:
- Nome da receita
- Descrição
- Ingredientes detalhados
- Instruções de preparo passo a passo
- Informações nutricionais por porção
- Tempo de preparo e cozimento
- Dicas de chef

Formato JSON esperado:
{
  "days": [
    {
      "day": 1,
      "meals": [
        {
          "meal_type": "café da manhã",
          "recipe_name": "Nome da Receita",
          "recipe_description": "Descrição",
          "prep_time": "15 minutos",
          "cook_time": "20 minutos",
          "calories": 300,
          "protein": 20,
          "carbs": 30,
          "fat": 10,
          "fiber": 5,
          "ingredients": "Ingredientes detalhados",
          "instructions": "Instruções passo a passo detalhadas"
        }
      ]
    }
  ]
}`;

    const response = await supabase.functions.invoke('gpt-chat', {
      body: {
        messages: [
          {
            role: 'system',
            content: 'Você é um nutricionista e chef especializado em criar cardápios personalizados e saudáveis.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        service: 'ollama',
        model: 'llama3.2:3b',
        temperature: 0.8,
        max_tokens: 2000
      }
    });

    if (response.error) {
      console.error('❌ Erro ao gerar cardápio com Ollama:', response.error);
      throw new Error('Falha na geração do cardápio');
    }

    const mealPlanData = response.data?.choices?.[0]?.message?.content;
    
    if (!mealPlanData) {
      throw new Error('Resposta vazia do Ollama');
    }

    // Tentar fazer parse do JSON
    try {
      const parsedData = JSON.parse(mealPlanData);
      console.log('✅ Cardápio gerado com Ollama com sucesso!');
      return parsedData;
    } catch (parseError) {
      console.error('❌ Erro ao fazer parse do JSON:', parseError);
      throw new Error('Formato de resposta inválido');
    }

  } catch (error) {
    console.error('❌ Erro na geração do cardápio com Ollama:', error);
    throw error;
  }
}

/**
 * Testa a conexão com Ollama
 */
export async function testOllamaConnection(): Promise<{ success: boolean; error?: string }> {
  try {
    console.log('🧪 Testando conexão com Ollama...');
    
    const response = await supabase.functions.invoke('gpt-chat', {
      body: {
        messages: [
          {
            role: 'user',
            content: 'Responda apenas "OK" se estiver funcionando.'
          }
        ],
        service: 'ollama',
        model: 'llama3.2:3b',
        temperature: 0.1,
        max_tokens: 10
      }
    });

    if (response.error) {
      console.error('❌ Erro na conexão com Ollama:', response.error);
      return { success: false, error: response.error.message };
    }

    const result = response.data?.choices?.[0]?.message?.content;
    console.log('✅ Conexão com Ollama testada com sucesso!');
    return { success: !!result };

  } catch (error) {
    console.error('❌ Erro no teste de conexão com Ollama:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Erro desconhecido' };
  }
}

export interface OllamaMealieIntegrationParams {
  mealieBaseUrl: string;
  mealieApiKey?: string;
  ollamaModel: string;
  recipeCount?: number;
}

/**
 * Testa se o Ollama consegue acessar as receitas da Mealie
 */
export async function testOllamaMealieIntegration(params: OllamaMealieIntegrationParams): Promise<{
  success: boolean;
  recipeCount: number;
  sampleRecipes: any[];
  error?: string;
}> {
  try {
    console.log('🔗 Testando integração Ollama + Mealie...');
    
    // 1. Buscar receitas da Mealie
    const mealieResponse = await fetch(`${params.mealieBaseUrl}/api/recipes?limit=${params.recipeCount || 10}`, {
      headers: params.mealieApiKey ? {
        'Authorization': `Bearer ${params.mealieApiKey}`,
        'Content-Type': 'application/json'
      } : {
        'Content-Type': 'application/json'
      }
    });
    
    if (!mealieResponse.ok) {
      throw new Error(`Erro ao buscar receitas da Mealie: ${mealieResponse.status}`);
    }
    
    const recipes = await mealieResponse.json();
    console.log(`📚 Encontradas ${recipes.items?.length || 0} receitas na Mealie`);
    
    // 2. Preparar contexto para o Ollama
    const recipeContext = recipes.items?.slice(0, 5).map((recipe: any) => ({
      name: recipe.name,
      description: recipe.description,
      ingredients: recipe.recipeIngredient?.map((ing: any) => ing.note || ing.display).join(', '),
      instructions: recipe.recipeInstructions?.map((inst: any) => inst.text).join('\n'),
      nutrition: recipe.nutrition
    })) || [];
    
    // 3. Testar se o Ollama consegue processar as receitas
    const prompt = `Você tem acesso às seguintes receitas da Mealie:

${recipeContext.map((recipe, index) => `
Receita ${index + 1}: ${recipe.name}
Descrição: ${recipe.description}
Ingredientes: ${recipe.ingredients}
Instruções: ${recipe.instructions}
`).join('\n')}

Responda apenas: "Conectado com sucesso! Tenho acesso a ${recipeContext.length} receitas da Mealie."
`;

    const ollamaResponse = await supabase.functions.invoke('gpt-chat', {
      body: {
        messages: [
          { role: 'system', content: 'Você é um assistente que tem acesso às receitas da Mealie.' },
          { role: 'user', content: prompt }
        ],
        service: 'ollama',
        model: params.ollamaModel,
        temperature: 0.1,
        max_tokens: 100
      }
    });
    
    if (ollamaResponse.error) {
      throw new Error(`Erro no Ollama: ${ollamaResponse.error.message}`);
    }
    
    console.log('✅ Integração Ollama + Mealie funcionando!');
    
    return {
      success: true,
      recipeCount: recipes.items?.length || 0,
      sampleRecipes: recipeContext
    };
    
  } catch (error) {
    console.error('❌ Erro na integração Ollama + Mealie:', error);
    return {
      success: false,
      recipeCount: 0,
      sampleRecipes: [],
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    };
  }
}

/**
 * Gera cardápio usando Ollama com receitas da Mealie
 */
export async function generateMealPlanWithOllamaAndMealie(params: OllamaMealieIntegrationParams & {
  userPreferences: string[];
  restrictions: string[];
  targetCalories: number;
  days: number;
}): Promise<{
  success: boolean;
  mealPlan?: any;
  error?: string;
}> {
  try {
    console.log('🤖 Gerando cardápio com Ollama + Mealie...');
    
    // 1. Buscar receitas da Mealie
    const mealieResponse = await fetch(`${params.mealieBaseUrl}/api/recipes?limit=100`, {
      headers: params.mealieApiKey ? {
        'Authorization': `Bearer ${params.mealieApiKey}`,
        'Content-Type': 'application/json'
      } : {
        'Content-Type': 'application/json'
      }
    });
    
    if (!mealieResponse.ok) {
      throw new Error(`Erro ao buscar receitas da Mealie: ${mealieResponse.status}`);
    }
    
    const recipes = await mealieResponse.json();
    const availableRecipes = recipes.items || [];
    
    console.log(`📚 Usando ${availableRecipes.length} receitas da Mealie`);
    
    // 2. Preparar prompt para o Ollama
    const recipeContext = availableRecipes.map((recipe: any) => ({
      name: recipe.name,
      description: recipe.description,
      ingredients: recipe.recipeIngredient?.map((ing: any) => ing.note || ing.display).join(', '),
      instructions: recipe.recipeInstructions?.map((inst: any) => inst.text).join('\n'),
      nutrition: recipe.nutrition,
      tags: recipe.tags?.map((tag: any) => tag.name).join(', ')
    }));
    
    const prompt = `Você é um nutricionista especialista. Crie um cardápio de ${params.days} dias usando APENAS as receitas da Mealie fornecidas.

RECEITAS DISPONÍVEIS NA MEALIE:
${recipeContext.map((recipe, index) => `
${index + 1}. ${recipe.name}
   Descrição: ${recipe.description}
   Ingredientes: ${recipe.ingredients}
   Tags: ${recipe.tags}
   Calorias: ${recipe.nutrition?.calories || 'N/A'}
`).join('\n')}

REQUISITOS:
- Calorias diárias: ${params.targetCalories} kcal
- Preferências: ${params.userPreferences.join(', ')}
- Restrições: ${params.restrictions.join(', ')}
- Dias: ${params.days}

INSTRUÇÕES:
1. Use apenas receitas da lista acima
2. Respeite as restrições alimentares
3. Priorize as preferências do usuário
4. Distribua as calorias adequadamente
5. Varie as receitas entre os dias

Responda em formato JSON válido com a estrutura do cardápio.`;

    // 3. Gerar cardápio com Ollama
    const ollamaResponse = await supabase.functions.invoke('gpt-chat', {
      body: {
        messages: [
          { role: 'system', content: 'Você é um nutricionista especialista em criar cardápios personalizados.' },
          { role: 'user', content: prompt }
        ],
        service: 'ollama',
        model: params.ollamaModel,
        temperature: 0.7,
        max_tokens: 2000
      }
    });
    
    if (ollamaResponse.error) {
      throw new Error(`Erro no Ollama: ${ollamaResponse.error.message}`);
    }
    
    const response = ollamaResponse.data?.choices?.[0]?.message?.content;
    if (!response) {
      throw new Error('Resposta vazia do Ollama');
    }
    
    // 4. Tentar parsear a resposta JSON
    try {
      const mealPlan = JSON.parse(response);
      console.log('✅ Cardápio gerado com Ollama + Mealie!');
      
      return {
        success: true,
        mealPlan
      };
    } catch (parseError) {
      console.warn('⚠️ Erro ao parsear JSON, retornando resposta bruta');
      return {
        success: true,
        mealPlan: { rawResponse: response, recipes: recipeContext }
      };
    }
    
  } catch (error) {
    console.error('❌ Erro ao gerar cardápio com Ollama + Mealie:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    };
  }
}
