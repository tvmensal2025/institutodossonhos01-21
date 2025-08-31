const express = require('express');
const cors = require('cors');
const { applySelectionFromFrontend } = require('./api/apply-selection.cjs');
const { testWeeklyReport } = require('./api/weekly-report.cjs');
const path = require('path');
const OpenAI = require('openai');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Configuração da API do OpenAI (opcional)
let openai = null;
if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });
}

// Middleware
app.use(cors());
app.use(express.json());
<<<<<<< HEAD

// Rota para aplicar seleção de IA
app.post('/api/apply-selection', async (req, res) => {
  try {
    console.log('📥 Recebendo requisição para aplicar seleção:', req.body);
    
    const { selectedModel, selectedPreset } = req.body;
    
    if (!selectedModel || !selectedPreset) {
      return res.status(400).json({
        success: false,
        error: 'Modelo e preset são obrigatórios'
      });
    }

    const result = await applySelectionFromFrontend(selectedModel, selectedPreset);
    
    console.log('📤 Enviando resposta:', result);
    res.json(result);
    
  } catch (error) {
    console.error('💥 Erro na API:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Rota para testar relatório semanal
app.post('/api/test-weekly-report', async (req, res) => {
  try {
    console.log('📥 Recebendo requisição para testar relatório semanal');
    
    const result = await testWeeklyReport();
    
    console.log('📤 Enviando resposta:', result);
    res.json(result);
    
  } catch (error) {
    console.error('💥 Erro na API:', error);
    res.status(500).json({
      success: false,
      error: error.message
=======
app.use(express.static('public'));

// Rota principal
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Rota da API para chat
app.post('/api/chat', async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!openai) {
      return res.status(400).json({ 
        error: 'Chave da API do OpenAI não configurada. Configure a variável OPENAI_API_KEY para usar o chat.' 
      });
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "Você é um assistente útil e amigável." },
        { role: "user", content: message }
      ],
      max_tokens: 500
    });

    res.json({ 
      response: completion.choices[0].message.content 
    });
  } catch (error) {
    console.error('Erro na API:', error);
    res.status(500).json({ 
      error: 'Erro ao processar a mensagem' 
>>>>>>> 7c51b0f5195e083dbe5319c2eb3bf3bb5e231d50
    });
  }
});

<<<<<<< HEAD
// Rota de saúde
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'API funcionando!',
    timestamp: new Date().toISOString()
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📡 APIs disponíveis:`);
  console.log(`   POST /api/apply-selection`);
  console.log(`   POST /api/test-weekly-report`);
  console.log(`   GET  /api/health`);
});

module.exports = app; 
=======
// Rota de status
app.get('/api/status', (req, res) => {
  res.json({ 
    status: 'online',
    openai_configured: !!process.env.OPENAI_API_KEY
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
  console.log(`📦 Dependências instaladas:`);
  console.log(`   - Express.js`);
  console.log(`   - OpenAI: ^5.10.1`);
  console.log(`   - CORS`);
  console.log(`   - dotenv`);
}); 
>>>>>>> 7c51b0f5195e083dbe5319c2eb3bf3bb5e231d50
