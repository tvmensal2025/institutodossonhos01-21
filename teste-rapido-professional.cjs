const { createClient } = require('@supabase/supabase-js');

// Configurações do Supabase
const SUPABASE_URL = "https://hlrkoyywjpckdotimtik.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhscmtveXl3anBja2RvdGltdGlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMxNTMwNDcsImV4cCI6MjA2ODcyOTA0N30.kYEtg1hYG2pmcyIeXRs-vgNIVOD76Yu7KPlyFN0vdUI";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testeRapido() {
  console.log('🚀 Teste Rápido - Professional Evaluations\n');

  try {
    // 1. Testar acesso à tabela
    console.log('📋 Testando acesso à tabela...');
    const { data: tableCheck, error: tableError } = await supabase
      .from('professional_evaluations')
      .select('id')
      .limit(1);

    if (tableError) {
      console.log('❌ Erro de acesso:', tableError.message);
      console.log('💡 Execute o script SQL: corrigir-professional-evaluations-urgente.sql');
      return;
    }
    console.log('✅ Tabela acessível');

    // 2. Tentar inserção
    console.log('\n📝 Testando inserção...');
    const testData = {
      user_id: '00000000-0000-0000-0000-000000000000',
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
      notes: 'Teste rápido',
      evaluator_id: '00000000-0000-0000-0000-000000000000'
    };

    const { data: inserted, error: insertError } = await supabase
      .from('professional_evaluations')
      .insert(testData)
      .select()
      .single();

    if (insertError) {
      console.log('❌ Erro na inserção:', insertError.message);
      console.log('💡 Execute o script SQL: corrigir-professional-evaluations-urgente.sql');
      return;
    }

    console.log('✅ Inserção bem-sucedida!');
    console.log('📊 ID:', inserted.id);
    console.log('📅 Data:', inserted.evaluation_date);
    console.log('⚖️ Peso:', inserted.weight_kg, 'kg');
    console.log('📊 % Gordura:', inserted.body_fat_percentage, '%');

    // 3. Buscar dados
    console.log('\n🔍 Testando busca...');
    const { data: evaluations, error: fetchError } = await supabase
      .from('professional_evaluations')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);

    if (fetchError) {
      console.log('❌ Erro na busca:', fetchError.message);
    } else {
      console.log(`✅ Busca bem-sucedida! ${evaluations?.length || 0} avaliações encontradas`);
    }

    // 4. Remover teste
    console.log('\n🗑️ Removendo teste...');
    const { error: deleteError } = await supabase
      .from('professional_evaluations')
      .delete()
      .eq('id', inserted.id);

    if (deleteError) {
      console.log('⚠️ Erro ao remover:', deleteError.message);
    } else {
      console.log('✅ Teste removido');
    }

    console.log('\n🎉 TESTE CONCLUÍDO COM SUCESSO!');
    console.log('✅ Tabela funcionando');
    console.log('✅ Inserção funcionando');
    console.log('✅ Busca funcionando');
    console.log('✅ Exclusão funcionando');
    console.log('\n🚀 Agora você pode usar a página de avaliação profissional!');

  } catch (error) {
    console.error('❌ Erro no teste:', error);
  }
}

// Executar
testeRapido();
