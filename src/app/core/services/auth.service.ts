import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, of, switchMap, tap, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import {
  AuthResponse,
  LoginRequest,
  LoginResponse,
  Rol,
  SesionUsuario,
  Usuario,
  UsuarioDTO,
} from '../models/usuario.model';
import { obtenerMensajeError } from '../utils/http-error';

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
  RECEPCION: '/dashboard/recepcion',
  MEDICO: '/dashboard/medico',
};

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

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

  constructor() {
    this.cargarSesion();
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http
      .post<ApiResponse<AuthResponse>>(`${this.apiUrl}/auth/login`, credentials)
      .pipe(
        map((respuesta) => respuesta.data),
        // El login solo devuelve token, email y rol: el resto del perfil sale de /cuenta
        switchMap((auth) =>
          this.obtenerPerfil(auth).pipe(map((usuario) => ({ token: auth.token, usuario })))
        ),
        tap((response) => this.guardarSesion(response)),
        catchError((error) => throwError(() => new Error(obtenerMensajeError(error))))
      );
  }

  logout(): void {
    localStorage.removeItem('sesion');
    this.sesionActual.set(null);
  }

  // Indica si el JWT de la sesión sigue dentro de su tiempo de vida
  tokenVigente(): boolean {
    const sesion = this.sesionActual();
    return !!sesion && new Date(sesion.expira) > new Date();
  }

  private obtenerPerfil(auth: AuthResponse): Observable<Usuario> {
    const headers = { Authorization: `Bearer ${auth.token}` };

    return this.http.get<ApiResponse<UsuarioDTO>>(`${this.apiUrl}/cuenta`, { headers }).pipe(
      map(({ data }) => ({
        id: data.id,
        dni: data.dni,
        nombre: data.nombres,
        apellidos: data.apellidos,
        email: data.email,
        rol: data.rol,
        activo: true,
      })),
      switchMap((usuario) =>
        usuario.rol === 'MEDICO'
          ? this.obtenerEspecialidad(usuario.id, headers).pipe(
              map((especialidad) => ({ ...usuario, especialidad }))
            )
          : of(usuario)
      )
    );
  }

  // La especialidad del médico vive en su perfil médico, no en la cuenta de usuario
  private obtenerEspecialidad(
    usuarioId: number,
    headers: Record<string, string>
  ): Observable<string | undefined> {
    return this.http
      .get<ApiResponse<Array<{ usuarioId: number; especialidad: string }>>>(
        `${this.apiUrl}/medicos`,
        { headers }
      )
      .pipe(
        map(({ data }) => data.find((m) => m.usuarioId === usuarioId)?.especialidad),
        catchError(() => of(undefined))
      );
  }

  private guardarSesion(response: LoginResponse): void {
    const sesion: SesionUsuario = {
      usuario: response.usuario,
      token: response.token,
      expira: this.obtenerExpiracion(response.token) ?? new Date(Date.now() + 24 * 60 * 60 * 1000),
    };
    localStorage.setItem('sesion', JSON.stringify(sesion));
    this.sesionActual.set(sesion);
  }

  cargarSesion(): void {
    const sesionGuardada = localStorage.getItem('sesion');
    if (sesionGuardada) {
      try {
        const sesion: SesionUsuario = JSON.parse(sesionGuardada);
        // Se descartan las sesiones vencidas y las que no tienen un JWT real
        const expira = this.obtenerExpiracion(sesion.token);
        if (expira && expira > new Date()) {
          this.sesionActual.set({ ...sesion, expira });
        } else {
          localStorage.removeItem('sesion');
        }
      } catch {
        localStorage.removeItem('sesion');
      }
    }
  }

  // Lee la fecha de expiración (claim `exp`) del payload del JWT
  private obtenerExpiracion(token: string): Date | null {
    try {
      const payload = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
      const { exp } = JSON.parse(atob(payload));
      return typeof exp === 'number' ? new Date(exp * 1000) : null;
    } catch {
      return null;
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