import { Injectable } from '@angular/core';
import { BleClient, BleDevice, dataViewToText } from '@capacitor-community/bluetooth-le';
import { BombsConfig } from '../models/bombs';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BluetoothService {
  private device: BleDevice | null = null;
  private readonly SERVICE_UUID = "12345678-1234-5678-1234-56789abcdef0";
  private readonly CHARACTERISTIC_UUID = "abcd1234-5678-90ab-cdef-1234567890ab";
  private readonly LOG_CHARACTERISTIC_UUID = "fedcba98-7654-3210-fedc-ba9876543210";


  private connectionStatusSubject = new Subject<boolean>();
  public connectionStatus$ = this.connectionStatusSubject.asObservable();
  
  constructor() {}

  async initializeBluetooth() {
    try {
      await BleClient.initialize();
      console.log("✅ Bluetooth inicializado!");
      console.log("📌 Permissões de LE Scan já resolvidas no Capacitor 5");
    } catch (error) {
      console.error("❌ Erro ao inicializar Bluetooth:", error);
    }
  }

  async scanAndConnect() {
    try {
      this.device = await BleClient.requestDevice({
        services: [this.SERVICE_UUID]
      });

      if (this.device) {
        console.log("🔍 Dispositivo encontrado:", this.device);
        await BleClient.connect(this.device.deviceId);
        console.log("✅ Conectado ao ESP32!");
        await new Promise(resolve => setTimeout(resolve, 500));
        this.connectionStatusSubject.next(true);
      }
    } catch (error) {
      console.error("❌ Erro ao conectar ao Bluetooth:", error);
      this.connectionStatusSubject.next(false);
    }
  }

  async getTime(): Promise<string> {
    if (!this.device) {
      console.error("❌ Nenhum dispositivo conectado!");
      return "Erro";
    }

    try {
      const value = await BleClient.read(this.device.deviceId, this.SERVICE_UUID, this.CHARACTERISTIC_UUID);
      return dataViewToText(value); // Converte os dados recebidos para string
    } catch (error) {
      console.error("❌ Erro ao obter horário via Bluetooth:", error);
      return "Erro";
    }
  }

  async getBombsConfig(): Promise<BombsConfig | null> {
    if (!this.device) {
      console.error("❌ Nenhum dispositivo conectado!");
      return null;
    }
  
    try {
      // Lê os dados do ESP32
      const value = await BleClient.read(
        this.device.deviceId,
        this.SERVICE_UUID,
        "dcba4321-8765-4321-abcd-0987654321ef"  // UUID de configuração
      );
  
      const jsonString = dataViewToText(value);
      console.log("📥 Configuração recebida do ESP32:", jsonString);
  
      // Converte para objeto e retorna
      return JSON.parse(jsonString) as BombsConfig;
    } catch (error) {
      console.error("❌ Erro ao obter configuração:", error);
      return null;
    }
  }
  

  async setBombsConfig(config: BombsConfig) {
    if (!this.device) {
        console.error("❌ Nenhum dispositivo conectado!");
        return;
    }

    try {
        const data = JSON.stringify(config);
        const encoder = new TextEncoder();
        const uint8Array = encoder.encode(data);
        const dataView = new DataView(uint8Array.buffer);  // Converte para DataView

        await BleClient.write(
            this.device.deviceId,
            this.SERVICE_UUID,
            "dcba4321-8765-4321-abcd-0987654321ef",
            dataView  // Agora enviando um DataView
        );

        console.log("✅ Configuração das bombas enviada para o ESP32!");
    } catch (error) {
        console.error("❌ Erro ao enviar configuração:", error);
    }
}

async setTime(time: string) {
  if (!this.device) {
    console.error("❌ [setTime] Nenhum dispositivo conectado!");
    return;
  }
  try {
    const encoder = new TextEncoder();
    const dataView = new DataView(encoder.encode(time).buffer);
    await BleClient.write(
      this.device.deviceId,
      this.SERVICE_UUID,
      "abcd1234-5678-90ab-cdef-1234567890ab",
      dataView
    );
    console.log("✅ [setTime] Hora enviada para o ESP32:", time);
  } catch (error) {
    console.error("❌ [setTime] Erro ao enviar hora:", error);
  }
}


async testBomb(bomb: number, dosagem: number): Promise<void> {
  if (!this.device) {
    console.error("❌ Nenhum dispositivo conectado!");
    return;
  }
  try {
    const comando = { bomb: bomb, dosagem: dosagem };
    const jsonString = JSON.stringify(comando);
    console.log("📤 Enviando comando de teste:", jsonString);

    const encoder = new TextEncoder();
    const uint8Array = encoder.encode(jsonString);
    const dataView = new DataView(uint8Array.buffer);

    await BleClient.write(
      this.device.deviceId,
      this.SERVICE_UUID,
      "efab4321-8765-4321-abcd-0987654321ff", // UUID de teste
      dataView
    );

    console.log("✅ Comando de teste enviado!");

    // Aguarda resposta do ESP32
    const response = await BleClient.read(
      this.device.deviceId,
      this.SERVICE_UUID,
      "efab4321-8765-4321-abcd-0987654321ff"
    );
    console.log("📥 Resposta do ESP32:", dataViewToText(response));
  } catch (error) {
    console.error("❌ Erro ao enviar comando de teste:", error);
  }
}

async calibrateBomb(bombIndex: number) {
  if (!this.device) {
    console.error("❌ Nenhum dispositivo conectado!");
    return;
  }

  try {
    console.log(`🚰 Iniciando calibração da bomba ${bombIndex + 1}...`);

    // Envia comando para acionar a bomba e dosar 1ml
    await this.testBomb(bombIndex, 1);

    // Solicita ao usuário a quantidade real dosada
    const userInput = prompt("Digite a quantidade REAL dosada (ml):");
    if (!userInput) {
      console.warn("⚠️ Calibração cancelada pelo usuário.");
      return;
    }

    const measuredMl = parseFloat(userInput);
    if (isNaN(measuredMl) || measuredMl <= 0) {
      console.error("❌ Entrada inválida para calibração!");
      return;
    }

    // Calcula o novo coeficiente de calibração (regra de 3)
    const newCoef = 1 / measuredMl;
    console.log(`📏 Novo coeficiente de calibração da bomba ${bombIndex + 1}:`, newCoef);

    // Obtém a configuração atual das bombas
    let config = await this.getBombsConfig();
    if (!config) {
      console.error("❌ Não foi possível obter a configuração atual.");
      return;
    }

    // Atualiza o coeficiente da bomba selecionada
    switch (bombIndex) {
      case 0: config.bomb1.calibrCoef = newCoef; break;
      case 1: config.bomb2.calibrCoef = newCoef; break;
      case 2: config.bomb3.calibrCoef = newCoef; break;
      default: return;
    }

    // ✅ Envia a nova configuração ao ESP32 e aguarda resposta
    await this.setBombsConfig(config);
    console.log(`✅ Calibração da bomba ${bombIndex + 1} concluída!`);

    // ✅ Verifica se o ESP32 recebeu corretamente
    const updatedConfig = await this.getBombsConfig();
    console.log("📥 Configuração atualizada recebida:", updatedConfig);
  } catch (error) {
    console.error("❌ Erro na calibração da bomba:", error);
  }
}

async getLog(): Promise<string> {
  if (!this.device) {
    console.error("❌ Nenhum dispositivo conectado!");
    return "";
  }
  try {
    const value = await BleClient.read(
      this.device.deviceId,
      this.SERVICE_UUID,
      this.LOG_CHARACTERISTIC_UUID
    );
    const logString = dataViewToText(value);
    console.log("📥 Log recebido do ESP32:", logString);
    return logString;
  } catch (error) {
    console.error("❌ Erro ao obter log:", error);
    return "";
  }
}
 

isConnected(): boolean {
  return this.device !== null;
}
}
