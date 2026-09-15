// ═══════════════════════════════════════════════════════════
// MODELO: Usuario
// Clínica Salud Integral S.A.C.
// ═══════════════════════════════════════════════════════════

export type Rol = 'ADMIN' | 'RECEPCION' | 'MEDICO';

export interface Usuario {
  id: number;
  nombre: string;
  apellidos: string;
  email: string;
  rol: Rol;
  activo: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  usuario: Usuario;
}

export interface SesionUsuario {
  usuario: Usuario;
  token: string;
  expira: Date;
}