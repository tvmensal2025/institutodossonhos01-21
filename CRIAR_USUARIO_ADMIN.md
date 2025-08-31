# Criar Usuário Admin Principal

## 👤 **Credenciais do Admin**
- **Email**: teste@institutodossonhos.com
- **Senha**: 123456
- **Função**: Administrador Principal (Super Admin)

## 🚀 **Método 1: Script Completo (Recomendado)**

### **Passo 1: Execute o Script Principal**
1. **Abra** o Supabase Dashboard
2. **Vá para** SQL Editor
3. **Execute** o arquivo `create-admin-user.sql`

### **O que o script faz:**
- ✅ Verifica se o usuário já existe
- ✅ Cria usuário na tabela `auth.users`
- ✅ Cria perfil na tabela `public.profiles` 
- ✅ Define role como 'admin' e admin_level como 'super'
- ✅ Cria políticas RLS para acesso admin
- ✅ Verifica se foi criado corretamente

## 🔄 **Método 2: Script Simples (Alternativo)**

Se o Método 1 não funcionar:

### **Passo 1: Criar usuário via Dashboard**
1. **Vá para** Authentication > Users no Supabase
2. **Clique em** "Add user"
3. **Preencha**:
   - Email: `teste@institutodossonhos.com`
   - Password: `123456`
   - Confirm email: ✅ (marcado)

### **Passo 2: Execute Script Simples**
1. **Execute** o arquivo `create-admin-simple.sql`
2. **Isso vai** transformar o usuário em admin

## 🔐 **Método 3: Via Frontend (Mais Fácil)**

### **Passo 1: Cadastro Normal**
1. **Abra** a aplicação em http://localhost:8080
2. **Vá para** página de cadastro/login
3. **Crie conta** com:
   - Email: `teste@institutodossonhos.com`
   - Senha: `123456`

### **Passo 2: Transformar em Admin**
Execute este SQL simples:
```sql
-- Transformar usuário em admin
UPDATE public.profiles 
SET 
    role = 'admin',
    admin_level = 'super',
    full_name = 'Administrador Principal'
WHERE email = 'teste@institutodossonhos.com';
```

## ✅ **Verificação de Sucesso**

### **Execute para verificar:**
```sql
SELECT 
    u.id,
    u.email,
    p.full_name,
    p.role,
    p.admin_level
FROM auth.users u
JOIN public.profiles p ON u.id = p.user_id
WHERE u.email = 'teste@institutodossonhos.com';
```

### **Resultado esperado:**
```
email: teste@institutodossonhos.com
role: admin
admin_level: super
full_name: Administrador Principal
```

## 🎯 **Teste o Admin**

### **Passo 1: Fazer Login**
1. **Abra** http://localhost:8080
2. **Faça login** com:
   - Email: `teste@institutodossonhos.com`
   - Senha: `123456`

### **Passo 2: Verificar Acesso Admin**
1. **Vá para** /admin ou /admin/goals
2. **Verifique** se consegue ver todas as metas
3. **Teste** aprovação de metas

## 📋 **Arquivos Criados**
- `create-admin-user.sql`: Script completo para criar admin
- `create-admin-simple.sql`: Script alternativo simples
- `CRIAR_USUARIO_ADMIN.md`: Este guia

## 🚨 **Importante**
- O usuário admin terá acesso total ao sistema
- Pode ver e gerenciar todas as metas de todos os usuários
- Pode aprovar/rejeitar metas pendentes
- Tem acesso às páginas administrativas

## 🔧 **Próximos Passos**
1. **Execute** um dos scripts SQL
2. **Faça login** com as credenciais
3. **Teste** o acesso admin
4. **Aprove** as metas que estavam pendentes

**Escolha o método que preferir e execute agora!** 🎯