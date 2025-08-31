# 📊 Guia da Página de Gráficos de Teste

## Visão Geral

A página de gráficos de teste (`/graficos-teste`) é uma galeria completa que exibe todos os gráficos e componentes visuais disponíveis no sistema Mission Health Nexus. Esta página permite visualizar, testar e integrar diferentes tipos de gráficos em seu projeto.

## 🚀 Como Acessar

1. **URL Direta**: `http://localhost:5173/graficos-teste`
2. **Navegação**: Adicione um link no menu de navegação
3. **Rota**: Configurada no `App.tsx` como rota standalone

## 📋 Funcionalidades

### 1. **Dashboard de Estatísticas**
- Total de gráficos disponíveis
- Contagem por categoria (Evolução Corporal, Silhuetas, Personagens 3D)
- Status de desenvolvimento de cada componente

### 2. **Sistema de Categorias**
- **Todos os Gráficos**: Visualização completa
- **Evolução Corporal**: Gráficos de linha e tendências
- **Silhueta**: Visualizações corporais
- **Personagens 3D**: Componentes 3D interativos

### 3. **Cards de Gráficos**
Cada gráfico é exibido em um card contendo:
- Nome e descrição
- Status de desenvolvimento (ativo/teste/desenvolvimento)
- Biblioteca utilizada (Recharts, Three.js, Custom)
- Preview do componente
- Botões de ação (Visualizar/Exportar)

### 4. **Modal de Visualização**
- Visualização detalhada em tela cheia
- Informações técnicas do componente
- Possibilidade de testar interações

## 🎨 Componentes Disponíveis

### Gráficos de Evolução Corporal
1. **BodyEvolutionChart**
   - Biblioteca: Recharts
   - Status: Ativo
   - Descrição: Gráfico de linha mostrando evolução do peso, gordura e músculo

### Silhuetas Corporais
2. **BodyChart**
   - Biblioteca: Custom
   - Status: Ativo
   - Descrição: Visualização da silhueta corporal com medidas

### Personagens 3D
3. **Character3D** (Genérico)
   - Biblioteca: Three.js
   - Status: Teste
   - Descrição: Personagem 3D interativo básico

4. **FemaleCharacter3D**
   - Biblioteca: Three.js
   - Status: Desenvolvimento
   - Descrição: Personagem feminino 3D com animações

5. **MaleCharacter3D**
   - Biblioteca: Three.js
   - Status: Desenvolvimento
   - Descrição: Personagem masculino 3D com controles avançados

6. **Character3DDemo**
   - Biblioteca: Three.js
   - Status: Teste
   - Descrição: Demonstração interativa de personagem 3D

## 🛠️ Como Usar

### 1. **Navegação**
```typescript
// Navegar programaticamente
navigate('/graficos-teste');

// Link direto
<Link to="/graficos-teste">Ver Gráficos</Link>
```

### 2. **Integração de Componentes**
```typescript
// Importar um gráfico específico
import BodyEvolutionChart from '@/components/dashboard/BodyEvolutionChart';

// Usar com dados
<BodyEvolutionChart data={dadosEvolucao} />
```

### 3. **Personalização**
```typescript
// Dados de exemplo
const dadosExemplo = {
  evolucaoCorporal: [
    { data: '2024-01', peso: 85, gordura: 25, musculo: 35 },
    { data: '2024-02', peso: 83, gordura: 24, musculo: 36 },
    // ...
  ],
  medidas: {
    altura: 175,
    peso: 77,
    cintura: 85,
    quadril: 95,
    braco: 32,
    perna: 55
  }
};
```

## 📊 Dados de Teste

A página inclui dados de exemplo para demonstração:

### Evolução Corporal
- 5 meses de dados simulados
- Métricas: peso, gordura corporal, massa muscular
- Tendência de melhoria progressiva

### Medidas Corporais
- Altura, peso, circunferências
- Proporções realistas
- Dados para ambos os gêneros

## 🔧 Configuração

### 1. **Dependências Necessárias**
```json
{
  "dependencies": {
    "recharts": "^2.8.0",
    "three": "^0.158.0",
    "@react-three/fiber": "^8.15.0",
    "@react-three/drei": "^9.88.0"
  }
}
```

### 2. **Componentes UI**
```typescript
// Importar componentes necessários
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
```

### 3. **Roteamento**
```typescript
// Adicionar rota no App.tsx
<Route path="/graficos-teste" element={<GraficosTestePage />} />
```

## 🧪 Testes

### Script de Teste Automatizado
```bash
# Executar teste
node teste-graficos-completos.js
```

### Testes Manuais
1. **Navegação entre categorias**
2. **Modal de visualização**
3. **Responsividade**
4. **Interações 3D**

## 📈 Métricas de Performance

- **Tempo de carregamento**: < 3s
- **Responsividade**: Mobile-first
- **Interatividade**: 60fps para gráficos 3D
- **Acessibilidade**: WCAG 2.1 AA

## 🐛 Troubleshooting

### Problemas Comuns

1. **Gráficos não carregam**
   - Verificar dependências instaladas
   - Verificar console por erros
   - Verificar dados de entrada

2. **Personagens 3D não aparecem**
   - Verificar WebGL support
   - Verificar Three.js instalado
   - Verificar assets carregados

3. **Performance lenta**
   - Verificar bundle size
   - Otimizar imports
   - Usar lazy loading

## 🔄 Atualizações

### Adicionar Novo Gráfico
1. Criar componente em `src/components/`
2. Adicionar à lista de gráficos em `GraficosTestePage.tsx`
3. Incluir dados de exemplo
4. Testar funcionalidade

### Modificar Categorias
1. Atualizar array `categorias`
2. Atualizar filtros
3. Testar navegação

## 📝 Logs e Debug

### Console Logs
```javascript
// Habilitar logs detalhados
console.log('Gráfico carregado:', nomeGrafico);
console.log('Dados recebidos:', dados);
console.log('Erro de renderização:', erro);
```

### Performance Monitoring
```javascript
// Medir tempo de renderização
const startTime = performance.now();
// ... renderização
const endTime = performance.now();
console.log('Tempo de renderização:', endTime - startTime);
```

## 🎯 Próximos Passos

1. **Adicionar mais gráficos**
2. **Implementar exportação de dados**
3. **Adicionar animações**
4. **Melhorar acessibilidade**
5. **Otimizar performance**

---

**Última atualização**: 25/07/2025
**Versão**: 1.0.0
**Autor**: Mission Health Nexus Team 