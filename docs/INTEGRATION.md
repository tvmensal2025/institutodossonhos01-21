# Integrações do Projeto

Este documento descreve as integrações configuradas no projeto Mission Health Nexus 99.

## 🔗 Supabase

### Configuração Atual

O projeto está integrado com o Supabase para:

- **Autenticação**: Sistema de login/registro de usuários
- **Banco de Dados**: PostgreSQL com as seguintes tabelas principais:
  - `profiles` - Perfis dos usuários
  - `weight_measurements` - Medições de peso e composição corporal
  - `weighings` - Pesagens básicas
  - `courses` - Cursos disponíveis
  - `course_modules` - Módulos dos cursos
  - `lessons` - Aulas dos módulos
  - `missions` - Missões do sistema
  - `user_missions` - Missões atribuídas aos usuários
  - `assessments` - Avaliações semanais
  - `health_diary` - Diário de saúde
  - `user_goals` - Metas dos usuários
  - `weekly_analyses` - Análises semanais

### Credenciais

- **URL**: `https://hlrkoyywjpckdotimtik.supabase.co`
- **Project ID**: `hlrkoyywjpckdotimtik`
- **Anon Key**: Configurada no arquivo `src/integrations/supabase/client.ts`

### Como Usar

```typescript
import { supabase } from '@/integrations/supabase/client';

// Exemplo de consulta
const { data, error } = await supabase
  .from('profiles')
  .select('*')
  .eq('user_id', userId);
```

## 🔗 GitHub

### Configuração Atual

O projeto está conectado ao GitHub para:

- **Versionamento**: Controle de versão do código
- **CI/CD**: Deploy automático via GitHub Actions
- **Colaboração**: Trabalho em equipe

### Repositório

- **URL**: `https://github.com/tvmensal2025/mission-health-nexus-99.git`
- **Branch Principal**: `main`
- **Status**: Ativo e sincronizado

### GitHub Actions

O projeto inclui um workflow para deploy automático:

- **Arquivo**: `.github/workflows/deploy.yml`
- **Trigger**: Push para branch `main`
- **Ações**: Build, lint, deploy para Vercel

## 🔧 Configuração de Ambiente

### Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto:

```env
# Supabase
VITE_SUPABASE_URL=https://hlrkoyywjpckdotimtik.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhscmtveXl3anBja2RvdGltdGlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMxNTMwNDcsImV4cCI6MjA2ODcyOTA0N30.kYEtg1hYG2pmcyIeXRs-vgNIVOD76Yu7KPlyFN0vdUI

# GitHub
VITE_GITHUB_REPO_URL=https://github.com/tvmensal2025/mission-health-nexus-99.git
VITE_GITHUB_REPO_NAME=mission-health-nexus-99

# App
VITE_APP_NAME=Mission Health Nexus 99
VITE_APP_VERSION=1.0.0
VITE_APP_ENVIRONMENT=development
```

### Configuração Centralizada

O projeto usa um sistema de configuração centralizada em `src/lib/config.ts`:

```typescript
import { config } from '@/lib/config';

// Acessar configurações
console.log(config.supabase.url);
console.log(config.github.repoUrl);
console.log(config.app.name);
```

## 🚀 Deploy

### Vercel (Recomendado)

1. Conecte o repositório GitHub ao Vercel
2. Configure as variáveis de ambiente no painel do Vercel:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
3. Deploy automático a cada push para `main`

### Netlify

1. Conecte o repositório GitHub ao Netlify
2. Configure as variáveis de ambiente
3. Build command: `npm run build`
4. Publish directory: `dist`

## 🔍 Monitoramento

### Supabase Dashboard

- Acesse: https://supabase.com/dashboard/project/hlrkoyywjpckdotimtik
- Monitore: Banco de dados, autenticação, storage

### GitHub Insights

- Acesse: https://github.com/tvmensal2025/mission-health-nexus-99
- Monitore: Commits, issues, pull requests

## 🛠️ Comandos Úteis

### Supabase CLI

```bash
# Instalar Supabase CLI
npm install -g supabase

# Login no Supabase
supabase login

# Iniciar ambiente local
supabase start

# Gerar tipos do banco
supabase gen types typescript --project-id hlrkoyywjpckdotimtik > src/integrations/supabase/types.ts
```

### GitHub

```bash
# Verificar status do repositório
git status

# Verificar remotes
git remote -v

# Fazer push das mudanças
git add .
git commit -m "feat: nova funcionalidade"
git push origin main
```

## 🔒 Segurança

### Variáveis Sensíveis

- Nunca commite chaves privadas no repositório
- Use variáveis de ambiente para configurações sensíveis
- Configure secrets no GitHub para CI/CD

### Autenticação

- O Supabase gerencia autenticação de forma segura
- Tokens JWT são gerenciados automaticamente
- Sessões são persistidas no localStorage

## 📞 Suporte

### Problemas com Supabase

1. Verifique as credenciais em `src/integrations/supabase/client.ts`
2. Confirme se o projeto está ativo no dashboard do Supabase
3. Verifique os logs no dashboard do Supabase

### Problemas com GitHub

1. Verifique se o repositório está sincronizado
2. Confirme as permissões de acesso
3. Verifique os logs do GitHub Actions

---

**Última atualização**: Janeiro 2025
**Versão**: 1.0.0 