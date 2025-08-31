import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase REMOTO
const supabaseUrl = 'https://hlrkoyywjpckdotimtik.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhscmtveXl3anBja2RvdGltdGlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMxNTMwNDcsImV4cCI6MjA2ODcyOTA0N30.kYEtg1hYG2pmcyIeXRs-vgNIVOD76Yu7KPlyFN0vdUI';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function verificarEstruturaAiConfig() {
  console.log('🔍 VERIFICANDO ESTRUTURA DA TABELA AI_CONFIGURATIONS...');

  try {
    // 1. Verificar se a tabela existe
    console.log('\n1. Verificando se a tabela existe...');
    
    const { data: tableInfo, error: tableError } = await supabase
      .from('ai_configurations')
      .select('*')
      .limit(1);

    if (tableError) {
      console.log('❌ Erro ao acessar tabela:', tableError.message);
      console.log('💡 A tabela ai_configurations pode não existir');
    } else {
      console.log('✅ Tabela ai_configurations existe!');
      
      if (tableInfo.length > 0) {
        console.log('📊 Estrutura da tabela:');
        console.log('   Colunas:', Object.keys(tableInfo[0]));
        console.log('   Exemplo de registro:', tableInfo[0]);
      } else {
        console.log('📊 Tabela vazia, mas existe');
      }
    }

    // 2. Tentar inserir configuração básica
    console.log('\n2. Tentando inserir configuração básica...');
    
    const { data: insertData, error: insertError } = await supabase
      .from('ai_configurations')
      .insert({
        name: 'Sofia OpenAI Test',
        service: 'openai',
        model: 'gpt-4o-mini',
        is_active: true,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (insertError) {
      console.log('❌ Erro ao inserir:', insertError.message);
      console.log('💡 Estrutura da tabela não suporta api_key');
    } else {
      console.log('✅ Configuração inserida com sucesso!');
      console.log('📊 Dados inseridos:', insertData);
    }

    // 3. Verificar se as variáveis de ambiente estão configuradas
    console.log('\n3. Testando função com variáveis de ambiente...');
    
    // Criar uma imagem de teste
    const testImageData = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=';
    
    try {
      // Upload da imagem de teste
      const response = await fetch(testImageData);
      const blob = await response.blob();
      
      const fileName = `test/food-test-${Date.now()}.jpg`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('chat-images')
        .upload(fileName, blob);

      if (uploadError) {
        console.log('❌ Erro no upload:', uploadError.message);
      } else {
        console.log('✅ Upload bem-sucedido!');
        
        // Obter URL pública
        const { data: { publicUrl } } = supabase.storage
          .from('chat-images')
          .getPublicUrl(fileName);
        
        console.log('📸 URL da imagem:', publicUrl);

        // Testar função de análise
        console.log('\n4. Testando análise da SOFIA...');
        
        const { data: analysisData, error: analysisError } = await supabase.functions.invoke('sofia-image-analysis', {
          body: {
            imageUrl: publicUrl,
            userId: 'test-user-id',
            userContext: {
              currentMeal: 'lunch',
              foodItems: 0
            }
          }
        });

        if (analysisError) {
          console.log('❌ Erro na análise:', analysisError.message);
          
          if (analysisError.message.includes('GOOGLE_AI_API_KEY')) {
            console.log('\n⚠️ GOOGLE_AI_API_KEY não configurada no Supabase');
            console.log('💡 Configure no Supabase Dashboard:');
            console.log('   1. Acesse: https://supabase.com/dashboard/project/hlrkoyywjpckdotimtik/settings/api');
            console.log('   2. Vá para "Environment Variables"');
            console.log('   3. Adicione: GOOGLE_AI_API_KEY=AIzaSyCOdeLu7T_uhCcXlTzZgat5wbo8Y-0DbNc');
          }
          
          if (analysisError.message.includes('OPENAI_API_KEY')) {
            console.log('\n⚠️ OPENAI_API_KEY não configurada no Supabase');
            console.log('💡 Configure no Supabase Dashboard:');
            console.log('   1. Acesse: https://supabase.com/dashboard/project/hlrkoyywjpckdotimtik/settings/api');
            console.log('   2. Vá para "Environment Variables"');
            console.log('   3. Adicione: OPENAI_API_KEY=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');
          }
        } else {
          console.log('✅ Análise funcionando!');
          console.log('📊 Resposta:', analysisData);
          
          if (analysisData.success) {
            console.log('🎉 SUCESSO! A SOFIA ESTÁ ANALISANDO IMAGENS!');
          } else {
            console.log('⚠️ Imagem de teste não detectou alimentos (esperado)');
          }
        }
      }
    } catch (testError) {
      console.log('❌ Erro no teste:', testError.message);
    }

    // 4. Instruções finais
    console.log('\n📋 CONFIGURAÇÃO MANUAL NECESSÁRIA:');
    console.log('');
    console.log('🔑 CONFIGURE AS VARIÁVEIS DE AMBIENTE NO SUPABASE:');
    console.log('');
    console.log('1. Acesse: https://supabase.com/dashboard/project/hlrkoyywjpckdotimtik/settings/api');
    console.log('2. Vá para "Environment Variables"');
    console.log('3. Adicione as seguintes variáveis:');
    console.log('');
    console.log('   GOOGLE_AI_API_KEY=AIzaSyCOdeLu7T_uhCcXlTzZgat5wbo8Y-0DbNc');
    console.log('   OPENAI_API_KEY=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');
    console.log('');
    console.log('4. Clique em "Save"');
    console.log('5. Aguarde alguns minutos para propagar');
    console.log('');
    console.log('🧪 DEPOIS DE CONFIGURAR, TESTE:');
    console.log('   - Execute: node testar-analise-imagem-sofia.js');
    console.log('   - Acesse: http://localhost:8081/dashboard');
    console.log('   - Envie uma foto real de comida');

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

// Executar verificação
verificarEstruturaAiConfig(); 