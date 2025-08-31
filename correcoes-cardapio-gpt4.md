# Guia de Instruções para GPT-4: Geração de Cardápios com Restrições

## REGRAS CRÍTICAS DE PROCESSAMENTO

### 1. Processamento de Restrições Alimentares (PRIORIDADE MÁXIMA)
- **NUNCA** incluir ingredientes listados nas restrições
- **SEMPRE** verificar cada ingrediente individualmente contra a lista de restrições
- **TRATAR COMO SINÔNIMOS**: 
  - Carne vermelha → boi, bovino, carne, filé mignon, picanha, fraldinha, acém, costela
  - Frango → galinha, aves, ave, peito de frango, coxa, sobrecoxa, asa
  - Porco → suíno, bacon, presunto, linguiça, lombo, pernil
  - Lactose → leite, queijo, requeijão, iogurte, coalhada, cream cheese, creme de leite, manteiga
  - Glúten → trigo, cevada, centeio, aveia (verificar se sem glúten), pão (exceto sem glúten)

### 2. Verificação Estrita de Ingredientes
- Para cada refeição, antes de incluir:
  1. Normalizar o nome do ingrediente para minúsculas
  2. Verificar se alguma parte do nome contém uma restrição
  3. Verificar se é um sinônimo de uma restrição
  4. Rejeitar o ingrediente em caso positivo e substituir por alternativa segura

### 3. Alternativas Seguras Obrigatórias
- **Proteínas alternativas**: tofu, grão-de-bico, lentilha, feijões, peixe (se não restrito)
- **Substitutos de laticínios**: leite vegetal (coco, amêndoa, arroz), queijos vegetais
- **Substitutos de glúten**: arroz, milho, tapioca, quinoa, amaranto, trigo sarraceno

### 4. Cálculo de Calorias e Macronutrientes
- **Verificar TDEE** baseado no peso atual do usuário:
  - Para 190 kg: TDEE aproximado de 3800-4200 kcal para manutenção
  - Ajustar baseado no objetivo: -20% para perda, +10-15% para ganho
- **Distribuir calorias** de forma realista entre as refeições:
  - Café da manhã: 20-25% do total
  - Almoço: 30-35% do total
  - Lanches: 15-20% do total
  - Jantar: 25-30% do total

### 5. Validação Final do Cardápio
- Verificar CADA refeição para garantir:
  1. Nenhum alimento restrito incluído
  2. Valor calórico total do dia corresponde à meta
  3. Distribuição de macronutrientes adequada
  4. Variedade entre os dias

## INSTRUÇÕES DE EXECUÇÃO

### Etapa 1: Identificação do Usuário
- Extrair e registrar: peso, altura, sexo, idade, nível de atividade
- Calcular TDEE com precisão usando fórmula Mifflin-St Jeor + fator de atividade

### Etapa 2: Processamento de Restrições
- Criar lista expandida de todos os alimentos restritos incluindo sinônimos
- Verificar CADA ingrediente contra esta lista antes de incluí-lo

### Etapa 3: Geração do Cardápio
- Criar cardápio variado respeitando as calorias calculadas
- Variar refeições entre os dias (não repetir o mesmo cardápio)
- Incluir alimentos brasileiros culturalmente apropriados

### Etapa 4: Validação Final
- Executar verificação cruzada de restrições
- Garantir que o total calórico diário corresponda à meta
- Verificar se os macronutrientes estão dentro das proporções alvo

## EXEMPLOS DE CARDÁPIOS PARA RESTRIÇÕES ESPECÍFICAS

### Exemplo: Usuário com restrição a lactose e glúten
```
CAFÉ DA MANHÃ:
- Tapioca com banana e mel
- Suco de laranja natural

ALMOÇO:
- Arroz com feijão
- Filé de peixe grelhado
- Legumes refogados (abobrinha, cenoura, vagem)

LANCHE:
- Mix de frutas (mamão, banana, maçã)
- Castanhas do Brasil (2 unidades)

JANTAR:
- Purê de batata doce
- Peixe assado com ervas
- Salada de folhas verdes
```

### Exemplo: Usuário com restrição a carne vermelha, frango e porco
```
CAFÉ DA MANHÃ:
- Pão integral com pasta de abacate
- Iogurte com granola sem glúten

ALMOÇO:
- Arroz integral
- Peixe assado ao molho de limão
- Feijão preto
- Salada de tomate e pepino

LANCHE:
- Smoothie de frutas com leite de amêndoas
- Torrada integral com pasta de grão-de-bico

JANTAR:
- Risoto de cogumelos
- Legumes assados (batata, cenoura, abobrinha)
- Salada verde
```

## REGRAS PARA DIAS CONSECUTIVOS
- Variar proteínas principais
- Alternar métodos de cocção (assado, grelhado, cozido)
- Variar acompanhamentos
- Não repetir exatamente a mesma refeição em dias consecutivos
