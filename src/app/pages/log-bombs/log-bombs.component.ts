import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/app/shared/shared.module';
import { NavController, Platform } from '@ionic/angular';
import {
  FirebaseLogService,
  LogEntry,
} from 'src/app/services/firebaseLog.service';

@Component({
  selector: 'app-log-bombs',
  templateUrl: './log-bombs.component.html',
  styleUrls: ['./log-bombs.component.scss'],
  standalone: true,
  imports: [CommonModule, SharedModule],
})
export class LogBombsComponent implements OnInit {
  logs: LogEntry[] = [];

  constructor(
    private firebaseLogService: FirebaseLogService,
    private navController: NavController,
    private platform: Platform
  ) {
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
  const fetchedLogs = await this.firebaseLogService.getLogs();
  this.logs = fetchedLogs.sort((a, b) => {
    const dateA = this.parseDate(a.ts);
    const dateB = this.parseDate(b.ts);
    return dateB.getTime() - dateA.getTime(); // Mais recente primeiro
  });
}

parseDate(timestamp: string): Date {
  // Esperado no formato 'DD/MM/YYYY HH:mm'
  const [data, hora] = timestamp.split(' ');
  const [dia, mes, ano] = data.split('/').map(Number);
  const [h, m] = hora.split(':').map(Number);
  return new Date(ano, mes - 1, dia, h, m);
}

  async clearLogs() {
    await this.firebaseLogService.clearLogs();
    this.getLogs();
  }

  cancelar() {
    this.navController.navigateBack('/config');
  }

  getTextClass(bomba: string): string {
    switch (bomba) {
      case 'Bomba 1':
        return 'bomba1';
      case 'Bomba 2':
        return 'bomba2';
      case 'Bomba 3':
        return 'bomba3';
      default:
        return '';
    }
  }

  formatTimestamp(ts: string): string {
    const parts = ts.split(':');
    if (parts.length === 2) {
      const hora = parts[0].padStart(2, '0');
      const minuto = parts[1].padStart(2, '0');
      return `${hora}:${minuto}`;
    }
    return ts; // retorna o original caso não esteja no formato esperado
  }
}
