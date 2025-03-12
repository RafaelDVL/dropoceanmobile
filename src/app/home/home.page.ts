import { Component } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent } from '@ionic/angular/standalone';
import { SharedModule } from '../shared/shared.module';
import { BluetoothService } from '../services/bluetooth.service';
import { Router } from '@angular/router';
import { NgbToastModule } from '@ng-bootstrap/ng-bootstrap';

@Component({
  standalone: true,
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, SharedModule, NgbToastModule],
})
export class HomePage {

  showSucess = false;
  showError = false;
  isConnected: boolean = false;
  time: string = 'Carregando...';

  constructor(
    private readonly bluetoothService: BluetoothService,
    private readonly router: Router
  ) {}

  async ngOnInit() {
    await this.bluetoothService.initializeBluetooth();
    // Inscreve-se para receber o status de conexão e atualiza a variável local
    this.bluetoothService.connectionStatus$.subscribe(isConnected => {
      this.isConnected = isConnected;
      this.abrirToastSucess();
    });
  }

  async connectToESP32() {
    await this.bluetoothService.scanAndConnect();
  }

  async fetchTime() {
    this.time = await this.bluetoothService.getTime();
  }

  // Ao clicar, o usuário decide quando ir para a próxima tela
  onClick() {
    this.router.navigate(['/config']);
  }

  handleKeyDown(event: KeyboardEvent) {}

  abrirToastSucess() {
    this.showSucess = true;
  }

  abrirToastError() {
    this.showError = true;
  }

}
