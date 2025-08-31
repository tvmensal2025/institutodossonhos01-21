import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hlrkoyywjpckdotimtik.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhscmtveXl3anBja2RvdGltdGlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMxNTMwNDcsImV4cCI6MjA2ODcyOTA0N30.kYEtg1hYG2pmcyIeXRs-vgNIVOD76Yu7KPlyFN0vdUI';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function verificarUsuarios() {
  console.log('🔍 Verificando usuários no banco...');
  
  try {
    // Verificar tabela auth.users
    console.log('1. Verificando auth.users...');
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      console.log('❌ Erro ao acessar auth.users:', authError.message);
    } else {
      console.log(`✅ Encontrados ${authUsers.users.length} usuários autenticados`);
      authUsers.users.forEach((user, index) => {
        console.log(`   ${index + 1}. ${user.email} (${user.id})`);
      });
    }
    
    // Verificar tabela profiles
    console.log('2. Verificando profiles...');
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .limit(5);
    
    if (profilesError) {
      console.log('❌ Erro ao buscar profiles:', profilesError);
    } else {
      console.log(`✅ Encontrados ${profiles.length} perfis`);
      profiles.forEach((profile, index) => {
        console.log(`   ${index + 1}. ${profile.full_name || 'Sem nome'} (${profile.user_id})`);
      });
    }
    
    // Verificar participações existentes
    console.log('3. Verificando participações...');
    const { data: participacoes, error: participacoesError } = await supabase
      .from('challenge_participations')
      .select('*')
      .limit(5);
    
    if (participacoesError) {
      console.log('❌ Erro ao buscar participações:', participacoesError);
    } else {
      console.log(`✅ Encontradas ${participacoes.length} participações`);
      participacoes.forEach((part, index) => {
        console.log(`   ${index + 1}. User: ${part.user_id} | Challenge: ${part.challenge_id} | Progress: ${part.progress}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

verificarUsuarios(); 