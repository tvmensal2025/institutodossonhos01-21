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

    // Sem verificação de senha ou autenticação para facilitar o debug
    await req.json().catch(() => ({}));

    // Criar cliente com service role para operações de storage (sem verificar autenticação)
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // SQL para corrigir políticas RLS
    const sql = `
      -- 1) Remover políticas antigas se existirem
      DROP POLICY IF EXISTS "medical_docs_owner_select" ON storage.objects;
      DROP POLICY IF EXISTS "medical_docs_owner_insert" ON storage.objects;
      DROP POLICY IF EXISTS "medical_docs_owner_update" ON storage.objects;
      DROP POLICY IF EXISTS "medical_docs_owner_delete" ON storage.objects;

      -- 2) Criar políticas simplificadas e mais permissivas
      CREATE POLICY "medical_docs_owner_select" ON storage.objects
        FOR SELECT USING (
          bucket_id = 'medical-documents' AND
          (auth.uid()::text = (storage.foldername(name))[1] OR 
          auth.uid()::text = (storage.foldername(name))[2])
        );

      CREATE POLICY "medical_docs_owner_insert" ON storage.objects
        FOR INSERT WITH CHECK (
          bucket_id = 'medical-documents' AND
          (auth.uid()::text = (storage.foldername(name))[1] OR 
          auth.uid()::text = (storage.foldername(name))[2] OR
          (name LIKE 'tmp/%'))
        );

      CREATE POLICY "medical_docs_owner_update" ON storage.objects
        FOR UPDATE USING (
          bucket_id = 'medical-documents' AND
          (auth.uid()::text = (storage.foldername(name))[1] OR 
          auth.uid()::text = (storage.foldername(name))[2])
        );

      CREATE POLICY "medical_docs_owner_delete" ON storage.objects
        FOR DELETE USING (
          bucket_id = 'medical-documents' AND
          (auth.uid()::text = (storage.foldername(name))[1] OR 
          auth.uid()::text = (storage.foldername(name))[2])
        );

      -- 3) Garantir que o bucket existe
      INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
      VALUES (
        'medical-documents', 
        'medical-documents', 
        false, 
        52428800, -- 50MB
        ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf']
      )
      ON CONFLICT (id) DO UPDATE SET
        public = EXCLUDED.public,
        file_size_limit = EXCLUDED.file_size_limit,
        allowed_mime_types = EXCLUDED.allowed_mime_types;
    `;

    // Executar SQL
    const { error } = await supabase.rpc('exec_sql', { sql_query: sql });

    if (error) {
      console.error('Erro ao executar SQL:', error);
      return new Response(JSON.stringify({ error: error.message }), { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ 
      success: true,
      message: 'Políticas RLS corrigidas com sucesso'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (e) {
    console.error('Erro na função fix-storage-rls:', e);
    return new Response(JSON.stringify({ error: String(e?.message ?? e) }), { 
      status: 500, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
