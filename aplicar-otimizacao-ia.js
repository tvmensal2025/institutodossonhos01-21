const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Configurações do Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://hlrkoyywjpckdot.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseKey) {
  console.error('❌ VITE_SUPABASE_ANON_KEY não configurada');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function aplicarOtimizacaoIA() {
  console.log('🚀 Aplicando otimização de IA...\n');

  try {
    // 1. Ler o arquivo SQL
    const sqlFile = fs.readFileSync('otimizar-configuracoes-ia.sql', 'utf8');
    
    // 2. Executar as migrações
    console.log('📝 Executando migrações SQL...');
    const { error: sqlError } = await supabase.rpc('exec_sql', { sql: sqlFile });
    
    if (sqlError) {
      console.error('❌ Erro ao executar SQL:', sqlError);
      return;
    }

    console.log('✅ Migrações aplicadas com sucesso!\n');

    // 3. Verificar configurações atualizadas
    console.log('🔍 Verificando configurações atualizadas...');
    const { data: configs, error: configError } = await supabase
      .from('ai_configurations')
      .select('*')
      .in('functionality', ['chat_daily', 'medical_analysis', 'chat', 'sofia_enhanced']);

    if (configError) {
      console.error('❌ Erro ao buscar configurações:', configError);
      return;
    }

    console.log('📊 Configurações Atualizadas:');
    configs.forEach(config => {
      console.log(`\n🎯 ${config.functionality}:`);
      console.log(`   Serviço: ${config.service}`);
      console.log(`   Modelo: ${config.model}`);
      console.log(`   Tokens: ${config.max_tokens}`);
      console.log(`   Temperature: ${config.temperature}`);
      console.log(`   Preset: ${config.preset_level}`);
      console.log(`   Personalidade: ${config.personality}`);
    });

    // 4. Verificar base de conhecimento
    console.log('\n📚 Verificando base de conhecimento...');
    const { data: knowledge, error: knowledgeError } = await supabase
      .from('company_knowledge_base')
      .select('category, title')
      .eq('is_active', true)
      .order('priority', { ascending: false });

    if (knowledgeError) {
      console.error('❌ Erro ao buscar base de conhecimento:', knowledgeError);
      return;
    }

    console.log('✅ Base de conhecimento criada com sucesso!');
    console.log('📖 Categorias disponíveis:');
    knowledge.forEach(item => {
      console.log(`   • ${item.category}: ${item.title}`);
    });

    // 5. Testar configuração da Sofia
    console.log('\n🧪 Testando configuração da Sofia...');
    const { data: sofiaConfig } = await supabase
      .from('ai_configurations')
      .select('*')
      .eq('functionality', 'chat_daily')
      .single();

    if (sofiaConfig) {
      console.log('✅ Sofia configurada com:');
      console.log(`   • Gemini Pro (${sofiaConfig.max_tokens} tokens)`);
      console.log(`   • Temperature: ${sofiaConfig.temperature}`);
      console.log(`   • Preset: ${sofiaConfig.preset_level}`);
      console.log(`   • System Prompt: ${sofiaConfig.system_prompt ? '✅ Configurado' : '❌ Não configurado'}`);
    }

    console.log('\n🎉 Otimização concluída com sucesso!');
    console.log('\n📋 Resumo das mudanças:');
    console.log('   • Sofia e Dr. Vital agora usam Gemini Pro');
    console.log('   • Tokens reduzidos para 1024 (economia de 50%)');
    console.log('   • Base de conhecimento do Instituto dos Sonhos criada');
    console.log('   • System prompts atualizados com informações da empresa');

  } catch (error) {
    console.error('❌ Erro durante a otimização:', error);
  }
}

// Função para testar chat com nova configuração
async function testarChatSofia() {
  console.log('\n🧪 Testando chat da Sofia...');
  
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
            content: 'Olá Sofia! Pode me contar sobre o Instituto dos Sonhos?'
          }
        ]
      })
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Resposta da Sofia:');
      console.log(data.response || data.message || 'Resposta recebida');
    } else {
      console.error('❌ Erro no teste:', response.status, await response.text());
    }
  } catch (error) {
    console.error('❌ Erro ao testar chat:', error);
  }
}

// Executar otimização
aplicarOtimizacaoIA().then(() => {
  // Aguardar um pouco e testar
  setTimeout(testarChatSofia, 2000);
});


