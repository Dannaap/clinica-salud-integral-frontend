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

  // Redirección de /dashboard al dashboard del rol
  {
    path: 'dashboard',
    canActivate: [authGuard, dashboardRedirectGuard],
    children: [],
  },

  // 🔑 UN SOLO LAYOUT para todo lo autenticado
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./shared/components/layout/admin-layout').then(
        (m) => m.AdminLayoutComponent
      ),
    children: [
      {
        path: 'dashboard/admin',
        canActivate: [roleGuard],
        data: {
          roles: ['ADMIN'],
          header: {
            titulo: 'Inicio',
            subtitulo: 'Resumen general del día',
            placeholder: 'Buscar paciente por DNI, nombre o cita...',
          },
        },
        loadComponent: () =>
          import('./features/dashboard/admin/admin').then(
            (m) => m.AdminComponent
          ),
      },
      {
        path: 'dashboard/recepcion',
        canActivate: [roleGuard],
        data: {
          roles: ['RECEPCION'],
          header: {
            titulo: 'Inicio',
            subtitulo: 'Resumen general del día',
            placeholder: 'Buscar paciente por DNI, nombre o cita...',
          },
        },
        loadComponent: () =>
          import('./features/dashboard/reception/reception').then(
            (m) => m.ReceptionComponent
          ),
      },
      {
        path: 'dashboard/medico',
        canActivate: [roleGuard],
        data: {
          roles: ['MEDICO'],
          header: {
            titulo: 'Inicio',
            subtitulo: 'Resumen general del día',
            placeholder: 'Buscar paciente por DNI, nombre o cita...',
          },
        },
        loadComponent: () =>
          import('./features/dashboard/medical/medical').then(
            (m) => m.MedicalComponent
          ),
      },
      {
        path: 'citas',
        canActivate: [roleGuard],
        data: {
          roles: ['MEDICO', 'ADMIN'],
          header: {
            titulo: 'Citas Médicas',
            subtitulo: 'Agenda de consultas y gestión de pacientes',
            placeholder: 'Buscar por paciente, DNI o historia clínica...',
          },
        },
        loadComponent: () =>
          import('./features/citas/medico-citas/medico-citas').then(
            (m) => m.MedicoCitasComponent
          ),
      },
      {
        path: 'pacientes',
        canActivate: [roleGuard],
        data: {
          roles: ['ADMIN', 'RECEPCION'],
          header: {
            titulo: 'Pacientes',
            subtitulo: 'Listado y búsqueda de pacientes',
            placeholder: 'Buscar paciente por DNI, nombre...',
          },
        },
        loadChildren: () =>
          import('./features/pacientes/pacientes.routes').then(
            (m) => m.pacientesRoutes
          ),
      },
      {
        path: 'usuarios',
        canActivate: [roleGuard],
        data: {
          roles: ['ADMIN'],
          header: {
            titulo: 'Usuarios',
            subtitulo: 'Gestión de cuentas del personal',
            placeholder: 'Buscar usuario por nombre o correo...',
          },
        },
        loadComponent: () =>
          import('./features/usuarios/listado/usuarios-listado').then(
            (m) => m.UsuariosListadoComponent
          ),
      },
      {
        path: 'turnos',
        canActivate: [roleGuard],
        data: {
          roles: ['ADMIN'],
          header: {
            titulo: 'Turnos médicos',
            subtitulo: 'Horarios de atención del personal médico',
            placeholder: 'Buscar turno por médico, especialidad o consultorio...',
          },
        },
        loadComponent: () =>
          import('./features/turnos/listado/turnos-listado').then(
            (m) => m.TurnosListadoComponent
          ),
      },
      {
        path: 'atenciones',
        canActivate: [roleGuard],
        data: {
          roles: ['ADMIN', 'MEDICO'],
          header: {
            titulo: 'Atenciones',
            subtitulo: 'Historial de consultas médicas',
            placeholder: 'Buscar atención...',
          },
        },
        loadComponent: () =>
          import('./features/atenciones/atenciones').then(
            (m) => m.AtencionesComponent
          ),
      },
      {
        path: 'reportes',
        canActivate: [roleGuard],
        data: {
          roles: ['ADMIN'],
          header: {
            titulo: 'Reportes',
            subtitulo: 'Reportes operativos de la clínica',
            placeholder: 'Buscar reporte...',
          },
        },
        loadComponent: () =>
          import('./features/reportes/reportes').then(
            (m) => m.ReportesComponent
          ),
      },
      {
        path: 'perfil',
        canActivate: [authGuard],
        data: {
          header: {
            titulo: 'Perfil',
            subtitulo: 'Información de tu cuenta',
            placeholder: 'Buscar...',
          },
        },
        loadComponent: () =>
          import('./features/perfil/perfil').then((m) => m.PerfilComponent),
      },
    ],
  },

  // Alias legacy
  { path: 'dashboard/reception', redirectTo: 'dashboard/recepcion', pathMatch: 'full' },
  { path: 'dashboard/medical', redirectTo: 'dashboard/medico', pathMatch: 'full' },
  { path: '**', redirectTo: 'login' },
];