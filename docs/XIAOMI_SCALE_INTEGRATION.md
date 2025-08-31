# 📊 Integração Xiaomi Mi Body Scale 2

## 🎯 Visão Geral

Esta documentação descreve a implementação completa da integração com a **Xiaomi Mi Body Scale 2** usando Web Bluetooth API. A integração permite capturar dados de peso e composição corporal em tempo real.

## 🔧 Arquitetura Técnica

### Componentes Principais

1. **`xiaomi-scale-service.ts`** - Serviço principal de integração
2. **`XiaomiScaleIntegration.tsx`** - Componente React para interface
3. **Protocolo Bluetooth LE** - Comunicação com a balança

### UUIDs da Xiaomi Mi Body Scale 2

```typescript
const XIAOMI_SCALE_SERVICE_UUID = '0000181b-0000-1000-8000-00805f9b34fb'; // Weight Scale Service
const XIAOMI_SCALE_CHARACTERISTIC_UUID = '00002a9c-0000-1000-8000-00805f9b34fb'; // Weight Measurement
const XIAOMI_SCALE_BATTERY_SERVICE_UUID = '0000180f-0000-1000-8000-00805f9b34fb'; // Battery Service
const XIAOMI_SCALE_BATTERY_CHARACTERISTIC_UUID = '00002a19-0000-1000-8000-00805f9b34fb'; // Battery Level
```

### Filtros de Dispositivo

```typescript
const XIAOMI_SCALE_FILTERS = [
  { namePrefix: 'MIBFS' }, // Xiaomi Mi Body Scale 2
  { namePrefix: 'XMTZC' }, // Xiaomi Mi Smart Scale
  { namePrefix: 'XMTZ' },  // Xiaomi Mi Scale
  { services: [XIAOMI_SCALE_SERVICE_UUID] }
];
```

## 📱 Como Usar

### 1. Pré-requisitos

- **Navegador**: Chrome 56+ ou Edge 79+
- **Balança**: Xiaomi Mi Body Scale 2
- **Bluetooth**: Ativado no dispositivo
- **HTTPS**: Necessário para Web Bluetooth (exceto localhost)

### 2. Conectar à Balança

```typescript
import { xiaomiScaleService } from '@/lib/xiaomi-scale-service';

// Conectar à balança
const device = await xiaomiScaleService.connect();

// Configurar callbacks
xiaomiScaleService.onData((data) => {
  console.log('Dados recebidos:', data);
});

xiaomiScaleService.onConnectionChange((connected) => {
  console.log('Status da conexão:', connected);
});
```

### 3. Capturar Dados

```typescript
// Os dados são recebidos automaticamente quando você sobe na balança
xiaomiScaleService.onData((data: XiaomiScaleData) => {
  console.log('Peso:', data.weight);
  console.log('Gordura corporal:', data.bodyFat);
  console.log('Massa muscular:', data.muscleMass);
  console.log('Água corporal:', data.bodyWater);
  console.log('Massa óssea:', data.boneMass);
  console.log('Metabolismo basal:', data.basalMetabolism);
  console.log('Idade metabólica:', data.metabolicAge);
  console.log('Impedância:', data.impedance);
});
```

## 🔬 Protocolo de Dados Atualizado

### Estrutura dos Dados Recebidos (Baseado no openScale)

```typescript
interface XiaomiScaleData {
  weight: number;           // Peso em kg (precisão 0.1kg)
  bodyFat?: number;         // Gordura corporal em % (baseada em impedância)
  muscleMass?: number;      // Massa muscular em kg (calculada via bioimpedância)
  bodyWater?: number;       // Água corporal em % (baseada em massa magra)
  boneMass?: number;        // Massa óssea em kg (fórmula antropométrica)
  basalMetabolism?: number; // Metabolismo basal em kcal (Mifflin-St Jeor)
  metabolicAge?: number;    // Idade metabólica em anos
  impedance?: number;       // Impedância em ohms (Mi Body Composition Scale)
  timestamp: Date;          // Timestamp da medição
}
```

### Decodificação dos Dados (Protocolo Real da Xiaomi)

```typescript
private decodeWeightData(value: DataView): XiaomiScaleData {
  const buffer = value.buffer;
  const dataView = new DataView(buffer);
  
  // Log dos dados brutos para debug
  console.log('Raw data:', Array.from(new Uint8Array(buffer))
    .map(b => '0x' + b.toString(16).padStart(2, '0')).join(' '));
  
  let weight = 0;
  let impedance = 0;
  
  if (buffer.byteLength >= 13) {
    // Mi Body Composition Scale 2 (13 bytes)
    const flags = dataView.getUint8(0);
    const weightRaw = dataView.getUint16(1, true); // little-endian
    weight = weightRaw / 200; // kg
    
    // Impedância nos bytes 9-10
    impedance = dataView.getUint16(9, true);
  } else if (buffer.byteLength >= 5) {
    // Mi Scale simples (5 bytes)
    const weightRaw = dataView.getUint16(1, true);
    weight = weightRaw / 200;
  }

  // Calcular composição corporal com base científica
  const bodyComposition = impedance > 0 ? 
    this.calculateAccurateBodyComposition(weight, impedance) : 
    this.calculateBasicBodyComposition(weight);

  return {
    weight: Math.round(weight * 10) / 10,
    impedance: impedance > 0 ? impedance : undefined,
    ...bodyComposition,
    timestamp: new Date()
  };
}
```

## 🧮 Cálculos de Composição Corporal Científicos

### Fórmulas Baseadas em Pesquisas

```typescript
// Cálculo de massa magra corporal (Kyle et al., 2001)
private calculateLeanBodyMass(weight: number, impedance: number, height: number, age: number, gender: number): number {
  const heightM = height / 100;
  const lbm = (Math.pow(heightM, 2) / impedance) * 0.401 + (gender * 3.825) + (age * -0.071) + 5.102;
  return Math.max(0, Math.min(weight * 0.9, lbm));
}

// Massa óssea (estudos antropométricos)
private calculateBoneMass(weight: number, height: number, gender: number): number {
  if (gender === 1) { // Masculino
    return (0.246 * weight) + (0.14 * height) - 34.4;
  } else { // Feminino
    return (0.245 * weight) + (0.15 * height) - 39.5;
  }
}

// Metabolismo basal (Mifflin-St Jeor)
private calculateBasalMetabolism(weight: number, height: number, age: number, gender: number): number {
  if (gender === 1) { // Masculino
    return (10 * weight) + (6.25 * height) - (5 * age) + 5;
  } else { // Feminino
    return (10 * weight) + (6.25 * height) - (5 * age) - 161;
  }
}

// Composição corporal completa
private calculateAccurateBodyComposition(weight: number, impedance: number): Partial<XiaomiScaleData> {
  const lbm = this.calculateLeanBodyMass(weight, impedance, HEIGHT, AGE, GENDER);
  const bodyFat = Math.max(5, Math.min(50, ((weight - lbm) / weight) * 100));
  const muscleMass = lbm * 0.85; // 85% da massa magra
  const bodyWater = lbm * 0.75; // 75% da massa magra
  
  return {
    bodyFat: Math.round(bodyFat * 10) / 10,
    muscleMass: Math.round(muscleMass * 10) / 10,
    bodyWater: Math.round((bodyWater / weight) * 100 * 10) / 10,
    boneMass: Math.round(this.calculateBoneMass(weight, HEIGHT, GENDER) * 10) / 10,
    basalMetabolism: Math.round(this.calculateBasalMetabolism(weight, HEIGHT, AGE, GENDER)),
    metabolicAge: Math.round(this.calculateMetabolicAge(basalMetabolism, GENDER))
  };
}
```

## 🎮 Interface do Usuário

### Funcionalidades da Interface

1. **Status de Conexão**
   - Indicador visual de conectado/desconectado
   - Informações do dispositivo
   - Nível da bateria

2. **Processo de Pesagem**
   - Botão para conectar/desconectar
   - Indicador de progresso durante pesagem
   - Instruções para o usuário

3. **Resultados**
   - Peso principal com tendência
   - Métricas detalhadas de composição corporal
   - Comparação com pesagem anterior
   - Classificação do IMC

### Componente React

```typescript
import { XiaomiScaleIntegration } from '@/components/weighing/XiaomiScaleIntegration';

// Usar o componente
<XiaomiScaleIntegration user={currentUser} />
```

## 🔧 Configuração da Balança

### Modo de Descoberta

1. **Ligar a balança**
2. **Aguardar o LED piscar**
3. **Pressionar o botão de reset** (se necessário)
4. **A balança deve aparecer como "MIBFS..."**

### Primeira Configuração

1. **Conectar via app Xiaomi Mi Fit**
2. **Configurar dados pessoais** (altura, idade, sexo)
3. **Fazer primeira pesagem** no app
4. **Agora pode usar via Web Bluetooth**

## 🚨 Solução de Problemas

### Problemas Comuns

#### 1. "Web Bluetooth não é suportado"
- **Solução**: Use Chrome 56+ ou Edge 79+
- **Verificar**: `navigator.bluetooth` existe

#### 2. "Dispositivo não encontrado"
- **Verificar**: Bluetooth ativado
- **Verificar**: Balança em modo de descoberta
- **Verificar**: Balança próxima ao dispositivo

#### 3. "Erro de conexão"
- **Tentar**: Desconectar e reconectar
- **Verificar**: Bateria da balança
- **Verificar**: Interferência Bluetooth

#### 4. "Dados incorretos"
- **Verificar**: Dados pessoais configurados
- **Verificar**: Primeira pesagem no app oficial
- **Verificar**: Posicionamento na balança

### Debug

```typescript
// Habilitar logs detalhados
xiaomiScaleService.onData((data) => {
  console.log('Dados da balança:', data);
});

xiaomiScaleService.onConnectionChange((connected) => {
  console.log('Status da conexão:', connected);
});
```

## 📊 Salvamento de Dados

### Integração com Supabase

```typescript
const saveWeighingData = async (data: XiaomiScaleData) => {
  const { error } = await supabase
    .from('weight_measurements')
    .insert({
      user_id: user.id,
      peso_kg: data.weight,
      gordura_corporal_percent: data.bodyFat,
      massa_muscular_kg: data.muscleMass,
      agua_corporal_percent: data.bodyWater,
      osso_kg: data.boneMass,
      metabolismo_basal_kcal: data.basalMetabolism,
      idade_metabolica: data.metabolicAge,
      imc: calculateBMI(data.weight),
      device_type: 'xiaomi_scale'
    });
};
```

## 🔒 Segurança

### Permissões Bluetooth

- **HTTPS obrigatório** (exceto localhost)
- **Permissão do usuário** necessária
- **Dados criptografados** em trânsito
- **Armazenamento seguro** no Supabase

### Privacidade

- **Dados pessoais** não compartilhados
- **Conexão local** apenas
- **Sem dados enviados** para terceiros

## 🚀 Melhorias Implementadas (v2.0)

### Novas Funcionalidades

1. **Protocolo Real da Xiaomi** - Implementação baseada no projeto openScale
2. **Detecção de Estabilidade** - Aguarda peso estável antes de registrar
3. **Timeout de 10 segundos** - Registro automático após timeout
4. **Cálculos Científicos** - Fórmulas baseadas em pesquisas de bioimpedância
5. **Logs Detalhados** - Debug completo dos dados brutos recebidos
6. **Estimativas Inteligentes** - Circunferência abdominal e gordura visceral
7. **Suporte Multi-modelo** - Compatível com Mi Scale, Mi Body Scale e Mi Body Composition Scale

### Otimizações Técnicas

1. **Decodificação Robusta** - Suporte a diferentes formatos de dados (5, 13+ bytes)
2. **Fallbacks Inteligentes** - Estimativas quando impedância não está disponível
3. **Validação de Dados** - Peso mínimo de 10kg para evitar falsos positivos
4. **Precisão Melhorada** - Arredondamento adequado para 1 casa decimal

## 📚 Referências

- [Web Bluetooth API](https://web.dev/bluetooth/)
- [Xiaomi Mi Body Scale 2 Manual](https://www.mi.com/global/support/product/mi-body-composition-scale-2/)
- [openScale Project](https://github.com/oliexdev/openScale)
- [Bluetooth LE Weight Scale Service](https://www.bluetooth.com/specifications/specs/weight-scale-service-1-0/)

---

**Desenvolvido com ❤️ para revolucionar o monitoramento de saúde!** 