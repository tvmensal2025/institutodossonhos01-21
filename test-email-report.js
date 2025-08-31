// Teste para enviar relatório por email para Rafael Ferreira
const testEmailReport = async () => {
  try {
    const response = await fetch('https://hlrkoyywjpckdotimtik.supabase.co/functions/v1/send-weekly-email-report', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhscmtveXl3anBja2RvdGltdGlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMxNTMwNDcsImV4cCI6MjA2ODcyOTA0N30.kYEtg1hYG2pmcyIeXRs-vgNIVOD76Yu7KPlyFN0vdUI'
      },
      body: JSON.stringify({
        userIds: ['cc294798-5eff-44b2-b88a-af96627e600b'], // Rafael Ferreira
        customMessage: 'Este é um teste do relatório semanal do Dr. Vita! 📊 Seus dados foram analisados e aqui está o resumo da sua semana de saúde.'
      })
    });

    const result = await response.json();
    console.log('Resultado do envio:', result);
    
    if (response.ok) {
      console.log('✅ Relatório enviado com sucesso!');
    } else {
      console.error('❌ Erro ao enviar relatório:', result.error);
    }
  } catch (error) {
    console.error('❌ Erro na requisição:', error);
  }
};

// Executar o teste
testEmailReport();