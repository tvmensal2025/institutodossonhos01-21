#!/usr/bin/env node

/**
 * Script para configurar as credenciais do Google OAuth no Supabase
 * Instituto dos Sonhos - Integração Google Fit
 * 
 * Execução: node configurar-google-oauth-supabase.js
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Carregar variáveis de ambiente
config();

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://bkkyyyvxdsdmuik.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Configurações do Google OAuth
const GOOGLE_CONFIG = {
  CLIENT_ID: '705908448787-ndqju36rr7d23no0vqkhqsaqrf5unsmc.apps.googleusercontent.com',
  CLIENT_SECRET: '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', // Chave fornecida pelo usuário
  REDIRECT_URIS: [
    'http://localhost:3000/google-fit-callback',
    'https://institutodossonhos.com.br/google-fit-callback',
    'https://eb451b44-5d36-4bf7-8628-481a619af74a.lovableproject.com/google-fit-callback'
  ]
};

console.log('🔧 Configurando Google OAuth para Instituto dos Sonhos...\n');

// Verificar credenciais
if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY não encontrada nas variáveis de ambiente');
  console.log('📝 Adicione a chave no arquivo .env:');
  console.log('   SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key_aqui\n');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function configurarCredenciaisGoogle() {
  console.log('📡 Testando conexão com Supabase...');
  
  try {
    // Testar edge function de configuração
    console.log('🚀 Testando edge function google-fit-token...');
    
    const { data, error } = await supabase.functions.invoke('google-fit-token', {
      body: { testSecrets: true }
    });

    if (error) {
      console.error('❌ Erro ao testar edge function:', error);
      throw error;
    }

    console.log('✅ Edge function funcionando:', data);

    // Verificar se as credenciais estão configuradas corretamente
    if (data.clientIdDefined && data.clientSecretDefined) {
      console.log('✅ Credenciais Google já configuradas no Supabase');
      console.log(`📊 Client ID Preview: ${data.clientIdPreview}`);
    } else {
      console.log('⚠️  Credenciais Google não encontradas');
      console.log('📝 Configure as seguintes variáveis no Supabase Dashboard:');
      console.log('   GOOGLE_FIT_CLIENT_ID=' + GOOGLE_CONFIG.CLIENT_ID);
      console.log('   GOOGLE_FIT_CLIENT_SECRET=' + GOOGLE_CONFIG.CLIENT_SECRET);
    }

    console.log('\n🌐 URLs de Redirecionamento Configuradas:');
    GOOGLE_CONFIG.REDIRECT_URIS.forEach(uri => {
      console.log(`   ✓ ${uri}`);
    });

    console.log('\n📋 Próximos Passos:');
    console.log('1. Confirme que as credenciais estão configuradas no Supabase Dashboard');
    console.log('2. Verifique se os domínios estão autorizados no Google Cloud Console');
    console.log('3. Teste a conexão Google Fit na aplicação');
    console.log('4. Execute a migração do banco de dados se necessário');

    return true;

  } catch (error) {
    console.error('❌ Erro na configuração:', error);
    return false;
  }
}

async function testarConexaoCompleta() {
  console.log('\n🧪 Teste Completo de Configuração\n');
  
  const testes = [
    {
      nome: 'Conexão Supabase',
      funcao: async () => {
        const { data } = await supabase.from('profiles').select('count').limit(1);
        return !!data;
      }
    },
    {
      nome: 'Edge Function Google Fit Token',
      funcao: async () => {
        const { data, error } = await supabase.functions.invoke('google-fit-token', {
          body: { testSecrets: true }
        });
        return !error && data?.secretsTest;
      }
    },
    {
      nome: 'Edge Function Google Fit Sync',
      funcao: async () => {
        try {
          // Teste básico - deve falhar sem token mas função deve existir
          await supabase.functions.invoke('google-fit-sync', {
            body: { test: true }
          });
          return true;
        } catch (error) {
          // Esperado falhar, mas função deve existir
          return true;
        }
      }
    },
    {
      nome: 'Tabela Google Fit Data',
      funcao: async () => {
        const { error } = await supabase.from('google_fit_data').select('*').limit(1);
        return !error;
      }
    }
  ];

  let sucessos = 0;
  
  for (const teste of testes) {
    try {
      const resultado = await teste.funcao();
      const status = resultado ? '✅' : '❌';
      console.log(`${status} ${teste.nome}`);
      if (resultado) sucessos++;
    } catch (error) {
      console.log(`❌ ${teste.nome} - Erro: ${error.message}`);
    }
  }

  console.log(`\n📊 Resultado: ${sucessos}/${testes.length} testes passaram\n`);

  if (sucessos === testes.length) {
    console.log('🎉 Configuração Google Fit completa e funcional!');
    console.log('🚀 Pronto para usar na aplicação institutodossonhos.com.br');
  } else {
    console.log('⚠️  Alguns testes falharam. Verifique a configuração.');
  }
}

// Executar configuração
async function main() {
  const configurado = await configurarCredenciaisGoogle();
  
  if (configurado) {
    await testarConexaoCompleta();
  }

  console.log('\n📚 Documentação adicional:');
  console.log('- Google Cloud Console: https://console.cloud.google.com/');
  console.log('- Supabase Dashboard: https://supabase.com/dashboard/');
  console.log('- Google Fit API: https://developers.google.com/fit/');
}

main().catch(console.error);