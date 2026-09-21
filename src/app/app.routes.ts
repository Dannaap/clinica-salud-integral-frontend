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
    path: 'dashboard/recepcion',
    loadComponent: () =>
      import('./features/dashboard/reception/reception').then((m) => m.ReceptionComponent),
  },
  {
    path: 'dashboard/medico',
    loadComponent: () =>
      import('./features/dashboard/medical/medical').then((m) => m.MedicalComponent),
  },
  // Alias legacy (por si alguien tiene la URL vieja en el navegador)
  { path: 'dashboard/reception', redirectTo: 'dashboard/recepcion', pathMatch: 'full' },
  { path: 'dashboard/medical', redirectTo: 'dashboard/medico', pathMatch: 'full' },
  { path: '**', redirectTo: 'login' },
];