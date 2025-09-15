import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🔄 Iniciando análise automática quinzenal...');

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Buscar usuários ativos que precisam de análise
    const fifteenDaysAgo = new Date();
    fifteenDaysAgo.setDate(fifteenDaysAgo.getDate() - 15);

    const { data: usersForAnalysis, error: usersError } = await supabase
      .from('profiles')
      .select('user_id, full_name, email')
      .or(`last_analysis_date.is.null,last_analysis_date.lt.${fifteenDaysAgo.toISOString()}`)
      .limit(50); // Processar até 50 usuários por vez

    if (usersError) {
      console.error('❌ Erro ao buscar usuários:', usersError);
      throw usersError;
    }

    if (!usersForAnalysis || usersForAnalysis.length === 0) {
      console.log('ℹ️ Nenhum usuário precisa de análise no momento');
      return new Response(JSON.stringify({
        success: true,
        message: 'Nenhum usuário precisa de análise',
        processed: 0
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log(`📊 Processando análise para ${usersForAnalysis.length} usuários...`);

    const results = [];
    let successCount = 0;
    let errorCount = 0;

    // Processar usuários em lotes pequenos para evitar sobrecarga
    for (const user of usersForAnalysis) {
      try {
        console.log(`🔍 Analisando usuário: ${user.full_name || user.email}`);

        // Chamar função de análise Sofia
        const { data: analysisData, error: analysisError } = await supabase.functions.invoke('sofia-tracking-analysis', {
          body: {
            userId: user.user_id,
            analysis_type: 'scheduled_quinzenal'
          }
        });

        if (analysisError) {
          console.error(`❌ Erro na análise do usuário ${user.user_id}:`, analysisError);
          errorCount++;
          results.push({
            userId: user.user_id,
            status: 'error',
            error: analysisError.message
          });
        } else {
          console.log(`✅ Análise concluída para usuário: ${user.full_name || user.email}`);
          successCount++;
          
          // Atualizar data da última análise
          await supabase
            .from('profiles')
            .update({ 
              last_analysis_date: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .eq('user_id', user.user_id);

          results.push({
            userId: user.user_id,
            status: 'success',
            analysis: analysisData
          });
        }

        // Pequena pausa entre análises para não sobrecarregar
        await new Promise(resolve => setTimeout(resolve, 2000)); // 2 segundos

      } catch (error) {
        console.error(`💥 Erro crítico no usuário ${user.user_id}:`, error);
        errorCount++;
        results.push({
          userId: user.user_id,
          status: 'critical_error',
          error: error.message
        });
      }
    }

    // Log do resultado final
    console.log(`📈 Análise quinzenal concluída:
    - ✅ Sucessos: ${successCount}
    - ❌ Erros: ${errorCount}
    - 📊 Total processado: ${usersForAnalysis.length}`);

    // Salvar log da execução
    await supabase
      .from('scheduled_analysis_logs')
      .insert({
        execution_date: new Date().toISOString(),
        users_processed: usersForAnalysis.length,
        success_count: successCount,
        error_count: errorCount,
        results: results
      });

    return new Response(JSON.stringify({
      success: true,
      message: 'Análise quinzenal executada com sucesso',
      summary: {
        users_processed: usersForAnalysis.length,
        success_count: successCount,
        error_count: errorCount
      },
      results: results
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('💥 Erro crítico na análise quinzenal:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
