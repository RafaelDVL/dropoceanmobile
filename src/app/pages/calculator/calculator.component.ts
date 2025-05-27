import { Component, OnInit } from '@angular/core';
import { SharedModule } from 'src/app/shared/shared.module';

@Component({
  selector: 'app-calculator',
  templateUrl: './calculator.component.html',
  styleUrls: ['./calculator.component.scss'],
  imports: [SharedModule]
})
export class CalculatorComponent implements OnInit {

  KhInicial: number = 0;
  KhAtual: number = 0;
  diasIntervalo: number = 0;
  KhAlvo: number = 0;
  dosagemDiariaAtual: number = 0;
  dosagemDiariaRecomendada: number = 0;

  constructor() { }

  ngOnInit() {}

  calcularDosagem() {
    const taxaMudancaKh = (this.KhAtual - this.KhInicial) / this.diasIntervalo;
    const ajusteNecessario = this.KhAlvo - this.KhAtual;
    const ajusteDosagem = (ajusteNecessario / taxaMudancaKh) * this.dosagemDiariaAtual / this.diasIntervalo;
    this.dosagemDiariaRecomendada = this.dosagemDiariaAtual - ajusteDosagem;
  }

}