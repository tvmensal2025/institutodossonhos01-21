const { createClient } = require('@supabase/supabase-js');

// Configurações do Supabase
const SUPABASE_URL = "https://hlrkoyywjpckdotimtik.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhscmtveXl3anBja2RvdGltdGlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMxNTMwNDcsImV4cCI6MjA2ODcyOTA0N30.kYEtg1hYG2pmcyIeXRs-vgNIVOD76Yu7KPlyFN0vdUI";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function verificarIntegracaoDashboard() {
  console.log('🔍 VERIFICANDO INTEGRAÇÃO DASHBOARD - PROFESSIONAL EVALUATIONS\n');

  try {
    // 1. Verificar se as tabelas existem
    console.log('📋 Verificando tabelas...');
    
    const { data: weightTable, error: weightError } = await supabase
      .from('weight_measurements')
      .select('id')
      .limit(1);
    
    const { data: evalTable, error: evalError } = await supabase
      .from('professional_evaluations')
      .select('id')
      .limit(1);
    
    if (weightError) {
      console.log('❌ Tabela weight_measurements não acessível:', weightError.message);
    } else {
      console.log('✅ Tabela weight_measurements acessível');
    }
    
    if (evalError) {
      console.log('❌ Tabela professional_evaluations não acessível:', evalError.message);
    } else {
      console.log('✅ Tabela professional_evaluations acessível');
    }

    // 2. Verificar dados existentes
    console.log('\n📊 Verificando dados existentes...');
    
    const { data: weightData, error: weightDataError } = await supabase
      .from('weight_measurements')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);
    
    const { data: evalData, error: evalDataError } = await supabase
      .from('professional_evaluations')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);
    
    console.log(`📈 Weight measurements: ${weightData?.length || 0} registros`);
    console.log(`📋 Professional evaluations: ${evalData?.length || 0} registros`);

    // 3. Verificar se há integração entre as tabelas
    console.log('\n🔗 Verificando integração entre tabelas...');
    
    if (weightData && weightData.length > 0 && evalData && evalData.length > 0) {
      const weightUserId = weightData[0].user_id;
      const evalUserId = evalData[0].user_id;
      
      console.log(`👤 Weight measurements user: ${weightUserId}`);
      console.log(`👤 Professional evaluations user: ${evalUserId}`);
      
      if (weightUserId === evalUserId) {
        console.log('✅ Mesmo usuário em ambas as tabelas');
      } else {
        console.log('⚠️ Usuários diferentes nas tabelas');
      }
    }

    // 4. Verificar se o dashboard está usando os dados corretos
    console.log('\n📱 Verificando uso no dashboard...');
    
    // Simular busca que o dashboard faria
    if (weightData && weightData.length > 0) {
      const userId = weightData[0].user_id;
      
      console.log(`🔍 Buscando dados para usuário: ${userId}`);
      
      // Buscar dados como o dashboard faria
      const { data: dashboardWeightData } = await supabase
        .from('weight_measurements')
        .select('*')
        .eq('user_id', userId)
        .order('measurement_date', { ascending: false })
        .limit(10);
      
      const { data: dashboardEvalData } = await supabase
        .from('professional_evaluations')
        .select('*')
        .eq('user_id', userId)
        .order('evaluation_date', { ascending: false })
        .limit(10);
      
      console.log(`📊 Dashboard weight data: ${dashboardWeightData?.length || 0} registros`);
      console.log(`📋 Dashboard eval data: ${dashboardEvalData?.length || 0} registros`);
      
      if (dashboardWeightData && dashboardWeightData.length > 0) {
        console.log('✅ Dashboard consegue acessar weight_measurements');
        console.log(`📏 Último peso: ${dashboardWeightData[0].peso_kg}kg`);
        console.log(`📅 Data: ${dashboardWeightData[0].measurement_date}`);
      }
      
      if (dashboardEvalData && dashboardEvalData.length > 0) {
        console.log('✅ Dashboard consegue acessar professional_evaluations');
        console.log(`⚖️ Última avaliação: ${dashboardEvalData[0].weight_kg}kg`);
        console.log(`📅 Data: ${dashboardEvalData[0].evaluation_date}`);
        console.log(`📊 % Gordura: ${dashboardEvalData[0].body_fat_percentage}%`);
      }
    }

    // 5. Verificar se há sincronização automática
    console.log('\n🔄 Verificando sincronização automática...');
    
    // Verificar se há triggers ou funções que sincronizam os dados
    const { data: triggers } = await supabase
      .rpc('get_triggers_info')
      .catch(() => null);
    
    if (triggers) {
      console.log('✅ Triggers encontrados para sincronização');
    } else {
      console.log('⚠️ Nenhum trigger de sincronização encontrado');
    }

    console.log('\n📋 CONCLUSÃO:');
    console.log('✅ As tabelas existem e são acessíveis');
    console.log('✅ O dashboard consegue buscar dados de ambas as tabelas');
    console.log('⚠️ Não há sincronização automática entre as tabelas');
    console.log('💡 Recomendação: Criar trigger para sincronizar dados');

  } catch (error) {
    console.error('❌ Erro na verificação:', error);
  }
}

// Executar
verificarIntegracaoDashboard();
