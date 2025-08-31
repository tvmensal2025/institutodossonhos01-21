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
    // Inicializar Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Iniciando geração automática de insights semanais...');

    // Calcular semana atual (segunda a sexta)
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay() + 1); // Segunda-feira
    const weekStartStr = weekStart.toISOString().split('T')[0];

    // Buscar todos os usuários que tiveram conversas esta semana
    const { data: activeUsers, error: usersError } = await supabase
      .from('chat_conversations')
      .select('user_id')
      .gte('created_at', weekStart.toISOString())
      .distinct();

    if (usersError) {
      console.error('Erro ao buscar usuários ativos:', usersError);
      throw usersError;
    }

    console.log(`Encontrados ${activeUsers?.length || 0} usuários ativos esta semana`);

    const results = [];
    
    // Gerar insights para cada usuário
    for (const user of activeUsers || []) {
      try {
        console.log(`Gerando insights para usuário ${user.user_id}...`);
        
        // Chamar a função de geração de insights
        const { data: insightsResult, error: insightsError } = await supabase.functions.invoke('generate-weekly-chat-insights', {
          body: {
            userId: user.user_id,
            weekStartDate: weekStartStr
          }
        });

        if (insightsError) {
          console.error(`Erro ao gerar insights para ${user.user_id}:`, insightsError);
          results.push({
            user_id: user.user_id,
            success: false,
            error: insightsError.message
          });
        } else {
          console.log(`Insights gerados para ${user.user_id}`);
          results.push({
            user_id: user.user_id,
            success: true,
            insights: insightsResult
          });
        }
      } catch (error) {
        console.error(`Erro fatal para usuário ${user.user_id}:`, error);
        results.push({
          user_id: user.user_id,
          success: false,
          error: error.message
        });
      }
    }

    const successCount = results.filter(r => r.success).length;
    const errorCount = results.filter(r => !r.success).length;

    console.log(`Processamento concluído: ${successCount} sucessos, ${errorCount} erros`);

    return new Response(JSON.stringify({
      success: true,
      processed_users: activeUsers?.length || 0,
      successful_insights: successCount,
      failed_insights: errorCount,
      week_start: weekStartStr,
      results: results
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Erro no scheduler de insights:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Erro interno do servidor' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});