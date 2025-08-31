# 📋 Instruções para Configurar Relatório na Hostgator

## 🎯 Objetivo
Configurar o relatório semanal do Dr. Vita no site institutodossonhos.com.br

## 📁 Arquivos Necessários

### 1. `relatorio-hostgator.html`
- **Arquivo principal** que será hospedado na Hostgator
- Contém interface para visualizar relatórios
- Conecta com a Edge Function do Supabase

## 🚀 Passos para Configuração

### Passo 1: Acessar Painel da Hostgator
1. Acesse: https://institutodossonhos.com.br/cpanel
2. Faça login com suas credenciais
3. Vá para "Gerenciador de Arquivos"

### Passo 2: Upload do Arquivo
1. Navegue até a pasta `public_html`
2. Faça upload do arquivo `relatorio-hostgator.html`
3. Renomeie para `relatorio.html` (opcional)

### Passo 3: Configurar URL
**Opção A - Subpasta:**
- URL: `https://institutodossonhos.com.br/relatorio.html`

**Opção B - Subdomínio:**
- Crie subdomínio: `relatorio.institutodossonhos.com.br`
- Configure no painel da Hostgator
- Upload na pasta do subdomínio

## 🔧 Funcionalidades da Página

### 📊 Botões Disponíveis:
1. **📊 Carregar Relatório Completo**
   - Exibe relatório HTML completo
   - Dados da Sirlene Correa
   - Métricas médicas detalhadas

2. **📧 Versão Email**
   - Envia email para tvmensal2025@gmail.com
   - Mesmo relatório em formato email

3. **🗑️ Limpar**
   - Remove relatório da tela
   - Limpa mensagens de status

## 🎨 Características Visuais

### Design Responsivo:
- ✅ Funciona em desktop, tablet e mobile
- ✅ Gradiente azul/roxo (cores do Dr. Vita)
- ✅ Interface moderna e profissional
- ✅ Loading spinner animado

### Integração:
- ✅ Conecta com Supabase Edge Function
- ✅ Dados fictícios da Sirlene
- ✅ Relatório completo com métricas médicas

## 🔒 Segurança

### Configurações:
- ✅ CORS configurado para domínio
- ✅ Autenticação via Supabase
- ✅ Dados de teste seguros

### URLs Permitidas:
- `https://institutodossonhos.com.br`
- `https://www.institutodossonhos.com.br`
- `https://relatorio.institutodossonhos.com.br`

## 📱 Teste da Configuração

### 1. Acesso Direto:
```
https://institutodossonhos.com.br/relatorio.html
```

### 2. Verificações:
- ✅ Página carrega sem erros
- ✅ Botão "Carregar Relatório" funciona
- ✅ Relatório aparece em iframe
- ✅ Design responsivo funciona

## 🛠️ Troubleshooting

### Erro de CORS:
- Verificar se domínio está na lista de permitidos
- Contatar suporte Supabase se necessário

### Erro de Conexão:
- Verificar se Edge Function está ativa
- Testar com Postman/Insomnia

### Relatório não carrega:
- Verificar console do navegador
- Confirmar se ANON_KEY está correta

## 📞 Suporte

### Se precisar de ajuda:
1. Verificar logs do navegador (F12)
2. Testar Edge Function diretamente
3. Confirmar configurações da Hostgator

## 🎉 Resultado Final

Após configuração, você terá:
- 🌐 Página profissional no seu domínio
- 📊 Relatórios médicos completos
- 📧 Funcionalidade de email
- 📱 Interface responsiva
- 🔒 Segurança configurada

**URL Final:** `https://institutodossonhos.com.br/relatorio.html`













