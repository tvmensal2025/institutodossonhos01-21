# 🎯 Guia de Uso do Boneco (PersonIcon) - Mission Health Nexus

## 📋 Visão Geral

O componente `PersonIcon` foi criado para representar visualmente o usuário em todos os gráficos do sistema de saúde. O boneco serve como um elemento visual consistente que conecta os dados de saúde ao usuário real.

## 🎨 Componentes Disponíveis

### 1. **PersonIcon** - Boneco Principal
```tsx
import { PersonIcon } from '@/components/ui/person-icon';

// Uso básico
<PersonIcon size="md" variant="filled" color="#F97316" />

// Com gênero específico
<PersonIcon size="lg" variant="gradient" gender="male" />
```

**Props:**
- `size`: 'sm' | 'md' | 'lg' | 'xl'
- `color`: string (cor personalizada)
- `variant`: 'outline' | 'filled' | 'gradient'
- `gender`: 'male' | 'female' | 'neutral'

### 2. **BodyCompositionIcon** - Ícones de Composição Corporal
```tsx
import { BodyCompositionIcon } from '@/components/ui/person-icon';

// Para gordura corporal
<BodyCompositionIcon type="fat" size="md" />

// Para massa muscular
<BodyCompositionIcon type="muscle" size="md" />

// Para água corporal
<BodyCompositionIcon type="water" size="md" />

// Para massa óssea
<BodyCompositionIcon type="bone" size="md" />
```

### 3. **HealthIndicatorIcon** - Indicadores de Saúde
```tsx
import { HealthIndicatorIcon } from '@/components/ui/person-icon';

// Status de saúde
<HealthIndicatorIcon status="excellent" size="md" />
<HealthIndicatorIcon status="good" size="md" />
<HealthIndicatorIcon status="warning" size="md" />
<HealthIndicatorIcon status="danger" size="md" />
```

## 📊 Implementação nos Gráficos

### Gráfico de Evolução do Peso
```tsx
<Card>
  <CardHeader>
    <CardTitle className="flex items-center gap-2">
      <PersonIcon size="md" variant="filled" color="#F97316" />
      <span>Evolução do Peso</span>
    </CardTitle>
  </CardHeader>
  <CardContent>
    <div className="flex items-center gap-4 mb-4">
      <PersonIcon size="lg" variant="gradient" color="#F97316" />
      <div className="flex-1">
        <p className="text-sm text-muted-foreground">
          Seu progresso de peso ao longo do tempo
        </p>
        <p className="text-xs text-muted-foreground">
          O boneco representa você e sua jornada de saúde
        </p>
      </div>
    </div>
    {/* Gráfico aqui */}
  </CardContent>
</Card>
```

### Gráfico de Composição Corporal
```tsx
<Card>
  <CardHeader>
    <CardTitle className="flex items-center gap-2">
      <PersonIcon size="md" variant="filled" color="#10B981" />
      <span>Composição Corporal</span>
    </CardTitle>
  </CardHeader>
  <CardContent>
    <div className="flex items-center gap-4 mb-4">
      <PersonIcon size="lg" variant="gradient" color="#10B981" />
      <div className="flex-1">
        <p className="text-sm text-muted-foreground">
          Análise detalhada da composição do seu corpo
        </p>
        <p className="text-xs text-muted-foreground">
          Cada componente é representado por cores diferentes
        </p>
      </div>
    </div>
    
    {/* Ícones de composição corporal */}
    <div className="grid grid-cols-2 gap-2 mb-4">
      <BodyCompositionIcon type="fat" size="sm" />
      <BodyCompositionIcon type="muscle" size="sm" />
      <BodyCompositionIcon type="water" size="sm" />
    </div>
    
    {/* Gráfico aqui */}
  </CardContent>
</Card>
```

### Gráfico de IMC com Indicador de Saúde
```tsx
<Card>
  <CardHeader>
    <CardTitle className="flex items-center gap-2">
      <PersonIcon size="md" variant="filled" color="#3B82F6" />
      <span>Evolução do IMC</span>
    </CardTitle>
  </CardHeader>
  <CardContent>
    <div className="flex items-center gap-4 mb-4">
      <PersonIcon size="lg" variant="gradient" color="#3B82F6" />
      <div className="flex-1">
        <p className="text-sm text-muted-foreground">
          Índice de Massa Corporal ao longo do tempo
        </p>
        <p className="text-xs text-muted-foreground">
          Acompanhe sua saúde através do IMC
        </p>
      </div>
    </div>
    
    {/* Indicador de saúde baseado no IMC */}
    <div className="mb-4">
      <HealthIndicatorIcon 
        status={
          imc < 18.5 ? 'warning' :
          imc >= 18.5 && imc < 25 ? 'excellent' :
          imc >= 25 && imc < 30 ? 'good' :
          'danger'
        }
        size="md"
      />
    </div>
    
    {/* Gráfico aqui */}
  </CardContent>
</Card>
```

## 🎨 Esquema de Cores

### Cores por Tipo de Gráfico
- **Peso**: `#F97316` (Laranja)
- **Composição Corporal**: `#10B981` (Verde)
- **IMC**: `#3B82F6` (Azul)
- **Idade Metabólica**: `#8B5CF6` (Roxo)

### Cores por Gênero
- **Masculino**: `#3B82F6` (Azul)
- **Feminino**: `#EC4899` (Rosa)
- **Neutro**: `#6B7280` (Cinza)

### Cores por Status de Saúde
- **Excelente**: `#10B981` (Verde)
- **Bom**: `#3B82F6` (Azul)
- **Atenção**: `#F59E0B` (Amarelo)
- **Crítico**: `#EF4444` (Vermelho)

## 🔧 Componentes Atualizados

### ✅ Gráficos com Boneco Implementado:
1. **WeightHistoryCharts.tsx** - Gráficos de histórico de peso
2. **DashboardOverview.tsx** - Visão geral do dashboard
3. **ProgressCharts.tsx** - Gráficos de progresso
4. **Dashboard.tsx** - Dashboard principal
5. **BioimpedanceAnalysis.tsx** - Análise de bioimpedância

### 📝 Como Adicionar em Novos Gráficos:

1. **Importar o componente:**
```tsx
import { PersonIcon, BodyCompositionIcon, HealthIndicatorIcon } from '@/components/ui/person-icon';
```

2. **Substituir ícones existentes:**
```tsx
// Antes
<TrendingUp className="h-5 w-5" />

// Depois
<PersonIcon size="md" variant="filled" color="#F97316" />
```

3. **Adicionar seção explicativa:**
```tsx
<div className="flex items-center gap-4 mb-4">
  <PersonIcon size="lg" variant="gradient" color="#F97316" />
  <div className="flex-1">
    <p className="text-sm text-muted-foreground">
      Descrição do gráfico
    </p>
    <p className="text-xs text-muted-foreground">
      Explicação adicional
    </p>
  </div>
</div>
```

## 🎯 Benefícios da Implementação

### 1. **Consistência Visual**
- Todos os gráficos agora têm uma identidade visual unificada
- O boneco cria uma conexão emocional com o usuário

### 2. **Melhor UX**
- Interface mais amigável e personalizada
- Facilita a compreensão dos dados de saúde

### 3. **Acessibilidade**
- Ícones coloridos ajudam na identificação rápida
- Textos explicativos melhoram a compreensão

### 4. **Flexibilidade**
- Múltiplas variações para diferentes contextos
- Fácil personalização de cores e tamanhos

## 🚀 Próximos Passos

1. **Implementar em todos os gráficos restantes**
2. **Criar animações para o boneco**
3. **Adicionar interatividade (hover effects)**
4. **Criar variações específicas para diferentes tipos de dados**

---

**📞 Suporte:** Para dúvidas sobre implementação, consulte a documentação ou entre em contato com a equipe de desenvolvimento. 