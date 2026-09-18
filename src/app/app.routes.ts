import { Routes } from '@angular/router';

export const routes: Routes = [
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
  {
    path: '',
    loadComponent: () =>
      import('./shared/components/layout/admin-layout').then(
        (m) => m.AdminLayoutComponent
      ),
    children: [
      { path: '', redirectTo: 'usuarios', pathMatch: 'full' },
      {
        path: 'usuarios',
        loadComponent: () =>
          import('./features/usuarios/listado/usuarios-listado').then(
            (m) => m.UsuariosListadoComponent
          ),
      },
      { path: 'dashboard', redirectTo: 'usuarios' },
      { path: 'citas', redirectTo: 'usuarios' },
      { path: 'turnos', redirectTo: 'usuarios' },
      { path: 'atenciones', redirectTo: 'usuarios' },
      { path: 'reportes', redirectTo: 'usuarios' },
      { path: 'perfil', redirectTo: 'usuarios' },
    ],
  },
  { path: '**', redirectTo: 'usuarios' },
];
