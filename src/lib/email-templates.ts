import { getCharacterImageUrl } from './character-images';

// Template base para emails com personagens
export const createEmailTemplate = (type: 'weekly' | 'monthly', data: any) => {
  const drVitalImage = getCharacterImageUrl('dr-vital');
  const sofiaImage = getCharacterImageUrl('sofia');

  const baseTemplate = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Relatório ${type === 'weekly' ? 'Semanal' : 'Mensal'} - Instituto dos Sonhos</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; }
        .footer { background: #333; color: white; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; }
        .character-section { display: flex; align-items: center; margin: 20px 0; padding: 20px; background: white; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .character-avatar { width: 80px; height: 80px; border-radius: 50%; margin-right: 20px; object-fit: cover; }
        .character-info h3 { margin: 0 0 10px 0; color: #333; }
        .character-info p { margin: 0; color: #666; }
        .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 20px 0; }
        .stat-card { background: white; padding: 20px; border-radius: 10px; text-align: center; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .stat-number { font-size: 2em; font-weight: bold; color: #667eea; }
        .stat-label { color: #666; margin-top: 5px; }
        .cta-button { display: inline-block; background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; margin: 20px 0; }
        .highlight { background: #fff3cd; padding: 15px; border-radius: 5px; border-left: 4px solid #ffc107; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📊 Relatório ${type === 'weekly' ? 'Semanal' : 'Mensal'}</h1>
          <p>Seu acompanhamento personalizado de saúde e bem-estar</p>
        </div>
        
        <div class="content">
          <div class="character-section">
            <img src="${drVitalImage}" alt="Dr. Vital" class="character-avatar">
            <div class="character-info">
              <h3>👨‍⚕️ Dr. Vital</h3>
              <p>Médico especialista em saúde e bem-estar</p>
              <p><strong>Mensagem:</strong> ${data.drVitalMessage || 'Continue focado nos seus objetivos de saúde!'}</p>
            </div>
          </div>

          <div class="character-section">
            <img src="${sofiaImage}" alt="Sofia" class="character-avatar">
            <div class="character-info">
              <h3>💜 Sofia</h3>
              <p>Assistente virtual e coach de saúde</p>
              <p><strong>Mensagem:</strong> ${data.sofiaMessage || 'Estou aqui para te apoiar em sua jornada!'}</p>
            </div>
          </div>

          <div class="stats-grid">
            ${data.stats ? data.stats.map((stat: any) => `
              <div class="stat-card">
                <div class="stat-number">${stat.value}</div>
                <div class="stat-label">${stat.label}</div>
              </div>
            `).join('') : ''}
          </div>

          ${data.highlight ? `
            <div class="highlight">
              <h4>🌟 Destaque da ${type === 'weekly' ? 'Semana' : 'Semana'}</h4>
              <p>${data.highlight}</p>
            </div>
          ` : ''}

          <div style="text-align: center; margin: 30px 0;">
            <a href="${data.appUrl || '#'}" class="cta-button">
              📱 Acessar Plataforma
            </a>
          </div>
        </div>

        <div class="footer">
          <p>© 2024 Instituto dos Sonhos - Transformando vidas através da saúde</p>
          <p>Para dúvidas, entre em contato conosco</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return baseTemplate;
};

// Template específico para relatório semanal
export const createWeeklyReportTemplate = (data: any) => {
  return createEmailTemplate('weekly', {
    ...data,
    drVitalMessage: data.drVitalMessage || 'Excelente progresso esta semana! Continue mantendo a consistência nos seus hábitos saudáveis.',
    sofiaMessage: data.sofiaMessage || 'Você está no caminho certo! Vamos manter o foco nos seus objetivos.',
    appUrl: import.meta.env.VITE_APP_URL || 'https://institutodossonhos.com'
  });
};

// Template específico para relatório mensal
export const createMonthlyReportTemplate = (data: any) => {
  return createEmailTemplate('monthly', {
    ...data,
    drVitalMessage: data.drVitalMessage || 'Parabéns pelo seu comprometimento este mês! Os resultados mostram sua dedicação.',
    sofiaMessage: data.sofiaMessage || 'Um mês incrível! Você está construindo hábitos duradouros para uma vida mais saudável.',
    appUrl: import.meta.env.VITE_APP_URL || 'https://institutodossonhos.com'
  });
};

// Template para WhatsApp (versão simplificada)
export const createWhatsAppTemplate = (type: 'weekly' | 'monthly', data: any) => {
  const drVitalImage = getCharacterImageUrl('dr-vital');
  const sofiaImage = getCharacterImageUrl('sofia');

  return `
📊 *Relatório ${type === 'weekly' ? 'Semanal' : 'Mensal'} - Instituto dos Sonhos*

👨‍⚕️ *Dr. Vital*:
${data.drVitalMessage || 'Continue focado nos seus objetivos de saúde!'}

💜 *Sofia*:
${data.sofiaMessage || 'Estou aqui para te apoiar em sua jornada!'}

📈 *Seus Resultados*:
${data.stats ? data.stats.map((stat: any) => `• ${stat.label}: ${stat.value}`).join('\n') : 'Nenhum dado disponível'}

${data.highlight ? `\n🌟 *Destaque*: ${data.highlight}` : ''}

📱 Acesse a plataforma para mais detalhes: ${data.appUrl || 'https://institutodossonhos.com'}

---
Instituto dos Sonhos - Transformando vidas através da saúde
  `;
}; 