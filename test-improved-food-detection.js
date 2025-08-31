// 🧪 TESTE MELHORADO - Detecção de Alimentos Brasileiros
// Foco: Pizza, Tortas, Salgados e Lanches

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hlrkoyywjpckdotimtik.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhscmtveXl3anBja2RvdGltdGlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMxNTMwNDcsImV4cCI6MjA2ODcyOTA0N30.kYEtg1hYG2pmcyIeXRs-vgNIVOD76Yu7KPlyFN0vdUI';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testarDeteccaoMelhorada() {
  console.log('🚀 TESTANDO SISTEMA MELHORADO DE DETECÇÃO DE ALIMENTOS\n');
  console.log('🎯 Foco: Pizza, Tortas, Salgados e Lanches Brasileiros\n');

  // Imagens de teste específicas para os alimentos solicitados
  const imagensTeste = [
    {
      url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=600',
      descricao: '🍕 Pizza (teste principal)',
      esperado: ['pizza', 'queijo', 'molho de tomate']
    },
    {
      url: 'https://images.unsplash.com/photo-1571997478779-2adcbbe9ab2f?w=600',
      descricao: '🍔 Hambúrguer com batata frita',
      esperado: ['hambúrguer', 'batata frita', 'pão']
    },
    {
      url: 'https://images.unsplash.com/photo-1563379091339-03246963d7d3?w=600',
      descricao: '🥧 Torta/Pie',
      esperado: ['torta', 'massa', 'recheio']
    },
    {
      url: 'https://images.unsplash.com/photo-1562967916-eb82221dfb92?w=600',
      descricao: '🌭 Hot Dog / Sanduíche',
      esperado: ['cachorro-quente', 'pão', 'linguiça']
    },
    {
      url: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=600',
      descricao: '🥪 Mix de salgados',
      esperado: ['salgados', 'fritos', 'assados']
    }
  ];

  let totalTestes = 0;
  let sucessos = 0;
  let deteccoesPrecisas = 0;

  for (const teste of imagensTeste) {
    console.log(`\n${'='.repeat(80)}`);
    console.log(`📸 TESTANDO: ${teste.descricao}`);
    console.log(`🔗 URL: ${teste.url}`);
    console.log(`🎯 Esperado: ${teste.esperado.join(', ')}`);
    console.log(`${'='.repeat(80)}`);

    try {
      const inicioTempo = Date.now();
      
      const { data, error } = await supabase.functions.invoke('sofia-image-analysis', {
        body: {
          imageUrl: teste.url,
          userId: '00000000-0000-0000-0000-000000000000',
          userContext: {
            currentMeal: 'lunch',
            message: `Testando: ${teste.descricao}`
          }
        }
      });

      const tempoProcessamento = Date.now() - inicioTempo;
      totalTestes++;

      if (error) {
        console.error('❌ ERRO:', error.message);
        continue;
      }

      if (data.success && data.food_detection) {
        sucessos++;
        
        console.log('\n✅ ANÁLISE REALIZADA COM SUCESSO!');
        console.log(`⏱️ Tempo de processamento: ${tempoProcessamento}ms`);
        
        // Exibir detecção de alimentos
        const alimentosDetectados = data.food_detection.foods_detected || [];
        const liquidosDetectados = data.food_detection.liquids_detected || [];
        
        console.log('\n🍽️ ALIMENTOS DETECTADOS:');
        alimentosDetectados.forEach((alimento, i) => {
          console.log(`  ${i + 1}. ${alimento}`);
        });
        
        if (liquidosDetectados.length > 0) {
          console.log('\n🥤 LÍQUIDOS DETECTADOS:');
          liquidosDetectados.forEach((liquido, i) => {
            console.log(`  ${i + 1}. ${liquido}`);
          });
        }
        
        console.log(`\n📊 MÉTRICAS:`);
        console.log(`  • Calorias estimadas: ${data.food_detection.estimated_calories} kcal`);
        console.log(`  • Tipo de refeição: ${traduzirTipoRefeicao(data.food_detection.meal_type)}`);
        console.log(`  • Confiança: ${(data.food_detection.confidence * 100).toFixed(1)}%`);
        
        // Verificar se detectou itens esperados
        const todosDetectados = [...alimentosDetectados, ...liquidosDetectados];
        const detectouEsperado = teste.esperado.some(esperado => 
          todosDetectados.some(detectado => 
            detectado.toLowerCase().includes(esperado.toLowerCase()) ||
            esperado.toLowerCase().includes(detectado.toLowerCase())
          )
        );
        
        if (detectouEsperado) {
          deteccoesPrecisas++;
          console.log('\n🎯 DETECÇÃO PRECISA: ✅ Detectou alimentos esperados!');
        } else {
          console.log('\n⚠️ DETECÇÃO PARCIAL: Não detectou todos os alimentos esperados');
        }
        
        // Exibir contexto YOLO se disponível
        if (data.yolo_context) {
          console.log('\n🦾 CONTEXTO YOLO:');
          console.log(`  • Objetos detectados: ${data.yolo_context.totalObjects}`);
          console.log(`  • Qualidade da detecção: ${data.yolo_context.detectionQuality}`);
          console.log(`  • Confiança máxima: ${(data.yolo_context.maxConfidence * 100).toFixed(1)}%`);
        }
        
        // Exibir análise da Sofia
        if (data.sofia_analysis) {
          console.log('\n💬 ANÁLISE DA SOFIA:');
          console.log(`"${data.sofia_analysis.analysis?.substring(0, 200)}..."`);
        }
        
      } else {
        console.log('\n❌ FALHA: Não detectou alimentos na imagem');
        if (data.message) {
          console.log(`📝 Mensagem: ${data.message}`);
        }
      }
      
    } catch (error) {
      console.error('❌ Erro no teste:', error.message);
    }
    
    // Pausa entre testes
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  // Relatório final
  console.log(`\n${'='.repeat(80)}`);
  console.log('📊 RELATÓRIO FINAL DOS TESTES');
  console.log(`${'='.repeat(80)}`);
  console.log(`🧪 Total de testes: ${totalTestes}`);
  console.log(`✅ Sucessos: ${sucessos}`);
  console.log(`🎯 Detecções precisas: ${deteccoesPrecisas}`);
  console.log(`📈 Taxa de sucesso: ${totalTestes > 0 ? ((sucessos / totalTestes) * 100).toFixed(1) : 0}%`);
  console.log(`🔍 Taxa de precisão: ${sucessos > 0 ? ((deteccoesPrecisas / sucessos) * 100).toFixed(1) : 0}%`);
  
  if (deteccoesPrecisas === totalTestes) {
    console.log('\n🎉 EXCELENTE! Todas as detecções foram precisas!');
    console.log('🍕 Sistema otimizado para pizza, tortas e salgados funcionando perfeitamente!');
  } else if (deteccoesPrecisas >= totalTestes * 0.8) {
    console.log('\n👍 BOM RESULTADO! Maioria das detecções foram precisas.');
    console.log('🔧 Pequenos ajustes podem melhorar ainda mais a precisão.');
  } else {
    console.log('\n⚠️ RESULTADO PARCIAL. Sistema funcionando mas pode ser melhorado.');
    console.log('🔧 Verifique configurações do YOLO e prompts do Gemini.');
  }
  
  console.log('\n🚀 MELHORIAS IMPLEMENTADAS:');
  console.log('  ✅ Mapeamento YOLO expandido para alimentos brasileiros');
  console.log('  ✅ Prompts especializados para pizza, tortas e salgados');
  console.log('  ✅ Porções brasileiras realistas');
  console.log('  ✅ Detecção de tipos específicos (margherita, calabresa, etc.)');
  console.log('  ✅ Configurações YOLO otimizadas para alimentos');
  console.log('  ✅ Sistema de qualidade adaptativa');
  
  console.log('\n📋 PRÓXIMOS PASSOS:');
  console.log('  1. Teste no dashboard com imagens reais');
  console.log('  2. Ajuste thresholds se necessário');
  console.log('  3. Colete feedback dos usuários');
  console.log('  4. Continue refinando com base no uso real');
}

function traduzirTipoRefeicao(tipo) {
  const traducoes = {
    'breakfast': 'Café da manhã',
    'lunch': 'Almoço',
    'dinner': 'Jantar',
    'snack': 'Lanche',
    'dessert': 'Sobremesa'
  };
  return traducoes[tipo] || tipo;
}

// Executar testes
console.log('🔧 Iniciando testes do sistema melhorado...\n');
testarDeteccaoMelhorada().catch(console.error);