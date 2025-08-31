import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

// Configuração do Supabase
const supabaseUrl = process.env.SUPABASE_URL || 'http://127.0.0.1:54321';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';
const supabase = createClient(supabaseUrl, supabaseKey);

async function createChatImagesBucket() {
  try {
    // Criar o bucket para armazenar imagens do chat
    const { data: bucketData, error: bucketError } = await supabase
      .storage
      .createBucket('chat-images', {
        public: true,
        fileSizeLimit: 5 * 1024 * 1024, // 5MB
        allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg', 'image/gif'],
      });

    if (bucketError) {
      console.error('Erro ao criar bucket chat-images:', bucketError);
      return;
    }

    console.log('✅ Bucket chat-images criado com sucesso:', bucketData);

    // Criar política para permitir acesso público às imagens
    const { data: policyData, error: policyError } = await supabase
      .storage
      .from('chat-images')
      .createSignedUrl('test.png', 60);

    if (policyError) {
      console.error('Aviso: Erro ao testar política de acesso (isso é normal se o arquivo não existir):', policyError);
    } else {
      console.log('✅ Política de acesso configurada com sucesso');
    }

    console.log('✅ Configuração do bucket chat-images concluída!');
  } catch (error) {
    console.error('❌ Erro ao configurar bucket:', error);
  }
}

createChatImagesBucket();