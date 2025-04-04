import { Component } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent } from '@ionic/angular/standalone';
import { NgbToastModule } from '@ng-bootstrap/ng-bootstrap';
import { SharedModule } from '../shared/shared.module';
import { Router } from '@angular/router';

import { BluetoothService } from '../services/bluetooth.service';
import { PermissionService } from '../services/permission.service';


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
  isConnected = false;
  time: string = 'Carregando...';

  constructor(
    private bluetoothService: BluetoothService,
    private permissionService: PermissionService,
    private router: Router
  ) {}

  async ngOnInit() {
    await this.bluetoothService.initializeBluetooth();
    this.bluetoothService.connectionStatus$.subscribe((connected) => {
      this.isConnected = connected;
      this.abrirToastSucess();
    });
  }

  async connectToESP32() {
    const permsOK = await this.permissionService.checkAndRequestPermissions();
    if (!permsOK) {
      alert('❌ Permissões de Bluetooth e Localização não concedidas.');
      return;
    }

    const gpsAtivo = await this.permissionService.isGpsEnabled();
    if (!gpsAtivo) {
      alert('❗ O GPS precisa estar ativado para escanear dispositivos Bluetooth.');
      return;
    }

    await this.bluetoothService.scanAndConnect();
  }

  async fetchTime() {
    this.time = await this.bluetoothService.getTime();
  }

  onClick() {
    this.router.navigate(['/config']);
  }

  abrirToastSucess() {
    this.showSucess = true;
  }

  abrirToastError() {
    this.showError = true;
  }
}
