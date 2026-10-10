import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';
import { SIN_TOAST_DE_ERROR } from '../utils/http-context';
import { obtenerMensajeError } from '../utils/http-error';

// Manejo global de errores del backend: muestra al usuario el `message` del
// ApiResponse (validaciones 400, conflictos 409, etc.) o un texto según el estado HTTP.
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  if (!req.url.startsWith(environment.apiUrl) || req.context.get(SIN_TOAST_DE_ERROR)) {
    return next(req);
  }

  const toast = inject(ToastService);
  const authService = inject(AuthService);
  const teniaSesion = authService.estaAutenticado();

  return next(req).pipe(
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse) {
        // Si authInterceptor cerró la sesión por este error, se avisa eso y no el 401/403
        const sesionCerrada = teniaSesion && !authService.estaAutenticado();
        toast.error(
          sesionCerrada
            ? 'Tu sesión ha expirado. Inicia sesión nuevamente.'
            : obtenerMensajeError(error)
        );
      }
      return throwError(() => error);
    })
  );
};
