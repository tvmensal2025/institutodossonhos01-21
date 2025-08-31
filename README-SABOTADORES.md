# 🧠 SISTEMA DE SABOTADORES DO EMAGRECIMENTO

## 📋 **VISÃO GERAL**

Sistema completo para identificação e análise dos **24 principais sabotadores mentais** que impedem o processo de emagrecimento. Baseado em psicologia comportamental e terapia cognitiva.

---

## 🚀 **COMO IMPLANTAR**

### **1. ESTRUTURA DE ARQUIVOS**

```
src/
├── components/
│   ├── assessment/
│   │   └── SabotadoresEmagrecimento.tsx    # Componente principal
│   └── admin/
│       └── ToolsManagement.tsx              # Gerenciamento admin
├── pages/
│   └── SabotadoresDemo.tsx                 # Página de demonstração
├── hooks/
│   └── useSabotadores.ts                   # Hook personalizado
├── types/
│   └── sabotadores.ts                      # Tipos TypeScript
├── utils/
│   └── sabotadoresCalculator.ts            # Cálculos e lógica
└── routes-config.ts                        # Configuração de rotas
```

### **2. DEPENDÊNCIAS NECESSÁRIAS**

```bash
# UI Components
npm install @radix-ui/react-slider @radix-ui/react-radio-group
npm install @radix-ui/react-checkbox @radix-ui/react-label
npm install @radix-ui/react-progress @radix-ui/react-badge
npm install @radix-ui/react-accordion @radix-ui/react-dialog
npm install @radix-ui/react-tabs

# Gráficos
npm install recharts

# Animações
npm install framer-motion

# Ícones
npm install lucide-react

# Notificações
npm install sonner

# Utilitários
npm install date-fns
```

### **3. CONFIGURAÇÃO DE ROTAS**

Adicione ao seu sistema de rotas:

```typescript
import { SABOTADORES_ROUTES } from './routes-config';

// Adicionar às suas rotas
{
  path: SABOTADORES_ROUTES.demo,
  element: <SabotadoresDemo />
}
```

---

## 🎯 **FUNCIONALIDADES IMPLEMENTADAS**

### **✅ Sistema Completo de 24 Sabotadores**

#### **📦 COMPORTAMENTAIS:**
- **Sabotador das Roupas** - Apego a roupas antigas e medo de mudança
- **Sabotador do Dinheiro** - Associação dinheiro = comida
- **Válvula de Escape** - Comida como escape emocional
- **Prazer da Comida** - Comida como único prazer

#### **🧠 PSICOLÓGICOS:**
- **Crítico Interno** - Voz negativa interna
- **Boazinha Demais** - Dificuldade em dizer não
- **Falta de Crenças** - Descrença no próprio potencial
- **Apego à Autoimagem** - Medo de mudança

#### **👥 RELACIONAIS:**
- **Problemas com Cônjuge** - Ciúmes e insegurança
- **Proteção dos Filhos** - Negligência própria
- **Fuga Afetiva** - Peso como barreira emocional
- **Comida como Afeto** - Amor associado à comida

#### **🏃 FÍSICOS:**
- **Atividade Física** - Aversão ao exercício
- **Crença Contrária** - Dieta como tortura
- **Tamanho como Fortaleza** - Peso como proteção

#### **🕰️ TEMPORAIS:**
- **Estranheza da Mudança** - Incomodidade com mudanças
- **Magreza da Infância** - Traumas da infância
- **Perdas no Presente** - Luto e tristeza atual
- **Perdas na Infância** - Traumas infantis

#### **💰 SOCIOECONÔMICOS:**
- **Obesidade como Riqueza** - Peso = prosperidade
- **Biotipo e Identidade** - Identidade ligada ao peso
- **Fuga da Beleza** - Medo de ser bonito(a)

### **✅ Tipos de Perguntas Suportados**

1. **Escala (1-10)** - Com rótulos personalizáveis
2. **Múltipla Escolha** - Seleção única ou múltipla
3. **Matriz** - Tabela com linhas e colunas
4. **Seleção de Imagens** - Carrossel ou grid
5. **Desenho** - Canvas com ferramentas

### **✅ Sistema de Lixeira de Segurança**

- **Mover para Lixeira** - Exclusão temporária
- **Restaurar** - Recuperação de perguntas
- **Excluir Definitivamente** - Remoção permanente
- **Lixeira de Segurança** - Evita perda acidental

### **✅ Cálculo Inteligente**

```typescript
// Exemplo de cálculo
const scores = calcularSabotadores(respostas, perguntasAtivas);
// Retorna: { roupas: 75, dinheiro: 60, critico: 85, ... }
```

### **✅ Dicas Personalizadas**

Cada sabotador tem:
- **Resumo** - Explicação do comportamento
- **Como Superar** - Estratégias específicas

---

## 🎨 **INTERFACE E DESIGN**

### **✅ Design Netflix**
- Cores e tipografia consistentes
- Animações suaves com Framer Motion
- Componentes Radix UI
- Responsivo para mobile

### **✅ Visualizações**
- **Gráfico de Barras** - Comparação entre categorias
- **Gráfico de Radar** - Visão geral dos sabotadores
- **Gauge Charts** - Intensidade de cada sabotador
- **Progress Bar** - Progresso em tempo real

### **✅ Funcionalidades UX**
- **Salvamento Automático** - Progresso persistente
- **Navegação Flexível** - Anterior/Próxima
- **Resultados Detalhados** - Análise completa
- **Recomendações Personalizadas** - Baseadas nos scores

---

## 📊 **BANCO DE DADOS**

### **Tabelas Criadas:**

1. **`sabotadores_assessments`** - Avaliações completas
2. **`sabotadores_responses`** - Respostas individuais
3. **`sabotadores_questions`** - Configuração das perguntas
4. **`sabotadores_config`** - Configuração dos 24 sabotadores
5. **`sabotadores_usage_log`** - Histórico de uso

### **Segurança RLS:**
- Usuários veem apenas suas avaliações
- Admins podem gerenciar tudo
- Configuração pública para leitura

---

## 🔧 **CONFIGURAÇÃO AVANÇADA**

### **Personalizar Perguntas:**

```typescript
// Em SabotadoresEmagrecimento.tsx
const questions: Question[] = [
  {
    id: 1,
    text: "Sua pergunta personalizada",
    type: "scale",
    category: "Emocional",
    required: true,
    options: {
      min: 1,
      max: 10,
      min_label: "Nunca",
      max_label: "Sempre"
    }
  }
];
```

### **Personalizar Sabotadores:**

```typescript
// Em sabotadoresCalculator.ts
const dicas = {
  seu_sabotador: {
    resumo: "Descrição do seu sabotador",
    comoSuperar: "Estratégias para superar"
  }
};
```

### **Personalizar Cálculos:**

```typescript
// Em sabotadoresCalculator.ts
export const calcularSabotadores = (respostas, perguntasAtivas) => {
  // Sua lógica personalizada aqui
  return scores;
};
```

---

## 🚀 **DEPLOYMENT**

### **1. Preparar Arquivos**
```bash
# Copiar todos os arquivos para seu projeto
cp -r sabotadores/* src/
```

### **2. Instalar Dependências**
```bash
npm install recharts framer-motion lucide-react sonner date-fns
npm install @radix-ui/react-*
```

### **3. Executar Migrações**
```sql
-- No Supabase SQL Editor
-- Executar supabase-migrations.sql
```

### **4. Configurar Rotas**
```typescript
// Adicionar ao seu router
import { SabotadoresDemo } from './pages/SabotadoresDemo';

{
  path: '/sabotadores-demo',
  element: <SabotadoresDemo />
}
```

### **5. Testar**
```bash
npm run dev
# Acessar: http://localhost:5173/sabotadores-demo
```

---

## 📈 **MÉTRICAS E ANALYTICS**

### **Dados Coletados:**
- **Avaliações Completadas** - Quantidade e frequência
- **Tempo de Resposta** - Duração por pergunta
- **Sabotadores Mais Identificados** - Ranking dos mais comuns
- **Taxa de Abandono** - Onde os usuários param
- **Exportações** - Relatórios baixados

### **Relatórios Disponíveis:**
- **Relatório Executivo** - Resumo dos resultados
- **Análise Detalhada** - Insights profundos
- **Plano de Ação** - Estratégias personalizadas

---

## 🔒 **SEGURANÇA**

### **✅ Implementado:**
- **Row Level Security (RLS)** - Usuários veem apenas seus dados
- **Autenticação Obrigatória** - Para salvar resultados
- **Validação de Dados** - Tipos TypeScript
- **Sanitização** - Limpeza de inputs
- **Logs de Auditoria** - Histórico de ações

---

## 🎯 **CASOS DE USO**

### **Para Usuários:**
1. **Acessar** `/sabotadores-demo`
2. **Responder** 5 perguntas de demonstração
3. **Ver resultados** com gráficos e insights
4. **Receber recomendações** personalizadas
5. **Exportar relatório** em PDF

### **Para Admins:**
1. **Acessar** painel administrativo
2. **Criar ferramenta** automaticamente
3. **Configurar perguntas** personalizadas
4. **Visualizar métricas** de uso
5. **Gerenciar** configurações

---

## 🆘 **SUPORTE E MANUTENÇÃO**

### **Logs Importantes:**
```typescript
// Verificar logs no console
console.log('🔍 calculateResults chamado');
console.log('✅ Usuário autenticado:', user.email);
console.log('❌ Erro do Supabase:', error);
```

### **Debugging:**
1. **Verificar autenticação** - `useAuth()`
2. **Verificar banco** - Supabase Dashboard
3. **Verificar rotas** - React Router DevTools
4. **Verificar estado** - React DevTools

---

## 📞 **CONTATO E SUPORTE**

Para dúvidas sobre a implementação:
- **Documentação**: Este README
- **Código**: Arquivos fornecidos
- **Exemplo**: `/sabotadores-demo`

---

## 🎉 **PRONTO PARA USAR!**

O sistema está **100% funcional** e pronto para ser integrado ao seu projeto. Todas as funcionalidades foram testadas e documentadas.

**🚀 Boa sorte com sua implementação!** 