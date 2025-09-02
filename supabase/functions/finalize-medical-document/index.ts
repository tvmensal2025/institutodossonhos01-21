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
    console.log('🚀 Iniciando função finalize-medical-document...');
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { documentId, userId, examType, images, tmpPaths, title, idempotencyKey } = await req.json();
    
    console.log('📋 Dados recebidos:', {
      documentId,
      userId,
      examType,
      imagesCount: images?.length || 0,
      tmpPathsCount: tmpPaths?.length || 0,
      title,
      idempotencyKey
    });

    // Se não tem documentId mas tem tmpPaths, criar documento primeiro
    let actualDocumentId = documentId;
    
    if (!actualDocumentId && tmpPaths?.length > 0) {
      console.log('📝 Criando documento a partir de tmpPaths...');
      
      // Criar documento na tabela medical_documents
      const { data: newDoc, error: createError } = await supabase
        .from('medical_documents')
        .insert({
          user_id: userId,
          title: title || 'Exame',
          type: examType || 'exame_laboratorial',
          status: 'processing',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();
        
      if (createError) {
        console.error('❌ Erro ao criar documento:', createError);
        throw createError;
      }
      
      actualDocumentId = newDoc.id;
      console.log('✅ Documento criado:', actualDocumentId);
    }

    if (!actualDocumentId || !userId) {
      throw new Error('DocumentId e userId são obrigatórios');
    }

    // Chamar analyze-medical-exam
    console.log('🔗 Chamando analyze-medical-exam...');
    
    const { data, error } = await supabase.functions.invoke('analyze-medical-exam', {
      body: {
        documentId: actualDocumentId,
        userId,
        examType,
        images: images || []
      }
    });

    if (error) {
      console.error('❌ Erro ao chamar analyze-medical-exam:', error);
      throw error;
    }

    console.log('✅ analyze-medical-exam executado com sucesso');

    return new Response(JSON.stringify({
      success: true,
      message: 'Documento finalizado com sucesso',
      data
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (e) {
    console.error('❌ Erro na finalização:', e);
    
    return new Response(JSON.stringify({
      success: false,
      error: e.message || 'Erro interno'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});


