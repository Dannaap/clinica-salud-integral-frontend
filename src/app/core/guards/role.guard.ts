import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Rol } from '../models/usuario.model';

export const roleGuard: CanActivateFn = (route) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const rolUsuario = authService.obtenerRol() as Rol | null;
  if (!rolUsuario) {
    return router.createUrlTree(['/login']);
  }

  const rolesPermitidos = route.data?.['roles'] as Rol[] | undefined;
  if (!rolesPermitidos || rolesPermitidos.includes(rolUsuario)) {
    return true;
  }

  // Si no tiene el rol permitido, redirigir a su dashboard correspondiente
  return router.createUrlTree([authService.obtenerRutaDashboard()]);
};
