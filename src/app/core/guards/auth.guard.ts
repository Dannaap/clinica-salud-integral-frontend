import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Rol } from '../models/usuario.model';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.estaAutenticado()) {
    return true;
  }

  return router.parseUrl('/login');
};

export const rolGuard = (rolesPermitidos: Rol[]): CanActivateFn => {
  return () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (!authService.estaAutenticado()) {
      return router.parseUrl('/login');
    }

    const rol = authService.obtenerRol() as Rol | null;
    if (rol && rolesPermitidos.includes(rol)) {
      return true;
    }

    return router.parseUrl(authService.obtenerRutaDashboard());
  };
};
