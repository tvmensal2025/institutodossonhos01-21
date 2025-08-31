// Script simples para criar usuário Sirlene Correa
// Uso: node create-sirlene-simple.js

import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase - usar variáveis do .env
const supabaseUrl = 'https://imagensids.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImltYWdlbmlkc2lkcyIsInJvbGUiOiJzZXJ2aWNlX3JvbGUiLCJpYXQiOjE3NTM4MjMxNzEsImV4cCI6MjA2OTM5OTE3MX0.xRxY-T5WBTWt7SbFsmd3_zW2kkPZi9RPWHhDfurPdMK44kmfKNvsJqGnG0CqyNlCH9BrOYEfAfBJ0_1CjH3j40nFxpdj27avQhsV6lO1LaN_2Tg1-8VHOml8G0bSuAVLVbp-CFJ3C0cTwTLGPQZja2x6eayswaWsdnnE_LO0nd0AVn9HTmY0Ozn9QvxGzAGLd5dPpf-UGzj8w7yCY3ulZPfqEyUoTQVc3T4slVQolI2YBGXxH0eBo8NrQVFSpJBv6uhmqfs_Lfv-ydhdGWMSdbckyqh4mNfRUjEdE1ArPAgkuQCVfUVeE_nji2i3NAJNgEVQzH-ElvMLQ8Lm8yFSiQ';

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

// Dados de pesagem dos últimos 30 dias
function generateWeightData() {
  const data = [];
  const baseWeight = 75.5;
  const baseDate = new Date();
  
  for (let i = 30; i >= 0; i--) {
    const date = new Date(baseDate);
    date.setDate(date.getDate() - i);
    
    const variation = (Math.random() - 0.6) * 0.3;
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

// Conversas com Sofia e Dr. Vital
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

// Missões diárias
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
    console.log('✅ Perfil criado com sucesso!');
    
    // 2. Inserir dados de pesagem
    console.log('⚖️ Inserindo dados de pesagem...');
    const weightData = generateWeightData();
    const { error: weightError } = await supabase
      .from('weight_measurements')
      .upsert(weightData);
    
    if (weightError) {
      throw new Error(`Erro ao inserir pesagens: ${weightError.message}`);
    }
    console.log('✅ Dados de pesagem inseridos!');
    
    // 3. Inserir conversas
    console.log('💬 Inserindo conversas...');
    const conversations = generateConversations();
    const { error: convError } = await supabase
      .from('chat_conversations')
      .upsert(conversations);
    
    if (convError) {
      throw new Error(`Erro ao inserir conversas: ${convError.message}`);
    }
    console.log('✅ Conversas inseridas!');
    
    // 4. Inserir missões diárias
    console.log('🎯 Inserindo missões diárias...');
    const missions = generateDailyMissions();
    const { error: missionError } = await supabase
      .from('daily_mission_sessions')
      .upsert(missions);
    
    if (missionError) {
      throw new Error(`Erro ao inserir missões: ${missionError.message}`);
    }
    console.log('✅ Missões inseridas!');
    
    console.log('\n🎉 Usuário Sirlene Correa criado com sucesso!');
    console.log('📧 Email: tvmensal2025@gmail.com');
    console.log('👤 Nome: Sirlene Correa');
    console.log('📊 Dados inseridos:');
    console.log(`   - ${weightData.length} pesagens`);
    console.log(`   - ${conversations.length} conversas`);
    console.log(`   - ${missions.length} missões diárias`);
    
  } catch (error) {
    console.error('❌ Erro ao criar usuário:', error);
  }
}

// Executar
createSirleneUser(); 