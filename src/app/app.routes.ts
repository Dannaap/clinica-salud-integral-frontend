import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { dashboardRedirectGuard } from './core/guards/dashboard-redirect.guard';
import { guestGuard } from './core/guards/guest.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./features/auth/login/login').then((m) => m.Login),
  },
  {
    path: 'dashboard',
    canActivate: [authGuard, dashboardRedirectGuard],
    pathMatch: 'full',
    children: [],
  },
  {
    path: 'pacientes',
    // Según H.U.2: Solo ADMIN y RECEPCION gestionan pacientes; MÉDICO no tiene acceso
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ADMIN', 'RECEPCION'] },
    loadChildren: () =>
      import('./features/pacientes/pacientes.routes').then((m) => m.pacientesRoutes),
  },
  {
    path: 'dashboard/admin',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ADMIN'] },
    loadComponent: () =>
      import('./features/dashboard/admin/admin').then((m) => m.AdminComponent),
  },
  {
    path: 'dashboard/recepcion',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['RECEPCION'] },
    loadComponent: () =>
      import('./features/dashboard/reception/reception').then((m) => m.ReceptionComponent),
  },
  {
    path: 'dashboard/medico',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['MEDICO'] },
    loadComponent: () =>
      import('./features/dashboard/medical/medical').then((m) => m.MedicalComponent),
  },
  // Rutas bajo el layout de administración para el módulo de usuarios
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
        canActivate: [roleGuard],
        data: { roles: ['ADMIN'] },
        loadComponent: () =>
          import('./features/usuarios/listado/usuarios-listado').then(
            (m) => m.UsuariosListadoComponent
          ),
      },
      { path: 'citas', redirectTo: 'dashboard' },
      { path: 'turnos', redirectTo: 'dashboard' },
      { path: 'atenciones', redirectTo: 'dashboard' },
      { path: 'reportes', redirectTo: 'dashboard' },
      { path: 'perfil', redirectTo: 'dashboard' },
    ],
  },
  // Alias legacy (por si alguien tiene la URL vieja en el navegador)
  { path: 'dashboard/reception', redirectTo: 'dashboard/recepcion', pathMatch: 'full' },
  { path: 'dashboard/medical', redirectTo: 'dashboard/medico', pathMatch: 'full' },
  { path: '**', redirectTo: 'login' },
];