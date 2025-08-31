# Deploy na Lovable - Mission Health Nexus

## Configuração Atual

Este projeto está configurado para deploy na Lovable com as seguintes configurações:

### Arquivos de Configuração
- `lovable.json` - Configuração principal da Lovable
- `lovable.config.js` - Configurações específicas de build
- `.gitignore` - Arquivos ignorados pelo Git

### Scripts Disponíveis
- `npm run dev` - Desenvolvimento local
- `npm run build` - Build padrão
- `npm run build:prod` - Build para produção
- `npm run deploy` - Deploy para produção
- `npm run deploy:dev` - Deploy para desenvolvimento

## Variáveis de Ambiente

Configure as seguintes variáveis de ambiente na Lovable:

```env
VITE_SUPABASE_URL=sua_url_do_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase
VITE_OPENAI_API_KEY=sua_chave_da_openai
```

## Estrutura do Projeto

- `src/` - Código fonte da aplicação
- `public/` - Arquivos estáticos
- `dist/` - Build de produção (gerado automaticamente)

## Comandos de Deploy

1. **Deploy Automático**: A Lovable fará deploy automático quando houver push para a branch main
2. **Deploy Manual**: Use o painel da Lovable para fazer deploy manual
3. **Preview Deployments**: Cada pull request terá um preview deployment

## Resolução de Conflitos

- Arquivos de teste foram ignorados no deploy
- Configurações do Vercel foram movidas para backup
- Cache configurado para otimizar builds
- Timeout aumentado para builds complexos

## Monitoramento

- Logs disponíveis no painel da Lovable
- Métricas de performance automáticas
- Alertas de erro configurados

## Suporte

Para problemas com deploy, verifique:
1. Logs de build na Lovable
2. Variáveis de ambiente configuradas
3. Dependências instaladas corretamente
4. Arquivos ignorados no .gitignore 