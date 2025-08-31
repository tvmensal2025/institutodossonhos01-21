# 🎭 Sofia Mobile Tutorial - Documentação Completa

## 🌟 Visão Geral

O **Sofia Mobile Tutorial** é um sistema de onboarding elegante e responsivo para novos usuários da plataforma Instituto dos Sonhos. Com design mobile-first e Sofia como Conselheira dos Sonhos, o tutorial guia usuários por todas as funcionalidades principais.

## ✨ Características

- **🎨 Design Premium**: Estilo Netflix + Instituto dos Sonhos
- **📱 Mobile-First**: 100% otimizado para dispositivos móveis
- **🤖 Sofia Interativa**: Conselheira dos Sonhos guiando cada passo
- **🎭 Animações Suaves**: Framer Motion para transições elegantes
- **👆 Gestos Touch**: Suporte completo para swipe e tap
- **🔄 Progress Bar**: Indicador visual do progresso
- **⚡ Performance**: Otimizado para dispositivos móveis

## 🚀 Instalação

### 1. Dependências Necessárias

```bash
npm install framer-motion lucide-react
```

### 2. Importar Componentes

```typescript
import { SofiaMobileTutorial } from '@/components/onboarding';
```

### 3. Importar Estilos

```typescript
import '@/styles/interactive-tutorial.css';
```

## 📱 Como Usar

### Uso Básico

```typescript
import React, { useState } from 'react';
import { SofiaMobileTutorial } from '@/components/onboarding';

const App = () => {
  const [showTutorial, setShowTutorial] = useState(false);

  const userData = {
    name: 'Nome do Usuário',
    experience: 'beginner',
    goals: ['meta 1', 'meta 2']
  };

  return (
    <div>
      {/* Seu App normal */}
      
      {/* Tutorial da Sofia */}
      {showTutorial && (
        <SofiaMobileTutorial
          isOpen={showTutorial}
          onClose={() => setShowTutorial(false)}
          userData={userData}
        />
      )}
    </div>
  );
};
```

### Uso com Hook Personalizado

```typescript
import { useSofiaTutorial } from '@/examples/SofiaTutorialUsage';

const App = () => {
  const { 
    showTutorial, 
    startTutorial, 
    closeTutorial 
  } = useSofiaTutorial();

  return (
    <div>
      <button onClick={startTutorial}>
        🚀 Começar Tutorial
      </button>
      
      {showTutorial && (
        <SofiaMobileTutorial
          isOpen={showTutorial}
          onClose={closeTutorial}
          userData={userData}
        />
      )}
    </div>
  );
};
```

## 🎯 Estrutura dos Passos

### Passo 1: Apresentação Mágica ✅
- Sofia se apresenta como Conselheira dos Sonhos
- Explica o propósito da plataforma
- Mensagem motivacional e acolhedora

### Próximos Passos (a implementar):
- **Passo 2**: Pesar e Progresso
- **Passo 3**: Dashboard Principal
- **Passo 4**: Missões e Gamificação
- **Passo 5**: Perfil e Configurações
- **Passo 6**: Cardápios - Criação
- **Passo 7**: Cardápios - Histórico
- **Passo 8**: Sofia Chat
- **Passo 9**: Dr. Vital
- **Passo 10**: Cursos Premium

## 🎨 Personalização

### Cores e Temas

```css
/* Variáveis CSS personalizáveis */
:root {
  --sofia-primary: #8B5CF6;      /* Roxo Sofia */
  --sofia-secondary: #10B981;    /* Verde Nutrição */
  --sofia-accent: #F59E0B;       /* Dourado Celebração */
  --sofia-bg: rgba(139, 92, 246, 0.05);
  --sofia-border: rgba(139, 92, 246, 0.2);
}
```

### Animações

```typescript
// Personalizar animações
const customAnimations = {
  initial: { opacity: 0, y: 50 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -50 },
  transition: { duration: 0.5 }
};
```

## 📱 Responsividade

### Breakpoints Suportados

- **Mobile**: 320px - 480px
- **Tablet**: 481px - 768px
- **Desktop**: 769px+

### Otimizações Mobile

- Botões com tamanho mínimo de 44px
- Espaçamento adequado para dedos
- Gestos touch intuitivos
- Layout vertical otimizado

## 🔧 Configuração Avançada

### Persistência de Estado

```typescript
// Salvar progresso no localStorage
localStorage.setItem('sofia-tutorial-completed', 'true');
localStorage.setItem('sofia-tutorial-step', '5');

// Recuperar progresso
const completed = localStorage.getItem('sofia-tutorial-completed');
const currentStep = localStorage.getItem('sofia-tutorial-step');
```

### Integração com Analytics

```typescript
// Rastrear progresso do tutorial
const trackTutorialProgress = (step: number) => {
  analytics.track('tutorial_step_completed', {
    step,
    platform: 'mobile',
    user_id: user.id
  });
};
```

## 🎭 Componentes Disponíveis

### SofiaMobileTutorial
Componente principal do tutorial

### SofiaMobileHeader
Header com progress bar e botão fechar

### SofiaMobileNavigation
Navegação entre passos

### WelcomeStepMobile
Primeiro passo implementado

## 🚀 Próximos Passos

1. **Implementar** os outros 9 passos
2. **Adicionar** funcionalidades interativas
3. **Integrar** com sistema de gamificação
4. **Testar** em diferentes dispositivos
5. **Otimizar** performance e acessibilidade

## 📞 Suporte

Para dúvidas ou sugestões sobre o tutorial da Sofia:

- **Email**: suporte@institutodossonhos.com.br
- **Documentação**: Este arquivo README
- **Issues**: Criar issue no repositório

## 🎉 Agradecimentos

Desenvolvido com ❤️ para transformar a experiência de onboarding dos usuários do Instituto dos Sonhos.

---

**Sofia - Conselheira dos Sonhos** 🌟✨
