# Documentação: Regras de Geração de Cardápio - CORRIGIDO

## 📋 Visão Geral

Este documento descreve como aplicar corretamente as regras de geração de cardápio no sistema, incluindo a estrutura de 5 refeições, distribuição de calorias e integração com o Mealie.

## 🎯 Regras Principais - CORRIGIDAS

### 1. Estrutura de 5 Refeições

O sistema deve sempre gerar **5 refeições por dia** na seguinte ordem:

```typescript
const MEAL_STRUCTURE = {
  'café da manhã': 'breakfast',    // 25% das calorias diárias
  'almoço': 'lunch',               // 35% das calorias diárias  
  'lanche': 'snack',               // 15% das calorias diárias
  'jantar': 'dinner',              // 20% das calorias diárias
  'ceia': 'supper'                 // 5% das calorias diárias
};
```

### 2. Distribuição de Calorias - CORRIGIDA

```typescript
const CALORIE_DISTRIBUTION = {
  'café da manhã': 0.25,  // 25% - Café da manhã
  'almoço': 0.35,         // 35% - Almoço
  'lanche': 0.15,         // 15% - Lanche
  'jantar': 0.20,         // 20% - Jantar
  'ceia': 0.05            // 5% - Ceia
};
```

### 3. Integração com Mealie - CORRIGIDA

#### Busca de Receitas
```typescript
// ✅ CORRETO: Buscar com dados nutricionais
const response = await fetch(`${baseUrl}/recipes?limit=100&include_nutrition=true`, { headers });

// ❌ INCORRETO: Busca genérica
const response = await fetch(`${baseUrl}/recipes?limit=50`, { headers });
```

#### Filtros Nutricionais
```typescript
// ✅ CORRETO: Usar dados reais do Mealie
const nutrition = selectedRecipe.nutrition || {};
const calories = nutrition.calories || 0;
const protein = nutrition.protein || 0;
const carbs = nutrition.carbohydrates || 0;
const fat = nutrition.fat || 0;
const fiber = nutrition.fiber || 0;

// ❌ INCORRETO: Calcular estimativas
const calories = nutrition.calories || targetMealCalories;
const protein = nutrition.protein || Math.round(calories * 0.25 / 4);
```

#### Aplicação de Restrições
```typescript
// ✅ CORRETO: Verificar restrições em tags e ingredientes
const recipeTags = recipe.tags?.map((tag: any) => tag.name?.toLowerCase()) || [];
const recipeIngredients = recipe.ingredients?.map((ing: any) => ing.food?.toLowerCase()) || [];
const recipeContent = `${recipe.name?.toLowerCase()} ${recipe.description?.toLowerCase()} ${recipeTags.join(' ')} ${recipeIngredients.join(' ')}`;

const hasRestriction = restrictions.some(restriction => 
  recipeContent.includes(restriction.toLowerCase())
);

if (hasRestriction) {
  return false; // Excluir receita
}
```

### 4. Validação de Dados Nutricionais

```typescript
// ✅ CORRETO: Verificar se receita tem dados nutricionais
if (!recipe.nutrition || !recipe.nutrition.calories) {
  return false; // Excluir receitas sem dados nutricionais
}

// ✅ CORRETO: Verificar range calórico da refeição
const recipeCalories = recipe.nutrition.calories;
const minCalories = targetMealCalories * 0.8;
const maxCalories = targetMealCalories * 1.2;

if (recipeCalories < minCalories || recipeCalories > maxCalories) {
  return false; // Excluir receitas fora do range
}
```

## 🔧 Implementação Corrigida

### 1. Edge Functions

#### mealie-integration - CORRIGIDO
```typescript
// Estrutura de retorno corrigida
{
  success: true,
  cardapio: mealPlan,
  source: 'mealie_real',
  metadata: {
    total_days: requestData.dias,
    target_calories: requestData.calorias,
    restrictions_applied: requestData.restricoes?.length || 0,
    preferences_applied: requestData.preferencias?.length || 0,
    generation_timestamp: new Date().toISOString(),
    variation_applied: true,
    nutrition_source: 'mealie_real' // ✅ Dados reais
  }
}
```

### 2. Adaptadores - CORRIGIDOS

#### Mapeamento de Refeições
```typescript
// ✅ CORRETO: Mapeamento completo
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
```

## 🚨 Problemas Corrigidos

### 1. ✅ Estrutura de Dados Inconsistente
- **Problema:** Mapeamento incorreto de refeições
- **Solução:** Adicionado mapeamento completo com acentos

### 2. ✅ Filtros do Mealie Não Aplicados
- **Problema:** Busca genérica sem filtros nutricionais
- **Solução:** Adicionado `include_nutrition=true` e filtros por calorias

### 3. ✅ Distribuição de Calorias Incorreta
- **Problema:** Cálculos estimados em vez de exatos
- **Solução:** Usar dados nutricionais reais do Mealie

### 4. ✅ Restrições Não Aplicadas
- **Problema:** Filtros por texto em vez de tags
- **Solução:** Verificar restrições em tags e ingredientes

## 📊 Resultado Esperado

Com essas correções, o sistema deve:

1. ✅ **Respeitar a ordem das 5 refeições** (café da manhã, almoço, lanche, jantar, ceia)
2. ✅ **Usar dados nutricionais exatos** do Mealie (não inventar valores)
3. ✅ **Aplicar restrições corretamente** (excluir alimentos proibidos)
4. ✅ **Distribuir calorias conforme regras** (25%, 35%, 15%, 20%, 5%)
5. ✅ **Garantir variação** entre receitas
6. ✅ **Validar dados** antes de retornar

## 🔍 Testes Recomendados

1. **Teste de Restrições:** Verificar se alimentos proibidos são excluídos
2. **Teste Nutricional:** Confirmar que dados são reais do Mealie
3. **Teste de Ordem:** Validar sequência das 5 refeições
4. **Teste de Calorias:** Verificar distribuição correta
5. **Teste de Variação:** Confirmar que receitas não se repetem
