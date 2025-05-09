import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'home',
    loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
  },
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  {
    path: 'config',
    loadComponent: () =>
      import('./pages/configuracao-bombs/configuracao-bombs.component').then(
        (m) => m.ConfiguracaoBombsComponent
      ),
  },
  {
    path: 'calibrar',
    loadComponent: () =>
      import('./pages/calibrar-bomb/calibrar-bomb.component').then(
        (m) => m.CalibrarBombComponent
      ),
  }
  ,
  {
    path: 'calc',
    loadComponent: () =>
      import('./pages/calculator/calculator.component').then(
        (m) => m.CalculatorComponent
      ),
  },
  {
    path: 'log',
    loadComponent: () =>
      import('./pages/log-bombs/log-bombs.component').then(
        (m) => m.LogBombsComponent
      ),
  },
];