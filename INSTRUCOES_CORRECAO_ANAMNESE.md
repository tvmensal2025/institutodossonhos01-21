# 🩺 INSTRUÇÕES PARA CORRIGIR O ERRO DA ANAMNESE

## ⚠️ PROBLEMA IDENTIFICADO

O erro que está ocorrendo ao salvar a anamnese é:

```
Could not find the 'chronic_diseases' column of 'user_anamnesis' in the schema cache
```

Este erro ocorre porque a coluna `chronic_diseases` não está sendo encontrada na tabela `user_anamnesis` ou está com um tipo de dado incompatível.

## 🛠️ SOLUÇÃO

Criamos dois scripts SQL para corrigir o problema:

### 1️⃣ Solução Completa (Recomendada)

O arquivo `corrigir-anamnese-final.sql` recria toda a tabela `user_anamnesis` com a estrutura correta:
- Remove as colunas desnecessárias (peso atual, altura, cidade/estado)
- Define tipos de dados corretos para todas as colunas
- Configura as políticas de RLS (Row Level Security)
- Adiciona comentários para documentação

### 2️⃣ Solução Rápida (Alternativa)

O arquivo `corrigir-coluna-chronic-diseases.sql` corrige apenas a coluna específica que está causando o erro:
- Verifica se a coluna existe
- Altera o tipo da coluna para JSONB com valor padrão `[]`
- Não afeta outras colunas ou dados

## 📋 COMO APLICAR A CORREÇÃO

### Opção 1: Correção Completa

1. Acesse o **Dashboard do Supabase**
2. Vá para a seção **SQL Editor**
3. Copie e cole o conteúdo do arquivo `corrigir-anamnese-final.sql`
4. Clique em **Run** para executar o script
5. Verifique se não há erros na execução

### Opção 2: Correção Rápida

1. Acesse o **Dashboard do Supabase**
2. Vá para a seção **SQL Editor**
3. Copie e cole o conteúdo do arquivo `corrigir-coluna-chronic-diseases.sql`
4. Clique em **Run** para executar o script
5. Verifique se não há erros na execução

## ✅ VERIFICAÇÃO

Após aplicar uma das soluções:

1. Tente preencher e salvar a anamnese novamente
2. Verifique se o erro não ocorre mais
3. Confirme se os dados estão sendo salvos corretamente na tabela

## 📝 OBSERVAÇÕES IMPORTANTES

- A solução completa é mais robusta, mas recria a tabela (os dados existentes serão perdidos)
- A solução rápida mantém os dados existentes, mas corrige apenas o problema específico
- Escolha a solução que melhor se adapta ao seu cenário atual

## 🔄 PRÓXIMOS PASSOS

Após corrigir o problema da anamnese:

1. Verifique se todas as funcionalidades estão operando corretamente
2. Teste o preenchimento completo do formulário
3. Confirme se os dados estão sendo corretamente utilizados pelo Dr. Vital e Sofia

---

**Desenvolvido por: Instituto dos Sonhos**
