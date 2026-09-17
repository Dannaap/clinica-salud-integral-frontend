import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login').then((m) => m.Login),
  },
  {
    path: 'pacientes',
    loadChildren: () =>
      import('./features/pacientes/pacientes.routes').then((m) => m.pacientesRoutes),
  },
  { path: '**', redirectTo: 'login' },
];
