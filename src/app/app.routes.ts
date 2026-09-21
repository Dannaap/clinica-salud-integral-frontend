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
  {
    path: 'dashboard/admin',
    loadComponent: () =>
      import('./features/dashboard/admin/admin').then((m) => m.AdminComponent),
  },
  {
    path: 'dashboard/reception',
    loadComponent: () =>
      import('./features/dashboard/reception/reception').then((m) => m.ReceptionComponent),
  },
  {
    path: 'dashboard/medical',
    loadComponent: () =>
      import('./features/dashboard/medical/medical').then((m) => m.MedicalComponent),
  },
  { path: '**', redirectTo: 'login' },
];