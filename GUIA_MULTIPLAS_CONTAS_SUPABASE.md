# Guia: Múltiplas Contas Supabase

## 🎯 Objetivo
Configurar e gerenciar duas contas do Supabase no mesmo projeto:
- **Conta Principal**: Com dados e migrações (atual)
- **Conta Nova**: Limpa, sem migrações

## 📋 Pré-requisitos

### 1. Criar Nova Conta no Supabase
1. Acesse [supabase.com](https://supabase.com)
2. Faça login ou crie uma conta
3. Crie um novo projeto
4. Anote a URL e chave anônima do projeto

### 2. Obter Credenciais
No dashboard do Supabase:
- **URL**: `https://[project-id].supabase.co`
- **Chave Anônima**: Encontrada em Settings > API

## 🚀 Configuração

### Opção 1: Script Automático (Recomendado)
```bash
cd mission-projeto-56
node setup-new-supabase.js
```

### Opção 2: Configuração Manual
1. Crie um arquivo `.env` na raiz do projeto
2. Adicione as seguintes variáveis:

```env
# Configuração Supabase - Conta Principal (Atual)
VITE_SUPABASE_URL_MAIN=https://hlrkoyywjpckdotimtik.supabase.co
VITE_SUPABASE_ANON_KEY_MAIN=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhscmtveXl3anBja2RvdGltdGlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMxNTMwNDcsImV4cCI6MjA2ODcyOTA0N30.kYEtg1hYG2pmcyIeXRs-vgNIVOD76Yu7KPlyFN0vdUI

# Configuração Supabase - Conta Nova (Limpa)
VITE_SUPABASE_URL_NEW=https://sua-nova-conta.supabase.co
VITE_SUPABASE_ANON_KEY_NEW=sua-chave-anonima-nova

# Conta ativa (MAIN ou NEW)
VITE_ACTIVE_SUPABASE=MAIN
```

## 🔄 Como Alternar Entre Contas

### Método 1: Variável de Ambiente
Edite o arquivo `.env` e mude:
```env
VITE_ACTIVE_SUPABASE=NEW  # Para usar a conta nova
VITE_ACTIVE_SUPABASE=MAIN # Para usar a conta principal
```

### Método 2: Interface do Usuário
Use o componente `SupabaseAccountSwitcher` na sua aplicação:

```tsx
import { SupabaseAccountSwitcher } from '@/components/SupabaseAccountSwitcher';

// No seu componente
<SupabaseAccountSwitcher />
```

### Método 3: Programaticamente
```tsx
import { switchSupabaseAccount } from '@/integrations/supabase/client';

// Alternar para conta nova
switchSupabaseAccount('NEW');

// Alternar para conta principal
switchSupabaseAccount('MAIN');
```

## 📁 Estrutura de Arquivos

```
mission-projeto-56/
├── .env                          # Configurações das contas
├── env.example                   # Exemplo de configuração
├── setup-new-supabase.js        # Script de configuração
├── src/
│   ├── components/
│   │   └── SupabaseAccountSwitcher.tsx  # Componente de interface
│   └── integrations/
│       └── supabase/
│           └── client.ts         # Cliente dinâmico
└── GUIA_MULTIPLAS_CONTAS_SUPABASE.md   # Este guia
```

## 🔧 Funcionalidades Implementadas

### 1. Cliente Dinâmico (`client.ts`)
- Detecta automaticamente qual conta usar
- Suporta alternância em tempo real
- Mantém configurações de autenticação

### 2. Componente de Interface (`SupabaseAccountSwitcher.tsx`)
- Interface visual para alternar contas
- Mostra status atual de cada conta
- Validação de configuração

### 3. Script de Configuração (`setup-new-supabase.js`)
- Configuração interativa
- Validação de credenciais
- Criação automática do arquivo `.env`

## 🚨 Importante

### Segurança
- Nunca commite o arquivo `.env` no Git
- Adicione `.env` ao `.gitignore`
- Use variáveis de ambiente em produção

### Migrações
- A conta nova não terá migrações aplicadas
- Você precisará aplicar as migrações manualmente se necessário
- Use `supabase db reset` na conta nova para começar limpo

### Autenticação
- Cada conta tem seu próprio sistema de autenticação
- Usuários não são compartilhados entre contas
- Sessões são independentes

## 🛠️ Troubleshooting

### Problema: "URL inválida"
**Solução**: Verifique se a URL está no formato correto:
```
https://[project-id].supabase.co
```

### Problema: "Chave anônima inválida"
**Solução**: Verifique se a chave:
- Começa com "eyJ"
- Tem mais de 100 caracteres
- Foi copiada corretamente do dashboard

### Problema: "Erro de conexão"
**Solução**:
1. Verifique se as credenciais estão corretas
2. Reinicie o servidor de desenvolvimento
3. Limpe o cache do navegador

### Problema: "Conta não alterna"
**Solução**:
1. Verifique se o arquivo `.env` está na raiz do projeto
2. Reinicie o servidor após mudar a configuração
3. Use `window.location.reload()` para forçar recarregamento

## 📝 Próximos Passos

1. **Configure a nova conta** usando o script ou manualmente
2. **Teste a alternância** entre as contas
3. **Aplique migrações** na conta nova se necessário
4. **Configure autenticação** na conta nova
5. **Teste todas as funcionalidades** em ambas as contas

## 🎉 Benefícios

- ✅ Desenvolvimento isolado
- ✅ Testes em ambiente limpo
- ✅ Backup de dados
- ✅ Migração gradual
- ✅ Rollback fácil
- ✅ Interface amigável

---

**Nota**: Este sistema permite que você mantenha a conta atual funcionando enquanto desenvolve na nova conta limpa, facilitando a transição e testes. 