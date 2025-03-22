import { Component } from '@angular/core';
import { Platform, ToastController } from '@ionic/angular';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { App } from '@capacitor/app';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [IonApp, IonRouterOutlet],
})
export class AppComponent {
  lastBackPress = 0;
  timePeriodToExit = 2000; // 2 segundos

  constructor(private platform: Platform, private toastController: ToastController) {
    this.platform.ready().then(() => {
      this.handleBackButton();
    });
  }

  handleBackButton() {
    this.platform.backButton.subscribeWithPriority(10, async () => {
      const currentTime = new Date().getTime();

      if (currentTime - this.lastBackPress < this.timePeriodToExit) {
        App.exitApp(); // Método correto para fechar o app no Capacitor
      } else {
        this.lastBackPress = currentTime;
        const toast = await this.toastController.create({
          message: 'Pressione novamente para sair',
          duration: 2000,
          position: 'bottom',
        });
        await toast.present();
      }
    });
  }
}
