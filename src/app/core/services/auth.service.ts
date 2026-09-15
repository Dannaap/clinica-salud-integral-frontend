// ═══════════════════════════════════════════════════════════
// SERVICIO: Autenticación (fake por ahora)
// Clínica Salud Integral S.A.C.
// ═══════════════════════════════════════════════════════════

import { Injectable, signal } from '@angular/core';
import { Observable, of, throwError, delay } from 'rxjs';
import {
  LoginRequest,
  LoginResponse,
  SesionUsuario,
  Usuario,
} from '../models/usuario.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  // ─── Usuarios fake para probar mientras no hay backend ────
  private readonly USUARIOS_FAKE: Array<Usuario & { password: string }> = [
    {
      id: 1,
      nombre: 'Juan',
      apellidos: 'Pérez',
      email: 'admin@clinica.com',
      rol: 'ADMIN',
      activo: true,
      password: '123456',
    },
    {
      id: 2,
      nombre: 'Lucía',
      apellidos: 'Fernández',
      email: 'recepcion@clinica.com',
      rol: 'RECEPCION',
      activo: true,
      password: '123456',
    },
    {
      id: 3,
      nombre: 'Axel',
      apellidos: 'Rojas',
      email: 'medico@clinica.com',
      rol: 'MEDICO',
      activo: true,
      password: '123456',
    },
  ];

  // ─── Estado de sesión (signal) ────────────────────────────
  private sesionActual = signal<SesionUsuario | null>(null);
  public sesion = this.sesionActual.asReadonly();

  // ─── Login ────────────────────────────────────────────────
  login(credentials: LoginRequest): Observable<LoginResponse> {
    const usuario = this.USUARIOS_FAKE.find(
      (u) => u.email === credentials.email && u.password === credentials.password
    );

    if (!usuario) {
      return throwError(() => new Error('Usuario o contraseña incorrectos')).pipe(
        delay(800)
      );
    }

    // Crear token fake
    const token = `fake-jwt-token-${usuario.id}-${Date.now()}`;

    // Quitar el password del usuario antes de devolverlo
    const { password, ...usuarioSinPassword } = usuario;

    const response: LoginResponse = {
      token,
      usuario: usuarioSinPassword as Usuario,
    };

    // Guardar sesión
    this.guardarSesion(response);

    // Simular delay de red
    return of(response).pipe(delay(800));
  }

  // ─── Logout ───────────────────────────────────────────────
  logout(): void {
    localStorage.removeItem('sesion');
    this.sesionActual.set(null);
  }

  // ─── Guardar sesión ───────────────────────────────────────
  private guardarSesion(response: LoginResponse): void {
    const sesion: SesionUsuario = {
      usuario: response.usuario,
      token: response.token,
      expira: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 horas
    };

    localStorage.setItem('sesion', JSON.stringify(sesion));
    this.sesionActual.set(sesion);
  }

  // ─── Cargar sesión al iniciar la app ──────────────────────
  cargarSesion(): void {
    const sesionGuardada = localStorage.getItem('sesion');
    if (sesionGuardada) {
      try {
        const sesion: SesionUsuario = JSON.parse(sesionGuardada);
        if (new Date(sesion.expira) > new Date()) {
          this.sesionActual.set(sesion);
        } else {
          localStorage.removeItem('sesion');
        }
      } catch {
        localStorage.removeItem('sesion');
      }
    }
  }

  // ─── Helpers ──────────────────────────────────────────────
  estaAutenticado(): boolean {
    return this.sesionActual() !== null;
  }

  obtenerToken(): string | null {
    return this.sesionActual()?.token ?? null;
  }

  obtenerUsuario(): Usuario | null {
    return this.sesionActual()?.usuario ?? null;
  }

  obtenerRol(): string | null {
    return this.sesionActual()?.usuario.rol ?? null;
  }
}