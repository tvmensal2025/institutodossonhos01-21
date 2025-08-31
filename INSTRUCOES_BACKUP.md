# Instruções para Restaurar o Backup

Este arquivo contém instruções sobre como restaurar o backup do projeto Health Nexus.

## Conteúdo do Backup

O arquivo `mission-health-nexus-84-backup.zip` contém:
- Todo o código fonte do projeto
- Arquivos de configuração
- Documentação
- Migrações do Supabase
- Testes automatizados

> Nota: As pastas `node_modules`, `dist` e `.git` não estão incluídas no backup.

## Como Restaurar

1. Descompacte o arquivo zip:
```bash
unzip mission-health-nexus-84-backup.zip
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
- Crie um arquivo `.env` na raiz do projeto
- Copie as variáveis necessárias do projeto original

4. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

## Estrutura do Projeto

O projeto está organizado da seguinte forma:
- `/src`: Código fonte React
- `/public`: Arquivos estáticos
- `/supabase`: Configurações e migrações do Supabase
- `/docs`: Documentação do projeto

## Personagens 3D

Os modelos 3D estão configurados para:
- Feminino: "female" (https://sketchfab.com/models/fe2c95ec93714e729becd46b2c37d3bb)
- Masculino: "met ue" (https://sketchfab.com/models/ebae6cc235c144cea4d46b3105f868a6)

## Acesso Mobile

Para acessar via celular:
1. Conecte o celular na mesma rede WiFi do computador
2. Acesse: http://192.168.15.5:8080
3. O servidor Vite deve estar configurado com `host: "0.0.0.0"`

## Suporte

Em caso de dúvidas ou problemas:
1. Verifique a documentação em `/docs`
2. Consulte os arquivos de teste para exemplos
3. Verifique as configurações do Supabase 