# 🔥 COMO SÃO CALCULADAS AS CALORIAS DIÁRIAS

## 📊 **PROCESSO DE CÁLCULO**

### **1. CÁLCULO DO BMR (Metabolismo Basal)**
```
Fórmula Mifflin-St Jeor:
- Homem: 10 × peso + 6.25 × altura - 5 × idade + 5
- Mulher: 10 × peso + 6.25 × altura - 5 × idade - 161
```

### **2. CÁLCULO DO TDEE (Gasto Energético Total)**
```
TDEE = BMR × Fator de Atividade

Fatores de Atividade:
- Sedentário: 1.2
- Leve: 1.375  
- Moderado: 1.55
- Alto: 1.725
- Atleta: 1.9
```

### **3. AJUSTE POR OBJETIVO**
```
Calorias Finais = TDEE × Ajuste do Objetivo

Ajustes por Objetivo:
- 🏃‍♂️ Emagrecimento: 80% do TDEE (-20%)
- ⚖️ Manter Peso: 100% do TDEE (0%)
- 💪 Ganho de Massa: 110% do TDEE (+10%)
- 🏋️‍♀️ Hipertrofia: 115% do TDEE (+15%)
```

## 🎯 **EXEMPLO PRÁTICO**

### **Dados do Usuário:**
- Peso: 70 kg
- Altura: 170 cm
- Idade: 30 anos
- Sexo: Masculino
- Nível de Atividade: Moderado
- Objetivo: Emagrecimento

### **Cálculo Passo a Passo:**

#### **1. BMR (Metabolismo Basal)**
```
BMR = 10 × 70 + 6.25 × 170 - 5 × 30 + 5
BMR = 700 + 1,062.5 - 150 + 5
BMR = 1,617.5 kcal/dia
```

#### **2. TDEE (Gasto Energético Total)**
```
TDEE = 1,617.5 × 1.55 (moderado)
TDEE = 2,507 kcal/dia
```

#### **3. Calorias Finais (Emagrecimento)**
```
Calorias = 2,507 × 0.80
Calorias = 2,006 kcal/dia
```

## 📋 **VALORES PRÉ-DEFINIDOS NO MODAL**

### **Objetivos com Calorias Automáticas:**
```
🏃‍♂️ Emagrecimento: 1800 kcal
⚖️ Manter Peso: 2200 kcal  
💪 Ganho de Massa: 2500 kcal
🏋️‍♀️ Hipertrofia: 2800 kcal
```

**⚠️ NOTA:** Estes valores são aproximados e baseados em um usuário médio. O cálculo real considera os dados específicos do usuário (peso, altura, idade, sexo, nível de atividade).

## 🔧 **CÓDIGO IMPLEMENTADO**

### **Função Principal:**
```typescript
export function calculateNutritionalGoals(
  objective: NutritionObjective,
  physicalData: PhysicalData
): NutritionalGoals {
  const { peso_kg } = physicalData;
  
  // 1. Calcular TDEE
  const tdee = calculateTDEE(physicalData);
  
  // 2. Ajustar calorias com base no objetivo
  const targetCalories = Math.round(tdee * MACRO_CONSTANTS.CALORIE_ADJUSTMENT[objective]);
  
  // 3. Calcular macros...
  return { calories: targetCalories, ... };
}
```

### **Constantes de Ajuste:**
```typescript
const CALORIE_ADJUSTMENT = {
  [NutritionObjective.LOSE]: 0.8,      // -20%
  [NutritionObjective.MAINTAIN]: 1.0,  // 0%
  [NutritionObjective.GAIN]: 1.1,      // +10%
  [NutritionObjective.LEAN_MASS]: 1.15 // +15%
};
```

## 🎯 **MACRONUTRIENTES CALCULADOS**

### **Proteína (g/kg):**
- Emagrecimento: 2.2g/kg
- Manter Peso: 1.8g/kg
- Ganho de Massa: 1.6g/kg
- Hipertrofia: 2.0g/kg

### **Gordura (g/kg):**
- Emagrecimento: 0.8g/kg
- Manter Peso: 0.8g/kg
- Ganho de Massa: 0.9g/kg
- Hipertrofia: 0.8g/kg

### **Carboidratos:**
- Calculados para fechar as calorias restantes
- Mínimo de 50g garantido

## 🔄 **ATUALIZAÇÃO AUTOMÁTICA**

As calorias são recalculadas automaticamente quando:
- ✅ Objetivo é alterado
- ✅ Peso do usuário muda
- ✅ Modal é aberto

---

**✅ SISTEMA DE CÁLCULO IMPLEMENTADO E FUNCIONANDO!** 🔥
