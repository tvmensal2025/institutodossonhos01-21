import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Credentials': 'true',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-requested-with, Authorization, X-Client-Info, Content-Type, Range',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS, PATCH',
  'Access-Control-Max-Age': '86400',
  'Access-Control-Expose-Headers': 'Content-Length, Content-Range',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    // Verificar se o token de autorização está presente
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Token de autorização não fornecido' }), { 
        status: 401, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Criar cliente com service role para operações de storage
    const supabaseService = createClient(supabaseUrl, supabaseServiceKey);
    
    // Criar cliente com token do usuário para verificar autenticação
    const supabase = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { headers: { Authorization: authHeader } }
    });

    const { data: { user }, error: authErr } = await supabase.auth.getUser();
    if (authErr || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { 
        status: 401, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const { fileName, fileData, userId } = await req.json();
    
    if (!fileName || !fileData || !userId) {
      return new Response(JSON.stringify({ error: 'Dados do arquivo são obrigatórios' }), { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Verificar se o userId corresponde ao usuário autenticado
    if (userId !== user.id) {
      return new Response(JSON.stringify({ error: 'Usuário não autorizado' }), { 
        status: 403, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Converter base64 para buffer
    const base64Data = fileData.replace(/^data:[^;]+;base64,/, '');
    const fileBuffer = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));

    // Gerar nome único para o arquivo
    const fileExt = fileName.split('.').pop();
    const uniqueFileName = `tmp/${userId}/${crypto.randomUUID()}.${fileExt}`;

    // Upload usando service role
    const { data: uploadData, error: uploadError } = await supabaseService.storage
      .from('medical-documents')
      .upload(uniqueFileName, fileBuffer, {
        contentType: `image/${fileExt}`,
        upsert: false
      });

    if (uploadError) {
      console.error('Erro no upload:', uploadError);
      return new Response(JSON.stringify({ error: uploadError.message }), { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ 
      path: uploadData.path,
      success: true 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (e) {
    console.error('Erro na função upload-medical-file:', e);
    return new Response(JSON.stringify({ error: String(e?.message ?? e) }), { 
      status: 500, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
