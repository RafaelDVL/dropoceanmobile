import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BluetoothService } from 'src/app/services/bluetooth.service';
import { SharedModule } from 'src/app/shared/shared.module';
import { LogEntry } from 'src/app/models/log-entry';
import { NavController, Platform   } from '@ionic/angular';


@Component({
  selector: 'app-log-bombs',
  templateUrl: './log-bombs.component.html',
  styleUrls: ['./log-bombs.component.scss'],
  imports: [CommonModule, SharedModule]
})
export class LogBombsComponent  implements OnInit {

  logs: LogEntry[] = [];

  constructor(private bluetoothService: BluetoothService,
    private navController: NavController,private platform: Platform ) {
      this.platform.ready().then(() => {
        this.platform.backButton.subscribeWithPriority(10, () => {
          this.navController.navigateBack('/config');
        });
      });
      }

  ngOnInit() {
    this.getLogs();
  }

  async getLogs() {
    this.logs = await this.bluetoothService.getLog();
  }

  async clearLogs() {
    await this.bluetoothService.clearLogs();
  }

  cancelar() {
    this.navController.navigateBack('/config');
  }

}
