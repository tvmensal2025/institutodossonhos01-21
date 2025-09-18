import { debounce } from 'lodash-es';

interface BluetoothData {
  weight: number;
  bmi?: number;
  bodyFat?: number;
  muscleMass?: number;
  timestamp: Date;
}

class BluetoothService {
  private device: BluetoothDevice | null = null;
  private server: BluetoothRemoteGATTServer | null = null;
  private characteristic: BluetoothRemoteGATTCharacteristic | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 3;
  
  // Callbacks
  public onDataReceived?: (data: BluetoothData) => void;
  public onConnectionStateChange?: (connected: boolean) => void;
  public onError?: (error: Error) => void;
  
  // Debounced data handler
  private handleDataDebounced = debounce((value: DataView) => {
    try {
      const data = this.parseData(value);
      this.onDataReceived?.(data);
    } catch (error) {
      this.onError?.(error as Error);
    }
  }, 300);
  
  private parseData(value: DataView): BluetoothData {
    // Xiaomi Mi Scale 2 data format
    const weight = value.getUint16(1, true) / 200; // Weight in kg
    const impedance = value.getUint16(9, true); // Body impedance
    
    return {
      weight,
      timestamp: new Date()
    };
  }
  
  async connect(): Promise<void> {
    try {
      // Check if already connected
      if (this.isConnected()) {
        console.log('Already connected to device');
        return;
      }
      
      // Request device
      this.device = await navigator.bluetooth.requestDevice({
        filters: [
          { services: ['body_composition'] },
          { namePrefix: 'MI_SCALE' }
        ],
        optionalServices: ['device_information', 'battery_service']
      });
      
      // Add disconnect listener
      this.device.addEventListener('gattserverdisconnected', () => {
        this.handleDisconnection();
      });
      
      // Connect to GATT server
      this.server = await this.device.gatt!.connect();
      this.onConnectionStateChange?.(true);
      
      // Get service and characteristic
      const service = await this.server.getPrimaryService('body_composition');
      this.characteristic = await service.getCharacteristic('weight_measurement');
      
      // Start notifications
      await this.characteristic.startNotifications();
      this.characteristic.addEventListener(
        'characteristicvaluechanged',
        this.handleCharacteristicChange.bind(this)
      );
      
      console.log('Connected to Bluetooth device');
      
    } catch (error) {
      console.error('Connection failed:', error);
      this.onError?.(error as Error);
      throw error;
    }
  }
  
  private handleCharacteristicChange(event: Event) {
    const target = event.target as unknown as BluetoothRemoteGATTCharacteristic;
    if (target && target.value) {
      this.handleDataDebounced(target.value);
    }
  }
  
  private async handleDisconnection() {
    console.log('Device disconnected');
    this.onConnectionStateChange?.(false);
    
    // Auto-reconnect logic
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
      
      setTimeout(async () => {
        try {
          await this.reconnect();
          this.reconnectAttempts = 0;
        } catch (error) {
          console.error('Reconnection failed:', error);
        }
      }, 2000);
    }
  }
  
  async reconnect(): Promise<void> {
    if (this.device && !this.isConnected()) {
      this.server = await this.device.gatt!.connect();
      this.onConnectionStateChange?.(true);
      
      // Re-setup notifications
      const service = await this.server.getPrimaryService('body_composition');
      this.characteristic = await service.getCharacteristic('weight_measurement');
      await this.characteristic.startNotifications();
      
      console.log('Reconnected successfully');
    }
  }
  
  async disconnect(): Promise<void> {
    try {
      if (this.characteristic) {
        await this.characteristic.stopNotifications();
        this.characteristic = null;
      }
      
      if (this.server) {
        this.server.disconnect();
      }
      
      this.server = null;
      this.device = null;
      this.reconnectAttempts = 0;
      this.onConnectionStateChange?.(false);
      
      console.log('Disconnected from Bluetooth device');
      
    } catch (error) {
      console.error('Error during disconnection:', error);
    }
  }
  
  isConnected(): boolean {
    return this.server !== null;
  }
  
  getDevice(): BluetoothDevice | null {
    return this.device;
  }
}

export const bluetoothService = new BluetoothService();