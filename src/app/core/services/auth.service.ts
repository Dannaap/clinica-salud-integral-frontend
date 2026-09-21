import { Injectable, computed, signal } from '@angular/core';
import { Observable, of, throwError, delay } from 'rxjs';
import {
  LoginRequest,
  LoginResponse,
  Rol,
  SesionUsuario,
  Usuario,
} from '../models/usuario.model';

export interface UsuarioSesionInfo {
  nombreCompleto: string;
  iniciales: string;
  rolLabel: string;
  especialidad?: string;
  esAdmin: boolean;
  esRecepcion: boolean;
  esMedico: boolean;
}

const ETIQUETAS_ROL: Record<Rol, string> = {
  ADMIN: 'Administrador',
  RECEPCION: 'Recepción',
  MEDICO: 'Médico',
};

const RUTAS_DASHBOARD_POR_ROL: Record<Rol, string> = {
  ADMIN: '/dashboard/admin',
  RECEPCION: '/dashboard/reception',
  MEDICO: '/dashboard/medical',
};

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly USUARIOS_FAKE: Array<Usuario & { password: string }> = [
    { id: 1, nombre: 'Juan', apellidos: 'Pérez', email: 'admin@clinica.com', rol: 'ADMIN', activo: true, password: 'Admin@123' },
    { id: 2, nombre: 'Lucía', apellidos: 'Fernández', email: 'recepcion@clinica.com', rol: 'RECEPCION', activo: true, password: 'Recepcion@123' },
    { id: 3, nombre: 'Axel', apellidos: 'Rojas', email: 'medico@clinica.com', rol: 'MEDICO', activo: true, especialidad: 'Cardiólogo', password: 'Medico@123' },
  ];

  private sesionActual = signal<SesionUsuario | null>(null);
  public sesion = this.sesionActual.asReadonly();

  public readonly usuarioActual = computed<UsuarioSesionInfo | null>(() => {
    const usuario = this.sesionActual()?.usuario;
    if (!usuario) {
      return null;
    }

    return {
      nombreCompleto: `${usuario.nombre} ${usuario.apellidos}`,
      iniciales: `${usuario.nombre.charAt(0)}${usuario.apellidos.charAt(0)}`.toUpperCase(),
      rolLabel: ETIQUETAS_ROL[usuario.rol] ?? usuario.rol,
      especialidad: usuario.especialidad,
      esAdmin: usuario.rol === 'ADMIN',
      esRecepcion: usuario.rol === 'RECEPCION',
      esMedico: usuario.rol === 'MEDICO',
    };
  });

  login(credentials: LoginRequest): Observable<LoginResponse> {
    const usuario = this.USUARIOS_FAKE.find(
      (u) => u.email === credentials.email && u.password === credentials.password
    );

    if (!usuario) {
      return throwError(() => new Error('Usuario o contraseña incorrectos')).pipe(delay(800));
    }

    const token = `fake-jwt-token-${usuario.id}-${Date.now()}`;
    const { password, ...usuarioSinPassword } = usuario;

    const response: LoginResponse = { token, usuario: usuarioSinPassword as Usuario };
    this.guardarSesion(response);

    return of(response).pipe(delay(800));
  }

  logout(): void {
    localStorage.removeItem('sesion');
    this.sesionActual.set(null);
  }

  private guardarSesion(response: LoginResponse): void {
    const sesion: SesionUsuario = {
      usuario: response.usuario,
      token: response.token,
      expira: new Date(Date.now() + 24 * 60 * 60 * 1000),
    };
    localStorage.setItem('sesion', JSON.stringify(sesion));
    this.sesionActual.set(sesion);
  }

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

  estaAutenticado(): boolean { return this.sesionActual() !== null; }
  obtenerToken(): string | null { return this.sesionActual()?.token ?? null; }
  obtenerUsuario(): Usuario | null { return this.sesionActual()?.usuario ?? null; }
  obtenerRol(): string | null { return this.sesionActual()?.usuario.rol ?? null; }

  obtenerRutaDashboard(): string {
    const rol = this.obtenerRol() as Rol | null;
    return (rol && RUTAS_DASHBOARD_POR_ROL[rol]) || '/login';
  }
}