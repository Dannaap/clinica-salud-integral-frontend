import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login').then((m) => m.Login),
  },
  //--Ruta de dashboard para el rol de administrador
  {
    path: 'dashboard/admin',
    loadComponent: () =>
      import('./features/dashboard/admin/admin').then((m) => m.AdminComponent),
  },
  //--Ruta de dashboard para el rol de recepcionista
  {
    path: 'dashboard/reception',
    loadComponent: () =>
      import('./features/dashboard/reception/reception').then((m) => m.ReceptionComponent),
  },
  //--Ruta de dashboard para el rol de médico
  {
    path: 'dashboard/medical',
    loadComponent: () =>
      import('./features/dashboard/medical/medical').then((m) => m.MedicalComponent),
  },
  { path: '**', redirectTo: 'login' },
];