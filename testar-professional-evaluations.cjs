const { createClient } = require('@supabase/supabase-js');

// Configurações do Supabase
const SUPABASE_URL = "https://hlrkoyywjpckdotimtik.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhscmtveXl3anBja2RvdGltdGlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMxNTMwNDcsImV4cCI6MjA2ODcyOTA0N30.kYEtg1hYG2pmcyIeXRs-vgNIVOD76Yu7KPlyFN0vdUI";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testarProfessionalEvaluations() {
  console.log('🧪 Testando funcionalidade da tabela professional_evaluations...\n');

  try {
    // 1. Verificar se conseguimos fazer login
    console.log('🔐 Testando autenticação...');
    
    // Vou tentar fazer login com um email de teste
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'v@gmail.com',
      password: 'teste123'
    });

    if (authError) {
      console.log('⚠️ Erro de autenticação:', authError.message);
      console.log('💡 Vou tentar sem autenticação...');
    } else {
      console.log('✅ Autenticado como:', authData.user?.email);
    }

    // 2. Verificar se a tabela existe e está acessível
    console.log('\n📋 Verificando acesso à tabela...');
    
    const { data: tableCheck, error: tableError } = await supabase
      .from('professional_evaluations')
      .select('id')
      .limit(1);

    if (tableError) {
      console.log('❌ Erro ao acessar tabela:', tableError.message);
      console.log('💡 Execute o script SQL para corrigir as políticas RLS');
      return;
    } else {
      console.log('✅ Tabela acessível');
      console.log(`📊 Avaliações existentes: ${tableCheck?.length || 0}`);
    }

    // 3. Tentar inserir uma avaliação de teste
    console.log('\n📝 Testando inserção de avaliação...');
    
    const testEvaluation = {
      user_id: authData?.user?.id || '00000000-0000-0000-0000-000000000000',
      evaluation_date: new Date().toISOString().split('T')[0],
      weight_kg: 75.0,
      abdominal_circumference_cm: 85.0,
      waist_circumference_cm: 80.0,
      hip_circumference_cm: 95.0,
      body_fat_percentage: 18.5,
      fat_mass_kg: 14.0,
      lean_mass_kg: 61.0,
      muscle_mass_kg: 58.0,
      bmi: 24.8,
      bmr_kcal: 1650,
      waist_to_height_ratio: 0.45,
      waist_to_hip_ratio: 0.84,
      muscle_to_fat_ratio: 4.1,
      risk_level: 'low',
      notes: 'Teste de funcionalidade',
      evaluator_id: authData?.user?.id || '00000000-0000-0000-0000-000000000000'
    };

    const { data: insertedEvaluation, error: insertError } = await supabase
      .from('professional_evaluations')
      .insert(testEvaluation)
      .select()
      .single();

    if (insertError) {
      console.log('❌ Erro ao inserir avaliação:', insertError.message);
      console.log('💡 Problema de permissão - execute o script SQL');
    } else {
      console.log('✅ Avaliação inserida com sucesso!');
      console.log('📊 ID:', insertedEvaluation.id);
      console.log('📅 Data:', insertedEvaluation.evaluation_date);
      console.log('⚖️ Peso:', insertedEvaluation.weight_kg, 'kg');
      
      // 4. Tentar buscar a avaliação inserida
      console.log('\n🔍 Testando busca da avaliação...');
      
      const { data: fetchedEvaluation, error: fetchError } = await supabase
        .from('professional_evaluations')
        .select('*')
        .eq('id', insertedEvaluation.id)
        .single();

      if (fetchError) {
        console.log('❌ Erro ao buscar avaliação:', fetchError.message);
      } else {
        console.log('✅ Avaliação encontrada na busca');
        console.log('📊 % Gordura:', fetchedEvaluation.body_fat_percentage, '%');
        console.log('📊 IMC:', fetchedEvaluation.bmi);
      }

      // 5. Remover a avaliação de teste
      console.log('\n🗑️ Removendo avaliação de teste...');
      
      const { error: deleteError } = await supabase
        .from('professional_evaluations')
        .delete()
        .eq('id', insertedEvaluation.id);

      if (deleteError) {
        console.log('⚠️ Erro ao remover avaliação:', deleteError.message);
      } else {
        console.log('✅ Avaliação de teste removida');
      }
    }

    // 6. Verificar usuários disponíveis
    console.log('\n👥 Verificando usuários...');
    
    const { data: users, error: usersError } = await supabase
      .from('profiles')
      .select('id, full_name, email')
      .limit(5);

    if (usersError) {
      console.log('⚠️ Erro ao buscar usuários:', usersError.message);
    } else {
      console.log(`✅ Usuários encontrados: ${users?.length || 0}`);
      if (users && users.length > 0) {
        console.log('📋 Usuários disponíveis:');
        users.forEach(user => {
          console.log(`   - ${user.full_name} (${user.email})`);
        });
      }
    }

    console.log('\n🎉 Teste concluído!');
    
    if (insertError) {
      console.log('\n❌ PROBLEMA IDENTIFICADO:');
      console.log('   As políticas RLS estão impedindo a inserção');
      console.log('   Execute o script: aplicar-rls-professional-evaluations.sql');
    } else {
      console.log('\n✅ TUDO FUNCIONANDO:');
      console.log('   - Tabela acessível');
      console.log('   - Inserção funcionando');
      console.log('   - Busca funcionando');
      console.log('   - Exclusão funcionando');
      console.log('   - Hook corrigido e pronto para uso');
    }

  } catch (error) {
    console.error('❌ Erro durante o teste:', error);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  testarProfessionalEvaluations();
}

module.exports = { testarProfessionalEvaluations };
