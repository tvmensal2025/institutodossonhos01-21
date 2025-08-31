import fs from 'fs';
import path from 'path';

// Script para configurar Google TTS rapidamente
async function configurarGoogleTTSRapido() {
  try {
    console.log('🎤 Configurando Google TTS para a Sofia...\n');

    // 1. Verificar se existe arquivo .env
    const envPath = path.join(process.cwd(), '.env');
    let envContent = '';
    
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, 'utf8');
      console.log('✅ Arquivo .env encontrado');
    } else {
      console.log('📝 Criando arquivo .env...');
    }

    // 2. Verificar se já existe a variável VITE_GOOGLE_TTS_API_KEY
    if (envContent.includes('VITE_GOOGLE_TTS_API_KEY')) {
      console.log('⚠️ Variável VITE_GOOGLE_TTS_API_KEY já existe no .env');
      console.log('📝 Para atualizar, edite manualmente o arquivo .env');
    } else {
      // 3. Adicionar a variável
      envContent += `\n# Google Cloud Text-to-Speech API Key\n# Obtenha em: https://console.cloud.google.com/\n# 1. Crie um projeto\n# 2. Ative a API "Cloud Text-to-Speech"\n# 3. Crie uma chave de API\nVITE_GOOGLE_TTS_API_KEY=sua_chave_aqui\n`;
      
      fs.writeFileSync(envPath, envContent);
      console.log('✅ Variável VITE_GOOGLE_TTS_API_KEY adicionada ao .env');
    }

    // 4. Instruções para o usuário
    console.log('\n📋 PRÓXIMOS PASSOS:');
    console.log('1. Acesse: https://console.cloud.google.com/');
    console.log('2. Crie um projeto ou selecione um existente');
    console.log('3. Ative a API "Cloud Text-to-Speech"');
    console.log('4. Crie uma chave de API');
    console.log('5. Substitua "sua_chave_aqui" no arquivo .env pela chave real');
    console.log('6. Reinicie o servidor: npm run dev');
    
    console.log('\n💰 CUSTOS:');
    console.log('- Gratuito: 1 milhão de caracteres/mês');
    console.log('- Pago: $4.00 por 1 milhão adicional');
    
    console.log('\n🎤 VOZES DISPONÍVEIS:');
    console.log('- pt-BR-Neural2-A (Feminina - Padrão)');
    console.log('- pt-BR-Neural2-B (Masculina)');
    console.log('- pt-BR-Neural2-C (Feminina 2) - Configurada para Sofia');
    console.log('- pt-BR-Neural2-D (Masculina 2)');

    console.log('\n✅ Configuração concluída!');
    console.log('🎤 A Sofia terá voz natural após configurar a API key!');

  } catch (error) {
    console.error('❌ Erro na configuração:', error);
  }
}

// Executar se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  configurarGoogleTTSRapido();
}

export default configurarGoogleTTSRapido;


