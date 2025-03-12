import { Component, OnInit } from '@angular/core';
import { SharedModule } from 'src/app/shared/shared.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { Bomb, BombsConfig } from 'src/app/models/bombs';
import { BluetoothService } from 'src/app/services/bluetooth.service';
import { addIcons } from 'ionicons';
import { logoIonic, refreshOutline, flaskOutline, saveOutline, arrowBackOutline, powerOutline } from 'ionicons/icons';
import { Router, RouterModule } from '@angular/router';
import { ToastController} from '@ionic/angular';
import { NgbToastModule } from '@ng-bootstrap/ng-bootstrap';

@Component({
  standalone: true,
  selector: 'app-configuracao-bombs',
  templateUrl: './configuracao-bombs.component.html',
  styleUrls: ['./configuracao-bombs.component.scss'],
  imports: [SharedModule, NgbModule, RouterModule, NgbToastModule],
})
export class ConfiguracaoBombsComponent implements OnInit {
  showSucess = false;
  showError = false;

  horaAtualESP: string = 'Carregando...';
  bombas: Bomb[] = [];
  bombsConfig: BombsConfig = new BombsConfig();
  diasSemana: string[] = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  constructor(
    private readonly bluetoothService: BluetoothService,
    private readonly router: Router,
    private toastController: ToastController
  ) {
    addIcons({refreshOutline,powerOutline,flaskOutline,saveOutline,arrowBackOutline,logoIonic});
  }

  ngOnInit() {
    this.bombas = [
      this.bombsConfig.bomb1,
      this.bombsConfig.bomb2,
      this.bombsConfig.bomb3,
    ];
    this.carregarConfiguracaoESP();
  }

  async carregarConfiguracaoESP() {
    console.log('🔄 Buscando configurações das bombas no ESP32...');
    const configRecebida = await this.bluetoothService.getBombsConfig();
    if (configRecebida) {
      this.bombsConfig = configRecebida;
      this.bombas = [
        this.bombsConfig.bomb1,
        this.bombsConfig.bomb2,
        this.bombsConfig.bomb3,
      ];
      console.log('✅ Configuração carregada com sucesso!');
    } else {
      console.warn('⚠️ Falha ao carregar configuração do ESP32!');
    }
  }

  normalizarDosagem(dosagem: any): number {
    if (typeof dosagem === 'string') {
      return parseFloat(dosagem.replace(',', '.'));
    }
    return dosagem;
  }

  toggleAtivacao(bomb: Bomb) {
    bomb.status = !bomb.status;
  }

  toggleDia(bomb: Bomb, index: number) {
    bomb.diasSemanaSelecionados[index] = !bomb.diasSemanaSelecionados[index];
  }

  toggleTodos(bomb: Bomb) {
    const todosAtivados = bomb.diasSemanaSelecionados.every(selected => selected);
    bomb.diasSemanaSelecionados = bomb.diasSemanaSelecionados.map(() => !todosAtivados);
  }

  isAllSelected(bomb: Bomb): boolean {
    return bomb.diasSemanaSelecionados.every(selected => selected);
  }

  async sincronizarHoraESP() {
    if (!this.bluetoothService.isConnected()) {
      console.warn('⚠️ ESP32 não está conectado. Não foi possível sincronizar.');
      return;
    }
    const agora = new Date();
    const horaFormatada = `${agora.getHours()}:${agora.getMinutes()}:${agora.getSeconds()}`;
    console.log('⏳ Enviando hora para ESP32:', horaFormatada);
    try {
      await this.bluetoothService.setTime(horaFormatada);
      console.log('✅ Hora sincronizada com ESP32!');
      this.atualizarHoraESP();
    } catch (error) {
      console.error('❌ Erro ao sincronizar hora:', error);
    }
  }

  async atualizarHoraESP() {
    if (!this.bluetoothService.isConnected()) {
      console.warn('⚠️ ESP32 não está conectado. Não foi possível obter a hora.');
      return;
    }
    this.horaAtualESP = await this.bluetoothService.getTime();
  }

  async salvarConfiguracao() {
    try {
      const configSemSegundos = JSON.parse(JSON.stringify(this.bombsConfig));
      Object.values(configSemSegundos).forEach((bomb: any) => {
        bomb.dosagem = this.normalizarDosagem(bomb.dosagem);
        delete bomb.time.second;
      });
      console.log('📡 Enviando configuração para ESP32...');
      await this.bluetoothService.setBombsConfig(configSemSegundos);
      console.log('✅ Configuração enviada!');
      this.abrirToastSucess();
    } catch (error) {
      console.error('❌ Erro ao salvar configuração:', error);
      this.abrirToastError();
    }
  }

  abrirToastSucess() {
    this.showSucess = true;
  }

  abrirToastError() {
    this.showError = true;
  }
}
