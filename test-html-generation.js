// Teste de Geração HTML sem FTP
const testHTMLGeneration = async () => {
  try {
    console.log('🧪 Gerando HTML do relatório...');
    
    const response = await fetch('https://hlrkoyywjpckdotimtik.supabase.co/functions/v1/weekly-health-report', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhscmtveXl3anBja2RvdGltdGlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMxNTMwNDcsImV4cCI6MjA2ODcyOTA0N30.kYEtg1hYG2pmcyIeXRs-vgNIVOD76Yu7KPlyFN0vdUI'
      },
      body: JSON.stringify({
        testMode: true,
        testEmail: 'tvmensal2025@gmail.com',
        testUserName: 'Sirlene Correa',
        returnHTML: true
      })
    });

    if (response.ok) {
      const htmlContent = await response.text();
      
      // Salvar HTML para upload manual
      const fs = await import('fs');
      fs.writeFileSync('relatorio-semanal.html', htmlContent);
      
      console.log('✅ HTML gerado com sucesso!');
      console.log('📄 Arquivo salvo: relatorio-semanal.html');
      console.log('📁 Tamanho: ' + (htmlContent.length / 1024).toFixed(2) + ' KB');
      console.log('');
      console.log('📋 Próximos passos:');
      console.log('1. 📤 Upload manual via cPanel File Manager');
      console.log('2. 🌐 Teste: https://institutodossonhos.com.br/relatorio-semanal.html');
      console.log('3. 🤖 Configure n8n para automação');
      console.log('');
      console.log('📊 Workflow n8n simplificado:');
      console.log('   📅 Cron → 🌐 HTTP Request → 📧 Email → 📱 WhatsApp');
      
    } else {
      const error = await response.json();
      console.error('❌ Erro:', error);
    }
  } catch (error) {
    console.error('💥 Erro na requisição:', error);
  }
};

// Executar teste
testHTMLGeneration();













