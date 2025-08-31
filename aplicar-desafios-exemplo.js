import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

// Configuração do Supabase
const supabaseUrl = 'https://hlrkoyywjpckdotimtik.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhscmtveXl3anBja2RvdGltdGlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMxNTMwNDcsImV4cCI6MjA2ODcyOTA0N30.kYEtg1hYG2pmcyIeXRs-vgNIVOD76Yu7KPlyFN0vdUI';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function criarDesafiosExemplo() {
  console.log('🚀 Criando desafios de exemplo para teste mobile...');

  try {
    // 1. Primeiro, verificar se a tabela challenges existe
    const { data: tables, error: tableError } = await supabase
      .from('challenges')
      .select('id')
      .limit(1);

    if (tableError && tableError.code === '42P01') {
      console.log('❌ Tabela challenges não existe. Executando migração...');
      
      // Executar SQL de criação via RPC se disponível
      const sqlScript = fs.readFileSync('./criar-desafios-exemplo-mobile.sql', 'utf8');
      console.log('📄 SQL script carregado. Aplicando...');
      
      // Como alternativa, vamos criar os desafios diretamente
      const desafios = [
        {
          title: 'Beber 2L de Água Diariamente',
          description: 'Mantenha-se hidratado bebendo pelo menos 2 litros de água por dia',
          category: 'Hidratação',
          difficulty: 'facil',
          duration_days: 30,
          points_reward: 50,
          badge_icon: '💧',
          badge_name: 'Hidratação Master',
          instructions: 'Beba água regularmente ao longo do dia. Use um aplicativo ou marque em uma garrafa para acompanhar.',
          tips: ['Tenha sempre uma garrafa de água por perto', 'Beba um copo ao acordar', 'Use apps para lembrar'],
          is_active: true,
          is_featured: true,
          is_group_challenge: false,
          daily_log_target: 2000,
          daily_log_unit: 'ml'
        },
        {
          title: 'Caminhar 8000 Passos',
          description: 'Dê pelo menos 8000 passos todos os dias para manter-se ativo',
          category: 'Atividade Física',
          difficulty: 'medio',
          duration_days: 30,
          points_reward: 75,
          badge_icon: '🚶‍♂️',
          badge_name: 'Caminhador Dedicado',
          instructions: 'Use um contador de passos ou app no celular. Caminhe durante as ligações, use escadas.',
          tips: ['Estacione mais longe', 'Use escadas', 'Caminhe durante ligações'],
          is_active: true,
          is_featured: true,
          is_group_challenge: false,
          daily_log_target: 8000,
          daily_log_unit: 'passos'
        },
        {
          title: 'Meditar 10 Minutos',
          description: 'Pratique meditação ou mindfulness por 10 minutos diários',
          category: 'Bem-estar Mental',
          difficulty: 'facil',
          duration_days: 21,
          points_reward: 60,
          badge_icon: '🧘‍♀️',
          badge_name: 'Mente Zen',
          instructions: 'Use apps como Headspace, Calm ou pratique respiração profunda. Encontre um local tranquilo.',
          tips: ['Comece com 5 minutos', 'Use apps guiados', 'Pratique sempre no mesmo horário'],
          is_active: true,
          is_featured: false,
          is_group_challenge: false,
          daily_log_target: 10,
          daily_log_unit: 'minutos'
        },
        {
          title: 'Dormir 8 Horas',
          description: 'Tenha uma noite de sono reparador com pelo menos 8 horas',
          category: 'Sono',
          difficulty: 'medio',
          duration_days: 30,
          points_reward: 80,
          badge_icon: '😴',
          badge_name: 'Dorminhoco Saudável',
          instructions: 'Estabeleça uma rotina noturna, evite telas 1h antes de dormir, mantenha o quarto escuro.',
          tips: ['Desligue telas 1h antes', 'Mantenha horário fixo', 'Quarto escuro e fresco'],
          is_active: true,
          is_featured: true,
          is_group_challenge: false,
          daily_log_target: 8,
          daily_log_unit: 'horas'
        },
        {
          title: 'Exercitar-se 30 Minutos',
          description: 'Faça pelo menos 30 minutos de exercício físico moderado',
          category: 'Atividade Física',
          difficulty: 'dificil',
          duration_days: 30,
          points_reward: 120,
          badge_icon: '💪',
          badge_name: 'Atleta Dedicado',
          instructions: 'Pode ser academia, corrida, natação, dança ou esportes. O importante é mover o corpo.',
          tips: ['Escolha atividade prazerosa', 'Comece gradualmente', 'Varie os exercícios'],
          is_active: true,
          is_featured: true,
          is_group_challenge: false,
          daily_log_target: 30,
          daily_log_unit: 'minutos'
        }
      ];

      console.log('📝 Inserindo desafios...');
      
      for (const desafio of desafios) {
        const { data, error } = await supabase
          .from('challenges')
          .insert(desafio)
          .select();

        if (error) {
          console.log(`❌ Erro ao criar desafio "${desafio.title}":`, error.message);
        } else {
          console.log(`✅ Desafio criado: "${desafio.title}" (${desafio.badge_icon})`);
        }
      }
    }

    // 2. Verificar desafios existentes
    const { data: desafios, error: desafiosError } = await supabase
      .from('challenges')
      .select('id, title, difficulty, daily_log_target, daily_log_unit, badge_icon')
      .eq('is_active', true)
      .order('difficulty');

    if (desafiosError) {
      console.log('❌ Erro ao buscar desafios:', desafiosError.message);
      return;
    }

    console.log('\n🎯 DESAFIOS DISPONÍVEIS:');
    console.log('========================');
    desafios.forEach((desafio, index) => {
      console.log(`${index + 1}. ${desafio.badge_icon} ${desafio.title}`);
      console.log(`   Meta: ${desafio.daily_log_target} ${desafio.daily_log_unit}/dia`);
      console.log(`   Dificuldade: ${desafio.difficulty}`);
      console.log('');
    });

    console.log('🎉 Desafios configurados com sucesso!');
    console.log('📱 Agora você pode testar o modal mobile em: http://localhost:8081/dashboard');

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

// Executar o script
criarDesafiosExemplo();