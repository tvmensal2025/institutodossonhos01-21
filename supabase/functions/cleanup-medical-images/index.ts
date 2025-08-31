import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-requested-with, Authorization, X-Client-Info, Content-Type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Max-Age': '86400',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!; // admin para storage/delete
    const supabase = createClient(supabaseUrl, serviceKey);

    const now = new Date();
    const cutoffIso = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();

    // 1) Buscar documentos finalizados há >24h e ainda com imagens salvas
    const { data: docs, error } = await supabase
      .from('medical_documents')
      .select('id,user_id,created_at,analysis_status,file_url,report_path,report_meta,images_deleted_at')
      .eq('is_submitted', true)
      .eq('analysis_status', 'ready')
      .is('images_deleted_at', null)
      .lt('created_at', cutoffIso)
      .limit(500);

    if (error) {
      throw error;
    }

    let totalRemoved = 0;
    let totalDocs = 0;
    for (const d of docs || []) {
      totalDocs++;
      const paths: string[] = Array.isArray(d.report_meta?.image_paths)
        ? d.report_meta.image_paths as string[]
        : (d.file_url ? [d.file_url as string] : []);
      if (paths.length === 0) {
        // apenas marca que não há imagens
        await supabase.from('medical_documents')
          .update({ images_deleted_at: new Date().toISOString(), file_url: null })
          .eq('id', d.id);
        continue;
      }
      const { error: delErr } = await supabase.storage.from('medical-documents').remove(paths);
      if (delErr) {
        console.error('Falha ao remover imagens do documento', d.id, delErr.message);
        continue; // processa próximos
      }
      totalRemoved += paths.length;
      // Atualiza metadados marcando que imagens foram apagadas
      const newMeta = { ...(d.report_meta || {}), images_deleted: true } as Record<string, unknown>;
      await supabase.from('medical_documents')
        .update({ images_deleted_at: new Date().toISOString(), file_url: null, report_meta: newMeta })
        .eq('id', d.id);
    }

    // 2) Limpar temporários em tmp/ mais antigos que 24h (best-effort)
    // varre top-level de tmp e subpastas de usuários
    const listUserDirs = async (prefix: string) => {
      const { data: entries } = await supabase.storage.from('medical-documents').list(prefix, { limit: 1000 });
      return entries || [];
    };

    const tmpRoot = await listUserDirs('tmp');
    for (const entry of tmpRoot) {
      if (entry.name && entry.id) {
        const userPrefix = `tmp/${entry.name}`;
        const { data: files } = await supabase.storage.from('medical-documents').list(userPrefix, { limit: 1000 });
        const oldFiles = (files || []).filter(f => {
          const created = f.created_at ? new Date(f.created_at).getTime() : 0;
          return created > 0 && created < now.getTime() - 24 * 60 * 60 * 1000;
        });
        if (oldFiles.length > 0) {
          const toRemove = oldFiles.map(f => `${userPrefix}/${f.name}`);
          await supabase.storage.from('medical-documents').remove(toRemove);
        }
      }
    }

    return new Response(JSON.stringify({ totalDocs, totalRemoved }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (e) {
    return new Response(JSON.stringify({ error: e?.message || String(e) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});


