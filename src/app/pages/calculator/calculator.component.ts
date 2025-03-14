import { Component, OnInit } from '@angular/core';
import { SharedModule } from 'src/app/shared/shared.module';

@Component({
  selector: 'app-calculator',
  templateUrl: './calculator.component.html',
  styleUrls: ['./calculator.component.scss'],
  imports: [SharedModule]
})
export class CalculatorComponent  implements OnInit {

  quantidadeSal: number = 0;
  litrosAgua: number = 0;
  gramasLitro: number = 0;

  constructor() { }

  ngOnInit() {}

}
