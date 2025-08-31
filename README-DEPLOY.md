# 🚀 Guia de Deploy - Projeto Lovable

## 📋 Pré-requisitos

- ✅ Node.js 18+
- ✅ Docker instalado
- ✅ Supabase CLI configurado
- ✅ Git configurado

## 🛠️ Configurações Atuais

### **GitHub**
- Repositório sincronizado
- Branch `main` atualizada
- GitHub Actions configurado

### **Docker**
- Dockerfile otimizado para produção
- docker-compose.yml para desenvolvimento
- nginx.conf para SPA React

### **Supabase**
- Projeto ID: `hlrkoyywjpckdotimtik`
- CLI versão: 2.31.8
- Estrutura de migrations pronta

## 🚀 Comandos de Deploy

### **Desenvolvimento Local**
```bash
# Instalar dependências
npm install

# Rodar em desenvolvimento
npm run dev

# Build para produção
npm run build:prod
```

### **Docker Local**
```bash
# Build da imagem
docker build -t mission-projeto-07 .

# Rodar container
docker run -p 3000:80 mission-projeto-07

# Ou usar docker-compose
docker-compose up -d
```

### **Supabase**
```bash
# Login no Supabase
supabase login

# Linkar projeto
supabase link --project-ref hlrkoyywjpckdotimtik

# Aplicar migrations
supabase db push

# Deploy functions
supabase functions deploy
```

## 📦 Lovable Deploy

### **Configuração Lovable**
- Arquivo `lovable.config.js` configurado
- Build command: `npm run build:prod`
- Output: `dist/`
- Node version: 18

### **Variáveis de Ambiente**
```env
NODE_ENV=production
VITE_SUPABASE_URL=sua_url_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_anonima
```

## 🔧 Troubleshooting

### **Problemas Comuns**
1. **Build falha**: Verificar Node.js 18+
2. **Supabase não conecta**: Verificar variáveis de ambiente
3. **Docker não roda**: Verificar Docker instalado

### **Logs**
```bash
# Logs do container
docker logs <container_id>

# Logs do Supabase
supabase logs
```

## 📞 Suporte

Para problemas com deploy, verificar:
1. Lovable logs
2. GitHub Actions logs
3. Supabase dashboard
4. Docker logs 