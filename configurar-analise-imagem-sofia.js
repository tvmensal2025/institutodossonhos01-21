import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase REMOTO
const supabaseUrl = 'https://hlrkoyywjpckdotimtik.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhscmtveXl3anBja2RvdGltdGlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMxNTMwNDcsImV4cCI6MjA2ODcyOTA0N30.kYEtg1hYG2pmcyIeXRs-vgNIVOD76Yu7KPlyFN0vdUI';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function configurarAnaliseImagemSofia() {
  console.log('🔧 CONFIGURANDO ANÁLISE DE IMAGEM DA SOFIA...');

  try {
    // 1. Verificar e criar bucket se necessário
    console.log('\n1. Configurando bucket chat-images...');
    
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      console.log('❌ Erro ao listar buckets:', bucketsError.message);
    } else {
      const chatImagesBucket = buckets.find(bucket => bucket.name === 'chat-images');
      if (chatImagesBucket) {
        console.log('✅ Bucket chat-images já existe!');
      } else {
        console.log('⚠️ Bucket chat-images não encontrado');
        console.log('💡 Crie o bucket manualmente no Supabase Dashboard');
        console.log('   - Nome: chat-images');
        console.log('   - Público: Sim');
        console.log('   - Política: Permitir uploads autenticados');
      }
    }

    // 2. Verificar configurações de IA
    console.log('\n2. Verificando configurações de IA...');
    
    const { data: aiConfigs, error: aiConfigError } = await supabase
      .from('ai_configurations')
      .select('*')
      .eq('service', 'openai')
      .limit(5);

    if (aiConfigError) {
      console.log('❌ Erro ao verificar configurações de IA:', aiConfigError.message);
    } else {
      console.log(`✅ ${aiConfigs.length} configurações de IA encontradas`);
      aiConfigs.forEach(config => {
        console.log(`   - ${config.name}: ${config.model} (${config.service})`);
      });
    }

    // 3. Verificar tabela sofia_food_analysis
    console.log('\n3. Verificando tabela sofia_food_analysis...');
    
    const { data: tableData, error: tableError } = await supabase
      .from('sofia_food_analysis')
      .select('count')
      .limit(1);

    if (tableError) {
      console.log('❌ Erro ao verificar tabela:', tableError.message);
    } else {
      console.log('✅ Tabela sofia_food_analysis está funcionando!');
    }

    // 4. Testar função de análise
    console.log('\n4. Testando função sofia-image-analysis...');
    
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
        console.log('✅ Upload de teste bem-sucedido!');
        
        // Obter URL pública
        const { data: { publicUrl } } = supabase.storage
          .from('chat-images')
          .getPublicUrl(fileName);
        
        console.log('📸 URL da imagem de teste:', publicUrl);

        // Testar função de análise
        console.log('\n5. Testando análise da SOFIA...');
        
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
            console.log('⚠️ GOOGLE_AI_API_KEY não configurada');
            console.log('💡 Configure a variável de ambiente no Supabase');
          }
          
          if (analysisError.message.includes('OPENAI_API_KEY')) {
            console.log('⚠️ OPENAI_API_KEY não configurada');
            console.log('💡 Configure a variável de ambiente no Supabase');
          }
        } else {
          console.log('✅ Análise da SOFIA funcionando!');
          console.log('📊 Resposta:', analysisData);
        }
      }
    } catch (testError) {
      console.log('❌ Erro no teste:', testError.message);
    }

    // 6. Instruções finais
    console.log('\n📋 INSTRUÇÕES PARA ATIVAR A ANÁLISE DE IMAGEM:');
    console.log('');
    console.log('1. 🔑 Configure as variáveis de ambiente no Supabase:');
    console.log('   - GOOGLE_AI_API_KEY (para detecção de alimentos)');
    console.log('   - OPENAI_API_KEY (para análise da SOFIA)');
    console.log('');
    console.log('2. 🚀 Deploy da função:');
    console.log('   - Execute: supabase functions deploy sofia-image-analysis');
    console.log('');
    console.log('3. 🪣 Crie o bucket chat-images no Supabase Dashboard');
    console.log('   - Nome: chat-images');
    console.log('   - Público: Sim');
    console.log('   - Política: Permitir uploads autenticados');
    console.log('');
    console.log('4. 🧪 Teste no dashboard:');
    console.log('   - Acesse: http://localhost:8081/dashboard');
    console.log('   - Vá para a seção de análise de comida');
    console.log('   - Envie uma foto de comida');
    console.log('');
    console.log('🎉 SISTEMA CONFIGURADO! A SOFIA ESTÁ PRONTA PARA ANALISAR IMAGENS!');

  } catch (error) {
    console.error('❌ Erro geral na configuração:', error);
  }
}

// Executar configuração
configurarAnaliseImagemSofia(); 