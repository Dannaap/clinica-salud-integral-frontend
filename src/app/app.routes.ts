import { Routes } from '@angular/router';
import { authGuard, rolGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login').then((m) => m.Login),
  },
  {
    path: 'pacientes',
    canActivate: [authGuard],
    loadChildren: () =>
      import('./features/pacientes/pacientes.routes').then(
        (m) => m.pacientesRoutes
      ),
  },
  // Rutas de Dashboard por rol
  {
    path: 'dashboard/admin',
    canActivate: [rolGuard(['ADMIN'])],
    loadComponent: () =>
      import('./features/dashboard/admin/admin').then((m) => m.AdminComponent),
  },
  {
    path: 'dashboard/reception',
    canActivate: [rolGuard(['RECEPCION'])],
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
    canActivate: [rolGuard(['MEDICO'])],
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
    canActivate: [authGuard],
    loadComponent: () =>
      import('./shared/components/layout/admin-layout').then(
        (m) => m.AdminLayoutComponent
      ),
    children: [
      {
        path: 'usuarios',
        canActivate: [rolGuard(['ADMIN'])],
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
