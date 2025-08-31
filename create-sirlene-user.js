// Script para criar usuário Sirlene Correa com dados de 30 dias
// Uso: node create-sirlene-user.js

import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'your-service-role-key';

const supabase = createClient(supabaseUrl, supabaseKey);

// Dados do usuário
const userData = {
  user_id: 'sirlene-correa-2025',
  email: 'tvmensal2025@gmail.com',
  full_name: 'Sirlene Correa',
  first_name: 'Sirlene',
  last_name: 'Correa',
  gender: 'feminino',
  birth_date: '1985-06-15',
  height_cm: 165,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
};

// Função para gerar dados de pesagem dos últimos 30 dias
function generateWeightData() {
  const data = [];
  const baseWeight = 75.5; // Peso inicial
  const baseDate = new Date();
  
  for (let i = 30; i >= 0; i--) {
    const date = new Date(baseDate);
    date.setDate(date.getDate() - i);
    
    // Variação de peso realista (-0.2kg a +0.1kg por dia)
    const variation = (Math.random() - 0.6) * 0.3; // Tendência de perda
    const weight = Math.max(70, baseWeight + (30 - i) * -0.1 + variation);
    
    data.push({
      user_id: userData.user_id,
      peso_kg: parseFloat(weight.toFixed(1)),
      gordura_corporal_percent: Math.max(25, 30 - (30 - i) * 0.1 + (Math.random() - 0.5) * 2),
      massa_muscular_kg: Math.max(45, 48 + (30 - i) * 0.05 + (Math.random() - 0.5) * 1),
      agua_corporal_percent: Math.min(65, 60 + (30 - i) * 0.1 + (Math.random() - 0.5) * 1),
      massa_ossea_kg: Math.max(2.5, 2.8 + (Math.random() - 0.5) * 0.2),
      measurement_date: date.toISOString().split('T')[0],
      created_at: date.toISOString(),
      updated_at: date.toISOString()
    });
  }
  
  return data;
}

// Função para gerar dados emocionais
function generateEmotionalData() {
  const emotions = [
    { name: 'Ansiedade', level: 3, description: 'Sentindo-se um pouco ansiosa com as mudanças' },
    { name: 'Motivação', level: 8, description: 'Muito motivada com os resultados' },
    { name: 'Estresse', level: 4, description: 'Estresse moderado no trabalho' },
    { name: 'Felicidade', level: 7, description: 'Feliz com o progresso' },
    { name: 'Frustração', level: 2, description: 'Pequena frustração com o ritmo' },
    { name: 'Determinação', level: 9, description: 'Muito determinada a continuar' },
    { name: 'Calma', level: 6, description: 'Sentindo-se calma e equilibrada' },
    { name: 'Energia', level: 7, description: 'Com boa energia para os exercícios' }
  ];
  
  const data = [];
  const baseDate = new Date();
  
  for (let i = 30; i >= 0; i--) {
    const date = new Date(baseDate);
    date.setDate(date.getDate() - i);
    
    // Escolher 2-3 emoções por dia
    const dailyEmotions = emotions
      .sort(() => Math.random() - 0.5)
      .slice(0, Math.floor(Math.random() * 2) + 2);
    
    dailyEmotions.forEach(emotion => {
      data.push({
        user_id: userData.user_id,
        sentiment_score: (emotion.level - 5) / 5, // Score entre -1 e 1
        emotions_detected: [emotion.name],
        pain_level: Math.floor(Math.random() * 3) + 1, // 1-3
        stress_level: Math.floor(Math.random() * 5) + 1, // 1-5
        energy_level: Math.floor(Math.random() * 5) + 3, // 3-7
        mood_keywords: [emotion.name.toLowerCase()],
        physical_symptoms: [],
        emotional_topics: [emotion.description],
        concerns_mentioned: [],
        goals_mentioned: ['Perder peso', 'Melhorar saúde'],
        achievements_mentioned: ['Exercícios feitos', 'Alimentação melhorada'],
        analysis_metadata: {
          emotion_level: emotion.level,
          description: emotion.description
        },
        week_start: date.toISOString().split('T')[0],
        created_at: date.toISOString(),
        updated_at: date.toISOString()
      });
    });
  }
  
  return data;
}

// Função para gerar conversas com Sofia e Dr. Vital
function generateConversations() {
  const conversations = [
    {
      character: 'sofia',
      message: 'Olá Sirlene! Como você está se sentindo hoje?',
      response: 'Oi Sofia! Estou bem motivada, consegui fazer 30 minutos de caminhada hoje!',
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      character: 'dr-vital',
      message: 'Sirlene, seus dados de composição corporal estão muito bons! Continue assim!',
      response: 'Obrigada Dr. Vital! Estou seguindo todas as suas orientações.',
      date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      character: 'sofia',
      message: 'Que ótimo! Você já perdeu 2.3kg este mês. Como está sua alimentação?',
      response: 'Estou comendo mais frutas e verduras, e reduzindo o açúcar. Está sendo difícil mas estou persistindo!',
      date: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      character: 'dr-vital',
      message: 'Excelente progresso! Sua massa muscular aumentou 0.8kg. Continue com os exercícios!',
      response: 'Vou continuar! Os exercícios estão me ajudando muito com o humor também.',
      date: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      character: 'sofia',
      message: 'Sirlene, como você está lidando com a ansiedade?',
      response: 'Estou praticando meditação 10 minutos por dia. Está ajudando muito!',
      date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      character: 'dr-vital',
      message: 'Perfeito! A meditação é excelente para o controle emocional. Continue!',
      response: 'Sim, estou sentindo a diferença. Estou mais calma e focada.',
      date: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      character: 'sofia',
      message: 'Que bom! Você está no caminho certo. Como está o sono?',
      response: 'Melhorou muito! Estou dormindo 7-8 horas por noite e acordando mais disposta.',
      date: new Date(Date.now() - 22 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      character: 'dr-vital',
      message: 'Excelente! O sono é fundamental para a recuperação muscular. Parabéns!',
      response: 'Obrigada! Estou muito feliz com todos os resultados.',
      date: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      character: 'sofia',
      message: 'Sirlene, você está sendo um exemplo! Como está a hidratação?',
      response: 'Estou bebendo 2L de água por dia. Está sendo fácil manter essa meta!',
      date: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      character: 'dr-vital',
      message: 'Perfeito! A hidratação é essencial. Seus dados de água corporal estão ótimos!',
      response: 'Vou continuar assim! Estou muito motivada com todo o progresso.',
      date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
    }
  ];
  
  return conversations.map(conv => ({
    user_id: userData.user_id,
    character: conv.character,
    message: conv.message,
    response: conv.response,
    created_at: conv.date,
    updated_at: conv.date
  }));
}

// Função para gerar missões diárias
function generateDailyMissions() {
  const missions = [
    'Fazer 30 minutos de caminhada',
    'Beber 2L de água',
    'Comer 3 porções de frutas',
    'Fazer exercícios de alongamento',
    'Meditar por 10 minutos',
    'Dormir 8 horas',
    'Evitar açúcar refinado',
    'Fazer exercícios de força',
    'Comer salada no almoço',
    'Fazer 10 minutos de respiração profunda'
  ];
  
  const data = [];
  const baseDate = new Date();
  
  for (let i = 30; i >= 0; i--) {
    const date = new Date(baseDate);
    date.setDate(date.getDate() - i);
    
    // 70% de chance de completar a missão
    const isCompleted = Math.random() < 0.7;
    
    data.push({
      user_id: userData.user_id,
      mission_text: missions[Math.floor(Math.random() * missions.length)],
      date: date.toISOString().split('T')[0],
      is_completed: isCompleted,
      created_at: date.toISOString(),
      updated_at: date.toISOString()
    });
  }
  
  return data;
}

async function createSirleneUser() {
  try {
    console.log('🚀 Criando usuário Sirlene Correa...');
    
    // 1. Criar perfil do usuário
    console.log('📝 Criando perfil...');
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert(userData);
    
    if (profileError) {
      throw new Error(`Erro ao criar perfil: ${profileError.message}`);
    }
    
    // 2. Inserir dados de pesagem
    console.log('⚖️ Inserindo dados de pesagem...');
    const weightData = generateWeightData();
    const { error: weightError } = await supabase
      .from('weight_measurements')
      .upsert(weightData);
    
    if (weightError) {
      throw new Error(`Erro ao inserir pesagens: ${weightError.message}`);
    }
    
    // 3. Inserir dados emocionais (usando chat_emotional_analysis)
    console.log('😊 Inserindo dados emocionais...');
    const emotionalData = generateEmotionalData();
    const { error: emotionalError } = await supabase
      .from('chat_emotional_analysis')
      .upsert(emotionalData);
    
    if (emotionalError) {
      throw new Error(`Erro ao inserir dados emocionais: ${emotionalError.message}`);
    }
    
    // 4. Inserir conversas
    console.log('💬 Inserindo conversas...');
    const conversations = generateConversations();
    const { error: convError } = await supabase
      .from('chat_conversations')
      .upsert(conversations);
    
    if (convError) {
      throw new Error(`Erro ao inserir conversas: ${convError.message}`);
    }
    
    // 5. Inserir missões diárias
    console.log('🎯 Inserindo missões diárias...');
    const missions = generateDailyMissions();
    const { error: missionError } = await supabase
      .from('daily_mission_sessions')
      .upsert(missions);
    
    if (missionError) {
      throw new Error(`Erro ao inserir missões: ${missionError.message}`);
    }
    
    console.log('✅ Usuário Sirlene Correa criado com sucesso!');
    console.log('📧 Email: tvmensal2025@gmail.com');
    console.log('👤 Nome: Sirlene Correa');
    console.log('📊 Dados inseridos:');
    console.log(`   - ${weightData.length} pesagens`);
    console.log(`   - ${emotionalData.length} registros emocionais`);
    console.log(`   - ${conversations.length} conversas`);
    console.log(`   - ${missions.length} missões diárias`);
    
  } catch (error) {
    console.error('❌ Erro ao criar usuário:', error);
  }
}

// Executar
createSirleneUser(); 