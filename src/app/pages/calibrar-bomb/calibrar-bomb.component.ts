import { Component, OnInit } from '@angular/core';
import { BluetoothService } from 'src/app/services/bluetooth.service';
import { SharedModule } from 'src/app/shared/shared.module';
import { NavController, Platform  } from '@ionic/angular';

@Component({
  standalone: true,
  selector: 'app-calibrar-bomb',
  templateUrl: './calibrar-bomb.component.html',
  styleUrls: ['./calibrar-bomb.component.scss'],
  imports: [SharedModule]
})
export class CalibrarBombComponent  implements OnInit {

  selectedBombTeste: number | null = null;
  selectedDosage: number | null = null;

  constructor(private serviceBLE: BluetoothService,
    private navController: NavController,private platform: Platform ) {
      this.platform.backButton.subscribeWithPriority(10, () => {
        this.navController.navigateBack('/config');
      });
     }

  ngOnInit() {}


  calibrate() {
    const selectedBomb = parseInt((document.querySelector('ion-select') as HTMLIonSelectElement).value, 10);
    if (!selectedBomb) {
      console.error("❌ Nenhuma bomba selecionada!");
      return;
    }
    this.serviceBLE.calibrateBomb(selectedBomb - 1);
  }

  testBomb() {
    if (this.selectedBombTeste === null || this.selectedDosage === null) {
      console.error("❌ Selecione uma bomba e uma dosagem antes de testar!");
      return;
    }

    console.log(`📤 Enviando teste para Bomba ${this.selectedBombTeste} dosando ${this.selectedDosage} ml`);
    this.serviceBLE.testBomb(this.selectedBombTeste - 1, this.selectedDosage);
  }

  cancelar() {
    this.navController.navigateBack('/config');
  }
}
