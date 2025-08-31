const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://hlrkoyywjpckdotimtik.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhscmtveXl3anBja2RvdGltdGlrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzE1MzA0NywiZXhwIjoyMDY4NzI5MDQ3fQ.N8nPPP2QW6lDZUb4BHj7SzeDa_qPAYVMWJNUzMnZGaU';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function forceRestartAnalysis() {
  try {
    console.log('🔍 Buscando documentos em processamento...');
    
    // Buscar documentos travados em processamento
    const { data: docs, error } = await supabase
      .from('medical_documents')
      .select('*')
      .eq('analysis_status', 'processing')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('❌ Erro ao buscar documentos:', error);
      return;
    }
    
    if (!docs || docs.length === 0) {
      console.log('ℹ️ Nenhum documento em processamento encontrado');
      return;
    }
    
    console.log(`📋 Encontrados ${docs.length} documentos em processamento:`);
    docs.forEach(doc => {
      console.log(`- ID: ${doc.id}`);
      console.log(`  Título: ${doc.title}`);
      console.log(`  Status: ${doc.processing_stage || 'unknown'}`);
      console.log(`  Progresso: ${doc.progress_pct || 0}%`);
      console.log(`  Imagens: ${doc.images_processed || 0}/${doc.images_total || 0}`);
      console.log(`  Caminhos: ${JSON.stringify(doc.report_meta?.image_paths || [])}`);
      console.log('---');
    });
    
    // Resetar status e forçar nova análise
    for (const doc of docs) {
      console.log(`🔄 Resetando documento ${doc.id}...`);
      
      // Reset do status
      const { error: updateError } = await supabase
        .from('medical_documents')
        .update({
          analysis_status: 'pending',
          processing_stage: null,
          progress_pct: 0,
          images_processed: 0,
          processing_started_at: null
        })
        .eq('id', doc.id);
      
      if (updateError) {
        console.error(`❌ Erro ao resetar documento ${doc.id}:`, updateError);
        continue;
      }
      
      // Chamar a função de análise novamente
      console.log(`🚀 Disparando nova análise para ${doc.id}...`);
      
      const { data: result, error: invokeError } = await supabase.functions.invoke('analyze-medical-exam', {
        body: {
          documentId: doc.id,
          storagePaths: doc.report_meta?.image_paths || [],
          userId: doc.user_id,
          examType: doc.type
        }
      });
      
      if (invokeError) {
        console.error(`❌ Erro ao disparar análise para ${doc.id}:`, invokeError);
      } else {
        console.log(`✅ Análise disparada com sucesso para ${doc.id}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

forceRestartAnalysis();
