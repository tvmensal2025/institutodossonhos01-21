import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase
const supabaseUrl = 'https://hlrkoyywjpckdotimtik.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhscmtveXl3anBja2RvdGltdGlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMxNTMwNDcsImV4cCI6MjA2ODcyOTA0N30.kYEtg1hYG2pmcyIeXRs-vgNIVOD76Yu7KPlyFN0vdUI';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function criarParticipacoesExemplo() {
  console.log('🎯 Criando participações de exemplo para testar modal...');

  try {
    // 1. Buscar usuários
    const { data: usuarios, error: userError } = await supabase.auth.admin.listUsers();
    
    if (userError) {
      console.log('❌ Erro ao buscar usuários:', userError.message);
      
      // Vamos tentar buscar users via profiles
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('user_id, full_name')
        .limit(5);
        
      if (profileError) {
        console.log('❌ Erro ao buscar profiles:', profileError.message);
        console.log('💡 Vamos criar um usuário de teste...');
        
        // Usar um UUID de exemplo
        const testUserId = '00000000-0000-0000-0000-000000000001';
        
        // 2. Buscar alguns desafios
        const { data: desafios, error: desafiosError } = await supabase
          .from('challenges')
          .select('id, title, daily_log_target')
          .eq('is_active', true)
          .limit(5);

        if (desafiosError) {
          console.log('❌ Erro ao buscar desafios:', desafiosError.message);
          return;
        }

        console.log(`📋 Encontrados ${desafios.length} desafios`);

        // 3. Criar participações de exemplo
        for (const desafio of desafios) {
          const progressoAleatorio = Math.floor(Math.random() * desafio.daily_log_target);
          
          const participacao = {
            user_id: testUserId,
            challenge_id: desafio.id,
            progress: progressoAleatorio,
            is_completed: progressoAleatorio >= desafio.daily_log_target,
            started_at: new Date().toISOString()
          };

          const { data, error } = await supabase
            .from('challenge_participations')
            .upsert(participacao, { 
              onConflict: 'user_id,challenge_id',
              ignoreDuplicates: false 
            })
            .select();

          if (error) {
            console.log(`❌ Erro ao criar participação em "${desafio.title}":`, error.message);
          } else {
            console.log(`✅ Participação criada: "${desafio.title}" - ${progressoAleatorio}/${desafio.daily_log_target}`);
          }
        }

        console.log('\n🎉 Participações de exemplo criadas!');
        console.log(`📱 Teste o modal em: http://localhost:8081/dashboard`);
        console.log(`👤 Use o ID de usuário de teste: ${testUserId}`);
        
        return;
      }
      
      if (profiles && profiles.length > 0) {
        console.log(`👤 Encontrados ${profiles.length} usuários via profiles`);
        const userId = profiles[0].user_id;
        
        // Criar participações para este usuário
        await criarParticipacoesParaUsuario(userId);
      }
      
      return;
    }

    if (usuarios.users && usuarios.users.length > 0) {
      console.log(`👤 Encontrados ${usuarios.users.length} usuários`);
      const userId = usuarios.users[0].id;
      
      await criarParticipacoesParaUsuario(userId);
    } else {
      console.log('❌ Nenhum usuário encontrado. Criando dados de teste...');
    }

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

async function criarParticipacoesParaUsuario(userId) {
  // 2. Buscar alguns desafios
  const { data: desafios, error: desafiosError } = await supabase
    .from('challenges')
    .select('id, title, daily_log_target')
    .eq('is_active', true)
    .limit(5);

  if (desafiosError) {
    console.log('❌ Erro ao buscar desafios:', desafiosError.message);
    return;
  }

  console.log(`📋 Encontrados ${desafios.length} desafios para usuário ${userId}`);

  // 3. Criar participações de exemplo
  for (const desafio of desafios) {
    const progressoAleatorio = Math.floor(Math.random() * desafio.daily_log_target);
    
    const participacao = {
      user_id: userId,
      challenge_id: desafio.id,
      progress: progressoAleatorio,
      is_completed: progressoAleatorio >= desafio.daily_log_target,
      started_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('challenge_participations')
      .upsert(participacao, { 
        onConflict: 'user_id,challenge_id',
        ignoreDuplicates: false 
      })
      .select();

    if (error) {
      console.log(`❌ Erro ao criar participação em "${desafio.title}":`, error.message);
    } else {
      console.log(`✅ Participação criada: "${desafio.title}" - ${progressoAleatorio}/${desafio.daily_log_target}`);
    }
  }

  console.log('\n🎉 Participações criadas com sucesso!');
  console.log(`📱 Agora você pode testar o modal mobile em: http://localhost:8081/dashboard`);
}

// Executar o script
criarParticipacoesExemplo();