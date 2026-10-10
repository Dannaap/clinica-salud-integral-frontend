export type Rol = 'ADMIN' | 'RECEPCION' | 'MEDICO';

export interface Usuario {
  id: number;
  dni?: string;
  nombre: string;
  apellidos: string;
  email: string;
  rol: Rol;
  activo: boolean;
  cargo?: string;
  especialidad?: string;
  ultimoAcceso?: string;
  iniciales?: string;
}

export interface UsuarioStats {
  totalUsuarios: number;
  administradores: number;
  recepcion: number;
  medicos: number;
  especialidades: number;
}


export interface LoginRequest {
  email: string;
  password: string;
}

// Respuesta de POST /auth/login (pe.saludintegral.clinica.auth.AuthResponse)
export interface AuthResponse {
  token: string;
  tipo: string;
  email: string;
  rol: Rol;
}

// Usuario tal como lo expone el backend (pe.saludintegral.clinica.usuarios.UsuarioDTO)
export interface UsuarioDTO {
  id: number;
  dni: string;
  nombres: string;
  apellidos: string;
  email: string;
  rol: Rol;
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