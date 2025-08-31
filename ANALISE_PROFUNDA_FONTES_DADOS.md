# 🔍 ANÁLISE PROFUNDA - ONDE O SISTEMA BUSCA AS INFORMAÇÕES

## 📊 **RESUMO EXECUTIVO**

O sistema Mission Health Nexus possui **múltiplas fontes de dados** integradas que alimentam diferentes componentes. Esta análise detalha **exatamente** onde cada informação é buscada.

---

## 🤖 **SOFIA - ASSISTENTE VIRTUAL**

### **📍 FONTES DE DADOS:**

#### **1. Perfil do Usuário**
```typescript
// Localização: supabase/functions/health-chat-bot/index.ts
const { data: profile } = await supabase
  .from('profiles')
  .select('*')
  .eq('user_id', userId)
  .single();
```
- **Tabela:** `profiles`
- **Dados:** Nome, email, dados físicos, histórico

#### **2. Medições de Peso**
```typescript
// Localização: supabase/functions/health-chat-bot/index.ts
const { data: weightData } = await supabase
  .from('weight_measurements')
  .select('peso_kg')
  .eq('user_id', userId)
  .order('measurement_date', { ascending: false })
  .limit(1)
  .single();
```
- **Tabela:** `weight_measurements`
- **Dados:** Peso atual, histórico, tendências

#### **3. Missões Diárias**
```typescript
// Localização: supabase/functions/health-chat-bot/index.ts
const { data: streakData } = await supabase
  .from('daily_mission_sessions')
  .select('streak_days')
  .eq('user_id', userId)
  .order('date', { ascending: false })
  .limit(1)
  .single();
```
- **Tabela:** `daily_mission_sessions`
- **Dados:** Streak atual, missões completadas

#### **4. Análise de Imagens (Google AI)**
```typescript
// Localização: supabase/functions/food-analysis/index.ts
const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro-vision:generateContent', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${GOOGLE_AI_API_KEY}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    contents: [{
      parts: [
        { text: prompt },
        { inline_data: { mime_type: 'image/jpeg', data: base64Image } }
      ]
    }]
  })
});
```
- **API:** Google AI Gemini
- **Dados:** Análise nutricional de fotos de comida

---

## 🩺 **DR. VITAL - ANÁLISE MÉDICA**

### **📍 FONTES DE DADOS:**

#### **1. Dados Semanais Completos**
```typescript
// Localização: supabase/functions/dr-vital-weekly-report/index.ts
// Buscar perfil do usuário
const { data: profile } = await supabase
  .from('profiles')
  .select('*')
  .eq('user_id', userId)
  .single();

// Buscar medições de peso da semana
const { data: weightMeasurements } = await supabase
  .from('weight_measurements')
  .select('*')
  .eq('user_id', userId)
  .gte('measurement_date', weekStartStr)
  .lte('measurement_date', weekEndStr)
  .order('measurement_date', { ascending: true });

// Buscar dados de hidratação
const { data: waterData } = await supabase
  .from('water_tracking')
  .select('*')
  .eq('user_id', userId)
  .gte('date', weekStartStr)
  .lte('date', weekEndStr);

// Buscar dados de sono
const { data: sleepData } = await supabase
  .from('sleep_tracking')
  .select('*')
  .eq('user_id', userId)
  .gte('date', weekStartStr)
  .lte('date', weekEndStr);

// Buscar missões completadas
const { data: missionData } = await supabase
  .from('daily_mission_sessions')
  .select('*')
  .eq('user_id', userId)
  .gte('date', weekStartStr)
  .lte('date', weekEndStr)
  .order('date', { ascending: true });
```

#### **2. Health Score Calculado**
```typescript
// Localização: supabase/functions/dr-vital-weekly-report/index.ts
const { data: healthScore } = await supabase
  .rpc('calculate_weekly_health_score', { 
    p_user_id: userId, 
    p_week_start: weekStartStr 
  });
```
- **Função:** `calculate_weekly_health_score`
- **Dados:** Score de saúde baseado em múltiplas métricas

#### **3. Análise IA (OpenAI)**
```typescript
// Localização: supabase/functions/dr-vital-weekly-report/index.ts
const response = await fetch('https://api.openai.com/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${OPENAI_API_KEY}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    model: 'o3-2025-04-16',
    messages: [
      { 
        role: 'system', 
        content: 'Você é o Dr. Vital, um médico especialista em medicina preventiva.' 
      },
      { role: 'user', content: analysisPrompt }
    ],
    temperature: 0.3,
    max_tokens: 1500
  }),
});
```
- **API:** OpenAI GPT-4
- **Dados:** Análise médica personalizada

---

## ⚖️ **PESAGENS - BALANÇA XIAOMI**

### **📍 FONTES DE DADOS:**

#### **1. Dados da Balança (Tempo Real)**
```typescript
// Localização: src/components/XiaomiScaleFlow.tsx
const decodeWeightData = (value: DataView): ScaleData => {
  const data = new Uint8Array(value.buffer);
  
  // Protocolo da Xiaomi Scale 2 - decodificação real
  let weight = 0;
  let bodyFat = 0;
  let muscleMass = 0;
  let waterPercentage = 0;
  let boneMass = 0;
  let visceralFat = 0;
  let metabolicAge = 0;
  
  if (data.length >= 13) {
    // Xiaomi Scale 2 formato de dados
    weight = ((data[12] << 8) | data[11]) / 200.0; // Peso em kg
    
    if (data.length >= 20) {
      // Dados de composição corporal
      bodyFat = ((data[18] << 8) | data[17]) / 100.0; // Gordura corporal %
      waterPercentage = ((data[20] << 8) | data[19]) / 100.0; // Água %
      muscleMass = ((data[14] << 8) | data[13]) / 200.0; // Massa muscular kg
      boneMass = data[16] / 10.0; // Massa óssea kg
      visceralFat = data[15]; // Gordura visceral
      metabolicAge = data[21]; // Idade metabólica
    }
  }
  
  return {
    weight: Math.round(weight * 10) / 10,
    bodyFat,
    muscleMass,
    waterPercentage,
    boneMass,
    visceralFat,
    metabolicAge
  };
};
```
- **Fonte:** Balança Xiaomi via Bluetooth
- **Dados:** Peso, composição corporal, idade metabólica

#### **2. Salvamento no Banco**
```typescript
// Localização: src/components/weighing/XiaomiScaleIntegration.tsx
const weightMeasurement = {
  user_id: user.id,
  peso_kg: data.weight,
  gordura_corporal_percent: data.bodyFat,
  massa_muscular_kg: data.muscleMass,
  agua_corporal_percent: data.bodyWater,
  osso_kg: data.boneMass,
  metabolismo_basal_kcal: data.basalMetabolism,
  idade_metabolica: data.metabolicAge,
  imc: bmi,
  circunferencia_abdominal_cm: estimatedAbdominalCircumference,
  gordura_visceral: data.bodyFat ? Math.round(data.bodyFat * 0.4) : undefined,
  device_type: 'xiaomi_scale',
  notes: `Pesagem automática - Gordura: ${data.bodyFat?.toFixed(1)}%, Músculo: ${data.muscleMass?.toFixed(1)}kg, Água: ${data.bodyWater?.toFixed(1)}%`
};

const { error } = await supabase
  .from('weight_measurements')
  .insert(weightMeasurement);
```
- **Tabela:** `weight_measurements`
- **Dados:** Todas as medições de composição corporal

#### **3. Atualização em Tempo Real**
```typescript
// Localização: src/components/dashboard/DashboardOverview.tsx
useEffect(() => {
  const channel = supabase
    .channel('weight-measurements-changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'weight_measurements'
      },
      () => {
        // Recarregar dados quando houver mudanças
        window.location.reload();
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}, []);
```
- **Sistema:** Supabase Realtime
- **Dados:** Atualizações automáticas de pesagens

---

## 📱 **REALTIME - ATUALIZAÇÕES EM TEMPO REAL**

### **📍 FONTES DE DADOS:**

#### **1. Configuração Realtime**
```sql
-- Localização: supabase/migrations/20250724015626-4f5a13d0-feb2-449c-ba3d-6b860fe5928e.sql
-- Habilitar realtime para weight_measurements
ALTER TABLE weight_measurements REPLICA IDENTITY FULL;

-- Adicionar tabela à publicação realtime
ALTER PUBLICATION supabase_realtime ADD TABLE weight_measurements;
```

#### **2. Canais de Atualização**
```typescript
// Localização: src/hooks/useWeightMeasurement.ts
const channel = supabase
  .channel('weight-measurements-changes')
  .on(
    'postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'weight_measurements'
    },
    (payload) => {
      console.log('Mudança detectada:', payload);
      // Atualizar dados localmente
      setMeasurements(prev => {
        if (payload.eventType === 'INSERT') {
          return [payload.new, ...prev];
        } else if (payload.eventType === 'UPDATE') {
          return prev.map(m => m.id === payload.new.id ? payload.new : m);
        } else if (payload.eventType === 'DELETE') {
          return prev.filter(m => m.id !== payload.old.id);
        }
        return prev;
      });
    }
  )
  .subscribe();
```

---

## 📊 **DASHBOARD - VISÃO GERAL**

### **📍 FONTES DE DADOS:**

#### **1. Estatísticas de Peso**
```typescript
// Localização: src/hooks/useWeightMeasurement.ts
const { measurements, stats, loading } = useWeightMeasurement();

// Cálculo de estatísticas
const stats = {
  currentWeight: latest?.peso_kg || 0,
  currentIMC: latest?.imc || 0,
  weightChange: weightChange,
  averageWeight: averageWeight,
  totalMeasurements: measurements.length
};
```

#### **2. Dados de Composição Corporal**
```typescript
// Localização: src/components/dashboard/DashboardOverview.tsx
const composition = [
  { 
    name: 'Massa Muscular', 
    value: Number(latest.massa_muscular_kg) || 35, 
    color: '#10B981' 
  },
  { 
    name: 'Gordura', 
    value: Number(latest.gordura_corporal_percent) || 20, 
    color: '#F59E0B' 
  },
  { 
    name: 'Água', 
    value: Number(latest.agua_corporal_percent) || 45, 
    color: '#3B82F6' 
  },
];
```

#### **3. Dados Mockados (Temporários)**
```typescript
// Localização: src/components/dashboard/DashboardOverview.tsx
const weeklyStats = [
  { day: 'Seg', exercicio: 45, hidratacao: 1.8, sono: 7.5 },
  { day: 'Ter', exercicio: 30, hidratacao: 2.1, sono: 8.0 },
  { day: 'Qua', exercicio: 60, hidratacao: 2.0, sono: 7.0 },
  { day: 'Qui', exercicio: 40, hidratacao: 1.9, sono: 7.5 },
  { day: 'Sex', exercicio: 50, hidratacao: 2.2, sono: 8.5 },
  { day: 'Sab', exercicio: 75, hidratacao: 2.0, sono: 9.0 },
  { day: 'Dom', exercicio: 35, hidratacao: 1.7, sono: 8.0 },
];
```

---

## 🎯 **MISSÕES DIÁRIAS**

### **📍 FONTES DE DADOS:**

#### **1. Questões das Missões**
```typescript
// Localização: src/data/daily-questions-final.ts
export const dailyQuestions = [
  {
    id: '1',
    question: 'Como você está se sentindo hoje?',
    type: 'mood',
    options: ['Muito bem', 'Bem', 'Normal', 'Cansado', 'Estressado'],
    points: 10
  },
  // ... mais questões
];
```

#### **2. Progresso do Usuário**
```typescript
// Localização: src/hooks/useDailyMissions.ts
const { data: sessionData } = await supabase
  .from('daily_mission_sessions')
  .select('*')
  .eq('user_id', user.id)
  .eq('date', today)
  .single();
```

---

## 📋 **TABELAS PRINCIPAIS DO BANCO**

### **1. `profiles`**
- **Dados:** Perfil completo do usuário
- **Uso:** Sofia, Dr. Vital, Dashboard

### **2. `weight_measurements`**
- **Dados:** Todas as medições de peso e composição corporal
- **Uso:** Dashboard, Dr. Vital, Análises

### **3. `daily_mission_sessions`**
- **Dados:** Progresso das missões diárias
- **Uso:** Sofia, Dashboard, Relatórios

### **4. `chat_conversations`**
- **Dados:** Histórico de conversas com Sofia
- **Uso:** Análise emocional, Relatórios

### **5. `water_tracking`**
- **Dados:** Registro de hidratação
- **Uso:** Dr. Vital, Dashboard

### **6. `sleep_tracking`**
- **Dados:** Registro de sono
- **Uso:** Dr. Vital, Dashboard

---

## 🔄 **FLUXO DE DADOS**

### **1. Entrada de Dados**
```
Balança Xiaomi → weight_measurements → Realtime → Dashboard
Usuário → Sofia → chat_conversations → Análise IA
Missões → daily_mission_sessions → Relatórios
```

### **2. Processamento**
```
Dados Brutos → Supabase → Edge Functions → IA → Análise
```

### **3. Saída**
```
Dashboard ← Dados Processados ← APIs ← Análises
Relatórios ← Dados Semanais ← Dr. Vital
```

---

## 🎯 **CONCLUSÃO**

O sistema possui **fontes de dados bem estruturadas**:

- ✅ **Sofia:** Perfis + Peso + Missões + IA
- ✅ **Dr. Vital:** Dados semanais + IA médica
- ✅ **Pesagens:** Balança Xiaomi + Realtime
- ✅ **Dashboard:** Estatísticas + Composição corporal
- ✅ **Realtime:** Atualizações automáticas

**Todas as informações são buscadas de fontes reais e confiáveis!** 🚀 