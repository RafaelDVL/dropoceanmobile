import { Component, OnDestroy, OnInit } from '@angular/core';
import { SharedModule } from 'src/app/shared/shared.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { Bomb, BombsConfig } from 'src/app/models/bombs';
import { BluetoothService } from 'src/app/services/bluetooth.service';
import { addIcons } from 'ionicons';

import {
  logoIonic,
  refreshOutline,
  flaskOutline,
  saveOutline,
  arrowBackOutline,
  powerOutline,
  calculator,
  receipt, timeOutline, wifi, cloudDone } from 'ionicons/icons';
import { Router, RouterModule } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { NgbToastModule } from '@ng-bootstrap/ng-bootstrap';
import { AlertController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { StatusPayload } from 'src/app/models/StatusPayload';

@Component({
  standalone: true,
  selector: 'app-configuracao-bombs',
  templateUrl: './configuracao-bombs.component.html',
  styleUrls: ['./configuracao-bombs.component.scss'],
  imports: [SharedModule, NgbModule, RouterModule, NgbToastModule],
})

export class ConfiguracaoBombsComponent implements OnInit, OnDestroy {

  status: StatusPayload = { time: '', wifi: {connected:false,rssi:0}, firebase: {ready:false} };
  private sub: Subscription = new Subscription();

  

  showSuccess = false;
  showError = false;

  horaAtualESP: string = 'Carregando...';
  bombas: Bomb[] = [];
  bombsConfig: BombsConfig = new BombsConfig();
  diasSemana: string[] = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  constructor(
    public readonly bluetoothService: BluetoothService,
    private readonly router: Router,
    private toastController: ToastController,
    private alertController: AlertController
  ) {
    addIcons({timeOutline,refreshOutline,powerOutline,flaskOutline,saveOutline,receipt,calculator,arrowBackOutline,logoIonic,wifi,cloudDone});
  }

  async ngOnInit() {
  
    const agora = await this.bluetoothService.getTime();
    this.horaAtualESP = agora;
    this.sub.add(
      this.bluetoothService.status$.subscribe(s => this.status = s)
    );

    await this.bluetoothService.fetchStatusOnce();

    this.bluetoothService.startTimeNotifications();
    
    this.bombas = [
      this.bombsConfig.bomb1,
      this.bombsConfig.bomb2,
      this.bombsConfig.bomb3,
    ];
    this.carregarConfiguracaoESP();
  }

  async ngOnDestroy() {
    // Limpa notificações
    await this.bluetoothService.stopTimeNotifications();
    if (this.sub) {
      this.sub.unsubscribe();
    }
  }

  pinFormatter(value: number) {
    return value;
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

      this.bombas.forEach((bomb, index) => {
        bomb.name = bomb.name || `Bomba ${index + 1}`; // Nome padrão caso não tenha sido configurado
        bomb.quantidadeEstoque = bomb.quantidadeEstoque ?? 0; // Garante que o estoque nunca seja indefinido
      });
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
    const todosAtivados = bomb.diasSemanaSelecionados.every(
      (selected) => selected
    );
    bomb.diasSemanaSelecionados = bomb.diasSemanaSelecionados.map(
      () => !todosAtivados
    );
  }

  isAllSelected(bomb: Bomb): boolean {
    return bomb.diasSemanaSelecionados.every((selected) => selected);
  }

  async sincronizarHoraESP() {
    if (!this.bluetoothService.isConnected()) {
      console.warn(
        '⚠️ ESP32 não está conectado. Não foi possível sincronizar.'
      );
      return;
    }

    const agora = new Date();

    const dia = String(agora.getDate()).padStart(2, '0');
    const mes = String(agora.getMonth() + 1).padStart(2, '0');
    const ano = agora.getFullYear();
    const hora = String(agora.getHours()).padStart(2, '0');
    const minuto = String(agora.getMinutes()).padStart(2, '0');
    const segundo = String(agora.getSeconds()).padStart(2, '0');

    const dataHoraFormatada = `${dia}/${mes}/${ano} ${hora}:${minuto}:${segundo}`;
    console.log('⏳ Enviando data e hora para ESP32:', dataHoraFormatada);

    try {
      await this.bluetoothService.setTime(dataHoraFormatada);
      console.log('✅ Hora sincronizada com ESP32!');
      this.atualizarHoraESP();
    } catch (error) {
      console.error('❌ Erro ao sincronizar hora:', error);
    }
  }

  async atualizarHoraESP() {
    if (!this.bluetoothService.isConnected()) {
      console.warn(
        '⚠️ ESP32 não está conectado. Não foi possível obter a hora.'
      );
      return;
    }
    this.horaAtualESP = await this.bluetoothService.getTime();
  }

  async salvarConfiguracao() {
    try {
      const configSemSegundos = JSON.parse(JSON.stringify(this.bombsConfig));

      Object.values(configSemSegundos).forEach((bomb: any) => {
        bomb.dosagem = this.normalizarDosagem(bomb.dosagem);
        bomb.calibrCoef = parseFloat(bomb.calibrCoef.toFixed(2)); // 🔹 Arredonda para 2 casas decimais
        delete bomb.time.second;
      });

      console.log('📡 Enviando configuração para ESP32:', configSemSegundos);
      await this.bluetoothService.setBombsConfig(configSemSegundos);
      console.log('✅ Configuração enviada!');
      this.abrirToastSucess();
    } catch (error) {
      console.error('❌ Erro ao salvar configuração:', error);
      this.abrirToastError();
    }
  }

  irParaLog() {
    this.router.navigate(['/log']);
  }

  irParaCalculadora() {
    this.router.navigate(['/calc']);
  }

  async ajusteNome(bomb: Bomb) {
    const alert = await this.alertController.create({
      header: 'Editar Nome',
      inputs: [
        {
          name: 'name',
          type: 'text',
          value: bomb.name,
          placeholder: 'Digite o nome da bomba',
        },
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Salvar',
          handler: (data) => {
            if (data.name.trim() !== '') {
              bomb.name = data.name.trim();
              console.log(`✅ Nome atualizado: ${bomb.name}`);
              this.salvarConfiguracao();
            }
          },
        },
      ],
    });
    await alert.present();
  }

  async ajusteEstoque(bomb: Bomb) {
    const alert = await this.alertController.create({
      header: 'Editar Estoque',
      inputs: [
        {
          name: 'quantidadeEstoque',
          type: 'number',
          value: bomb.quantidadeEstoque,
          placeholder: 'Digite a quantidade em ml',
          min: 0,
        },
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Salvar',
          handler: (data) => {
            const estoque = parseFloat(data.quantidadeEstoque);
            if (!isNaN(estoque) && estoque >= 0) {
              bomb.quantidadeEstoque = estoque;
              console.log(
                `✅ Estoque atualizado: ${bomb.quantidadeEstoque} ml`
              );
              this.salvarConfiguracao(); // 🔹 Salva imediatamente após editar
            } else {
              console.warn('⚠️ Valor inválido para estoque.');
            }
          },
        },
      ],
    });
    await alert.present();
  }

  async ajusteDosagem(bomb: Bomb) {
    const alert = await this.alertController.create({
      header: 'Editar Dosagem',
      inputs: [
        {
          name: 'dosagem',
          type: 'number',
          value: bomb.dosagem,
          placeholder: 'Digite a dosagem (ml)',
          min: 0.5,
          max: 15,
        },
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Salvar',
          handler: (data) => {
            const dosagem = parseFloat(data.dosagem);
            if (!isNaN(dosagem) && dosagem >= 0.5 && dosagem <= 15) {
              bomb.dosagem = dosagem;
              console.log(`✅ Dosagem atualizada: ${bomb.dosagem} ml`);
            } else {
              console.warn(
                '⚠️ Valor inválido! A dosagem deve estar entre 0.5 e 15 ml.'
              );
            }
          },
        },
      ],
    });
    await alert.present();
  }

  getBombaColor(index: number): string {
    const cores = ['tertiary', 'warning', 'secondary']; // Definição das cores
    return cores[index % cores.length]; // Retorna a cor correspondente
  }

  abrirToastSucess() {
    this.showSuccess = true;
  }

  abrirToastError() {
    this.showError = true;
  }
}
