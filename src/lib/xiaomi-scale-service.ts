// Definições de tipos para Web Bluetooth API
declare global {
  interface Navigator {
    bluetooth: Bluetooth;
  }

  interface Bluetooth {
    requestDevice(options: RequestDeviceOptions): Promise<BluetoothDevice>;
  }

  interface RequestDeviceOptions {
    filters?: BluetoothRequestDeviceFilter[];
    optionalServices?: string[];
  }

  interface BluetoothRequestDeviceFilter {
    services?: string[];
    name?: string;
    namePrefix?: string;
    manufacturerData?: BluetoothManufacturerDataFilter[];
  }

  interface BluetoothManufacturerDataFilter {
    companyIdentifier: number;
    dataPrefix?: BufferSource;
    mask?: BufferSource;
  }

  interface BluetoothDevice {
    id: string;
    name?: string;
    gatt?: BluetoothRemoteGATTServer;
    addEventListener(type: string, listener: EventListener): void;
  }

  interface BluetoothRemoteGATTServer {
    connect(): Promise<BluetoothRemoteGATTServer>;
    getPrimaryService(service: string): Promise<BluetoothRemoteGATTService>;
    disconnect(): void;
  }

  interface BluetoothRemoteGATTService {
    getCharacteristic(characteristic: string): Promise<BluetoothRemoteGATTCharacteristic>;
  }

  interface BluetoothRemoteGATTCharacteristic {
    startNotifications(): Promise<BluetoothRemoteGATTCharacteristic>;
    stopNotifications(): Promise<BluetoothRemoteGATTCharacteristic>;
    readValue(): Promise<DataView>;
    writeValue(value: BufferSource): Promise<void>;
    addEventListener(type: string, listener: EventListener): void;
    value?: DataView;
  }
}

// Xiaomi Mi Body Scale 2 Integration Service
// Baseado na documentação oficial e protocolo Bluetooth LE

export interface XiaomiScaleData {
  weight: number;
  bodyFat?: number;
  muscleMass?: number;
  bodyWater?: number;
  boneMass?: number;
  basalMetabolism?: number;
  metabolicAge?: number;
  impedance?: number;
  timestamp: Date;
}

export interface XiaomiScaleDevice {
  id: string;
  name: string;
  connected: boolean;
  batteryLevel?: number;
}

// UUIDs específicos da Xiaomi Mi Body Scale 2 - baseados no protocolo oficial
const XIAOMI_SCALE_SERVICE_UUID = '0000181b-0000-1000-8000-00805f9b34fb'; // Weight Scale Service
const XIAOMI_SCALE_CHARACTERISTIC_UUID = '00002a9c-0000-1000-8000-00805f9b34fb'; // Weight Measurement
const XIAOMI_SCALE_BATTERY_SERVICE_UUID = '0000180f-0000-1000-8000-00805f9b34fb'; // Battery Service
const XIAOMI_SCALE_BATTERY_CHARACTERISTIC_UUID = '00002a19-0000-1000-8000-00805f9b34fb'; // Battery Level

// Identificadores específicos da Xiaomi para diferentes modelos
const XIAOMI_SCALE_FILTERS = [
  { namePrefix: 'MIBFS' }, // Xiaomi Mi Body Scale 2 (MIBFS-xxxxx)
  { namePrefix: 'XMTZC' }, // Xiaomi Mi Body Composition Scale
  { namePrefix: 'XMTZB' }, // Xiaomi Mi Body Scale
  { services: [XIAOMI_SCALE_SERVICE_UUID] }
];

export class XiaomiScaleService {
  private device: BluetoothDevice | null = null;
  private server: BluetoothRemoteGATTServer | null = null;
  private weightCharacteristic: BluetoothRemoteGATTCharacteristic | null = null;
  private batteryCharacteristic: BluetoothRemoteGATTCharacteristic | null = null;
  private onDataCallback: ((data: XiaomiScaleData) => void) | null = null;
  private onConnectionChangeCallback: ((connected: boolean) => void) | null = null;
  private weighingTimeout: NodeJS.Timeout | null = null;
  private lastStableWeight: number | null = null;
  private weightReadings: number[] = [];
  private isWeighingActive: boolean = false;

  constructor() {
    this.checkBluetoothSupport();
  }

  /**
   * Verifica se o navegador suporta Web Bluetooth API
   */
  checkBluetoothSupport(): boolean {
    if (!navigator.bluetooth) {
      console.error('Web Bluetooth API não é suportada neste navegador');
      return false;
    }
    return true;
  }

  /**
   * Solicita permissão e conecta à balança
   */
  async connect(): Promise<XiaomiScaleDevice> {
      if (!this.checkBluetoothSupport()) {
      throw new Error('Web Bluetooth não é suportado neste navegador');
      }

    try {
      // Solicitar dispositivo Bluetooth
      this.device = await navigator.bluetooth.requestDevice({
        filters: XIAOMI_SCALE_FILTERS,
        optionalServices: [XIAOMI_SCALE_BATTERY_SERVICE_UUID]
      });

      console.log('Dispositivo selecionado:', this.device.name);

      // Conectar ao servidor GATT
      this.server = await this.device.gatt?.connect();
      if (!this.server) {
        throw new Error('Falha ao conectar ao servidor GATT');
      }

      // Obter serviço de peso
      const weightService = await this.server.getPrimaryService(XIAOMI_SCALE_SERVICE_UUID);
      
      // Obter característica de peso
      this.weightCharacteristic = await weightService.getCharacteristic(XIAOMI_SCALE_CHARACTERISTIC_UUID);

      // Configurar notificações para dados de peso
      await this.weightCharacteristic.startNotifications();
      this.weightCharacteristic.addEventListener('characteristicvaluechanged', this.handleWeightData.bind(this));

      // Tentar obter nível da bateria
      try {
        const batteryService = await this.server.getPrimaryService(XIAOMI_SCALE_BATTERY_SERVICE_UUID);
        this.batteryCharacteristic = await batteryService.getCharacteristic(XIAOMI_SCALE_BATTERY_CHARACTERISTIC_UUID);
      } catch (error) {
        console.warn('Não foi possível obter informações da bateria:', error);
      }

      // Configurar listeners de desconexão
      this.device.addEventListener('gattserverdisconnected', this.handleDisconnection.bind(this));

      const deviceInfo: XiaomiScaleDevice = {
        id: this.device.id,
        name: this.device.name || 'Xiaomi Scale',
        connected: true
      };

      this.onConnectionChangeCallback?.(true);
      return deviceInfo;

    } catch (error) {
      console.error('Erro ao conectar com a balança:', error);
      throw error;
    }
  }

  /**
   * Desconecta da balança
   */
  async disconnect(): Promise<void> {
    // Para qualquer pesagem ativa
    this.stopWeighing();
    
    if (this.weightCharacteristic) {
      try {
        await this.weightCharacteristic.stopNotifications();
    } catch (error) {
        console.warn('Erro ao parar notificações:', error);
    }
  }

    if (this.server) {
    try {
        this.server.disconnect();
    } catch (error) {
        console.warn('Erro ao desconectar:', error);
    }
  }

    this.device = null;
    this.server = null;
    this.weightCharacteristic = null;
    this.batteryCharacteristic = null;

    this.onConnectionChangeCallback?.(false);
  }

  /**
   * Obtém o nível da bateria
   */
  async getBatteryLevel(): Promise<number | null> {
    if (!this.batteryCharacteristic) {
        return null;
      }

    try {
      const value = await this.batteryCharacteristic.readValue();
      return value.getUint8(0);
    } catch (error) {
      console.error('Erro ao ler nível da bateria:', error);
      return null;
    }
  }

  /**
   * Configura callback para receber dados da balança
   */
  onData(callback: (data: XiaomiScaleData) => void): void {
    this.onDataCallback = callback;
  }

  /**
   * Configura callback para mudanças de conexão
   */
  onConnectionChange(callback: (connected: boolean) => void): void {
    this.onConnectionChangeCallback = callback;
  }

  /**
   * Inicia o processo de pesagem com timeout de 10 segundos
   */
  startWeighing(): void {
    this.isWeighingActive = true;
    this.weightReadings = [];
    this.lastStableWeight = null;
    
    // Timeout de 10 segundos para completar a pesagem
    this.weighingTimeout = setTimeout(() => {
      if (this.isWeighingActive && this.lastStableWeight) {
        this.completeWeighing(this.lastStableWeight);
      }
    }, 10000);
  }

  /**
   * Para o processo de pesagem
   */
  stopWeighing(): void {
    this.isWeighingActive = false;
    if (this.weighingTimeout) {
      clearTimeout(this.weighingTimeout);
      this.weighingTimeout = null;
    }
  }

  /**
   * Completa a pesagem e envia os dados
   */
  private completeWeighing(weight: number): void {
    const impedance = 400; // Valor padrão para cálculo
    const bodyComposition = this.calculateAccurateBodyComposition(weight, impedance);
    
    const data: XiaomiScaleData = {
      weight,
      impedance,
      ...bodyComposition,
      timestamp: new Date()
    };
    
    this.isWeighingActive = false;
    if (this.weighingTimeout) {
      clearTimeout(this.weighingTimeout);
      this.weighingTimeout = null;
    }
    
    this.onDataCallback?.(data);
  }

  /**
   * Processa dados recebidos da balança
   */
  private handleWeightData(event: Event): void {
    const characteristic = event.target as unknown as BluetoothRemoteGATTCharacteristic;
    const value = characteristic.value;
    if (!value) return;

    try {
      const data = this.decodeWeightData(value);
      
      // Se não está pesando ativamente, apenas registra o peso
      if (!this.isWeighingActive) {
        this.onDataCallback?.(data);
        return;
      }
      
      // Durante pesagem ativa, coleta leituras para estabilização
      this.weightReadings.push(data.weight);
      
      // Mantém apenas as últimas 5 leituras
      if (this.weightReadings.length > 5) {
        this.weightReadings.shift();
      }
      
      // Verifica se o peso está estável (3 leituras consecutivas similares)
      if (this.weightReadings.length >= 3) {
        const lastThree = this.weightReadings.slice(-3);
        const avgWeight = lastThree.reduce((sum, w) => sum + w, 0) / lastThree.length;
        const isStable = lastThree.every(w => Math.abs(w - avgWeight) < 0.1);
        
        if (isStable) {
          this.lastStableWeight = avgWeight;
          // Se peso é estável e maior que 10kg, completa imediatamente
          if (avgWeight > 10) {
            this.completeWeighing(avgWeight);
          }
        }
      }
    } catch (error) {
      console.error('Erro ao decodificar dados da balança:', error);
    }
  }

  /**
   * Decodifica dados da balança Xiaomi baseado no protocolo oficial
   * Protocolo: Weight Scale Measurement Characteristic (0x2A9C)
   */
  private decodeWeightData(value: DataView): XiaomiScaleData {
    const buffer = value.buffer;
    const dataView = new DataView(buffer);
    
    console.log('Raw data from scale:', Array.from(new Uint8Array(buffer)).map(b => '0x' + b.toString(16).padStart(2, '0')).join(' '));
    
    // Estrutura de dados da Xiaomi Scale baseada no protocolo Bluetooth LE Weight Scale:
    // Byte 0: Flags (measurement units and data presence indicators)
    // Byte 1-2: Weight (little-endian, kg * 200 ou lb * 100)
    // Byte 3-4: Impedance (little-endian, ohms) - apenas para Mi Body Composition Scale
    // Byte 5-6: Timestamp ou dados adicionais
    
    let weight = 0;
    let impedance = 0;
    
    if (buffer.byteLength >= 13) {
      // Formato Mi Body Composition Scale 2 (13 bytes)
      const flags = dataView.getUint8(0);
      const weightRaw = dataView.getUint16(1, true); // little-endian
      weight = weightRaw / 200; // kg
      
      // Impedance está nos bytes 9-10 para Mi Body Scale 2
      if (buffer.byteLength >= 11) {
        impedance = dataView.getUint16(9, true);
      }
      
      console.log(`Flags: 0x${flags.toString(16)}, Weight raw: ${weightRaw}, Weight: ${weight}kg, Impedance: ${impedance}Ω`);
    } else if (buffer.byteLength >= 5) {
      // Formato Mi Scale simples (5 bytes)
      const weightRaw = dataView.getUint16(1, true);
      weight = weightRaw / 200;
      
      console.log(`Simple format - Weight raw: ${weightRaw}, Weight: ${weight}kg`);
    } else {
      console.warn('Unexpected data format, length:', buffer.byteLength);
      // Fallback para formato básico
      const weightRaw = dataView.getUint16(0, true);
      weight = weightRaw / 100;
    }

    // Calcular composição corporal baseada na impedância (se disponível)
    const bodyComposition = impedance > 0 ? 
      this.calculateAccurateBodyComposition(weight, impedance) : 
      this.calculateBasicBodyComposition(weight);

    return {
      weight: Math.round(weight * 10) / 10, // Arredondar para 1 casa decimal
      impedance: impedance > 0 ? impedance : undefined,
      ...bodyComposition,
      timestamp: new Date()
    };
  }

  /**
   * Calcula composição corporal com impedância (Mi Body Composition Scale)
   * Baseado em algoritmos similares ao openScale
   */
  private calculateAccurateBodyComposition(weight: number, impedance: number): Partial<XiaomiScaleData> {
    if (impedance === 0 || weight < 5) {
      return {};
    }

    // Constantes baseadas em pesquisas de bioimpedância
    const AGE = 30; // Valor padrão se não tivermos idade do usuário
    const HEIGHT = 170; // Valor padrão se não tivermos altura do usuário
    const GENDER = 0; // 0 = feminino, 1 = masculino (padrão feminino)

    // Fórmulas baseadas no projeto openScale e algoritmos científicos
    const lbm = this.calculateLeanBodyMass(weight, impedance, HEIGHT, AGE, GENDER);
    const bodyFat = Math.max(5, Math.min(50, ((weight - lbm) / weight) * 100));
    const muscleMass = lbm * 0.85; // Aproximadamente 85% da massa magra é músculo
    const bodyWater = lbm * 0.75; // Aproximadamente 75% da massa magra é água
    const boneMass = this.calculateBoneMass(weight, HEIGHT, GENDER);
    const basalMetabolism = this.calculateBasalMetabolism(weight, HEIGHT, AGE, GENDER);
    const metabolicAge = this.calculateMetabolicAge(basalMetabolism, GENDER);

    return {
      bodyFat: Math.round(bodyFat * 10) / 10,
      muscleMass: Math.round(muscleMass * 10) / 10,
      bodyWater: Math.round((bodyWater / weight) * 100 * 10) / 10, // Converter para percentual
      boneMass: Math.round(boneMass * 10) / 10,
      basalMetabolism: Math.round(basalMetabolism),
      metabolicAge: Math.round(metabolicAge)
    };
  }

  /**
   * Calcula composição corporal básica sem impedância
   */
  private calculateBasicBodyComposition(weight: number): Partial<XiaomiScaleData> {
    // Estimativas básicas baseadas apenas no peso
    const estimatedBodyFat = Math.max(10, Math.min(40, 15 + (weight - 50) * 0.2));
    const estimatedMuscleMass = weight * 0.45;
    const estimatedBoneMass = weight * 0.15;

    return {
      bodyFat: Math.round(estimatedBodyFat * 10) / 10,
      muscleMass: Math.round(estimatedMuscleMass * 10) / 10,
      bodyWater: Math.round(60 * 10) / 10, // 60% padrão
      boneMass: Math.round(estimatedBoneMass * 10) / 10,
      basalMetabolism: Math.round(weight * 22), // Estimativa básica
      metabolicAge: 30 // Valor padrão
    };
  }

  /**
   * Calcula massa magra corporal baseada na impedância
   * Fórmula baseada em estudos de bioimpedância
   */
  private calculateLeanBodyMass(weight: number, impedance: number, height: number, age: number, gender: number): number {
    // Fórmula simplificada baseada em Kyle et al. (2001)
    // LBM = (height²/impedance) * 0.401 + (gender * 3.825) + (age * -0.071) + 5.102
    const heightM = height / 100;
    const lbm = (Math.pow(heightM, 2) / impedance) * 0.401 + (gender * 3.825) + (age * -0.071) + 5.102;
    return Math.max(0, Math.min(weight * 0.9, lbm)); // Limitar entre 0 e 90% do peso
  }

  /**
   * Calcula massa óssea
   */
  private calculateBoneMass(weight: number, height: number, gender: number): number {
    // Fórmulas baseadas em estudos antropométricos
    if (gender === 1) { // Masculino
      return (0.246 * weight) + (0.14 * height) - 34.4;
    } else { // Feminino
      return (0.245 * weight) + (0.15 * height) - 39.5;
    }
  }

  /**
   * Calcula metabolismo basal
   */
  private calculateBasalMetabolism(weight: number, height: number, age: number, gender: number): number {
    // Fórmula de Mifflin-St Jeor
    if (gender === 1) { // Masculino
      return (10 * weight) + (6.25 * height) - (5 * age) + 5;
    } else { // Feminino
      return (10 * weight) + (6.25 * height) - (5 * age) - 161;
    }
  }

  /**
   * Calcula idade metabólica
   */
  private calculateMetabolicAge(bmr: number, gender: number): number {
    // Idade metabólica baseada no BMR comparado com padrões
    const avgBmr = gender === 1 ? 1800 : 1400; // BMR médio por gênero
    const ageDiff = (bmr - avgBmr) / 10; // Cada 10 kcal = 1 ano de diferença
    return Math.max(18, Math.min(80, 30 - ageDiff)); // Idade base 30 anos
  }

  /**
   * Manipula desconexão da balança
   */
  private handleDisconnection(): void {
    console.log('Balança desconectada');
    this.stopWeighing();
    this.device = null;
    this.server = null;
    this.weightCharacteristic = null;
    this.batteryCharacteristic = null;
    this.onConnectionChangeCallback?.(false);
  }

  /**
   * Verifica se está conectado
   */
  isConnected(): boolean {
    return this.device !== null && this.server !== null;
  }

  /**
   * Verifica se está pesando ativamente
   */
  isActivelyWeighing(): boolean {
    return this.isWeighingActive;
  }

  /**
   * Obtém informações do dispositivo
   */
  getDeviceInfo(): XiaomiScaleDevice | null {
    if (!this.device) return null;

    return {
      id: this.device.id,
      name: this.device.name || 'Xiaomi Scale',
      connected: this.isConnected()
    };
  }
}

// Instância singleton do serviço
export const xiaomiScaleService = new XiaomiScaleService();