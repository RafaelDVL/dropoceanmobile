import { Injectable } from '@angular/core';
import { Http } from '@capacitor-community/http';

@Injectable({
  providedIn: 'root'
})
export class WifiApService {
  private readonly esp32Url = 'http://192.168.4.1'; // IP do ESP32 AP

  async getTime(): Promise<any> {
    try {
      const response = await Http.get({ url: `${this.esp32Url}/getTime` });
      console.log("Resposta do ESP32:", response);
      return response.data;
    } catch (error) {
      console.error("Erro na requisição HTTP:", error);
      alert(`Erro Capacitor HTTP: ${JSON.stringify(error)}`);
      throw error;
    }
  }
}
