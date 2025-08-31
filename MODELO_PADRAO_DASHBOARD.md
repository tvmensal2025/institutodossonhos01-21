# MODELO PADRÃO DO DASHBOARD - REGRA FIXA

## ⚠️ IMPORTANTE: ESTE É O MODELO OFICIAL E NÃO DEVE SER ALTERADO

Este documento define o modelo padrão do dashboard que deve ser mantido como regra e padrão.

## Componente Principal
- **Arquivo**: `src/components/ui/resizable-draggable-health-dashboard.tsx`
- **Nome**: `ResizableDraggableHealthDashboard`

## Características Obrigatórias

### 1. Funcionalidades de Interação
- ✅ **Arrastar**: Todos os gráficos devem ser arrastáveis
- ✅ **Redimensionar**: Handle no canto inferior direito para redimensionar
- ✅ **Posicionamento Livre**: Componentes podem ser posicionados livremente na tela

### 2. Componentes Inclusos
1. **Evolução dos Sintomas** (SymptomEvolutionChart)
   - Posição inicial: top-0 left-0
   - Tamanho inicial: 400x300px
   - Redimensionável e arrastável

2. **Roda da Saúde** (HealthWheel)
   - Posição inicial: top-0 right-0
   - Tamanho inicial: 450x450px
   - Redimensionável e arrastável

3. **Gráfico de Evolução Mensal** (LineChart)
   - Posição inicial: top-[400px] left-0
   - Tamanho inicial: 800x500px
   - Redimensionável e arrastável

### 3. Elementos Visuais Obrigatórios
- **Header em cada componente**: Fundo cinza com ícone e texto de instrução
- **Handle de redimensionamento**: Quadrado cinza no canto inferior direito
- **Animação de drag**: Scale 1.05 durante o arraste
- **Cursor apropriado**: move para arrastar, se-resize para redimensionar

### 4. Controles de Tamanho
- **Tamanhos mínimos**:
  - Sintomas: 300x200px
  - Roda: 300x300px
  - Gráfico: 400x300px
- **Sistema de estado**: useState para controlar width/height de cada componente

## Interface Props
```typescript
interface ResizableDraggableHealthDashboardProps {
  data: HealthSystemData[];
  totalScore: number;
  evolutionData?: EvolutionData[];
  title?: string;
  className?: string;
  size?: number;
  showHealthWheel?: boolean;
  showEvolutionChart?: boolean;
}
```

## Tecnologias Utilizadas
- **Framer Motion**: Para animações de drag
- **React State**: Para controle de tamanhos
- **Recharts**: Para gráficos
- **Tailwind CSS**: Para estilização

## ⚠️ REGRAS DE MODIFICAÇÃO
1. **NÃO** alterar a funcionalidade de arrastar
2. **NÃO** alterar a funcionalidade de redimensionar
3. **NÃO** remover os handles visuais
4. **NÃO** alterar os tamanhos mínimos
5. **SEMPRE** manter os 3 componentes principais

---
**Data de criação**: $(date)
**Status**: MODELO OFICIAL - NÃO ALTERAR