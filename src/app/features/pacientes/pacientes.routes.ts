import { Routes } from '@angular/router';

export const pacientesRoutes: Routes = [
  {
    path: '',
    redirectTo: 'listado',
    pathMatch: 'full',
  },
  {
    path: 'listado',
    title: 'Pacientes | Clínica Salud Integral',
    loadComponent: () =>
      import('./listado/listado').then((m) => m.Listado),
  },
  {
    path: 'registro',
    title: 'Registrar paciente | Clínica Salud Integral',
    loadComponent: () =>
      import('./registro/registro').then((m) => m.Registro),
  },
];
