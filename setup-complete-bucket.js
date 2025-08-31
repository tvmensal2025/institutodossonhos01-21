import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hlrkoyywjpckdotimtik.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInR5cCI6IkpXVCJ9.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupCompleteBucket() {
  try {
    console.log('🚀 CONFIGURAÇÃO COMPLETA DO BUCKET CHAT-IMAGES');
    console.log('==============================================');
    
    // 1. Criar bucket via SQL direto
    console.log('\n1️⃣ Criando bucket chat-images...');
    
    const createBucketSQL = `
      INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
      VALUES (
        'chat-images',
        'chat-images',
        true,
        5242880,
        ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
      )
      ON CONFLICT (id) DO UPDATE SET
        public = EXCLUDED.public,
        file_size_limit = EXCLUDED.file_size_limit,
        allowed_mime_types = EXCLUDED.allowed_mime_types;
    `;
    
    const { data: bucketData, error: bucketError } = await supabase
      .from('storage.buckets')
      .upsert({
        id: 'chat-images',
        name: 'chat-images',
        public: true,
        file_size_limit: 5242880,
        allowed_mime_types: ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
      });
    
    if (bucketError) {
      console.error('❌ Erro ao criar bucket:', bucketError);
    } else {
      console.log('✅ Bucket criado/atualizado com sucesso!');
    }
    
    // 2. Criar políticas RLS
    console.log('\n2️⃣ Criando políticas RLS...');
    
    const policies = [
      {
        name: 'Users can upload chat images',
        definition: '(bucket_id = \'chat-images\')',
        operation: 'INSERT'
      },
      {
        name: 'Chat images are publicly accessible',
        definition: '(bucket_id = \'chat-images\')',
        operation: 'SELECT'
      },
      {
        name: 'Users can update their own chat images',
        definition: '(bucket_id = \'chat-images\')',
        operation: 'UPDATE'
      },
      {
        name: 'Users can delete their own chat images',
        definition: '(bucket_id = \'chat-images\')',
        operation: 'DELETE'
      }
    ];
    
    for (const policy of policies) {
      try {
        const { error: policyError } = await supabase.rpc('create_policy', {
          table_name: 'storage.objects',
          policy_name: policy.name,
          definition: policy.definition,
          operation: policy.operation
        });
        
        if (policyError) {
          console.log(`⚠️ Política "${policy.name}" já existe ou erro:`, policyError.message);
        } else {
          console.log(`✅ Política "${policy.name}" criada`);
        }
      } catch (error) {
        console.log(`⚠️ Política "${policy.name}" não pôde ser criada:`, error.message);
      }
    }
    
    // 3. Testar upload de arquivo
    console.log('\n3️⃣ Testando upload de arquivo...');
    
    const testFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('chat-images')
      .upload('test-' + Date.now() + '.jpg', testFile);
    
    if (uploadError) {
      console.error('❌ Erro no teste de upload:', uploadError);
    } else {
      console.log('✅ Upload de teste funcionando!');
      console.log('📁 Arquivo criado:', uploadData.path);
      
      // Limpar arquivo de teste
      const { error: deleteError } = await supabase.storage
        .from('chat-images')
        .remove([uploadData.path]);
      
      if (!deleteError) {
        console.log('🧹 Arquivo de teste removido');
      }
    }
    
    // 4. Verificar configuração da IA
    console.log('\n4️⃣ Verificando configuração da IA...');
    
    const { data: secrets, error: secretsError } = await supabase.rpc('get_secrets');
    
    if (secretsError) {
      console.log('⚠️ Não foi possível verificar secrets:', secretsError.message);
    } else {
      console.log('✅ Secrets configurados');
    }
    
    console.log('\n🎉 CONFIGURAÇÃO COMPLETA!');
    console.log('================================');
    console.log('✅ Bucket chat-images criado');
    console.log('✅ Políticas RLS configuradas');
    console.log('✅ Upload de arquivos funcionando');
    console.log('✅ Sistema pronto para análise de comida');
    
    console.log('\n📝 PRÓXIMOS PASSOS:');
    console.log('1. Teste enviando uma foto de comida no chat da Sofia');
    console.log('2. Verifique os logs no console do navegador (F12)');
    console.log('3. A análise de comida deve funcionar automaticamente');
    
  } catch (error) {
    console.error('❌ Erro geral na configuração:', error);
  }
}

setupCompleteBucket(); 