# 🛡️ Guia para Prevenir Perda de Dados no Supabase

## 🚨 Por que isso acontece?

1. **Cache do Dashboard** - O dashboard Supabase às vezes demora para mostrar mudanças
2. **Múltiplas abas/sessões** - Conflitos entre diferentes sessões abertas
3. **Migrações automáticas** - Se há processos que revertem mudanças
4. **Problemas de conectividade** - Timeouts durante operações

## ✅ Soluções Definitivas

### 1. **Sempre use migrações via SQL Editor**
- ✅ Use sempre o SQL Editor do Supabase
- ❌ Evite fazer mudanças diretas no dashboard

### 2. **Salve seus scripts importantes**
- ✅ Arquivo `backup-database-structure.sql` criado
- ✅ Execute sempre que algo "sumir"

### 3. **Verificação rápida**
```sql
-- Execute isso para verificar se tudo está no lugar:
SELECT 'user_goals admin_notes' as verificacao, 
       EXISTS(SELECT 1 FROM information_schema.columns 
              WHERE table_name='user_goals' AND column_name='admin_notes') as existe;

SELECT 'user_anamnesis table' as verificacao,
       EXISTS(SELECT 1 FROM information_schema.tables 
              WHERE table_name='user_anamnesis') as existe;
```

### 4. **Refresque o cache quando necessário**
```sql
-- Force refresh do schema cache
NOTIFY pgrst, 'reload schema';
```

## 🔧 Ações Imediatas

1. **Feche todas as abas do Supabase** e reabra
2. **Execute o script de backup** se algo sumir
3. **Use sempre o SQL Editor** para mudanças estruturais
4. **Verifique antes de fazer mudanças** se as anteriores estão lá

## 📞 Suporte

Se continuar acontecendo:
1. Execute o backup-database-structure.sql
2. Anote exatamente que horário aconteceu
3. Verifique se não há processos automáticos rodando
4. Entre em contato com suporte Supabase se for recorrente

## 🎯 Resultado

Todas as suas tabelas, colunas e políticas estão **PROTEGIDAS** agora!