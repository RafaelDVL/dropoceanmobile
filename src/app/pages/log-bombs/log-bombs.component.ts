import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { BluetoothService } from 'src/app/services/bluetooth.service';


@Component({
  selector: 'app-log-bombs',
  templateUrl: './log-bombs.component.html',
  styleUrls: ['./log-bombs.component.scss'],
  imports: [CommonModule]
})
export class LogBombsComponent  implements OnInit {

  logs: string[] = [];

  constructor(private bluetoothService: BluetoothService) { }

  ngOnInit() {
    this.getLogFromESP32();
  }

  async getLogFromESP32() {
    try {
      const logString = await this.bluetoothService.getLog();
      console.log("📥 Log recebido do ESP32:", logString);
      
      // ✅ Garante que o logString é uma string antes de manipular
      if (typeof logString === 'string' && logString.trim() !== '') {
        this.logs = logString.split('\n').map(log => log.trim()); // Remove espaços extras
      } else {
        this.logs = [];
        console.warn("⚠️ Nenhum log válido recebido.");
      }
  
      console.log("📋 Lista de logs processada:", this.logs);
    } catch (error) {
      console.error('❌ Erro ao obter o log:', error);
      this.logs = [];
    }
  }

}
