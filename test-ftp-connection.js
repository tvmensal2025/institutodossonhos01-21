// Teste de Conexão FTP - Hostgator
import ftp from 'basic-ftp';

const testFTPConnection = async () => {
  const client = new ftp.Client();
  
  console.log('🧪 Testando conexão FTP...');
  
  try {
    // Configurações FTP com credenciais reais
    const config = {
      host: 'ftp.institutodossonhos.com.br',
      user: 'rafaeldias2025@institutodossonhos.com.br', // usuário FTP existente
      password: 'S^]WBM[v5_$]', // senha FTP (mesma do cPanel)
      port: 21,
      secure: false, // FTP normal, não FTPS
      timeout: 15000 // 15 segundos de timeout
    };
    
    console.log('🔗 Conectando ao servidor FTP...');
    await client.access(config);
    
    console.log('✅ Conexão FTP estabelecida com sucesso!');
    
    // Listar arquivos no diretório
    console.log('📁 Listando arquivos em /public_html/:');
    const list = await client.list('/public_html/');
    list.forEach(file => {
      console.log(`  📄 ${file.name} (${file.size} bytes)`);
    });
    
    // Testar upload de arquivo
    console.log('📤 Testando upload...');
    const testContent = '<html><body><h1>Teste FTP</h1></body></html>';
    await client.uploadFrom(Buffer.from(testContent), '/public_html/teste-ftp.html');
    console.log('✅ Upload de teste realizado com sucesso!');
    
    // Remover arquivo de teste
    await client.remove('/public_html/teste-ftp.html');
    console.log('🗑️ Arquivo de teste removido');
    
  } catch (error) {
    console.error('❌ Erro na conexão FTP:', error.message);
    console.log('🔧 Verifique:');
    console.log('  - Usuário e senha corretos');
    console.log('  - Servidor FTP correto');
    console.log('  - Porta 21 (não bloqueada)');
    console.log('  - Permissões da conta FTP');
  } finally {
    client.close();
  }
};

// Executar teste
testFTPConnection();
