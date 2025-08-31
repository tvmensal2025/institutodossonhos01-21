import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase com service role key
const supabaseUrl = 'https://hlrkoyywjpckdotimtik.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhscmtveXl3anBja2RvdGltdGlrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMjk3Mjk3NCwiZXhwIjoyMDQ4NTQ4OTc0fQ.Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createBucket() {
  try {
    console.log('🚀 Criando bucket character-images...');
    
    // Tentar criar o bucket
    const { data, error } = await supabase.storage.createBucket('character-images', {
      public: true,
      allowedMimeTypes: ['image/png', 'image/jpeg', 'image/gif'],
      fileSizeLimit: 5242880 // 5MB
    });

    if (error) {
      if (error.message.includes('already exists')) {
        console.log('✅ Bucket character-images já existe!');
        return true;
      } else {
        console.error('❌ Erro ao criar bucket:', error);
        return false;
      }
    }

    console.log('✅ Bucket character-images criado com sucesso!');
    return true;
  } catch (error) {
    console.error('💥 Erro fatal ao criar bucket:', error);
    return false;
  }
}

async function listBuckets() {
  try {
    console.log('📋 Listando buckets existentes...');
    
    const { data, error } = await supabase.storage.listBuckets();

    if (error) {
      console.error('❌ Erro ao listar buckets:', error);
      return;
    }

    console.log('📊 Buckets encontrados:');
    data.forEach(bucket => {
      console.log(`- ${bucket.name} (${bucket.public ? 'público' : 'privado'})`);
    });
  } catch (error) {
    console.error('💥 Erro fatal ao listar buckets:', error);
  }
}

async function main() {
  console.log('🔧 Configurando storage do Supabase...');
  
  await listBuckets();
  await createBucket();
  
  console.log('✅ Configuração concluída!');
}

main().catch(console.error); 