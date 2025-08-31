const { createClient } = require('@supabase/supabase-js');

// Configurações do Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://hlrkoyywjpckdot.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseKey) {
  console.error('❌ VITE_SUPABASE_ANON_KEY não configurada');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testarRespostasHumanizadas() {
  console.log('🧪 Testando respostas humanizadas da Sofia...\n');

  const perguntas = [
    "Oi Sofia, estou com fome!",
    "Conte-me sobre o Instituto dos Sonhos",
    "Quem são os fundadores?",
    "Preciso de dicas para emagrecer"
  ];

  for (const pergunta of perguntas) {
    console.log(`📝 Pergunta: "${pergunta}"`);
    
    try {
      const response = await fetch(`${supabaseUrl}/functions/v1/gpt-chat`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          functionality: 'chat_daily',
          messages: [
            {
              role: 'user',
              content: pergunta
            }
          ]
        })
      });

      if (response.ok) {
        const data = await response.json();
        const resposta = data.response || data.message || 'Resposta recebida';
        
        console.log(`✅ Resposta (${resposta.length} caracteres):`);
        console.log(`"${resposta}"`);
        console.log(`📊 Tamanho: ${resposta.length} caracteres`);
        console.log('---\n');
      } else {
        console.error(`❌ Erro: ${response.status}`);
      }
    } catch (error) {
      console.error(`❌ Erro ao testar: ${error.message}`);
    }
    
    // Aguardar entre as perguntas
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}

async function verificarConfiguracoes() {
  console.log('🔍 Verificando configurações atuais...\n');
  
  try {
    const { data: configs, error } = await supabase
      .from('ai_configurations')
      .select('*')
      .in('functionality', ['chat_daily', 'medical_analysis']);

    if (error) {
      console.error('❌ Erro ao buscar configurações:', error);
      return;
    }

    configs.forEach(config => {
      console.log(`🎯 ${config.functionality}:`);
      console.log(`   • Serviço: ${config.service}`);
      console.log(`   • Modelo: ${config.model}`);
      console.log(`   • Tokens: ${config.max_tokens}`);
      console.log(`   • Temperature: ${config.temperature}`);
      console.log(`   • Personalidade: ${config.personality}`);
      console.log(`   • System Prompt: ${config.system_prompt ? '✅ Configurado' : '❌ Não configurado'}`);
      console.log('');
    });
  } catch (error) {
    console.error('❌ Erro:', error);
  }
}

// Executar testes
async function main() {
  await verificarConfiguracoes();
  await testarRespostasHumanizadas();
}

main().catch(console.error);


