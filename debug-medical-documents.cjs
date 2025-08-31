const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase
const supabaseUrl = 'https://hlrkoyywjpckdotimtik.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhscmtveXl3anBja2RvdGltdGlrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNDQ5NzI5MCwiZXhwIjoyMDUwMDczMjkwfQ.Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8';
const supabase = createClient(supabaseUrl, supabaseKey);

async function debugMedicalDocuments() {
  console.log('🔍 DEBUG: Verificando documentos médicos...\n');

  try {
    // Buscar todos os documentos
    const { data: documents, error } = await supabase
      .from('medical_documents')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Erro ao buscar documentos:', error);
      return;
    }

    console.log(`📊 Total de documentos: ${documents.length}\n`);

    documents.forEach((doc, index) => {
      console.log(`📄 Documento ${index + 1}:`);
      console.log(`   ID: ${doc.id}`);
      console.log(`   Título: ${doc.title}`);
      console.log(`   Status: ${doc.analysis_status}`);
      console.log(`   Estágio: ${doc.processing_stage || 'N/A'}`);
      console.log(`   Progresso: ${doc.progress_pct || 0}%`);
      console.log(`   Imagens: ${doc.images_processed || 0}/${doc.images_total || 0}`);
      console.log(`   Criado: ${doc.created_at}`);
      console.log(`   Atualizado: ${doc.updated_at}`);
      console.log(`   User ID: ${doc.user_id}`);
      
      if (doc.report_meta) {
        console.log(`   Meta: ${JSON.stringify(doc.report_meta, null, 2)}`);
      }
      
      console.log('');
    });

    // Verificar documentos travados
    const stuckDocs = documents.filter(doc => 
      doc.analysis_status === 'processing' && 
      (doc.progress_pct === 0 || doc.images_processed === 0)
    );

    if (stuckDocs.length > 0) {
      console.log(`⚠️ DOCUMENTOS TRAVADOS: ${stuckDocs.length}`);
      stuckDocs.forEach(doc => {
        console.log(`   - ${doc.title} (ID: ${doc.id})`);
      });
      console.log('');
    }

    // Verificar storage
    console.log('🔍 Verificando storage...');
    const { data: storageFiles, error: storageError } = await supabase.storage
      .from('medical-documents')
      .list('', { limit: 100 });

    if (storageError) {
      console.error('❌ Erro ao verificar storage:', storageError);
    } else {
      console.log(`📁 Arquivos no storage: ${storageFiles.length}`);
      storageFiles.forEach(file => {
        console.log(`   - ${file.name} (${file.metadata?.size || 'N/A'} bytes)`);
      });
    }

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

debugMedicalDocuments();
