# 📊 Demo de Gráficos - Cliente 30 Dias

## 🎯 Objetivo
Esta página demonstra **15 tipos diferentes de gráficos** usando dados simulados de um cliente real durante 30 dias de acompanhamento de saúde.

## 🚀 Como Acessar
1. Inicie o servidor: `npm run dev`
2. Acesse: `http://localhost:5173/app/graficos-demo`

## 📈 Tipos de Gráficos Implementados

### 1. **Gráfico de Linha (Line Chart)**
- **Uso:** Evolução do peso ao longo de 30 dias
- **Dados:** Peso diário com variações realistas
- **Visualização:** Tendência de perda de peso

### 2. **Gráfico de Área (Area Chart)**
- **Uso:** Consumo de água diário
- **Dados:** Volume de água consumido por dia
- **Visualização:** Área preenchida mostrando volume

### 3. **Gráfico de Barras (Bar Chart)**
- **Uso:** Horas de sono por dia
- **Dados:** Duração do sono diário
- **Visualização:** Barras verticais

### 4. **Gráfico de Dispersão (Scatter Plot)**
- **Uso:** Relação entre energia e estresse
- **Dados:** Pontos mostrando correlação
- **Visualização:** Padrões de comportamento

### 5. **Gráfico de Pizza (Pie Chart)**
- **Uso:** Composição corporal
- **Dados:** Gordura, massa magra, água
- **Visualização:** Proporções percentuais

### 6. **Gráfico de Rosca (Doughnut Chart)**
- **Uso:** Distribuição de água corporal
- **Dados:** Água intracelular vs extracelular
- **Visualização:** Anel com proporções

### 7. **Gráfico de Área Empilhada (Stacked Area)**
- **Uso:** Evolução corporal (gordura + massa magra)
- **Dados:** Composição corporal ao longo do tempo
- **Visualização:** Áreas empilhadas

### 8. **Gráfico de Barras Agrupadas (Grouped Bar)**
- **Uso:** Comparação antes vs depois
- **Dados:** Métricas iniciais vs finais
- **Visualização:** Barras lado a lado

### 9. **Gráfico Radar (Radar Chart)**
- **Uso:** Perfil de saúde completo
- **Dados:** 6 métricas de saúde
- **Visualização:** Polígono de avaliação

### 10. **Gráfico de Gauge (Gauge Chart)**
- **Uso:** Score de saúde geral
- **Dados:** Pontuação de 0-100
- **Visualização:** Medidor circular

### 11. **Heatmap (Mapa de Calor)**
- **Uso:** Frequência de atividades semanais
- **Dados:** 4 atividades por dia da semana
- **Visualização:** Cores por intensidade

### 12. **Boxplot (Distribuição Estatística)**
- **Uso:** Distribuição de peso por semana
- **Dados:** Estatísticas (min, Q1, mediana, Q3, max)
- **Visualização:** Caixas com whiskers

### 13. **Gráfico de Funil (Funnel Chart)**
- **Uso:** Progresso de metas
- **Dados:** Etapas de conclusão
- **Visualização:** Funil de conversão

### 14. **Gráfico Bullet (Bullet Chart)**
- **Uso:** Progresso vs metas
- **Dados:** Atual vs meta vs faixas
- **Visualização:** Barras com indicadores

### 15. **Gráfico Sankey (Fluxo)**
- **Uso:** Fluxo de energia diária
- **Dados:** Distribuição de calorias
- **Visualização:** Fluxo entre categorias

## 📊 Dados Simulados

### Cliente Simulado
- **Idade:** 35 anos
- **Peso inicial:** 85.2kg
- **Peso final:** 83.5kg
- **Perda:** 1.7kg em 30 dias

### Métricas Principais
- **Gordura:** 27.5% → 25.1%
- **Massa magra:** 58.8kg → 60.2kg
- **Hidratação:** 62.3% → 65.8%
- **Score geral:** 78/100

### Metas Alcançadas
- **12 conquistas** desbloqueadas
- **8 metas** em progresso
- **5 metas** pendentes
- **Taxa de sucesso:** 48%

## 🎨 Organização da Página

### Tabs de Navegação
1. **📈 Evolução** - Gráficos temporais
2. **🥗 Composição** - Análise corporal
3. **🎯 Perfil** - Avaliação de saúde
4. **🏃 Atividades** - Exercícios e movimento
5. **🎯 Metas** - Progresso e conquistas

### Layout Responsivo
- **Desktop:** Grid 2x2 para gráficos
- **Mobile:** Layout em coluna única
- **Cores:** Paleta consistente com tema

## 🔧 Tecnologias Utilizadas

### Frontend
- **React 18** com TypeScript
- **Recharts** para gráficos
- **Shadcn/ui** para componentes
- **Tailwind CSS** para estilização
- **Lucide React** para ícones

### Dados
- **Geração aleatória** com variações realistas
- **Limites fisiológicos** respeitados
- **30 dias** de dados contínuos
- **Múltiplas métricas** correlacionadas

## 💡 Casos de Uso

### Para Bioimpedância
- **Gráfico de Pizza:** Composição corporal
- **Gráfico de Linha:** Evolução de peso
- **Gráfico de Área:** Hidratação ao longo do tempo

### Para Missão do Dia
- **Gráfico de Barras:** Progresso diário
- **Gráfico de Funil:** Conquistas
- **Gráfico Bullet:** Metas vs realização

### Para Dashboard Geral
- **Gráfico Radar:** Perfil completo
- **Heatmap:** Padrões semanais
- **Gráfico de Gauge:** Score geral

## 🚀 Próximos Passos

1. **Integração com Supabase** - Conectar dados reais
2. **Gráficos Interativos** - Zoom, filtros, drill-down
3. **Exportação** - PDF, PNG, CSV
4. **Comparação** - Múltiplos clientes
5. **Alertas** - Notificações de tendências

## 📱 Responsividade

A página é totalmente responsiva e funciona bem em:
- **Desktop** (1200px+)
- **Tablet** (768px - 1199px)
- **Mobile** (320px - 767px)

## 🎨 Personalização

Os gráficos podem ser facilmente personalizados:
- **Cores** - Paleta temática
- **Tamanhos** - Responsivos
- **Dados** - Estrutura flexível
- **Interações** - Tooltips, legendas

---

**🎯 Esta demo serve como referência completa para implementar gráficos em qualquer parte do sistema de saúde!** 