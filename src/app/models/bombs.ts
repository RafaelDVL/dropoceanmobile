export class Bomb {
  time: { hour: number, minute: number } = { hour: 0, minute: 0 };
  dosagem: number = 1;
  diasSemanaSelecionados: boolean[] = [false, false, false, false, false, false, false];
  status: boolean = false;
  calibrCoef: number = 1;  // Novo coeficiente de calibração
}

export class BombsConfig {
  bomb1: Bomb = new Bomb();
  bomb2: Bomb = new Bomb();
  bomb3: Bomb = new Bomb();
}