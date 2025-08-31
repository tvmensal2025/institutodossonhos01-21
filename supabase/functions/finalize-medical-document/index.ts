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

    const { documentId, userId, examType, images } = await req.json();
    
    console.log('📋 Dados recebidos:', {
      documentId,
      userId,
      examType,
      imagesCount: images?.length || 0
    });

    if (!documentId || !userId) {
      throw new Error('DocumentId e userId são obrigatórios');
    }

    // Chamar analyze-medical-exam
    console.log('🔗 Chamando analyze-medical-exam...');
    
    const { data, error } = await supabase.functions.invoke('analyze-medical-exam', {
      body: {
        documentId,
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


