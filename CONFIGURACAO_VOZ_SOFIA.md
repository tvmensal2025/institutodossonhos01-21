# 🎤 Configuração do Chat por Voz da Sofia

## Visão Geral

O chat por voz da Sofia permite conversação natural com a nutricionista virtual usando:
- **Reconhecimento de Fala**: O usuário pode falar ao invés de digitar
- **Síntese de Voz**: A Sofia responde falando ao invés de apenas texto
- **Auto-Fala**: Respostas automáticas por voz
- **Integração Completa**: Funciona com análise de imagens e chat tradicional

## 🚀 Como Implementar

### 1. Instalar Dependências

```bash
# Não precisa instalar nada! Usa APIs nativas e Google Cloud
```

**Nota**: A implementação usa Google Text-to-Speech e Web Speech API nativa.

### 🎤 **Google TTS (PADRÃO - Voz Natural)**

O sistema usa **Google Text-to-Speech** para voz natural:

- ✅ **Voz neural natural** - Muito mais humana
- ✅ **1 milhão de caracteres/mês** gratuitos
- ✅ **Vozes em português brasileiro** - Feminina e masculina
- ✅ **Configuração simples** - Apenas API key
- ✅ **Fallback automático** - Web Speech API se falhar
- ❌ **Requer configuração** - API key do Google Cloud

### 2. Configurar Variáveis de Ambiente (OPCIONAL)

**Para Google TTS (PADRÃO)**: Crie um arquivo `.env` na raiz do projeto:

**Para modo gratuito (FALLBACK)**: Não precisa configurar nada!

```env
# Google Cloud Text-to-Speech API Key (OPCIONAL)
VITE_GOOGLE_TTS_API_KEY=sua_chave_api_google_cloud_aqui
```

### 3. Obter Chave da API Google Cloud (PADRÃO)

**Para Google TTS (PADRÃO)**:
1. Acesse [Google Cloud Console](https://console.cloud.google.com/)
2. Crie um projeto ou selecione um existente
3. Ative a API "Cloud Text-to-Speech"
4. Crie uma chave de API
5. Cole no arquivo `.env`

### 4. Acessar o Chat por Voz

- **URL**: `/sofia-voice`
- **Navegação**: Menu → Sofia → Chat por Voz

**🎉 Pronto! Configure a API key para voz natural!**

## 💰 **Custos do Google Text-to-Speech**

### **Plano Gratuito:**
- **1 milhão de caracteres por mês** (aproximadamente 10-15 horas de fala)
- **Vozes neurais** incluídas
- **Suporte a português brasileiro**
- **Sem cartão de crédito** necessário

### **Plano Pago (após limite gratuito):**
- **$4.00 por 1 milhão de caracteres** (muito mais barato que ElevenLabs)
- **Vozes neurais premium**
- **SSML avançado**

### **Estimativa de Uso para a Sofia:**
- **Por conversa típica**: ~300-450 caracteres
- **1 milhão de caracteres** = ~2.200-3.300 conversas
- **Uso mensal típico**: 100-500 conversas (bem dentro do limite gratuito)

## 🎯 Funcionalidades Implementadas

### 🔄 **Sistema de Fallback Inteligente**

O sistema agora funciona em **dois modos**:

#### **🎤 Google TTS (PADRÃO)**
- **Google Text-to-Speech** para voz neural natural
- **1 milhão de caracteres/mês** gratuitos
- **Voz muito mais humana** que Web Speech API
- **Requer API key** do Google Cloud
- **Indicador visual** - Mostra quando usando Google TTS

#### **🆓 Web Speech API (FALLBACK)**
- **Web Speech API** nativa do navegador
- **Sem custos** - Funciona sem configuração
- **Voz robótica** - Menos natural
- **Fallback automático** - Se Google TTS falhar
- **Indicador visual** - Mostra "(Gratuito)" quando ativo

### Hook useConversation
- **Arquivo**: `src/hooks/useConversation.ts`
- **Funcionalidades**:
  - Reconhecimento de fala em português
  - Síntese de voz com ElevenLabs (API REST)
  - Controle de gravação e reprodução
  - Tratamento de erros
  - Limpeza automática de recursos

### Componente SofiaVoiceChat
- **Arquivo**: `src/components/sofia/SofiaVoiceChat.tsx`
- **Funcionalidades**:
  - Interface de chat com controles de voz
  - Transcrição em tempo real
  - Auto-fala configurável
  - Integração com análise de imagens
  - Animações e feedback visual

### Página SofiaVoicePage
- **Arquivo**: `src/pages/SofiaVoicePage.tsx`
- **Funcionalidades**:
  - Layout responsivo
  - Sidebar com informações
  - Status em tempo real
  - Dicas de uso
  - Navegação integrada

## 🎨 Interface do Usuário

### Controles de Voz
- **🎤 Botão Microfone**: Ativa/desativa gravação
- **🔊 Auto-Fala**: Liga/desliga resposta automática
- **📸 Câmera/Galeria**: Análise de imagens
- **⌨️ Input de Texto**: Chat tradicional

### Indicadores Visuais
- **Gravando**: Badge vermelho pulsante
- **Sofia Falando**: Badge roxo com spinner
- **Transcrição**: Área azul com texto em tempo real
- **Status**: Badges verdes para funcionalidades ativas

## 🔧 Configurações Avançadas

### Voz da Sofia
- **ID da Voz**: `pt-BR-Neural2-A` (voz feminina neural brasileira)
- **Serviço**: Google Cloud Text-to-Speech
- **Configurações**:
  - Language Code: pt-BR
  - Speaking Rate: 0.9
  - Pitch: 0.0
  - Volume: 0.0 dB

### Reconhecimento de Fala
- **Idioma**: Português Brasileiro (pt-BR)
- **Resultados Intermediários**: Ativados
- **Contínuo**: Desativado (uma frase por vez)

## 🐛 Solução de Problemas

### Erro: "Reconhecimento de fala não suportado"
- **Causa**: Navegador não suporta Web Speech API
- **Solução**: Use Chrome, Edge ou Safari

### Erro: "Erro ao gerar fala da Sofia"
- **Causa**: Chave API inválida ou sem créditos
- **Solução**: Verifique a chave API e créditos na conta Google Cloud

### Erro: "Microfone não autorizado"
- **Causa**: Permissão negada pelo navegador
- **Solução**: Clique no ícone de microfone na barra de endereços

### Áudio não reproduz
- **Causa**: Política de autoplay do navegador
- **Solução**: Interaja primeiro com a página (clique, scroll, etc.)

## 📱 Compatibilidade

### Navegadores Suportados
- ✅ Chrome 66+
- ✅ Edge 79+
- ✅ Safari 14.1+
- ❌ Firefox (suporte limitado)

### Dispositivos
- ✅ Desktop (Windows, Mac, Linux)
- ✅ Mobile (iOS Safari, Android Chrome)
- ✅ Tablet (iPad, Android)

## 🔒 Segurança

### Permissões Necessárias
- **Microfone**: Para reconhecimento de fala
- **Autoplay**: Para reprodução de áudio

### Dados Processados
- **Local**: Transcrição e áudio processados no navegador
- **ElevenLabs**: Texto enviado para síntese de voz
- **Supabase**: Mensagens salvas no banco de dados

## 🚀 Próximos Passos

### Melhorias Planejadas
1. **Vozes Personalizadas**: Permitir escolha de voz
2. **Comandos por Voz**: "Sofia, analise esta foto"
3. **Histórico de Voz**: Salvar áudios das conversas
4. **Offline Mode**: Funcionalidade básica sem internet
5. **Múltiplos Idiomas**: Suporte a inglês e espanhol

### Integrações Futuras
- **WhatsApp**: Envio de áudios
- **Telegram**: Bot com voz
- **Google Assistant**: Actions para assistente
- **Carro**: Integração com Android Auto
- **Google Meet**: Transcrição em tempo real

## 📞 Suporte

Para dúvidas ou problemas:
1. Verifique esta documentação
2. Teste em diferentes navegadores
3. Verifique as variáveis de ambiente
4. Consulte os logs do console
5. Entre em contato com o time de desenvolvimento

---

**✨ A Sofia agora fala com Google TTS! Experimente o futuro da nutrição conversacional!**
