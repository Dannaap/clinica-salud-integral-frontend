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
      import('./features/pacientes/pacientes.routes').then(
        (m) => m.pacientesRoutes
      ),
  },
  // Rutas de Dashboard por rol
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
    path: 'dashboard/recepcion',
    redirectTo: 'dashboard/reception',
    pathMatch: 'full',
  },
  {
    path: 'dashboard/medical',
    loadComponent: () =>
      import('./features/dashboard/medical/medical').then((m) => m.MedicalComponent),
  },
  {
    path: 'dashboard/medico',
    redirectTo: 'dashboard/medical',
    pathMatch: 'full',
  },
  {
    path: 'dashboard',
    redirectTo: 'dashboard/admin',
    pathMatch: 'full',
  },
  // Rutas bajo el layout de administración
  {
    path: '',
    loadComponent: () =>
      import('./shared/components/layout/admin-layout').then(
        (m) => m.AdminLayoutComponent
      ),
    children: [
      {
        path: 'usuarios',
        loadComponent: () =>
          import('./features/usuarios/listado/usuarios-listado').then(
            (m) => m.UsuariosListadoComponent
          ),
      },
      { path: 'citas', redirectTo: 'dashboard/admin' },
      { path: 'turnos', redirectTo: 'dashboard/admin' },
      { path: 'atenciones', redirectTo: 'dashboard/medical' },
      { path: 'reportes', redirectTo: 'dashboard/admin' },
      { path: 'perfil', redirectTo: 'dashboard/admin' },
    ],
  },
  { path: '**', redirectTo: 'login' },
];
