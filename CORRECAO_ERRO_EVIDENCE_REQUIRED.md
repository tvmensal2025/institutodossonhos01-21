# 🔧 Correção do Erro: evidence_required

## 🚨 Problema Identificado

**Erro:** `Could not find the 'evidence_required' column of 'user_goals' in the schema cache`

**Causa:** A coluna `evidence_required` não existe na tabela `user_goals` no Supabase, mas o código está tentando inserir dados com esse campo.

## ✅ Soluções Aplicadas

### 1. **Correção no Código Frontend**
- ✅ Adicionado campo `evidence_required: true` no estado inicial do `CreateGoalModal.tsx`
- ✅ Adicionado campo `evidence_required` no envio para o Supabase
- ✅ Adicionado campos de toggle para "Meta em Grupo" e "Evidências Obrigatórias"
- ✅ Corrigido `resetForm()` para incluir o campo

### 2. **Script SQL para Banco de Dados**
- ✅ Criado script `apply-evidence-required-fix.sql` para aplicar no Supabase
- ✅ Script adiciona colunas faltantes: `evidence_required`, `is_group_goal`, `transform_to_challenge`

## 🚀 Como Aplicar a Correção

### **Opção 1: Via Supabase Dashboard**
1. Acesse o [Supabase Dashboard](https://supabase.com/dashboard)
2. Vá para o projeto `hlrkoyywjpckdotimtik`
3. Acesse **SQL Editor**
4. Execute o script `apply-evidence-required-fix.sql`

### **Opção 2: Via Supabase CLI**
```bash
# Login no Supabase
supabase login

# Linkar projeto
supabase link --project-ref hlrkoyywjpckdotimtik

# Aplicar migrations
supabase db push
```

### **Opção 3: Execução Manual**
Execute este SQL diretamente no Supabase:

```sql
-- Adicionar coluna evidence_required
ALTER TABLE public.user_goals 
ADD COLUMN IF NOT EXISTS evidence_required BOOLEAN DEFAULT TRUE;

-- Adicionar coluna is_group_goal
ALTER TABLE public.user_goals 
ADD COLUMN IF NOT EXISTS is_group_goal BOOLEAN DEFAULT FALSE;

-- Adicionar coluna transform_to_challenge
ALTER TABLE public.user_goals 
ADD COLUMN IF NOT EXISTS transform_to_challenge BOOLEAN DEFAULT FALSE;
```

## 🔍 Verificação

Após aplicar a correção, verifique:

1. **Estrutura da Tabela:**
```sql
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'user_goals' 
ORDER BY ordinal_position;
```

2. **Teste de Criação de Meta:**
- Acesse a aplicação
- Tente criar uma nova meta
- Verifique se não há mais erros 400

## 📋 Campos Adicionados

| Campo | Tipo | Padrão | Descrição |
|-------|------|--------|-----------|
| `evidence_required` | BOOLEAN | TRUE | Se evidências são obrigatórias |
| `is_group_goal` | BOOLEAN | FALSE | Se é meta em grupo |
| `transform_to_challenge` | BOOLEAN | FALSE | Se pode virar desafio |

## 🎯 Resultado Esperado

Após a correção:
- ✅ Erro 400 desaparece
- ✅ Metas podem ser criadas normalmente
- ✅ Campos de toggle funcionam
- ✅ Interface completa disponível

## 📞 Suporte

Se o problema persistir:
1. Verifique logs do Supabase
2. Confirme se as colunas foram criadas
3. Teste com uma nova meta
4. Verifique políticas RLS 