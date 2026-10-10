import { HttpClient, HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, of, switchMap, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from '../services/auth.service';
import { sinToastDeError } from '../utils/http-context';

// Adjunta el JWT a las peticiones dirigidas al backend y cierra la sesión
// cuando el servidor deja de reconocerla.
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const apiUrl = environment.apiUrl;
  const esBackend = req.url.startsWith(apiUrl);
  const esLogin = req.url.startsWith(`${apiUrl}/auth/`);

  if (!esBackend || esLogin) {
    return next(req);
  }

  const authService = inject(AuthService);
  const router = inject(Router);
  const http = inject(HttpClient);

  const token = authService.obtenerToken();
  const peticion =
    token && !req.headers.has('Authorization')
      ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
      : req;

  const cerrarSesion = () => {
    authService.logout();
    router.navigate(['/login']);
  };

  return next(peticion).pipe(
    catchError((error: unknown) => {
      if (!(error instanceof HttpErrorResponse) || !authService.estaAutenticado()) {
        return throwError(() => error);
      }

      if (error.status === 401) {
        cerrarSesion();
        return throwError(() => error);
      }

      if (error.status === 403) {
        // El backend responde 403 tanto si el token ya no sirve como si el rol no
        // tiene permiso sobre el recurso. Solo el primer caso debe cerrar la sesión.
        const esCuenta = req.url === `${apiUrl}/cuenta`;
        if (esCuenta || !authService.tokenVigente()) {
          cerrarSesion();
          return throwError(() => error);
        }

        // /cuenta solo exige estar autenticado: si también falla, la sesión es inválida
        // (y esa misma petición, al pasar por este interceptor, la cierra).
        const context = sinToastDeError();
        return http.get(`${apiUrl}/cuenta`, { context }).pipe(
          catchError(() => of(null)),
          switchMap(() => throwError(() => error))
        );
      }

      return throwError(() => error);
    })
  );
};
