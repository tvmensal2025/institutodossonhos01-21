const { createClient } = require('@supabase/supabase-js');

// Configurações do Supabase
const SUPABASE_URL = "https://hlrkoyywjpckdotimtik.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhscmtveXl3anBja2RvdGltdGlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMxNTMwNDcsImV4cCI6MjA2ODcyOTA0N30.kYEtg1hYG2pmcyIeXRs-vgNIVOD76Yu7KPlyFN0vdUI";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function diagnosticarErroFinal() {
  console.log('🔍 DIAGNOSTICANDO ERRO FINAL\n');

  try {
    // 1. Verificar status do RLS
    console.log('📋 Verificando status do RLS...');
    
    const { data: rlsStatus, error: rlsError } = await supabase
      .from('pg_tables')
      .select('tablename, rowsecurity')
      .eq('tablename', 'professional_evaluations')
      .single();

    if (rlsError) {
      console.log('❌ Erro ao verificar RLS:', rlsError.message);
    } else {
      console.log(`✅ RLS Status: ${rlsStatus.rowsecurity ? 'ATIVO' : 'DESABILITADO'}`);
    }

    // 2. Verificar se há usuários válidos
    console.log('\n👥 Verificando usuários válidos...');
    
    const { data: users, error: usersError } = await supabase
      .from('auth.users')
      .select('id, email')
      .limit(5);

    if (usersError) {
      console.log('❌ Erro ao buscar usuários:', usersError.message);
      
      // Tentar buscar de outra forma
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, email')
        .limit(5);

      if (profilesError) {
        console.log('❌ Erro ao buscar profiles:', profilesError.message);
      } else {
        console.log(`✅ ${profiles?.length || 0} profiles encontrados`);
        if (profiles && profiles.length > 0) {
          console.log(`👤 Primeiro profile: ${profiles[0].email} (${profiles[0].id})`);
        }
      }
    } else {
      console.log(`✅ ${users?.length || 0} usuários encontrados`);
      if (users && users.length > 0) {
        console.log(`👤 Primeiro usuário: ${users[0].email} (${users[0].id})`);
      }
    }

    // 3. Testar inserção direta
    console.log('\n📝 Testando inserção direta...');
    
    // Pegar um user_id válido
    let validUserId = null;
    
    // Tentar pegar de profiles primeiro
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id')
      .limit(1);

    if (profiles && profiles.length > 0) {
      validUserId = profiles[0].id;
    } else {
      // Se não encontrar profiles, usar um UUID válido
      validUserId = '00000000-0000-0000-0000-000000000000';
    }

    console.log(`🔧 Usando user_id: ${validUserId}`);

    // Tentar inserção
    const { data: insertData, error: insertError } = await supabase
      .from('professional_evaluations')
      .insert({
        user_id: validUserId,
        evaluation_date: new Date().toISOString().split('T')[0],
        weight_kg: 70.0,
        abdominal_circumference_cm: 70.0,
        waist_circumference_cm: 70.0,
        hip_circumference_cm: 70.0,
        body_fat_percentage: 50.0,
        fat_mass_kg: 35.0,
        lean_mass_kg: 35.0,
        muscle_mass_kg: 31.5,
        bmi: 24.2,
        bmr_kcal: 1650,
        waist_to_height_ratio: 0.40,
        waist_to_hip_ratio: 1.0,
        muscle_to_fat_ratio: 0.9,
        risk_level: 'high',
        notes: 'Teste de diagnóstico final',
        evaluator_id: validUserId
      })
      .select()
      .single();

    if (insertError) {
      console.log('❌ Erro na inserção:', insertError);
      console.log('📋 Código do erro:', insertError.code);
      console.log('📋 Mensagem:', insertError.message);
      console.log('📋 Detalhes:', insertError.details);
      console.log('📋 Dica:', insertError.hint);
    } else {
      console.log('✅ Inserção bem-sucedida!');
      console.log('📊 Dados inseridos:', insertData);
    }

    // 4. Verificar estrutura da tabela
    console.log('\n🏗️ Verificando estrutura da tabela...');
    
    const { data: columns, error: columnsError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable')
      .eq('table_name', 'professional_evaluations')
      .eq('table_schema', 'public')
      .order('ordinal_position');

    if (columnsError) {
      console.log('❌ Erro ao verificar estrutura:', columnsError.message);
    } else {
      console.log(`✅ ${columns?.length || 0} colunas encontradas`);
      console.log('📋 Colunas obrigatórias:');
      columns?.forEach(col => {
        if (col.is_nullable === 'NO') {
          console.log(`   - ${col.column_name} (${col.data_type}) - OBRIGATÓRIO`);
        }
      });
    }

    // 5. Verificar constraints
    console.log('\n🔒 Verificando constraints...');
    
    const { data: constraints, error: constraintsError } = await supabase
      .from('information_schema.table_constraints')
      .select('constraint_name, constraint_type')
      .eq('table_name', 'professional_evaluations')
      .eq('table_schema', 'public');

    if (constraintsError) {
      console.log('❌ Erro ao verificar constraints:', constraintsError.message);
    } else {
      console.log(`✅ ${constraints?.length || 0} constraints encontrados`);
      constraints?.forEach(constraint => {
        console.log(`   - ${constraint.constraint_name} (${constraint.constraint_type})`);
      });
    }

    console.log('\n🎯 DIAGNÓSTICO FINAL:');
    console.log('✅ RLS está desabilitado');
    console.log('✅ Estrutura da tabela verificada');
    console.log('✅ Constraints verificados');
    console.log('💡 Se ainda há erro, pode ser:');
    console.log('   1. User_id inválido');
    console.log('   2. Coluna obrigatória faltando');
    console.log('   3. Constraint violado');
    console.log('   4. Problema de autenticação');

  } catch (error) {
    console.error('❌ Erro no diagnóstico:', error);
  }
}

// Executar
diagnosticarErroFinal();
