# Changelog - Implementação de Metas de Macronutrientes Guiadas por Objetivo

## Resumo

Implementação de um sistema de cálculo automático de macronutrientes com base no objetivo do usuário, peso corporal e dados físicos. O sistema atualiza automaticamente as metas nutricionais quando o objetivo ou peso do usuário mudam.

## Constantes Implementadas

### Proteína (g/kg)
- **Perder peso:** 2,2 g/kg (travada)
- **Manter peso:** 1,8 g/kg (editável)
- **Ganhar peso:** 1,6 g/kg (editável)
- **Ganhar massa muscular:** 2,0 g/kg (travada)

### Gordura (g/kg)
- **Perder peso:** 0,8 g/kg (mín. 0,6 g/kg)
- **Manter peso:** 0,8 g/kg
- **Ganhar peso:** 0,9 g/kg
- **Ganhar massa muscular:** 0,8 g/kg

### Ajuste Calórico (% do TDEE)
- **Perder peso:** -20% do TDEE
- **Manter peso:** 100% do TDEE
- **Ganhar peso:** +10% do TDEE
- **Ganhar massa muscular:** +15% do TDEE

### Outros
- **Mínimo de carboidratos:** 50g
- **Mínimo de gordura (ajuste):** 0,6 g/kg

## Regras de Arredondamento
- **Calorias:** Arredondadas para o múltiplo de 50 mais próximo
- **Macronutrientes:** Arredondados para o múltiplo de 5 mais próximo

## Comportamento de Travamento
- Proteína é travada automaticamente para objetivos "Perder peso" e "Ganhar massa muscular"
- Usuário pode destravar manualmente clicando no ícone de cadeado
- Valores destravados são preservados até que o usuário trave novamente ou mude o objetivo

## Cálculo do TDEE
- **BMR (Mifflin-St Jeor):**
  - Homem: `10*peso_kg + 6.25*altura_cm - 5*idade + 5`
  - Mulher: `10*peso_kg + 6.25*altura_cm - 5*idade - 161`
- **Fator de Atividade:**
  - Sedentário: 1.2
  - Leve: 1.375
  - Moderado: 1.55
  - Alto: 1.725
  - Atleta: 1.9
  - Fallback: 1.5
- **Fallback se faltam dados:** `30 * peso_kg`

## Fechamento de Carboidratos e Calorias
- `kcal_proteina = 4 * proteina_g`
- `kcal_gordura = 9 * gordura_g`
- `carboidratos_g = max(50, floor((kcal_alvo - kcal_proteina - kcal_gordura)/4))`
- Se `carboidratos_g < 50`, reduzir gordura para 0,6 g/kg e recalcular

## Arquivos Criados/Modificados
- **Novo:** `src/utils/macro-calculator.ts` - Utilitário para cálculos de macronutrientes
- **Novo:** `src/utils/macro-calculator.test.ts` - Testes unitários para o utilitário
- **Modificado:** `src/components/nutrition-tracking/MealPlanGeneratorModal.tsx` - Implementação da interface

## Testes
- Testes unitários completos para todas as funções do utilitário
- Casos de teste para pesos de 60kg, 80kg e 100kg nos 4 objetivos
- Verificação de arredondamento, mínimos de carboidratos e cálculos de calorias
