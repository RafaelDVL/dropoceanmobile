export class Bomb {
  time: { hour: number, minute: number } = { hour: 0, minute: 0 };
  dosagem: number = 1;
  diasSemanaSelecionados: boolean[] = [false, false, false, false, false, false, false];
  status: boolean = false;
  name: string = 'nome';
  quantidadeEstoque: number = 0;
  calibrCoef: number = 1;
}

export class BombsConfig {
  bomb1: Bomb = new Bomb();
  bomb2: Bomb = new Bomb();
  bomb3: Bomb = new Bomb();
}