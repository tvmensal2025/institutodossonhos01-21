import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🔧 Iniciando correção de documentos travados...');
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Buscar documentos travados em processamento há mais de 2 minutos (mais agressivo)
    const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000).toISOString();
    
    const { data: stuckDocs, error: queryError } = await supabase
      .from('medical_documents')
      .select('id, user_id, type, processing_started_at, report_meta')
      .eq('analysis_status', 'processing')
      .lt('processing_started_at', twoMinutesAgo);

    if (queryError) {
      throw new Error(`Erro ao buscar documentos: ${queryError.message}`);
    }

    if (!stuckDocs || stuckDocs.length === 0) {
      return new Response(JSON.stringify({
        success: true,
        message: 'Nenhum documento travado encontrado',
        processed: 0
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log(`📋 Encontrados ${stuckDocs.length} documentos travados`);

    let processedCount = 0;
    let errorCount = 0;

    // Processar cada documento travado
    for (const doc of stuckDocs) {
      try {
        console.log(`🔄 Processando documento ${doc.id}...`);

        // Tentar recuperar imagens do documento
        const imagePaths = doc.report_meta?.image_paths || [];
        const images: string[] = [];

        if (imagePaths.length > 0) {
          // Gerar URLs assinadas para as imagens
          for (const path of imagePaths.slice(0, 3)) {
            try {
              const { data } = await supabase.storage
                .from('medical-documents')
                .createSignedUrl(path, 600);
              
              if (data?.signedUrl) {
                images.push(data.signedUrl);
              }
            } catch (e) {
              console.warn(`⚠️ Erro ao gerar URL para ${path}:`, e.message);
            }
          }
        }

        // Chamar a função de processamento
        const { data: processResult, error: processError } = await supabase.functions.invoke('process-medical-exam', {
          body: {
            documentId: doc.id,
            userId: doc.user_id,
            examType: doc.type || 'exame_laboratorial',
            images: images
          }
        });

        if (processError) {
          console.error(`❌ Erro ao processar documento ${doc.id}:`, processError);
          
          // Marcar como erro
          await supabase
            .from('medical_documents')
            .update({
              analysis_status: 'error',
              processing_stage: 'erro_automatico',
              progress_pct: 0
            })
            .eq('id', doc.id);
          
          errorCount++;
        } else {
          console.log(`✅ Documento ${doc.id} processado com sucesso`);
          processedCount++;
        }

      } catch (error) {
        console.error(`❌ Erro ao processar documento ${doc.id}:`, error);
        
        // Marcar como erro
        await supabase
          .from('medical_documents')
          .update({
            analysis_status: 'error',
            processing_stage: 'erro_catch',
            progress_pct: 0
          })
          .eq('id', doc.id);
        
        errorCount++;
      }
    }

    console.log(`✅ Correção finalizada: ${processedCount} processados, ${errorCount} com erro`);

    return new Response(JSON.stringify({
      success: true,
      message: `Processamento concluído: ${processedCount} documentos corrigidos, ${errorCount} com erro`,
      totalFound: stuckDocs.length,
      processed: processedCount,
      errors: errorCount
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('❌ Erro na correção de documentos:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});