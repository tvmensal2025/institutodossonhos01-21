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
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Inicializar Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('🔍 Verificando se Sirlene já existe...');
    
    // Verificar se já existe
    const { data: existingUser } = await supabase
      .from('profiles')
      .select('id, full_name, email')
      .eq('email', 'tvmensal2025@gmail.com')
      .single();

    if (existingUser) {
      console.log('✅ Sirlene já existe:', existingUser);
      return new Response(JSON.stringify({
        success: true,
        message: 'Sirlene já existe',
        user: existingUser
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('❌ Sirlene não encontrada. Criando...');

    // Criar Sirlene
    const { data: newUser, error: createError } = await supabase
      .from('profiles')
      .insert({
        id: '550e8400-e29b-41d4-a716-446655440000', // UUID válido
        user_id: '550e8400-e29b-41d4-a716-446655440000', // Mesmo UUID para user_id
        full_name: 'Sirlene Correa',
        email: 'tvmensal2025@gmail.com',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (createError) {
      throw new Error(`Erro ao criar Sirlene: ${createError.message}`);
    }

    console.log('✅ Sirlene criada com sucesso:', newUser);

    return new Response(JSON.stringify({
      success: true,
      message: 'Sirlene criada com sucesso',
      user: newUser
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('💥 Erro:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
