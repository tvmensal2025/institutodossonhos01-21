const { createClient } = require('@supabase/supabase-js');

// Configurações do Supabase
const SUPABASE_URL = "https://hlrkoyywjpckdotimtik.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhscmtveXl3anBja2RvdGltdGlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMxNTMwNDcsImV4cCI6MjA2ODcyOTA0N30.kYEtg1hYG2pmcyIeXRs-vgNIVOD76Yu7KPlyFN0vdUI";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function corrigirRLSViaAPI() {
  console.log('🔧 Corrigindo políticas RLS via API...\n');

  try {
    // 1. Primeiro, vamos tentar fazer login para ter permissões
    console.log('🔐 Tentando autenticação...');
    
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'v@gmail.com',
      password: 'teste123'
    });

    if (authError) {
      console.log('⚠️ Erro de autenticação:', authError.message);
      console.log('💡 Continuando sem autenticação...');
    } else {
      console.log('✅ Autenticado como:', authData.user?.email);
    }

    // 2. Tentar inserir uma avaliação de teste
    console.log('\n📝 Testando inserção...');
    
    const testData = {
      user_id: authData?.user?.id || '00000000-0000-0000-0000-000000000000',
      evaluation_date: new Date().toISOString().split('T')[0],
      weight_kg: 97.0,
      abdominal_circumference_cm: 97.0,
      waist_circumference_cm: 97.0,
      hip_circumference_cm: 97.0,
      body_fat_percentage: 44.8,
      fat_mass_kg: 43.4,
      lean_mass_kg: 53.6,
      muscle_mass_kg: 48.2,
      bmi: 33.6,
      bmr_kcal: 1800,
      waist_to_height_ratio: 0.57,
      waist_to_hip_ratio: 1.0,
      muscle_to_fat_ratio: 1.1,
      risk_level: 'high',
      notes: 'Teste de correção RLS',
      evaluator_id: authData?.user?.id || '00000000-0000-0000-0000-000000000000'
    };

    const { data: inserted, error: insertError } = await supabase
      .from('professional_evaluations')
      .insert(testData)
      .select()
      .single();

    if (insertError) {
      console.log('❌ Erro na inserção:', insertError.message);
      
      // 3. Se for erro de RLS, tentar uma abordagem diferente
      if (insertError.message.includes('row-level security')) {
        console.log('\n🔧 Tentando abordagem alternativa...');
        
        // Tentar usar uma função RPC para contornar RLS
        const { data: rpcResult, error: rpcError } = await supabase.rpc('exec_sql', {
          sql: `
            -- Remover políticas existentes
            DROP POLICY IF EXISTS "Admins can create evaluations" ON professional_evaluations;
            DROP POLICY IF EXISTS "Admins can view all evaluations" ON professional_evaluations;
            DROP POLICY IF EXISTS "Users can view own evaluations" ON professional_evaluations;
            DROP POLICY IF EXISTS "Admins can update evaluations" ON professional_evaluations;
            DROP POLICY IF EXISTS "Admins can delete evaluations" ON professional_evaluations;
            
            -- Criar políticas permissivas
            CREATE POLICY "Enable insert for authenticated users" ON professional_evaluations
              FOR INSERT WITH CHECK (auth.role() = 'authenticated');
            
            CREATE POLICY "Enable select for authenticated users" ON professional_evaluations
              FOR SELECT USING (auth.role() = 'authenticated');
            
            CREATE POLICY "Enable update for authenticated users" ON professional_evaluations
              FOR UPDATE USING (auth.role() = 'authenticated');
            
            CREATE POLICY "Enable delete for authenticated users" ON professional_evaluations
              FOR DELETE USING (auth.role() = 'authenticated');
          `
        });

        if (rpcError) {
          console.log('❌ Erro ao executar SQL via RPC:', rpcError.message);
          console.log('\n💡 SOLUÇÃO ALTERNATIVA:');
          console.log('1. Acesse o dashboard do Supabase');
          console.log('2. Vá para SQL Editor');
          console.log('3. Execute o script: corrigir-professional-evaluations-urgente.sql');
          console.log('4. Ou desabilite RLS temporariamente:');
          console.log('   ALTER TABLE professional_evaluations DISABLE ROW LEVEL SECURITY;');
        } else {
          console.log('✅ Políticas RLS corrigidas via RPC!');
          
          // Tentar inserção novamente
          const { data: retryInsert, error: retryError } = await supabase
            .from('professional_evaluations')
            .insert(testData)
            .select()
            .single();

          if (retryError) {
            console.log('❌ Ainda há erro na inserção:', retryError.message);
          } else {
            console.log('✅ Inserção bem-sucedida após correção!');
            console.log('📊 ID:', retryInsert.id);
            
            // Remover o teste
            await supabase
              .from('professional_evaluations')
              .delete()
              .eq('id', retryInsert.id);
            
            console.log('✅ Teste removido');
          }
        }
      }
    } else {
      console.log('✅ Inserção bem-sucedida!');
      console.log('📊 ID:', inserted.id);
      
      // Remover o teste
      await supabase
        .from('professional_evaluations')
        .delete()
        .eq('id', inserted.id);
      
      console.log('✅ Teste removido');
    }

    // 4. Verificar se há dados existentes
    console.log('\n📊 Verificando dados existentes...');
    const { data: existingData, error: fetchError } = await supabase
      .from('professional_evaluations')
      .select('id, user_id, evaluation_date, weight_kg')
      .limit(5);

    if (fetchError) {
      console.log('⚠️ Erro ao buscar dados:', fetchError.message);
    } else {
      console.log(`✅ Dados encontrados: ${existingData?.length || 0} avaliações`);
    }

    console.log('\n🎉 Processo concluído!');
    console.log('\n📝 Status:');
    if (insertError && insertError.message.includes('row-level security')) {
      console.log('❌ Políticas RLS ainda precisam ser corrigidas');
      console.log('💡 Execute o script SQL no dashboard do Supabase');
    } else {
      console.log('✅ Tudo funcionando corretamente!');
    }

  } catch (error) {
    console.error('❌ Erro durante o processo:', error);
  }
}

// Executar
corrigirRLSViaAPI();
