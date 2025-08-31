import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hlrkoyywjpckdotimtik.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhscmtveXl3anBja2RvdGltdGlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMxNTMwNDcsImV4cCI6MjA2ODcyOTA0N30.kYEtg1hYG2pmcyIeXRs-vgNIVOD76Yu7KPlyFN0vdUI';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function verificarBucket() {
  console.log('🔍 Verificando bucket chat-images...\n');

  try {
    // Tentar listar arquivos no bucket
    const { data, error } = await supabase.storage
      .from('chat-images')
      .list('', { limit: 1 });

    if (error) {
      console.error('❌ Erro ao acessar bucket:', error.message);
      
      if (error.message.includes('not found')) {
        console.log('\n⚠️ O bucket "chat-images" NÃO EXISTE!');
        console.log('\n📝 INSTRUÇÕES PARA CRIAR:');
        console.log('1. Acesse: https://supabase.com/dashboard/project/hlrkoyywjpckdotimtik/storage/buckets');
        console.log('2. Clique em "New bucket"');
        console.log('3. Nome: chat-images');
        console.log('4. Marque "Public bucket" ✅');
        console.log('5. Clique em "Create bucket"');
      }
      return false;
    }

    console.log('✅ Bucket chat-images existe!');
    console.log('📁 Arquivos no bucket:', data?.length || 0);
    return true;

  } catch (error) {
    console.error('❌ Erro geral:', error);
    return false;
  }
}

// Executar verificação
verificarBucket();