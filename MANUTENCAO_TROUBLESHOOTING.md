# 🔧 GUIA DE MANUTENÇÃO E TROUBLESHOOTING

**Sistema Sofia Nutricional**  
**Versão**: 2.1.0  
**Data**: 16 de Janeiro de 2025  

---

## 🚨 PROBLEMAS COMUNS E SOLUÇÕES

### 1. 🔐 Problemas de Autenticação

#### Erro: "Google OAuth não funciona"
```bash
# Verificar configuração no Supabase
supabase secrets list | grep GOOGLE

# Solução:
1. Verificar GOOGLE_CLIENT_ID no .env
2. Confirmar redirect URI no Google Console
3. Verificar domínio autorizado
```

#### Erro: "Sessão expirada"
```typescript
// Verificar refresh token
const { data: { session } } = await supabase.auth.getSession()
if (!session) {
  // Redirecionar para login
  router.push('/auth')
}
```

### 2. 🤖 Problemas com Sofia IA

#### Erro: "Sofia não responde"
```bash
# Verificar Edge Function
supabase functions logs sofia-chat --follow

# Verificar OpenAI API
curl -X POST https://api.openai.com/v1/chat/completions \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"model":"gpt-4","messages":[{"role":"user","content":"test"}]}'
```

#### Erro: "Análise de imagem falha"
```bash
# Verificar Google Vision API
1. Confirmar GOOGLE_VISION_API_KEY
2. Verificar quota de requisições
3. Testar endpoint diretamente
```

### 3. 📊 Problemas de Dashboard

#### Gráficos não carregam
```typescript
// Verificar dados do usuário
const { data: userData } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', user.id)
  .single()

// Verificar se há dados para exibir
if (!userData || !userData.weight_history) {
  // Mostrar mensagem de dados insuficientes
}
```

#### Métricas não atualizam
```bash
# Verificar real-time subscriptions
supabase realtime list

# Reiniciar subscription se necessário
supabase realtime restart
```

### 4. 🍽️ Problemas de Refeições

#### Plano não gera
```bash
# Verificar Edge Function
supabase functions logs generate-meal-plan --follow

# Verificar dados do usuário
SELECT * FROM user_preferences WHERE user_id = 'user-uuid';
SELECT * FROM user_goals WHERE user_id = 'user-uuid';
```

#### Cálculo nutricional incorreto
```bash
# Verificar dados TACO
SELECT * FROM food_items WHERE name ILIKE '%arroz%';

# Verificar integração
curl -X POST https://api.mealie.io/api/recipes \
  -H "Authorization: Bearer $MEALIE_API_KEY"
```

### 5. 🔄 Problemas de Sincronização Google Fit

#### Dados não sincronizam
```bash
# Verificar tokens
SELECT * FROM google_fit_tokens WHERE user_id = 'user-uuid';

# Verificar permissões
1. Confirmar escopos autorizados
2. Verificar se tokens não expiraram
3. Testar API diretamente
```

#### Erro de autorização
```typescript
// Verificar se usuário habilitou Google Fit
const { data: profile } = await supabase
  .from('profiles')
  .select('google_fit_enabled')
  .eq('id', user.id)
  .single()

if (!profile?.google_fit_enabled) {
  // Redirecionar para configuração
}
```

---

## 🛠️ MANUTENÇÃO ROTINEIRA

### 1. 📅 Backup Diário

#### Backup Automático
```bash
# Verificar se backup está funcionando
supabase db dump --data-only > backup_$(date +%Y%m%d).sql

# Verificar tamanho do backup
ls -lh backup_*.sql

# Limpar backups antigos (manter últimos 7 dias)
find . -name "backup_*.sql" -mtime +7 -delete
```

#### Backup Manual
```bash
# Backup completo
supabase db dump > full_backup_$(date +%Y%m%d_%H%M%S).sql

# Backup apenas dados
supabase db dump --data-only > data_backup_$(date +%Y%m%d_%H%M%S).sql

# Backup apenas estrutura
supabase db dump --schema-only > schema_backup_$(date +%Y%m%d_%H%M%S).sql
```

### 2. 🔍 Monitoramento de Performance

#### Verificar Logs
```bash
# Logs de Edge Functions
supabase functions logs --follow

# Logs de banco de dados
supabase db logs --follow

# Logs de autenticação
supabase auth logs --follow
```

#### Métricas de Performance
```bash
# Verificar queries lentas
SELECT query, mean_time, calls 
FROM pg_stat_statements 
ORDER BY mean_time DESC 
LIMIT 10;

# Verificar uso de disco
SELECT schemaname, tablename, pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables 
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

### 3. 🧹 Limpeza de Dados

#### Limpar dados antigos
```sql
-- Limpar conversas antigas (mais de 30 dias)
DELETE FROM sofia_conversations 
WHERE created_at < NOW() - INTERVAL '30 days';

-- Limpar dados Google Fit antigos (mais de 90 dias)
DELETE FROM google_fit_data 
WHERE date < NOW() - INTERVAL '90 days';

-- Limpar logs de erro antigos
DELETE FROM error_logs 
WHERE created_at < NOW() - INTERVAL '7 days';
```

#### Otimizar tabelas
```sql
-- Vacuum e analyze
VACUUM ANALYZE;

-- Reindexar tabelas grandes
REINDEX TABLE sofia_conversations;
REINDEX TABLE google_fit_data;
```

### 4. 🔄 Atualizações

#### Atualizar Edge Functions
```bash
# Deploy todas as funções
supabase functions deploy

# Deploy função específica
supabase functions deploy sofia-chat

# Verificar status
supabase functions list
```

#### Atualizar Frontend
```bash
# Build de produção
npm run build

# Deploy para Vercel
vercel --prod

# Verificar deploy
vercel ls
```

---

## 🚀 PROCEDIMENTOS DE EMERGÊNCIA

### 1. 🔥 Sistema Indisponível

#### Verificar Status
```bash
# Verificar Supabase
supabase status

# Verificar Edge Functions
supabase functions list

# Verificar banco de dados
supabase db ping
```

#### Restaurar Serviços
```bash
# Reiniciar Edge Functions
supabase functions restart

# Reiniciar real-time
supabase realtime restart

# Verificar logs de erro
supabase logs --follow
```

### 2. 💾 Perda de Dados

#### Restaurar Backup
```bash
# Restaurar backup mais recente
supabase db reset
psql -h db.supabase.co -U postgres -d postgres < backup_20250116.sql

# Verificar integridade
supabase db diff
```

#### Verificar Integridade
```sql
-- Verificar relacionamentos
SELECT COUNT(*) FROM profiles;
SELECT COUNT(*) FROM sofia_conversations;
SELECT COUNT(*) FROM meal_plans;

-- Verificar dados críticos
SELECT * FROM profiles WHERE id = 'user-uuid';
```

### 3. 🔐 Comprometimento de Segurança

#### Bloquear Acesso
```bash
# Desabilitar autenticação temporariamente
supabase auth disable

# Revogar tokens
supabase auth revoke --all
```

#### Investigar
```bash
# Verificar logs de acesso
supabase auth logs --follow

# Verificar tentativas de login
SELECT * FROM auth.audit_log_entries 
WHERE created_at > NOW() - INTERVAL '1 hour';
```

---

## 📋 CHECKLIST DE MANUTENÇÃO

### Diário
- [ ] Verificar logs de erro
- [ ] Confirmar backup automático
- [ ] Verificar métricas de performance
- [ ] Monitorar uso de API keys

### Semanal
- [ ] Revisar logs de segurança
- [ ] Verificar espaço em disco
- [ ] Otimizar queries lentas
- [ ] Atualizar dependências

### Mensal
- [ ] Backup completo manual
- [ ] Revisão de permissões
- [ ] Análise de performance
- [ ] Limpeza de dados antigos

### Trimestral
- [ ] Atualização de segurança
- [ ] Revisão de arquitetura
- [ ] Otimização de custos
- [ ] Planejamento de melhorias

---

## 📞 CONTATOS DE SUPORTE

### Equipe Técnica
- **Desenvolvedor Principal**: Rafael
- **DevOps**: Supabase Support
- **Frontend**: Vercel Support
- **APIs**: OpenAI, Google Cloud

### Recursos
- **Documentação**: README.md
- **Issues**: GitHub Issues
- **Chat**: Discord/Slack
- **Email**: suporte@institutodossonhos.com

---

## 🔮 PRÓXIMAS MELHORIAS

### Performance
- [ ] Implementar cache Redis
- [ ] Otimizar queries complexas
- [ ] CDN para imagens
- [ ] Lazy loading de componentes

### Segurança
- [ ] 2FA para usuários
- [ ] Rate limiting avançado
- [ ] Auditoria completa
- [ ] Criptografia adicional

### Funcionalidades
- [ ] Machine Learning
- [ ] IoT Integration
- [ ] Voice Assistant
- [ ] Social Features

---

**✅ SISTEMA ESTÁVEL E FUNCIONANDO PERFEITAMENTE**

*Este guia deve ser consultado regularmente para manutenção preventiva.*
